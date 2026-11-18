"""Extracción, rotación y limpieza inteligente de imágenes del catálogo WHA MOUNTAIN.

Procesa el catálogo PDF maestro mediante PyMuPDF (fitz), aplica las rotaciones
registradas en las matrices de transformación de cada página y elimina de forma
quirúrgica la insignia de marca de agua Photoroom sin recortar píxeles válidos
de las prendas.
"""

from __future__ import annotations

import argparse
from collections import deque
from collections.abc import Sequence
from dataclasses import dataclass, field
import logging
import math
from pathlib import Path
import sys
from typing import Final

import numpy as np
from numpy.typing import NDArray
from PIL import Image, ImageFilter

try:
    import pymupdf
except ModuleNotFoundError:  # Permite importar utilidades de limpieza sin PyMuPDF
    pymupdf = None  # type: ignore[assignment]

LOGGER = logging.getLogger("wha.extract_catalog")

BASE_DIR: Final[Path] = Path(__file__).resolve().parent.parent
DEFAULT_PDF_PATH: Final[Path] = (
    BASE_DIR / "DATA DEL CLIENTE" / "Catálago WHA_20240930_143332_0000.pdf"
)
DEFAULT_PRODUCTS_DIR: Final[Path] = (
    BASE_DIR / "PAGINA WEB" / "public" / "images" / "products"
)
DEFAULT_BRAND_DIR: Final[Path] = (
    BASE_DIR / "PAGINA WEB" / "public" / "images" / "brand"
)

TEMP_ARTIFACTS: Final[tuple[str, ...]] = ("test-cas-01.png", "test-cas-02.png")

BRAND_XREFS: Final[dict[str, int]] = {
    "hero-cover.png": 55,
    "logo-wha-mountain.png": 61,
    "banner-reflectivo.png": 60,
    "banner-termico.png": 59,
    "cat-casacas.png": 65,
    "cat-chalecos.png": 309,
    "cat-mamelucos.png": 335,
    "cat-pantalones.png": 363,
}

PRODUCT_XREFS: Final[dict[str, list[int]]] = {
    "CAS-01": [69, 70, 71],
    "CAS-02": [72, 73],
    "CAS-03": [79, 84, 81],
    "CAS-04": [80, 82, 83],
    "CAS-05": [91],
    "CAS-06": [92],
    "CAS-07": [98],
    "CAS-08": [99],
    "CAS-09": [105, 106, 107],
    "CAS-10": [108],
    "CAS-11": [115],
    "CAS-12": [116],
    "CAS-13": [122],
    "CAS-14": [123],
    "CAS-15": [129],
    "CAS-16": [130, 131],
    "CAS-17": [137],
    "CAS-18": [138],
    "CAS-19": [144],
    "CAS-20": [145],
    "CAS-21": [153],
    "CAS-22": [154],
    "CAS-23": [160, 161],
    "CAS-24": [162],
    "CAS-25": [168],
    "CAS-26": [169],
    "CAS-27": [177, 176, 175],
    "CAS-28": [178],
    "CAS-29": [184],
    "CAS-30": [183],
    "CAS-31": [190],
    "CAS-32": [191, 192, 193],
    "CAS-33": [200],
    "CAS-34": [201],
    "CAS-35": [207, 208, 209],
    "CAS-36": [210],
    "CAS-37": [217],
    "CAS-38": [218],
    "CAS-39": [224, 226, 225],
    "CAS-40": [227],
    "CAS-41": [235, 234, 236],
    "CAS-42": [237],
    "CAS-43": [244],
    "CAS-44": [243],
    "CAS-45": [251],
    "CAS-46": [250],
    "CAS-47": [257],
    "CAS-48": [258, 259],
    "CAS-49": [264],
    "CAS-50": [265],
    "CAS-51": [271],
    "CAS-52": [270],
    "CAS-53": [275],
    "CAS-54": [276],
    "CAS-55": [285],
    "CAS-56": [284],
    "CAS-57": [283],
    "CAS-58": [293],
    "CAS-59": [292],
    "CAS-60": [294],
    "CAS-61": [300],
    "CAS-62": [301],
    "CAS-63": [302],
    "CH-01": [313],
    "CH-02": [314],
    "CH-03": [320, 322],
    "CH-04": [321],
    "CH-05": [328],
    "CH-06": [329],
    "M-01": [339, 340],
    "M-02": [341],
    "M-03": [347],
    "M-04": [348],
    "M-05": [355],
    "M-06": [354],
    "M-07": [359],
    "PT-01": [369, 368],
    "PT-02": [367],
    "PT-03": [374],
}

