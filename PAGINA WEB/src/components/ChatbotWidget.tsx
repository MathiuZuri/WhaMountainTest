import React, { useRef, useEffect, useState } from 'react';
import {
  X,
  Phone,
  Send,
  Sparkles,
  Plus,
  Eye,
  FileDown,
  RotateCcw,
} from 'lucide-react';
import {
  BRAND_CONFIG,
  CATALOG_PRODUCTS,
  FULL_CATALOG_PDF_URL,
  Product,
  ProductCategory,
} from '../data/catalog';
import {
  openWhatsAppOrder,
  sendWhatsAppWithProductImage,
} from '../utils/conversion';

interface ChatbotWidgetProps {
  onSelectCategory: (cat: ProductCategory | 'Todas') => void;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (
    product: Product,
    size: string,
    quantity: number,
    withLogo: boolean
  ) => void;
  onToast: (msg: string) => void;
}

interface ChatMessage {
  sender: 'bot' | 'user';
  text: string;
  recommendedProducts?: Product[];
  pdfDownload?: { label: string; url: string };
  followUpSuggestions?: string[];
}

// Mapa visual de colores reales de las prendas del catálogo WHA MOUNTAIN
const VISUAL_COLOR_CODES: Record<string, string[]> = {
  rojo: ['CAS-01', 'CAS-03', 'CAS-09', 'CAS-19', 'CAS-23', 'CAS-27', 'CAS-32', 'CAS-35', 'CAS-41', 'M-06'],
  amarillo: ['CAS-02', 'CAS-07', 'CAS-15', 'CAS-18', 'CAS-28', 'CAS-43', 'CAS-49', 'CH-02', 'CH-05', 'CH-06', 'M-04'],
  neon: ['CAS-02', 'CAS-07', 'CAS-15', 'CAS-18', 'CH-02', 'CH-05', 'CH-06'],
  fosforescente: ['CAS-02', 'CAS-07', 'CAS-15', 'CH-02', 'CH-05', 'CH-06'],
  naranja: ['CAS-05', 'CAS-08', 'CAS-11', 'CAS-16', 'CAS-17', 'CAS-21', 'CAS-33', 'CAS-40', 'CAS-42', 'CAS-44', 'CH-01', 'CH-04', 'M-02', 'M-03', 'M-05'],
  azul: ['CAS-04', 'CAS-06', 'CAS-09', 'CAS-13', 'CAS-14', 'CAS-20', 'CAS-25', 'CAS-29', 'CAS-34', 'CAS-38', 'CAS-39', 'CAS-46', 'CH-03', 'M-01', 'M-07', 'PT-01', 'PT-02', 'PT-03'],
  negro: ['CAS-03', 'CAS-10', 'CAS-12', 'CAS-22', 'CAS-24', 'CAS-26', 'CAS-30', 'CAS-31', 'CAS-36', 'CAS-37', 'CAS-47', 'CAS-48', 'CAS-52'],
  gris: ['CAS-03', 'CAS-23', 'CAS-31', 'CAS-35', 'CAS-41', 'CAS-50'],
  plomo: ['CAS-03', 'CAS-23', 'CAS-31', 'CAS-35', 'CAS-41', 'CAS-50'],
  verde: ['CAS-02', 'CAS-07', 'CH-02', 'CH-05', 'CH-06', 'M-06'],
  bicolor: ['CAS-01', 'CAS-02', 'CAS-05', 'CAS-11', 'CAS-16', 'CAS-33', 'CAS-40', 'CAS-42', 'CH-05', 'M-03', 'M-04', 'M-07'],
};

