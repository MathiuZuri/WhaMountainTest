# Resumen Ejecutivo: Proyecto Web y Empresas Asociadas

Este documento detalla la estructura, giro de negocio, catálogo y arquitectura tecnológica del ecosistema digital comprendido en este repositorio, compuesto por la empresa principal **WHA MOUNTAIN PERÚ** y la empresa asociada **INNOVATAIN S.A.C.**

---

## 1. Empresa Principal: WHA MOUNTAIN PERÚ

### 1.1. Identidad y Propuesta de Valor
* **Marca:** WHA MOUNTAIN PERÚ.
* **Giro de Negocio:** Diseño, confección y distribución de **Ropa Industrial Técnica para Minería, Alta Montaña y Climas de Frío Extremo** (resistente a temperaturas de **-5°C hasta -20°C** y altitudes superiores a los **3,200 a 4,800 m.s.n.m.**).
* **Mercado Objetivo:**
  * **Corporativo B2B:** Empresas mineras, firmas contratistas, empresas de ingeniería, comités de seguridad y salud en el trabajo (SSOMA) y entidades logísticas que requieren dotación de uniformes técnicos con facturación por volumen.
  * **Personal / B2C:** Geólogos, supervisores de obra, rescatistas y profesionales de operaciones en terreno.
* **Sede y Cobertura:** Sede en **Lima, Perú**, con despacho y cobertura logística a nivel nacional mediante empresas de transporte (Arequipa, Cusco, Pasco, Junín, Áncash, Cajamarca, Puno, Moquegua, Tacna, etc.).

### 1.2. Insumos Técnicos y Certificaciones
A diferencia de los confeccionistas tradicionales, WHA MOUNTAIN basa su ventaja competitiva en insumos de marcas y estándares reconocidos:
* **Telas Técnicas:** 
  * *Hipora® Impermeable y Transpirable:* Repele el agua y nieve mientras disipa el sudor.
  * *Oxford Industrial 100% Nylon/Poliéster:* Alta resistencia al desgarro y la abrasión.
  * *Softshell Térmico y Cortaviento:* Flexibilidad y confort ergonómico.
  * *Drill Nuevo Mundo (100% Algodón):* Durabilidad y respirabilidad para chalecos de ingeniería.
* **Aislamiento Térmico:**
  * *Thinsulate™ de 3M:* Microfibras de alta retención térmica sin volumen excesivo.
  * *Paneles Termorreflectivos:* Membrana interna aluminizada que devuelve el calor corporal.
  * *Forro Micropolar Antialérgico:* Aislamiento suave en contacto con el cuerpo.
* **Seguridad y Visibilidad:**
  * *Cintas Reflectivas 3M Scotchlite (2 pulgadas):* Cumplimiento con la normativa minera peruana (**D.S. 024-2016-EM**).
* **Fornitura:**
  * Cierres industriales originales **REY** con tapacierre hermético y velcro de alta adherencia.
* **Personalización Institucional:**
  * Servicio de bordado computarizado de alta precisión y estampado/transfer reflectivo para logos corporativos.

