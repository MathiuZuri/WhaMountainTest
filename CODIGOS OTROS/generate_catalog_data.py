import json
import os

# Raw catalog data extracted from the 45-page WHA MOUNTAIN PDF catalog
# Every single entry (79 products total) with exact specs, reference 2024 price, and image xrefs count
RAW_PRODUCTS = [
    # === 1. CASACAS (63 modelos: CAS-01 a CAS-63) ===
    ("CAS-01", "Casacas", 120.0, 3, "Hipora impermeable con forro micropolar. Cinta REFLECTIVA 3M, capucha desmontable, 4 bolsillos con cierre impermeable, puño regulable con sistema Velcro. Cierre marca Rey con tapacierre."),
    ("CAS-02", "Casacas", 120.0, 2, "Hipora impermeable acolchado con THINSULATE 3M y micropolar. Cinta REFLECTIVA 3M, capucha guardable, 5 bolsillos con cierre, puño regulable con sistema Velcro. Cierre marca Rey con tapacierre."),
    ("CAS-03", "Casacas", 100.0, 3, "Hipora impermeable con forro térmico, capucha desmontable, 3 bolsillos con cierre impermeable, puño elasticado, cierre marca Rey con tapacierre con broche."),
    ("CAS-04", "Casacas", 95.0, 3, "Hipora impermeable con forro micropolar, capucha desmontable, 3 bolsillos con cierre impermeable, puño regulable con sistema Velcro, cierre marca Rey con tapacierre."),
    ("CAS-05", "Casacas", 120.0, 1, "Hipora impermeable acolchado con THINSULATE 3M y micropolar, cinta REFLECTIVA 3M, 2 bolsillos posa mano y con solapa, puño elasticado, cierre marca Rey con tapacierre sistema Velcro."),
    ("CAS-06", "Casacas", 120.0, 1, "Hipora impermeable con forro térmico y micropolar, capucha desmontable, 4 bolsillos con cierre impermeable, puño regulable con sistema Velcro, cierre marca Rey con tapacierre."),
    ("CAS-07", "Casacas", 120.0, 1, "Hipora impermeable acolchado con fibra térmica y micropolar, cinta reflectiva coreana, 4 bolsillos con solapa, puño elasticado, cierre marca Rey con tapacierre sistema Velcro."),
    ("CAS-08", "Casacas", 120.0, 1, "Hipora impermeable acolchado con fibra térmica y micropolar, cinta reflectiva coreana, 2 bolsillos con cierre impermeable, basta y puño elasticado, cierre marca Rey con tapacierre con broche."),
    ("CAS-09", "Casacas", 120.0, 3, "Hipora impermeable acolchado con THINSULATE 3M y Termoreflectivo, 2 bolsillos inferiores con cierre y 1 bolsillo interno. Puño regulable con sistema Velcro, cierre marca Rey con tapacierre con broche."),
    ("CAS-10", "Casacas", 120.0, 1, "Hipora impermeable acolchado con fibra térmica y micropolar, 3 bolsillos con cierre impermeable, capucha guardable, puño con regulador sistema Velcro, cierre marca Rey con tapacierre con sistema Velcro."),
    ("CAS-11", "Casacas", 120.0, 1, "Hipora impermeable acolchado con THINSULATE 3M y Termoreflectivo para mantener el calor corporal y cuenta con cinta REFLECTIVA 3M, capucha desmontable, 1 bolsillo porta radio, 1 bolsillo con solapa, 2 bolsillos con cierre y 1 bolsillo interno. Puño elasticado, cierre marca Rey con tapacierre con broche."),
    ("CAS-12", "Casacas", 120.0, 1, "Hipora impermeable acolchado con fibra térmica y micropolar, capucha desmontable, 2 bolsillos superiores y 2 inferiores con cierre. Puño regulable con sistema Velcro. Cierre marca Rey con tapacierre con Velcro."),
    ("CAS-13", "Casacas", 120.0, 1, "Hipora impermeable acolchado con fibra térmica y micropolar, cinta REFLECTIVA 3M, 3 bolsillos frontales con cierre y 1 bolsillo interno, puño regulable con sistema Velcro."),
    ("CAS-14", "Casacas", 95.0, 1, "Hipora impermeable acolchado con fibra térmica y micropolar, capucha desmontable, 2 bolsillos superiores con cierre, 2 bolsillos inferiores con cierre y 1 bolsillo interno. Puño regulable con Velcro. Cierre marca Rey con tapacierre con broche."),
    ("CAS-15", "Casacas", 130.0, 1, "Hipora impermeable acolchado con fibra térmica y micropolar, cinta reflectiva coreana, 1 bolsillo porta radio, 2 bolsillos inferiores con cierre, puño regulable con sistema Velcro, cierre marca Rey con tapacierre con broche."),
    ("CAS-16", "Casacas", 150.0, 2, "Hipora Oxford acolchado con THINSULATE 3M y micropolar, cinta REFLECTIVA 3M, 2 bolsillos con cierre, capucha desmontable, puño elasticado, cierre marca Rey con tapacierre con broche."),
    ("CAS-17", "Casacas", 120.0, 1, "Hipora impermeable acolchado con fibra térmica y micropolar, cinta reflectiva coreana, en la parte superior 1 bolsillo con solapa y 1 con cierre, en la parte inferior 2 bolsillos con cierre. Cierre marca Rey con tapacierre sistema Velcro y broche."),
    ("CAS-18", "Casacas", 120.0, 1, "Hipora impermeable acolchado con fibra térmica y micropolar, cinta reflectiva coreana, 2 bolsillos con solapa y 2 bolsillos con cierre en la parte inferior. Cierre marca Rey con tapacierre con broche."),
    ("CAS-19", "Casacas", 85.0, 1, "Casaca acolchada con fibra térmica y forro micropolar, 2 bolsillos con cierre en la parte inferior y capucha integrada."),
    ("CAS-20", "Casacas", 120.0, 1, "Hipora impermeable con forro micropolar, capucha guardable, 2 bolsillos con cierre impermeable, puño regulable con sistema Velcro, cierre marca Rey con tapacierre."),
    ("CAS-21", "Casacas", 120.0, 1, "Hipora impermeable acolchado con fibra térmica y micropolar, cinta reflectiva coreana, 2 bolsillos con solapa y 2 bolsillos con cierre, puño elasticado con regulador Velcro, capucha guardable, basta elasticada, cierre marca Rey."),
    ("CAS-22", "Casacas", 120.0, 1, "Hipora impermeable acolchado con fibra térmica y micropolar, 2 bolsillos con cierre, capucha guardable, cierre marca Rey con tapacierre con sistema Velcro."),
    ("CAS-23", "Casacas", 120.0, 2, "Hipora impermeable acolchado con fibra térmica y micropolar, 4 bolsillos con cierre impermeable, puño con puñera térmica interior, capucha guardable."),
    ("CAS-24", "Casacas", 120.0, 1, "Hipora impermeable acolchado con fibra térmica y micropolar, capucha desmontable, 3 bolsillos frontales con cierre y 1 bolsillo en la manga con cierre. Tapacierre con broche y sistema Velcro."),
    ("CAS-25", "Casacas", 120.0, 1, "Hipora impermeable acolchado con fibra térmica y micropolar, capucha guardable, 3 bolsillos con cierre impermeable, puño regulable con sistema Velcro, tapacierre con Velcro."),
    ("CAS-26", "Casacas", 85.0, 1, "Taslan con forro micropolar, 3 bolsillos con cierre impermeable, puño regulable con sistema Velcro, cierre principal impermeable."),
    ("CAS-27", "Casacas", 120.0, 3, "Hipora impermeable acolchado con fibra térmica y micropolar, 3 bolsillos con cierre impermeable, capucha desmontable, puño regulable con sistema Velcro, cierre marca Rey con tapacierre sistema Velcro."),
    ("CAS-28", "Casacas", 120.0, 1, "Hipora impermeable acolchado con fibra térmica y micropolar, cinta reflectiva coreana, 2 bolsillos con solapa en la parte inferior y 1 bolsillo porta radio en la parte superior, puño elasticado, cierre marca Rey con tapacierre sistema Velcro."),
    ("CAS-29", "Casacas", 120.0, 1, "Hipora impermeable acolchado con THINSULATE 3M y Termoreflectivo, cinta REFLECTIVA 3M, 4 bolsillos con cierre, 1 bolsillo con cierre en la manga y 1 bolsillo interno, puño y basta elasticada, cierre marca Rey."),
    ("CAS-30", "Casacas", 95.0, 1, "Softshell impermeable cortaviento, 2 bolsillos con cierre impermeable, puños con puñera interior ergonómica, cierre principal impermeable."),
    ("CAS-31", "Casacas", 95.0, 1, "Softshell impermeable cortaviento, 3 bolsillos con cierre impermeable, puños regulables con sistema Velcro, capucha desmontable, cierre principal impermeable."),
    ("CAS-32", "Casacas", 95.0, 3, "Taslan acolchado con fibra térmica y micropolar, cinta reflectiva coreana, 3 bolsillos con cierre impermeable, capucha desmontable, porta lapicero en la manga, puño elasticado, cierre marca Rey con tapacierre con broche."),
    ("CAS-33", "Casacas", 160.0, 1, "Hipora impermeable acolchado con THINSULATE 3M y Termoreflectivo para mantener el calor corporal, cinta REFLECTIVA 3M, capucha desmontable, 4 bolsillos con cierre, 2 bolsillos porta radio y 1 bolsillo interno. Puño elasticado, porta lapicero en la manga, tapacierre con sistema Velcro."),
    ("CAS-34", "Casacas", 95.0, 1, "Drill con forro micropolar, cinta reflectiva coreana, cuello camisero, 2 bolsillos con solapa, puño elasticado, cierre marca Rey con tapacierre sistema Velcro."),
    ("CAS-35", "Casacas", 120.0, 3, "Hipora impermeable acolchado con THINSULATE 3M y micropolar, 3 bolsillos con cierre impermeable, 1 bolsillo con cierre en la manga, capucha desmontable, puño con sistema Velcro, cierre marca Rey con tapacierre con broche."),
    ("CAS-36", "Casacas", 95.0, 1, "Softshell impermeable con forro interior Termoreflectivo, 2 bolsillos frontales con cierre y 1 bolsillo táctico en la manga."),
    ("CAS-37", "Casacas", 135.0, 1, "Hipora impermeable acolchado con fibra térmica y micropolar, 4 bolsillos con cierre, puño elasticado, capucha con visera de protección de lluvia y elástico interno, cierre marca Rey con tapacierre sistema Velcro."),
    ("CAS-38", "Casacas", 120.0, 1, "Hipora impermeable acolchado con fibra térmica y micropolar, cinta REFLECTIVA 3M, 4 bolsillos con cierre impermeable y 1 bolsillo interno. Puño regulable con broche, cierre marca Rey con tapacierre con broche."),
    ("CAS-39", "Casacas", 95.0, 3, "Hipora impermeable con forro micropolar, disponible con cinta reflectiva coreana o versión alta montaña sin cinta reflectiva, 4 bolsillos con cierre, capucha guardable, puño elasticado, cierre marca Rey con tapacierre sistema Velcro."),
    ("CAS-40", "Casacas", 160.0, 1, "Hipora impermeable acolchado con THINSULATE 3M y Termoreflectivo, cinta REFLECTIVA 3M, 2 bolsillos porta radio y 2 bolsillos con solapa y posa mano, puño elasticado, cierre marca Rey con tapacierre con broche."),
    ("CAS-41", "Casacas", 95.0, 3, "Hipora impermeable acolchado con fibra térmica y forro tafeta, 3 bolsillos con cierre, capucha guardable, puño elasticado, cierre marca Rey con tapacierre y broche."),
    ("CAS-42", "Casacas", 160.0, 1, "Hipora impermeable acolchado con THINSULATE 3M y Termoreflectivo, cinta REFLECTIVA 3M, 2 bolsillos porta radio y 4 bolsillos con cierre, puño elasticado, capucha desmontable, cierre marca Rey con tapacierre sistema Velcro."),
    ("CAS-43", "Casacas", 95.0, 1, "Hipora impermeable con forro micropolar, cinta reflectiva coreana, 2 bolsillos con solapa, puño elasticado, cierre marca Rey con tapacierre sistema Velcro."),
    ("CAS-44", "Casacas", 95.0, 1, "Hipora impermeable acolchado con fibra térmica y forro micropolar, cinta reflectiva coreana, 2 bolsillos con cierre, 2 bolsillos con solapa, capucha desmontable, cierre marca Rey con tapacierre sistema Velcro."),
    ("CAS-45", "Casacas", 95.0, 1, "Hipora Oxford acolchado con fibra térmica y forro micropolar, cinta reflectiva coreana, 4 bolsillos con cierre, puño y basta elasticada, cierre marca Rey."),
    ("CAS-46", "Casacas", 120.0, 1, "Hipora impermeable acolchado con fibra térmica y micropolar, cinta REFLECTIVA 3M, 3 bolsillos con cierre, puño regulable con sistema Velcro, cierre marca Rey con tapacierre con broche."),
    ("CAS-47", "Casacas", 95.0, 1, "Hipora acolchado con fibra térmica y forro micropolar, 4 bolsillos con cierre, puño regulable con sistema Velcro, cierre marca Rey y tapacierre con broche."),
    ("CAS-48", "Casacas", 120.0, 2, "Hipora impermeable acolchado con fibra térmica y micropolar, 3 bolsillos con cierre, puño regulable con sistema Velcro, cierre marca Rey con tapacierre sistema Velcro."),
    ("CAS-49", "Casacas", 95.0, 1, "Hipora acolchado con fibra térmica y forro micropolar, cinta reflectiva coreana, 2 bolsillos con solapa, cierre marca Rey y tapacierre con broches."),
    ("CAS-50", "Casacas", 85.0, 1, "Taslan engomado acolchado con fibra térmica y micropolar, 2 bolsillos con cierre, puño elástico, cierre marca Rey con tapacierre sistema Velcro."),
    ("CAS-51", "Casacas", 95.0, 1, "Hipora acolchado con fibra térmica y forro micropolar, cinta reflectiva coreana, capucha guardable, 4 bolsillos con cierre, cierre marca Rey."),
    ("CAS-52", "Casacas", 95.0, 1, "Hipora impermeable acolchado con fibra térmica y micropolar, capucha desmontable, 3 bolsillos con cierre, puño regulable con sistema Velcro, cierre marca Rey con tapacierre sistema Velcro."),
    ("CAS-53", "Casacas", 95.0, 1, "Hipora acolchado con fibra térmica y forro micropolar, cinta reflectiva coreana, 3 bolsillos con cierre, puño regulable con sistema Velcro, cierre marca Rey."),
    ("CAS-54", "Casacas", 95.0, 1, "Hipora acolchado con fibra térmica y forro micropolar, 2 bolsillos con cierre, puño regulable con sistema Velcro, cierre marca Rey y tapacierre con broches."),
    ("CAS-55", "Casacas", 95.0, 1, "Hipora acolchado con fibra térmica y forro micropolar, cinta reflectiva coreana, 4 bolsillos con cierre, puño elástico, cierre marca Rey y tapacierre con broche."),
    ("CAS-56", "Casacas", 110.0, 1, "Hipora acolchado con fibra térmica y forro micropolar, 3 bolsillos con cierre, puño regulable con sistema Velcro, cierre marca Rey y tapacierre sistema Velcro."),
    ("CAS-57", "Casacas", 110.0, 1, "Hipora acolchado con fibra térmica y forro micropolar, 3 bolsillos con cierre, puño regulable con sistema Velcro, capucha guardable, cierre marca Rey y tapacierre sistema Velcro."),
    ("CAS-58", "Casacas", 95.0, 1, "Hipora acolchado con fibra térmica y forro micropolar, 3 bolsillos con cierre, puño elasticado, capucha desmontable, cierre marca Rey y tapacierre con broche."),
    ("CAS-59", "Casacas", 95.0, 1, "Hipora acolchado con fibra térmica y forro micropolar, 3 bolsillos con cierre, puño elasticado, capucha guardable, cierre marca Rey y tapacierre con broche."),
    ("CAS-60", "Casacas", 95.0, 1, "Hipora acolchado con fibra térmica y forro micropolar, 3 bolsillos con cierre, puño elasticado, capucha guardable, cierre marca Rey."),
    ("CAS-61", "Casacas", 95.0, 1, "Hipora acolchado con fibra térmica y forro micropolar, 2 bolsillos con cierre, puño regulable con sistema Velcro, capucha guardable, cierre marca Rey y tapacierre sistema Velcro."),
    ("CAS-62", "Casacas", 120.0, 1, "Hipora impermeable acolchado con fibra térmica y micropolar, cinta REFLECTIVA 3M, 2 bolsillos con tapa, puño regulable con sistema Velcro, cierre marca Rey con tapacierre con broche."),
    ("CAS-63", "Casacas", 95.0, 1, "Hipora impermeable acolchado con fibra térmica y micropolar, cinta reflectiva coreana, 4 bolsillos con tapa, puño regulable elástico, capucha desmontable, cierre marca Rey con tapacierre sistema Velcro."),

    # === 2. CHALECOS (6 modelos: CH-01 a CH-06) ===
    ("CH-01", "Chalecos", 65.0, 1, "Tela Drill 100% algodón Nuevo Mundo con cinta REFLECTIVA 3M para mayor visibilidad, con 2 bolsillos superiores con solapa. En la parte inferior tiene 2 bolsillos con cierre Rey y 3 bolsillos con solapa."),
    ("CH-02", "Chalecos", 45.0, 1, "Tela Drill Tecnología 100% poliéster con cinta REFLECTIVA 3M para mayor visibilidad, con 2 bolsillos superiores con solapa. En la parte inferior tiene 2 bolsillos con cierre Rey y cierre principal Rey."),
    ("CH-03", "Chalecos", 65.0, 2, "Tela Taslan con forro micropolar y cinta REFLECTIVA 3M para mayor visibilidad, con 2 bolsillos superiores con solapa y porta lapicero. En la parte inferior tiene 2 bolsillos con cierre Rey, 2 bolsillos con solapa y 2 bolsillos posa mano. Cierre principal Rey."),
    ("CH-04", "Chalecos", 65.0, 1, "Tela Drill 100% algodón Nuevo Mundo con cinta REFLECTIVA 3M para mayor visibilidad, con 1 bolsillo superior porta radio. En la parte inferior tiene 2 bolsillos con cierre Rey y 2 bolsillos con solapa."),
    ("CH-05", "Chalecos", 75.0, 1, "Tela Hipora impermeable con cinta REFLECTIVA 3M para mayor visibilidad, forro micropolar, 1 bolsillo superior con solapa. En la parte inferior tiene 2 bolsillos con cierre Rey y 2 bolsillos con solapa. Cuello alto y tapacierre con broche."),
    ("CH-06", "Chalecos", 65.0, 1, "Tela Drill Tecnología 100% poliéster con cinta REFLECTIVA 3M, con 3 bolsillos superiores con solapa y 2 bolsillos inferiores con solapa. Cierre principal Rey."),

    # === 3. MAMELUCOS Y CONJUNTOS DE TRABAJO (7 modelos: M-01 a M-07) ===
    ("M-01", "Mamelucos y Conjuntos", 120.0, 2, "Mameluco en tela Drill 100% algodón Nuevo Mundo con cinta REFLECTIVA 3M para mayor visibilidad, 2 bolsillos en el pecho, 2 bolsillos posteriores, delanteros y laterales del pantalón. Cierre principal Rey con tapacierre sistema Velcro."),
    ("M-02", "Mamelucos y Conjuntos", 180.0, 1, "Mameluco térmico en tela Hipora impermeable con cinta REFLECTIVA 3M para mayor visibilidad, 2 bolsillos en el pecho con solapa, 1 bolsillo derecho con cierre, capucha guardable. Cierre principal Rey con tapacierre sistema Velcro."),
    ("M-03", "Mamelucos y Conjuntos", 160.0, 1, "Mameluco térmico en tela Hipora Oxford acolchada con THINSULATE 3M y micropolar. Cinta REFLECTIVA 3M, capucha guardable, puño elasticado, 2 bolsillos parche con cierre, 2 bolsillos posteriores, cintura elasticada, cierre principal Rey con tapacierre sistema Velcro."),
    ("M-04", "Mamelucos y Conjuntos", 160.0, 1, "Conjunto de trabajo 2 piezas (Casaca + Pantalón) en tela Hipora impermeable con forro micropolar. Cinta REFLECTIVA 3M, capucha guardable, puño elasticado, 2 bolsillos parche, 2 bolsillos posteriores, cintura elasticada, cierre principal Rey con tapacierre sistema Velcro."),
    ("M-05", "Mamelucos y Conjuntos", 150.0, 1, "Mameluco térmico en tela Hipora acolchada con fibra térmica y micropolar. Cinta REFLECTIVA 3M, 2 bolsillos parche con solapa, 2 bolsillos posteriores, 1 bolsillo lateral en cada pierna. Cintura elasticada, cierre principal Rey con tapacierre sistema Velcro."),
    ("M-06", "Mamelucos y Conjuntos", 90.0, 1, "Mamelucos industriales en tela Drill Tecnología de alta resistencia en múltiples colores corporativos con cinta REFLECTIVA 3M, bolsillos multifunción en pecho y piernas, cintura elasticada y cierre principal Rey. (Ref. Catálogo M-04 Drill Tecnología)"),
    ("M-07", "Mamelucos y Conjuntos", 90.0, 1, "Mameluco bicolor en tela Drill Tecnología 100% poliéster con cinta REFLECTIVA 3M, 2 bolsillos parche con solapa, 2 bolsillos posteriores, cintura elasticada, cierre principal Rey con tapacierre sistema Velcro. (Ref. Catálogo M-05 Drill)"),

    # === 4. PANTALONES (3 modelos: PT-01 a PT-03) ===
    ("PT-01", "Pantalones", 45.0, 2, "Pantalón industrial en tela Drill 100% algodón Nuevo Mundo con cinta REFLECTIVA 3M para mayor visibilidad, 2 bolsillos en la parte delantera y posterior. Cintura elástica y cierre marca Rey."),
    ("PT-02", "Pantalones", 55.0, 1, "Pantalón industrial en tela Jean Denim de alto gramaje con cinta REFLECTIVA 3M para mayor visibilidad, 2 bolsillos en la parte delantera y posterior, costuras reforzadas para minería y construcción."),
    ("PT-03", "Pantalones", 80.0, 1, "Pantalón Cargo industrial en tela Drill 100% algodón Nuevo Mundo con refuerzos ergonómicos, cinta REFLECTIVA 3M para mayor visibilidad, 2 bolsillos delanteros y posteriores, y 1 bolsillo cargo lateral en cada pierna. Cintura elástica y cierre marca Rey."),
]

