import json
import os
import pymupdf

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
CATALOG_JSON = os.path.join(BASE_DIR, "DATA DEL CLIENTE", "catalogo_wha_mountain_estructurado.json")
PRODUCTS_IMG_DIR = os.path.join(BASE_DIR, "PAGINA WEB", "public", "images", "products")
BRAND_IMG_DIR = os.path.join(BASE_DIR, "PAGINA WEB", "public", "images", "brand")
OUT_PDF_DIR = os.path.join(BASE_DIR, "PAGINA WEB", "public", "catalogos")

os.makedirs(OUT_PDF_DIR, exist_ok=True)

with open(CATALOG_JSON, "r", encoding="utf-8") as f:
    data = json.load(f)

products = data["products"]

# Colors (RGB 0..1)
NAVY_DARK = (0.04, 0.098, 0.184)       # #0A192F
NAVY_MID = (0.075, 0.176, 0.31)        # #132D4F
NAVY_LIGHT = (0.145, 0.278, 0.45)      # #254773
BONE_BG = (0.969, 0.961, 0.941)        # #F7F5F0 (Blanco Hueso)
BONE_CARD = (0.992, 0.988, 0.98)       # #FDFCFA
STONE_BORDER = (0.86, 0.84, 0.80)      # #DCD6CC
GOLD_ACCENT = (0.77, 0.58, 0.16)       # #C49429
TEXT_DARK = (0.06, 0.10, 0.17)
TEXT_MUTED = (0.35, 0.40, 0.47)
WHITE = (1, 1, 1)


def clean_pdf_text(text: str) -> str:
    return (
        text.replace("•", "|")
        .replace("™", "")
        .replace("®", "")
    )


def draw_cover_page(doc, title, subtitle, count_text, hero_img_path):
    page = doc.new_page(width=595, height=842)  # A4 Portrait
    page.draw_rect(pymupdf.Rect(0, 0, 595, 842), color=None, fill=NAVY_DARK)
    page.draw_rect(pymupdf.Rect(0, 0, 595, 14), color=None, fill=GOLD_ACCENT)
    page.draw_rect(pymupdf.Rect(0, 828, 595, 14), color=None, fill=GOLD_ACCENT)

    page.draw_rect(pymupdf.Rect(36, 42, 523, 758), color=NAVY_LIGHT, fill=NAVY_MID, width=1.2)

    logo_path = os.path.join(BRAND_IMG_DIR, "logo-wha-mountain.png")
    if os.path.exists(logo_path):
        page.insert_image(pymupdf.Rect(247, 68, 347, 168), filename=logo_path)

    page.insert_textbox(
        pymupdf.Rect(56, 178, 539, 210),
        "WHA MOUNTAIN PERÚ  |  INGENIERÍA TEXTIL",
        fontsize=11,
        fontname="helv",
        color=GOLD_ACCENT,
        align=pymupdf.TEXT_ALIGN_CENTER,
    )

    page.insert_textbox(
        pymupdf.Rect(56, 205, 539, 285),
        clean_pdf_text(title.upper()),
        fontsize=24,
        fontname="hebo",
        color=WHITE,
        align=pymupdf.TEXT_ALIGN_CENTER,
    )

    page.insert_textbox(
        pymupdf.Rect(76, 275, 519, 330),
        clean_pdf_text(subtitle),
        fontsize=11.5,
        fontname="helv",
        color=BONE_BG,
        align=pymupdf.TEXT_ALIGN_CENTER,
    )

    page.draw_rect(pymupdf.Rect(195, 330, 400, 360), color=GOLD_ACCENT, fill=NAVY_DARK, width=1)
    page.insert_textbox(
        pymupdf.Rect(195, 336, 400, 365),
        clean_pdf_text(count_text),
        fontsize=10.5,
        fontname="hebo",
        color=GOLD_ACCENT,
        align=pymupdf.TEXT_ALIGN_CENTER,
    )

    page.draw_rect(pymupdf.Rect(135, 380, 460, 650), color=STONE_BORDER, fill=BONE_BG, width=1.5)
    if os.path.exists(hero_img_path):
        page.insert_image(pymupdf.Rect(155, 395, 440, 635), filename=hero_img_path)

    page.draw_rect(pymupdf.Rect(56, 680, 539, 775), color=NAVY_LIGHT, fill=NAVY_DARK, width=1)
    page.insert_textbox(
        pymupdf.Rect(70, 690, 525, 720),
        "CENTRAL DE VENTAS Y COTIZACIONES (UNIDAD Y POR MAYOR CON RUC)",
        fontsize=9.5,
        fontname="hebo",
        color=GOLD_ACCENT,
        align=pymupdf.TEXT_ALIGN_CENTER,
    )
    page.insert_textbox(
        pymupdf.Rect(70, 714, 525, 748),
        "WhatsApp Oficial: +51 910 363 522  |  Correo: wha.Mountain@gmail.com",
        fontsize=12,
        fontname="hebo",
        color=WHITE,
        align=pymupdf.TEXT_ALIGN_CENTER,
    )
    page.insert_textbox(
        pymupdf.Rect(70, 744, 525, 774),
        "Tela Hipora Impermeable  |  Thinsulate 3M  |  Termoreflectivo  |  Cinta 3M  |  Cierres REY",
        fontsize=9,
        fontname="helv",
        color=BONE_BG,
        align=pymupdf.TEXT_ALIGN_CENTER,
    )


