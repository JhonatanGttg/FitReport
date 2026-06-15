"use client";

import { Share2, Printer, FileDown } from "lucide-react";
import jsPDF from "jspdf";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export type ReportPdfRow = {
  label: string;
  first: string;
  second: string;
  delta: string;
  good: boolean;
  direction: "up" | "down" | "neutral";
};

export type ReportPdfData = {
  trainerName: string;
  trainerInstagram: string;
  trainerWhatsapp: string;
  signature: string;
  phrase: string;
  studentName: string;
  studentMeta: string;
  height: string;
  firstDate: string;
  secondDate: string;
  metrics: Array<{
    title: string;
    first: string;
    second: string;
    delta: string;
    good: boolean;
    direction: "up" | "down" | "neutral";
  }>;
  perimeterRows: ReportPdfRow[];
  skinfoldRows: ReportPdfRow[];
  compositionRows: ReportPdfRow[];
  improved: string[];
  worsened: string[];
  needs: string[];
  recommendations: string[];
  analysis: string;
};

export function ReportExportActions({
  targetId,
  message,
  reportData,
}: {
  targetId: string;
  message: string;
  reportData: ReportPdfData;
}) {
  async function pdf() {
    if (!document.getElementById(targetId)) return;
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    drawPremiumReport(doc, reportData);

    doc.save("fitreport-pro-relatorio.pdf");
    toast.success("PDF gerado em A4 paisagem.");
  }

  function whatsapp() {
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="no-print grid gap-2 sm:flex sm:flex-wrap">
      <Button type="button" onClick={pdf} className="h-11 gap-2 bg-blue-600 text-white hover:bg-blue-700">
        <FileDown className="size-4" />
        Gerar PDF
      </Button>
      <Button type="button" variant="outline" onClick={() => window.print()} className="h-11 gap-2">
        <Printer className="size-4" />
        Imprimir
      </Button>
      <Button type="button" variant="outline" onClick={whatsapp} className="h-11 gap-2">
        <Share2 className="size-4" />
        WhatsApp
      </Button>
    </div>
  );
}

function drawPremiumReport(doc: jsPDF, data: ReportPdfData) {
  const navy = [3, 10, 31] as const;
  const blue = [37, 99, 235] as const;
  const green = [22, 163, 74] as const;
  const red = [220, 38, 38] as const;
  const orange = [234, 88, 12] as const;
  const ink = [15, 23, 42] as const;
  const line = [203, 213, 225] as const;

  drawHeader(doc, data, navy, blue);

  let y = 48;
  const metricWidth = 66.7;
  data.metrics.forEach((metric, index) => {
    const x = 10 + index * (metricWidth + 5);
    drawMetric(doc, x, y, metricWidth, metric, metric.good ? green : red, blue, ink);
  });

  y = 76;
  drawTable(doc, 10, y, 150, "1. COMPARATIVO DE PERIMETRIA", ["Regioes", "1a", "2a", "Dif.", "Evol."], data.perimeterRows, line, navy, green, red, 10, 4.55);
  drawTable(doc, 10, 139, 150, "2. COMPARATIVO DAS DOBRAS CUTANEAS", ["Dobras", "1a", "2a", "Dif.", "Evol."], data.skinfoldRows, line, navy, green, red, 8, 4.45);
  drawTable(doc, 166, y, 121, "3. RESUMO DA COMPOSICAO CORPORAL", ["Indicador", "1a", "2a", "Dif."], data.compositionRows, line, navy, green, red, 9, 6.2);

  drawInsightBox(doc, 166, 109, 121, 27, "O QUE MELHOROU", data.improved, green);
  drawInsightBox(doc, 166, 140, 121, 25, "O QUE PIOROU", data.worsened, red);
  drawInsightBox(doc, 166, 169, 121, 27, "O QUE PRECISA MELHORAR", data.needs, orange);
  drawFooter(doc, data, navy);

  doc.addPage("a4", "landscape");
  drawHeader(doc, data, navy, blue, "ANALISE PROFISSIONAL");
  drawNarrativePage(doc, data, navy, blue, green, red, orange, line);
  drawFooter(doc, data, navy);
}

