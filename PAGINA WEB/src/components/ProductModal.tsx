import React, { useEffect, useState } from 'react';
import {
  X,
  Facebook,
  Plus,
  Check,
  ShieldCheck,
  ThermometerSnowflake,
  Sparkles,
  CheckCircle2,
  Camera,
} from 'lucide-react';
import { BRAND_CONFIG, Product } from '../data/catalog';
import {
  buildSingleProductMessage,
  openFacebookOrder,
  sendWhatsAppWithProductImage,
} from '../utils/conversion';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, size: string, quantity: number, withLogo: boolean) => void;
  onToast: (msg: string) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onToast,
}) => {
  const [selectedImg, setSelectedImg] = useState(0);
  const [selectedSize, setSelectedSize] = useState('L');
  const [quantity, setQuantity] = useState(1);
  const [withLogo, setWithLogo] = useState(false);
  const [added, setAdded] = useState(false);
  const [sendingPhoto, setSendingPhoto] = useState(false);

  useEffect(() => {
    setSelectedImg(0);
    setQuantity(1);
    setAdded(false);
  }, [product?.id]);

  useEffect(() => {
    if (!product) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [product, onClose]);

  if (!product) return null;

  const currentImage = product.images[selectedImg] || product.primaryImage;

  const handleWhatsAppWithPhoto = async () => {
    setSendingPhoto(true);
    try {
      await sendWhatsAppWithProductImage(
        product,
        selectedSize,
        quantity,
        withLogo,
        onToast
      );
    } finally {
      setSendingPhoto(false);
    }
  };

  const handleFacebook = () => {
    const msg = buildSingleProductMessage(product, selectedSize, quantity, withLogo);
    openFacebookOrder(msg, onToast);
  };

  const handleAdd = () => {
    onAddToCart(product, selectedSize, quantity, withLogo);
    onToast(`⚡ ${quantity}x ${product.code} (Talla ${selectedSize}) añadido al Cotizador.`);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#0b0f14]/82 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-modal-title"
      onClick={onClose}
    >
      <div
        className="dialog-panel-enter overscroll-contain relative w-full max-w-4xl glass-modal rounded-t-3xl sm:rounded-3xl overflow-hidden max-h-[93vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Glass Header */}
        <div
          className="flex items-center justify-between px-4 sm:px-6 py-3.5 shrink-0 border-b"
          style={{
            background: 'var(--bg-primary)',
            borderColor: 'var(--border-accent)',
          }}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span
              translate="no"
              className="px-3 py-1 rounded-xl font-mono-code tabular-nums font-black text-xs sm:text-sm shrink-0"
              style={{
                background: 'var(--accent-primary)',
                color: 'var(--text-on-accent)',
              }}
            >
              CÓD: {product.code}
            </span>
            <span
              className="text-xs font-bold uppercase tracking-wide truncate"
              style={{ color: 'var(--accent-secondary)' }}
            >
              Ficha Técnica Oficial • WHA MOUNTAIN
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="pressable-pill p-2.5 rounded-xl cursor-pointer shrink-0"
            style={{
              background: 'var(--surface-elevated)',
              color: 'var(--text-main)',
              border: '1px solid var(--border-subtle)',
            }}
            aria-label="Cerrar ficha técnica"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="grid grid-cols-1 md:grid-cols-12 overflow-y-auto overscroll-contain">
          {/* Left Column: Luminous Product Studio Gallery */}
          <div
            className="md:col-span-6 product-stage-backdrop p-5 sm:p-7 flex flex-col items-center justify-between border-b md:border-b-0 md:border-r relative"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            <div className="relative w-full h-64 sm:h-80 flex items-center justify-center">
              <div className="blob-stage absolute inset-6 opacity-90" />
              <img
                src={currentImage}
                alt={`${product.code} - ${product.title}`}
                width={340}
                height={340}
                className="relative z-10 max-h-full max-w-full object-contain drop-shadow-[0_18px_24px_rgba(11,15,20,0.52)]"
              />
            </div>

            {product.images.length > 1 && (
              <div className="relative z-10 flex items-center gap-2.5 mt-4">
                {product.images.map((img, idx) => (
                  <button
                    key={img}
                    type="button"
                    onClick={() => setSelectedImg(idx)}
                    aria-label={`Ver ángulo ${idx + 1} de ${product.code}`}
                    aria-pressed={selectedImg === idx}
                    className={`pressable-pill w-14 h-14 rounded-2xl p-1.5 bg-[#e6f2fb] border-2 cursor-pointer ${
                      selectedImg === idx ? 'shadow-lg scale-105' : 'opacity-75 hover:opacity-100'
                    }`}
                    style={{
                      borderColor:
                        selectedImg === idx ? 'var(--accent-primary)' : 'var(--border-subtle)',
                    }}
                  >
                    <img src={img} alt="" width={48} height={48} className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}

            <div
              className="w-full mt-4 pt-3 border-t flex items-center justify-between gap-2 text-[11px] font-extrabold relative z-10"
              style={{ borderColor: 'var(--border-subtle)' }}
            >
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full tabular-nums"
                style={{
                  background: 'var(--bg-primary)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <ThermometerSnowflake
                  className="w-3.5 h-3.5 shrink-0"
                  style={{ color: 'var(--accent-primary)' }}
                  aria-hidden="true"
                />
                {product.tempRating}
              </span>
              <span
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full"
                style={{
                  background: 'var(--bg-primary)',
                  color: 'var(--accent-primary)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                Garantía WHA PERÚ
              </span>
            </div>
          </div>

          {/* Right Column: Specifications & Order Configuration */}
          <div className="md:col-span-6 p-5 sm:p-6 space-y-4" style={{ color: 'var(--text-main)' }}>
            <div>
              <div
                className="text-[11px] font-mono-code font-bold uppercase tracking-wider mb-1"
                style={{ color: 'var(--accent-primary)' }}
              >
                {product.category} • {product.sector}
              </div>
              <h2
                id="product-modal-title"
                className="font-display font-black text-lg sm:text-xl leading-snug"
                style={{ color: 'var(--text-main)' }}
              >
                {product.title}
              </h2>
            </div>

            {/* Technical Specs Box */}
            <div
              className="rounded-2xl p-3.5 space-y-2.5 border"
              style={{
                background: 'var(--surface-elevated)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              <div
                className="text-[10px] font-mono-code font-bold uppercase tracking-wider"
                style={{ color: 'var(--accent-primary)' }}
              >
                Especificaciones de Confección:
              </div>
              <p
                className="text-xs sm:text-sm leading-relaxed"
                style={{ color: 'var(--text-secondary)' }}
              >
                {product.description}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                {product.highlights.map((hl) => (
                  <div
                    key={hl}
                    className="flex items-center gap-1.5 text-[11px] font-semibold"
                    style={{ color: 'var(--text-main)' }}
                  >
                    <CheckCircle2
                      className="w-3.5 h-3.5 shrink-0"
                      style={{ color: 'var(--accent-primary)' }}
                      aria-hidden="true"
                    />
                    <span>{hl}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Size & Quantity Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div
                  className="block text-[11px] font-bold mb-1.5"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Talla Referencial:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {product.sizes.map((sz) => {
                    const isSelected = selectedSize === sz;
                    return (
                      <button
                        key={sz}
                        type="button"
                        translate="no"
                        onClick={() => setSelectedSize(sz)}
                        aria-pressed={isSelected}
                        className="pressable-pill px-3 py-2 rounded-xl text-xs font-extrabold border cursor-pointer"
                        style={
                          isSelected
                            ? {
                                background: 'var(--accent-primary)',
                                color: 'var(--text-on-accent)',
                                borderColor: 'var(--accent-primary)',
                                boxShadow: 'var(--shadow-glow)',
                              }
                            : {
                                background: 'var(--surface-elevated)',
                                color: 'var(--text-main)',
                                borderColor: 'var(--border-subtle)',
                              }
                        }
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label
                  htmlFor="product-modal-qty"
                  className="block text-[11px] font-bold mb-1.5"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Cantidad (Unidades):
                </label>
                <div
                  className="flex items-center border rounded-xl overflow-hidden w-fit"
                  style={{
                    background: 'var(--surface-elevated)',
                    borderColor: 'var(--border-subtle)',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    aria-label="Disminuir cantidad"
                    className="w-9 h-9 font-extrabold text-sm cursor-pointer active:scale-90 transition-transform"
                    style={{ color: 'var(--accent-primary)' }}
                  >
                    -
                  </button>
                  <input
                    id="product-modal-qty"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))
                    }
                    className="w-12 text-center bg-transparent text-xs font-extrabold tabular-nums py-1.5 focus:outline-none"
                    style={{ color: 'var(--text-main)' }}
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    aria-label="Aumentar cantidad"
                    className="w-9 h-9 font-extrabold text-sm cursor-pointer active:scale-90 transition-transform"
                    style={{ color: 'var(--accent-primary)' }}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Corporate Logo Embroidery Toggle */}
            <label
              className="flex items-center gap-2.5 p-3 rounded-2xl border cursor-pointer transition-colors"
              style={{
                background: 'var(--surface-elevated)',
                borderColor: withLogo ? 'var(--accent-primary)' : 'var(--border-subtle)',
              }}
            >
              <input
                type="checkbox"
                checked={withLogo}
                onChange={(e) => setWithLogo(e.target.checked)}
                className="w-4 h-4 rounded"
                style={{ accentColor: 'var(--accent-primary)' }}
              />
              <div className="text-xs">
                <span
                  className="font-bold flex items-center gap-1.5"
                  style={{ color: 'var(--text-main)' }}
                >
                  <Sparkles
                    className="w-3.5 h-3.5 shrink-0"
                    style={{ color: 'var(--accent-primary)' }}
                    aria-hidden="true"
                  />
                  Incluir Bordado de Logo Corporativo (Empresas / RUC)
                </span>
              </div>
            </label>

            {/* Primary Actions */}
            <div className="space-y-2.5 pt-1">
              <button
                type="button"
                onClick={handleAdd}
                className={`w-full py-3.5 px-4 rounded-2xl font-display font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer ${
                  added ? 'btn-neumorph-cyan' : 'btn-neumorph-gold'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" aria-hidden="true" />
                    <span>¡AÑADIDO AL COTIZADOR MÚLTIPLE!</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 stroke-[3]" aria-hidden="true" />
                    <span className="tabular-nums">AÑADIR A COTIZACIÓN ({quantity} UND.)</span>
                  </>
                )}
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleWhatsAppWithPhoto}
                  disabled={sendingPhoto}
                  className="pressable-pill py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer border disabled:opacity-60"
                  style={{
                    background: 'var(--surface-elevated)',
                    borderColor: 'var(--border-accent)',
                    color: 'var(--text-main)',
                  }}
                >
                  <Camera
                    className="w-4 h-4 shrink-0"
                    style={{ color: 'var(--accent-primary)' }}
                    aria-hidden="true"
                  />
                  <span className="tabular-nums">
                    {sendingPhoto
                      ? 'Generando foto…'
                      : `WhatsApp c/ Foto (${BRAND_CONFIG.whatsappDisplay})`}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleFacebook}
                  className="pressable-pill py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer border"
                  style={{
                    background: 'var(--surface-elevated)',
                    borderColor: 'var(--border-subtle)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <Facebook
                    className="w-4 h-4 shrink-0"
                    style={{ color: 'var(--accent-primary)' }}
                    aria-hidden="true"
                  />
                  <span>Consultar en Facebook</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
