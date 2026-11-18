import React, { memo, useState } from 'react';
import {
  Phone,
  Plus,
  Check,
  Eye,
  Snowflake,
  Flame,
} from 'lucide-react';
import { BRAND_CONFIG, Product } from '../data/catalog';
import { sendWhatsAppWithProductImage } from '../utils/conversion';

interface ProductCardProps {
  product: Product;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, size: string, quantity: number, withLogo: boolean) => void;
  onToast: (msg: string) => void;
  featuredBadge?: boolean;
}

const ProductCardBase: React.FC<ProductCardProps> = ({
  product,
  onSelectProduct,
  onAddToCart,
  onToast,
  featuredBadge = false,
}) => {
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [addedFeedback, setAddedFeedback] = useState(false);
  const [sendingImg, setSendingImg] = useState(false);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product, 'L', 1, false);
    onToast(`⚡ ${product.code} añadido al Cotizador Múltiple.`);
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 1600);
  };

  const handleWhatsAppWithImage = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setSendingImg(true);
    try {
      await sendWhatsAppWithProductImage(product, 'L', 1, false, onToast);
    } finally {
      setSendingImg(false);
    }
  };

  const is3M = product.reflective.includes('3M') || product.thermal.includes('3M');
  const isExtreme = product.tempRating.includes('-20') || product.tempRating.includes('-15');
  const shortTemp = product.tempRating.split('/')[0].trim();

  return (
    <article className="organic-product-card group flex flex-col justify-between h-full select-none relative pt-3 mt-6 overflow-visible">
      {/* NON-SQUARE ORGANIC BLOB STAGE + 3D "OUT OF THE BOX" PNG GARMENT */}
      <div className="relative h-52 sm:h-60 w-full overflow-visible shrink-0">
        {/* Main Clickable Visual Showcase Button */}
        <button
          type="button"
          onClick={() => onSelectProduct(product)}
          className="w-full h-full px-4 flex items-center justify-center overflow-visible cursor-pointer focus-visible:rounded-3xl"
          aria-label={`Ver ficha técnica de ${product.code} - ${product.title}`}
        >
          {/* Morphing Amoeba / Drop Blob Behind Product */}
          <div className="blob-stage absolute inset-x-4 top-2 bottom-2" />

          {/* 3D "OUT OF THE BOX" TRANSPARENT PNG GARMENT */}
          <img
            src={product.images[activeImgIdx] || product.primaryImage}
            alt={`${product.code} - ${product.title}`}
            width={260}
            height={260}
            loading="lazy"
            decoding="async"
            className="out-of-box-garment relative z-20 w-[92%] h-[114%] -mt-8 object-contain select-none"
          />
        </button>

        {/* Top Left Collectible Organic Badges */}
        <div className="pointer-events-none absolute -top-3 left-3 z-30 flex flex-wrap items-center gap-1">
          <span
            translate="no"
            className="px-2.5 py-1 rounded-full font-mono-code tabular-nums font-extrabold text-[11px] sm:text-xs shadow-md"
            style={{
              background: 'var(--bg-primary)',
              color: 'var(--text-main)',
              border: '1px solid var(--border-accent)',
            }}
          >
            {product.code}
          </span>
          {is3M && (
            <span
              translate="no"
              className="px-2 py-0.5 rounded-full font-mono-code font-black text-[10px] shadow-sm"
              style={{
                background: 'var(--accent-primary)',
                color: 'var(--text-on-accent)',
              }}
            >
              3M™
            </span>
          )}
          {(featuredBadge || product.isFeatured) && (
            <span
              className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full font-display font-black text-[9px] uppercase"
              style={{
                background: 'var(--accent-secondary)',
                color: 'var(--accent-secondary-contrast)',
              }}
            >
              <Flame className="w-2.5 h-2.5 fill-current" aria-hidden="true" />
              TOP
            </span>
          )}
        </div>

        {/* Top Right Quick-View Glass Pill Button (36x36px+ expanded target) */}
        <button
          type="button"
          onClick={() => onSelectProduct(product)}
          className="pressable-pill absolute -top-3 right-3 z-30 w-9 h-9 rounded-full shadow-md flex items-center justify-center cursor-pointer"
          style={{
            background: 'var(--bg-primary)',
            color: 'var(--accent-secondary)',
            border: '1px solid var(--border-accent)',
          }}
          title="Ver ficha técnica completa"
          aria-label={`Ver detalles de ${product.code}`}
        >
          <Eye className="w-4 h-4" aria-hidden="true" />
        </button>

        {/* Temperature Floating Tag (Bottom Right of Blob Stage) */}
        <div
          translate="no"
          className="pointer-events-none absolute bottom-2 right-3 z-30 px-2.5 py-0.5 rounded-full font-mono-code tabular-nums font-extrabold text-[10px] flex items-center gap-1 shadow-sm"
          style={{
            background: 'var(--bg-primary)',
            color: isExtreme ? 'var(--accent-secondary)' : 'var(--accent-primary)',
            border: '1px solid var(--border-accent)',
          }}
        >
          <Snowflake className="w-3 h-3" aria-hidden="true" />
          <span>{shortTemp}</span>
        </div>

        {/* Multi-angle switcher dots with accessible 28x28px hit targets */}
        {product.images.length > 1 && (
          <div
            className="absolute bottom-1.5 left-2.5 z-30 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full backdrop-blur-sm"
            style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            {product.images.map((imgUrl, idx) => (
              <button
                key={imgUrl}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImgIdx(idx);
                }}
                className="w-7 h-7 rounded-full flex items-center justify-center transition-transform duration-150 active:scale-90 cursor-pointer"
                title={`Vista ${idx + 1}`}
                aria-label={`Ver ángulo ${idx + 1} de ${product.code}`}
                aria-pressed={activeImgIdx === idx}
              >
                <span
                  aria-hidden="true"
                  className="w-2.5 h-2.5 rounded-full transition-transform duration-150"
                  style={{
                    background:
                      activeImgIdx === idx
                        ? 'var(--accent-primary)'
                        : 'var(--text-muted)',
                    transform: activeImgIdx === idx ? 'scale(1.25)' : 'scale(1)',
                  }}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Card Body — Theme-Adaptive Organic Glass */}
      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
        <div className="space-y-1.5 min-w-0">
          {/* Fabric & Division Eyebrow */}
          <div className="flex items-center justify-between gap-1 text-[10px] sm:text-[11px] min-w-0">
            <span
              className="truncate font-extrabold uppercase tracking-wide"
              style={{ color: 'var(--accent-secondary)' }}
            >
              {product.fabric}
            </span>
            <span
              className="shrink-0 text-[10px] font-semibold"
              style={{ color: 'var(--text-muted)' }}
            >
              {product.reflective.includes('3M') ? 'Reflectivo 3M' : 'Ejecutivo'}
            </span>
          </div>

          {/* Product Title */}
          <h3
            className="font-display font-extrabold text-xs sm:text-sm leading-snug min-h-[2.3rem] sm:min-h-[2.5rem]"
            style={{ color: 'var(--text-main)' }}
          >
            <button
              type="button"
              onClick={() => onSelectProduct(product)}
              className="text-left w-full line-clamp-2 hover:underline cursor-pointer"
            >
              {product.title}
            </button>
          </h3>

          {/* Thermal Spec Sub-pill */}
          <p
            className="text-[11px] truncate font-medium"
            style={{ color: 'var(--text-secondary)' }}
          >
            {product.thermal}
          </p>
        </div>

        {/* Conversion Action Buttons */}
        <div
          className="pt-2.5 border-t space-y-2"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          {BRAND_CONFIG.showPrices && (
            <div
              className="font-mono-code tabular-nums font-extrabold text-sm"
              style={{ color: 'var(--accent-primary)' }}
            >
              S/. {product.referencePrice2024.toFixed(2)}
            </div>
          )}

          {/* Main "Añadir a Cotización" Pill Button */}
          <button
            type="button"
            onClick={handleQuickAdd}
            className={`w-full py-2.5 px-3 rounded-full font-display font-black text-[11px] sm:text-xs uppercase tracking-wide flex items-center justify-center gap-1.5 cursor-pointer ${
              addedFeedback ? 'btn-neumorph-cyan' : 'btn-neumorph-gold'
            }`}
            title="Añadir prenda al Cotizador Múltiple para WhatsApp / PDF"
          >
            {addedFeedback ? (
              <>
                <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" aria-hidden="true" />
                <span>¡AÑADIDO!</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" aria-hidden="true" />
                <span>Añadir a Cotización</span>
              </>
            )}
          </button>

          {/* Secondary Row: WhatsApp c/ Foto + Ficha */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleWhatsAppWithImage}
              disabled={sendingImg}
              className="pressable-pill flex-1 py-2 px-2.5 rounded-full font-bold text-[10px] sm:text-[11px] flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
              style={{
                background: 'var(--surface-elevated)',
                color: 'var(--text-main)',
                border: '1px solid var(--border-subtle)',
              }}
              title="Enviar esta prenda con su tarjeta fotográfica directo a WhatsApp"
            >
              <Phone
                className="w-3 h-3 shrink-0"
                style={{ color: 'var(--accent-secondary)' }}
                aria-hidden="true"
              />
              <span className="truncate">
                {sendingImg ? 'Copiando…' : 'WhatsApp c/ Foto'}
              </span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelectProduct(product);
              }}
              className="pressable-pill py-2 px-3 rounded-full font-bold text-[10px] sm:text-[11px] shrink-0 cursor-pointer"
              style={{
                background: 'var(--surface-elevated)',
                color: 'var(--accent-primary)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              Ficha
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

export const ProductCard = memo(ProductCardBase);