function drawHeader(
  doc: jsPDF,
  data: ReportPdfData,
  navy: readonly [number, number, number],
  blue: readonly [number, number, number],
  overline = "RELATORIO COMPARATIVO",
) {
  doc.setFillColor(...navy);
  doc.rect(0, 0, 297, 44, "F");
  doc.setFillColor(...blue);
  doc.triangle(244, 0, 297, 0, 297, 44, "F");
  doc.setDrawColor(...blue);
  doc.setLineWidth(1.1);
  for (let i = 0; i < 9; i += 1) {
    doc.line(249 + i * 6, 42, 297, 5 + i * 4);
  }

  doc.setFillColor(255, 255, 255);
  doc.circle(23, 20, 11, "F");
  doc.setTextColor(...navy);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("FR", 16.2, 24.5);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.text(data.trainerName.toUpperCase(), 39, 18);
  doc.setTextColor(147, 197, 253);
  doc.setFontSize(7);
  doc.text("PERSONAL TRAINER", 39, 25);
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.2);
  doc.line(80, 8, 80, 36);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.text(overline, 91, 17);
  doc.setTextColor(59, 130, 246);
  doc.setFontSize(18);
  doc.text("AVALIACAO FISICA", 91, 28);
  doc.setTextColor(226, 232, 240);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Analise comparativa com protocolo de 7 dobras de Pollock.", 91, 36);

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("AVALIACOES", 214, 12);
  doc.setFont("helvetica", "normal");
  doc.text(`1a: ${data.firstDate}`, 214, 18);
  doc.text(`2a: ${data.secondDate}`, 214, 23);
  doc.setFont("helvetica", "bold");
  doc.text("ALUNO", 214, 31);
  doc.setFont("helvetica", "normal");
  doc.text(`${data.studentName} | ${data.height}`, 214, 36);
}

function drawFooter(
  doc: jsPDF,
  data: ReportPdfData,
  navy: readonly [number, number, number],
) {
  doc.setFillColor(...navy);
  doc.rect(0, 202, 297, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text(data.signature, 13, 207);
  doc.setTextColor(147, 197, 253);
  doc.text(data.phrase.toUpperCase(), 119, 207);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "normal");
  doc.text(`${data.trainerInstagram}  |  ${data.trainerWhatsapp}`, 222, 207);
}

function drawNarrativePage(
  doc: jsPDF,
  data: ReportPdfData,
  navy: readonly [number, number, number],
  blue: readonly [number, number, number],
  green: readonly [number, number, number],
  red: readonly [number, number, number],
  orange: readonly [number, number, number],
  line: readonly [number, number, number],
) {
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 44, 297, 158, "F");

  drawTextPanel(doc, 10, 54, 132, 60, "ANALISE PROFISSIONAL", data.analysis, blue, line);
  drawListPanel(doc, 150, 54, 137, 42, "O QUE MELHOROU", data.improved, green, line);
  drawListPanel(doc, 150, 101, 137, 36, "O QUE PIOROU", data.worsened, red, line);
  drawListPanel(doc, 150, 142, 137, 42, "O QUE PRECISA MELHORAR", data.needs, orange, line);
  drawListPanel(doc, 10, 121, 132, 63, "RECOMENDACOES", data.recommendations, blue, line, 5);

  doc.setDrawColor(...navy);
  doc.setLineWidth(0.6);
  doc.line(10, 192, 287, 192);
  doc.setTextColor(...navy);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("Observacao: use os dados como apoio tecnico e correlacione com rotina, adesao, sono e estrategia alimentar.", 10, 197);
}

function drawTextPanel(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  height: number,
  title: string,
  text: string,
  accent: readonly [number, number, number],
  line: readonly [number, number, number],
) {
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(x, y, width, height, 2, 2, "F");
  doc.setDrawColor(...line);
  doc.roundedRect(x, y, width, height, 2, 2, "S");
  doc.setFillColor(...accent);
  doc.rect(x, y, 4, height, "F");
  doc.setTextColor(...accent);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(title, x + 9, y + 10);
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  const lines = doc.splitTextToSize(text, width - 18);
  let cursor = y + 19;
  lines.slice(0, 11).forEach((lineText: string) => {
    doc.text(lineText, x + 9, cursor);
    cursor += 4.3;
  });
}

function drawListPanel(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  height: number,
  title: string,
  items: string[],
  accent: readonly [number, number, number],
  line: readonly [number, number, number],
  maxItems = 4,
) {
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(x, y, width, height, 2, 2, "F");
  doc.setDrawColor(...line);
  doc.roundedRect(x, y, width, height, 2, 2, "S");
  doc.setFillColor(...accent);
  doc.roundedRect(x + 5, y + 6, 10, 10, 1.5, 1.5, "F");
  doc.setTextColor(...accent);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(title, x + 20, y + 10);
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.2);
  let cursor = y + 18;
  const content = items.length ? items : ["Sem alertas relevantes nesta comparacao."];
  content.slice(0, maxItems).forEach((item) => {
    const wrapped = doc.splitTextToSize(`- ${item}`, width - 27);
    wrapped.slice(0, 2).forEach((lineText: string) => {
      if (cursor <= y + height - 5) {
        doc.text(lineText, x + 20, cursor);
        cursor += 3.8;
      }
    });
  });
}

