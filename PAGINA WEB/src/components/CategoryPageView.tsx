import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  Search,
  SlidersHorizontal,
  RotateCcw,
  FileDown,
  LayoutGrid,
  Rows,
  X,
  Sparkles,
  Snowflake,
  Flame,
  Zap,
  Mountain,
  Radio,
} from 'lucide-react';
import {
  CATALOG_PRODUCTS,
  FULL_CATALOG_PDF_URL,
  Product,
} from '../data/catalog';
import { ProductCard } from './ProductCard';
import { ActivePageView } from './Navbar';

interface CategoryPageViewProps {
  activeView: Exclude<ActivePageView, 'home'>;
  onNavigateView: (view: ActivePageView) => void;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, size: string, quantity: number, withLogo: boolean) => void;
  onToast: (msg: string) => void;
  initialSearch?: string;
}

const VIEW_METADATA: Record<
  Exclude<ActivePageView, 'home'>,
  {
    title: string;
    highlight: string;
    rangeCode: string;
    description: string;
    pdfUrl: string;
    pdfLabel: string;
  }
> = {
  Casacas: {
    title: 'CASACAS TÉCNICAS',
    highlight: '-20°C & HIPORA®',
    rangeCode: 'CÓDIGOS CAS-01 AL CAS-63 • 63 MODELOS',
    description:
      'Colección exclusiva de casacas térmicas para minería, ingeniería y alta montaña con Membrana Hipora® Impermeable, Thinsulate™ 3M, Panel Termoreflectivo y Cinta Reflectiva 3M.',
    pdfUrl: './catalogos/Catalogo_WHA_MOUNTAIN_Casacas.pdf',
    pdfLabel: 'Descargar PDF Casacas (63)',
  },
  'Chalecos y Mamelucos': {
    title: 'CHALECOS INDUSTRIALES',
    highlight: '& MAMELUCOS -20°C',
    rangeCode: 'CÓDIGOS CH-01 AL CH-06 & M-01 AL M-07 • 13 MODELOS',
    description:
      'Equipamiento táctico y térmico integral para supervisores, geólogos, socavón y tajo abierto en Drill 100% Algodón Nuevo Mundo e Hipora Oxford con Thinsulate™ 3M.',
    pdfUrl: FULL_CATALOG_PDF_URL,
    pdfLabel: 'Descargar Catálogo PDF',
  },
  Chalecos: {
    title: 'CHALECOS GEÓLOGOS',
    highlight: '& SUPERVISORES 3M',
    rangeCode: 'CÓDIGOS CH-01 AL CH-06 • 6 MODELOS',
    description:
      'Chalecos técnicos multibolsillos confeccionados en Drill Nuevo Mundo, Taslan e Hipora Impermeable con forro polar y Cinta Reflectiva 3M Scotchlite.',
    pdfUrl: './catalogos/Catalogo_WHA_MOUNTAIN_Chalecos.pdf',
    pdfLabel: 'Descargar PDF Chalecos (6)',
  },
  'Mamelucos y Conjuntos': {
    title: 'MAMELUCOS TÉRMICOS',
    highlight: '& CONJUNTOS -20°C',
    rangeCode: 'CÓDIGOS M-01 AL M-07 • 7 MODELOS',
    description:
      'Protección corporal completa para heladas severas, nieve y minería subterránea con aislamiento Thinsulate™ 3M, cierres REY de doble vía y cintas reflectivas.',
    pdfUrl: './catalogos/Catalogo_WHA_MOUNTAIN_Mamelucos.pdf',
    pdfLabel: 'Descargar PDF Mamelucos (7)',
  },
  Pantalones: {
    title: 'PANTALONES INDUSTRIALES',
    highlight: 'DRILL & JEAN EPP',
    rangeCode: 'CÓDIGOS PT-01 AL PT-03 • 3 MODELOS',
    description:
      'Pantalones de alto gramaje con refuerzos industriales en Drill Nuevo Mundo y Denim pesado con Cinta Reflectiva 3M.',
    pdfUrl: './catalogos/Catalogo_WHA_MOUNTAIN_Pantalones.pdf',
    pdfLabel: 'Descargar PDF Pantalones (3)',
  },
  Todas: {
    title: 'CATÁLOGO GENERAL',
    highlight: '79 MODELOS WHA',
    rangeCode: 'COLECCIÓN OFICIAL COMPLETA • PERÚ',
    description:
      'Explora y filtra las 79 prendas técnicas industriales y de alta montaña confeccionadas por WHA MOUNTAIN PERÚ.',
    pdfUrl: FULL_CATALOG_PDF_URL,
    pdfLabel: 'Descargar PDF Completo (79)',
  },
};