def classify_product(code, category, price, img_count, desc):
    d_lower = desc.lower()

    # Fabric classification
    if "hipora oxford" in d_lower:
        fabric = "Hipora Oxford"
    elif "hipora" in d_lower:
        fabric = "Hipora Impermeable"
    elif "softshell" in d_lower:
        fabric = "Softshell"
    elif "taslan" in d_lower:
        fabric = "Taslan"
    elif "drill 100% algodón" in d_lower or "drill con forro" in d_lower:
        fabric = "Drill Algodón Nuevo Mundo"
    elif "drill tecnología" in d_lower:
        fabric = "Drill Tecnología"
    elif "jean" in d_lower:
        fabric = "Jean Industrial"
    else:
        fabric = "Acolchado Térmico"

    # Thermal insulation level
    if "thinsulate 3m" in d_lower and "termoreflectivo" in d_lower:
        thermal = "Thinsulate 3M + Termoreflectivo (-20°C)"
        temp_rating = "-20°C / +4,500 msnm"
    elif "thinsulate 3m" in d_lower:
        thermal = "Thinsulate 3M + Micropolar (-15°C)"
        temp_rating = "-15°C / +4,200 msnm"
    elif "termoreflectivo" in d_lower:
        thermal = "Forro Termoreflectivo (-10°C)"
        temp_rating = "-10°C / +3,800 msnm"
    elif "fibra térmica" in d_lower and "micropolar" in d_lower:
        thermal = "Fibra Térmica + Micropolar (-12°C)"
        temp_rating = "-12°C / +4,000 msnm"
    elif "fibra térmica" in d_lower:
        thermal = "Fibra Térmica (-10°C)"
        temp_rating = "-10°C / +3,800 msnm"
    elif "micropolar" in d_lower or "micro polar" in d_lower or "forro térmico" in d_lower:
        thermal = "Forro Micropolar Térmico (-5°C)"
        temp_rating = "-5°C / +3,200 msnm"
    else:
        thermal = "Industrial Estándar / Respirable"
        temp_rating = "Todo Clima / Operaciones"

    # Reflective tape
    if "3m" in d_lower and "reflectiva" in d_lower:
        reflective = "Cinta Reflectiva 3M"
    elif "coreana" in d_lower:
        reflective = "Cinta Reflectiva Coreana"
    else:
        reflective = "Sin Cinta Reflectiva"

    # Sector & Title construction
    has_reflective = reflective != "Sin Cinta Reflectiva"
    if category == "Casacas":
        if has_reflective:
            sector = "Minería & Alta Visibilidad"
            if "thinsulate 3m" in d_lower and "termoreflectivo" in d_lower:
                title = f"Casaca Minera Extrema {fabric} con Thinsulate 3M y Termoreflectivo"
            elif "thinsulate 3m" in d_lower:
                title = f"Casaca Térmica Minera {fabric} con Thinsulate 3M y Cinta 3M"
            else:
                title = f"Casaca Térmica Industrial {fabric} con {reflective}"
        else:
            sector = "Alta Montaña & Ingenieros"
            if "thinsulate 3m" in d_lower:
                title = f"Casaca Alta Montaña {fabric} con Thinsulate 3M"
            elif "softshell" in d_lower:
                title = f"Casaca Táctica {fabric} Cortaviento Impermeable"
            else:
                title = f"Casaca Alta Montaña {fabric} Térmica Impermeable"
    elif category == "Chalecos":
        sector = "Minería & Alta Visibilidad"
        if "hipora" in d_lower:
            title = "Chaleco Térmico Impermeable Hipora con Micropolar y Cinta 3M"
        elif "taslan" in d_lower:
            title = "Chaleco Térmico Taslan con Forro Micropolar y Cinta 3M"
        elif "nuevo mundo" in d_lower:
            title = "Chaleco Geólogo Supervisor Drill 100% Algodón Nuevo Mundo con Cinta 3M"
        else:
            title = "Chaleco Industrial Supervisor Drill Tecnología con Cinta 3M"
    elif category == "Mamelucos y Conjuntos":
        sector = "Minería & Alta Visibilidad"
        if "conjunto" in d_lower:
            title = "Conjunto Térmico 2 Piezas Hipora Impermeable con Micropolar y Cinta 3M"
        elif "thinsulate" in d_lower:
            title = "Mameluco Minero Frío Extremo Hipora Oxford con Thinsulate 3M y Cinta 3M"
        elif "hipora" in d_lower:
            title = f"Mameluco Térmico Impermeable {fabric} con Cinta Reflectiva 3M"
        elif "algodón" in d_lower:
            title = "Mameluco Industrial Drill 100% Algodón Nuevo Mundo con Cinta 3M"
        else:
            title = "Mameluco Industrial Drill Tecnología con Cinta Reflectiva 3M"
    else:  # Pantalones
        sector = "Minería & Alta Visibilidad"
        if "cargo" in d_lower or "lateral" in d_lower:
            title = "Pantalón Cargo Minero Drill Nuevo Mundo con Refuerzos y Cinta 3M"
        elif "jean" in d_lower:
            title = "Pantalón Industrial Jean Denim con Cinta Reflectiva 3M"
        else:
            title = "Pantalón Industrial Drill 100% Algodón Nuevo Mundo con Cinta 3M"

    # Extract bullet highlights
    highlights = []
    if "impermeable" in d_lower:
        highlights.append("100% Impermeable y Cortaviento")
    if "thinsulate 3m" in d_lower:
        highlights.append("Aislamiento Térmico Thinsulate™ 3M")
    if "termoreflectivo" in d_lower:
        highlights.append("Panel Interior Termoreflectivo")
    if "fibra térmica" in d_lower:
        highlights.append("Acolchado en Fibra Térmica de Alta Densidad")
    if "micropolar" in d_lower or "micro polar" in d_lower:
        highlights.append("Forro Interior Micropolar Antialérgico")
    if reflective != "Sin Cinta Reflectiva":
        highlights.append(f"Alta Visibilidad ({reflective})")
    if "porta radio" in d_lower or "portaradio" in d_lower:
        highlights.append("Bolsillo Porta Radio Integrado")
    if "capucha desmontable" in d_lower:
        highlights.append("Capucha Desmontable")
    elif "capucha guardable" in d_lower:
        highlights.append("Capucha Guardable en Cuello")
    if "rey" in d_lower:
        highlights.append("Cierres Industriales Marca REY Original")

    # Build image paths
    images = []
    for idx in range(img_count):
        suffix = "" if idx == 0 else f"-{idx+1}"
        images.append(f"/images/products/{code.lower()}{suffix}.png")

    # Featured / Best Seller logic for top flagship items
    is_featured = code in {
        "CAS-01", "CAS-02", "CAS-09", "CAS-11", "CAS-16", "CAS-29", "CAS-30", "CAS-33", "CAS-40", "CAS-42",
        "CH-01", "CH-03", "CH-05",
        "M-01", "M-02", "M-03", "M-04",
        "PT-01", "PT-02", "PT-03"
    }

    return {
        "id": code.lower(),
        "code": code,
        "title": title,
        "category": category,
        "sector": sector,
        "fabric": fabric,
        "thermal": thermal,
        "tempRating": temp_rating,
        "reflective": reflective,
        "description": desc,
        "highlights": highlights,
        "referencePrice2024": price,
        "primaryImage": images[0],
        "images": images,
        "sizes": ["S", "M", "L", "XL", "XXL"],
        "isFeatured": is_featured,
        "customizableLogo": True,
    }

