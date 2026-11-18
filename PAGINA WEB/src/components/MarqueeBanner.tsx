import React, { useState } from 'react';
import { Zap, Snowflake, ShieldCheck, Flame, Truck, Sparkles, Pause, Play } from 'lucide-react';

interface MarqueeBannerProps {
  variant?: 'gold' | 'cyan' | 'dark-glass' | 'ice' | 'slate';
  reverse?: boolean;
  items?: string[];
  compact?: boolean;
}

const DEFAULT_ITEMS = [
  'ENVÍOS A TODO EL PERÚ 24/48H',
  'ROPA TÉCNICA EXTREMA HASTA -20°C',
  'MEMBRANA HIPORA® 100% IMPERMEABLE',
  'AISLAMIENTO THINSULATE™ 3M ORIGINAL',
  'CINTA REFLECTIVA 3M™ SCOTCHLITE',
  'PANEL INTERIOR TERMOREFLECTIVO',
  'VENTAS POR UNIDAD Y POR MAYOR (RUC 20)',
  'BORDADO COMPUTARIZADO DE LOGOS',
];

export const MarqueeBanner: React.FC<MarqueeBannerProps> = ({
  variant = 'gold',
  reverse = false,
  items = DEFAULT_ITEMS,
  compact = false,
}) => {
  const [paused, setPaused] = useState(false);
  const icons = [Zap, Snowflake, ShieldCheck, Flame, Truck, Sparkles];

  const isPrimaryStyle = variant === 'gold' || variant === 'ice';
  const isSecondaryStyle = variant === 'cyan' || variant === 'slate';

  const variantStyle: React.CSSProperties =
    isPrimaryStyle
      ? {
          background: 'var(--marquee-bg-1)',
          color: 'var(--marquee-text-1)',
          borderTop: '2px solid rgba(11, 15, 20, 0.28)',
          borderBottom: '2px solid rgba(11, 15, 20, 0.28)',
        }
      : isSecondaryStyle
      ? {
          background: 'var(--marquee-bg-2)',
          color: 'var(--marquee-text-2)',
          borderTop: '2px solid rgba(122, 166, 194, 0.3)',
          borderBottom: '2px solid rgba(122, 166, 194, 0.3)',
        }
      : {
          background: 'var(--surface-glass)',
          color: 'var(--text-main)',
          borderTop: '1px solid var(--border-accent)',
          borderBottom: '1px solid var(--border-accent)',
        };

  const renderGroup = (groupKey: string) => (
    <div
      key={groupKey}
      className="flex items-center shrink-0"
      aria-hidden={groupKey === 'dup'}
    >
      {items.map((text, idx) => {
        const Icon = icons[idx % icons.length];
        return (
          <div
            key={`${groupKey}-${idx}`}
            className={`flex items-center shrink-0 ${
              compact ? 'gap-2 px-4' : 'gap-3 px-5 sm:px-7'
            }`}
          >
            <span
              className={`font-impact uppercase tracking-wider font-bold ${
                compact
                  ? 'text-[11px] sm:text-xs'
                  : 'text-sm sm:text-base md:text-lg'
              }`}
            >
              {text}
            </span>
            <Icon
              aria-hidden="true"
              className={`${compact ? 'w-3.5 h-3.5' : 'w-4 h-4 sm:w-5 sm:h-5'} shrink-0`}
              style={{
                color:
                  variant === 'dark-glass'
                    ? 'var(--accent-primary)'
                    : 'currentColor',
              }}
            />
          </div>
        );
      })}
    </div>
  );

  return (
    <div
      style={variantStyle}
      className={`marquee-wrapper ${paused ? 'marquee-paused' : ''} relative w-full overflow-hidden select-none z-20 transition-colors duration-300 ${
        compact
          ? 'py-1.5 pr-9'
          : `py-2.5 sm:py-3.5 pr-11 ${reverse ? 'sm:rotate-[0.45deg]' : 'sm:-rotate-[0.45deg]'} my-1`
      }`}
    >
      <div className={reverse ? 'marquee-track-reverse' : 'marquee-track'}>
        {renderGroup('orig')}
        {renderGroup('dup')}
      </div>

      <button
        type="button"
        onClick={() => setPaused((p) => !p)}
        aria-pressed={paused}
        aria-label={paused ? 'Reanudar cinta animada' : 'Pausar cinta animada'}
        title={paused ? 'Reanudar movimiento' : 'Pausar movimiento'}
        className={`pressable-pill absolute right-2 top-1/2 -translate-y-1/2 rounded-full flex items-center justify-center backdrop-blur-md cursor-pointer ${
          compact ? 'w-6 h-6' : 'w-8 h-8'
        }`}
        style={{
          background: 'rgba(11, 15, 20, 0.78)',
          color: '#e6f2fb',
          border: '1px solid rgba(230, 242, 251, 0.38)',
        }}
      >
        {paused ? (
          <Play className={compact ? 'w-3 h-3' : 'w-3.5 h-3.5'} aria-hidden="true" />
        ) : (
          <Pause className={compact ? 'w-3 h-3' : 'w-3.5 h-3.5'} aria-hidden="true" />
        )}
      </button>
    </div>
  );
};