def build_catalog_pdf(filename, title, subtitle, item_list, hero_img):
    doc = pymupdf.open()
    draw_cover_page(
        doc,
        title=title,
        subtitle=subtitle,
        count_text=f"{len(item_list)} MODELOS OFICIALES",
        hero_img_path=hero_img,
    )

    for i in range(0, len(item_list), 2):
        page = doc.new_page(width=595, height=842)
        page.draw_rect(pymupdf.Rect(0, 0, 595, 842), color=None, fill=BONE_BG)

        # Top Navy Header Strip
        page.draw_rect(pymupdf.Rect(0, 0, 595, 52), color=None, fill=NAVY_DARK)
        page.insert_textbox(
            pymupdf.Rect(32, 16, 400, 48),
            clean_pdf_text(f"WHA MOUNTAIN PERÚ  |  {title.upper()}"),
            fontsize=10.5,
            fontname="hebo",
            color=WHITE,
        )
        page.insert_textbox(
            pymupdf.Rect(380, 16, 563, 48),
            "Pedidos WhatsApp: 910 363 522",
            fontsize=10,
            fontname="hebo",
            color=GOLD_ACCENT,
            align=pymupdf.TEXT_ALIGN_RIGHT,
        )

        batch = item_list[i : i + 2]
        for idx, prod in enumerate(batch):
            top_y = 72 if idx == 0 else 442
            card_rect = pymupdf.Rect(32, top_y, 563, top_y + 345)
            page.draw_rect(card_rect, color=STONE_BORDER, fill=BONE_CARD, width=1.2)

            # Left Image Studio Box
            img_box = pymupdf.Rect(46, top_y + 16, 260, top_y + 329)
            page.draw_rect(img_box, color=STONE_BORDER, fill=BONE_BG, width=0.8)

            prim_img = os.path.join(
                PRODUCTS_IMG_DIR, os.path.basename(prod["primaryImage"])
            )
            if os.path.exists(prim_img):
                page.insert_image(
                    pymupdf.Rect(56, top_y + 26, 250, top_y + 319), filename=prim_img
                )

            # Code Badge
            code_box = pymupdf.Rect(278, top_y + 18, 372, top_y + 48)
            page.draw_rect(code_box, color=None, fill=NAVY_DARK)
            page.insert_textbox(
                pymupdf.Rect(278, top_y + 24, 372, top_y + 54),
                f"CÓD: {prod['code']}",
                fontsize=11,
                fontname="hebo",
                color=WHITE,
                align=pymupdf.TEXT_ALIGN_CENTER,
            )

            # Temp Rating Badge
            temp_box = pymupdf.Rect(380, top_y + 18, 545, top_y + 48)
            page.draw_rect(temp_box, color=STONE_BORDER, fill=BONE_BG, width=0.8)
            page.insert_textbox(
                pymupdf.Rect(382, top_y + 25, 543, top_y + 52),
                clean_pdf_text(f"Rango: {prod['tempRating']}"),
                fontsize=8.5,
                fontname="hebo",
                color=NAVY_MID,
                align=pymupdf.TEXT_ALIGN_CENTER,
            )

            # Title
            page.insert_textbox(
                pymupdf.Rect(278, top_y + 56, 548, top_y + 108),
                clean_pdf_text(prod["title"]),
                fontsize=12.5,
                fontname="hebo",
                color=NAVY_DARK,
            )

            # Technical metadata table
            meta_y = top_y + 108
            page.draw_rect(
                pymupdf.Rect(278, meta_y, 545, meta_y + 62),
                color=STONE_BORDER,
                fill=BONE_BG,
                width=0.7,
            )
            meta_text = clean_pdf_text(
                f"- Tela Principal: {prod['fabric']}\n"
                f"- Nivel Térmico: {prod['thermal']}\n"
                f"- Reflectivo: {prod['reflective']}  |  Tallas: S, M, L, XL, XXL"
            )
            page.insert_textbox(
                pymupdf.Rect(286, meta_y + 8, 538, meta_y + 62),
                meta_text,
                fontsize=9,
                fontname="helv",
                color=TEXT_DARK,
            )

            # Full Description
            page.insert_textbox(
                pymupdf.Rect(278, top_y + 178, 545, top_y + 282),
                clean_pdf_text(f"Especificaciones: {prod['description']}"),
                fontsize=9.5,
                fontname="helv",
                color=TEXT_MUTED,
            )

            # Bottom Call to Action Bar inside Card
            cta_box = pymupdf.Rect(278, top_y + 290, 545, top_y + 328)
            page.draw_rect(cta_box, color=None, fill=NAVY_MID)
            page.insert_textbox(
                pymupdf.Rect(282, top_y + 300, 541, top_y + 334),
                f"COTIZAR CÓDIGO {prod['code']}  |  WhatsApp: 910 363 522",
                fontsize=9.5,
                fontname="hebo",
                color=WHITE,
                align=pymupdf.TEXT_ALIGN_CENTER,
            )

        # Page Footer
        page.draw_rect(pymupdf.Rect(0, 806, 595, 842), color=None, fill=NAVY_DARK)
        page.insert_textbox(
            pymupdf.Rect(32, 815, 440, 840),
            "WHA MOUNTAIN PERÚ  |  Envíos a Nivel Nacional  |  Confección y Bordado Corporativo (RUC)",
            fontsize=8.5,
            fontname="helv",
            color=BONE_BG,
        )
        page.insert_textbox(
            pymupdf.Rect(440, 815, 563, 840),
            f"Página {(i // 2) + 2}",
            fontsize=8.5,
            fontname="hebo",
            color=GOLD_ACCENT,
            align=pymupdf.TEXT_ALIGN_RIGHT,
        )

    out_file = os.path.join(OUT_PDF_DIR, filename)
    doc.save(out_file, garbage=4, deflate=True)
    doc.close()
    print(f"Saved: {out_file} ({len(item_list)} products)")