function drawMetric(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  metric: ReportPdfData["metrics"][number],
  accent: readonly [number, number, number],
  blue: readonly [number, number, number],
  ink: readonly [number, number, number],
) {
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(x, y, width, 20, 2, 2, "F");
  doc.setDrawColor(191, 219, 254);
  doc.roundedRect(x, y, width, 20, 2, 2, "S");
  doc.setFillColor(...blue);
  doc.roundedRect(x + 3, y + 4, 11, 11, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.text(metric.title.slice(0, 2).toUpperCase(), x + 5.1, y + 11.3);
  doc.setTextColor(...ink);
  doc.setFontSize(7.5);
  doc.text(metric.title.toUpperCase(), x + 18, y + 7);
  doc.setFont("helvetica", "normal");
  doc.text(`${metric.first}  ->  ${metric.second}`, x + 18, y + 13);
  doc.setTextColor(...accent);
  doc.setFont("helvetica", "bold");
  drawTrendArrow(doc, x + 20, y + 17.7, metric.direction, accent);
  doc.text(metric.delta, x + 25, y + 18);
}

function drawTable(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  title: string,
  headers: string[],
  rows: ReportPdfRow[],
  line: readonly [number, number, number],
  navy: readonly [number, number, number],
  green: readonly [number, number, number],
  red: readonly [number, number, number],
  rowLimit = 10,
  rowHeight = 5.4,
) {
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(title, x, y - 3);
  const headerHeight = 8;
  const usableRows = rows.slice(0, rowLimit);
  const tableHeight = headerHeight + usableRows.length * rowHeight;
  doc.setDrawColor(...line);
  doc.roundedRect(x, y, width, tableHeight, 1.5, 1.5, "S");
  doc.setFillColor(...navy);
  doc.rect(x, y, width, headerHeight, "F");
  const col = width / headers.length;
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(6.8);
  headers.forEach((header, index) => doc.text(header, x + 3 + index * col, y + 5.2));
  usableRows.forEach((row, index) => {
    const rowY = y + headerHeight + index * rowHeight;
    if (index % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(x, rowY, width, rowHeight, "F");
    }
    doc.setDrawColor(226, 232, 240);
    doc.line(x, rowY, x + width, rowY);
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", index === usableRows.length - 1 && row.label.includes("Soma") ? "bold" : "normal");
    doc.setFontSize(6.8);
    const values = [row.label, row.first, row.second, row.delta];
    values.slice(0, Math.min(headers.length, 4)).forEach((value, valueIndex) => {
      if (valueIndex === 3) doc.setTextColor(...(row.good ? green : red));
      else doc.setTextColor(15, 23, 42);
      doc.text(value, x + 3 + valueIndex * col, rowY + 3.8);
    });
    if (headers.length > 4) {
      const trendColor = row.good ? green : red;
      const trendX = x + 3 + 4 * col;
      doc.setTextColor(...trendColor);
      drawTrendArrow(doc, trendX + 3, rowY + 3.25, row.direction, trendColor, "compact");
      doc.text(row.good ? "OK" : "ALERTA", trendX + 8, rowY + 3.8);
    }
  });
}

function drawTrendArrow(
  doc: jsPDF,
  x: number,
  y: number,
  direction: "up" | "down" | "neutral",
  color: readonly [number, number, number],
  size: "default" | "compact" = "default",
) {
  doc.setDrawColor(...color);
  doc.setFillColor(...color);

  if (size === "compact") {
    doc.setLineWidth(0.45);
    if (direction === "neutral") {
      doc.line(x - 1.5, y, x + 1.5, y);
      return;
    }
    if (direction === "up") {
      doc.triangle(x, y - 1.35, x - 1.15, y + 1, x + 1.15, y + 1, "F");
      return;
    }
    doc.triangle(x, y + 1.35, x - 1.15, y - 1, x + 1.15, y - 1, "F");
    return;
  }

  doc.setLineWidth(0.7);

  if (direction === "neutral") {
    doc.line(x - 1.8, y - 1.8, x + 2.2, y - 1.8);
    return;
  }

  if (direction === "up") {
    doc.line(x, y, x, y - 4.4);
    doc.triangle(x, y - 5.4, x - 1.5, y - 3.5, x + 1.5, y - 3.5, "F");
    return;
  }

  doc.line(x, y - 4.4, x, y);
  doc.triangle(x, y + 1, x - 1.5, y - 0.9, x + 1.5, y - 0.9, "F");
}

function drawInsightBox(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  height: number,
  title: string,
  items: string[],
  accent: readonly [number, number, number],
) {
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(x, y, width, height, 2, 2, "S");
  doc.setFillColor(...accent);
  doc.roundedRect(x + 3, y + 4, 9, 9, 1.6, 1.6, "F");
  doc.setTextColor(...accent);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text(title, x + 16, y + 7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(6.5);
  let cursor = y + 12;
  items.slice(0, 4).forEach((item) => {
    const wrapped = doc.splitTextToSize(`- ${item}`, width - 21);
    wrapped.slice(0, 2).forEach((line: string) => {
      if (cursor < y + height - 2) {
        doc.text(line, x + 16, cursor);
        cursor += 3.4;
      }
    });
  });
}
