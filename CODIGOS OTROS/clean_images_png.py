"""Limpieza integral de fondos y artefactos para imágenes PNG de WHA MOUNTAIN.

Convierte fondos blancos, grises, negros, bordes de captura de pantalla,
marcas de agua (Photoroom / Google Lens / paginación) y fondos de estudio o
escena en PNG RGBA limpios con canal alfa suavizado y descontaminación de
halos para renderizado impecable sobre fondo oscuro (Noche Alpina).
"""

from __future__ import annotations

import argparse
import base64
from pathlib import Path
import sys
from typing import Final
import zlib

import cv2
import numpy as np
from numpy.typing import NDArray
from PIL import Image

BASE_DIR: Final[Path] = Path(__file__).resolve().parent.parent
DEFAULT_IMAGES_DIR: Final[Path] = BASE_DIR / "PAGINA WEB" / "public" / "images"

# Plantilla exacta 33x33 en escala de grises del ícono '[R]' de Photoroom
_PHOTOROOM_TPL_B64: Final[str] = (
    "eNpllDtsFEcYx8d3t7t3u7e7t4/ZnX3fnc/YPjtnB6yg0OAUCVEwShmQaBBSBCQII2wLUFJR4IBo"
    "UAwFL5+RUB5HihTpoEGRKEJFScWrQAFEqCzf7X18s4YI4W+1r5mf/vOfme8bauqKWJBc1/Z8DMaY"
    "Sym1qeM4Lt6UOpYmi4KAbz8IgzAKfZYBlCM87HXAiZK4WqvWanHgoQjDByIuBrUqiihKJVnIS8WS"
    "JOZz+YFcLpcXFORclzHH0svFAtm2cP5au91eWVnm0V5eOr5DpZ7nh75r65pELsDG6EQsSpLIoaZJ"
    "zkGvuyGgYyVRNWGOLY31+ylAuvYuen3AqwczVhzH6IMchDXsf08d+T504QelGsdolRzGnxQenflp"
    "cXHx9OLps3c53u/CkhT6vuu45Hvo9mH1EyIJhdxAjpDc1y+Q6MLVAc9hb4EU/nXKFrWMSlko1aLd"
    "Pa7wi8ZsvliZQgqXp2d2zXy147PpqYnpoZvAp1Efwc2gjANo6v94vWeyNQtpF27WP27gtrB1D+/N"
    "4lRzch8HOvWp1iASmUIKz6+3V9rLV679ev7Trc0zuHTwx+BUa4wD33GF3nZSlosCERtDW6c2P8iG"
    "qG1pjaELBNZSeGyabkVX8/bER8ObbkAPMmBinFqUHOLAk9CwGuPDydj2zw/c567RQ7JlvGka1jrw"
    "NHG1P9OX/716BfDPnUyhE7Wao4Zh8r1AhYSqt/kc7u3dWR+5y03+Fk2MDld04y3gUuEv/EjhlDlZ"
    "/Yab/D1sDQ/pmsYBXIcvyPgzvkkAP3v2Ra5ww20ONTRV4x74OnQeZv39Pvx9C7jJS2ykMagoKtn/"
    "Lh+yfp4NnOrCj3SkXpXLykC8iqZx0JS3Z8mEOYVmvmSNmlsuyzI5CbD2QUai5lWrFjsVTcViICdW"
    "NyR1ukR9ZhhUVWVRLJB43+z8wvzc3NwxvOfnjx75dpSoum4yX1HloihIhBC5pEiiKGCZFUslqaBQ"
    "G/ONBaahqiUBG7UwiOMw8L0giLBQkzDAD9/zqa3riiRJhSJ1TeY5jucxP+S9YchxDyurohYlPCIc"
    "rGjmYWHjMcBPAn4YxFHwBoIv6EE="
)
PHOTOROOM_ICON_TPL: Final[NDArray[np.uint8]] = np.frombuffer(
    zlib.decompress(base64.b64decode(_PHOTOROOM_TPL_B64)), dtype=np.uint8
).reshape((33, 33))

# Imágenes que NO deben recortarse (QR escaneable y fotos macro de detalle)
PRESERVE_OPAQUE_FILES: Final[set[str]] = {
    "qr-celular.png",
    "cas-04-3.png",
    "cas-09-3.png",
    "cas-32-3.png",
    "cas-39-3.png",
    "cas-41-3.png",
    "ch-03-2.png",
}

# Imágenes de portada o macro donde solo se limpia marca de agua Photoroom
WATERMARK_ONLY_FILES: Final[set[str]] = {
    "hero-cover.png",
    "cas-35-3.png",
}

# Imágenes con múltiples elementos desconectados válidos (letras de logo, collages)
MULTI_COMPONENT_FILES: Final[set[str]] = {
    "logo-wha-mountain.png",
    "logo-wha-cropped.png",
    "banner-reflectivo.png",
    "banner-termico.png",
    "cat-chalecos.png",
    "m-06.png",
    "cas-37.png",
    "cas-56.png",
    "cas-60.png",
}

# Escenas complejas que requieren GrabCut
GRABCUT_FILES: Final[set[str]] = {
    "cat-mamelucos.png",
    "cat-pantalones.png",
}