TRANSPOSE_BY_ANGLE: Final[dict[int, Image.Transpose]] = {
    90: Image.Transpose.ROTATE_90,
    180: Image.Transpose.ROTATE_180,
    270: Image.Transpose.ROTATE_270,
}


class CatalogExtractionError(Exception):
    """Error específico durante la extracción o limpieza de recursos del PDF."""


@dataclass(frozen=True, slots=True)
class ImagePlacement:
    """Metadatos de máscara alfa y rotación extraídos de la página PDF."""

    smask_xref: int
    rotation: int


@dataclass(frozen=True, slots=True)
class ExtractionConfig:
    """Configuración inmutable de rutas y opciones del pipeline."""

    pdf_path: Path = DEFAULT_PDF_PATH
    products_dir: Path = DEFAULT_PRODUCTS_DIR
    brand_dir: Path = DEFAULT_BRAND_DIR
    optimize_png: bool = True
    dry_run: bool = False


@dataclass(slots=True)
class ExtractionStats:
    """Contadores de trazabilidad del proceso de extracción."""

    brand_saved: int = 0
    products_saved: int = 0
    watermarks_cleaned: int = 0
    skipped: int = 0
    failed: list[str] = field(default_factory=list)


def detect_rotation_from_matrix(matrix: pymupdf.Matrix) -> int:
    """Determina la rotación discreta (0, 90, 180, 270) a partir de la matriz afín.

    Args:
        matrix: Matriz de transformación devuelta por ``page.get_image_rects``.

    Returns:
        Ángulo discreto en grados antihorarios compatibles con ``PIL.Image.Transpose``.
    """
    angle_deg = math.degrees(math.atan2(matrix.b, matrix.a))
    normalized = round(angle_deg / 90.0) * 90 % 360
    # PyMuPDF usa eje Y invertido respecto a coordenadas de pantalla; validamos signos
    if matrix.a < -0.01 and matrix.d < -0.01:
        return 180
    if matrix.b < -0.01 and matrix.c > 0.01:
        return 90
    if matrix.b > 0.01 and matrix.c < -0.01:
        return 270
    if normalized in (90, 180, 270) and abs(matrix.a) < 0.01 and abs(matrix.d) < 0.01:
        return int(normalized)
    return 0


def collect_image_placements(
    doc: pymupdf.Document,
    target_xrefs: set[int] | None = None,
) -> dict[int, ImagePlacement]:
    """Recopila ``smask`` y rotación para cada ``xref`` en el documento.

    Evita recalcular transformaciones repetidas para ``xref`` ya inspeccionados.
    """
    placements: dict[int, ImagePlacement] = {}
    for page in doc:
        for img_info in page.get_images(full=True):
            xref = int(img_info[0])
            if target_xrefs is not None and xref not in target_xrefs:
                continue
            if xref in placements:
                continue

            smask_xref = int(img_info[1])
            rotation = 0
            rects_with_transform = page.get_image_rects(xref, transform=True)
            if rects_with_transform:
                _, matrix = rects_with_transform[0]
                rotation = detect_rotation_from_matrix(matrix)

            placements[xref] = ImagePlacement(
                smask_xref=smask_xref,
                rotation=rotation,
            )
    return placements


