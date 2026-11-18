import { BRAND_CONFIG, Product } from '../data/catalog';

export interface QuoteItem {
  product: Product;
  size: string;
  quantity: number;
  withLogo: boolean;
}

export interface CustomerQuoteData {
  orderType: 'personal' | 'empresa';
  customerName: string;
  companyName?: string;
  ruc?: string;
  city: string;
  notes?: string;
}

export function buildSingleProductMessage(
  product: Product,
  size: string = 'L',
  quantity: number = 1,
  withLogo: boolean = false
): string {
  const origin =
    typeof window !== 'undefined' && window.location.origin
      ? window.location.origin
      : 'https://whamountainperu.com';
  const productUrl = `${origin}/?producto=${product.code}`;
  const imageUrl = `${origin}${product.primaryImage}`;
  const logoText = withLogo
    ? 'Sí (Deseo cotizar bordado corporativo)'
    : 'Sin bordado adicional';

  return [
    `¡Hola *${BRAND_CONFIG.name}*! 👋`,
    `Deseo cotizar / pedir esta prenda de su catálogo oficial:`,
    ``,
    `▪ *Código:* ${product.code}`,
    `▪ *Prenda:* ${product.title}`,
    `▪ *Tela / Nivel Térmico:* ${product.fabric} (${product.thermal})`,
    `▪ *Reflectivo:* ${product.reflective}`,
    `▪ *Talla:* ${size}  |  *Cantidad:* ${quantity} und.`,
    `▪ *Bordado de Logo:* ${logoText}`,
    `▪ *Ver Foto / Ficha:* ${productUrl}`,
    `▪ *Imagen Directa:* ${imageUrl}`,
    ``,
    `¿Me confirman disponibilidad, precio actual y envío? ¡Gracias!`,
  ].join('\n');
}

export function buildCartQuoteMessage(
  items: QuoteItem[],
  customer: CustomerQuoteData,
  quoteCode?: string
): string {
  const totalUnits = items.reduce((acc, item) => acc + item.quantity, 0);
  const codeHeader = quoteCode ? ` [N° ${quoteCode}]` : '';
  const header =
    customer.orderType === 'empresa'
      ? `🏢 *ORDEN DE COTIZACIÓN CORPORATIVA${codeHeader} — ${BRAND_CONFIG.name}*`
      : `🛍️ *ORDEN DE COTIZACIÓN / PEDIDO${codeHeader} — ${BRAND_CONFIG.name}*`;

  const clientDetails = [
    `👤 *Solicitante:* ${customer.customerName || 'Cliente Web'}`,
    ...(customer.orderType === 'empresa' && customer.companyName
      ? [`🏛️ *Razón Social:* ${customer.companyName}`]
      : []),
    ...(customer.orderType === 'empresa' && customer.ruc
      ? [`📄 *RUC:* ${customer.ruc}`]
      : []),
    `📍 *Ciudad / Destino:* ${customer.city || 'Perú'}`,
    `📦 *Total Unidades:* ${totalUnits} prendas`,
  ];

  const itemLines = items.map(
    (item, idx) =>
      `${idx + 1}. *[${item.product.code}]* ${item.product.title}\n   Talla: ${item.size} | Cant: ${item.quantity} und. | Bordado: ${item.withLogo ? 'Sí' : 'No'}`
  );

  return [
    header,
    ``,
    ...clientDetails,
    ``,
    `📋 *RESUMEN DE PRENDAS:*`,
    ...itemLines,
    ...(customer.notes ? [``, `💬 *Observaciones:* ${customer.notes}`] : []),
    ``,
    `📎 *(Adjunto o descargo mi Orden de Cotización con las fotos de referencia)*`,
  ].join('\n');
}