def trim_screenshot_and_frames(
    rgb: NDArray[np.uint8],
    *,
    clean_cobalt_frame: bool = False,
) -> NDArray[np.uint8]:
    """Recorta barras negras de captura de pantalla, marcos oscuros y marco azul CAS-37."""
    h, w = rgb.shape[:2]
    gray = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY)

    # 1. Capturas móviles verticales con franjas oscuras/UI arriba y abajo (cas-19, m-05)
    if h > w * 1.45:
        row_black = np.mean(gray < 35, axis=1)
        row_white = np.mean(gray > 230, axis=1)
        # Detectar bloque central de foto delimitado por barras negras
        if np.mean(row_black[: int(h * 0.14)] > 0.65) > 0.4 or np.mean(
            row_black[int(h * 0.86) :] > 0.65
        ) > 0.4:
            # Buscar transición de barra oscura superior hacia zona foto blanca
            top_cut = 0
            for y in range(int(h * 0.30)):
                if row_black[y] > 0.50:
                    top_cut = y + 1
            # Avanzar hasta encontrar el borde blanco limpio de la foto
            while top_cut < int(h * 0.30) and row_white[top_cut] < 0.75:
                top_cut += 1

            bot_cut = h
            for y in range(h - 1, int(h * 0.70), -1):
                if row_black[y] > 0.50:
                    bot_cut = y
            # Retroceder hasta encontrar el borde blanco limpio inferior de la foto
            while bot_cut > int(h * 0.70) and row_white[bot_cut - 1] < 0.75:
                bot_cut -= 1

            if bot_cut - top_cut > int(h * 0.35):
                rgb = rgb[top_cut:bot_cut, :]
                h, w = rgb.shape[:2]
                gray = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY)

    # 2. Marco azul marino con título ("C A S A C A" en cas-37) o bordes oscuros/negros finos
    r, g, b = rgb[:, :, 0].astype(np.int16), rgb[:, :, 1].astype(np.int16), rgb[:, :, 2].astype(np.int16)
    is_dark_border = (gray < 48)
    is_navy_frame = (b - r > 45) & (b - g > 25) & (gray < 140)
    is_frame_px = is_dark_border | is_navy_frame

    max_y_trim = min(int(h * 0.16), 110)
    max_x_trim = min(int(w * 0.16), 110)

    top = 0
    while top < max_y_trim:
        row_frac = float(np.mean(is_frame_px[top, :]))
        row_std = float(np.std(gray[top, :]))
        if row_frac >= 0.68 or (row_frac >= 0.45 and row_std < 28):
            top += 1
        else:
            break

    bottom = h
    while h - bottom < max_y_trim and bottom > top + 40:
        row_frac = float(np.mean(is_frame_px[bottom - 1, :]))
        row_std = float(np.std(gray[bottom - 1, :]))
        if row_frac >= 0.68 or (row_frac >= 0.45 and row_std < 28):
            bottom -= 1
        else:
            break

    left = 0
    while left < max_x_trim and left < w - 40:
        col_frac = float(np.mean(is_frame_px[top:bottom, left]))
        if col_frac >= 0.68:
            left += 1
        else:
            break

    right = w
    while w - right < max_x_trim and right > left + 40:
        col_frac = float(np.mean(is_frame_px[top:bottom, right - 1]))
        if col_frac >= 0.68:
            right -= 1
        else:
            break

    # Seguridad: si la fila adyacente ya es blanca/gris uniforme, recorta 2 px extra de anti-alias del borde
    if top > 0 and top + 2 < bottom:
        top += 2
    if bottom < h and bottom - 2 > top:
        bottom -= 2
    if left > 0 and left + 2 < right:
        left += 2
    if right < w and right - 2 > left:
        right -= 2

    trimmed = rgb[top:bottom, left:right].copy()

    # Limpieza específica ONLY para cas-37 (barra derecha y contorno 1px azul cobalto)
    if clean_cobalt_frame:
        th, tw = trimmed.shape[:2]
        tr = trimmed[:, :, 0].astype(np.int16)
        tg = trimmed[:, :, 1].astype(np.int16)
        tb = trimmed[:, :, 2].astype(np.int16)
        cobalt = (tb - tr > 28) & (tb > 100) & (tb - tg > 14)
        if np.any(cobalt):
            num_c, c_lbl, c_stats, _ = cv2.connectedComponentsWithStats(
                cobalt.astype(np.uint8), connectivity=8
            )
            rim = 20
            border_c = (
                set(np.unique(c_lbl[:rim, :]))
                | set(np.unique(c_lbl[-rim:, :]))
                | set(np.unique(c_lbl[:, :rim]))
                | set(np.unique(c_lbl[:, -rim:]))
            )
            border_c.discard(0)
            keep_frame_ids = [
                cid
                for cid in border_c
                if int(c_stats[cid, cv2.CC_STAT_WIDTH]) > int(tw * 0.25)
                or int(c_stats[cid, cv2.CC_STAT_HEIGHT]) > int(th * 0.25)
            ]
            if keep_frame_ids:
                cobalt_frame = np.isin(c_lbl, keep_frame_ids)
                cobalt_frame = (
                    cv2.dilate(cobalt_frame.astype(np.uint8), np.ones((3, 3), np.uint8)) > 0
                )
                trimmed[cobalt_frame] = 255

    return trimmed


def _detect_photoroom_icon(rgb: NDArray[np.uint8]) -> tuple[int, int, int, int] | None:
    """Detecta la posición exacta (x, y, w, h) del ícono '[R]' Photoroom mediante template matching."""
    h, w = rgb.shape[:2]
    if h < 120 or w < 120:
        return None
    roi_y = int(h * 0.72)
    roi_x = int(w * 0.48)
    gray = cv2.cvtColor(rgb[roi_y:, roi_x:], cv2.COLOR_RGB2GRAY)

    best_score = -1.0
    best_loc: tuple[int, int, int, int] | None = None
    for sc in (0.50, 0.60, 0.70, 0.80, 0.90, 1.00, 1.15, 1.35, 1.60, 1.90, 2.20):
        tw = max(12, int(round(PHOTOROOM_ICON_TPL.shape[1] * sc)))
        th = max(12, int(round(PHOTOROOM_ICON_TPL.shape[0] * sc)))
        if tw >= gray.shape[1] or th >= gray.shape[0]:
            continue
        tpl_rs = cv2.resize(PHOTOROOM_ICON_TPL, (tw, th), interpolation=cv2.INTER_AREA)
        res = cv2.matchTemplate(gray, tpl_rs, cv2.TM_CCOEFF_NORMED)
        _, max_val, _, max_pt = cv2.minMaxLoc(res)
        if max_val > best_score:
            best_score = max_val
            best_loc = (roi_x + int(max_pt[0]), roi_y + int(max_pt[1]), tw, th)

    if best_score >= 0.76 and best_loc is not None:
        return best_loc
    return None


