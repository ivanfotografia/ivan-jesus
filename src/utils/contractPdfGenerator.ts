import { jsPDF } from 'jspdf';
import { PhotoSession, Client, UserSettings } from '../types';

interface GenerateContractPdfParams {
  session: PhotoSession;
  client?: Client;
  settings: UserSettings;
  deliveryDays?: number;
  paymentTerms?: string;
  signatureDataUrl?: string;
  documentType?: 'contract' | 'receipt' | 'proposal';
}

export function generateContractPdf({
  session,
  client,
  settings,
  deliveryDays = 25,
  paymentTerms,
  signatureDataUrl,
  documentType = 'contract',
}: GenerateContractPdfParams): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const studioName = settings.studioName || 'FotoGestor Studio Pro';
  const photographerName = settings.photographerName || 'Fotógrafo Responsável';
  const clientName = client?.name || 'Cliente Contratante';
  const clientCpf = client?.document || '000.000.000-00';
  const clientPhone = client?.phone || '(00) 00000-0000';
  const clientEmail = client?.email || 'cliente@email.com';

  const formatBrl = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
      drawHeader();
    }
  };

  const drawHeader = () => {
    // Header Bar Accent
    doc.setFillColor(245, 158, 11); // Amber
    doc.rect(margin, y, contentWidth, 2, 'F');
    y += 8;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(24, 24, 27);
    doc.text(studioName.toUpperCase(), margin, y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(113, 113, 122);
    const dateStr = new Date().toLocaleDateString('pt-BR');
    doc.text(`Emissão: ${dateStr}`, pageWidth - margin, y, { align: 'right' });
    y += 5;

    doc.setFontSize(9);
    doc.setTextColor(82, 82, 91);
    doc.text(`${photographerName} · Produções Fotográficas Profissionais`, margin, y);
    if (settings.phone) {
      doc.text(`Tel/WhatsApp: ${settings.phone}`, pageWidth - margin, y, { align: 'right' });
    }
    y += 8;

    doc.setDrawColor(228, 228, 231);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;
  };

  drawHeader();

  // Document Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(24, 24, 27);
  let docTitle = 'INSTRUMENTO PARTICULAR DE PRESTAÇÃO DE SERVIÇOS FOTOGRÁFICOS';
  if (documentType === 'receipt') {
    docTitle = 'RECIBO DE QUITAÇÃO & COMPROVANTE DE PAGAMENTO';
  } else if (documentType === 'proposal') {
    docTitle = 'PROPOSTA COMERCIAL & CRONOGRAMA DE PRODUÇÃO';
  }
  doc.text(docTitle, pageWidth / 2, y, { align: 'center' });
  y += 10;

  // Identification Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 34, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text('CONTRATADA (ESTÚDIO / FOTÓGRAFO):', margin + 4, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(`${studioName} (${photographerName})`, margin + 4, y + 11);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('CONTRATANTE (CLIENTE):', margin + 4, y + 18);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(`${clientName} · CPF/Doc: ${clientCpf}`, margin + 4, y + 23);
  doc.text(`Contato: ${clientPhone} | ${clientEmail}`, margin + 4, y + 28);
  y += 40;

  // Session Specs
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(24, 24, 27);
  doc.text('1. DADOS DA SESSÃO / EVENTO FOTOGRÁFICO', margin, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(63, 63, 70);

  const sessionDetails = [
    `Título do Trabalho: ${session.title}`,
    `Data Prevista: ${session.sessionDate} às ${session.sessionTime || 'Horário a combinar'}`,
    `Local de Realização: ${session.location || 'Locação externa indicada pelo cliente / Estúdio'}`,
    `Fotos Inclusas no Pacote: ${session.contractedPhotos || 30} fotografias em alta resolução`,
    `Prazo de Entrega: até ${deliveryDays} dias úteis após a seleção final das fotos pelo cliente.`,
  ];

  sessionDetails.forEach((line) => {
    checkPageBreak(6);
    doc.text(`• ${line}`, margin + 4, y);
    y += 5.5;
  });
  y += 4;

  // Financial Terms
  checkPageBreak(30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(24, 24, 27);
  doc.text('2. INVESTIMENTO E CONDIÇÕES DE PAGAMENTO', margin, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(63, 63, 70);

  const priceStr = formatBrl(session.packagePrice || 1800);
  doc.text(`• Valor Total Acordado: ${priceStr}`, margin + 4, y);
  y += 5.5;

  const defaultTerms =
    paymentTerms ||
    '50% como sinal de reserva da data no ato da assinatura e 50% até a realização da sessão.';
  const termsLines = doc.splitTextToSize(`• Condições: ${defaultTerms}`, contentWidth - 8);
  doc.text(termsLines, margin + 4, y);
  y += termsLines.length * 5 + 4;

  if (settings.pixKey) {
    checkPageBreak(12);
    doc.setFillColor(254, 243, 199);
    doc.setDrawColor(251, 191, 36);
    doc.roundedRect(margin, y, contentWidth, 10, 1.5, 1.5, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(146, 64, 14);
    doc.text(`Chave Pix para Pagamento: ${settings.pixKey}`, margin + 4, y + 6.5);
    y += 15;
  }

  // Legal Clauses (Lei 9.610/98, LGPD, Cancelamento)
  checkPageBreak(50);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(24, 24, 27);
  doc.text('3. CLÁUSULAS CONTRATUAIS & DIREITOS AUTORAIS', margin, y);
  y += 6;

  const clauses = [
    {
      title: '3.1. Direitos Autorais e Propriedade Intelectual (Lei Federal nº 9.610/98):',
      body: 'Os direitos patrimoniais e morais sobre as fotografias pertencem exclusivamente à CONTRATADA. Ao CONTRATANTE é outorgada a licença irrestrita de uso pessoal, impressão e publicação em redes sociais pessoais, vedada a cessão comercial a terceiros sem prévia autorização escrita.',
    },
    {
      title: '3.2. Autorização de Uso de Imagem para Portfólio:',
      body: 'O CONTRATANTE autoriza a veiculação de imagens selecionadas no portfólio digital, website e perfis profissionais da CONTRATADA, resguardada a dignidade dos retratados.',
    },
    {
      title: '3.3. Reagendamento e Força Maior:',
      body: 'Em caso de chuva torrencial ou motivo de força maior, o ensaio externo poderá ser remarcado sem custo adicional para ambas as partes conforme disponibilidade de agenda.',
    },
    {
      title: '3.4. Armazenamento e Backup:',
      body: 'A CONTRATADA compromete-se a manter backup de segurança dos arquivos brutos e editados por um período mínimo de 90 dias após a entrega final.',
    },
  ];

  clauses.forEach((cl) => {
    checkPageBreak(16);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(24, 24, 27);
    doc.text(cl.title, margin + 2, y);
    y += 4.5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(82, 82, 91);
    const bodyLines = doc.splitTextToSize(cl.body, contentWidth - 4);
    doc.text(bodyLines, margin + 2, y);
    y += bodyLines.length * 4 + 3;
  });

  // Signature Block
  checkPageBreak(45);
  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(24, 24, 27);
  doc.text('E por estarem justos e contratados, firmam o presente instrumento.', margin, y);
  y += 12;

  const colWidth = (contentWidth - 10) / 2;

  // Photographer Signature
  doc.setDrawColor(161, 161, 170);
  doc.line(margin, y + 14, margin + colWidth, y + 14);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(24, 24, 27);
  doc.text(photographerName, margin + colWidth / 2, y + 18, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(113, 113, 122);
  doc.text('CONTRATADA (FOTÓGRAFO)', margin + colWidth / 2, y + 22, { align: 'center' });

  // Client Signature (with drawn signature image if provided)
  const clientColX = margin + colWidth + 10;
  if (signatureDataUrl) {
    try {
      doc.addImage(signatureDataUrl, 'PNG', clientColX + 10, y - 6, colWidth - 20, 18);
    } catch {
      // Ignore signature image insertion errors
    }
  }

  doc.line(clientColX, y + 14, clientColX + colWidth, y + 14);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(24, 24, 27);
  doc.text(clientName, clientColX + colWidth / 2, y + 18, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(113, 113, 122);
  doc.text('CONTRATANTE (CLIENTE)', clientColX + colWidth / 2, y + 22, { align: 'center' });

  // Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(161, 161, 170);
    doc.text(
      `${studioName} · FotoGestor Pro · Documento gerado eletronicamente em conformidade com a MP 2.200-2/2001`,
      margin,
      pageHeight - 8
    );
    doc.text(`Página ${i} de ${totalPages}`, pageWidth - margin, pageHeight - 8, {
      align: 'right',
    });
  }

  // Save the PDF
  const filename = `Contrato_${clientName.replace(/[^a-zA-Z0-9]/g, '_')}_${session.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
  doc.save(filename);
}