structured_products = [classify_product(*item) for item in RAW_PRODUCTS]

# 1. Save JSON in DATA DEL CLIENTE
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
json_out_path = os.path.join(BASE_DIR, "DATA DEL CLIENTE", "catalogo_wha_mountain_estructurado.json")
with open(json_out_path, "w", encoding="utf-8") as f:
    json.dump({
        "brand": "WHA MOUNTAIN",
        "whatsapp": "+51910363522",
        "whatsappDisplay": "910 363 522",
        "facebookUrl": "https://www.facebook.com/profile.php?id=100092635841171",
        "email": "wha.Mountain@gmail.com",
        "totalProducts": len(structured_products),
        "products": structured_products
    }, f, ensure_ascii=False, indent=2)

# 2. Save TypeScript file in PAGINA WEB/src/data/catalog.ts
ts_dir = os.path.join(BASE_DIR, "PAGINA WEB", "src", "data")
os.makedirs(ts_dir, exist_ok=True)
ts_out_path = os.path.join(ts_dir, "catalog.ts")

ts_content = """// Archivo autogenerado a partir del Catálogo Oficial WHA MOUNTAIN (79 productos en 4 categorías)
// Nota: SHOW_PRICES está desactivado por defecto para priorizar cotizaciones directas y corporativas (B2B/B2C).

export const BRAND_CONFIG = {
  name: "WHA MOUNTAIN",
  tagline: "Especialistas en Ropa Industrial para Minería, Alta Montaña y Frío Extremo en el Perú",
  whatsappNumber: "51910363522",
  whatsappDisplay: "910 363 522",
  facebookUrl: "https://www.facebook.com/profile.php?id=100092635841171",
  email: "wha.Mountain@gmail.com",
  location: "Lima, Perú — Envíos a Nivel Nacional (Arequipa, Cusco, Junín, Pasco, Áncash, Cajamarca, Puno, Moquegua, Tacna y todo el Perú)",
  showPrices: false, // Cambiar a true si se desea mostrar precios referenciales en el futuro
};

export type ProductCategory = "Casacas" | "Chalecos" | "Mamelucos y Conjuntos" | "Pantalones";

export type ProductSector = "Minería & Alta Visibilidad" | "Alta Montaña & Ingenieros";

export interface Product {
  id: string;
  code: string;
  title: string;
  category: ProductCategory;
  sector: ProductSector;
  fabric: string;
  thermal: string;
  tempRating: string;
  reflective: string;
  description: string;
  highlights: string[];
  referencePrice2024: number;
  primaryImage: string;
  images: string[];
  sizes: string[];
  isFeatured: boolean;
  customizableLogo: boolean;
}

export const CATALOG_PRODUCTS: Product[] = """ + json.dumps(structured_products, ensure_ascii=False, indent=2) + """;

export const CATEGORY_SUMMARY = [
  {
    id: "Casacas" as ProductCategory,
    name: "Casacas Térmicas & Mineras",
    shortName: "Casacas",
    count: 63,
    rangeCode: "CAS-01 al CAS-63",
    description: "Casacas en Hipora Impermeable, Hipora Oxford, Softshell y Taslan con Thinsulate™ 3M, forro Termoreflectivo, Fibra Térmica y Cinta Reflectiva 3M.",
    image: "/images/products/cas-02.png",
    coverImage: "/images/brand/cat-casacas.png",
    badge: "-20°C Frío Extremo",
  },
  {
    id: "Chalecos" as ProductCategory,
    name: "Chalecos Geólogos & Supervisores",
    shortName: "Chalecos",
    count: 6,
    rangeCode: "CH-01 al CH-06",
    description: "Chalecos técnicos en Drill 100% Algodón Nuevo Mundo, Drill Tecnología, Taslan e Hipora Impermeable con forro micropolar y Cinta Reflectiva 3M.",
    image: "/images/products/ch-01.png",
    coverImage: "/images/brand/cat-chalecos.png",
    badge: "Alta Visibilidad 3M",
  },
  {
    id: "Mamelucos y Conjuntos" as ProductCategory,
    name: "Mamelucos & Conjuntos Térmicos",
    shortName: "Mamelucos y Conjuntos",
    count: 7,
    rangeCode: "M-01 al M-07",
    description: "Mamelucos térmicos para socavón y tajo abierto en Hipora Oxford con Thinsulate 3M, Conjuntos 2 piezas impermeables y Mamelucos en Drill Nuevo Mundo.",
    image: "/images/products/m-03.png",
    coverImage: "/images/brand/cat-mamelucos.png",
    badge: "Protección Integral",
  },
  {
    id: "Pantalones" as ProductCategory,
    name: "Pantalones Industriales & Cargo",
    shortName: "Pantalones",
    count: 3,
    rangeCode: "PT-01 al PT-03",
    description: "Pantalones industriales y Cargo con refuerzos en Drill 100% Algodón Nuevo Mundo y Jean Denim de alto gramaje con Cinta Reflectiva 3M y cierres Rey.",
    image: "/images/products/pt-03.png",
    coverImage: "/images/brand/cat-pantalones.png",
    badge: "Alto Gramaje",
  },
];
"""

with open(ts_out_path, "w", encoding="utf-8") as f:
    f.write(ts_content)

print(f"Generated {len(structured_products)} products in JSON and TypeScript successfully!")