def inpaint_photoroom_overlay(rgba: NDArray[np.uint8]) -> tuple[NDArray[np.uint8], bool]:
    """Detecta con precisión el badge '[R] Photoroom' e inpaint/elimina sin dañar bordes ni mangas."""
    h, w = rgba.shape[:2]
    loc = _detect_photoroom_icon(rgba[:, :, :3])
    if loc is None:
        return rgba, False

    rx, ry, tw, th = loc
    out = rgba.copy()

    # Verificar si el texto "Photoroom" aparece a la derecha del cuadrado [R] (cas-27 solo tiene [R])
    ext_x0 = min(w, rx + int(tw * 0.95))
    ext_x1 = min(w, rx + int(tw * 6.2))
    ext_y0 = max(0, ry - int(th * 0.10))
    ext_y1 = min(h, ry + int(th * 1.10))
    has_wordmark = False
    if ext_x1 > ext_x0 + 8 and ext_y1 > ext_y0 + 6:
        word_roi = out[ext_y0:ext_y1, ext_x0:ext_x1]
        wr, wg, wb, wa = (
            word_roi[:, :, 0].astype(np.int16),
            word_roi[:, :, 1].astype(np.int16),
            word_roi[:, :, 2].astype(np.int16),
            word_roi[:, :, 3],
        )
        white_letters = (wr > 195) & (wg > 195) & (wb > 195) & (wa > 100)
        trans_pill = (wa >= 45) & (wa <= 215)
        has_wordmark = (int(np.sum(white_letters)) >= max(18, tw)) or (
            int(np.sum(trans_pill)) >= tw * th
        )

    px0 = max(0, rx - int(round(tw * 0.35)))
    px1 = min(w, rx + int(round(tw * (6.6 if has_wordmark else 1.25))))
    py0 = max(0, ry - int(round(th * 0.25)))
    py1 = min(h, ry + int(round(th * 1.25)))

    sub = out[py0:py1, px0:px1]
    sa = sub[:, :, 3]
    sr = sub[:, :, 0].astype(np.int16)
    sg = sub[:, :, 1].astype(np.int16)
    sb = sub[:, :, 2].astype(np.int16)

    has_trans_canvas = float(np.mean(sa < 225)) > 0.10 or float(np.mean(rgba[:, :, 3] < 12)) > 0.12
    if has_trans_canvas:
        # 1) Borrar por completo el cuadrado '[R]' cuando sobresale en el borde transparente (cas-27, cas-62)
        in_rx0, in_rx1 = max(0, rx - px0), min(sub.shape[1], rx + tw - px0)
        in_ry0, in_ry1 = max(0, ry - py0), min(sub.shape[0], ry + th - py0)
        r_patch = sub[in_ry0:in_ry1, in_rx0:in_rx1]
        if r_patch.size and float(np.mean(r_patch[:, :, 3] < 25)) > 0.22:
            # Conservar únicamente tela cromática/sólida del lado izquierdo si toca el borde de la prenda
            rp_r = r_patch[:, :, 0].astype(np.int16)
            rp_g = r_patch[:, :, 1].astype(np.int16)
            rp_b = r_patch[:, :, 2].astype(np.int16)
            chroma_patch = np.maximum(np.abs(rp_r - rp_g), np.abs(rp_g - rp_b))
            neutral_rbox = chroma_patch <= 20
            r_patch[neutral_rbox | (r_patch[:, :, 3] < 238)] = 0
            sub[in_ry0:in_ry1, in_rx0:in_rx1] = r_patch

        # 2) Borrar píldora negra/gris/blanca semitransparente alrededor o fuera de la prenda
        neutral_pill = (np.abs(sr - sg) <= 20) & (np.abs(sg - sb) <= 20)
        semi_pill = (sa > 0) & (sa < 238)
        white_glyph = neutral_pill & (sr >= 150) & (sa >= 50)

        erase_mask = semi_pill & (white_glyph | ((sr <= 200) & neutral_pill))
        sub[erase_mask] = 0

        # Limpiar islas flotantes dentro de la caja que no conecten con la prenda fuera de la caja
        out[py0:py1, px0:px1] = sub
        fg_all = (out[:, :, 3] > 20).astype(np.uint8)
        _, fg_lbl = cv2.connectedComponents(fg_all, connectivity=8)
        box_mask = np.zeros((h, w), dtype=bool)
        box_mask[py0:py1, px0:px1] = True
        outside_labels = set(np.unique(fg_lbl[~box_mask]))
        outside_labels.discard(0)
        floating = box_mask & (fg_lbl > 0) & (~np.isin(fg_lbl, list(outside_labels)))
        if np.any(floating):
            out[floating] = 0
            sub = out[py0:py1, px0:px1]

        # 3) Compensar tinte oscuro de la cápsula y/o inpaint letras blancas y caja oscura '[R]' sobre la prenda
        sr = sub[:, :, 0].astype(np.int16)
        sg = sub[:, :, 1].astype(np.int16)
        sb = sub[:, :, 2].astype(np.int16)
        sa = sub[:, :, 3]
        neutral_sub = (np.abs(sr - sg) <= 20) & (np.abs(sg - sb) <= 20)
        glyph_on_fg = neutral_sub & (sr >= 145) & (sa >= 80)

        # Incluir también el recuadro oscuro '[R]' si quedó estampado sobre tela/mano más clara (ej. cas-52)
        in_rx0, in_rx1 = max(0, rx - px0), min(sub.shape[1], rx + tw - px0)
        in_ry0, in_ry1 = max(0, ry - py0), min(sub.shape[0], ry + th - py0)
        if py0 >= 12 and in_rx1 > in_rx0:
            above = out[max(0, py0 - 10) : py0 - 2, px0 + in_rx0 : px0 + in_rx1]
            if np.any(above[:, :, 3] >= 220):
                above_l = float(np.median(above[above[:, :, 3] >= 220][:, :3].mean(axis=1)))
                r_box = sub[in_ry0:in_ry1, in_rx0:in_rx1]
                r_box_l = r_box[:, :, :3].mean(axis=2)
                if above_l > 85.0:
                    dark_box = (r_box[:, :, 3] >= 120) & (r_box_l < above_l - 28.0)
                    glyph_on_fg[in_ry0:in_ry1, in_rx0:in_rx1] |= dark_box

        # Suavizar el tinte oscuro residual de la cápsula sobre la prenda comparando con la franja superior
        if py0 >= 12:
            above_strip = out[max(0, py0 - 10) : py0 - 2, px0:px1]
            fg_above = above_strip[:, :, 3] >= 220
            fg_here = (sa >= 210) & (~glyph_on_fg)
            if np.any(fg_above) and np.any(fg_here):
                l_above = float(np.median(above_strip[fg_above][:, :3].mean(axis=1)))
                l_here = float(np.median(sub[fg_here][:, :3].mean(axis=1)))
                if l_here > 12.0 and 1.12 < (l_above / l_here) <= 1.85:
                    gain = min(1.65, (l_above / l_here))
                    # Solo aclarar píxeles oscuros neutrales/teñidos por la píldora
                    luma_px = sub[:, :, :3].mean(axis=2)
                    tinted = fg_here & (luma_px < l_above - 8.0)
                    rgb_f = sub[:, :, :3].astype(np.float32)
                    rgb_f[tinted] = np.clip(rgb_f[tinted] * gain, 0, 255)
                    sub[:, :, :3] = rgb_f.astype(np.uint8)

        if np.any(glyph_on_fg):
            g_dil = cv2.dilate(glyph_on_fg.astype(np.uint8), np.ones((3, 3), np.uint8), iterations=1)
            rgb_patch = sub[:, :, :3].copy()
            valid_fg = (sa >= 200) & (~glyph_on_fg)
            if np.any(sa < 25) and np.any(valid_fg):
                rgb_patch[sa < 25] = rgb_patch[valid_fg].mean(axis=0).astype(np.uint8)
            inpainted = cv2.inpaint(rgb_patch, g_dil * 255, 4, cv2.INPAINT_TELEA)
            sub[:, :, :3][g_dil > 0] = inpainted[g_dil > 0]

        out[py0:py1, px0:px1] = sub
    else:
        # Fondo completamente opaco (hero-cover, cas-01-3, cas-35-3): inpaint exacto de la cápsula Photoroom
        sh, sw = sub.shape[:2]
        mask = np.zeros((sh, sw), dtype=np.uint8)
        # Rectángulo redondeado de la cápsula exactamente alrededor del match [R] (+ texto)
        r_pad = max(3, int(round(tw * 0.12)))
        mask[r_pad : sh - r_pad, r_pad : sw - r_pad] = 255
        k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
        mask = cv2.dilate(mask, k, iterations=1)
        sub[:, :, :3] = cv2.inpaint(sub[:, :, :3], mask, 4, cv2.INPAINT_TELEA)
        out[py0:py1, px0:px1] = sub

    return out, True


