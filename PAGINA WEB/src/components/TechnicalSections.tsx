import React, { useState } from 'react';
import {
  ShieldCheck,
  ThermometerSnowflake,
  Droplets,
  Award,
  Building2,
  Truck,
  FileText,
  Sparkles,
  Ruler,
  ChevronDown,
  Phone,
  Facebook,
  FileDown,
  Zap,
} from 'lucide-react';
import {
  BRAND_CONFIG,
  CATEGORY_SUMMARY,
  FULL_CATALOG_PDF_URL,
} from '../data/catalog';
import { openWhatsAppOrder } from '../utils/conversion';

export const TechnicalSections: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: '¿Qué diferencia a una casaca WHA MOUNTAIN con Thinsulate™ 3M y Panel Termoreflectivo?',
      a: 'Nuestras prendas estrella para puna extrema (como CAS-02, CAS-09, CAS-11, CAS-16, CAS-29, CAS-33, CAS-40, CAS-42 y el mameluco M-03) integran membrana exterior Hipora® 100% impermeable y cortaviento con microfibras térmicas Thinsulate™ 3M originales y una lámina interior Termoreflectiva que rebota el calor corporal sin hacer pesada la prenda, resistiendo hasta -20°C a más de 4,800 m.s.n.m.',
    },
    {
      q: '¿Cómo funciona el Cotizador Múltiple para WhatsApp y Orden PDF?',
      a: 'Toca "Añadir a Cotización" en todas las prendas que te interesen. Luego abre el Cotizador Flotante para indicar tallas, cantidades, si deseas bordado de logo y tu RUC. Con un clic puedes descargar tu Orden Formal en PDF con fotos o enviarla directamente al WhatsApp oficial 910 363 522.',
    },
    {
      q: '¿Atienden compras desde 1 unidad y también pedidos corporativos con RUC 20?',
      a: '¡Sí! Atendemos tanto compras personales desde 1 unidad como dotaciones corporativas al por mayor con Factura Electrónica (RUC 20 / RUC 10), precios especiales por volumen y servicio de bordado computarizado para mineras, contratistas e ingenierías.',
    },
    {
      q: '¿Cómo realizan los envíos a provincias y campamentos mineros en todo el Perú?',
      a: 'Despachamos todos los días desde Lima hacia Arequipa, Cusco, Puno, Juliaca, Cerro de Pasco, Junín, Huaraz, Cajamarca, Moquegua, Tacna, Trujillo y todo el Perú vía Shalom, Marvisur, Olva Courier o Cruz del Sur Cargo.',
    },
  ];

  const cardRadii = [
    '36px 20px 38px 22px',
    '22px 36px 20px 38px',
    '38px 22px 34px 20px',
    '20px 38px 22px 36px',
  ];

  return (
    <>
      {/* 1. INGENIERÍA EXTREMA DE 4 CAPAS — ORGANIC NON-SQUARE BENTO */}
      <section
        id="tecnologia"
        style={{ background: 'var(--bg-secondary)' }}
        className="relative py-16 sm:py-20 section-diagonal-both overflow-hidden scroll-mt-20 transition-colors duration-500"
      >
        <div className="pointer-events-none absolute top-10 left-1/4 w-96 h-96 liquid-blob-cyan opacity-40" aria-hidden="true" />

        <div className="relative z-10 layout-container">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 space-y-2.5">
            <span
              className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full glass-pill font-mono-code text-[11px] font-extrabold uppercase"
              style={{ color: 'var(--accent-secondary)' }}
            >
              <Zap className="w-3.5 h-3.5" aria-hidden="true" />
              TECNOLOGÍA TEXTIL DE 4 CAPAS • -20°C
            </span>
            <h2
              className="font-impact uppercase font-bold fluid-section-title"
              style={{ color: 'var(--text-main)' }}
            >
              CONSTRUIDO PARA{' '}
              <span className="text-gradient-hype">CLIMA EXTREMO</span>
            </h2>
            <p
              className="fluid-lead font-medium"
              style={{ color: 'var(--text-secondary)' }}
            >
              Insumos originales de grado minero y expedición probados sobre los 4,800 m.s.n.m. en la Cordillera de los Andes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: Droplets,
                isPrimaryAccent: false,
                badge: 'CAPA 01 • ESCUDO EXTERIOR',
                title: 'Membrana Hipora® Impermeable',
                desc: 'Tejido técnico microporoso 100% impermeable y cortaviento que repele lluvia torrencial, nieve y aguanieve.',
              },
              {
                icon: ThermometerSnowflake,
                isPrimaryAccent: true,
                badge: 'CAPA 02 • NÚCLEO -20°C',
                title: 'Thinsulate™ 3M & Termoreflectivo',
                desc: 'Microfibras térmicas originales 3M™ unidas a un panel interior aluminizado que retiene y devuelve el calor corporal.',
              },
              {
                icon: Award,
                isPrimaryAccent: false,
                badge: 'CAPA 03 • NORMA MINERA',
                title: 'Cinta Reflectiva 3M™ Scotchlite',
                desc: 'Máxima visibilidad nocturna y en neblina densa para tajo abierto, socavón y obras viales bajo D.S. 024-2016-EM.',
              },
              {
                icon: ShieldCheck,
                isPrimaryAccent: true,
                badge: 'CAPA 04 • USO PESADO',
                title: 'Drill Nuevo Mundo & Cierres REY',
                desc: 'Chalecos, mamelucos y pantalones de alto gramaje con costuras reforzadas y cierres industriales marca REY.',
              },
            ].map((card, idx) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.title}
                  style={{ borderRadius: cardRadii[idx % cardRadii.length] }}
                  className="glass-card p-5 sm:p-6 space-y-3 transition-transform duration-300 hover:-translate-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="blob-stage w-12 h-12 flex items-center justify-center">
                      <Icon
                        className="w-5 h-5"
                        style={{
                          color: 'var(--alpine-night)',
                        }}
                        aria-hidden="true"
                      />
                    </div>
                    <span
                      className="font-mono-code font-bold text-[9px] uppercase"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {card.badge}
                    </span>
                  </div>
                  <h3
                    className="font-display font-extrabold text-sm sm:text-base"
                    style={{ color: 'var(--text-main)' }}
                  >
                    {card.title}
                  </h3>
                  <p
                    className="text-xs leading-relaxed font-medium"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {card.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 2. BANNER CORPORATIVO B2B (RUC 20 + BORDADO + DESCARGA DE CATÁLOGOS PDF) */}
      <section
        id="empresas"
        className="relative py-16 sm:py-20 liquid-hero-canvas section-diagonal-reverse overflow-hidden scroll-mt-20"
      >
        <div className="pointer-events-none absolute inset-0 bg-tech-grid opacity-50" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-24 right-0 w-96 h-96 liquid-blob-gold opacity-50" aria-hidden="true" />

        <div className="relative z-10 layout-container space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-pill font-mono-code text-xs font-extrabold"
                style={{ color: 'var(--accent-primary)' }}
              >
                <Building2 className="w-4 h-4" aria-hidden="true" />
                <span>DIVISIÓN EMPRESAS & CONTRATISTAS • RUC 20 / RUC 10</span>
              </div>

              <h2
                className="font-impact uppercase font-bold fluid-section-title"
                style={{ color: 'var(--text-main)' }}
              >
                EQUIPAMOS A TU CUADRILLA CON{' '}
                <span className="text-gradient-gold">BORDADO CORPORATIVO</span>
              </h2>

              <p
                className="fluid-lead max-w-2xl font-medium"
                style={{ color: 'var(--text-secondary)' }}
              >
                Abastecemos operaciones mineras, constructoras, ingenierías y entidades públicas en todo el Perú con precios escalonados por volumen, factura electrónica y puntualidad garantizada.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div
                  className="glass-card p-4 space-y-1.5"
                  style={{ borderRadius: '28px 16px 30px 18px' }}
                >
                  <Sparkles
                    className="w-5 h-5"
                    style={{ color: 'var(--accent-primary)' }}
                  />
                  <h3
                    className="font-display font-extrabold text-xs sm:text-sm"
                    style={{ color: 'var(--text-main)' }}
                  >
                    Bordado Computarizado
                  </h3>
                  <p
                    className="text-[11px]"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Logotipo institucional de alta precisión en pecho y espalda.
                  </p>
                </div>

                <div
                  className="glass-card p-4 space-y-1.5"
                  style={{ borderRadius: '18px 28px 16px 30px' }}
                >
                  <FileText
                    className="w-5 h-5"
                    style={{ color: 'var(--accent-secondary)' }}
                  />
                  <h3
                    className="font-display font-extrabold text-xs sm:text-sm"
                    style={{ color: 'var(--text-main)' }}
                  >
                    Orden PDF + Factura
                  </h3>
                  <p
                    className="text-[11px]"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Genera tu proforma PDF con fotos en la web y recibe Factura RUC 20.
                  </p>
                </div>

                <div
                  className="glass-card p-4 space-y-1.5"
                  style={{ borderRadius: '28px 18px 26px 16px' }}
                >
                  <Truck
                    className="w-5 h-5"
                    style={{ color: 'var(--accent-primary)' }}
                  />
                  <h3
                    className="font-display font-extrabold text-xs sm:text-sm"
                    style={{ color: 'var(--text-main)' }}
                  >
                    Despacho Nacional 24h
                  </h3>
                  <p
                    className="text-[11px]"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Envíos diarios por Shalom, Marvisur, Olva y Cruz del Sur.
                  </p>
                </div>
              </div>
            </div>

            {/* Corporate Fast-Action Card */}
            <div className="lg:col-span-5">
              <div
                className="glass-modal p-6 space-y-4"
                style={{
                  borderRadius: '40px 24px 44px 26px',
                  border: '2px solid var(--border-accent)',
                }}
              >
                <div
                  className="flex items-center justify-between border-b pb-3.5"
                  style={{ borderColor: 'var(--border-subtle)' }}
                >
                  <div>
                    <span
                      className="text-[10px] font-mono-code font-bold uppercase"
                      style={{ color: 'var(--accent-secondary)' }}
                    >
                      ATENCIÓN INMEDIATA B2B & UNIDAD
                    </span>
                    <h3
                      className="font-display font-black text-lg"
                      style={{ color: 'var(--text-main)' }}
                    >
                      Central Comercial Perú
                    </h3>
                  </div>
                  <div className="px-3 py-1.5 rounded-full bg-[#e6f2fb] shadow-xs">
                    <img
                      src="./images/brand/logo-wha-cropped.png"
                      alt="WHA MOUNTAIN"
                      width={118}
                      height={28}
                      className="h-7 w-auto object-contain"
                    />
                  </div>
                </div>

                <p
                  className="text-xs leading-relaxed font-medium"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Solicita cotización formal con RUC o descarga nuestros catálogos técnicos PDF listos para gerencia y logística:
                </p>

                <div className="space-y-2.5">
                  <a
                    href="#cotizacion-corporativa"
                    className="btn-neumorph-gold w-full py-3.5 px-4 rounded-full font-display font-black text-xs sm:text-sm uppercase flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Building2 className="w-4 h-4" aria-hidden="true" />
                    <span>Ir al Formulario Corporativo B2B</span>
                  </a>

                  <button
                    type="button"
                    onClick={() =>
                      openWhatsAppOrder(
                        `🏢 *COTIZACIÓN CORPORATIVA / MAYORISTA — WHA MOUNTAIN PERÚ*\n\n¡Hola! Deseo solicitar una cotización formal.\n• Empresa / RUC: \n• Prendas o Códigos: \n• Cantidad aprox.: \n• Destino en Perú: `
                      )
                    }
                    className="btn-neumorph-cyan w-full py-3 px-4 rounded-full font-display font-black text-xs uppercase flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Phone className="w-4 h-4" aria-hidden="true" />
                    <span className="tabular-nums">WhatsApp Central {BRAND_CONFIG.whatsappDisplay}</span>
                  </button>

                  <a
                    href={FULL_CATALOG_PDF_URL}
                    download
                    className="pressable-pill w-full py-2.5 px-4 rounded-full font-bold text-xs flex items-center justify-center gap-2"
                    style={{
                      background: 'var(--surface-elevated)',
                      color: 'var(--text-main)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <FileDown className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} aria-hidden="true" />
                    <span>Descargar Catálogo Completo PDF (79)</span>
                  </a>

                  <a
                    href={BRAND_CONFIG.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pressable-pill w-full py-2.5 px-4 rounded-full font-bold text-xs flex items-center justify-center gap-2"
                    style={{
                      background: 'var(--surface-elevated)',
                      color: 'var(--text-main)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <Facebook
                      className="w-4 h-4"
                      style={{ color: 'var(--accent-secondary)' }}
                      aria-hidden="true"
                    />
                    <span>Visitar Facebook Oficial</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* 4 Direct Category PDF Organic Cards with 3D PNG Thumbnail */}
          <div
            id="catalogos-pdf"
            className="pt-6 border-t"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
              {CATEGORY_SUMMARY.map((cat, idx) => (
                <a
                  key={cat.id}
                  href={cat.pdfUrl}
                  download
                  style={{ borderRadius: cardRadii[idx % cardRadii.length] }}
                  className="pressable-pill group glass-card p-3.5 flex items-center gap-3"
                >
                  <div className="blob-stage w-13 h-13 p-1 shrink-0 flex items-center justify-center overflow-visible">
                    <img
                      src={cat.image}
                      alt={cat.shortName}
                      width={52}
                      height={52}
                      className="max-h-[115%] max-w-[115%] -mt-1 object-contain group-hover:scale-115 transition-transform duration-200"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span
                      className="block text-[9px] font-mono-code tabular-nums font-bold uppercase"
                      style={{ color: 'var(--accent-primary)' }}
                    >
                      PDF • {cat.count} MODELOS
                    </span>
                    <span
                      className="block font-display font-extrabold text-xs sm:text-sm truncate"
                      style={{ color: 'var(--text-main)' }}
                    >
                      {cat.shortName}
                    </span>
                  </div>
                  <FileDown
                    className="w-4 h-4 shrink-0"
                    style={{ color: 'var(--accent-secondary)' }}
                    aria-hidden="true"
                  />
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. GUÍA DE TALLAS + PREGUNTAS FRECUENTES */}
      <section
        id="tallas"
        style={{ background: 'var(--bg-primary)' }}
        className="py-14 sm:py-20 scroll-mt-20 transition-colors duration-500"
      >
        <div className="layout-container space-y-14">
          <div
            className="glass-card p-5 sm:p-8"
            style={{ borderRadius: '38px 22px 42px 24px' }}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-5">
              <div>
                <span
                  className="inline-flex items-center gap-1.5 text-[11px] font-mono-code font-bold uppercase"
                  style={{ color: 'var(--accent-secondary)' }}
                >
                  <Ruler className="w-3.5 h-3.5" aria-hidden="true" />
                  MOLDE INDUSTRIAL PERUANO (HOLGURA TÉRMICA)
                </span>
                <h2
                  className="font-impact uppercase font-bold text-2xl sm:text-3xl mt-0.5"
                  style={{ color: 'var(--text-main)' }}
                >
                  CUADRO OFICIAL DE TALLAS
                </h2>
              </div>
              <span
                className="text-xs font-bold"
                style={{ color: 'var(--accent-primary)' }}
              >
                * Confeccionamos también talla especial 3XL para pedidos corporativos.
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm tabular-nums">
                <thead>
                  <tr
                    style={{
                      background: 'var(--surface-elevated)',
                      color: 'var(--accent-secondary)',
                      borderBottom: '1px solid var(--border-accent)',
                    }}
                  >
                    <th className="py-3 px-4 rounded-tl-2xl font-display font-extrabold">
                      Talla
                    </th>
                    <th className="py-3 px-4 font-display font-extrabold">
                      Pecho / Tórax
                    </th>
                    <th className="py-3 px-4 font-display font-extrabold">
                      Largo Casaca
                    </th>
                    <th className="py-3 px-4 font-display font-extrabold">
                      Pantalón
                    </th>
                    <th className="py-3 px-4 rounded-tr-2xl font-display font-extrabold">
                      Estatura Ref.
                    </th>
                  </tr>
                </thead>
                <tbody style={{ color: 'var(--text-secondary)' }}>
                  <tr
                    className="border-b"
                    style={{ borderColor: 'var(--border-subtle)' }}
                  >
                    <td
                      className="py-3 px-4 font-mono-code font-bold"
                      style={{ color: 'var(--text-main)' }}
                    >
                      S
                    </td>
                    <td className="py-3 px-4">96 – 100 cm</td>
                    <td className="py-3 px-4">68 cm</td>
                    <td className="py-3 px-4">28 – 30</td>
                    <td className="py-3 px-4">1.60 – 1.67 m</td>
                  </tr>
                  <tr
                    className="border-b"
                    style={{ borderColor: 'var(--border-subtle)' }}
                  >
                    <td
                      className="py-3 px-4 font-mono-code font-bold"
                      style={{ color: 'var(--text-main)' }}
                    >
                      M
                    </td>
                    <td className="py-3 px-4">102 – 106 cm</td>
                    <td className="py-3 px-4">71 cm</td>
                    <td className="py-3 px-4">32</td>
                    <td className="py-3 px-4">1.66 – 1.73 m</td>
                  </tr>
                  <tr
                    className="font-bold border-b"
                    style={{
                      background: 'var(--surface-elevated)',
                      borderColor: 'var(--border-accent)',
                    }}
                  >
                    <td
                      className="py-3 px-4 font-mono-code font-extrabold"
                      style={{ color: 'var(--accent-primary)' }}
                    >
                      L (Más pedida)
                    </td>
                    <td
                      className="py-3 px-4"
                      style={{ color: 'var(--text-main)' }}
                    >
                      108 – 112 cm
                    </td>
                    <td
                      className="py-3 px-4"
                      style={{ color: 'var(--text-main)' }}
                    >
                      74 cm
                    </td>
                    <td
                      className="py-3 px-4"
                      style={{ color: 'var(--text-main)' }}
                    >
                      34
                    </td>
                    <td
                      className="py-3 px-4"
                      style={{ color: 'var(--text-main)' }}
                    >
                      1.70 – 1.78 m
                    </td>
                  </tr>
                  <tr
                    className="border-b"
                    style={{ borderColor: 'var(--border-subtle)' }}
                  >
                    <td
                      className="py-3 px-4 font-mono-code font-bold"
                      style={{ color: 'var(--text-main)' }}
                    >
                      XL
                    </td>
                    <td className="py-3 px-4">114 – 118 cm</td>
                    <td className="py-3 px-4">77 cm</td>
                    <td className="py-3 px-4">36 – 38</td>
                    <td className="py-3 px-4">1.75 – 1.85 m</td>
                  </tr>
                  <tr>
                    <td
                      className="py-3 px-4 font-mono-code font-bold"
                      style={{ color: 'var(--text-main)' }}
                    >
                      XXL
                    </td>
                    <td className="py-3 px-4">120 – 126 cm</td>
                    <td className="py-3 px-4">80 cm</td>
                    <td className="py-3 px-4">40 – 42</td>
                    <td className="py-3 px-4">1.80 m a más</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* FAQ Accordion */}
          <div id="preguntas" className="max-w-4xl mx-auto scroll-mt-20">
            <div className="text-center mb-7">
              <span
                className="text-[11px] font-mono-code font-bold uppercase"
                style={{ color: 'var(--accent-primary)' }}
              >
                RESPUESTAS RÁPIDAS
              </span>
              <h2
                className="font-impact uppercase font-bold text-2xl sm:text-4xl mt-1"
                style={{ color: 'var(--text-main)' }}
              >
                PREGUNTAS FRECUENTES
              </h2>
            </div>

            <div className="space-y-3">
              {faqs.map((item, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={item.q}
                    style={{
                      borderRadius: cardRadii[idx % cardRadii.length],
                      borderColor: isOpen
                        ? 'var(--border-accent)'
                        : 'var(--border-subtle)',
                    }}
                    className="glass-card overflow-hidden transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      aria-expanded={isOpen}
                      className="w-full px-5 py-4 text-left flex items-center justify-between gap-3 font-display font-bold text-xs sm:text-sm cursor-pointer"
                      style={{ color: 'var(--text-main)' }}
                    >
                      <span>{item.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                        style={{ color: 'var(--accent-secondary)' }}
                        aria-hidden="true"
                      />
                    </button>
                    {isOpen && (
                      <div
                        className="px-5 pb-4 text-xs sm:text-sm leading-relaxed border-t pt-3 font-medium"
                        style={{
                          color: 'var(--text-secondary)',
                          borderColor: 'var(--border-subtle)',
                        }}
                      >
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