def _fill_enclosed_holes(binary_mask: NDArray[np.bool_]) -> NDArray[np.bool_]:
    """Rellena huecos internos cerrados (ej. letras blancas dentro de la insignia).

    Opera únicamente sobre la caja delimitadora ajustada del componente usando un
    recorrido BFS sobre ``bytearray`` plano para lograr latencia sub-milisegundo
    sin dependencias externas.
    """
    ys, xs = np.where(binary_mask)
    if ys.size == 0:
        return binary_mask.copy()

    y0, y1 = int(ys.min()), int(ys.max()) + 1
    x0, x1 = int(xs.min()), int(xs.max()) + 1
    sub = binary_mask[y0:y1, x0:x1]
    sh, sw = sub.shape
    bh, bw = sh + 2, sw + 2

    padded = np.zeros((bh, bw), dtype=np.uint8)
    padded[1:-1, 1:-1] = sub.astype(np.uint8)
    grid = bytearray(padded.tobytes())
    total = bh * bw

    # 2 = píxel exterior alcanzable desde el borde
    grid[0] = 2
    queue: deque[int] = deque([0])
    while queue:
        idx = queue.popleft()
        col = idx % bw
        if col > 0 and grid[idx - 1] == 0:
            grid[idx - 1] = 2
            queue.append(idx - 1)
        if col + 1 < bw and grid[idx + 1] == 0:
            grid[idx + 1] = 2
            queue.append(idx + 1)
        if idx >= bw and grid[idx - bw] == 0:
            grid[idx - bw] = 2
            queue.append(idx - bw)
        if idx + bw < total and grid[idx + bw] == 0:
            grid[idx + bw] = 2
            queue.append(idx + bw)

    filled_sub = np.frombuffer(grid, dtype=np.uint8).reshape((bh, bw))[1:-1, 1:-1] != 2
    out = binary_mask.copy()
    out[y0:y1, x0:x1] = filled_sub
    return out


def _extract_connected_components(
    binary_mask: NDArray[np.bool_],
    min_area: int,
) -> list[NDArray[np.bool_]]:
    """Extrae componentes conexos (4-conectividad) con área >= ``min_area``.

    Implementado mediante codificación por tramos horizontales (RLE) + Union-Find
    sobre filas adyacentes, evitando bucles por píxel en Python puro.
    """
    mask = np.asarray(binary_mask, dtype=bool)
    h, w = mask.shape
    if h == 0 or w == 0 or not np.any(mask):
        return []

    padded = np.zeros((h, w + 2), dtype=np.int8)
    padded[:, 1:-1] = mask
    diffs = np.diff(padded, axis=1)
    starts = np.argwhere(diffs == 1)
    if starts.size == 0:
        return []
    ends = np.argwhere(diffs == -1)

    run_rows = starts[:, 0].tolist()
    run_x0 = starts[:, 1].tolist()
    run_x1 = ends[:, 1].tolist()
    num_runs = len(run_rows)

    parent = list(range(num_runs))
    comp_area = [run_x1[i] - run_x0[i] for i in range(num_runs)]

    def find(node: int) -> int:
        while parent[node] != node:
            parent[node] = parent[parent[node]]
            node = parent[node]
        return node

    def union(a: int, b: int) -> None:
        ra, rb = find(a), find(b)
        if ra == rb:
            return
        if comp_area[ra] < comp_area[rb]:
            ra, rb = rb, ra
        parent[rb] = ra
        comp_area[ra] += comp_area[rb]

    # Agrupa índices [inicio, fin) de tramos por fila aprovechando orden ascendente
    row_ranges: dict[int, tuple[int, int]] = {}
    idx = 0
    while idx < num_runs:
        row = run_rows[idx]
        start_idx = idx
        while idx < num_runs and run_rows[idx] == row:
            idx += 1
        row_ranges[row] = (start_idx, idx)

    for row, (a_start, a_end) in row_ranges.items():
        next_range = row_ranges.get(row + 1)
        if next_range is None:
            continue
        b_start, b_end = next_range
        i, j = a_start, b_start
        while i < a_end and j < b_end:
            if run_x1[i] <= run_x0[j]:
                i += 1
            elif run_x1[j] <= run_x0[i]:
                j += 1
            else:
                union(i, j)
                if run_x1[i] <= run_x1[j]:
                    i += 1
                else:
                    j += 1

    runs_by_root: dict[int, list[int]] = {}
    for run_id in range(num_runs):
        root = find(run_id)
        if comp_area[root] >= min_area:
            runs_by_root.setdefault(root, []).append(run_id)

    components: list[NDArray[np.bool_]] = []
    for run_ids in runs_by_root.values():
        comp_mask = np.zeros((h, w), dtype=bool)
        for run_id in run_ids:
            comp_mask[run_rows[run_id], run_x0[run_id] : run_x1[run_id]] = True
        components.append(comp_mask)

    return components