def fix_m07_carousel_pill(rgb: NDArray[np.uint8]) -> NDArray[np.uint8]:
    """Limpia la píldora gris '...' en m-07 restaurando el borde de la bota izquierda antes del recorte."""
    out = rgb.copy()
    h, w = out.shape[:2]
    y0, y1 = int(h * 0.87), h
    x0, x1 = int(w * 0.36), int(w * 0.64)
    roi = out[y0:y1, x0:x1]
    r = roi[:, :, 0].astype(np.int16)
    g = roi[:, :, 1].astype(np.int16)
    b = roi[:, :, 2].astype(np.int16)
    pill = (np.abs(r - g) <= 14) & (np.abs(g - b) <= 14) & (r >= 120) & (r <= 185)

    num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(pill.astype(np.uint8), connectivity=8)
    best_lbl = 0
    best_area = 0
    for lbl in range(1, num_labels):
        area = int(stats[lbl, cv2.CC_STAT_AREA])
        bw = int(stats[lbl, cv2.CC_STAT_WIDTH])
        bh = int(stats[lbl, cv2.CC_STAT_HEIGHT])
        if area > best_area and area >= 250 and bw > bh * 1.4:
            best_area = area
            best_lbl = lbl

    if best_lbl == 0:
        return out

    bx = int(stats[best_lbl, cv2.CC_STAT_LEFT])
    by = int(stats[best_lbl, cv2.CC_STAT_TOP])
    bw = int(stats[best_lbl, cv2.CC_STAT_WIDTH])
    bh = int(stats[best_lbl, cv2.CC_STAT_HEIGHT])
    gx0, gy0 = x0 + bx, y0 + by
    gx1, gy1 = gx0 + bw, gy0 + bh

    # Localizar fila inferior real y borde derecho SOLO de la bota izquierda (escaneo columna a columna arriba del pill)
    dark_navy = (out[:, :, 2] < 110) & (out[:, :, 0] < 75) & (out[:, :, 1] < 85)
    cuff_slice = dark_navy[gy0 - 15 : gy1 + 10, max(0, gx0 - 45) : gx0 + 5]
    cy_idx, _ = np.where(cuff_slice)
    cuff_bottom = (gy0 - 15 + int(cy_idx.max())) if cy_idx.size else gy0 + int(bh * 0.5)

    # Caminar desde gx0 hacia la derecha en una franja claramente ARRIBA del pill para detectar el hueco entre piernas
    cuff_right = gx0 + 36
    scan_cols = dark_navy[max(0, gy0 - 35) : max(1, gy0 - 10), gx0 : min(w, gx1)]
    col_dark_frac = scan_cols.mean(axis=0) if scan_cols.size else np.array([])
    gap_cols = np.where(col_dark_frac < 0.25)[0]
    if gap_cols.size:
        cuff_right = gx0 + int(gap_cols[0]) - 1

    # Rellenar el rectángulo completo de la píldora:
    # - Zona dentro de la bota izquierda [gy0:cuff_bottom+1, gx0:cuff_right+1] -> inpaint con azul marino de la bota
    # - Resto de la píldora (sobre espacio blanco entre piernas o debajo del dobladillo) -> blanco puro (255)
    pad = 4
    py_a, py_b = max(0, gy0 - pad), min(h, gy1 + pad)
    px_a, px_b = max(0, gx0 - pad), min(w, gx1 + pad)

    pill_full = np.zeros((py_b - py_a, px_b - px_a), dtype=np.uint8)
    pill_full[labels[gy0 - y0 - pad : gy1 - y0 + pad, gx0 - x0 - pad : gx1 - x0 + pad] == best_lbl] = 1
    # También incluir los puntos blancos '...' dentro del óvalo
    sub_patch = out[py_a:py_b, px_a:px_b]
    sr = sub_patch[:, :, 0].astype(np.int16)
    sg = sub_patch[:, :, 1].astype(np.int16)
    sb = sub_patch[:, :, 2].astype(np.int16)
    contours, _ = cv2.findContours(pill_full, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    filled = np.zeros_like(pill_full)
    cv2.drawContours(filled, contours, -1, 1, thickness=cv2.FILLED)
    filled = cv2.dilate(filled, np.ones((5, 5), np.uint8), iterations=1) > 0

    ys_p, xs_p = np.indices((py_b - py_a, px_b - px_a))
    gy_abs = py_a + ys_p
    gx_abs = px_a + xs_p

    # 1) Poner a blanco todo el pill fuera de la bota
    outside_cuff = filled & ((gy_abs > cuff_bottom) | (gx_abs > cuff_right))
    sub_patch[outside_cuff] = 255

    # 2) Inpaint la esquina que solapa la bota izquierda usando únicamente el color de la bota
    inside_cuff = filled & (~outside_cuff)
    if np.any(inside_cuff):
        navy_ref = sub_patch[(sr < 90) & (sb < 115) & (~filled)]
        if len(navy_ref):
            fill_col = np.median(navy_ref, axis=0).astype(np.uint8)
        else:
            fill_col = np.array([28, 34, 62], dtype=np.uint8)
        sub_patch[inside_cuff] = fill_col

    out[py_a:py_b, px_a:px_b] = sub_patch
    return out


def estimate_border_bg_color(rgb: NDArray[np.uint8]) -> tuple[NDArray[np.float32], NDArray[np.float32]]:
    """Estima color RGB y LAB dominante del fondo en el perímetro de la imagen."""
    lab = cv2.cvtColor(rgb, cv2.COLOR_RGB2LAB)
    border_rgb = np.concatenate(
        [rgb[0:3, :, :].reshape(-1, 3), rgb[-3:, :, :].reshape(-1, 3),
         rgb[:, 0:3, :].reshape(-1, 3), rgb[:, -3:, :].reshape(-1, 3)],
        axis=0,
    )
    border_lab = np.concatenate(
        [lab[0:3, :, :].reshape(-1, 3), lab[-3:, :, :].reshape(-1, 3),
         lab[:, 0:3, :].reshape(-1, 3), lab[:, -3:, :].reshape(-1, 3)],
        axis=0,
    )
    # Tomar píxeles luminosos y neutros del borde si existen en mayoría
    chroma = np.hypot(
        border_lab[:, 1].astype(np.float32) - 128.0,
        border_lab[:, 2].astype(np.float32) - 128.0,
    )
    light_neutral = (border_lab[:, 0] >= 175) & (chroma <= 18)
    if np.mean(light_neutral) >= 0.35:
        bg_rgb = np.median(border_rgb[light_neutral], axis=0).astype(np.float32)
        bg_lab = np.median(border_lab[light_neutral], axis=0).astype(np.float32)
    else:
        bg_rgb = np.median(border_rgb, axis=0).astype(np.float32)
        bg_lab = np.median(border_lab, axis=0).astype(np.float32)
    return bg_rgb, bg_lab


def remove_studio_background(
    rgb: NDArray[np.uint8],
    *,
    allow_multi_component: bool = False,
) -> tuple[NDArray[np.uint8], NDArray[np.float32]]:
    """Elimina fondos blancos, gris claro o de estudio mediante flood-fill perceptual en LAB."""
    h, w = rgb.shape[:2]
    lab = cv2.cvtColor(rgb, cv2.COLOR_RGB2LAB).astype(np.float32)
    bg_rgb, bg_lab = estimate_border_bg_color(rgb)

    L = lab[:, :, 0]
    a = lab[:, :, 1] - 128.0
    b = lab[:, :, 2] - 128.0
    chroma = np.hypot(a, b)

    bg_L = float(bg_lab[0])
    bg_a = float(bg_lab[1]) - 128.0
    bg_b = float(bg_lab[2]) - 128.0

    # Distancia perceptual respecto al fondo de borde
    dE = np.sqrt((L - bg_L) ** 2 + 1.45 * (a - bg_a) ** 2 + 1.45 * (b - bg_b) ** 2)

    # Gradiente para proteger bordes de prendas claras/reflectivas contra fugas
    gx = cv2.Sobel(L, cv2.CV_32F, 1, 0, ksize=3)
    gy = cv2.Sobel(L, cv2.CV_32F, 0, 1, ksize=3)
    grad = np.hypot(gx, gy) / 4.0

    # Tolerancia adaptativa estricta para no filtrar hacia franjas reflectivas ni tela clara
    if bg_L >= 242:
        strict_tol = 18.0
        shadow_tol = 34.0
        max_chroma = 14.0
        shadow_drop = 58.0
    else:
        strict_tol = 22.0
        shadow_tol = 40.0
        max_chroma = 17.0
        shadow_drop = 60.0

    # Extra para sombras suaves proyectadas en el suelo solo en el 12% inferior
    ys_idx = np.arange(h)[:, None]
    bottom_floor_shadow = (ys_idx >= int(h * 0.88)) & (dE <= 74.0) & (chroma <= 7.5) & (grad <= 9.0) & (L >= 145.0)

    bg_candidate = (
        ((dE <= strict_tol) & (chroma <= max_chroma))
        | ((dE <= shadow_tol) & (chroma <= max_chroma) & (grad <= 13.0) & (L >= bg_L - shadow_drop))
        | bottom_floor_shadow
    )

    # 1. Flood-fill conectado al perímetro exterior
    num_lbl, labels = cv2.connectedComponents(bg_candidate.astype(np.uint8), connectivity=4)
    border_labels = set(np.unique(labels[0, :])) | set(np.unique(labels[-1, :])) | set(
        np.unique(labels[:, 0])
    ) | set(np.unique(labels[:, -1]))
    border_labels.discard(0)

    bg_mask = np.isin(labels, list(border_labels))

    # 2. Detectar huecos internos encerrados (entre brazos y torso, entre piernas, interior de letras)
    # Solo eliminar regiones internas que sean casi idénticas al papel de estudio (brillantes y planas)
    interior_cand = bg_candidate & (~bg_mask)
    if np.any(interior_cand):
        num_in, in_lbl, in_stats, _ = cv2.connectedComponentsWithStats(
            interior_cand.astype(np.uint8), connectivity=4
        )
        for lbl in range(1, num_in):
            area = int(in_stats[lbl, cv2.CC_STAT_AREA])
            if area < 35:
                continue
            ix = int(in_stats[lbl, cv2.CC_STAT_LEFT])
            iy = int(in_stats[lbl, cv2.CC_STAT_TOP])
            iw = int(in_stats[lbl, cv2.CC_STAT_WIDTH])
            ih = int(in_stats[lbl, cv2.CC_STAT_HEIGHT])
            comp = in_lbl == lbl
            med_L = float(np.median(L[comp]))
            std_L = float(np.std(L[comp]))
            med_C = float(np.median(chroma[comp]))

            # Proteger etiquetas blancas del cuello (centradas arriba y con texto oscuro adentro)
            in_collar_zone = (
                iy < int(h * 0.25)
                and ix > int(w * 0.34)
                and (ix + iw) < int(w * 0.66)
                and area < int(h * w * 0.015)
            )
            if in_collar_zone:
                continue

            if med_L >= max(236.0, bg_L - 14.0) and med_C <= 7.5 and std_L <= 7.5:
                bg_mask |= comp

    fg_mask = ~bg_mask

    # 3. Filtrar islas desconectadas pequeñas (ícono Google Lens, puntos sueltos, motas)
    num_fg, fg_lbl, fg_stats, _ = cv2.connectedComponentsWithStats(
        fg_mask.astype(np.uint8), connectivity=8
    )
    if num_fg > 1:
        areas = [int(fg_stats[i, cv2.CC_STAT_AREA]) for i in range(1, num_fg)]
        max_area = max(areas) if areas else 0
        min_keep = (
            max(25, int(max_area * 0.002))
            if allow_multi_component
            else max(80, int(max_area * 0.04))
        )
        keep_mask = np.zeros_like(fg_mask)
        for i in range(1, num_fg):
            if int(fg_stats[i, cv2.CC_STAT_AREA]) >= min_keep:
                keep_mask |= fg_lbl == i
        fg_mask = keep_mask

    # 4. Rellenar microporos de 1-2 px dentro de la prenda
    fg_u8 = (fg_mask.astype(np.uint8)) * 255
    fg_u8 = cv2.morphologyEx(
        fg_u8, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
    )

    rgba = refine_alpha_and_decontaminate(rgb, fg_u8 > 127, bg_rgb)
    return rgba, bg_rgb


def remove_scenic_background_grabcut(
    rgb: NDArray[np.uint8],
    *,
    filename: str = "",
) -> NDArray[np.uint8]:
    """Segmentación GrabCut de alta precisión para fotos con fondo real (cat-mamelucos, cat-pantalones)."""
    h, w = rgb.shape[:2]
    bgr = cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)
    mask = np.full((h, w), cv2.GC_PR_BGD, dtype=np.uint8)

    # Marco exterior definido como fondo
    mx = max(4, int(w * 0.03))
    my = max(4, int(h * 0.03))
    mask[:my, :] = cv2.GC_BGD
    mask[-my:, :] = cv2.GC_BGD
    mask[:, :mx] = cv2.GC_BGD
    mask[:, -mx:] = cv2.GC_BGD

    # Zona central probable primer plano
    cx0, cx1 = int(w * 0.28), int(w * 0.72)
    cy0, cy1 = int(h * 0.14), int(h * 0.90)
    mask[cy0:cy1, cx0:cx1] = cv2.GC_PR_FGD

    lab = cv2.cvtColor(rgb, cv2.COLOR_RGB2LAB).astype(np.float32)
    chroma = np.hypot(lab[:, :, 1] - 128.0, lab[:, :, 2] - 128.0)
    r_i, g_i, b_i = rgb[:, :, 0].astype(np.int16), rgb[:, :, 1].astype(np.int16), rgb[:, :, 2].astype(np.int16)
    ys, xs = np.indices((h, w))

    if float(np.mean(lab[:my, :, 0] > 215)) > 0.5:
        mask[(lab[:, :, 0] > 235) & (chroma < 8)] = cv2.GC_PR_BGD

    if filename == "cat-mamelucos.png":
        # Proteger casco, rostro/cuello, cintura reflectiva completa y overol naranja
        mask[int(h * 0.04) : int(h * 0.28), int(w * 0.38) : int(w * 0.61)] = cv2.GC_PR_FGD
        mask[int(h * 0.30) : int(h * 0.48), int(w * 0.24) : int(w * 0.78)] = cv2.GC_PR_FGD
        orange = (r_i - b_i > 42) & (r_i > 125)
        mask[orange & (xs > int(w * 0.20)) & (xs < int(w * 0.80))] = cv2.GC_PR_FGD

    bgd_model = np.zeros((1, 65), np.float64)
    fgd_model = np.zeros((1, 65), np.float64)
    cv2.grabCut(bgr, mask, None, bgd_model, fgd_model, 7, cv2.GC_INIT_WITH_MASK)

    fg_mask = (mask == cv2.GC_FGD) | (mask == cv2.GC_PR_FGD)

    # Limpieza post-GrabCut (sin envenenar el modelo GMM previo)
    if filename == "cat-pantalones.png":
        green_rail = (xs >= int(w * 0.78)) & (ys >= int(h * 0.28)) & (ys <= int(h * 0.64)) & (g_i - r_i > 12) & (g_i > b_i)
        fg_mask[green_rail] = False
    elif filename == "cat-mamelucos.png":
        puddle = (ys >= int(h * 0.72)) & (xs >= int(w * 0.44)) & (xs <= int(w * 0.53)) & (r_i - b_i < 25)
        fg_mask[puddle] = False

    # Conservar componente principal
    num_fg, fg_lbl, fg_stats, _ = cv2.connectedComponentsWithStats(
        fg_mask.astype(np.uint8), connectivity=8
    )
    if num_fg > 1:
        best_lbl = 1 + int(
            np.argmax([fg_stats[i, cv2.CC_STAT_AREA] for i in range(1, num_fg)])
        )
        fg_mask = fg_lbl == best_lbl

    bg_rgb = np.median(
        np.concatenate([rgb[0:4, :, :].reshape(-1, 3), rgb[-4:, :, :].reshape(-1, 3)], axis=0),
        axis=0,
    ).astype(np.float32)

    return refine_alpha_and_decontaminate(rgb, fg_mask, bg_rgb)