const FABRICS = [
  'Todas las Telas',
  'Hipora Impermeable',
  'Hipora Oxford',
  'Softshell',
  'Taslan',
  'Drill Algodón Nuevo Mundo',
  'Drill Tecnología',
  'Jean Industrial',
];

const SPECIAL_CHIPS = [
  { id: 'all', label: 'Todos', icon: Sparkles },
  { id: 'thinsulate', label: 'Thinsulate™ 3M (-20°C)', icon: Snowflake },
  { id: 'termoreflectivo', label: 'Panel Termoreflectivo', icon: Flame },
  { id: 'cinta3m', label: 'Con Cinta 3M™ (Minería)', icon: Zap },
  { id: 'sin_reflectivo', label: 'Sin Reflectivo (Ejecutivo/Outdoor)', icon: Mountain },
  { id: 'portaradio', label: 'Con Porta Radio', icon: Radio },
] as const;

export const CategoryPageView: React.FC<CategoryPageViewProps> = ({
  activeView,
  onNavigateView,
  onSelectProduct,
  onAddToCart,
  onToast,
  initialSearch = '',
}) => {
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedFabric, setSelectedFabric] = useState('Todas las Telas');
  const [specialFilter, setSpecialFilter] = useState('all');
  const [mobileCols, setMobileCols] = useState<1 | 2>(2);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSearchQuery(initialSearch);
  }, [initialSearch]);

  const meta = VIEW_METADATA[activeView];

  const filteredProducts = useMemo(() => {
    return CATALOG_PRODUCTS.filter((p) => {
      if (activeView === 'Chalecos y Mamelucos') {
        if (p.category !== 'Chalecos' && p.category !== 'Mamelucos y Conjuntos') {
          return false;
        }
      } else if (activeView !== 'Todas' && p.category !== activeView) {
        return false;
      }

      if (selectedFabric !== 'Todas las Telas' && p.fabric !== selectedFabric) {
        return false;
      }

      if (
        specialFilter === 'thinsulate' &&
        !p.description.toLowerCase().includes('thinsulate') &&
        !p.thermal.toLowerCase().includes('thinsulate')
      ) {
        return false;
      }

      if (
        specialFilter === 'termoreflectivo' &&
        !p.description.toLowerCase().includes('termoreflectivo') &&
        !p.thermal.toLowerCase().includes('termoreflectivo')
      ) {
        return false;
      }

      if (specialFilter === 'cinta3m' && !p.reflective.includes('3M')) {
        return false;
      }

      if (
        specialFilter === 'sin_reflectivo' &&
        p.reflective !== 'Sin Cinta Reflectiva'
      ) {
        return false;
      }

      if (
        specialFilter === 'portaradio' &&
        !p.description.toLowerCase().includes('porta radio') &&
        !p.description.toLowerCase().includes('portaradio')
      ) {
        return false;
      }

      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase().trim();
        const matchCode =
          p.code.toLowerCase().includes(q) ||
          p.code.replace('-', '').toLowerCase().includes(q);
        const matchTitle = p.title.toLowerCase().includes(q);
        const matchDesc = p.description.toLowerCase().includes(q);
        const matchFabric = p.fabric.toLowerCase().includes(q);
        return matchCode || matchTitle || matchDesc || matchFabric;
      }

      return true;
    });
  }, [activeView, selectedFabric, specialFilter, searchQuery]);

  const resetFilters = () => {
    setSelectedFabric('Todas las Telas');
    setSpecialFilter('all');
    setSearchQuery('');
  };

  return (
    <div
      className="min-h-screen pb-16 transition-colors duration-500"
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* Exclusive Category Hero Header with Animated Liquid Gradient + Diagonal Cut */}
      <section className="relative liquid-hero-canvas section-diagonal-bottom overflow-hidden -mt-16 pt-20 pb-12 sm:pt-24 sm:pb-16">
        <div className="pointer-events-none absolute inset-0 bg-tech-grid opacity-55" />
        <div className="pointer-events-none absolute -top-20 right-10 w-72 h-72 liquid-blob-gold opacity-55" />

        <div className="relative z-10 layout-container py-4 space-y-5">
          {/* Top Breadcrumb + Back to Promotional Home */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => onNavigateView('home')}
              className="pressable-pill inline-flex items-center gap-2 px-4 py-2 rounded-full glass-pill text-xs sm:text-sm font-display font-extrabold cursor-pointer"
              style={{ color: 'var(--text-main)' }}
            >
              <ArrowLeft
                className="w-4 h-4"
                style={{ color: 'var(--accent-secondary)' }}
                aria-hidden="true"
              />
              <span>Volver al Inicio Promocional</span>
            </button>

            <a
              href={meta.pdfUrl}
              download
              className="btn-neumorph-gold inline-flex items-center gap-2 px-5 py-2 rounded-full font-display font-black text-xs uppercase tracking-wide"
            >
              <FileDown className="w-4 h-4" aria-hidden="true" />
              <span>{meta.pdfLabel}</span>
            </a>
          </div>

          <div className="space-y-2 max-w-3xl">
            <div
              className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full glass-pill font-mono-code font-bold text-[10px] sm:text-xs uppercase"
              style={{ color: 'var(--accent-primary)' }}
            >
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{meta.rangeCode}</span>
            </div>

            <h1
              className="font-impact uppercase font-bold fluid-hero-title"
              style={{ color: 'var(--text-main)' }}
            >
              {meta.title}{' '}
              <span className="text-gradient-hype">{meta.highlight}</span>
            </h1>

            <p
              className="fluid-lead font-medium"
              style={{ color: 'var(--text-secondary)' }}
            >
              {meta.description}
            </p>
          </div>

          {/* Fast Category Switcher Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
            {(
              [
                { id: 'Casacas', label: 'Casacas (63)' },
                { id: 'Chalecos y Mamelucos', label: 'Chalecos & Mamelucos (13)' },
                { id: 'Chalecos', label: 'Solo Chalecos (6)' },
                { id: 'Mamelucos y Conjuntos', label: 'Solo Mamelucos (7)' },
                { id: 'Pantalones', label: 'Pantalones (3)' },
                { id: 'Todas', label: 'Ver Las 79 Prendas' },
              ] as const
            ).map((tab) => {
              const active = activeView === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onNavigateView(tab.id)}
                  aria-pressed={active}
                  className="pressable-pill shrink-0 px-4 py-2 rounded-full font-display font-extrabold text-xs uppercase cursor-pointer"
                  style={
                    active
                      ? {
                          background: 'var(--accent-primary)',
                          color: 'var(--text-on-accent)',
                          boxShadow: 'var(--card-glow)',
                        }
                      : {
                          background: 'var(--surface-elevated)',
                          color: 'var(--text-main)',
                          border: '1px solid var(--border-subtle)',
                        }
                  }
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Sticky Glassmorphism Filter & Search Bar */}
      <div className="layout-container mt-6">
        <div
          className="sticky top-[74px] sm:top-[84px] z-30 glass-card p-3.5 sm:p-5 mb-7 space-y-3"
          style={{ borderRadius: '32px 20px 34px 22px' }}
        >
          <div className="flex items-center gap-2">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search
                className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: 'var(--accent-secondary)' }}
                aria-hidden="true"
              />
              <input
                ref={inputRef}
                type="text"
                spellCheck={false}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Filtrar prendas por código, nombre o tela"
                placeholder="Buscar código (ej. CAS-02, CAS-33, M-03, CH-01) o tela…"
                className="glass-input w-full pl-10 pr-10 py-2.5 rounded-full text-xs sm:text-sm font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Limpiar búsqueda"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full cursor-pointer"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              )}
            </div>

            {/* Fabric Advanced Toggle */}
            <button
              type="button"
              onClick={() => setShowAdvanced((v) => !v)}
              aria-expanded={showAdvanced}
              className="pressable-pill px-4 py-2.5 rounded-full text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer"
              style={
                showAdvanced || selectedFabric !== 'Todas las Telas'
                  ? {
                      background: 'var(--accent-secondary)',
                      color: 'var(--text-on-accent)',
                    }
                  : {
                      background: 'var(--surface-elevated)',
                      color: 'var(--text-main)',
                      border: '1px solid var(--border-subtle)',
                    }
              }
            >
              <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">Telas</span>
            </button>

            {/* Mobile 2-Col vs 1-Col */}
            <div
              className="flex sm:hidden items-center rounded-full p-1 shrink-0"
              style={{
                background: 'var(--surface-elevated)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <button
                type="button"
                onClick={() => setMobileCols(2)}
                aria-pressed={mobileCols === 2}
                className="p-2 rounded-full cursor-pointer"
                style={
                  mobileCols === 2
                    ? {
                        background: 'var(--accent-primary)',
                        color: 'var(--text-on-accent)',
                      }
                    : { color: 'var(--text-muted)' }
                }
                aria-label="2 columnas"
              >
                <LayoutGrid className="w-4 h-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setMobileCols(1)}
                aria-pressed={mobileCols === 1}
                className="p-2 rounded-full cursor-pointer"
                style={
                  mobileCols === 1
                    ? {
                        background: 'var(--accent-primary)',
                        color: 'var(--text-on-accent)',
                      }
                    : { color: 'var(--text-muted)' }
                }
                aria-label="1 columna"
              >
                <Rows className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Horizontal Quick Spec Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {SPECIAL_CHIPS.map((chip) => {
              const active = specialFilter === chip.id;
              const ChipIcon = chip.icon;
              return (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => setSpecialFilter(chip.id)}
                  aria-pressed={active}
                  className="pressable-pill shrink-0 px-3.5 py-1.5 rounded-full text-[11px] font-bold inline-flex items-center gap-1.5 cursor-pointer"
                  style={
                    active
                      ? {
                          background: 'var(--accent-primary)',
                          color: 'var(--text-on-accent)',
                          fontWeight: 800,
                        }
                      : {
                          background: 'var(--surface-elevated)',
                          color: 'var(--text-main)',
                          border: '1px solid var(--border-subtle)',
                        }
                  }
                >
                  <ChipIcon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>{chip.label}</span>
                </button>
              );
            })}
          </div>

          {showAdvanced && (
            <div
              className="pt-3 border-t flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3"
              style={{ borderColor: 'var(--border-subtle)' }}
            >
              <div className="flex items-center gap-2 flex-1">
                <label
                  htmlFor="category-fabric-select"
                  className="text-xs font-bold shrink-0"
                  style={{ color: 'var(--accent-secondary)' }}
                >
                  Filtrar por Tela:
                </label>
                <select
                  id="category-fabric-select"
                  value={selectedFabric}
                  onChange={(e) => setSelectedFabric(e.target.value)}
                  className="flex-1 max-w-xs px-3.5 py-2 rounded-full text-xs font-bold cursor-pointer"
                  style={{
                    backgroundColor: '#1a2633',
                    color: '#e6f2fb',
                    border: '1px solid var(--border-accent)',
                  }}
                >
                  {FABRICS.map((f) => (
                    <option
                      key={f}
                      value={f}
                      style={{ backgroundColor: '#1a2633', color: '#e6f2fb' }}
                    >
                      {f}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={resetFilters}
                className="pressable-pill px-4 py-2 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                style={{
                  background: 'var(--surface-elevated)',
                  color: 'var(--accent-primary)',
                  border: '1px solid var(--border-accent)',
                }}
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Restablecer Filtros</span>
              </button>
            </div>
          )}
        </div>

        {/* Count Bar */}
        <div className="flex items-center justify-between mb-4 px-1">
          <p
            className="text-xs sm:text-sm font-medium"
            style={{ color: 'var(--text-secondary)' }}
          >
            Mostrando{' '}
            <strong
              className="font-mono-code tabular-nums font-extrabold"
              style={{ color: 'var(--accent-secondary)' }}
            >
              {filteredProducts.length}
            </strong>{' '}
            modelos disponibles para cotización inmediata
          </p>
          {(selectedFabric !== 'Todas las Telas' ||
            specialFilter !== 'all' ||
            searchQuery) && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs font-bold hover:underline cursor-pointer"
              style={{ color: 'var(--accent-primary)' }}
            >
              Limpiar filtros ×
            </button>
          )}
        </div>

        {/* Organic Non-Square Product Grid */}
        {filteredProducts.length === 0 ? (
          <div
            className="glass-card p-10 text-center space-y-4"
            style={{ borderRadius: '36px 22px 38px 24px' }}
          >
            <p
              className="font-display font-extrabold text-base sm:text-lg"
              style={{ color: 'var(--text-main)' }}
            >
              No encontramos modelos exactos con esa combinación de filtros.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="btn-neumorph-gold px-6 py-3 rounded-full font-display font-black text-xs uppercase cursor-pointer"
            >
              Mostrar todos los modelos de esta sección
            </button>
          </div>
        ) : (
          <div
            className={`grid ${
              mobileCols === 2 ? 'grid-cols-2' : 'grid-cols-1'
            } sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 items-stretch pt-2`}
          >
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelectProduct={onSelectProduct}
                onAddToCart={onAddToCart}
                onToast={onToast}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