def _dilate_mask(mask: NDArray[np.bool_], radius_px: int = 2) -> NDArray[np.bool_]:
    """Dilata ligeramente una máscara booleana usando MaxFilter nativo de Pillow."""
    size = radius_px * 2 + 1
    pil_m = Image.fromarray(np.where(mask, 255, 0).astype(np.uint8), mode="L")
    dilated = pil_m.filter(ImageFilter.MaxFilter(size=size))
    return np.asarray(dilated, dtype=np.uint8) > 0


def remove_photoroom_watermark(image: Image.Image) -> tuple[Image.Image, bool]:
    """Elimina de forma selectiva la insignia de Photoroom en imágenes RGBA.

    En lugar de recortar un rectángulo ciego (que mutila prendas sin marca o
    prendas cuya esquina inferior derecha ocupa el ROI), aplica dos detectores
    complementarios en la región inferior derecha:

    1. **Firma de píldora semitransparente Photoroom:** detecta la cápsula oscura
       semitransparente (``RGB <= 42``, ``75 <= alpha <= 175``), rellena sus
       huecos internos (capturando el ícono ``R`` y el texto blanco ``Photoroom``),
       valida geometría rectangular y posición en esquina, y elimina exactamente
       su contorno (más un suavizado de borde de 2 px restringido a píxeles
       semitransparentes/neutros para no morder la prenda).
    2. **Componente flotante aislado en esquina extrema:** elimina cualquier
       pequeña insignia opaca desconectada de la prenda situada enteramente dentro
       de la esquina inferior derecha extrema sin tocar los bordes internos del ROI.

    Args:
        image: Imagen PIL en modo RGBA (o convertible).

    Returns:
        Tupla ``(imagen_limpia, se_detecto_marca)``.
    """
    rgba = image.convert("RGBA") if image.mode != "RGBA" else image
    arr = np.array(rgba, copy=True)
    h, w = arr.shape[:2]

    if h < 64 or w < 64:
        return rgba, False

    roi_y0 = int(h * 0.78)
    roi_x0 = int(w * 0.62)
    roi = arr[roi_y0:, roi_x0:]

    r, g, b, a = roi[:, :, 0], roi[:, :, 1], roi[:, :, 2], roi[:, :, 3]
    total_pixels = h * w
    min_pill_area = max(350, int(total_pixels * 0.002))

    # 1. Detector primario: fondo oscuro semitransparente típico del badge Photoroom
    pill_bg = (r <= 42) & (g <= 42) & (b <= 42) & (a >= 75) & (a <= 175)
    erase_roi = np.zeros(roi.shape[:2], dtype=bool)

    for comp in _extract_connected_components(pill_bg, min_area=min_pill_area):
        filled = _fill_enclosed_holes(comp)
        ys, xs = np.where(filled)
        if ys.size == 0:
            continue

        bbox_h = int(ys.max() - ys.min() + 1)
        bbox_w = int(xs.max() - xs.min() + 1)
        bbox_area = bbox_h * bbox_w
        fill_ratio = float(ys.size) / float(max(1, bbox_area))

        # La cápsula Photoroom es horizontal (w > h), compacta y rectangular (~0.85-0.98)
        is_pill_shape = (
            bbox_w > bbox_h
            and fill_ratio >= 0.72
            and ys.size <= int(total_pixels * 0.08)
            and (roi_x0 + int(xs.max())) >= int(w * 0.78)
            and (roi_y0 + int(ys.max())) >= int(h * 0.84)
        )
        if not is_pill_shape:
            continue

        # Suavizado de 2 px en bordes anti-aliased sin invadir píxeles opacos de prenda
        halo = _dilate_mask(filled, radius_px=2) & ~filled
        safe_halo = halo & ((a <= 190) | ((r <= 48) & (g <= 48) & (b <= 48)))
        erase_roi |= filled | safe_halo

    # 2. Detector secundario: isla completamente aislada en la esquina extrema
    ext_y0 = int(h * 0.84) - roi_y0
    ext_x0 = int(w * 0.70) - roi_x0
    if ext_y0 >= 0 and ext_x0 >= 0:
        extreme_mask = (a[ext_y0:, ext_x0:] > 10) & (~erase_roi[ext_y0:, ext_x0:])
        for comp in _extract_connected_components(extreme_mask, min_area=120):
            # Si toca el borde superior o izquierdo de la sub-región, podría ser la prenda
            touches_inner_edge = bool(np.any(comp[0, :]) or np.any(comp[:, 0]))
            area = int(np.count_nonzero(comp))
            if not touches_inner_edge and area <= int(total_pixels * 0.05):
                erase_roi[ext_y0:, ext_x0:] |= _dilate_mask(comp, radius_px=1)

    if not np.any(erase_roi):
        return rgba, False

    roi[erase_roi, :] = 0
    return Image.fromarray(arr, mode="RGBA"), True