def refine_alpha_and_decontaminate(
    rgb: NDArray[np.uint8],
    fg_mask: NDArray[np.bool_],
    bg_rgb: NDArray[np.float32],
) -> NDArray[np.uint8]:
    """Suaviza bordes de la silueta y descontamina halos de fondo en píxeles semitransparentes."""
    fg_f = fg_mask.astype(np.float32)
    # Suavizado sutil solo en la frontera de 1.5 px (conserva 100% opacidad interior)
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
    eroded = cv2.erode(fg_f, kernel, iterations=1)
    blurred = cv2.GaussianBlur(fg_f, (3, 3), sigmaX=0.75)
    alpha_f = np.where(eroded > 0.5, 1.0, blurred)
    alpha_f = np.where(alpha_f < 0.04, 0.0, alpha_f)

    # Descontaminación de color de fondo en píxeles de borde semitransparentes (evita halo blanco/gris)
    rgb_f = rgb.astype(np.float32)
    edge_band = (alpha_f > 0.04) & (alpha_f < 0.96)
    if np.any(edge_band):
        a_exp = alpha_f[edge_band][:, None]
        recovered = (rgb_f[edge_band] - (1.0 - a_exp) * bg_rgb[None, :]) / np.maximum(a_exp, 0.15)
        rgb_f[edge_band] = np.clip(recovered, 0.0, 255.0)

    out = np.zeros((rgb.shape[0], rgb.shape[1], 4), dtype=np.uint8)
    out[:, :, :3] = np.clip(rgb_f, 0.0, 255.0).astype(np.uint8)
    out[:, :, 3] = np.clip(np.round(alpha_f * 255.0), 0, 255).astype(np.uint8)
    out[out[:, :, 3] == 0] = 0
    return out