build_catalog_pdf(
    "Catalogo_WHA_MOUNTAIN_Completo_2026.pdf",
    "Catálogo General 2026",
    "Colección Completa de Casacas Térmicas, Chalecos Geólogos, Mamelucos y Pantalones para Minería y Alta Montaña",
    products,
    os.path.join(PRODUCTS_IMG_DIR, "cas-02.png"),
)

casacas = [p for p in products if p["category"] == "Casacas"]
build_catalog_pdf(
    "Catalogo_WHA_MOUNTAIN_Casacas.pdf",
    "Catálogo de Casacas Térmicas",
    "Línea Extrema (-20°C) en Hipora Impermeable, Hipora Oxford, Softshell y Taslan con Thinsulate 3M y Termoreflectivo",
    casacas,
    os.path.join(PRODUCTS_IMG_DIR, "cas-33.png"),
)

chalecos = [p for p in products if p["category"] == "Chalecos"]
build_catalog_pdf(
    "Catalogo_WHA_MOUNTAIN_Chalecos.pdf",
    "Catálogo de Chalecos Técnicos",
    "Chalecos para Geólogos, Ingenieros y Supervisores en Drill 100% Algodón Nuevo Mundo, Taslan e Hipora Impermeable con Cinta 3M",
    chalecos,
    os.path.join(PRODUCTS_IMG_DIR, "ch-01.png"),
)

mamelucos = [p for p in products if p["category"] == "Mamelucos y Conjuntos"]
build_catalog_pdf(
    "Catalogo_WHA_MOUNTAIN_Mamelucos.pdf",
    "Catálogo de Mamelucos y Conjuntos",
    "Protección Integral para Socavón, Tajo Abierto y Frío Extremo en Hipora Oxford Thinsulate 3M y Drill Nuevo Mundo",
    mamelucos,
    os.path.join(PRODUCTS_IMG_DIR, "m-03.png"),
)

pantalones = [p for p in products if p["category"] == "Pantalones"]
build_catalog_pdf(
    "Catalogo_WHA_MOUNTAIN_Pantalones.pdf",
    "Catálogo de Pantalones Industriales",
    "Pantalones Industriales y Cargo de Alto Gramaje en Drill 100% Algodón Nuevo Mundo y Jean Denim con Cinta Reflectiva 3M",
    pantalones,
    os.path.join(PRODUCTS_IMG_DIR, "pt-03.png"),
)