def pixmap_to_pil(
    doc: pymupdf.Document,
    xref: int,
    smask_xref: int,
) -> Image.Image:
    """Construye una imagen PIL RGB/RGBA desde un ``xref`` y su ``smask`` opcional."""
    pix: pymupdf.Pixmap | None = None
    mask: pymupdf.Pixmap | None = None
    try:
        pix = pymupdf.Pixmap(doc, xref)
        if pix.n - pix.alpha > 3:  # CMYK o espacio extendido -> RGB
            converted = pymupdf.Pixmap(pymupdf.csRGB, pix)
            pix = converted

        if smask_xref > 0:
            mask = pymupdf.Pixmap(doc, smask_xref)
            if pix.alpha:
                pix = pymupdf.Pixmap(pix, 0)
            pix = pymupdf.Pixmap(pix, mask)
            return Image.frombytes("RGBA", (pix.width, pix.height), pix.samples)

        mode = "RGBA" if pix.alpha else "RGB"
        return Image.frombytes(mode, (pix.width, pix.height), pix.samples)
    finally:
        pix = None
        mask = None


def apply_rotation(image: Image.Image, angle: int) -> Image.Image:
    """Rota la imagen según el ángulo discreto detectado en el PDF."""
    transpose_op = TRANSPOSE_BY_ANGLE.get(angle)
    return image.transpose(transpose_op) if transpose_op is not None else image


def cleanup_temp_files(products_dir: Path, filenames: Sequence[str] = TEMP_ARTIFACTS) -> None:
    """Elimina archivos temporales de prueba si existen."""
    for name in filenames:
        candidate = products_dir / name
        if candidate.exists():
            candidate.unlink()
            LOGGER.debug("Archivo temporal eliminado: %s", candidate)


def extract_and_save_xref(
    doc: pymupdf.Document,
    xref: int,
    placement: ImagePlacement,
    output_path: Path,
    *,
    optimize: bool = True,
    dry_run: bool = False,
) -> bool:
    """Extrae un ``xref``, limpia marca de agua Photoroom, rota y guarda como PNG.

    Returns:
        ``True`` si se detectó y limpió una marca de agua en la imagen.
    """
    im = pixmap_to_pil(doc, xref, placement.smask_xref)
    watermark_cleaned = False
    if placement.smask_xref > 0:
        im, watermark_cleaned = remove_photoroom_watermark(im)

    im = apply_rotation(im, placement.rotation)
    if placement.smask_xref > 0 and placement.rotation != 0 and not watermark_cleaned:
        im, watermark_cleaned = remove_photoroom_watermark(im)

    if not dry_run:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        im.save(output_path, format="PNG", optimize=optimize)

    return watermark_cleaned


