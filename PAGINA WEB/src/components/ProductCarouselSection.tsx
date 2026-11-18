import React, { useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  Sparkles,
  FileDown,
  Pause,
  Play,
} from 'lucide-react';
import { Product } from '../data/catalog';
import { ProductCard } from './ProductCard';
import { useRevealOnScroll } from '../hooks/useRevealOnScroll';
import { useStableCarousel } from '../hooks/useStableCarousel';

export interface CarouselTabOption {
  id: string;
  label: string;
  count?: number;
}

interface ProductCarouselSectionProps {
  id?: string;
  eyebrow: string;
  title: string;
  highlightWord?: string;
  subtitle: string;
  products: Product[];
  accentTheme?: 'gold' | 'cyan';
  tabs?: CarouselTabOption[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  viewMoreLabel?: string;
  viewMoreCount?: number;
  pdfDownloadUrl?: string;
  onViewMore?: () => void;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, size: string, quantity: number, withLogo: boolean) => void;
  onToast: (msg: string) => void;
  featuredStyle?: boolean;
}

export const ProductCarouselSection: React.FC<ProductCarouselSectionProps> = ({
  id,
  eyebrow,
  title,
  highlightWord,
  subtitle,
  products,
  accentTheme = 'gold',
  tabs,
  activeTab,
  onTabChange,
  viewMoreLabel,
  viewMoreCount,
  pdfDownloadUrl,
  onViewMore,
  onSelectProduct,
  onAddToCart,
  onToast,
  featuredStyle = false,
}) => {
  const { ref: sectionRevealRef, isRevealed } = useRevealOnScroll<HTMLElement>(0.06);

  const trackKey = useMemo(
    () => `${id ?? title}::${activeTab ?? 'default'}::${products.map((p) => p.id).join(',')}`,
    [id, title, activeTab, products]
  );

  const {
    scrollRef,
    trackLeftRef,
    trackMainRef,
    trackRightRef,
    progressBarRef,
    enableInfiniteLoop,
    isUserPaused,
    setIsUserPaused,
    statusLabel,
    scrollByAmount,
    containerHandlers,
  } = useStableCarousel({
    trackKey,
    itemCount: products.length,
  });

  const isGold = accentTheme === 'gold';

  const renderTrackItems = (prefix: string, isClone: boolean) => (
    <>
      {products.map((product, index) => (
        <div
          key={`${prefix}-${product.id}`}
          className={`carousel-card-item shrink-0 w-[76vw] max-w-[272px] sm:w-[272px] lg:w-[286px] md:-mr-3 hover:z-30 ${
            index % 2 === 1
              ? 'sm:translate-y-2 md:rotate-[0.55deg]'
              : 'md:-rotate-[0.45deg]'
          } hover:rotate-0`}
        >
          <ProductCard
            product={product}
            onSelectProduct={onSelectProduct}
            onAddToCart={onAddToCart}
            onToast={onToast}
            featuredBadge={featuredStyle}
          />
        </div>
      ))}

      {/* END-OF-CAROUSEL "VER MÁS" EXCLUSIVE ORGANIC PORTAL CARD */}
      {onViewMore && viewMoreLabel && (
        <div className="shrink-0 w-[76vw] max-w-[272px] sm:w-[272px] lg:w-[286px] flex pt-6">
          <button
            type="button"
            tabIndex={isClone ? -1 : undefined}
            onClick={onViewMore}
            style={{
              borderRadius: '44px 24px 48px 26px',
              border: '2px solid var(--border-accent)',
              boxShadow: 'var(--card-glow)',
            }}
            className="pressable-pill group cursor-pointer w-full liquid-hero-canvas p-6 flex flex-col items-center justify-center text-center gap-4 hover:-translate-y-1.5 relative overflow-hidden"
          >
            <div className="pointer-events-none absolute inset-0 bg-tech-grid opacity-45" />

            <div className="blob-stage w-20 h-20 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 relative z-10">
              <ArrowUpRight
                className="w-9 h-9"
                style={{ color: 'var(--alpine-night)' }}
                aria-hidden="true"
              />
            </div>

            <div className="relative z-10 space-y-1.5">
              {typeof viewMoreCount === 'number' && (
                <span
                  className="inline-block px-3 py-1 rounded-full font-mono-code tabular-nums font-extrabold text-xs"
                  style={{
                    background: 'var(--bg-primary)',
                    color: 'var(--accent-secondary)',
                    border: '1px solid var(--border-accent)',
                  }}
                >
                  +{viewMoreCount} MODELOS OFICIALES
                </span>
              )}
              <h3
                className="font-impact uppercase text-2xl sm:text-3xl leading-tight"
                style={{ color: 'var(--text-main)' }}
              >
                EXPLORAR SECCIÓN COMPLETA
              </h3>
              <p
                className="text-xs leading-relaxed font-medium"
                style={{ color: 'var(--text-secondary)' }}
              >
                Filtra por tela Hipora®, Thinsulate™ 3M, colores y códigos técnicos en la vista completa.
              </p>
            </div>

            <span className="relative z-10 btn-neumorph-gold w-full py-3 px-4 rounded-full font-display font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5">
              <span>{viewMoreLabel || 'Ver más'}</span>
              <ArrowUpRight className="w-4 h-4 stroke-[3]" aria-hidden="true" />
            </span>
          </button>
        </div>
      )}
    </>
  );

  return (
    <section
      ref={sectionRevealRef}
      id={id}
      style={{
        background: featuredStyle ? 'var(--bg-secondary)' : 'var(--bg-primary)',
      }}
      className={`reveal-section ${isRevealed ? 'is-revealed' : ''} relative py-12 sm:py-16 lg:py-20 overflow-hidden scroll-mt-20 ${
        featuredStyle ? 'section-diagonal-both' : 'section-diagonal-reverse'
      }`}
    >
      {/* Decorative Ambient Organic Blob Glow */}
      <div
        className={`pointer-events-none absolute -top-24 ${
          isGold ? 'right-0 liquid-blob-gold' : 'left-0 liquid-blob-cyan'
        } w-80 h-80 opacity-45`}
        aria-hidden="true"
      />

      <div className="relative z-10 layout-container">
        {/* Section Header + Navigation Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 sm:mb-8">
          <div className="space-y-2">
            <div
              className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[10px] sm:text-xs font-mono-code font-extrabold uppercase tracking-wider glass-pill"
              style={{
                color: isGold ? 'var(--accent-primary)' : 'var(--accent-secondary)',
              }}
            >
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{eyebrow}</span>
            </div>

            <h2
              className="font-impact uppercase font-bold fluid-section-title"
              style={{ color: 'var(--text-main)' }}
            >
              {title}{' '}
              {highlightWord && (
                <span className={isGold ? 'text-gradient-gold' : 'text-gradient-hype'}>
                  {highlightWord}
                </span>
              )}
            </h2>

            <p
              className="text-xs sm:text-sm max-w-2xl leading-relaxed font-medium"
              style={{ color: 'var(--text-secondary)' }}
            >
              {subtitle}
            </p>
          </div>

          {/* Right Side Controls: PDF + Ver más CTA + Pause/Play + Arrows */}
          <div className="flex items-center justify-between md:justify-end gap-2 shrink-0">
            {pdfDownloadUrl && (
              <a
                href={pdfDownloadUrl}
                download
                className="pressable-pill hidden sm:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full glass-pill text-xs font-bold"
                style={{ color: 'var(--accent-primary)' }}
                title="Descargar catálogo PDF de esta línea"
              >
                <FileDown className="w-4 h-4" aria-hidden="true" />
                <span>PDF</span>
              </a>
            )}

            {onViewMore && (
              <button
                type="button"
                onClick={onViewMore}
                className={`px-4 py-2.5 rounded-full font-display font-black text-xs uppercase tracking-wide flex items-center gap-1.5 cursor-pointer ${
                  isGold ? 'btn-neumorph-gold' : 'btn-neumorph-cyan'
                }`}
              >
                <span>{viewMoreLabel || 'Ver más'}</span>
                {typeof viewMoreCount === 'number' && (
                  <span
                    className="px-2 py-0.5 rounded-full font-mono-code tabular-nums text-[10px]"
                    style={{
                      background: 'var(--bg-primary)',
                      color: 'var(--text-main)',
                    }}
                  >
                    {viewMoreCount}
                  </span>
                )}
                <ArrowUpRight className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
              </button>
            )}

            {/* Explicit Pause/Play + Carousel Arrows (44x44px hit targets) */}
            <div className="flex items-center gap-1.5">
              {enableInfiniteLoop && (
                <button
                  type="button"
                  onClick={() => setIsUserPaused((p) => !p)}
                  aria-pressed={isUserPaused}
                  aria-label={
                    isUserPaused
                      ? `Reanudar desplazamiento automático de ${title}`
                      : `Pausar desplazamiento automático de ${title}`
                  }
                  title={isUserPaused ? 'Reanudar carrusel' : 'Pausar carrusel'}
                  className="pressable-pill w-11 h-11 rounded-full glass-pill flex items-center justify-center cursor-pointer"
                  style={{ color: 'var(--accent-primary)' }}
                >
                  {isUserPaused ? (
                    <Play className="w-4 h-4" aria-hidden="true" />
                  ) : (
                    <Pause className="w-4 h-4" aria-hidden="true" />
                  )}
                </button>
              )}

              <button
                type="button"
                onClick={() => scrollByAmount('left')}
                className="pressable-pill w-11 h-11 rounded-full glass-pill flex items-center justify-center cursor-pointer"
                style={{ color: 'var(--text-main)' }}
                aria-label="Deslizar a la izquierda"
              >
                <ChevronLeft className="w-5 h-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => scrollByAmount('right')}
                className="pressable-pill w-11 h-11 rounded-full glass-pill flex items-center justify-center cursor-pointer"
                style={{ color: 'var(--text-main)' }}
                aria-label="Deslizar a la derecha"
              >
                <ChevronRight className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        {/* Optional Interactive Sub-Category Pills */}
        {tabs && tabs.length > 0 && onTabChange && (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-4 mb-2">
            {tabs.map((tab) => {
              const isAct = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onTabChange(tab.id)}
                  aria-pressed={isAct}
                  className="pressable-pill shrink-0 px-4 py-2 rounded-full font-display font-extrabold text-xs uppercase tracking-wide flex items-center gap-2 cursor-pointer"
                  style={
                    isAct
                      ? {
                          background: 'var(--accent-secondary)',
                          color: 'var(--accent-secondary-contrast)',
                          boxShadow: 'var(--card-glow)',
                        }
                      : {
                          background: 'var(--surface-elevated)',
                          color: 'var(--text-main)',
                          border: '1px solid var(--border-subtle)',
                        }
                  }
                >
                  <span>{tab.label}</span>
                  {typeof tab.count === 'number' && (
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-mono-code tabular-nums font-bold"
                      style={
                        isAct
                          ? {
                              background: 'var(--bg-primary)',
                              color: 'var(--accent-secondary)',
                            }
                          : {
                              background: 'var(--surface-glass)',
                              color: 'var(--accent-primary)',
                            }
                      }
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Horizontal 3-Track Infinite Carousel (Cero Saltos / Cero Re-renders en rAF) */}
        <div
          ref={scrollRef}
          {...containerHandlers}
          style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-x pan-y' }}
          className="flex items-stretch gap-4 sm:gap-5 overflow-x-auto no-scrollbar pt-4 pb-8 -mx-4 px-4 sm:mx-0 sm:px-0 cursor-grab active:cursor-grabbing select-none"
        >
          {enableInfiniteLoop && (
            <div
              ref={trackLeftRef}
              aria-hidden="true"
              className="flex items-stretch gap-4 sm:gap-5 shrink-0"
            >
              {renderTrackItems('left', true)}
            </div>
          )}

          <div ref={trackMainRef} className="flex items-stretch gap-4 sm:gap-5 shrink-0">
            {renderTrackItems('main', false)}
          </div>

          {enableInfiniteLoop && (
            <div
              ref={trackRightRef}
              aria-hidden="true"
              className="flex items-stretch gap-4 sm:gap-5 shrink-0"
            >
              {renderTrackItems('right', true)}
            </div>
          )}
        </div>

        {/* GPU-Composited Progress Bar + Bottom "Ver más" CTA */}
        <div className="mt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:max-w-sm">
            <div
              className="flex-1 h-1.5 rounded-full overflow-hidden"
              style={{ background: 'var(--surface-elevated)' }}
            >
              <div
                ref={progressBarRef}
                className="h-full w-full rounded-full origin-left"
                style={{
                  transform: 'scaleX(0.12)',
                  background:
                    'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))',
                }}
              />
            </div>
            {enableInfiniteLoop && (
              <span
                className="text-[10px] font-mono-code font-bold uppercase tracking-wider shrink-0"
                style={{ color: 'var(--text-muted)' }}
              >
                {statusLabel}
              </span>
            )}
          </div>

          {onViewMore && viewMoreLabel && (
            <button
              type="button"
              onClick={onViewMore}
              className="pressable-pill sm:hidden w-full py-3 px-4 rounded-full glass-pill font-display font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
              style={{ color: 'var(--accent-primary)' }}
            >
              <span>{viewMoreLabel}</span>
              {typeof viewMoreCount === 'number' && (
                <span className="tabular-nums">({viewMoreCount})</span>
              )}
              <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