### 1.3. Canales Oficiales de Contacto
* **WhatsApp de Cotizaciones:** [+51 910 363 522](https://wa.me/51910363522)
* **Correo Electrónico:** `wha.Mountain@gmail.com`
* **Facebook Oficial:** [WHA MOUNTAIN en Facebook](https://www.facebook.com/profile.php?id=100092635841171)

---

## 2. Catálogo Estructurado (`DATA DEL CLIENTE`)

A partir de la data base y el catálogo general del cliente se tiene estructurado un total de **79 productos técnicos codificados**:

| Categoría | Rango de Códigos | Cantidad | Descripción General |
| :--- | :--- | :---: | :--- |
| **Casacas Técnicas** | `CAS-01` al `CAS-63` | 63 modelos | Casacas impermeables en Hipora®, térmicas con Thinsulate 3M, forros termorreflectivos, modelos reversibles y corporativos. |
| **Chalecos Industriales** | `CH-01` al `CH-06` | 6 modelos | Chalecos tipo geólogo y brigadista confeccionados en Drill Nuevo Mundo, con múltiples bolsillos y cintas 3M. |
| **Mamelucos y Conjuntos** | `M-01` al `M-07` | 7 modelos | Mamelucos térmicos enteros impermeables para frío severo (-20°C) y trabajos en minas a cielo abierto y socavón. |
| **Pantalones Industriales** | `PT-01` al `PT-03` | 3 modelos | Pantalones térmicos e impermeables con refuerzo en rodillas y cinta reflectiva. |

### Divisiones Estratégicas
1. **Línea Minería & Alta Visibilidad:** Diseñada bajo exigencias de visibilidad para operaciones en mina, plantas industriales y obras viales.
2. **Línea Alta Montaña & Ingenieros:** Modelos sobrios y ejecutivos (sin reflectivo) ideales para supervisores, ingenieros de campo y uso outdoor.

---

## 3. La Plataforma Web (`PAGINA WEB`)

### 3.1. Arquitectura y Stack Tecnológico
* **Framework:** [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
* **Herramienta de Compilación / Bundler:** [Vite 6](https://vitejs.dev/) (compilación ultrarrápida y soporte ESM)
* **Estilos y Diseño:** [Tailwind CSS 3](https://tailwindcss.com/) (diseño completamente responsivo para PC, tablets y móviles)
* **Iconografía:** [Lucide React](https://lucide.dev/)

### 3.2. Funcionalidades Principales de la Web
1. **Catálogo Interactivo con Filtrado Dinámico:**
   * Búsqueda por código de prenda (ej. `CAS-02`, `M-03`), tipo de tela, sector o nivel de frío.
   * Filtros por temperatura (-5°C, -15°C, -20°C) y material de confección.
2. **Ficha Técnica en Modal de Producto:**
   * Galería de fotos en alta definición.
   * Lista detallada de especificaciones (aislante térmico, tela externa, reflectivo, tallas S a XXL).
3. **Módulo de Cotización Múltiple (`QuoteDrawer`):**
   * El cliente o empresa puede agregar múltiples modelos, especificar cantidades y elegir si cotiza como **Persona Natural** o **Empresa (con RUC y Razón Social)**.
   * Genera y formatea automáticamente la orden de cotización para enviarla directamente a WhatsApp con un solo clic.
4. **Asesor Virtual 24/7 (`ChatbotWidget`):**
   * Chatbot integrado que responde consultas comunes: asesoría de temperaturas extremas, normativas SSOMA, tiempos de despacho por agencias (Shalom, Marvisur) y opciones de bordado.
5. **Acceso Móvil por Código QR:**
   * Script local que detecta la IP de la red Wi-Fi y genera un QR dinámico para probar y navegar la web desde cualquier celular conectado a la misma red.
6. **Optimización SEO y Seguridad:**
   * Metadatos y datos enriquecidos Schema.org (`LocalBusiness`, `ClothingStore`, `FAQPage`) para posicionamiento en Google Perú.
   * Configuración lista para despliegue en **Cloudflare Pages** con cabeceras estrictas de seguridad (HSTS, CSP, X-Frame-Options).

---

## 4. Empresa Asociada: INNOVATAIN S.A.C. (`INNOVATAIN_SAC`)

Dentro del mismo entorno de trabajo se encuentra la plataforma y recursos de una empresa aliada:

* **Razón Social:** INNOVATAIN S.A.C.
* **Ubicación:** Juliaca, Región Puno (sur del Perú).
* **Giro de Negocio:** Venta, importación y distribución de **Maquinaria Agrícola 0 KM** y repuestos originales, en alianza con **NEW HOLLAND** y motores **FPT Industrial**.
* **Líneas de Maquinaria:**
  * **Tractores 0 KM:** Series New Holland T7, T6, TL5, TT4, Workmaster y Boomer.
  * **Implementos Agrícolas:** Arados de discos, rastras pesadas, sembradoras de quinua/avena y cosechadoras de papa adaptadas a la geografía del altiplano.
  * **Motores y Grupos Electrógenos:** Generadores diésel y motores FPT Industrial para bombeo y faena continua.
  * **Repuestos y Cabinas:** Cabinas panorámicas con climatización/calefacción para afrontar las heladas puneñas y repuestos CNH originales.
* **Su Plataforma Web (`INNOVATAIN_SAC/SISTEMA_WEB`):**
  * Desarrollada en **Angular 21**.
  * Cuenta con un visualizador estilo *Glassmorphism* (diseño cristal difuminado) con maquinaria 3D flotante sin fondo, catálogo interactivo y conexión para celular mediante túnel Cloudflare (`cloudflared.exe`).

---

## 5. Resumen de Ejecución Rápida

| Proyecto | Carpeta | Tecnología | Cómo Iniciar |
| :--- | :--- | :--- | :--- |
| **WHA MOUNTAIN** | `PAGINA WEB/` | React 18 + Vite + TS | Doble clic en `INICIAR_WEB.bat` (Puerto `5173`) |
| **INNOVATAIN S.A.C.** | `INNOVATAIN_SAC/SISTEMA_WEB/` | Angular 21 + TS | Doble clic en `INNOVATAIN_SAC\INICIAR_SISTEMA_Y_TUNEL.bat` (Puerto `4200`) |