function normalizeText(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({
  onSelectCategory,
  onSelectProduct,
  onAddToCart,
  onToast,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [shownIdsHistory, setShownIdsHistory] = useState<string[]>(['cas-02', 'm-03']);
  const [lastCategoryContext, setLastCategoryContext] = useState<ProductCategory | 'Todas'>('Todas');
  const [lastProductsContext, setLastProductsContext] = useState<Product[]>(
    CATALOG_PRODUCTS.filter((p) => ['CAS-02', 'M-03'].includes(p.code))
  );

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'bot',
      text: '¡Hola! 👋 Soy el **Especialista IA de WHA MOUNTAIN**. Conozco al detalle las **79 prendas** de nuestro catálogo (telas, temperaturas, bolsillos, colores y tallas).\n\nEscríbeme con tus propias palabras qué buscas o toca una sugerencia rápida:',
      recommendedProducts: CATALOG_PRODUCTS.filter((p) =>
        ['CAS-02', 'M-03'].includes(p.code)
      ),
      followUpSuggestions: [
        'Recomiéndame casacas para -20°C',
        'Casacas sin cinta reflectiva',
        '¿Diferencia entre Hipora y Softshell?',
        'Ver chalecos y pantalones',
      ],
    },
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  const processUserQuery = (rawQuery: string) => {
    const qNorm = normalizeText(rawQuery);

    // 0. Check if user wants to add the last shown product directly from chat ("agregalo", "añadir a orden")
    if (
      (qNorm.includes('agrega') ||
        qNorm.includes('anade') ||
        qNorm.includes('añade') ||
        qNorm.includes('ponlo en mi orden') ||
        qNorm.includes('lo quiero')) &&
      lastProductsContext.length > 0
    ) {
      const target = lastProductsContext[0];
      onAddToCart(target, 'L', 1, false);
      onToast(`✅ ${target.code} agregado a tu Orden PDF.`);
      setMessages((prev) => [
        ...prev,
        { sender: 'user', text: rawQuery },
        {
          sender: 'bot',
          text: `¡Listo! He agregado **1 unidad de ${target.code} (${target.title})** en talla L a tu **Orden de Cotización PDF**.\n\n¿Deseas agregar otra prenda, ver otra categoría o descargar tu Orden en PDF?`,
          recommendedProducts: [target],
          followUpSuggestions: [
            'Muéstrame pantalones industriales',
            'Muéstrame chalecos geólogos',
            'Descargar Catálogo PDF Completo',
          ],
        },
      ]);
      return;
    }

    // 1. Check if user mentions specific product codes (e.g. "cas-02", "cas 33", "cas1", "m-03", "pt-01", "ch-05")
    const codeRegex = /\b(cas|ch|m|pt)[-\s]?0?(\d{1,2})\b/gi;
    const matchedCodes: string[] = [];
    let match: RegExpExecArray | null;
    while ((match = codeRegex.exec(qNorm)) !== null) {
      const prefix = match[1].toUpperCase();
      const num = match[2].padStart(2, '0');
      matchedCodes.push(`${prefix}-${num}`);
    }

    if (matchedCodes.length > 0) {
      const found = CATALOG_PRODUCTS.filter((p) =>
        matchedCodes.includes(p.code.toUpperCase())
      );
      if (found.length === 1) {
        const p = found[0];
        setLastProductsContext([p]);
        setLastCategoryContext(p.category);
        setMessages((prev) => [
          ...prev,
          { sender: 'user', text: rawQuery },
          {
            sender: 'bot',
            text: `Ficha técnica completa del modelo **${p.code}** (${p.title}):\n\n• **Categoría:** ${p.category} (${p.sector})\n• **Tela Exterior:** ${p.fabric}\n• **Aislamiento:** ${p.thermal}\n• **Rango Clima:** ${p.tempRating}\n• **Reflectivo:** ${p.reflective}\n• **Confección:** ${p.description}`,
            recommendedProducts: [p],
            followUpSuggestions: [
              `Agregar ${p.code} a mi Orden`,
              'Muéstrame otro modelo parecido',
              '¿En qué tallas fabrican?',
            ],
          },
        ]);
        return;
      } else if (found.length > 1) {
        setLastProductsContext(found);
        const compLines = found
          .map(
            (p) =>
              `▪ **${p.code}**: Tela *${p.fabric}* | *${p.thermal}* | *${p.reflective}*`
          )
          .join('\n');
        setMessages((prev) => [
          ...prev,
          { sender: 'user', text: rawQuery },
          {
            sender: 'bot',
            text: `Aquí tienes la comparativa directa entre **${found.map((f) => f.code).join(' vs ')}**:\n\n${compLines}\n\nAmbos cuentan con cierres industriales marca REY. ¿Cuál de ellos se adapta mejor a tu operación?`,
            recommendedProducts: found.slice(0, 3),
            followUpSuggestions: [
              `Elegir ${found[0].code} y agregar a Orden`,
              `Elegir ${found[1].code} y agregar a Orden`,
              'Cotizar por mayor con RUC',
            ],
          },
        ]);
        return;
      }
    }

    // 2. Follow-up questions about the currently shown products ("¿qué diferencia tienen?", "muéstrame otros", "¿tiene capucha?")
    if (
      qNorm.includes('diferencia') &&
      !qNorm.includes('hipora') &&
      !qNorm.includes('thinsulate') &&
      lastProductsContext.length >= 2
    ) {
      const [p1, p2] = lastProductsContext;
      setMessages((prev) => [
        ...prev,
        { sender: 'user', text: rawQuery },
        {
          sender: 'bot',
          text: `Comparando los modelos que estamos viendo (**${p1.code}** vs **${p2.code}**):\n\n• **${p1.code}**: Confeccionado en *${p1.fabric}*, aislamiento *${p1.thermal}* (${p1.tempRating}). Detalle: ${p1.description}\n\n• **${p2.code}**: Confeccionado en *${p2.fabric}*, aislamiento *${p2.thermal}* (${p2.tempRating}). Detalle: ${p2.description}`,
          recommendedProducts: [p1, p2],
          followUpSuggestions: [
            `Ver ficha grande de ${p1.code}`,
            `Ver ficha grande de ${p2.code}`,
            'Muéstrame más opciones',
          ],
        },
      ]);
      return;
    }

    if (
      qNorm.includes('otro') ||
      qNorm.includes('otra') ||
      qNorm.includes('mas modelos') ||
      qNorm.includes('mas opciones') ||
      qNorm.includes('que mas tienes') ||
      qNorm.includes('siguiente')
    ) {
      const pool = CATALOG_PRODUCTS.filter(
        (p) =>
          (lastCategoryContext === 'Todas' || p.category === lastCategoryContext) &&
          !shownIdsHistory.includes(p.id)
      );
      const nextBatch = (pool.length > 0 ? pool : CATALOG_PRODUCTS).slice(0, 3);
      setShownIdsHistory((prev) => [...prev, ...nextBatch.map((p) => p.id)]);
      setLastProductsContext(nextBatch);

      setMessages((prev) => [
        ...prev,
        { sender: 'user', text: rawQuery },
        {
          sender: 'bot',
          text: `¡Por supuesto! Aquí tienes **3 modelos adicionales** (${nextBatch.map((p) => p.code).join(', ')}) con sus especificaciones y fotos:`,
          recommendedProducts: nextBatch,
          followUpSuggestions: [
            'Muéstrame otros 3 modelos',
            '¿Cuál abriga más para nieve?',
            'Descargar Catálogo PDF',
          ],
        },
      ]);
      return;
    }

    // 3. Technical Material & Fabric Explanations
    if (
      (qNorm.includes('hipora') &&
        (qNorm.includes('softshell') ||
          qNorm.includes('taslan') ||
          qNorm.includes('drill') ||
          qNorm.includes('diferencia') ||
          qNorm.includes('que es'))) ||
      qNorm.includes('que tela') ||
      qNorm.includes('tipos de tela')
    ) {
      const sampleProds = CATALOG_PRODUCTS.filter((p) =>
        ['CAS-02', 'CAS-16', 'CAS-30'].includes(p.code)
      );
      setLastProductsContext(sampleProds);
      setMessages((prev) => [
        ...prev,
        { sender: 'user', text: rawQuery },
        {
          sender: 'bot',
          text: `Te explico la diferencia técnica entre nuestras telas principales:\n\n1. **Hipora® Impermeable (ej. CAS-02, CAS-33):** Membrana microporosa 100% impermeable al agua/nieve y cortaviento. Ideal para lluvia intensa y puna.\n2. **Hipora Oxford (ej. CAS-16, M-03):** Mayor espesor y resistencia mecánica contra roce en minería pesada, manteniendo impermeabilidad.\n3. **Softshell (ej. CAS-30, CAS-31, CAS-36):** Tela elástica, ligera, impermeable y cortaviento de corte táctico/ejecutivo para supervisión.\n4. **Drill 100% Algodón Nuevo Mundo (ej. CH-01, M-01, PT-03):** Tela industrial fresca, resistente a chispas/fricción para chalecos, mamelucos y pantalones.`,
          recommendedProducts: sampleProds,
          followUpSuggestions: [
            'Ver casacas en Hipora Oxford',
            'Ver casacas Softshell',
            'Ver prendas en Drill Nuevo Mundo',
          ],
        },
      ]);
      return;
    }

    if (
      qNorm.includes('thinsulate') &&
      (qNorm.includes('fibra') || qNorm.includes('que es') || qNorm.includes('diferencia'))
    ) {
      const sampleProds = CATALOG_PRODUCTS.filter((p) =>
        ['CAS-33', 'CAS-01'].includes(p.code)
      );
      setMessages((prev) => [
        ...prev,
        { sender: 'user', text: rawQuery },
        {
          sender: 'bot',
          text: `Diferencia entre nuestros sistemas térmicos:\n\n• **Thinsulate™ 3M + Panel Termoreflectivo (-20°C):** Es nuestra máxima tecnología para puna extrema (+4,500 msnm). Las microfibras 3M atrapan el aire caliente sin hacer la prenda pesada, y la lámina termoreflectiva rebota el calor del cuerpo (ej. **CAS-02, CAS-09, CAS-11, CAS-33, CAS-40, CAS-42, M-03**).\n• **Fibra Térmica + Micropolar (-12°C):** Excelente abrigo acolchado con forro interior suave antialérgico para sierra y lluvia (**CAS-01, CAS-07, CAS-13, CAS-38**).`,
          recommendedProducts: sampleProds,
          followUpSuggestions: [
            'Ver todos los modelos con Thinsulate 3M',
            'Ver mameluco M-03 con Thinsulate',
          ],
        },
      ]);
      return;
    }

    // 4. Greetings & General Help
    if (
      /^(hola|buenos dias|buenas tardes|buenas noches|que tal|ola|hey|saludos|ayuda)$/i.test(
        qNorm
      )
    ) {
      setMessages((prev) => [
        ...prev,
        { sender: 'user', text: rawQuery },
        {
          sender: 'bot',
          text: '¡Hola! Bienvenido a **WHA MOUNTAIN PERÚ** 🏔️.\n\nPara recomendarte los códigos exactos de nuestro catálogo de 79 prendas, cuéntame:\n¿Buscas prendas para **Minería / Trabajo con Cinta Reflectiva** o prendas para **Alta Montaña / Viajes sin Cinta Reflectiva**?',
          followUpSuggestions: [
            'Para Minería con Cinta Reflectiva 3M',
            'Para Alta Montaña sin Cinta Reflectiva',
            'Busco Mamelucos o Conjuntos Térmicos',
            'Busco Chalecos o Pantalones',
          ],
        },
      ]);
      return;
    }

    // 5. PDF Catalog Downloads
    if (
      qNorm.includes('pdf') ||
      qNorm.includes('catalogo') ||
      qNorm.includes('descargar')
    ) {
      let pdfMeta = {
        label: 'Descargar Catálogo Completo 2026 (79 Modelos)',
        url: FULL_CATALOG_PDF_URL,
      };
      if (qNorm.includes('chaleco')) {
        pdfMeta = {
          label: 'Descargar PDF de Chalecos (6 Modelos)',
          url: './catalogos/Catalogo_WHA_MOUNTAIN_Chalecos.pdf',
        };
      } else if (qNorm.includes('mameluco')) {
        pdfMeta = {
          label: 'Descargar PDF de Mamelucos (7 Modelos)',
          url: './catalogos/Catalogo_WHA_MOUNTAIN_Mamelucos.pdf',
        };
      } else if (qNorm.includes('pantalon')) {
        pdfMeta = {
          label: 'Descargar PDF de Pantalones (3 Modelos)',
          url: './catalogos/Catalogo_WHA_MOUNTAIN_Pantalones.pdf',
        };
      } else if (qNorm.includes('casaca')) {
        pdfMeta = {
          label: 'Descargar PDF de Casacas Térmicas (63 Modelos)',
          url: './catalogos/Catalogo_WHA_MOUNTAIN_Casacas.pdf',
        };
      }

      setMessages((prev) => [
        ...prev,
        { sender: 'user', text: rawQuery },
        {
          sender: 'bot',
          text: '¡Claro! Hemos preparado catálogos PDF editoriales con fichas técnicas completas y fotos en alta definición. Haz clic en el botón dorado de abajo para descargarlo al instante:',
          pdfDownload: pdfMeta,
          followUpSuggestions: [
            'Descargar PDF de Casacas',
            'Descargar PDF de Mamelucos',
            'Descargar PDF de Chalecos',
          ],
        },
      ]);
      return;
    }

    // 6. Color Search (Rojo, Naranja, Amarillo/Neón, Azul, Negro, Gris, Bicolor)
    for (const [colorName, codes] of Object.entries(VISUAL_COLOR_CODES)) {
      if (qNorm.includes(colorName)) {
        let matchedColorProds = CATALOG_PRODUCTS.filter((p) =>
          codes.includes(p.code)
        );
        if (qNorm.includes('chaleco')) {
          matchedColorProds = matchedColorProds.filter((p) => p.category === 'Chalecos');
        } else if (qNorm.includes('mameluco')) {
          matchedColorProds = matchedColorProds.filter(
            (p) => p.category === 'Mamelucos y Conjuntos'
          );
        } else if (qNorm.includes('casaca')) {
          matchedColorProds = matchedColorProds.filter((p) => p.category === 'Casacas');
        }

        if (matchedColorProds.length > 0) {
          const top = matchedColorProds.slice(0, 3);
          setLastProductsContext(top);
          setMessages((prev) => [
            ...prev,
            { sender: 'user', text: rawQuery },
            {
              sender: 'bot',
              text: `Aquí tienes nuestros modelos destacados en tono **${colorName.toUpperCase()}** (${top.map((p) => p.code).join(', ')}).\n\n*Nota:* Para pedidos al por mayor también confeccionamos en la combinación de colores corporativos de tu empresa:`,
              recommendedProducts: top,
              followUpSuggestions: [
                'Muéstrame otros modelos',
                '¿Hacen bordado de logo?',
                'Ver en color azul marino',
              ],
            },
          ]);
          return;
        }
      }
    }

    // 7. Sizes, Location, RUC, Wholesale, Shipping
    if (qNorm.includes('talla') || qNorm.includes('medida') || qNorm.includes('xxl')) {
      setMessages((prev) => [
        ...prev,
        { sender: 'user', text: rawQuery },
        {
          sender: 'bot',
          text: 'Trabajamos con **molde industrial peruano** (con holgura cómoda para usar ropa interior térmica debajo):\n• **S** (Pecho 96-100 cm)\n• **M** (Pecho 102-106 cm)\n• **L** (Pecho 108-112 cm — *La más pedida*)\n• **XL** (Pecho 114-118 cm)\n• **XXL** (Pecho 120-126 cm)\n\nPara pedidos corporativos podemos confeccionar tallas especiales **3XL**. ¿Qué prenda deseas cotizar?',
          followUpSuggestions: [
            'Ver casacas más pedidas',
            'Ver mamelucos térmicos',
            'Cotizar por mayor con RUC',
          ],
        },
      ]);
      return;
    }

    if (
      qNorm.includes('precio') ||
      qNorm.includes('cuanto cuesta') ||
      qNorm.includes('cotiza') ||
      qNorm.includes('mayor') ||
      qNorm.includes('ruc') ||
      qNorm.includes('factura') ||
      qNorm.includes('bordado')
    ) {
      setMessages((prev) => [
        ...prev,
        { sender: 'user', text: rawQuery },
        {
          sender: 'bot',
          text: 'Atendemos tanto **por unidad** como **al por mayor para empresas (con Factura Electrónica RUC 20/10 y bordado computarizado de logos)**.\n\nPara darte el mejor precio actualizado según la cantidad que requieras:\n1. Toca **"+ Orden"** en las prendas que te gusten para descargar tu **Orden de Cotización en PDF con fotos**, o\n2. Presiona **"Pedir c/ Foto"** para enviarnos la tarjeta visual de la prenda directo al WhatsApp **910 363 522**.',
          recommendedProducts: lastProductsContext.slice(0, 2),
          followUpSuggestions: [
            'Ver casacas para minería',
            'Ver chalecos para supervisores',
            'Hablar con un asesor en WhatsApp',
          ],
        },
      ]);
      return;
    }

    // 8. Multi-Attribute Semantic Product Search across all 79 items
    const wantsNoReflective =
      qNorm.includes('sin cinta') ||
      qNorm.includes('sin reflectiv') ||
      qNorm.includes('urbano') ||
      qNorm.includes('ejecutiv') ||
      qNorm.includes('viaje') ||
      qNorm.includes('trekking') ||
      qNorm.includes('alta montana') ||
      qNorm.includes('turismo') ||
      qNorm.includes('calle');

    const wantsReflective =
      !wantsNoReflective &&
      (qNorm.includes('mineria') ||
        qNorm.includes('mina') ||
        qNorm.includes('reflectiv') ||
        qNorm.includes('3m') ||
        qNorm.includes('obra') ||
        qNorm.includes('construccion'));

    const wantsExtremeCold =
      qNorm.includes('frio') ||
      qNorm.includes('nieve') ||
      qNorm.includes('helada') ||
      qNorm.includes('puna') ||
      qNorm.includes('-20') ||
      qNorm.includes('-15') ||
      qNorm.includes('4500') ||
      qNorm.includes('5000') ||
      qNorm.includes('pasco') ||
      qNorm.includes('puno') ||
      qNorm.includes('oroya') ||
      qNorm.includes('huaraz') ||
      qNorm.includes('cusco') ||
      qNorm.includes('arequipa') ||
      qNorm.includes('junin') ||
      qNorm.includes('huancavelica') ||
      qNorm.includes('tacna') ||
      qNorm.includes('moquegua') ||
      qNorm.includes('thinsulate') ||
      qNorm.includes('termoreflectivo') ||
      qNorm.includes('abrigad');

    const wantsRadio = qNorm.includes('radio') || qNorm.includes('portaradio');
    const wantsDetachableHood = qNorm.includes('desmontable');
    const wantsChaleco =
      qNorm.includes('chaleco') || qNorm.includes('geologo') || qNorm.includes('supervisor');
    const wantsMameluco =
      qNorm.includes('mameluco') ||
      qNorm.includes('overol') ||
      qNorm.includes('conjunto') ||
      qNorm.includes('socavon') ||
      qNorm.includes('dos piezas') ||
      qNorm.includes('2 piezas');
    const wantsPantalon =
      qNorm.includes('pantalon') || qNorm.includes('jean') || qNorm.includes('cargo');
    const wantsSoftshell = qNorm.includes('softshell') || qNorm.includes('cortaviento');
    const wantsDrill = qNorm.includes('drill') || qNorm.includes('algodon') || qNorm.includes('nuevo mundo');
    const wantsOxford = qNorm.includes('oxford');
    const wantsTaslan = qNorm.includes('taslan');

    const scored = CATALOG_PRODUCTS.map((p) => {
      let score = 0;
      const pText = normalizeText(
        `${p.code} ${p.title} ${p.fabric} ${p.thermal} ${p.reflective} ${p.description}`
      );

      if (wantsChaleco) {
        if (p.category === 'Chalecos') score += 20;
        else score -= 15;
      } else if (wantsMameluco) {
        if (p.category === 'Mamelucos y Conjuntos') score += 20;
        else score -= 15;
      } else if (wantsPantalon) {
        if (p.category === 'Pantalones') score += 20;
        else score -= 15;
      } else if (qNorm.includes('casaca') || wantsExtremeCold || wantsNoReflective) {
        if (p.category === 'Casacas') score += 8;
      }

      if (wantsNoReflective) {
        if (p.reflective === 'Sin Cinta Reflectiva') score += 18;
        else score -= 15;
      }

      if (wantsReflective) {
        if (p.reflective.includes('3M')) score += 12;
        else if (p.reflective !== 'Sin Cinta Reflectiva') score += 6;
        else score -= 10;
      }

      if (wantsExtremeCold) {
        if (p.thermal.includes('Thinsulate 3M + Termoreflectivo')) score += 16;
        else if (p.thermal.includes('Thinsulate 3M')) score += 12;
        else if (p.thermal.includes('Fibra Térmica')) score += 5;
      }

      if (wantsRadio && (pText.includes('porta radio') || pText.includes('portaradio'))) {
        score += 15;
      }
      if (wantsDetachableHood && pText.includes('capucha desmontable')) {
        score += 10;
      }
      if (wantsSoftshell && p.fabric === 'Softshell') score += 18;
      if (wantsDrill && p.fabric.includes('Drill')) score += 15;
      if (wantsOxford && p.fabric.includes('Oxford')) score += 16;
      if (wantsTaslan && p.fabric.includes('Taslan')) score += 16;

      // Keyword overlap bonus for any specific words the user typed
      const words = qNorm.split(/\s+/).filter((w) => w.length >= 4);
      for (const w of words) {
        if (pText.includes(w)) score += 4;
      }

      if (p.isFeatured) score += 2;
      return { product: p, score };
    })
      .filter((item) => item.score >= 5)
      .sort((a, b) => b.score - a.score);

    if (scored.length > 0) {
      const topProducts = scored.slice(0, 3).map((s) => s.product);
      setLastProductsContext(topProducts);
      setLastCategoryContext(topProducts[0].category);
      setShownIdsHistory((prev) => [...prev, ...topProducts.map((p) => p.id)]);

      // Also sync main catalog category if strongly specific
      if (wantsChaleco) onSelectCategory('Chalecos');
      else if (wantsMameluco) onSelectCategory('Mamelucos y Conjuntos');
      else if (wantsPantalon) onSelectCategory('Pantalones');
      else if (qNorm.includes('casaca')) onSelectCategory('Casacas');

      const codesStr = topProducts.map((p) => `**${p.code}**`).join(', ');
      let replyText = `He seleccionado para ti los modelos ${codesStr} que cumplen exactamente con lo que buscas:`;

      if (wantsExtremeCold && wantsNoReflective) {
        replyText = `Para **frío extremo y alta montaña sin cinta reflectiva**, te recomiendo los modelos ${codesStr} en Tela Hipora® Impermeable con aislamiento térmico:`;
      } else if (wantsExtremeCold) {
        replyText = `Para **frío extremo (-15°C a -20°C / +4,500 msnm)**, nuestros mejores modelos son ${codesStr} con **Membrana Hipora®, Thinsulate™ 3M y Panel Termoreflectivo**:`;
      } else if (wantsNoReflective) {
        replyText = `En nuestra **División Alta Montaña e Ingenieros (sin cinta reflectiva)**, te recomiendo los modelos ${codesStr}:`;
      }

      setMessages((prev) => [
        ...prev,
        { sender: 'user', text: rawQuery },
        {
          sender: 'bot',
          text: replyText,
          recommendedProducts: topProducts,
          followUpSuggestions: [
            '¿Qué diferencia hay entre estos modelos?',
            'Muéstrame otros modelos más',
            `Agregar ${topProducts[0].code} a mi Orden`,
          ],
        },
      ]);
      return;
    }

    // 9. Smart Conversational Fallback
    setMessages((prev) => [
      ...prev,
      { sender: 'user', text: rawQuery },
      {
        sender: 'bot',
        text: `Puedo ayudarte a encontrar la prenda exacta entre nuestros **79 modelos** o resolver cualquier duda técnica. Dime por ejemplo:\n• ¿La necesitas **con Cinta Reflectiva 3M (Minería)** o **sin cinta reflectiva (Alta Montaña / Urbano)**?\n• ¿Buscas **Casacas, Chalecos, Mamelucos o Pantalones**?\n\nAquí tienes nuestros 3 modelos insignia más solicitados en todo el Perú:`,
        recommendedProducts: CATALOG_PRODUCTS.filter((p) =>
          ['CAS-02', 'CAS-33', 'M-03'].includes(p.code)
        ),
        followUpSuggestions: [
          'Casacas con Cinta 3M para Minería',
          'Casacas sin reflectivo para Alta Montaña',
          'Ver Mamelucos Térmicos',
          'Ver Chalecos y Pantalones',
        ],
      },
    ]);
  };

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const q = inputText.trim();
    setInputText('');
    processUserQuery(q);
  };

  const handleResetChat = () => {
    setShownIdsHistory(['cas-02', 'm-03']);
    setMessages([
      {
        sender: 'bot',
        text: 'Conversación reiniciada. ¿Qué tipo de prenda, código o especificación deseas consultar ahora?',
        recommendedProducts: CATALOG_PRODUCTS.filter((p) =>
          ['CAS-02', 'M-03'].includes(p.code)
        ),
        followUpSuggestions: [
          'Recomiéndame casacas para -20°C',
          'Casacas sin cinta reflectiva',
          '¿Diferencia entre Hipora y Softshell?',
          'Descargar Catálogo PDF',
        ],
      },
    ]);
  };

  return (
    <div className="fixed bottom-4 right-3 sm:bottom-5 sm:right-5 z-40 flex flex-col items-end gap-2.5">
      {/* Conversational AI Window in Glassmorphism */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="false"
          aria-labelledby="chatbot-dialog-title"
          className="dialog-panel-enter overscroll-contain w-[calc(100vw-24px)] sm:w-[410px] rounded-3xl glass-modal border shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
          style={{ borderColor: 'var(--border-accent)' }}
        >
          {/* Header */}
          <div
            className="px-4 py-3.5 flex items-center justify-between border-b shrink-0"
            style={{
              background: 'var(--bg-primary)',
              color: 'var(--text-main)',
              borderColor: 'var(--border-accent)',
            }}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-2xl border flex items-center justify-center"
                style={{
                  background: 'var(--surface-elevated)',
                  borderColor: 'var(--border-accent)',
                  boxShadow: 'var(--shadow-glow)',
                }}
              >
                <Sparkles
                  className="w-4 h-4"
                  style={{ color: 'var(--accent-primary)' }}
                  aria-hidden="true"
                />
              </div>
              <div>
                <div
                  id="chatbot-dialog-title"
                  className="font-display font-extrabold text-xs sm:text-sm flex items-center gap-1.5"
                  style={{ color: 'var(--text-main)' }}
                >
                  <span>Asesor Virtual • WHA PERÚ</span>
                  <span
                    className="w-2 h-2 rounded-full animate-ping"
                    style={{ background: 'var(--accent-primary)' }}
                    aria-hidden="true"
                  />
                </div>
                <p
                  className="text-[10px] font-medium tabular-nums"
                  style={{ color: 'var(--accent-primary)' }}
                >
                  IA entrenada en los 79 modelos (-20°C)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleResetChat}
                className="pressable-pill w-8 h-8 rounded-xl border flex items-center justify-center cursor-pointer"
                style={{
                  background: 'var(--surface-elevated)',
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-secondary)',
                }}
                title="Reiniciar conversación"
                aria-label="Reiniciar conversación"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="pressable-pill w-8 h-8 rounded-xl border flex items-center justify-center cursor-pointer"
                style={{
                  background: 'var(--surface-elevated)',
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-main)',
                }}
                aria-label="Cerrar asistente virtual"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div
            className="p-3.5 h-80 sm:h-[380px] overflow-y-auto overscroll-contain space-y-3 text-xs"
            style={{ background: 'var(--bg-secondary)', color: 'var(--text-main)' }}
          >
            {messages.map((m, idx) => (
              <div key={idx} className="space-y-2">
                <div
                  className={`flex ${
                    m.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[90%] rounded-2xl px-3.5 py-2.5 leading-relaxed whitespace-pre-line ${
                      m.sender === 'user'
                        ? 'font-bold rounded-br-none shadow-md'
                        : 'border rounded-bl-none shadow-sm'
                    }`}
                    style={
                      m.sender === 'user'
                        ? {
                            background: 'var(--accent-primary)',
                            color: 'var(--text-on-accent)',
                          }
                        : {
                            background: 'var(--surface-elevated)',
                            borderColor: 'var(--border-subtle)',
                            color: 'var(--text-main)',
                          }
                    }
                  >
                    {m.text}
                  </div>
                </div>

                {/* Optional PDF Download Pill inside Bot Reply */}
                {m.pdfDownload && (
                  <div className="pl-1">
                    <a
                      href={m.pdfDownload.url}
                      download
                      className="btn-neumorph-gold inline-flex items-center gap-2 px-3.5 py-2 rounded-xl font-extrabold text-xs"
                    >
                      <FileDown className="w-4 h-4" aria-hidden="true" />
                      <span>{m.pdfDownload.label}</span>
                    </a>
                  </div>
                )}

                {/* Interactive Product Cards Rendered Inside Chat */}
                {m.recommendedProducts && m.recommendedProducts.length > 0 && (
                  <div className="space-y-2 pl-1">
                    {m.recommendedProducts.map((prod) => (
                      <div
                        key={prod.id}
                        className="p-2.5 rounded-2xl border flex items-center gap-2.5 transition-colors"
                        style={{
                          background: 'var(--surface-elevated)',
                          borderColor: 'var(--border-subtle)',
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => onSelectProduct(prod)}
                          aria-label={`Ver ficha técnica de ${prod.code}`}
                          className="w-12 h-12 rounded-xl bg-[#e6f2fb] p-1 shrink-0 cursor-pointer"
                        >
                          <img
                            src={prod.primaryImage}
                            alt={prod.code}
                            width={48}
                            height={48}
                            className="w-full h-full object-contain"
                          />
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span
                              translate="no"
                              className="px-1.5 py-0.5 rounded font-mono-code tabular-nums font-black text-[10px]"
                              style={{
                                background: 'var(--accent-primary)',
                                color: 'var(--text-on-accent)',
                              }}
                            >
                              {prod.code}
                            </span>
                            <span
                              className="text-[10px] font-bold truncate"
                              style={{ color: 'var(--accent-secondary)' }}
                            >
                              {prod.fabric}
                            </span>
                            <span
                              translate="no"
                              className="text-[9px] font-mono-code tabular-nums ml-auto shrink-0"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              {prod.tempRating.split('/')[0]}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => onSelectProduct(prod)}
                            className="w-full text-left font-bold text-[11px] truncate cursor-pointer hover:underline mt-0.5 block"
                            style={{ color: 'var(--text-main)' }}
                          >
                            {prod.title}
                          </button>
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <button
                              type="button"
                              onClick={() => onSelectProduct(prod)}
                              className="px-2 py-1 rounded-lg border font-bold text-[10px] inline-flex items-center gap-1 cursor-pointer"
                              style={{
                                background: 'var(--bg-primary)',
                                borderColor: 'var(--border-subtle)',
                                color: 'var(--text-main)',
                              }}
                            >
                              <Eye
                                className="w-3 h-3"
                                style={{ color: 'var(--accent-primary)' }}
                                aria-hidden="true"
                              />
                              Ficha
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                onAddToCart(prod, 'L', 1, false);
                                onToast(`⚡ ${prod.code} añadido al Cotizador.`);
                              }}
                              className="px-2 py-1 rounded-lg font-extrabold text-[10px] inline-flex items-center gap-0.5 cursor-pointer"
                              style={{
                                background: 'var(--accent-primary)',
                                color: 'var(--text-on-accent)',
                              }}
                            >
                              <Plus className="w-3 h-3 stroke-[3]" aria-hidden="true" />
                              Cotizar
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                sendWhatsAppWithProductImage(
                                  prod,
                                  'L',
                                  1,
                                  false,
                                  onToast
                                )
                              }
                              className="px-2 py-1 rounded-lg border font-bold text-[10px] inline-flex items-center gap-1 ml-auto cursor-pointer"
                              style={{
                                background: 'var(--bg-primary)',
                                borderColor: 'var(--border-accent)',
                                color: 'var(--accent-secondary)',
                              }}
                            >
                              <Phone className="w-2.5 h-2.5" aria-hidden="true" />
                              Foto WA
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Contextual Follow-Up Suggestion Chips */}
                {m.followUpSuggestions && idx === messages.length - 1 && (
                  <div className="flex flex-wrap gap-1.5 pt-1 pl-1">
                    {m.followUpSuggestions.map((sug) => (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => processUserQuery(sug)}
                        className="pressable-pill px-2.5 py-1.5 rounded-xl border font-bold text-[11px] text-left cursor-pointer"
                        style={{
                          background: 'var(--surface-elevated)',
                          borderColor: 'var(--border-accent)',
                          color: 'var(--accent-secondary)',
                        }}
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Free-form Natural Language Input */}
          <div
            className="p-3 border-t space-y-2 shrink-0"
            style={{
              background: 'var(--bg-primary)',
              borderColor: 'var(--border-subtle)',
            }}
          >
            <form onSubmit={handleSendText} className="flex gap-1.5">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                aria-label="Escribir consulta para el Asesor Virtual"
                placeholder="Ej. casaca para -20°C, CAS-02 vs CAS-33…"
                className="glass-input flex-1 px-3 py-2.5 rounded-xl text-xs"
              />
              <button
                type="submit"
                className="btn-neumorph-cyan px-3.5 py-2.5 rounded-xl font-extrabold cursor-pointer"
                aria-label="Enviar consulta al agente IA"
              >
                <Send className="w-4 h-4" aria-hidden="true" />
              </button>
            </form>

            <button
              type="button"
              onClick={() => {
                const lastUserMsg =
                  [...messages].reverse().find((m) => m.sender === 'user')?.text ||
                  'Deseo cotizar prendas del catálogo web.';
                openWhatsAppOrder(
                  `¡Hola *WHA MOUNTAIN PERÚ*! 👋 Vengo de su Asesor Virtual Web.\nMi consulta: "${lastUserMsg}"`
                );
              }}
              className="pressable-pill w-full py-2 px-3 rounded-xl border font-bold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer"
              style={{
                background: 'var(--surface-elevated)',
                borderColor: 'var(--border-accent)',
                color: 'var(--text-main)',
              }}
            >
              <Phone
                className="w-3.5 h-3.5"
                style={{ color: 'var(--accent-primary)' }}
                aria-hidden="true"
              />
              <span className="tabular-nums">Hablar con Asesor Humano ({BRAND_CONFIG.whatsappDisplay})</span>
            </button>
          </div>
        </div>
      )}

      {/* Floating Chatbot & Direct WhatsApp Launcher Buttons */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          className="pressable-pill glass-pill px-4 py-3 rounded-full font-display font-extrabold text-xs sm:text-sm border-2 flex items-center gap-2 cursor-pointer"
          style={{
            borderColor: 'var(--border-accent)',
            boxShadow: 'var(--shadow-glow)',
            color: 'var(--text-main)',
          }}
        >
          <Sparkles
            className="w-4 h-4"
            style={{ color: 'var(--accent-primary)' }}
            aria-hidden="true"
          />
          <span>{isOpen ? 'Cerrar Asesor' : 'Asesor Virtual'}</span>
        </button>

        <button
          type="button"
          onClick={() =>
            openWhatsAppOrder(
              `¡Hola *WHA MOUNTAIN PERÚ*! ⚡ Vi su tienda online y deseo cotizar prendas.`
            )
          }
          className="btn-neumorph-gold p-3.5 rounded-full flex items-center justify-center cursor-pointer"
          title={`WhatsApp Directo: ${BRAND_CONFIG.whatsappDisplay}`}
          aria-label="WhatsApp Directo"
        >
          <Phone className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};
