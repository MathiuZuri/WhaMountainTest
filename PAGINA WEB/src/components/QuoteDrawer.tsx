import React, { useEffect, useState } from 'react';
import {
  X,
  Trash2,
  Phone,
  Facebook,
  ShoppingBag,
  Building2,
  User,
  Sparkles,
  FileText,
} from 'lucide-react';
import { BRAND_CONFIG } from '../data/catalog';
import {
  QuoteItem,
  buildCartQuoteMessage,
  generatePrintableQuoteOrderPDF,
  openFacebookOrder,
  openWhatsAppOrder,
} from '../utils/conversion';

interface QuoteDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: QuoteItem[];
  onUpdateQuantity: (index: number, newQuantity: number) => void;
  onToggleLogo: (index: number) => void;
  onRemoveItem: (index: number) => void;
  onClearCart: () => void;
  onToast: (msg: string) => void;
}

export const QuoteDrawer: React.FC<QuoteDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onToggleLogo,
  onRemoveItem,
  onClearCart,
  onToast,
}) => {
  const [orderType, setOrderType] = useState<'personal' | 'empresa'>('empresa');
  const [customerName, setCustomerName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [ruc, setRuc] = useState('');
  const [city, setCity] = useState('Lima');
  const [notes, setNotes] = useState('');
  const [lastQuoteCode, setLastQuoteCode] = useState<string>('');

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const totalUnits = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleExportPDF = () => {
    if (items.length === 0) return;
    const code = generatePrintableQuoteOrderPDF(items, {
      orderType,
      customerName: customerName || 'Cliente Web',
      companyName,
      ruc,
      city,
      notes,
    });
    setLastQuoteCode(code);
    onToast(
      `📄 Orden de Cotización ${code} generada con fotos. Puedes guardarla como PDF y enviarla a nuestro WhatsApp.`
    );
  };

  const handleSendWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    const msg = buildCartQuoteMessage(
      items,
      {
        orderType,
        customerName,
        companyName,
        ruc,
        city,
        notes,
      },
      lastQuoteCode || undefined
    );
    openWhatsAppOrder(msg);
  };

  const handleSendFacebook = () => {
    if (items.length === 0) return;
    const msg = buildCartQuoteMessage(
      items,
      {
        orderType,
        customerName,
        companyName,
        ruc,
        city,
        notes,
      },
      lastQuoteCode || undefined
    );
    openFacebookOrder(msg, onToast);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#0b0f14]/80 backdrop-blur-md flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quote-drawer-title"
      onClick={onClose}
    >
      <div
        className="dialog-panel-enter overscroll-contain w-full max-w-lg glass-modal h-full flex flex-col justify-between overflow-hidden border-l"
        style={{ borderColor: 'var(--border-accent)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div
          className="px-5 py-4 flex items-center justify-between border-b shrink-0"
          style={{
            background: 'var(--bg-primary)',
            color: 'var(--text-main)',
            borderColor: 'var(--border-accent)',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl border flex items-center justify-center"
              style={{
                background: 'var(--surface-elevated)',
                borderColor: 'var(--border-accent)',
              }}
            >
              <ShoppingBag
                className="w-5 h-5"
                style={{ color: 'var(--accent-primary)' }}
                aria-hidden="true"
              />
            </div>
            <div>
              <h2
                id="quote-drawer-title"
                className="font-display font-black text-sm sm:text-base tabular-nums"
                style={{ color: 'var(--text-main)' }}
              >
                Cotizador Múltiple ({totalUnits} und.)
              </h2>
              <p
                className="text-[11px] font-medium"
                style={{ color: 'var(--accent-primary)' }}
              >
                Envío directo a WhatsApp o Exportación PDF con fotos
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="pressable-pill p-2.5 rounded-xl border cursor-pointer"
            style={{
              background: 'var(--surface-elevated)',
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-main)',
            }}
            aria-label="Cerrar cotizador múltiple"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Drawer Body */}
        <div
          className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5 space-y-5"
          style={{ color: 'var(--text-main)' }}
        >
          {items.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div
                className="w-16 h-16 rounded-3xl border flex items-center justify-center mx-auto"
                style={{
                  background: 'var(--surface-elevated)',
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--accent-primary)',
                }}
              >
                <ShoppingBag className="w-8 h-8" aria-hidden="true" />
              </div>
              <h3
                className="font-display font-extrabold text-base"
                style={{ color: 'var(--text-main)' }}
              >
                Tu Cotizador Múltiple está vacío
              </h3>
              <p
                className="text-xs max-w-xs mx-auto leading-relaxed"
                style={{ color: 'var(--text-secondary)' }}
              >
                Toca <strong style={{ color: 'var(--accent-primary)' }}>"+ Añadir a Cotización"</strong> en las prendas que te gusten para armar tu lista y cotizarla por WhatsApp o descargarla en PDF.
              </p>
            </div>
          ) : (
            <>
              {/* Selected Items List */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span
                    className="text-[11px] font-mono-code tabular-nums font-bold uppercase"
                    style={{ color: 'var(--accent-primary)' }}
                  >
                    Prendas Seleccionadas ({items.length})
                  </span>
                  <button
                    type="button"
                    onClick={onClearCart}
                    className="text-xs hover:underline font-bold cursor-pointer"
                    style={{ color: 'var(--accent-primary)' }}
                  >
                    Vaciar lista
                  </button>
                </div>

                {items.map((item, idx) => (
                  <div
                    key={`${item.product.id}-${item.size}-${idx}`}
                    className="p-3 rounded-2xl border flex gap-3 items-center"
                    style={{
                      background: 'var(--surface-elevated)',
                      borderColor: 'var(--border-subtle)',
                    }}
                  >
                    <img
                      src={item.product.primaryImage}
                      alt={item.product.code}
                      width={56}
                      height={56}
                      className="w-14 h-14 rounded-xl bg-[#e6f2fb] p-1 object-contain border shrink-0"
                      style={{ borderColor: 'var(--border-subtle)' }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          translate="no"
                          className="font-mono-code tabular-nums font-extrabold text-xs"
                          style={{ color: 'var(--accent-primary)' }}
                        >
                          {item.product.code} • Talla {item.size}
                        </span>
                        <button
                          type="button"
                          onClick={() => onRemoveItem(idx)}
                          className="cursor-pointer p-1.5 rounded-lg transition-colors hover:text-[#e6f2fb]"
                          style={{ color: 'var(--text-muted)' }}
                          title="Quitar prenda"
                          aria-label={`Quitar ${item.product.code} de cotización`}
                        >
                          <Trash2 className="w-4 h-4" aria-hidden="true" />
                        </button>
                      </div>
                      <h4
                        className="font-bold text-xs truncate"
                        style={{ color: 'var(--text-main)' }}
                      >
                        {item.product.title}
                      </h4>

                      <div className="flex items-center justify-between gap-2 mt-2">
                        <div
                          className="flex items-center border rounded-xl overflow-hidden"
                          style={{
                            background: 'var(--bg-primary)',
                            borderColor: 'var(--border-subtle)',
                          }}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateQuantity(idx, Math.max(1, item.quantity - 1))
                            }
                            aria-label={`Disminuir cantidad de ${item.product.code}`}
                            className="w-8 h-8 flex items-center justify-center text-xs font-extrabold cursor-pointer active:scale-90 transition-transform"
                            style={{ color: 'var(--accent-primary)' }}
                          >
                            -
                          </button>
                          <span
                            className="px-2.5 text-xs font-bold tabular-nums"
                            style={{ color: 'var(--text-main)' }}
                          >
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(idx, item.quantity + 1)}
                            aria-label={`Aumentar cantidad de ${item.product.code}`}
                            className="w-8 h-8 flex items-center justify-center text-xs font-extrabold cursor-pointer active:scale-90 transition-transform"
                            style={{ color: 'var(--accent-primary)' }}
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => onToggleLogo(idx)}
                          aria-pressed={item.withLogo}
                          className="pressable-pill px-2.5 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-1 border cursor-pointer"
                          style={
                            item.withLogo
                              ? {
                                background: 'var(--accent-primary)',
                                color: 'var(--text-on-accent)',
                                borderColor: 'var(--accent-primary)',
                                fontWeight: 800,
                              }
                              : {
                                background: 'var(--bg-primary)',
                                color: 'var(--text-secondary)',
                                borderColor: 'var(--border-subtle)',
                              }
                          }
                        >
                          <Sparkles className="w-3 h-3" aria-hidden="true" />
                          {item.withLogo ? 'Con Bordado' : 'Sin Bordado'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Customer / Company Information Form */}
              <form
                id="quote-form"
                onSubmit={handleSendWhatsApp}
                className="space-y-3.5 pt-4 border-t"
                style={{ borderColor: 'var(--border-subtle)' }}
              >
                <div
                  className="text-[11px] font-mono-code font-bold uppercase"
                  style={{ color: 'var(--accent-primary)' }}
                >
                  Datos para tu Cotización:
                </div>

                {/* Order Type Toggle */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setOrderType('empresa')}
                    aria-pressed={orderType === 'empresa'}
                    className="pressable-pill py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border cursor-pointer"
                    style={
                      orderType === 'empresa'
                        ? {
                          background: 'var(--accent-primary)',
                          color: 'var(--text-on-accent)',
                          borderColor: 'var(--accent-primary)',
                          fontWeight: 800,
                        }
                        : {
                          background: 'var(--surface-elevated)',
                          color: 'var(--text-secondary)',
                          borderColor: 'var(--border-subtle)',
                        }
                    }
                  >
                    <Building2 className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Empresa / RUC</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOrderType('personal')}
                    aria-pressed={orderType === 'personal'}
                    className="pressable-pill py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border cursor-pointer"
                    style={
                      orderType === 'personal'
                        ? {
                          background: 'var(--accent-primary)',
                          color: 'var(--text-on-accent)',
                          borderColor: 'var(--accent-primary)',
                          fontWeight: 800,
                        }
                        : {
                          background: 'var(--surface-elevated)',
                          color: 'var(--text-secondary)',
                          borderColor: 'var(--border-subtle)',
                        }
                    }
                  >
                    <User className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Compra Personal</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label
                      htmlFor="quote-contact-name"
                      className="block text-[11px] font-bold mb-1"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      Nombre de Contacto *
                    </label>
                    <input
                      id="quote-contact-name"
                      name="customerName"
                      type="text"
                      autoComplete="name"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Ej. Ing. Carlos Quispe…"
                      className="glass-input w-full px-3 py-2 rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="quote-city"
                      className="block text-[11px] font-bold mb-1"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      Ciudad / Unidad Minera *
                    </label>
                    <input
                      id="quote-city"
                      name="city"
                      type="text"
                      autoComplete="address-level2"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Ej. Arequipa, Pasco, Lima…"
                      className="glass-input w-full px-3 py-2 rounded-xl text-xs"
                    />
                  </div>
                </div>

                {orderType === 'empresa' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label
                        htmlFor="quote-company"
                        className="block text-[11px] font-bold mb-1"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        Razón Social / Contratista
                      </label>
                      <input
                        id="quote-company"
                        name="companyName"
                        type="text"
                        autoComplete="organization"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Ej. Minera / Constructora SAC…"
                        className="glass-input w-full px-3 py-2 rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="quote-ruc"
                        className="block text-[11px] font-bold mb-1"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        RUC
                      </label>
                      <input
                        id="quote-ruc"
                        name="ruc"
                        type="text"
                        inputMode="numeric"
                        autoComplete="off"
                        spellCheck={false}
                        maxLength={11}
                        value={ruc}
                        onChange={(e) => setRuc(e.target.value)}
                        placeholder="Ej. 20601234567"
                        className="glass-input w-full px-3 py-2 rounded-xl text-xs font-mono-code tabular-nums"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="quote-notes"
                    className="block text-[11px] font-bold mb-1"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Observaciones (Tallas surtidas, bordado, agencia)
                  </label>
                  <textarea
                    id="quote-notes"
                    name="notes"
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ej. Requerimos bordado en pecho y envío por Shalom…"
                    className="glass-input w-full px-3 py-2 rounded-xl text-xs"
                  />
                </div>
              </form>
            </>
          )}
        </div>

        {/* Drawer Footer: Send to WhatsApp + Export PDF */}
        {items.length > 0 && (
          <div
            className="p-4 sm:p-5 border-t space-y-2.5 shrink-0"
            style={{
              background: 'var(--bg-primary)',
              borderColor: 'var(--border-subtle)',
            }}
          >
            <button
              type="submit"
              form="quote-form"
              className="btn-neumorph-gold w-full py-3.5 px-4 rounded-2xl font-display font-black text-xs sm:text-sm uppercase tracking-wide flex items-center justify-center gap-2 cursor-pointer"
            >
              <Phone className="w-4 h-4" aria-hidden="true" />
              <span className="tabular-nums">Enviar Cotización por WhatsApp ({BRAND_CONFIG.whatsappDisplay})</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleExportPDF}
                className="btn-neumorph-cyan py-2.5 px-3 rounded-xl font-display font-black text-[11px] uppercase flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Descargar PDF</span>
              </button>

              <button
                type="button"
                onClick={handleSendFacebook}
                className="pressable-pill py-2.5 px-3 rounded-xl border font-bold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer"
                style={{
                  background: 'var(--surface-elevated)',
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-main)',
                }}
              >
                <Facebook
                  className="w-3.5 h-3.5"
                  style={{ color: 'var(--accent-primary)' }}
                  aria-hidden="true"
                />
                <span>Messenger</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
