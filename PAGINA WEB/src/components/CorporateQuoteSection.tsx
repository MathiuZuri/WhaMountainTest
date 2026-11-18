import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Copy,
  Check,
  Package,
  Phone,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Truck,
  ArrowRight,
  Award,
} from 'lucide-react';
import { BRAND_CONFIG } from '../data/catalog';
import { openWhatsAppOrder } from '../utils/conversion';
import { useRevealOnScroll } from '../hooks/useRevealOnScroll';

interface CorporateQuoteSectionProps {
  onToast: (msg: string) => void;
}

interface VolumeTier {
  id: string;
  label: string;
  defaultUnits: number;
  badge: string;
}

const VOLUME_TIERS: VolumeTier[] = [
  { id: '12-50', label: '12 - 50 prendas', defaultUnits: 30, badge: 'Escala Contratista' },
  { id: '51-200', label: '51 - 200 prendas', defaultUnits: 120, badge: 'Escala Flota' },
  { id: '201-500', label: '201 - 500 prendas', defaultUnits: 300, badge: 'Escala Operación' },
  { id: '500+', label: '+500 prendas', defaultUnits: 600, badge: 'Licitación / Mina' },
];

const PRODUCT_LINES = [
  'Casacas Térmicas -20°C (Hipora® + 3M)',
  'Mamelucos Térmicos -20°C (Socavón / Tajo)',
  'Chalecos Geólogo / Supervisor Drill 3M',
  'Dotación Integral EPP (Casaca + Mameluco + Pantalón)',
];

function getVolumeBenefitLabel(units: number): string {
  if (units >= 500) return 'Tarifa Licitación + Matriz de Bordado 100% Sin Costo + Prioridad Producción';
  if (units >= 200) return 'Descuento Corporativo Tier A + Bordado Computarizado Incluido';
  if (units >= 50) return 'Precio Escala Empresa + Bordado en Pecho y Espalda';
  return 'Tarifa Mayorista Inicial (desde 12 unid.) + Factura Electrónica';
}

