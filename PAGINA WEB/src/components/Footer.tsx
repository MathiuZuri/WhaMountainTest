import React from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  FileDown,
  ShieldCheck,
  Mountain,
  ArrowUpRight,
} from 'lucide-react';
import {
  BRAND_CONFIG,
  CATEGORY_SUMMARY,
  FULL_CATALOG_PDF_URL,
} from '../data/catalog';
import { openWhatsAppOrder } from '../utils/conversion';
import { ActivePageView } from './Navbar';

interface FooterProps {
  onNavigateView: (view: ActivePageView) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateView }) => {
  return (
    <footer
      style={{
        background: 'var(--bg-secondary)',
        color: 'var(--text-secondary)',
        borderTop: '2px solid var(--border-accent)',
      }}
      className="relative pb-24 sm:pb-16 overflow-hidden transition-colors duration-500"
    >
      {/* Top Animated Liquid Accent Line */}
      <div className="h-1.5 w-full liquid-accent-strip" aria-hidden="true" />

      <div className="layout-container pt-12 pb-8 space-y-10">
        {/* Main Footer Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
          {/* Column 1: Brand Identity & Heritage */}
          <div className="lg:col-span-4 space-y-4">
            <button
              type="button"
              onClick={() => onNavigateView('home')}
              className="pressable-pill inline-flex items-center gap-3 px-4 py-2 rounded-full bg-[#e6f2fb] shadow-md cursor-pointer"
              style={{ border: '2px solid var(--accent-primary)' }}
            >
              <img
                src="./images/brand/logo-wha-cropped.png"
                alt="Logo Oficial WHA MOUNTAIN PERÚ"
                width={140}
                height={32}
                className="h-8 w-auto object-contain"
              />
            </button>

            <p className="text-xs sm:text-sm leading-relaxed font-medium">
              <strong style={{ color: 'var(--text-main)' }}>
                WHA MOUNTAIN PERÚ
              </strong>{' '}
              — Fabricantes y especialistas peruanos en confección de indumentaria técnica industrial para{' '}
              <strong style={{ color: 'var(--accent-secondary)' }}>
                minería, ingeniería civil, exploración geológica y alta montaña (-20°C)
              </strong>
              .
            </p>

            <div className="flex flex-wrap gap-2 text-[10px] font-mono-code font-bold">
              <span
                className="px-3 py-1 rounded-full glass-pill"
                style={{ color: 'var(--accent-secondary)' }}
              >
                HIPORA® IMPERMEABLE
              </span>
              <span
                className="px-3 py-1 rounded-full glass-pill"
                style={{ color: 'var(--accent-primary)' }}
              >
                THINSULATE™ 3M
              </span>
              <span
                className="px-3 py-1 rounded-full glass-pill"
                style={{ color: 'var(--text-main)' }}
              >
                CIERRES REY
              </span>
            </div>
          </div>

          {/* Column 2: Exclusive Category Pages */}
          <div className="lg:col-span-3 space-y-3">
            <h3
              className="font-display font-black text-xs uppercase tracking-wider"
              style={{ color: 'var(--accent-primary)' }}
            >
              Tiendas por Categoría
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm font-medium">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateView('Casacas')}
                  className="hover:opacity-80 transition-opacity inline-flex items-center gap-1 font-bold cursor-pointer"
                  style={{ color: 'var(--text-main)' }}
                >
                  <span>Casacas Técnicas -20°C (63)</span>
                  <ArrowUpRight
                    className="w-3.5 h-3.5"
                    style={{ color: 'var(--accent-secondary)' }}
                  />
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateView('Chalecos y Mamelucos')}
                  className="hover:opacity-80 transition-opacity inline-flex items-center gap-1 font-bold cursor-pointer"
                  style={{ color: 'var(--text-main)' }}
                >
                  <span>Chalecos & Mamelucos (13)</span>
                  <ArrowUpRight
                    className="w-3.5 h-3.5"
                    style={{ color: 'var(--accent-secondary)' }}
                  />
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateView('Chalecos')}
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                >
                  • Chalecos Geólogos Drill Nuevo Mundo (6)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateView('Mamelucos y Conjuntos')}
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                >
                  • Mamelucos Térmicos Mineros (7)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateView('Pantalones')}
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                >
                  • Pantalones Industriales EPP (3)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateView('Todas')}
                  className="hover:underline font-extrabold cursor-pointer"
                  style={{ color: 'var(--accent-primary)' }}
                >
                  • Ver Catálogo Completo (79 Modelos)
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Official PDF Catalogs */}
          <div className="lg:col-span-2 space-y-3">
            <h3
              className="font-display font-black text-xs uppercase tracking-wider"
              style={{ color: 'var(--accent-secondary)' }}
            >
              Catálogos PDF
            </h3>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <a
                  href={FULL_CATALOG_PDF_URL}
                  download
                  className="inline-flex items-center gap-1.5 font-extrabold hover:underline"
                  style={{ color: 'var(--text-main)' }}
                >
                  <FileDown
                    className="w-3.5 h-3.5"
                    style={{ color: 'var(--accent-primary)' }}
                  />
                  <span>General 2026 (79)</span>
                </a>
              </li>
              {CATEGORY_SUMMARY.map((c) => (
                <li key={c.id}>
                  <a
                    href={c.pdfUrl}
                    download
                    className="hover:underline transition-colors"
                  >
                    • PDF {c.shortName} ({c.count})
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Direct Sales Central */}
          <div className="lg:col-span-3 space-y-3">
            <h3
              className="font-display font-black text-xs uppercase tracking-wider"
              style={{ color: 'var(--accent-primary)' }}
            >
              Central de Ventas & Envíos
            </h3>
            <ul className="space-y-2.5 text-xs font-medium">
              <li>
                <button
                  type="button"
                  onClick={() =>
                    openWhatsAppOrder(
                      `¡Hola *WHA MOUNTAIN PERÚ*! Me comunico desde su tienda online oficial para solicitar una cotización.`
                    )
                  }
                  className="btn-neumorph-gold w-full py-2.5 px-3.5 rounded-full font-display font-black text-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5" aria-hidden="true" />
                  <span className="tabular-nums">WhatsApp: +51 {BRAND_CONFIG.whatsappDisplay}</span>
                </button>
              </li>
              <li>
                <a
                  href={BRAND_CONFIG.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 font-bold pt-1 hover:underline"
                  style={{ color: 'var(--text-main)' }}
                >
                  <Facebook
                    className="w-4 h-4 shrink-0"
                    style={{ color: 'var(--accent-secondary)' }}
                  />
                  <span>Facebook Oficial WHA MOUNTAIN</span>
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail
                  className="w-4 h-4 shrink-0"
                  style={{ color: 'var(--accent-primary)' }}
                />
                <span>{BRAND_CONFIG.email}</span>
              </li>
              <li className="flex items-start gap-2 text-[11px]">
                <MapPin
                  className="w-4 h-4 shrink-0 mt-0.5"
                  style={{ color: 'var(--accent-secondary)' }}
                />
                <span>{BRAND_CONFIG.location}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* SEO Rich Authority Block (Optimized from whamountainperu.com Archive & Mining Keywords) */}
        <div
          className="glass-card p-5 sm:p-6 space-y-2.5 text-[11px] sm:text-xs leading-relaxed"
          style={{ borderRadius: '34px 20px 38px 22px' }}
        >
          <div
            className="flex items-center gap-2 font-display font-bold uppercase tracking-wider text-xs"
            style={{ color: 'var(--text-main)' }}
          >
            <Mountain
              className="w-4 h-4"
              style={{ color: 'var(--accent-primary)' }}
            />
            <span>
              WHA MOUNTAIN PERÚ — Confección de Ropa Industrial, Minera, Térmica y de Alta Montaña
            </span>
          </div>
          <p>
            En <strong>WHA MOUNTAIN PERÚ</strong> (<em>whamountainperu.com</em>) somos fabricantes directos especializados en <strong>ropa industrial para frío extremo (-5°C, -15°C y -20°C)</strong>, equipamiento de protección personal textil (EPP) y prendas de expedición para la cordillera peruana. Confeccionamos <strong>casacas térmicas impermeables para minería</strong>, <strong>casacas cortaviento Softshell para ingenieros y supervisores</strong>, <strong>mamelucos térmicos impermeables para socavón y tajo abierto</strong>, <strong>chalecos geólogos en Drill 100% Algodón Nuevo Mundo</strong> y <strong>pantalones industriales con cinta reflectiva 3M™ Scotchlite</strong> cumpliendo los estándares de seguridad minera (D.S. 024-2016-EM).
          </p>
          <p>
            Brindamos atención personalizada por unidad y ventas corporativas al por mayor con <strong>Factura Electrónica (RUC 20 / RUC 10)</strong>, bordado computarizado institucional y envíos rápidos desde <strong>Lima</strong> hacia proyectos mineros y ciudades en <strong>Arequipa, Cusco, Puno, Juliaca, Cerro de Pasco, La Oroya, Junín, Huancayo, Huaraz (Áncash), Cajamarca, Moquegua, Tacna, Trujillo, Huancavelica, Ayacucho y todo el Perú</strong>.
          </p>
        </div>

        {/* Bottom Copyright */}
        <div
          className="pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px]"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <p className="flex items-center gap-1.5">
            <ShieldCheck
              className="w-3.5 h-3.5"
              style={{ color: 'var(--accent-primary)' }}
            />
            <span>
              © {new Date().getFullYear()}{' '}
              <strong style={{ color: 'var(--text-main)' }}>
                WHA MOUNTAIN PERÚ
              </strong>
              . Todos los derechos reservados.
            </span>
          </p>
          <p>
            Cotizador Online Directo • WhatsApp Central +51{' '}
            {BRAND_CONFIG.whatsappDisplay}
          </p>
        </div>
      </div>
    </footer>
  );
};
