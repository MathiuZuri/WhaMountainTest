import React, { useRef, useState } from 'react';
import {
  Zap,
  Snowflake,
  ShieldCheck,
  Phone,
  Plus,
  Check,
  ArrowRight,
  Sparkles,
  Eye,
  Layers,
  Compass,
} from 'lucide-react';
import { BRAND_CONFIG, CATALOG_PRODUCTS, Product } from '../data/catalog';
import { openWhatsAppOrder } from '../utils/conversion';
import { ActivePageView } from './Navbar';

interface HeroSectionProps {
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, size: string, quantity: number, withLogo: boolean) => void;
  onNavigateView: (view: ActivePageView) => void;
  onToast: (msg: string) => void;
}

const HERO_STAR_CODES = ['CAS-33', 'CAS-02', 'CAS-16'];

export const HeroSection: React.FC<HeroSectionProps> = ({
  onSelectProduct,
  onAddToCart,
  onNavigateView,
  onToast,
}) => {
  const starProducts = HERO_STAR_CODES.map((code) =>
    CATALOG_PRODUCTS.find((p) => p.code === code)
  ).filter((p): p is Product => Boolean(p));

  const [activeStarIdx, setActiveStarIdx] = useState(0);
  const [justAdded, setJustAdded] = useState(false);
  const stageTiltRef = useRef<HTMLButtonElement>(null);

  const currentStar = starProducts[activeStarIdx] || CATALOG_PRODUCTS[1];

  const handleStagePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.pointerType !== 'mouse') return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const el = stageTiltRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    el.style.transform = `perspective(820px) rotateY(${(nx * 6).toFixed(2)}deg) rotateX(${(-ny * 5).toFixed(2)}deg)`;
  };

  const handleStagePointerLeave = () => {
    const el = stageTiltRef.current;
    if (el) el.style.transform = '';
  };

  const handleAddHeroProduct = () => {
    onAddToCart(currentStar, 'L', 1, false);
    setJustAdded(true);
    onToast(`⚡ ${currentStar.code} añadido a tu Cotizador Múltiple.`);
    setTimeout(() => setJustAdded(false), 1600);
  };

  return (
    <section className="relative liquid-hero-canvas section-diagonal-bottom overflow-hidden -mt-16 pt-20 pb-14 sm:pt-24 sm:pb-20">
      {/* Plasma Nocturno / Líquido en Movimiento (Noche Alpina) */}
      <div className="pointer-events-none absolute inset-0 liquid-hero-mesh" aria-hidden="true" />
      <div className="pointer-events-none absolute -top-24 -left-20 w-[300px] h-[300px] sm:w-[460px] sm:h-[460px] liquid-blob-cyan opacity-75" aria-hidden="true" />
      <div className="pointer-events-none absolute top-1/4 -right-24 w-[280px] h-[280px] sm:w-[440px] sm:h-[440px] liquid-blob-gold opacity-75" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-28 left-1/3 w-[320px] h-[320px] liquid-blob-cyan opacity-55" aria-hidden="true" />

      {/* Subtle Night Grid Overlay */}
      <div className="pointer-events-none absolute inset-0 bg-tech-grid opacity-65" aria-hidden="true" />

      <div className="relative z-10 layout-container pt-3 sm:pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* LEFT COLUMN: Promotional Pitch & High-Conversion CTAs */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-5 text-center lg:text-left">
            {/* Glowing Top Drop Pill */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-pill shadow-sm">
                <span
                  className="w-2 h-2 rounded-full animate-ping"
                  style={{ background: 'var(--accent-primary)' }}
                  aria-hidden="true"
                />
                <span
                  translate="no"
                  className="font-mono-code tabular-nums font-extrabold text-[10px] sm:text-xs tracking-wider uppercase"
                  style={{ color: 'var(--accent-secondary)' }}
                >
                  NOCHE ALPINA • INGENIERÍA TEXTIL -20°C
                </span>
              </div>
              <a
                href="#cotizacion-corporativa"
                className="pressable-pill inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-pill text-[11px] font-bold"
                style={{ color: 'var(--accent-primary)' }}
              >
                <Sparkles className="w-3 h-3" aria-hidden="true" />
                <span>Cotización Empresas RUC 20</span>
              </a>
            </div>

            {/* Calibrated Fluid Display Headline (Mobile-First -> Balanced Desktop) */}
            <h1
              className="font-impact uppercase font-bold fluid-hero-title"
              style={{ color: 'var(--text-main)' }}
            >
              BLINDAJE TÉRMICO{' '}
              <span className="block text-gradient-hype mt-1">
                PARA MINERÍA & ALTA MONTAÑA
              </span>
            </h1>

            {/* High-Conversion Subcopy */}
            <p
              className="fluid-lead max-w-2xl mx-auto lg:mx-0 font-medium"
              style={{ color: 'var(--text-secondary)' }}
            >
              Equipamiento industrial diseñado para conquistar más de{' '}
              <strong
                className="font-extrabold tabular-nums"
                style={{ color: 'var(--accent-secondary)' }}
              >
                +4,800 m.s.n.m.
              </strong>{' '}
              con{' '}
              <strong
                className="font-extrabold"
                style={{ color: 'var(--accent-primary)' }}
              >
                Membrana Hipora® Impermeable
              </strong>
              ,{' '}
              <strong
                translate="no"
                className="font-extrabold"
                style={{ color: 'var(--text-main)' }}
              >
                Thinsulate™ 3M
              </strong>
              , panel interior{' '}
              <strong
                className="font-extrabold"
                style={{ color: 'var(--accent-secondary)' }}
              >
                Termoreflectivo
              </strong>{' '}
              y{' '}
              <strong
                translate="no"
                className="font-extrabold"
                style={{ color: 'var(--accent-primary)' }}
              >
                Cinta Reflectiva 3M™
              </strong>
              .
            </p>

            {/* Primary Neumorphic + Organic Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-1">
              <a
                href="#destacados"
                className="btn-neumorph-gold py-4 px-7 rounded-full font-display font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2.5"
              >
                <Zap className="w-5 h-5 fill-current" aria-hidden="true" />
                <span>EXPLORAR DROPS -20°C</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" aria-hidden="true" />
              </a>

              <button
                type="button"
                onClick={() =>
                  openWhatsAppOrder(
                    `¡Hola *WHA MOUNTAIN PERÚ*! ⚡ Vi su nueva tienda online y deseo cotizar ropa técnica para frío extremo (-20°C) / minería.`
                  )
                }
                className="pressable-pill py-4 px-6 rounded-full glass-pill font-display font-extrabold text-xs sm:text-sm uppercase tracking-wide flex items-center justify-center gap-2.5 cursor-pointer"
                style={{
                  color: 'var(--text-main)',
                  borderColor: 'var(--border-accent)',
                }}
              >
                <Phone
                  className="w-4 h-4"
                  style={{ color: 'var(--accent-secondary)' }}
                  aria-hidden="true"
                />
                <span className="tabular-nums">COTIZAR WHATSAPP • {BRAND_CONFIG.whatsappDisplay}</span>
              </button>
            </div>

            {/* Fast Category Jump Chips (Lucide SVG icons, Asymmetric Organic Pills) */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => onNavigateView('Casacas')}
                className="pressable-pill px-4 py-2 rounded-full glass-card text-xs font-bold flex items-center gap-2 cursor-pointer"
                style={{ color: 'var(--text-main)' }}
              >
                <ShieldCheck className="w-3.5 h-3.5" style={{ color: 'var(--accent-secondary)' }} aria-hidden="true" />
                <span>Casacas Técnicas</span>
                <span
                  className="px-2 py-0.5 rounded-full font-mono-code tabular-nums font-extrabold text-[10px]"
                  style={{
                    background: 'var(--accent-secondary)',
                    color: 'var(--text-on-accent)',
                  }}
                >
                  63
                </span>
              </button>

              <button
                type="button"
                onClick={() => onNavigateView('Chalecos y Mamelucos')}
                className="pressable-pill px-4 py-2 rounded-full glass-card text-xs font-bold flex items-center gap-2 cursor-pointer"
                style={{ color: 'var(--text-main)' }}
              >
                <Layers className="w-3.5 h-3.5" style={{ color: 'var(--accent-primary)' }} aria-hidden="true" />
                <span>Chalecos & Mamelucos</span>
                <span
                  className="px-2 py-0.5 rounded-full font-mono-code tabular-nums font-extrabold text-[10px]"
                  style={{
                    background: 'var(--accent-primary)',
                    color: 'var(--text-on-accent)',
                  }}
                >
                  13
                </span>
              </button>

              <button
                type="button"
                onClick={() => onNavigateView('Pantalones')}
                className="pressable-pill px-4 py-2 rounded-full glass-card text-xs font-bold flex items-center gap-2 cursor-pointer"
                style={{ color: 'var(--text-main)' }}
              >
                <Compass className="w-3.5 h-3.5" style={{ color: 'var(--accent-secondary)' }} aria-hidden="true" />
                <span>Pantalones EPP</span>
                <span
                  className="px-2 py-0.5 rounded-full font-mono-code tabular-nums font-extrabold text-[10px]"
                  style={{
                    background: 'var(--surface-elevated)',
                    color: 'var(--accent-primary)',
                  }}
                >
                  3
                </span>
              </button>
            </div>

            {/* Organic Non-Square Trust Stats Strip */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-4 pt-3 max-w-xl mx-auto lg:mx-0">
              <div
                className="glass-card p-3 sm:p-3.5 text-center lg:text-left"
                style={{ borderRadius: '28px 16px 26px 18px' }}
              >
                <div
                  translate="no"
                  className="font-impact tabular-nums text-xl sm:text-2xl font-bold"
                  style={{ color: 'var(--accent-secondary)' }}
                >
                  -20°C
                </div>
                <div
                  className="text-[10px] sm:text-xs font-semibold"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Resistencia Puna
                </div>
              </div>
              <div
                className="glass-card p-3 sm:p-3.5 text-center lg:text-left"
                style={{ borderRadius: '18px 28px 16px 26px' }}
              >
                <div
                  translate="no"
                  className="font-impact text-xl sm:text-2xl font-bold"
                  style={{ color: 'var(--accent-primary)' }}
                >
                  3M™ & REY
                </div>
                <div
                  className="text-[10px] sm:text-xs font-semibold"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Insumos Originales
                </div>
              </div>
              <div
                className="glass-card p-3 sm:p-3.5 text-center lg:text-left"
                style={{ borderRadius: '26px 18px 30px 16px' }}
              >
                <div
                  translate="no"
                  className="font-impact tabular-nums text-xl sm:text-2xl font-bold"
                  style={{ color: 'var(--text-main)' }}
                >
                  RUC 20 / 10
                </div>
                <div
                  className="text-[10px] sm:text-xs font-semibold"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Unidad y Mayorista
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Organic Morphing Blob Stage + 3D "Out of the Box" PNG Garment */}
          <div className="lg:col-span-5 relative flex flex-col items-center">
            <div className="relative w-full max-w-[440px] pt-12 sm:pt-10 pb-2 flex flex-col items-center">
              {/* Animated SVG Organic Amoeba Ring Behind the Blob Stage */}
              <svg
                viewBox="0 0 400 400"
                aria-hidden="true"
                className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 w-[310px] h-[310px] sm:w-[390px] sm:h-[390px] opacity-45 animate-[spin_36s_linear_infinite]"
              >
                <path
                  d="M313.5,290.5Q276,341,210.5,353.5Q145,366,95.5,321.5Q46,277,50,206.5Q54,136,105,89.5Q156,43,225,53.5Q294,64,322.5,132Q351,200,313.5,290.5Z"
                  fill="none"
                  stroke="var(--accent-secondary)"
                  strokeWidth="2.5"
                  strokeDasharray="10 8"
                />
              </svg>

              {/* Floating Spec Callout Badge #1 (Top Left — positioned cleanly on mobile) */}
              <div
                className="animate-badge-float absolute top-0 left-1 sm:-left-4 z-20 px-2.5 py-1.5 sm:px-3.5 sm:py-2 glass-pill flex items-center gap-1.5 sm:gap-2"
                style={{ borderRadius: '24px 14px 22px 16px' }}
              >
                <Snowflake
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0"
                  style={{ color: 'var(--accent-secondary)' }}
                  aria-hidden="true"
                />
                <div className="text-left">
                  <span
                    className="block text-[8px] sm:text-[9px] font-mono-code uppercase font-bold leading-none"
                    style={{ color: 'var(--accent-secondary)' }}
                  >
                    CLIMA EXTREMO
                  </span>
                  <span
                    translate="no"
                    className="text-[10px] sm:text-xs font-extrabold tabular-nums"
                    style={{ color: 'var(--text-main)' }}
                  >
                    Thinsulate™ 3M -20°C
                  </span>
                </div>
              </div>

              {/* Floating Spec Callout Badge #2 (Top Right — positioned cleanly on mobile) */}
              <div
                className="animate-badge-float-delayed absolute top-0 right-1 sm:top-6 sm:-right-4 z-20 px-2.5 py-1.5 sm:px-3.5 sm:py-2 glass-pill flex items-center gap-1.5 sm:gap-2"
                style={{ borderRadius: '16px 26px 14px 24px' }}
              >
                <ShieldCheck
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0"
                  style={{ color: 'var(--accent-primary)' }}
                  aria-hidden="true"
                />
                <div className="text-left">
                  <span
                    className="block text-[8px] sm:text-[9px] font-mono-code tabular-nums uppercase font-bold leading-none"
                    style={{ color: 'var(--accent-primary)' }}
                  >
                    ESTRELLA #{activeStarIdx + 1}
                  </span>
                  <span
                    translate="no"
                    className="text-[10px] sm:text-xs font-mono-code tabular-nums font-extrabold"
                    style={{ color: 'var(--text-main)' }}
                  >
                    CÓD: {currentStar.code}
                  </span>
                </div>
              </div>

              {/* ORGANIC AMOEBA BLOB STAGE + 3D "OUT OF THE BOX" PNG GARMENT */}
              <button
                ref={stageTiltRef}
                type="button"
                onClick={() => onSelectProduct(currentStar)}
                onPointerMove={handleStagePointerMove}
                onPointerLeave={handleStagePointerLeave}
                style={{ transition: 'transform 240ms var(--ease-out-expo)' }}
                className="relative z-10 cursor-pointer group w-64 h-64 sm:w-[340px] sm:h-[340px] flex items-center justify-center my-3 overflow-visible focus-visible:rounded-3xl"
                aria-label={`Ver ficha técnica completa de ${currentStar.code} - ${currentStar.title}`}
                title={`Ver ficha técnica completa de ${currentStar.code}`}
              >
                {/* Morphing Organic Amoeba Blob Stage */}
                <div className="blob-stage-hero absolute inset-4 group-hover:scale-105 transition-transform duration-300" />

                {/* Transparent PNG Garment Breaking Out of the Blob Container ("Out of the Box" 3D Effect) */}
                <img
                  src={currentStar.primaryImage}
                  alt={`${currentStar.code} - ${currentStar.title}`}
                  width={360}
                  height={360}
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  className="animate-levitate out-of-box-garment relative z-20 max-h-[114%] max-w-[114%] -mt-7 object-contain select-none"
                />
              </button>

              {/* Pulsing Levitation Floor Shadow */}
              <div className="animate-floor-shadow w-44 h-4 rounded-full bg-[#0b0f14]/65 blur-md mb-4" aria-hidden="true" />

              {/* Organic Non-Square Interactive Product Dock */}
              <div
                className="w-full glass-card p-4 sm:p-5 space-y-3 relative z-20"
                style={{ borderRadius: '34px 20px 38px 22px' }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span
                        translate="no"
                        className="px-2.5 py-0.5 rounded-full font-mono-code tabular-nums font-extrabold text-[11px]"
                        style={{
                          background: 'var(--accent-primary)',
                          color: 'var(--text-on-accent)',
                        }}
                      >
                        {currentStar.code}
                      </span>
                      <span
                        className="text-[11px] font-bold truncate"
                        style={{ color: 'var(--accent-secondary)' }}
                      >
                        {currentStar.fabric}
                      </span>
                    </div>
                    <h2
                      className="font-display font-extrabold text-xs sm:text-sm truncate mt-1"
                      style={{ color: 'var(--text-main)' }}
                    >
                      {currentStar.title}
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectProduct(currentStar)}
                    className="pressable-pill w-9 h-9 rounded-full flex items-center justify-center shrink-0 cursor-pointer"
                    style={{
                      background: 'var(--surface-elevated)',
                      color: 'var(--accent-secondary)',
                      border: '1px solid var(--border-subtle)',
                    }}
                    aria-label={`Ver ficha técnica de ${currentStar.code}`}
                    title="Ver Ficha Técnica"
                  >
                    <Eye className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>

                <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAddHeroProduct}
                    className={`flex-1 py-2.5 px-4 rounded-full font-display font-black text-xs uppercase tracking-wide flex items-center justify-center gap-1.5 cursor-pointer ${
                      justAdded ? 'btn-neumorph-cyan' : 'btn-neumorph-gold'
                    }`}
                  >
                    {justAdded ? (
                      <>
                        <Check className="w-4 h-4 stroke-[3]" aria-hidden="true" />
                        <span>¡EN COTIZACIÓN!</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 stroke-[3]" aria-hidden="true" />
                        <span>AÑADIR A COTIZACIÓN</span>
                      </>
                    )}
                  </button>

                  {/* Switcher Dots for the 3 Hero Flagship Drops */}
                  <div
                    className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-full"
                    style={{
                      background: 'var(--surface-elevated)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    {starProducts.map((sp, idx) => (
                      <button
                        key={sp.id}
                        type="button"
                        translate="no"
                        onClick={() => setActiveStarIdx(idx)}
                        aria-pressed={activeStarIdx === idx}
                        className="pressable-pill px-2.5 py-1 rounded-full font-mono-code tabular-nums font-bold text-[10px] cursor-pointer"
                        style={
                          activeStarIdx === idx
                            ? {
                                background: 'var(--accent-secondary)',
                                color: 'var(--text-on-accent)',
                              }
                            : {
                                color: 'var(--text-secondary)',
                              }
                        }
                        title={`Mostrar estrella ${sp.code}`}
                      >
                        {sp.code}
                      </button>
                    ))}
                  </div>
                </div>

                <div
                  className="flex items-center justify-between text-[10px] pt-1.5 border-t"
                  style={{
                    borderColor: 'var(--border-subtle)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <span
                    className="inline-flex items-center gap-1 font-bold"
                    style={{ color: 'var(--accent-primary)' }}
                  >
                    <Sparkles className="w-3 h-3" aria-hidden="true" />
                    Personalizable con Logo Bordado
                  </span>
                  <span
                    translate="no"
                    className="font-mono-code font-bold"
                    style={{ color: 'var(--accent-secondary)' }}
                  >
                    Tallas S - XXL
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
