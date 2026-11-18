import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CheckCircle2,
  ShoppingBag,
  Search,
  X,
  ArrowRight,
  Plus,
} from 'lucide-react';
import {
  CATALOG_PRODUCTS,
  Product,
  ProductCategory,
} from './data/catalog';
import { QuoteItem } from './utils/conversion';
import { ActivePageView, Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { MarqueeBanner } from './components/MarqueeBanner';
import { ProductCarouselSection } from './components/ProductCarouselSection';
import { CategoryPageView } from './components/CategoryPageView';
import { ProductModal } from './components/ProductModal';
import { CorporateQuoteSection } from './components/CorporateQuoteSection';
import { TechnicalSections } from './components/TechnicalSections';
import { QuoteDrawer } from './components/QuoteDrawer';
import { ChatbotWidget } from './components/ChatbotWidget';
import { Footer } from './components/Footer';

const STORAGE_KEY = 'wha_mountain_quote_cart_v1';

export function AppContent() {
  const [activeView, setActiveView] = useState<ActivePageView>('home');
  const [casacasTab, setCasacasTab] = useState<string>('top');
  const [equipTab, setEquipTab] = useState<string>('all');
  const [activeProductModal, setActiveProductModal] = useState<Product | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [quickSearchText, setQuickSearchText] = useState('');
  const [categoryInitialSearch, setCategoryInitialSearch] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const quickSearchInputRef = useRef<HTMLInputElement>(null);

  const [cartItems, setCartItems] = useState<QuoteItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Deep-link support (?producto=CAS-02 or ?categoria=Casacas)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const codeParam = params.get('producto');
    if (codeParam) {
      const found = CATALOG_PRODUCTS.find(
        (p) => p.code.toLowerCase() === codeParam.toLowerCase()
      );
      if (found) {
        setActiveProductModal(found);
      }
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
    } catch {
      // Ignore storage quota issues
    }
  }, [cartItems]);

  useEffect(() => {
    if (!searchModalOpen) return;
    if (window.matchMedia?.('(pointer: fine)').matches) {
      window.requestAnimationFrame(() => quickSearchInputRef.current?.focus());
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSearchModalOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [searchModalOpen]);

  const handleNavigateView = useCallback((view: ActivePageView, searchSeed: string = '') => {
    setCategoryInitialSearch(searchSeed);
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4500);
  }, []);

  const handleSelectProduct = useCallback((product: Product) => {
    setActiveProductModal(product);
  }, []);

  const handleAddToCart = useCallback((
    product: Product,
    size: string,
    quantity: number,
    withLogo: boolean
  ) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.size === size &&
          item.withLogo === withLogo
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      }
      return [...prev, { product, size, quantity, withLogo }];
    });
  }, []);

  const handleUpdateQuantity = (index: number, newQuantity: number) => {
    setCartItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, quantity: newQuantity } : item))
    );
  };

  const handleToggleLogo = (index: number) => {
    setCartItems((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, withLogo: !item.withLogo } : item
      )
    );
  };

  const handleRemoveItem = (index: number) => {
    setCartItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // 1. Featured Star Products Carousel Data
  const featuredProducts = useMemo(() => {
    const priorityCodes = [
      'CAS-33',
      'CAS-02',
      'M-03',
      'CAS-16',
      'CAS-09',
      'CH-01',
      'CAS-11',
      'CAS-40',
      'CAS-01',
      'PT-03',
    ];
    const prioritized = priorityCodes
      .map((code) => CATALOG_PRODUCTS.find((p) => p.code === code))
      .filter((p): p is Product => Boolean(p));

    const extraFeatured = CATALOG_PRODUCTS.filter(
      (p) => p.isFeatured && !priorityCodes.includes(p.code)
    );
    return [...prioritized, ...extraFeatured].slice(0, 12);
  }, []);

  // 2. Casacas Técnicas Carousel Data (Filtered by Quick Tab)
  const casacasCarouselProducts = useMemo(() => {
    const allCasacas = CATALOG_PRODUCTS.filter((p) => p.category === 'Casacas');
    if (casacasTab === 'extreme') {
      return allCasacas
        .filter(
          (p) =>
            p.thermal.toLowerCase().includes('thinsulate') ||
            p.tempRating.includes('-20') ||
            p.tempRating.includes('-15')
        )
        .slice(0, 12);
    }
    if (casacasTab === 'outdoor') {
      return allCasacas
        .filter((p) => p.reflective === 'Sin Cinta Reflectiva')
        .slice(0, 12);
    }
    if (casacasTab === 'softshell') {
      return allCasacas.filter((p) => p.fabric === 'Softshell').slice(0, 12);
    }
    return allCasacas.slice(0, 12);
  }, [casacasTab]);

  // 3. Chalecos Industriales & Mamelucos Carousel Data
  const equipCarouselProducts = useMemo(() => {
    if (equipTab === 'chalecos') {
      return CATALOG_PRODUCTS.filter((p) => p.category === 'Chalecos');
    }
    if (equipTab === 'mamelucos') {
      return CATALOG_PRODUCTS.filter((p) => p.category === 'Mamelucos y Conjuntos');
    }
    if (equipTab === 'pantalones') {
      return CATALOG_PRODUCTS.filter((p) => p.category === 'Pantalones');
    }
    const chalecos = CATALOG_PRODUCTS.filter((p) => p.category === 'Chalecos');
    const mamelucos = CATALOG_PRODUCTS.filter(
      (p) => p.category === 'Mamelucos y Conjuntos'
    );
    const pantalones = CATALOG_PRODUCTS.filter((p) => p.category === 'Pantalones');
    const mixed: Product[] = [];
    const maxLen = Math.max(chalecos.length, mamelucos.length, pantalones.length);
    for (let i = 0; i < maxLen; i++) {
      if (mamelucos[i]) mixed.push(mamelucos[i]);
      if (chalecos[i]) mixed.push(chalecos[i]);
      if (pantalones[i]) mixed.push(pantalones[i]);
    }
    return mixed;
  }, [equipTab]);

  // Quick Search Instant Matches
  const quickSearchResults = useMemo(() => {
    const q = quickSearchText.toLowerCase().trim();
    if (!q) return featuredProducts.slice(0, 5);
    return CATALOG_PRODUCTS.filter((p) => {
      return (
        p.code.toLowerCase().includes(q) ||
        p.code.replace('-', '').toLowerCase().includes(q) ||
        p.title.toLowerCase().includes(q) ||
        p.fabric.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }).slice(0, 8);
  }, [quickSearchText, featuredProducts]);

  const totalCartUnits = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const equipTargetView: ActivePageView =
    equipTab === 'chalecos'
      ? 'Chalecos'
      : equipTab === 'mamelucos'
        ? 'Mamelucos y Conjuntos'
        : equipTab === 'pantalones'
          ? 'Pantalones'
          : 'Chalecos y Mamelucos';

  return (
    <div
      className="min-h-screen flex flex-col transition-colors duration-500"
      style={{
        background: 'var(--bg-primary)',
        color: 'var(--text-main)',
      }}
    >
      <a href="#main-content" className="skip-link">
        Saltar al catálogo principal
      </a>

      {/* Top Compact Marquee Strip */}
      <MarqueeBanner
        variant="dark-glass"
        compact
        items={[
          'ENVÍOS DIARIOS A TODO EL PERÚ ⚡',
          'RESISTENCIA EXTREMA -20°C ❄️',
          'HIPORA® IMPERMEABLE & THINSULATE™ 3M 🛡️',
          'ATENCIÓN POR UNIDAD Y MAYORISTA RUC 20 🏢',
          'WHATSAPP DIRECTO: 910 363 522 📱',
        ]}
      />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-24 left-1/2 -translate-x-1/2 z-50 max-w-md w-[92%] px-5 py-3.5 rounded-full glass-modal flex items-center gap-3"
          style={{
            border: '2px solid var(--accent-primary)',
            boxShadow: 'var(--card-glow)',
          }}
        >
          <CheckCircle2
            className="w-5 h-5 shrink-0"
            style={{ color: 'var(--accent-secondary)' }}
            aria-hidden="true"
          />
          <span
            className="text-xs sm:text-sm font-bold leading-snug"
            style={{ color: 'var(--text-main)' }}
          >
            {toastMessage}
          </span>
        </div>
      )}

      {/* Floating Pill Glassmorphism Navbar with Centered PNG Logo (Noche Alpina) */}
      <Navbar
        cartCount={totalCartUnits}
        onOpenCart={() => setCartOpen(true)}
        activeView={activeView}
        onNavigateView={handleNavigateView}
        onOpenSearchModal={() => setSearchModalOpen(true)}
      />

      {/* Main Content: Promotional Storefront vs Simulated Exclusive Category Page */}
      <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
        {activeView === 'home' ? (
          <>
            {/* 1. Hero Section with Animated Liquid Gradient + Organic Blob + 3D Out-of-Box Garment */}
            <HeroSection
              onSelectProduct={handleSelectProduct}
              onAddToCart={handleAddToCart}
              onNavigateView={handleNavigateView}
              onToast={showToast}
            />

            {/* 2. High-Impact Infinite Marquee */}
            <MarqueeBanner variant="gold" />

            {/* 3. Sección "Destacados" (Carrusel Dinámico SOLO Productos Estrella) */}
            <ProductCarouselSection
              id="destacados"
              eyebrow="DROPS ESTRELLA • SELECCIÓN OFICIAL"
              title="LOS MÁS PEDIDOS"
              highlightWord="-20°C EXTREMO"
              subtitle="Nuestros modelos insignia probados en tajo abierto, socavón y cordillera a más de 4,800 m.s.n.m. Desliza para explorar y cotizar al instante."
              products={featuredProducts}
              accentTheme="gold"
              featuredStyle
              viewMoreLabel="Ver los 79 Modelos"
              viewMoreCount={79}
              onViewMore={() => handleNavigateView('Todas')}
              onSelectProduct={handleSelectProduct}
              onAddToCart={handleAddToCart}
              onToast={showToast}
            />

            {/* 4. Carrusel Categoría #1: Casacas Técnicas */}
            <ProductCarouselSection
              id="carrusel-casacas"
              eyebrow="DIVISIÓN TÉRMICA • CÓDIGOS CAS-01 AL CAS-63"
              title="CASACAS"
              highlightWord="TÉCNICAS HIPORA®"
              subtitle="Impermeables, cortaviento y térmicas con Thinsulate™ 3M, panel Termoreflectivo y cierres industriales marca REY."
              products={casacasCarouselProducts}
              accentTheme="cyan"
              tabs={[
                { id: 'top', label: 'Selección Top', count: 12 },
                { id: 'extreme', label: 'Frío Extremo -20°C (3M)' },
                { id: 'outdoor', label: 'Alta Montaña (Sin Cinta)' },
                { id: 'softshell', label: 'Ejecutivas Softshell' },
              ]}
              activeTab={casacasTab}
              onTabChange={setCasacasTab}
              viewMoreLabel="Ver más Casacas"
              viewMoreCount={63}
              pdfDownloadUrl="./catalogos/Catalogo_WHA_MOUNTAIN_Casacas.pdf"
              onViewMore={() => handleNavigateView('Casacas')}
              onSelectProduct={handleSelectProduct}
              onAddToCart={handleAddToCart}
              onToast={showToast}
            />

            {/* 5. Secondary Vibrant Infinite Marquee (Reverse Direction) */}
            <MarqueeBanner
              variant="cyan"
              reverse
              items={[
                'CHALECOS GEÓLOGOS DRILL NUEVO MUNDO',
                'MAMELUCOS TÉRMICOS -20°C SOCAVÓN & TAJO ABIERTO',
                'CINTA REFLECTIVA 3M™ NORMA MINERA D.S. 024-2016-EM',
                'BORDADO COMPUTARIZADO DE LOGOTIPOS',
                'FACTURA ELECTRÓNICA RUC 20 / RUC 10',
              ]}
            />

            {/* 6. Carrusel Categoría #2: Chalecos Industriales, Mamelucos & Pantalones */}
            <ProductCarouselSection
              id="carrusel-equipamiento"
              eyebrow="INGENIERÍA & PROTECCIÓN INTEGRAL"
              title="CHALECOS INDUSTRIALES"
              highlightWord="& MAMELUCOS -20°C"
              subtitle="Equipamiento de alto gramaje para geólogos, ingenieros supervisores y cuadrillas mineras en climas severos."
              products={equipCarouselProducts}
              accentTheme="gold"
              tabs={[
                { id: 'all', label: 'Todos', count: 16 },
                { id: 'chalecos', label: 'Chalecos Industriales', count: 6 },
                { id: 'mamelucos', label: 'Mamelucos Térmicos', count: 7 },
                { id: 'pantalones', label: 'Pantalones EPP', count: 3 },
              ]}
              activeTab={equipTab}
              onTabChange={setEquipTab}
              viewMoreLabel="Ver más en Categoría"
              viewMoreCount={
                equipTab === 'chalecos'
                  ? 6
                  : equipTab === 'mamelucos'
                    ? 7
                    : equipTab === 'pantalones'
                      ? 3
                      : 13
              }
              onViewMore={() => handleNavigateView(equipTargetView)}
              onSelectProduct={handleSelectProduct}
              onAddToCart={handleAddToCart}
              onToast={showToast}
            />

            {/* 7. NUEVO Módulo Corporativo B2B Glassmorphism (RUC, Razón Social, Volumen Estimado) */}
            <CorporateQuoteSection onToast={showToast} />

            {/* 8. Tecnología de 4 Capas + Empresas RUC + Tallas + FAQs */}
            <TechnicalSections />
          </>
        ) : (
          /* Simulated Exclusive Category Page */
          <CategoryPageView
            activeView={activeView}
            onNavigateView={(v) => handleNavigateView(v)}
            onSelectProduct={(p) => setActiveProductModal(p)}
            onAddToCart={handleAddToCart}
            onToast={showToast}
            initialSearch={categoryInitialSearch}
          />
        )}
      </main>

      {/* SEO Optimized Footer */}
      <Footer onNavigateView={(v) => handleNavigateView(v)} />

      {/* FLOATING MULTI-QUOTE INDICATOR (Bottom-Left) */}
      <div className="fixed bottom-4 left-3 sm:bottom-5 sm:left-5 z-40">
        <button
          type="button"
          onClick={() => setCartOpen(true)}
          className={`group flex items-center gap-2 sm:gap-2.5 px-3.5 sm:px-4 py-3 rounded-full cursor-pointer ${
            totalCartUnits > 0
              ? 'btn-neumorph-gold animate-badge-float'
              : 'pressable-pill glass-pill'
          }`}
          style={
            totalCartUnits === 0
              ? {
                  color: 'var(--text-main)',
                  border: '2px solid var(--border-accent)',
                  boxShadow: 'var(--card-glow)',
                }
              : undefined
          }
          title="Abrir Cotizador Múltiple para WhatsApp y PDF"
        >
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center font-mono-code tabular-nums font-black text-xs"
            style={{
              background: 'var(--bg-primary)',
              color: 'var(--accent-primary)',
            }}
          >
            {totalCartUnits}
          </div>
          <ShoppingBag className="w-4 h-4 hidden xs:block" aria-hidden="true" />
          <span className="font-display font-black text-xs uppercase tracking-wide">
            {totalCartUnits > 0 ? 'Cotizador Listo' : 'Cotizador'}
          </span>
        </button>
      </div>

      {/* Quick Search Glassmorphism Modal */}
      {searchModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Búsqueda rápida de prendas"
          className="fixed inset-0 z-50 bg-[#0b0f14]/82 backdrop-blur-md flex items-start justify-center p-4 pt-16 sm:pt-24"
          onClick={() => setSearchModalOpen(false)}
        >
          <div
            className="dialog-panel-enter overscroll-contain w-full max-w-xl glass-modal overflow-hidden"
            style={{
              borderRadius: '36px 22px 38px 24px',
              border: '2px solid var(--border-accent)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="p-4 border-b flex items-center gap-3"
              style={{ borderColor: 'var(--border-subtle)' }}
            >
              <Search
                className="w-5 h-5 shrink-0"
                style={{ color: 'var(--accent-secondary)' }}
                aria-hidden="true"
              />
              <input
                ref={quickSearchInputRef}
                type="text"
                spellCheck={false}
                value={quickSearchText}
                onChange={(e) => setQuickSearchText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setSearchModalOpen(false);
                    handleNavigateView('Todas', quickSearchText);
                  }
                }}
                aria-label="Buscar por código, tela o modelo"
                placeholder="Busca por código (CAS-02, M-03, CH-01), Hipora, Thinsulate…"
                className="flex-1 bg-transparent text-sm sm:text-base font-medium focus:outline-none"
                style={{ color: 'var(--text-main)' }}
              />
              <button
                type="button"
                onClick={() => setSearchModalOpen(false)}
                aria-label="Cerrar búsqueda rápida"
                className="pressable-pill p-2 rounded-full cursor-pointer"
                style={{
                  background: 'var(--surface-elevated)',
                  color: 'var(--text-main)',
                }}
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            <div className="p-3 max-h-[60vh] overflow-y-auto overscroll-contain space-y-2">
              <div
                className="px-2 py-1 flex items-center justify-between text-[11px]"
                style={{ color: 'var(--text-secondary)' }}
              >
                <span>
                  {quickSearchText.trim()
                    ? 'Resultados instantáneos'
                    : 'Sugerencias Estrella (-20°C)'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSearchModalOpen(false);
                    handleNavigateView('Todas', quickSearchText);
                  }}
                  className="font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                  style={{ color: 'var(--accent-secondary)' }}
                >
                  <span>Ver en catálogo completo</span>
                  <ArrowRight className="w-3 h-3" aria-hidden="true" />
                </button>
              </div>

              {quickSearchResults.map((prod) => (
                <div
                  key={prod.id}
                  className="p-2.5 rounded-2xl flex items-center gap-3 transition-colors"
                  style={{
                    background: 'var(--surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setSearchModalOpen(false);
                      setActiveProductModal(prod);
                    }}
                    className="flex items-center gap-3 flex-1 min-w-0 text-left cursor-pointer group"
                    aria-label={`Ver ficha técnica de ${prod.code} - ${prod.title}`}
                  >
                    <div className="blob-stage w-12 h-12 p-1 shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                      <img
                        src={prod.primaryImage}
                        alt={prod.code}
                        width={48}
                        height={48}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          translate="no"
                          className="px-2 py-0.5 rounded-full font-mono-code tabular-nums font-black text-[10px]"
                          style={{
                            background: 'var(--accent-primary)',
                            color: 'var(--text-on-accent)',
                          }}
                        >
                          {prod.code}
                        </span>
                        <span
                          className="text-[11px] font-bold truncate"
                          style={{ color: 'var(--accent-secondary)' }}
                        >
                          {prod.fabric}
                        </span>
                      </div>
                      <p
                        className="text-xs font-bold truncate mt-0.5 group-hover:underline"
                        style={{ color: 'var(--text-main)' }}
                      >
                        {prod.title}
                      </p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleAddToCart(prod, 'L', 1, false);
                      showToast(`⚡ ${prod.code} añadido al Cotizador Múltiple.`);
                    }}
                    className="btn-neumorph-gold px-3.5 py-1.5 rounded-full font-display font-black text-[10px] uppercase flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <Plus className="w-3 h-3 stroke-[3]" aria-hidden="true" />
                    <span>Cotizar</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Product Detail Technical Modal */}
      <ProductModal
        product={activeProductModal}
        onClose={() => setActiveProductModal(null)}
        onAddToCart={handleAddToCart}
        onToast={showToast}
      />

      {/* Multi-Item Quote Drawer */}
      <QuoteDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onToggleLogo={handleToggleLogo}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onToast={showToast}
      />

      {/* Floating Virtual Advisor / AI Specialist Chatbot (Bottom-Right) */}
      <ChatbotWidget
        onSelectCategory={(cat: ProductCategory | 'Todas') => {
          handleNavigateView(cat);
        }}
        onSelectProduct={(prod) => setActiveProductModal(prod)}
        onAddToCart={handleAddToCart}
        onToast={showToast}
      />
    </div>
  );
}

export function App() {
  return <AppContent />;
}

export default App;
