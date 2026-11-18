import React, { useEffect, useState } from 'react';
import {
  Phone,
  ShoppingBag,
  Menu,
  X,
  Search,
  Facebook,
  FileDown,
  Smartphone,
  Copy,
  Check,
  UserCheck,
  Flame,
  ChevronRight,
  Sparkles,
  Home,
  Building2,
  Layers,
  Ruler,
} from 'lucide-react';
import {
  BRAND_CONFIG,
  FULL_CATALOG_PDF_URL,
} from '../data/catalog';
import { openWhatsAppOrder } from '../utils/conversion';

export type ActivePageView =
  | 'home'
  | 'Casacas'
  | 'Chalecos'
  | 'Mamelucos y Conjuntos'
  | 'Pantalones'
  | 'Chalecos y Mamelucos'
  | 'Todas';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  activeView: ActivePageView;
  onNavigateView: (view: ActivePageView) => void;
  onOpenSearchModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  onOpenCart,
  activeView,
  onNavigateView,
  onOpenSearchModal,
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [lanUrl, setLanUrl] = useState('http://192.168.1.33:5173/');
  const [copiedUrl, setCopiedUrl] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!drawerOpen && !qrModalOpen && !userMenuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDrawerOpen(false);
        setQrModalOpen(false);
        setUserMenuOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [drawerOpen, qrModalOpen, userMenuOpen]);

  useEffect(() => {
    fetch('./lan-info.json')
      .then((r) => r.json())
      .then((data) => {
        if (data && data.url) setLanUrl(data.url);
      })
      .catch(() => {
        // Fallback LAN URL
      });
  }, []);

  const handleSelectNav = (view: ActivePageView) => {
    onNavigateView(view);
    setDrawerOpen(false);
    setUserMenuOpen(false);
  };

  const handleJumpSection = (sectionId: string) => {
    setDrawerOpen(false);
    setUserMenuOpen(false);
    if (activeView !== 'home') {
      onNavigateView('home');
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      }, 120);
    } else {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCopyLanUrl = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(lanUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  return (
    <>
      {/* FLOATING PILL GLASSMORPHISM NAVBAR */}
      <header className="sticky top-2.5 sm:top-3.5 z-40 w-full px-2 sm:px-5 lg:px-8 transition-transform duration-300 pointer-events-none">
        <div
          className={`max-w-7xl mx-auto rounded-full glass-navbar pointer-events-auto transition-[padding,transform] duration-200 px-3 sm:px-6 ${
            scrolled ? 'py-1.5 sm:py-2 scale-[0.99]' : 'py-2 sm:py-2.5'
          }`}
        >
          {/* 3-Column Symmetric Layout so PNG Logo is ALWAYS Mathematically Centered */}
          <div className="grid grid-cols-3 items-center min-h-[52px] sm:min-h-[62px]">
            {/* LEFT SIDE: Hamburger Menu + Quick Desktop Pills */}
            <div className="flex items-center gap-1.5 sm:gap-2 justify-self-start">
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="pressable-pill group inline-flex items-center gap-2 p-2.5 sm:px-3.5 sm:py-2 rounded-full cursor-pointer"
                style={{
                  background: 'var(--surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-main)',
                }}
                aria-label="Abrir menú de categorías"
                aria-expanded={drawerOpen}
              >
                <Menu
                  className="w-5 h-5 group-hover:scale-110 transition-transform duration-150"
                  style={{ color: 'var(--accent-secondary)' }}
                  aria-hidden="true"
                />
                <span className="hidden md:inline font-display font-extrabold text-xs tracking-wide uppercase">
                  Menú
                </span>
              </button>

              {/* Desktop Quick Category Shortcuts */}
              <nav className="hidden xl:flex items-center gap-1" aria-label="Categorías principales">
                <button
                  type="button"
                  onClick={() => handleSelectNav('Casacas')}
                  className="pressable-pill px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer"
                  style={
                    activeView === 'Casacas'
                      ? {
                          background: 'var(--accent-primary)',
                          color: 'var(--text-on-accent)',
                          fontWeight: 800,
                        }
                      : {
                          color: 'var(--text-secondary)',
                        }
                  }
                >
                  Casacas -20°C
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectNav('Chalecos y Mamelucos')}
                  className="pressable-pill px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer"
                  style={
                    activeView === 'Chalecos y Mamelucos' ||
                    activeView === 'Chalecos' ||
                    activeView === 'Mamelucos y Conjuntos'
                      ? {
                          background: 'var(--accent-primary)',
                          color: 'var(--text-on-accent)',
                          fontWeight: 800,
                        }
                      : {
                          color: 'var(--text-secondary)',
                        }
                  }
                >
                  Chalecos & Mamelucos
                </button>
              </nav>
            </div>

            {/* CENTER: Official WHA MOUNTAIN PNG Logo — Dead Center inside Pill Navbar */}
            <div className="justify-self-center flex items-center justify-center">
              <button
                type="button"
                onClick={() => handleSelectNav('home')}
                className="pressable-pill group relative flex items-center justify-center px-3.5 py-1.5 sm:px-5 sm:py-1.5 rounded-full bg-[#e6f2fb] cursor-pointer"
                style={{
                  border: '2px solid var(--accent-primary)',
                  boxShadow: 'var(--card-glow)',
                }}
                title="WHA MOUNTAIN PERÚ — Volver al Inicio"
              >
                <img
                  src="./images/brand/logo-wha-cropped.png"
                  alt="WHA MOUNTAIN PERÚ Logo Oficial"
                  width={165}
                  height={36}
                  className="h-6 sm:h-8 md:h-9 w-auto max-w-[118px] sm:max-w-[165px] object-contain select-none"
                />
                <span
                  translate="no"
                  className="hidden sm:inline-block absolute -bottom-2 px-2 py-0.5 rounded-full text-[8px] font-mono-code tabular-nums font-bold uppercase tracking-widest"
                  style={{
                    background: 'var(--bg-primary)',
                    color: 'var(--accent-secondary)',
                    border: '1px solid var(--border-accent)',
                  }}
                >
                  PERÚ • -20°C
                </span>
              </button>
            </div>

            {/* RIGHT SIDE: B2B Jump + Search + User/RUC + Quote Cart */}
            <div className="flex items-center gap-1 sm:gap-2 justify-self-end">
              <button
                type="button"
                onClick={() => handleJumpSection('cotizacion-corporativa')}
                className="pressable-pill hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold cursor-pointer"
                style={{
                  background: 'var(--surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--accent-secondary)',
                }}
              >
                <Building2 className="w-3.5 h-3.5" style={{ color: 'var(--accent-primary)' }} aria-hidden="true" />
                <span>Empresas B2B</span>
              </button>

              {/* Quick Search Trigger */}
              <button
                type="button"
                onClick={onOpenSearchModal}
                className="pressable-pill p-2.5 sm:p-2.5 rounded-full cursor-pointer"
                style={{
                  background: 'var(--surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-main)',
                }}
                title="Buscar prenda por código o tela (ej. CAS-02, M-03)"
                aria-label="Buscar en catálogo"
              >
                <Search
                  className="w-4 h-4 sm:w-[18px] sm:h-[18px]"
                  style={{ color: 'var(--accent-secondary)' }}
                  aria-hidden="true"
                />
              </button>

              {/* User / B2B Corporate RUC Account Menu */}
              <div className="relative hidden sm:block">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((prev) => !prev)}
                  aria-expanded={userMenuOpen}
                  className="pressable-pill p-2 sm:p-2.5 rounded-full flex items-center gap-1.5 cursor-pointer"
                  style={{
                    background: 'var(--surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-main)',
                  }}
                  title="Cuenta Empresas RUC / Acceso Móvil QR"
                  aria-label="Opciones de cliente y empresas"
                >
                  <UserCheck
                    className="w-4 h-4 sm:w-[18px] sm:h-[18px]"
                    style={{ color: 'var(--accent-primary)' }}
                    aria-hidden="true"
                  />
                  <span translate="no" className="hidden lg:inline text-xs font-bold">
                    RUC
                  </span>
                </button>

                {userMenuOpen && (
                  <div
                    className="dialog-panel-enter absolute right-0 mt-3 w-64 glass-modal p-3 space-y-1.5 z-50 origin-top-right"
                    style={{ borderRadius: '26px 18px 28px 20px' }}
                  >
                    <div
                      className="px-2.5 py-1.5 border-b"
                      style={{ borderColor: 'var(--border-subtle)' }}
                    >
                      <p
                        className="text-[10px] font-mono-code font-bold uppercase"
                        style={{ color: 'var(--accent-secondary)' }}
                      >
                        PORTAL CLIENTES & EMPRESAS
                      </p>
                      <p
                        className="text-xs font-bold"
                        style={{ color: 'var(--text-main)' }}
                      >
                        Atención Unidad y Mayorista
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleJumpSection('cotizacion-corporativa')}
                      className="w-full text-left px-3 py-2 rounded-xl hover:opacity-80 text-xs font-semibold flex items-center justify-between cursor-pointer"
                      style={{ color: 'var(--text-main)' }}
                    >
                      <span>Cotización Empresas (RUC 20)</span>
                      <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        setQrModalOpen(true);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:opacity-80 text-xs font-semibold flex items-center justify-between cursor-pointer"
                      style={{ color: 'var(--text-main)' }}
                    >
                      <span>Abrir en Celular (Código QR)</span>
                      <Smartphone
                        className="w-3.5 h-3.5"
                        style={{ color: 'var(--accent-secondary)' }}
                        aria-hidden="true"
                      />
                    </button>
                    <a
                      href={FULL_CATALOG_PDF_URL}
                      download
                      onClick={() => setUserMenuOpen(false)}
                      className="w-full text-left px-3 py-2 rounded-xl hover:opacity-80 text-xs font-semibold flex items-center justify-between"
                      style={{ color: 'var(--accent-primary)' }}
                    >
                      <span>Descargar Catálogo PDF (79)</span>
                      <FileDown className="w-3.5 h-3.5" aria-hidden="true" />
                    </a>
                  </div>
                )}
              </div>

              {/* Quote Cart Button (Neumorphic Primary Highlight Pill) */}
              <button
                type="button"
                onClick={onOpenCart}
                className="btn-neumorph-gold relative inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2 rounded-full font-display font-black text-xs uppercase tracking-wide cursor-pointer"
                title="Abrir Cotizador Múltiple para WhatsApp / PDF"
                aria-label={`Abrir carrito de cotización (${cartCount} prendas)`}
              >
                <ShoppingBag className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
                <span className="hidden md:inline">Cotizar</span>
                <span
                  className="inline-flex items-center justify-center min-w-[20px] h-[20px] px-1.5 rounded-full text-[11px] font-mono-code tabular-nums font-extrabold shadow-inner"
                  style={{
                    background: 'var(--bg-primary)',
                    color: 'var(--accent-primary)',
                  }}
                >
                  {cartCount}
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Glassmorphism Slide-Out Navigation Drawer (Mobile & Desktop Mega-Drawer) */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#0b0f14]/80 backdrop-blur-sm flex justify-start"
          role="dialog"
          aria-modal="true"
          aria-label="Menú principal WHA MOUNTAIN"
          onClick={() => setDrawerOpen(false)}
        >
          <aside
            className="dialog-panel-enter overscroll-contain w-[88vw] max-w-sm h-full glass-modal p-5 flex flex-col justify-between overflow-y-auto"
            style={{
              borderRight: '1px solid var(--border-accent)',
              borderRadius: '0 32px 32px 0',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-5">
              {/* Top Drawer Header */}
              <div
                className="flex items-center justify-between pb-4 border-b"
                style={{ borderColor: 'var(--border-subtle)' }}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="px-2.5 py-1 rounded-full bg-[#e6f2fb]"
                    style={{ border: '1px solid var(--accent-primary)' }}
                  >
                    <img
                      src="./images/brand/logo-wha-cropped.png"
                      alt="WHA MOUNTAIN"
                      width={110}
                      height={24}
                      className="h-6 w-auto object-contain"
                    />
                  </div>
                  <span
                    className="text-[10px] font-mono-code font-bold uppercase"
                    style={{ color: 'var(--accent-secondary)' }}
                  >
                    TIENDA OFICIAL
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="pressable-pill p-2.5 rounded-full cursor-pointer"
                  style={{
                    background: 'var(--surface-elevated)',
                    color: 'var(--text-main)',
                  }}
                  aria-label="Cerrar menú"
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>

              {/* Navigation Items */}
              <div className="space-y-2">
                <p
                  className="text-[10px] font-mono-code font-bold uppercase tracking-widest px-1"
                  style={{ color: 'var(--accent-primary)' }}
                >
                  COLECCIONES & DROPS -20°C
                </p>

                {(
                  [
                    {
                      view: 'home' as ActivePageView,
                      label: 'Inicio Promocional (Drops)',
                      badge: 'HOT',
                      icon: Home,
                    },
                    {
                      view: 'Casacas' as ActivePageView,
                      label: 'Casacas Técnicas (-20°C)',
                      badge: '63',
                      icon: Flame,
                    },
                    {
                      view: 'Chalecos y Mamelucos' as ActivePageView,
                      label: 'Chalecos & Mamelucos',
                      badge: '13',
                      icon: Sparkles,
                    },
                    {
                      view: 'Chalecos' as ActivePageView,
                      label: 'Solo Chalecos Geólogos',
                      badge: '6',
                      icon: Sparkles,
                    },
                    {
                      view: 'Mamelucos y Conjuntos' as ActivePageView,
                      label: 'Solo Mamelucos Térmicos',
                      badge: '7',
                      icon: Sparkles,
                    },
                    {
                      view: 'Pantalones' as ActivePageView,
                      label: 'Pantalones Industriales',
                      badge: '3',
                      icon: Sparkles,
                    },
                    {
                      view: 'Todas' as ActivePageView,
                      label: 'Catálogo Completo WHA',
                      badge: '79',
                      icon: Sparkles,
                    },
                  ] as const
                ).map((item) => {
                  const Icon = item.icon;
                  const active = activeView === item.view;
                  return (
                    <button
                      key={item.view}
                      type="button"
                      onClick={() => handleSelectNav(item.view)}
                      className="pressable-pill w-full px-3.5 py-2.5 rounded-2xl flex items-center justify-between text-left font-display font-bold text-xs sm:text-sm cursor-pointer"
                      style={
                        active
                          ? {
                              background: 'var(--accent-primary)',
                              color: 'var(--text-on-accent)',
                            }
                          : {
                              background: 'var(--surface-elevated)',
                              color: 'var(--text-main)',
                              border: '1px solid var(--border-subtle)',
                            }
                      }
                    >
                      <span className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                        <span>{item.label}</span>
                      </span>
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-mono-code tabular-nums font-extrabold"
                        style={
                          active
                            ? {
                                background: 'var(--bg-primary)',
                                color: 'var(--accent-primary)',
                              }
                            : {
                                background: 'var(--surface-glass)',
                                color: 'var(--accent-secondary)',
                              }
                        }
                      >
                        {item.badge}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Quick Corporate & Tech Jump Links (SVG icons instead of emojis) */}
              <div
                className="pt-3 border-t space-y-2"
                style={{ borderColor: 'var(--border-subtle)' }}
              >
                <p
                  className="text-[10px] font-mono-code font-bold uppercase tracking-widest px-1"
                  style={{ color: 'var(--accent-secondary)' }}
                >
                  INGENIERÍA & EMPRESAS
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleJumpSection('tecnologia')}
                    className="pressable-pill px-3 py-2.5 rounded-xl text-xs font-bold text-left flex items-center gap-1.5 cursor-pointer"
                    style={{
                      background: 'var(--surface-elevated)',
                      color: 'var(--text-main)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <Layers className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--accent-primary)' }} aria-hidden="true" />
                    <span>4 Capas -20°C</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleJumpSection('cotizacion-corporativa')}
                    className="pressable-pill px-3 py-2.5 rounded-xl text-xs font-bold text-left flex items-center gap-1.5 cursor-pointer"
                    style={{
                      background: 'var(--surface-elevated)',
                      color: 'var(--text-main)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <Building2 className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--accent-secondary)' }} aria-hidden="true" />
                    <span>Cotizar RUC 20</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleJumpSection('tallas')}
                    className="pressable-pill px-3 py-2.5 rounded-xl text-xs font-bold text-left flex items-center gap-1.5 cursor-pointer"
                    style={{
                      background: 'var(--surface-elevated)',
                      color: 'var(--text-main)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <Ruler className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--accent-primary)' }} aria-hidden="true" />
                    <span>Guía de Tallas</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDrawerOpen(false);
                      setQrModalOpen(true);
                    }}
                    className="pressable-pill px-3 py-2.5 rounded-xl text-xs font-bold text-left flex items-center gap-1.5 cursor-pointer"
                    style={{
                      background: 'var(--surface-elevated)',
                      color: 'var(--accent-secondary)',
                      border: '1px solid var(--border-accent)',
                    }}
                  >
                    <Smartphone className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span>QR Celular</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Drawer Direct Contact */}
            <div
              className="pt-5 mt-5 border-t space-y-2.5"
              style={{ borderColor: 'var(--border-subtle)' }}
            >
              <a
                href={FULL_CATALOG_PDF_URL}
                download
                className="pressable-pill w-full py-2.5 px-4 rounded-full font-bold text-xs flex items-center justify-center gap-2"
                style={{
                  background: 'var(--surface-elevated)',
                  color: 'var(--accent-primary)',
                  border: '1px solid var(--border-accent)',
                }}
              >
                <FileDown className="w-4 h-4" aria-hidden="true" />
                <span>Descargar Catálogo PDF (79 Modelos)</span>
              </a>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    openWhatsAppOrder(
                      `¡Hola *WHA MOUNTAIN PERÚ*! ⚡ Vi su tienda online y deseo cotizar ropa técnica.`
                    )
                  }
                  className="btn-neumorph-gold py-2.5 px-3 rounded-full font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5" aria-hidden="true" />
                  <span className="tabular-nums">{BRAND_CONFIG.whatsappDisplay}</span>
                </button>
                <a
                  href={BRAND_CONFIG.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pressable-pill py-2.5 px-3 rounded-full font-bold text-xs flex items-center justify-center gap-1.5"
                  style={{
                    background: 'var(--surface-elevated)',
                    color: 'var(--text-main)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <Facebook
                    className="w-3.5 h-3.5"
                    style={{ color: 'var(--accent-secondary)' }}
                    aria-hidden="true"
                  />
                  <span>Facebook</span>
                </a>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Modal QR para Probar en Celular Real */}
      {qrModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#0b0f14]/82 backdrop-blur-md flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="qr-modal-title"
          onClick={() => setQrModalOpen(false)}
        >
          <div
            className="dialog-panel-enter overscroll-contain w-full max-w-sm glass-modal overflow-hidden text-center"
            style={{ borderRadius: '34px 22px 36px 24px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="px-5 py-4 flex items-center justify-between border-b"
              style={{ borderColor: 'var(--border-subtle)' }}
            >
              <div className="flex items-center gap-2">
                <Smartphone
                  className="w-5 h-5"
                  style={{ color: 'var(--accent-secondary)' }}
                  aria-hidden="true"
                />
                <span
                  id="qr-modal-title"
                  className="font-display font-extrabold text-sm"
                  style={{ color: 'var(--text-main)' }}
                >
                  Abrir Tienda en tu Celular
                </span>
              </div>
              <button
                type="button"
                onClick={() => setQrModalOpen(false)}
                aria-label="Cerrar código QR"
                className="pressable-pill p-2 rounded-full cursor-pointer"
                style={{
                  background: 'var(--surface-elevated)',
                  color: 'var(--text-main)',
                }}
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p
                className="text-xs leading-relaxed"
                style={{ color: 'var(--text-secondary)' }}
              >
                Conecta tu celular a la{' '}
                <strong style={{ color: 'var(--accent-primary)' }}>
                  misma red Wi-Fi
                </strong>{' '}
                y escanea este código QR:
              </p>

              <div
                className="w-52 h-52 mx-auto p-3 rounded-3xl bg-[#e6f2fb] flex items-center justify-center"
                style={{
                  border: '2px solid var(--accent-secondary)',
                  boxShadow: 'var(--card-glow)',
                }}
              >
                <img
                  src="./images/brand/qr-celular.png"
                  alt="Código QR para abrir en celular"
                  width={208}
                  height={208}
                  className="w-full h-full object-contain"
                />
              </div>

              <div
                className="rounded-full p-2 flex items-center justify-between gap-2"
                style={{
                  background: 'var(--surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <span
                  translate="no"
                  className="font-mono-code font-bold text-xs truncate pl-2"
                  style={{ color: 'var(--accent-secondary)' }}
                >
                  {lanUrl}
                </span>
                <button
                  type="button"
                  onClick={handleCopyLanUrl}
                  className="pressable-pill px-3 py-1.5 rounded-full text-[11px] font-extrabold flex items-center gap-1 shrink-0 cursor-pointer"
                  style={{
                    background: 'var(--accent-primary)',
                    color: 'var(--text-on-accent)',
                  }}
                >
                  {copiedUrl ? (
                    <>
                      <Check className="w-3 h-3" aria-hidden="true" />
                      <span>Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" aria-hidden="true" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