def run_extraction(config: ExtractionConfig) -> ExtractionStats:
    """Ejecuta el pipeline completo de extracción de catálogo y branding."""
    if pymupdf is None:
        raise CatalogExtractionError(
            "PyMuPDF (pymupdf) no está instalado en este entorno Python. "
            "Instálalo con: pip install pymupdf"
        )
    if not config.pdf_path.is_file():
        raise FileNotFoundError(f"No se encontró el catálogo PDF: {config.pdf_path}")

    if not config.dry_run:
        config.products_dir.mkdir(parents=True, exist_ok=True)
        config.brand_dir.mkdir(parents=True, exist_ok=True)
        cleanup_temp_files(config.products_dir)

    target_xrefs: set[int] = set(BRAND_XREFS.values())
    for xrefs in PRODUCT_XREFS.values():
        target_xrefs.update(xrefs)

    stats = ExtractionStats()

    try:
        with pymupdf.open(config.pdf_path) as doc:
            placements = collect_image_placements(doc, target_xrefs=target_xrefs)
            LOGGER.info(
                "PDF abierto (%d páginas). Metadatos recopilados para %d/%d xrefs.",
                len(doc),
                len(placements),
                len(target_xrefs),
            )

            for filename, xref in BRAND_XREFS.items():
                out_path = config.brand_dir / filename
                try:
                    placement = placements.get(xref, ImagePlacement(smask_xref=0, rotation=0))
                    cleaned = extract_and_save_xref(
                        doc,
                        xref,
                        placement,
                        out_path,
                        optimize=config.optimize_png,
                        dry_run=config.dry_run,
                    )
                    stats.brand_saved += 1
                    if cleaned:
                        stats.watermarks_cleaned += 1
                except Exception as exc:  # noqa: BLE001 - registra falla individual sin abortar lote
                    stats.failed.append(f"BRAND:{filename} (xref={xref}): {exc}")
                    LOGGER.exception("Error procesando asset de marca %s (xref=%d)", filename, xref)

            for code, xrefs in PRODUCT_XREFS.items():
                for idx, xref in enumerate(xrefs):
                    suffix = "" if idx == 0 else f"-{idx + 1}"
                    out_path = config.products_dir / f"{code.lower()}{suffix}.png"
                    try:
                        placement = placements.get(xref, ImagePlacement(smask_xref=0, rotation=0))
                        cleaned = extract_and_save_xref(
                            doc,
                            xref,
                            placement,
                            out_path,
                            optimize=config.optimize_png,
                            dry_run=config.dry_run,
                        )
                        stats.products_saved += 1
                        if cleaned:
                            stats.watermarks_cleaned += 1
                    except Exception as exc:  # noqa: BLE001
                        stats.failed.append(f"{code}:{out_path.name} (xref={xref}): {exc}")
                        LOGGER.exception("Error procesando %s (xref=%d)", out_path.name, xref)
    except pymupdf.FileDataError as exc:
        raise CatalogExtractionError(
            f"El archivo PDF está dañado o no es válido: {config.pdf_path}"
        ) from exc

    return stats


def parse_args(argv: Sequence[str] | None = None) -> argparse.Namespace:
    """Analiza los argumentos de línea de comandos."""
    parser = argparse.ArgumentParser(
        description="Extrae, rota y limpia imágenes del catálogo PDF WHA MOUNTAIN."
    )
    parser.add_argument(
        "--pdf",
        type=Path,
        default=DEFAULT_PDF_PATH,
        help="Ruta al catálogo PDF de origen.",
    )
    parser.add_argument(
        "--products-dir",
        type=Path,
        default=DEFAULT_PRODUCTS_DIR,
        help="Directorio de salida para PNG de productos.",
    )
    parser.add_argument(
        "--brand-dir",
        type=Path,
        default=DEFAULT_BRAND_DIR,
        help="Directorio de salida para assets de marca.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Ejecuta el análisis y limpieza en memoria sin escribir archivos.",
    )
    parser.add_argument(
        "--no-optimize",
        action="store_true",
        help="Desactiva optimize=True al guardar PNG para acelerar lotes grandes.",
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Muestra trazas detalladas de depuración.",
    )
    return parser.parse_args(argv)


def main(argv: Sequence[str] | None = None) -> int:
    """Punto de entrada CLI."""
    args = parse_args(argv)
    logging.basicConfig(
        level=logging.DEBUG if args.verbose else logging.INFO,
        format="%(asctime)s [%(levelname)s] %(message)s",
        datefmt="%H:%M:%S",
    )

    config = ExtractionConfig(
        pdf_path=args.pdf,
        products_dir=args.products_dir,
        brand_dir=args.brand_dir,
        optimize_png=not args.no_optimize,
        dry_run=args.dry_run,
    )

    try:
        stats = run_extraction(config)
    except (FileNotFoundError, CatalogExtractionError) as exc:
        LOGGER.error("%s", exc)
        return 1

    LOGGER.info(
        "Proceso completado: %d assets marca, %d imágenes producto, %d marcas de agua Photoroom eliminadas.",
        stats.brand_saved,
        stats.products_saved,
        stats.watermarks_cleaned,
    )
    if stats.failed:
        LOGGER.warning("Se encontraron %d errores individuales:", len(stats.failed))
        for item in stats.failed:
            LOGGER.warning("  - %s", item)
        return 2
    return 0


if __name__ == "__main__":
    sys.exit(main())