def clean_existing_transparent_rgba(
    rgba: NDArray[np.uint8],
    *,
    allow_multi_component: bool = False,
) -> NDArray[np.uint8]:
    """Limpia halos blancos residuales, motas y marcas Photoroom en PNGs ya transparentes."""
    out = rgba.copy()
    a = out[:, :, 3]

    # Eliminar islas aisladas diminutas si no es un logo/collage
    fg = a > 16
    num_fg, fg_lbl, fg_stats, _ = cv2.connectedComponentsWithStats(
        fg.astype(np.uint8), connectivity=8
    )
    if num_fg > 1:
        areas = [int(fg_stats[i, cv2.CC_STAT_AREA]) for i in range(1, num_fg)]
        max_area = max(areas) if areas else 0
        min_keep = (
            max(15, int(max_area * 0.0015))
            if allow_multi_component
            else max(80, int(max_area * 0.03))
        )
        keep = np.zeros_like(fg)
        for i in range(1, num_fg):
            if int(fg_stats[i, cv2.CC_STAT_AREA]) >= min_keep:
                keep |= fg_lbl == i
        out[~keep] = 0

    # Descontaminación suave en bordes semitransparentes claros (halo blanco de extracción previa)
    a = out[:, :, 3].astype(np.float32) / 255.0
    rgb_f = out[:, :, :3].astype(np.float32)
    bright_fringe = (a > 0.04) & (a < 0.88) & (np.min(rgb_f, axis=2) > 205)
    if np.any(bright_fringe):
        a_exp = a[bright_fringe][:, None]
        recovered = (rgb_f[bright_fringe] - (1.0 - a_exp) * 255.0) / np.maximum(a_exp, 0.20)
        rgb_f[bright_fringe] = np.clip(recovered, 0.0, 255.0)
        out[:, :, :3] = rgb_f.astype(np.uint8)

    out[out[:, :, 3] < 8] = 0
    return out