export const CorporateQuoteSection: React.FC<CorporateQuoteSectionProps> = ({
  onToast,
}) => {
  const { ref: sectionRef, isRevealed } = useRevealOnScroll<HTMLElement>(0.06);

  const [ruc, setRuc] = useState('');
  const [razonSocial, setRazonSocial] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('51-200');
  const [volumenPrendas, setVolumenPrendas] = useState<string>('120');
  const [productLine, setProductLine] = useState<string>(PRODUCT_LINES[0]);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [destination, setDestination] = useState('');
  const [includeEmbroidery, setIncludeEmbroidery] = useState(true);
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState<{
    ruc?: string;
    razonSocial?: string;
    volumen?: string;
    contactPhone?: string;
  }>({});

  const [submittedRefCode, setSubmittedRefCode] = useState<string | null>(null);
  const [copiedSummary, setCopiedSummary] = useState(false);

  const cleanRuc = useMemo(() => ruc.replace(/\D/g, '').slice(0, 11), [ruc]);
  const rucTypeBadge = useMemo(() => {
    if (cleanRuc.startsWith('20')) return 'RUC 20 • Persona Jurídica';
    if (cleanRuc.startsWith('10')) return 'RUC 10 • Negocio / Contratista';
    if (cleanRuc.length > 0) return 'Verificar prefijo (10 o 20)';
    return null;
  }, [cleanRuc]);

  const numericVolume = Math.max(0, Number.parseInt(volumenPrendas || '0', 10) || 0);

  const handleSelectTier = (tier: VolumeTier) => {
    setSelectedTier(tier.id);
    setVolumenPrendas(String(tier.defaultUnits));
    setErrors((prev) => ({ ...prev, volumen: undefined }));
  };

  const buildCorporateMessage = (refCode: string) => {
    return [
      `🏢 *SOLICITUD DE COTIZACIÓN CORPORATIVA (B2B) — WHA MOUNTAIN PERÚ*`,
      `📋 Código Ref.: ${refCode}`,
      ``,
      `• *RUC:* ${cleanRuc}`,
      `• *Razón Social:* ${razonSocial.trim()}`,
      `• *Volumen Estimado:* ${numericVolume} prendas (${selectedTier})`,
      `• *Línea Principal:* ${productLine}`,
      `• *Bordado de Logotipo:* ${includeEmbroidery ? 'Sí, computarizado' : 'Sin bordado'}`,
      contactName.trim() ? `• *Contacto / Cargo:* ${contactName.trim()}` : null,
      contactPhone.trim() ? `• *Teléfono / Email:* ${contactPhone.trim()}` : null,
      destination.trim() ? `• *Destino / Proyecto:* ${destination.trim()}` : null,
      notes.trim() ? `• *Especificaciones:* ${notes.trim()}` : null,
      ``,
      `Solicitamos proforma formal con factura electrónica y tiempo de entrega.`,
    ]
      .filter(Boolean)
      .join('\n');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: typeof errors = {};

    if (cleanRuc.length !== 11 || (!cleanRuc.startsWith('20') && !cleanRuc.startsWith('10'))) {
      nextErrors.ruc = 'Ingresa un RUC válido de 11 dígitos (iniciado en 20 o 10).';
    }
    if (razonSocial.trim().length < 3) {
      nextErrors.razonSocial = 'Ingresa la Razón Social completa de la empresa.';
    }
    if (!Number.isFinite(numericVolume) || numericVolume < 12) {
      nextErrors.volumen = 'El volumen corporativo mínimo es de 12 prendas.';
    }
    if (contactPhone.trim().length > 0 && contactPhone.trim().length < 6) {
      nextErrors.contactPhone = 'Ingresa un número o correo válido para responderte.';
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      const firstId = nextErrors.ruc
        ? 'b2b-ruc'
        : nextErrors.razonSocial
          ? 'b2b-razon-social'
          : nextErrors.volumen
            ? 'b2b-volumen'
            : 'b2b-contacto';
      document.getElementById(firstId)?.focus();
      onToast('Revisa los campos resaltados del formulario corporativo.');
      return;
    }

    const now = new Date();
    const stamp = `${String(now.getFullYear()).slice(-2)}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const rand = String(Math.floor(1000 + Math.random() * 9000));
    const refCode = `CORP-${stamp}-${rand}`;

    setSubmittedRefCode(refCode);
    onToast(`Solicitud ${refCode} lista para enviar a División Empresas B2B.`);
  };

  const handleCopySummary = () => {
    if (!submittedRefCode || !navigator.clipboard) return;
    navigator.clipboard.writeText(buildCorporateMessage(submittedRefCode));
    setCopiedSummary(true);
    onToast('Resumen corporativo copiado al portapapeles.');
    window.setTimeout(() => setCopiedSummary(false), 2200);
  };

  return (
    <section
      ref={sectionRef}
      id="cotizacion-corporativa"
      className={`reveal-section ${isRevealed ? 'is-revealed' : ''} relative py-14 sm:py-20 overflow-hidden scroll-mt-24`}
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* Ambient Liquid Blobs (Noche Alpina) */}
      <div
        className="pointer-events-none absolute -top-20 -left-24 w-[320px] h-[320px] liquid-blob-cyan opacity-45"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-24 -right-20 w-[340px] h-[340px] liquid-blob-gold opacity-55"
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute inset-0 bg-tech-grid opacity-30" aria-hidden="true" />

      <div className="relative z-10 layout-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* LEFT COLUMN: B2B Engineering & Procurement Credibility */}
          <div className="lg:col-span-5 space-y-5">
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-pill font-mono-code text-[11px] font-extrabold uppercase tracking-wider"
              style={{ color: 'var(--accent-primary)' }}
            >
              <Building2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>DIVISIÓN CORPORATIVA B2B • PERÚ</span>
            </div>

            <h2
              className="font-impact uppercase font-bold fluid-section-title"
              style={{ color: 'var(--text-main)' }}
            >
              COTIZACIÓN PARA{' '}
              <span className="text-gradient-gold">EMPRESAS & MINERAS</span>
            </h2>

            <p
              className="fluid-lead font-medium"
              style={{ color: 'var(--text-secondary)' }}
            >
              Abastecemos cuadrillas completas en operaciones mineras, constructoras, ingenierías y entidades estatales con{' '}
              <strong style={{ color: 'var(--accent-secondary)' }}>
                factura electrónica RUC 20
              </strong>
              , escalas preferenciales por volumen y cumplimiento bajo norma D.S. 024-2016-EM.
            </p>

            {/* 3 Organic Benefit Cards */}
            <div className="space-y-3 pt-1">
              {[
                {
                  icon: Award,
                  title: 'Bordado Computarizado Institucional',
                  desc: 'Personalización en pecho, espalda y mangas con hilos de alta tenacidad y cinta reflectiva 3M™.',
                  radius: '26px 14px 28px 16px',
                },
                {
                  icon: ShieldCheck,
                  title: 'Tallas S a XXL + Tallaje Especial 3XL',
                  desc: 'Curvas de tallaje adaptadas a tu cuadrilla o toma de medidas por lote para contratistas.',
                  radius: '16px 26px 14px 28px',
                },
                {
                  icon: Truck,
                  title: 'Despacho Directo a Campamento o Agencia',
                  desc: 'Envíos asegurados en 24h a Arequipa, Cusco, Cajamarca, Áncash, Pasco, Junín, Moquegua y Tacna.',
                  radius: '28px 16px 24px 16px',
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="glass-card p-4 flex items-start gap-3.5 transition-transform duration-200 hover:-translate-y-0.5"
                    style={{ borderRadius: item.radius }}
                  >
                    <div className="blob-stage w-11 h-11 shrink-0 flex items-center justify-center">
                      <Icon
                        className="w-5 h-5"
                        style={{ color: 'var(--alpine-night)' }}
                        aria-hidden="true"
                      />
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <h3
                        className="font-display font-extrabold text-xs sm:text-sm"
                        style={{ color: 'var(--text-main)' }}
                      >
                        {item.title}
                      </h3>
                      <p
                        className="text-[11px] sm:text-xs leading-relaxed"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Direct Corporate Contact Pill */}
            <div
              className="glass-pill px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-xs"
              style={{ borderRadius: '22px 14px 24px 14px' }}
            >
              <span style={{ color: 'var(--text-secondary)' }}>
                Central WhatsApp B2B:{' '}
                <strong
                  className="font-mono-code tabular-nums"
                  style={{ color: 'var(--accent-secondary)' }}
                >
                  {BRAND_CONFIG.whatsappDisplay}
                </strong>
              </span>
              <span
                translate="no"
                className="font-mono-code text-[11px] font-bold"
                style={{ color: 'var(--accent-primary)' }}
              >
                {BRAND_CONFIG.email}
              </span>
            </div>
          </div>

          {/* RIGHT COLUMN: Glassmorphism Corporate Quote Form */}
          <div className="lg:col-span-7">
            <div
              className="glass-modal p-5 sm:p-7 lg:p-8 relative overflow-hidden"
              style={{
                borderRadius: '36px 20px 40px 22px',
                background:
                  'linear-gradient(155deg, rgba(26, 38, 51, 0.9) 0%, rgba(11, 15, 20, 0.92) 100%)',
              }}
            >
              {submittedRefCode ? (
                /* Interactive Confirmation Card */
                <div className="space-y-5 py-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="blob-stage w-12 h-12 flex items-center justify-center shrink-0">
                        <CheckCircle2
                          className="w-6 h-6"
                          style={{ color: 'var(--alpine-night)' }}
                          aria-hidden="true"
                        />
                      </div>
                      <div>
                        <span
                          className="block font-mono-code text-[10px] font-extrabold uppercase tracking-wider"
                          style={{ color: 'var(--accent-primary)' }}
                        >
                          EXPEDIENTE B2B GENERADO
                        </span>
                        <h3
                          translate="no"
                          className="font-display tabular-nums font-black text-lg sm:text-xl"
                          style={{ color: 'var(--text-main)' }}
                        >
                          {submittedRefCode}
                        </h3>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSubmittedRefCode(null)}
                      className="pressable-pill px-3 py-1.5 rounded-full glass-pill text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Editar</span>
                    </button>
                  </div>

                  <div
                    className="glass-card p-4 sm:p-5 space-y-2.5 text-xs sm:text-sm"
                    style={{ borderRadius: '24px 14px 26px 14px' }}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <span
                          className="block text-[10px] font-mono-code uppercase"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          RUC Empresa
                        </span>
                        <strong
                          className="font-mono-code tabular-nums text-sm"
                          style={{ color: 'var(--accent-secondary)' }}
                        >
                          {cleanRuc}
                        </strong>
                      </div>
                      <div>
                        <span
                          className="block text-[10px] font-mono-code uppercase"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          Volumen Estimado
                        </span>
                        <strong
                          className="font-mono-code tabular-nums text-sm"
                          style={{ color: 'var(--accent-primary)' }}
                        >
                          {numericVolume} prendas
                        </strong>
                      </div>
                    </div>

                    <div
                      className="pt-2 border-t"
                      style={{ borderColor: 'var(--border-subtle)' }}
                    >
                      <span
                        className="block text-[10px] font-mono-code uppercase"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        Razón Social
                      </span>
                      <strong style={{ color: 'var(--text-main)' }}>
                        {razonSocial.trim()}
                      </strong>
                    </div>

                    <div
                      className="pt-2 border-t flex flex-wrap items-center justify-between gap-2 text-xs"
                      style={{ borderColor: 'var(--border-subtle)' }}
                    >
                      <span style={{ color: 'var(--text-secondary)' }}>
                        Línea: <strong style={{ color: 'var(--text-main)' }}>{productLine}</strong>
                      </span>
                      <span
                        className="px-2.5 py-0.5 rounded-full font-mono-code font-bold text-[10px]"
                        style={{
                          background: 'rgba(122, 166, 194, 0.16)',
                          color: 'var(--accent-primary)',
                          border: '1px solid var(--border-subtle)',
                        }}
                      >
                        {includeEmbroidery ? 'Con Bordado Logo' : 'Sin Bordado'}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    Envía este requerimiento directo a nuestro equipo de presupuestos B2B para recibir tu{' '}
                    <strong style={{ color: 'var(--text-main)' }}>proforma formal en PDF con ficha técnica y tiempos de confección</strong>.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => openWhatsAppOrder(buildCorporateMessage(submittedRefCode))}
                      className="btn-neumorph-gold flex-1 py-3.5 px-6 rounded-full font-display font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Phone className="w-4 h-4" aria-hidden="true" />
                      <span>Enviar por WhatsApp Corporativo</span>
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </button>

                    <button
                      type="button"
                      onClick={handleCopySummary}
                      className="pressable-pill py-3.5 px-5 rounded-full glass-pill font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
                      style={{ color: 'var(--accent-secondary)' }}
                    >
                      {copiedSummary ? (
                        <Check className="w-4 h-4" aria-hidden="true" />
                      ) : (
                        <Copy className="w-4 h-4" aria-hidden="true" />
                      )}
                      <span>{copiedSummary ? 'Copiado' : 'Copiar Resumen'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Active Corporate Form */
                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                  <div
                    className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b"
                    style={{ borderColor: 'var(--border-subtle)' }}
                  >
                    <div>
                      <span
                        className="text-[10px] font-mono-code font-bold uppercase tracking-widest"
                        style={{ color: 'var(--accent-primary)' }}
                      >
                        FORMULARIO OFICIAL B2B • RESPUESTA EN &lt; 2 HORAS
                      </span>
                      <h3
                        className="font-display font-black text-lg sm:text-xl mt-0.5"
                        style={{ color: 'var(--text-main)' }}
                      >
                        Solicita tu Proforma Corporativa
                      </h3>
                    </div>

                    <span
                      className="px-3 py-1 rounded-full font-mono-code font-bold text-[10px] flex items-center gap-1.5"
                      style={{
                        background: 'rgba(122, 166, 194, 0.14)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--accent-secondary)',
                      }}
                    >
                      <Package className="w-3.5 h-3.5" style={{ color: 'var(--accent-primary)' }} aria-hidden="true" />
                      <span>Desde 12 prendas</span>
                    </span>
                  </div>

                  {/* Row 1: RUC & Razón Social */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                    <div className="sm:col-span-5 space-y-1.5">
                      <div className="flex items-center justify-between gap-1">
                        <label
                          htmlFor="b2b-ruc"
                          className="text-xs font-display font-extrabold uppercase tracking-wide"
                          style={{ color: 'var(--text-main)' }}
                        >
                          RUC <span style={{ color: 'var(--accent-primary)' }}>*</span>
                        </label>
                        {rucTypeBadge && (
                          <span
                            className="text-[10px] font-mono-code font-bold"
                            style={{ color: 'var(--accent-primary)' }}
                          >
                            {rucTypeBadge}
                          </span>
                        )}
                      </div>
                      <input
                        id="b2b-ruc"
                        name="ruc"
                        type="text"
                        inputMode="numeric"
                        autoComplete="off"
                        spellCheck={false}
                        maxLength={11}
                        required
                        aria-invalid={Boolean(errors.ruc)}
                        aria-describedby={errors.ruc ? 'b2b-ruc-error' : undefined}
                        value={cleanRuc}
                        onChange={(e) => {
                          setRuc(e.target.value);
                          if (errors.ruc) setErrors((prev) => ({ ...prev, ruc: undefined }));
                        }}
                        placeholder="Ej. 20601234567"
                        className="glass-input w-full px-4 py-3 rounded-2xl text-sm font-mono-code tabular-nums font-bold tracking-wide"
                      />
                      {errors.ruc && (
                        <p
                          id="b2b-ruc-error"
                          role="alert"
                          className="text-[11px] font-semibold flex items-center gap-1.5 px-2.5 py-1 rounded-xl"
                          style={{
                            color: '#e6f2fb',
                            background: 'rgba(122, 166, 194, 0.16)',
                            border: '1px solid #7aa6c2',
                          }}
                        >
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" style={{ color: '#7aa6c2' }} aria-hidden="true" />
                          <span>{errors.ruc}</span>
                        </p>
                      )}
                    </div>

                    <div className="sm:col-span-7 space-y-1.5">
                      <label
                        htmlFor="b2b-razon-social"
                        className="block text-xs font-display font-extrabold uppercase tracking-wide"
                        style={{ color: 'var(--text-main)' }}
                      >
                        Razón Social <span style={{ color: 'var(--accent-primary)' }}>*</span>
                      </label>
                      <input
                        id="b2b-razon-social"
                        name="razonSocial"
                        type="text"
                        autoComplete="organization"
                        required
                        aria-invalid={Boolean(errors.razonSocial)}
                        aria-describedby={errors.razonSocial ? 'b2b-razon-error' : undefined}
                        value={razonSocial}
                        onChange={(e) => {
                          setRazonSocial(e.target.value);
                          if (errors.razonSocial) {
                            setErrors((prev) => ({ ...prev, razonSocial: undefined }));
                          }
                        }}
                        placeholder="Ej. Constructora & Minería Los Andes S.A.C.…"
                        className="glass-input w-full px-4 py-3 rounded-2xl text-sm font-semibold"
                      />
                      {errors.razonSocial && (
                        <p
                          id="b2b-razon-error"
                          role="alert"
                          className="text-[11px] font-semibold flex items-center gap-1.5 px-2.5 py-1 rounded-xl"
                          style={{
                            color: '#e6f2fb',
                            background: 'rgba(122, 166, 194, 0.16)',
                            border: '1px solid #7aa6c2',
                          }}
                        >
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" style={{ color: '#7aa6c2' }} aria-hidden="true" />
                          <span>{errors.razonSocial}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Row 2: Volumen Estimado de Prendas (Pills + Numeric Field) */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <label
                        htmlFor="b2b-volumen"
                        className="text-xs font-display font-extrabold uppercase tracking-wide"
                        style={{ color: 'var(--text-main)' }}
                      >
                        Volumen estimado de prendas{' '}
                        <span style={{ color: 'var(--accent-primary)' }}>*</span>
                      </label>
                      <span
                        className="text-[11px] font-mono-code tabular-nums font-bold"
                        style={{ color: 'var(--accent-primary)' }}
                      >
                        {numericVolume > 0 ? `${numericVolume} unidades seleccionadas` : 'Ingresa cantidad'}
                      </span>
                    </div>

                    {/* Interactive Glassmorphism Scale Pills */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {VOLUME_TIERS.map((tier) => {
                        const isActive = selectedTier === tier.id;
                        return (
                          <button
                            key={tier.id}
                            type="button"
                            onClick={() => handleSelectTier(tier)}
                            aria-pressed={isActive}
                            className="pressable-pill px-3 py-2.5 rounded-2xl text-left cursor-pointer"
                            style={
                              isActive
                                ? {
                                    background: 'rgba(122, 166, 194, 0.24)',
                                    border: '1.5px solid #7aa6c2',
                                    color: '#e6f2fb',
                                    boxShadow: '0 0 18px rgba(122, 166, 194, 0.25)',
                                  }
                                : {
                                    background: 'rgba(11, 15, 20, 0.55)',
                                    border: '1px solid #2f4a5d',
                                    color: 'rgba(230, 242, 251, 0.82)',
                                  }
                            }
                          >
                            <span className="block font-display tabular-nums font-extrabold text-xs">
                              {tier.label}
                            </span>
                            <span
                              className="block text-[9px] font-mono-code uppercase mt-0.5"
                              style={{ color: 'var(--accent-primary)' }}
                            >
                              {tier.badge}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
                      <div className="sm:col-span-5">
                        <input
                          id="b2b-volumen"
                          name="volumenPrendas"
                          type="number"
                          inputMode="numeric"
                          min={12}
                          max={50000}
                          required
                          aria-invalid={Boolean(errors.volumen)}
                          aria-describedby={errors.volumen ? 'b2b-volumen-error' : 'b2b-volumen-hint'}
                          value={volumenPrendas}
                          onChange={(e) => {
                            setVolumenPrendas(e.target.value);
                            if (errors.volumen) setErrors((prev) => ({ ...prev, volumen: undefined }));
                          }}
                          placeholder="Cantidad exacta (ej. 120)"
                          className="glass-input w-full px-4 py-2.5 rounded-2xl text-sm font-mono-code tabular-nums font-bold"
                        />
                      </div>
                      <div
                        id="b2b-volumen-hint"
                        className="sm:col-span-7 px-3.5 py-2 rounded-2xl flex items-center gap-2 text-[11px] font-medium"
                        style={{
                          background: 'rgba(47, 74, 93, 0.28)',
                          border: '1px solid var(--border-subtle)',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        <Sparkles
                          className="w-3.5 h-3.5 shrink-0"
                          style={{ color: 'var(--accent-primary)' }}
                          aria-hidden="true"
                        />
                        <span>{getVolumeBenefitLabel(numericVolume)}</span>
                      </div>
                    </div>

                    {errors.volumen && (
                      <p
                        id="b2b-volumen-error"
                        role="alert"
                        className="text-[11px] font-semibold flex items-center gap-1.5 px-2.5 py-1 rounded-xl"
                        style={{
                          color: '#e6f2fb',
                          background: 'rgba(122, 166, 194, 0.16)',
                          border: '1px solid #7aa6c2',
                        }}
                      >
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" style={{ color: '#7aa6c2' }} aria-hidden="true" />
                        <span>{errors.volumen}</span>
                      </p>
                    )}
                  </div>

                  {/* Row 3: Línea Técnica + Destino */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label
                        htmlFor="b2b-linea"
                        className="block text-xs font-display font-extrabold uppercase tracking-wide"
                        style={{ color: 'var(--text-main)' }}
                      >
                        Línea de Prendas
                      </label>
                      <select
                        id="b2b-linea"
                        name="productLine"
                        value={productLine}
                        onChange={(e) => setProductLine(e.target.value)}
                        className="glass-input w-full px-4 py-3 rounded-2xl text-xs sm:text-sm font-semibold cursor-pointer"
                        style={{ backgroundColor: '#1a2633', color: '#e6f2fb' }}
                      >
                        {PRODUCT_LINES.map((line) => (
                          <option
                            key={line}
                            value={line}
                            style={{ backgroundColor: '#1a2633', color: '#e6f2fb' }}
                          >
                            {line}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label
                        htmlFor="b2b-destino"
                        className="block text-xs font-display font-extrabold uppercase tracking-wide"
                        style={{ color: 'var(--text-main)' }}
                      >
                        Ciudad / Campamento Minero
                      </label>
                      <input
                        id="b2b-destino"
                        name="destination"
                        type="text"
                        autoComplete="address-level2"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        placeholder="Ej. Arequipa / Cerro de Pasco / Cusco…"
                        className="glass-input w-full px-4 py-3 rounded-2xl text-sm font-medium"
                      />
                    </div>
                  </div>

                  {/* Row 4: Contacto & Teléfono / Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label
                        htmlFor="b2b-responsable"
                        className="block text-xs font-display font-extrabold uppercase tracking-wide"
                        style={{ color: 'var(--text-main)' }}
                      >
                        Contacto / Cargo
                      </label>
                      <input
                        id="b2b-responsable"
                        name="contactName"
                        type="text"
                        autoComplete="name"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="Ej. Ing. Carlos Méndez • SSOMA…"
                        className="glass-input w-full px-4 py-2.5 rounded-2xl text-sm font-medium"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label
                        htmlFor="b2b-contacto"
                        className="block text-xs font-display font-extrabold uppercase tracking-wide"
                        style={{ color: 'var(--text-main)' }}
                      >
                        WhatsApp o Correo Corporativo
                      </label>
                      <input
                        id="b2b-contacto"
                        name="contactPhone"
                        type="text"
                        autoComplete="tel"
                        spellCheck={false}
                        aria-invalid={Boolean(errors.contactPhone)}
                        value={contactPhone}
                        onChange={(e) => {
                          setContactPhone(e.target.value);
                          if (errors.contactPhone) {
                            setErrors((prev) => ({ ...prev, contactPhone: undefined }));
                          }
                        }}
                        placeholder="Ej. 987 654 321 o compras@empresa.pe…"
                        className="glass-input w-full px-4 py-2.5 rounded-2xl text-sm font-medium"
                      />
                      {errors.contactPhone && (
                        <p
                          role="alert"
                          className="text-[11px] font-semibold flex items-center gap-1.5 px-2.5 py-1 rounded-xl"
                          style={{
                            color: '#e6f2fb',
                            background: 'rgba(122, 166, 194, 0.16)',
                            border: '1px solid #7aa6c2',
                          }}
                        >
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" style={{ color: '#7aa6c2' }} aria-hidden="true" />
                          <span>{errors.contactPhone}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Bordado Toggle + Observaciones */}
                  <div className="space-y-3">
                    <label
                      htmlFor="b2b-bordado"
                      className="flex items-center gap-3 px-4 py-3 rounded-2xl cursor-pointer transition-colors"
                      style={{
                        background: includeEmbroidery
                          ? 'rgba(122, 166, 194, 0.16)'
                          : 'rgba(11, 15, 20, 0.5)',
                        border: includeEmbroidery
                          ? '1px solid #7aa6c2'
                          : '1px solid #2f4a5d',
                      }}
                    >
                      <input
                        id="b2b-bordado"
                        type="checkbox"
                        checked={includeEmbroidery}
                        onChange={(e) => setIncludeEmbroidery(e.target.checked)}
                        className="w-4 h-4 accent-[#7aa6c2] rounded cursor-pointer"
                      />
                      <span className="text-xs sm:text-sm font-semibold" style={{ color: 'var(--text-main)' }}>
                        Incluir bordado computarizado de logotipo empresarial en pecho y/o espalda
                      </span>
                    </label>

                    <div className="space-y-1.5">
                      <label
                        htmlFor="b2b-notas"
                        className="block text-[11px] font-display font-bold uppercase tracking-wide"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        Especificaciones adicionales (opcional)
                      </label>
                      <textarea
                        id="b2b-notas"
                        rows={2}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Códigos de interés (ej. CAS-33, M-03), tallas especiales 3XL o fecha requerida…"
                        className="glass-input w-full px-4 py-2.5 rounded-2xl text-xs sm:text-sm resize-none"
                      />
                    </div>
                  </div>

                  {/* Primary CTA Button */}
                  <button
                    type="submit"
                    className="btn-neumorph-gold w-full py-4 px-6 rounded-full font-display font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 cursor-pointer"
                  >
                    <Building2 className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
                    <span>Solicitar Cotización Corporativa</span>
                    <ArrowRight className="w-4 h-4 stroke-[3]" aria-hidden="true" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
