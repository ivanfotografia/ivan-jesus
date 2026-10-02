import { jsPDF } from 'jspdf';
import { FinancialTransaction, UserSettings } from '../types';

export interface FinancialReportData {
  monthKey: string; // YYYY-MM
  monthName: string; // e.g. "Setembro de 2026"
  transactions: FinancialTransaction[];
  paidIncome: number;
  paidExpenses: number;
  netBalance: number;
  pendingIncome: number;
  pendingExpenses: number;
  extraPhotosRevenue: number;
  monthlyGoal: number;
  settings: UserSettings;
  incomeByCategory: Record<string, number>;
  expenseByCategory: Record<string, number>;
}

export const generateFinancialPdf = (data: FinancialReportData) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  let currentY = 16;

  const formatBRL = (val: number) => {
    return `R$ ${val.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const addHeader = (isFirstPage: boolean) => {
    // Brand header background accent
    doc.setFillColor(24, 24, 27); // Zinc 900
    doc.rect(margin, currentY, pageWidth - margin * 2, 24, 'F');

    // Studio title & Report Title
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(
      (data.settings.studioName || 'LUMINA STUDIO').toUpperCase(),
      margin + 6,
      currentY + 9
    );

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(217, 119, 6); // Amber 600
    doc.text('RELATÓRIO FINANCEIRO CONSOLIDADO', margin + 6, currentY + 16);

    // Right-aligned details
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(212, 212, 216); // Zinc 300
    const rightX = pageWidth - margin - 6;
    doc.text(`Mês: ${data.monthName}`, rightX, currentY + 9, { align: 'right' });
    doc.text(
      `Emissão: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
      rightX,
      currentY + 16,
      { align: 'right' }
    );

    currentY += 28;
  };

  // First page header
  addHeader(true);

  // Metadata Studio & Period bar
  doc.setFillColor(244, 244, 245); // Zinc 100
  doc.rect(margin, currentY, pageWidth - margin * 2, 14, 'F');
  doc.setDrawColor(228, 228, 231);
  doc.rect(margin, currentY, pageWidth - margin * 2, 14, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(39, 39, 42);
  doc.text(`Fotógrafo: ${data.settings.photographerName || 'Ivan Silva'}`, margin + 4, currentY + 5.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(82, 82, 91);
  doc.text(
    `E-mail: ${data.settings.email || 'contato@luminastudio.com'}  |  Tel: ${data.settings.phone || '(11) 98765-4321'}  |  PIX: ${data.settings.pixKey || 'Não cadastrado'}`,
    margin + 4,
    currentY + 10.5
  );

  currentY += 19;

  // Executive Summary - 4 KPI Cards
  const cardWidth = (pageWidth - margin * 2 - 9) / 4;
  const cardHeight = 22;

  // 1. Receitas Pagas
  doc.setFillColor(236, 253, 245); // Emerald 50
  doc.rect(margin, currentY, cardWidth, cardHeight, 'F');
  doc.setDrawColor(167, 243, 208); // Emerald 200
  doc.rect(margin, currentY, cardWidth, cardHeight, 'S');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(5, 150, 105);
  doc.text('RECEITAS RECEBIDAS', margin + 3, currentY + 6);
  doc.setFontSize(10.5);
  doc.setTextColor(4, 120, 87);
  doc.text(`+${formatBRL(data.paidIncome)}`, margin + 3, currentY + 14);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(110, 231, 183);
  doc.text(`${formatBRL(data.extraPhotosRevenue)} em extras`, margin + 3, currentY + 19);

  // 2. Despesas Pagas
  const card2X = margin + cardWidth + 3;
  doc.setFillColor(255, 241, 242); // Rose 50
  doc.rect(card2X, currentY, cardWidth, cardHeight, 'F');
  doc.setDrawColor(254, 205, 211); // Rose 200
  doc.rect(card2X, currentY, cardWidth, cardHeight, 'S');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(225, 29, 72);
  doc.text('DESPESAS PAGAS', card2X + 3, currentY + 6);
  doc.setFontSize(10.5);
  doc.setTextColor(190, 18, 60);
  doc.text(`-${formatBRL(data.paidExpenses)}`, card2X + 3, currentY + 14);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(244, 63, 94);
  doc.text('Custos operacionais', card2X + 3, currentY + 19);

  // 3. Lucro Líquido
  const card3X = card2X + cardWidth + 3;
  doc.setFillColor(244, 244, 245); // Zinc 100
  doc.rect(card3X, currentY, cardWidth, cardHeight, 'F');
  doc.setDrawColor(212, 212, 216); // Zinc 300
  doc.rect(card3X, currentY, cardWidth, cardHeight, 'S');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(39, 39, 42);
  doc.text('SALDO LÍQUIDO', card3X + 3, currentY + 6);
  doc.setFontSize(10.5);
  doc.setTextColor(data.netBalance >= 0 ? 15 : 225, data.netBalance >= 0 ? 118 : 29, data.netBalance >= 0 ? 110 : 72);
  doc.text(formatBRL(data.netBalance), card3X + 3, currentY + 14);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(113, 113, 122);
  const marginPct = data.paidIncome > 0 ? Math.round((data.netBalance / data.paidIncome) * 100) : 0;
  doc.text(`Margem líquida: ${marginPct}%`, card3X + 3, currentY + 19);

  // 4. A Receber / Pendente
  const card4X = card3X + cardWidth + 3;
  doc.setFillColor(254, 243, 199); // Amber 50
  doc.rect(card4X, currentY, cardWidth, cardHeight, 'F');
  doc.setDrawColor(253, 230, 138); // Amber 200
  doc.rect(card4X, currentY, cardWidth, cardHeight, 'S');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(180, 83, 9);
  doc.text('VALORES A RECEBER', card4X + 3, currentY + 6);
  doc.setFontSize(10.5);
  doc.setTextColor(180, 83, 9);
  doc.text(formatBRL(data.pendingIncome), card4X + 3, currentY + 14);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(217, 119, 6);
  const goalPct = data.monthlyGoal > 0 ? Math.round((data.paidIncome / data.monthlyGoal) * 100) : 0;
  doc.text(`Meta atingida: ${goalPct}%`, card4X + 3, currentY + 19);

  currentY += cardHeight + 8;

  // Breakdown por Categorias (2 Colunas: Receitas e Despesas)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(24, 24, 27);
  doc.text('CONSOLIDAÇÃO POR CATEGORIA', margin, currentY);
  currentY += 4;

  const colWidth = (pageWidth - margin * 2 - 6) / 2;
  const breakColHeight = 32;

  // Box Receitas por Categoria
  doc.setFillColor(250, 250, 250);
  doc.rect(margin, currentY, colWidth, breakColHeight, 'F');
  doc.setDrawColor(228, 228, 231);
  doc.rect(margin, currentY, colWidth, breakColHeight, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(4, 120, 87);
  doc.text('Receitas por Categoria', margin + 3, currentY + 5);

  let rY = currentY + 9;
  const incomeCats = Object.entries(data.incomeByCategory).slice(0, 4);
  if (incomeCats.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(161, 161, 170);
    doc.text('Nenhuma receita registrada no período.', margin + 3, rY + 3);
  } else {
    incomeCats.forEach(([cat, amount]) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(63, 63, 70);
      const catTruncated = cat.length > 25 ? cat.substring(0, 23) + '..' : cat;
      doc.text(catTruncated, margin + 3, rY);
      doc.setFont('helvetica', 'bold');
      doc.text(formatBRL(amount), margin + colWidth - 3, rY, { align: 'right' });
      rY += 5;
    });
  }

  // Box Despesas por Categoria
  const expColX = margin + colWidth + 6;
  doc.setFillColor(250, 250, 250);
  doc.rect(expColX, currentY, colWidth, breakColHeight, 'F');
  doc.setDrawColor(228, 228, 231);
  doc.rect(expColX, currentY, colWidth, breakColHeight, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(190, 18, 60);
  doc.text('Despesas por Categoria', expColX + 3, currentY + 5);

  let eY = currentY + 9;
  const expenseCats = Object.entries(data.expenseByCategory).slice(0, 4);
  if (expenseCats.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(161, 161, 170);
    doc.text('Nenhuma despesa registrada no período.', expColX + 3, eY + 3);
  } else {
    expenseCats.forEach(([cat, amount]) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(63, 63, 70);
      const catTruncated = cat.length > 25 ? cat.substring(0, 23) + '..' : cat;
      doc.text(catTruncated, expColX + 3, eY);
      doc.setFont('helvetica', 'bold');
      doc.text(formatBRL(amount), expColX + colWidth - 3, eY, { align: 'right' });
      eY += 5;
    });
  }

  currentY += breakColHeight + 9;

  // Tabela Analítica de Lançamentos
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(24, 24, 27);
  doc.text(`EXTRATO DE LANÇAMENTOS DO MÊS (${data.transactions.length} registros)`, margin, currentY);
  currentY += 4;

  const drawTableHeader = () => {
    doc.setFillColor(39, 39, 42); // Zinc 800
    doc.rect(margin, currentY, pageWidth - margin * 2, 7, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);

    doc.text('DATA', margin + 3, currentY + 4.5);
    doc.text('DESCRIÇÃO / CONTRATO', margin + 24, currentY + 4.5);
    doc.text('CATEGORIA', margin + 95, currentY + 4.5);
    doc.text('STATUS', margin + 140, currentY + 4.5);
    doc.text('VALOR', pageWidth - margin - 3, currentY + 4.5, { align: 'right' });

    currentY += 7;
  };

  drawTableHeader();

  // Transactions list
  data.transactions.forEach((tx, idx) => {
    // Check if new page is needed
    if (currentY > pageHeight - 20) {
      doc.addPage();
      currentY = 16;
      addHeader(false);
      drawTableHeader();
    }

    const isEven = idx % 2 === 0;
    if (isEven) {
      doc.setFillColor(250, 250, 250);
      doc.rect(margin, currentY, pageWidth - margin * 2, 7, 'F');
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(63, 63, 70);

    // Formatted date (DD/MM)
    const dateFormatted = tx.date ? tx.date.split('-').reverse().slice(0, 2).join('/') : '-';
    doc.text(dateFormatted, margin + 3, currentY + 4.5);

    // Title truncated
    const titleTrunc = tx.title.length > 40 ? tx.title.substring(0, 38) + '..' : tx.title;
    doc.text(titleTrunc, margin + 24, currentY + 4.5);

    // Category truncated
    const catTrunc = tx.category.length > 22 ? tx.category.substring(0, 20) + '..' : tx.category;
    doc.text(catTrunc, margin + 95, currentY + 4.5);

    // Status label
    const statusLabel = tx.status === 'paid' ? 'Pago' : tx.status === 'pending' ? 'Pendente' : 'Atrasado';
    if (tx.status === 'paid') {
      doc.setTextColor(4, 120, 87);
    } else {
      doc.setTextColor(180, 83, 9);
    }
    doc.text(statusLabel, margin + 140, currentY + 4.5);

    // Amount
    doc.setFont('helvetica', 'bold');
    if (tx.type === 'income') {
      doc.setTextColor(5, 150, 105);
      doc.text(`+${formatBRL(tx.amount)}`, pageWidth - margin - 3, currentY + 4.5, { align: 'right' });
    } else {
      doc.setTextColor(225, 29, 72);
      doc.text(`-${formatBRL(tx.amount)}`, pageWidth - margin - 3, currentY + 4.5, { align: 'right' });
    }

    currentY += 7;
  });

  // Total summary footer row
  if (currentY > pageHeight - 25) {
    doc.addPage();
    currentY = 16;
  }

  doc.setFillColor(244, 244, 245);
  doc.rect(margin, currentY, pageWidth - margin * 2, 8, 'F');
  doc.setDrawColor(212, 212, 216);
  doc.rect(margin, currentY, pageWidth - margin * 2, 8, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(39, 39, 42);
  doc.text('TOTAL CONSOLIDADO DO MÊS', margin + 3, currentY + 5.5);

  doc.text(
    `Entradas: +${formatBRL(data.paidIncome)}   |   Despesas: -${formatBRL(data.paidExpenses)}   |   Líquido: ${formatBRL(data.netBalance)}`,
    pageWidth - margin - 3,
    currentY + 5.5,
    { align: 'right' }
  );

  currentY += 16;

  // Signoff & Disclaimer
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(161, 161, 170);
  doc.text(
    'Relatório gerado automaticamente pelo Sistema Lumina Studio. Este documento é para controle interno e prestação de contas.',
    margin,
    currentY
  );

  // File save
  const cleanMonth = data.monthKey.replace(/[^0-9-]/g, '');
  doc.save(`relatorio-financeiro-${cleanMonth || 'consolidado'}.pdf`);
};