def crop_to_content_with_padding(rgba: NDArray[np.uint8], pad_ratio: float = 0.035) -> NDArray[np.uint8]:
    """Recorta márgenes transparentes excesivos manteniendo un margen equilibrado."""
    ys, xs = np.where(rgba[:, :, 3] > 12)
    if ys.size == 0:
        return rgba
    y0, y1 = int(ys.min()), int(ys.max()) + 1
    x0, x1 = int(xs.min()), int(xs.max()) + 1
    cw, ch = x1 - x0, y1 - y0
    pad = max(8, int(round(max(cw, ch) * pad_ratio)))

    cropped = rgba[y0:y1, x0:x1]
    out = np.zeros((ch + pad * 2, cw + pad * 2, 4), dtype=np.uint8)
    out[pad : pad + ch, pad : pad + cw] = cropped
    return out


def process_single_image(src_path: Path, dst_path: Path) -> str:
    """Procesa una imagen PNG y la guarda optimizada en ``dst_path``."""
    name = src_path.name
    im = Image.open(src_path).convert("RGBA")
    arr = np.asarray(im, dtype=np.uint8)

    if name in PRESERVE_OPAQUE_FILES:
        dst_path.parent.mkdir(parents=True, exist_ok=True)
        im.save(dst_path, format="PNG", optimize=True)
        return "PRESERVED_OPAQUE"

    if name in WATERMARK_ONLY_FILES:
        cleaned, wm = inpaint_photoroom_overlay(arr)
        dst_path.parent.mkdir(parents=True, exist_ok=True)
        Image.fromarray(cleaned, mode="RGBA").save(dst_path, format="PNG", optimize=True)
        return f"WATERMARK_ONLY(wm={wm})"

    allow_multi = name in MULTI_COMPONENT_FILES
    trans_frac = float(np.mean(arr[:, :, 3] < 12))

    if trans_frac > 0.12:
        cleaned, wm = inpaint_photoroom_overlay(arr)
        cleaned = clean_existing_transparent_rgba(cleaned, allow_multi_component=allow_multi)
        cleaned = crop_to_content_with_padding(cleaned)
        dst_path.parent.mkdir(parents=True, exist_ok=True)
        Image.fromarray(cleaned, mode="RGBA").save(dst_path, format="PNG", optimize=True)
        return f"REFINED_TRANS(wm={wm})"

    # Imagen con fondo opaco -> primero limpiar barras de captura / marcos, píldora m-07 y Photoroom sobre fondo opaco
    rgb = trim_screenshot_and_frames(arr[:, :, :3], clean_cobalt_frame=(name == "cas-37.png"))
    if name == "m-07.png":
        rgb = fix_m07_carousel_pill(rgb)

    wm = False
    if name not in GRABCUT_FILES and _detect_photoroom_icon(rgb) is not None:
        rgb_rgba, wm = inpaint_photoroom_overlay(
            np.dstack([rgb, np.full(rgb.shape[:2], 255, dtype=np.uint8)])
        )
        rgb = rgb_rgba[:, :, :3]

    if name in GRABCUT_FILES:
        rgba = remove_scenic_background_grabcut(rgb, filename=name)
        mode = "GRABCUT"
    else:
        rgba, _ = remove_studio_background(rgb, allow_multi_component=allow_multi)
        mode = "STUDIO_FLOOD"

    if not wm:
        rgba, wm = inpaint_photoroom_overlay(rgba)
    rgba = clean_existing_transparent_rgba(rgba, allow_multi_component=allow_multi)
    rgba = crop_to_content_with_padding(rgba)

    dst_path.parent.mkdir(parents=True, exist_ok=True)
    Image.fromarray(rgba, mode="RGBA").save(dst_path, format="PNG", optimize=True)
    return f"{mode}(wm={wm})"


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Limpia fondos y halos en PNGs de WHA MOUNTAIN.")
    parser.add_argument("--src", type=Path, default=DEFAULT_IMAGES_DIR)
    parser.add_argument("--dst", type=Path, default=DEFAULT_IMAGES_DIR)
    args = parser.parse_args(argv)

    counts: dict[str, int] = {}
    for sub in ("brand", "products"):
        src_dir = args.src / sub
        dst_dir = args.dst / sub
        if not src_dir.is_dir():
            continue
        for png_path in sorted(src_dir.glob("*.png")):
            status = process_single_image(png_path, dst_dir / png_path.name)
            key = status.split("(")[0]
            counts[key] = counts.get(key, 0) + 1
            print(f"[{sub}/{png_path.name}] -> {status}")

    print("Resumen:", counts)
    return 0


if __name__ == "__main__":
    sys.exit(main())