export function openWhatsAppOrder(message: string): void {
  const encoded = encodeURIComponent(message);
  const url = `https://wa.me/${BRAND_CONFIG.whatsappNumber}?text=${encoded}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

export async function openFacebookOrder(
  message: string,
  onToast?: (msg: string) => void
): Promise<void> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(message);
      if (onToast) {
        onToast(
          '¡Pedido copiado al portapapeles! Pégalo (Ctrl+V) en el chat de nuestro Facebook.'
        );
      }
    }
  } catch {
    // Fallback
  }
  window.open(BRAND_CONFIG.facebookUrl, '_blank', 'noopener,noreferrer');
}

/**
 * Crea una tarjeta visual PNG en alta resolución con la foto de la prenda, su código,
 * especificaciones, talla y cantidad para que el usuario pueda compartirla como archivo
 * en celular (Web Share API) o pegarla con Ctrl+V directamente en WhatsApp Web / Desktop.
 */
async function renderProductVisualCardBlob(
  product: Product,
  size: string,
  quantity: number,
  withLogo: boolean
): Promise<Blob | null> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 900;
    canvas.height = 540;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      resolve(null);
      return;
    }

    // Noche Alpina background (#0b0f14)
    ctx.fillStyle = '#0b0f14';
    ctx.fillRect(0, 0, 900, 540);

    // Top Alpine Header (#1a2633 -> #2f4a5d)
    const grad = ctx.createLinearGradient(0, 0, 900, 0);
    grad.addColorStop(0, '#1a2633');
    grad.addColorStop(1, '#2f4a5d');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 900, 74);

    // Ice Blue top accent line (#7aa6c2)
    ctx.fillStyle = '#7aa6c2';
    ctx.fillRect(0, 72, 900, 4);

    ctx.fillStyle = '#e6f2fb';
    ctx.font = 'bold 22px Montserrat, sans-serif';
    ctx.fillText('WHA MOUNTAIN PERÚ  |  FICHA DE COTIZACIÓN', 32, 46);

    ctx.fillStyle = '#7aa6c2';
    ctx.font = 'bold 18px Montserrat, sans-serif';
    ctx.fillText(`WhatsApp: ${BRAND_CONFIG.whatsappDisplay}`, 640, 46);

    // Left Photo Box (Alpine Snow stage inside Steel border so dark & bright garments pop)
    ctx.fillStyle = '#e6f2fb';
    ctx.fillRect(32, 98, 340, 410);
    ctx.strokeStyle = '#7aa6c2';
    ctx.lineWidth = 2;
    ctx.strokeRect(32, 98, 340, 410);

    // Right Details Box — Code Badge
    ctx.fillStyle = '#7aa6c2';
    ctx.fillRect(400, 98, 178, 44);
    ctx.fillStyle = '#0b0f14';
    ctx.font = 'bold 22px monospace';
    ctx.fillText(`CÓD: ${product.code}`, 418, 128);

    // Title (wrapped)
    ctx.fillStyle = '#e6f2fb';
    ctx.font = 'bold 23px Montserrat, sans-serif';
    const words = product.title.split(' ');
    let line = '';
    let y = 180;
    for (const w of words) {
      const test = line + w + ' ';
      if (ctx.measureText(test).width > 460 && line !== '') {
        ctx.fillText(line, 400, y);
        line = w + ' ';
        y += 30;
      } else {
        line = test;
      }
    }
    ctx.fillText(line, 400, y);

    // Specs Box (#1a2633 with #2f4a5d border)
    y += 28;
    ctx.fillStyle = '#1a2633';
    ctx.fillRect(400, y, 468, 155);
    ctx.strokeStyle = '#2f4a5d';
    ctx.strokeRect(400, y, 468, 155);

    ctx.fillStyle = '#e6f2fb';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(`• Tela: ${product.fabric}`, 418, y + 34);
    ctx.fillText(`• Nivel Térmico: ${product.thermal}`, 418, y + 66);
    ctx.fillText(`• Reflectivo: ${product.reflective}`, 418, y + 98);
    ctx.fillStyle = '#7aa6c2';
    ctx.fillText(
      `• Pedido: Talla ${size}  |  Cantidad: ${quantity} und.  |  Bordado: ${withLogo ? 'SÍ' : 'NO'}`,
      418,
      y + 132
    );

    // Bottom Steel Bar (#2f4a5d)
    ctx.fillStyle = '#2f4a5d';
    ctx.fillRect(400, 452, 468, 56);
    ctx.strokeStyle = '#7aa6c2';
    ctx.strokeRect(400, 452, 468, 56);
    ctx.fillStyle = '#e6f2fb';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(
      `SOLICITUD DE COTIZACIÓN — CÓDIGO ${product.code}`,
      422,
      486
    );

    // Load product image
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const maxW = 300;
      const maxH = 370;
      const ratio = Math.min(maxW / img.width, maxH / img.height);
      const drawW = img.width * ratio;
      const drawH = img.height * ratio;
      const drawX = 32 + (340 - drawW) / 2;
      const drawY = 98 + (410 - drawH) / 2;
      ctx.drawImage(img, drawX, drawY, drawW, drawH);
      canvas.toBlob((blob) => resolve(blob), 'image/png');
    };
    img.onerror = () => {
      canvas.toBlob((blob) => resolve(blob), 'image/png');
    };
    img.src = product.primaryImage;
  });
}

/**
 * Envía el pedido por WhatsApp incluyendo la IMAGEN:
 * - En móviles compatibles: abre el menú nativo con la foto PNG adjunta + el texto.
 * - En PC / otros: copia la tarjeta fotográfica PNG al portapapeles (para pegar con Ctrl+V en WhatsApp)
 *   y abre la conversación de WhatsApp con el mensaje pre-cargado.
 */
export async function sendWhatsAppWithProductImage(
  product: Product,
  size: string = 'L',
  quantity: number = 1,
  withLogo: boolean = false,
  onToast?: (msg: string) => void
): Promise<void> {
  const message = buildSingleProductMessage(product, size, quantity, withLogo);
  const blob = await renderProductVisualCardBlob(product, size, quantity, withLogo);

  if (blob) {
    const file = new File([blob], `WHA-MOUNTAIN-${product.code}.png`, {
      type: 'image/png',
    });

    // 1. Mobile Native Share with Image File attached
    const nav = navigator as Navigator & {
      canShare?: (data?: ShareData) => boolean;
    };
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile && nav.canShare && nav.canShare({ files: [file] })) {
      try {
        await navigator.share({
          title: `WHA MOUNTAIN - ${product.code}`,
          text: message,
          files: [file],
        });
        return;
      } catch {
        // User cancelled or fallback to wa.me
      }
    }

    // 2. Desktop / Fallback: Copy the visual PNG card to clipboard so user can Ctrl+V in WhatsApp!
    try {
      if (navigator.clipboard && 'write' in navigator.clipboard && typeof ClipboardItem !== 'undefined') {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ]);
        if (onToast) {
          onToast(
            `📸 ¡Foto de ${product.code} copiada! Presiona Ctrl+V en el chat de WhatsApp para pegar la imagen.`
          );
        }
      }
    } catch {
      // Ignore if clipboard image write not permitted
    }
  }

  openWhatsAppOrder(message);
}

/**
 * Genera una Orden de Cotización Formal en formato imprimible / PDF con fotos de cada prenda,
 * membrete azul marino y hueso de WHA MOUNTAIN, RUC, tallas y cantidades.
 */
export function generatePrintableQuoteOrderPDF(
  items: QuoteItem[],
  customer: CustomerQuoteData
): string {
  const quoteCode = `COT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const dateStr = new Date().toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const totalUnits = items.reduce((sum, item) => sum + item.quantity, 0);
  const baseHref = new URL('.', window.location.href).href;
  const resolveAsset = (path: string) =>
    new URL(path.replace(/^\.?\//, ''), baseHref).href;

  const rowsHtml = items
    .map(
      (item, idx) => `
      <tr>
        <td style="padding:10px; border-bottom:1px solid #2f4a5d; text-align:center; font-weight:700; color:#0b0f14;">
          ${idx + 1}
        </td>
        <td style="padding:10px; border-bottom:1px solid #2f4a5d; text-align:center;">
          <img src="${resolveAsset(item.product.primaryImage)}" alt="${item.product.code}" style="width:64px; height:64px; object-fit:contain; background:#e6f2fb; border:1px solid #7aa6c2; border-radius:8px; padding:4px;" />
        </td>
        <td style="padding:10px; border-bottom:1px solid #2f4a5d; font-family:monospace; font-weight:800; font-size:14px; color:#0b0f14;">
          ${item.product.code}
        </td>
        <td style="padding:10px; border-bottom:1px solid #2f4a5d;">
          <div style="font-weight:700; color:#0b0f14; font-size:13px;">${item.product.title}</div>
          <div style="font-size:11px; color:#1a2633; margin-top:2px;">
            Tela: ${item.product.fabric} | ${item.product.thermal} | ${item.product.reflective}
          </div>
        </td>
        <td style="padding:10px; border-bottom:1px solid #2f4a5d; text-align:center; font-weight:700; color:#0b0f14;">
          ${item.size}
        </td>
        <td style="padding:10px; border-bottom:1px solid #2f4a5d; text-align:center; font-weight:700; color:#1a2633;">
          ${item.withLogo ? 'Sí (Bordado)' : 'Estándar'}
        </td>
        <td style="padding:10px; border-bottom:1px solid #2f4a5d; text-align:center; font-weight:800; font-size:14px; color:#0b0f14;">
          ${item.quantity} und.
        </td>
      </tr>`
    )
    .join('');

  const html = `<!DOCTYPE html>
<html lang="es-PE">
<head>
  <meta charset="UTF-8" />
  <title>Orden de Cotización ${quoteCode} - WHA MOUNTAIN PERÚ</title>
  <style>
    @page { size: A4 portrait; margin: 14mm; }
    body {
      font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background: #0b0f14;
      color: #0b0f14;
      margin: 0;
      padding: 24px;
    }
    .sheet {
      max-width: 820px;
      margin: 0 auto;
      background: #e6f2fb;
      border: 2px solid #7aa6c2;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 18px 40px rgba(11, 15, 20, 0.45);
    }
    .header {
      background: linear-gradient(135deg, #0b0f14 0%, #1a2633 55%, #2f4a5d 100%);
      color: #e6f2fb;
      padding: 24px 28px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 4px solid #7aa6c2;
    }
    .brand-box { display: flex; align-items: center; gap: 16px; }
    .brand-box img { width: 62px; height: 62px; object-fit: contain; background: #e6f2fb; border-radius: 10px; padding: 4px; border: 2px solid #7aa6c2; }
    .doc-badge {
      text-align: right;
      background: rgba(26, 38, 51, 0.85);
      padding: 10px 16px;
      border-radius: 10px;
      border: 1px solid #7aa6c2;
    }
    .content { padding: 24px 28px; }
    .meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      background: rgba(122, 166, 194, 0.16);
      border: 1px solid #2f4a5d;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 20px;
      font-size: 13px;
      color: #0b0f14;
    }
    table { width: 100%; border-collapse: collapse; font-size: 12px; background: #e6f2fb; border: 1.5px solid #2f4a5d; border-radius: 10px; overflow: hidden; }
    th { background: #1a2633; color: #e6f2fb; padding: 10px; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; }
    .footer-note {
      margin-top: 22px;
      padding: 16px;
      background: rgba(122, 166, 194, 0.16);
      border-left: 4px solid #1a2633;
      font-size: 12px;
      color: #1a2633;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .no-print-bar {
      max-width: 820px;
      margin: 0 auto 16px auto;
      display: flex;
      gap: 10px;
      justify-content: flex-end;
    }
    .btn {
      padding: 10px 18px;
      border-radius: 9999px;
      font-weight: 800;
      font-size: 13px;
      cursor: pointer;
      border: 1.5px solid #7aa6c2;
    }
    .btn-navy { background: #7aa6c2; color: #0b0f14; }
    @media print {
      body { background: #e6f2fb; padding: 0; }
      .sheet { box-shadow: none; border: 1px solid #2f4a5d; }
      .no-print-bar { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="no-print-bar">
    <button class="btn btn-navy" onclick="window.print()">Guardar como PDF / Imprimir Orden</button>
  </div>
  <div class="sheet">
    <div class="header">
      <div class="brand-box">
        <img src="${resolveAsset('images/brand/logo-wha-mountain.png')}" alt="WHA MOUNTAIN" />
        <div>
          <div style="font-size:22px; font-weight:900; letter-spacing:0.5px;">WHA MOUNTAIN PERÚ</div>
          <div style="font-size:12px; color:#e6f2fb; margin-top:2px;">Ingeniería Textil para Minería, Alta Montaña y Frío Extremo</div>
          <div style="font-size:12px; color:#7aa6c2; font-weight:700; margin-top:4px;">WhatsApp Central: +51 ${BRAND_CONFIG.whatsappDisplay}  |  ${BRAND_CONFIG.email}</div>
        </div>
      </div>
      <div class="doc-badge">
        <div style="font-size:11px; color:#7aa6c2; font-weight:700; text-transform:uppercase;">Orden de Cotización</div>
        <div style="font-size:18px; font-weight:900; font-family:monospace; margin-top:2px; color:#e6f2fb;">${quoteCode}</div>
        <div style="font-size:11px; color:#7aa6c2; margin-top:2px;">Fecha: ${dateStr}</div>
      </div>
    </div>

    <div class="content">
      <div class="meta-grid">
        <div><strong>Modalidad:</strong> ${customer.orderType === 'empresa' ? 'Corporativa / Minera (Con RUC)' : 'Compra Directa / Personal'}</div>
        <div><strong>Ciudad / Destino:</strong> ${customer.city || 'Perú'}</div>
        <div><strong>Solicitante:</strong> ${customer.customerName || 'Cliente Web'}</div>
        <div><strong>Total de Prendas:</strong> ${totalUnits} unidades</div>
        ${customer.companyName ? `<div><strong>Razón Social:</strong> ${customer.companyName}</div>` : ''}
        ${customer.ruc ? `<div><strong>RUC:</strong> ${customer.ruc}</div>` : ''}
        ${customer.notes ? `<div style="grid-column: span 2;"><strong>Observaciones:</strong> ${customer.notes}</div>` : ''}
      </div>

      <table>
        <thead>
          <tr>
            <th style="width:36px;">#</th>
            <th style="width:80px;">Foto</th>
            <th style="width:90px;">Código</th>
            <th style="text-align:left;">Descripción Técnica de la Prenda</th>
            <th style="width:65px;">Talla</th>
            <th style="width:95px;">Personalización</th>
            <th style="width:80px;">Cantidad</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>

      <div class="footer-note">
        <div>
          <strong>¿Cómo confirmar esta Orden de Cotización con WHA MOUNTAIN?</strong><br/>
          Guarda este documento como PDF y envíalo a nuestro WhatsApp Oficial <strong>+51 ${BRAND_CONFIG.whatsappDisplay}</strong> o al correo <strong>${BRAND_CONFIG.email}</strong> indicando el número de orden <strong>${quoteCode}</strong>.
        </div>
      </div>
    </div>
  </div>
  <script>
    window.onload = function() {
      setTimeout(function() { window.print(); }, 450);
    };
  </script>
</body>
</html>`;

  const printWin = window.open('', '_blank');
  if (printWin) {
    printWin.document.open();
    printWin.document.write(html);
    printWin.document.close();
  }
  return quoteCode;
}
