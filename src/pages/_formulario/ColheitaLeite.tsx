import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import jsPDF from "jspdf";

/** FOR-EC-21.0 – COLHEITA DE AMOSTRA DE LEITE (LANDSCAPE, grid manual, só linhas preenchidas) */

type Linha = {
  animal: string;
  pesoManha: string; // kg
  pesoTarde: string; // kg
  total: string;     // kg
  leite: "" | "S" | "N" | "NA";
  sangue: "" | "S" | "N" | "NA";
};

export default function ColheitaAmostraLeite() {
  // Metadados
  const codigoEstudo = "00-0001-25";
  const numeroDocumento = "FOR-EC-21";
  const versao = "0";

  // Cabeçalho variável
  const [data, setData] = useState("");
  const [momento, setMomento] = useState("");

  // Observações e assinatura
  const [observacoes, setObservacoes] = useState("");
  const [registradoPor, setRegistradoPor] = useState("");
  const [registradoData, setRegistradoData] = useState("");

  // Linhas (começa com 1)
  const makeLinha = (): Linha => ({
    animal: "",
    pesoManha: "",
    pesoTarde: "",
    total: "",
    leite: "",
    sangue: "",
  });
  const [linhas, setLinhas] = useState<Linha[]>([makeLinha()]);

  const updateLinha = <K extends keyof Linha>(i: number, k: K, v: Linha[K]) =>
    setLinhas((prev) => prev.map((l, idx) => (idx === i ? { ...l, [k]: v } : l)));
  const addLinha = () => setLinhas((p) => [...p, makeLinha()]);
  const removeLinha = (i: number) =>
    setLinhas((p) => (p.length === 1 ? p : p.filter((_, idx) => idx !== i)));

  // ===== Helpers PDF =====
  const line = (doc: jsPDF, x1: number, y: number, x2: number) => doc.line(x1, y, x2, y);
  const vline = (doc: jsPDF, x: number, y1: number, y2: number) => doc.line(x, y1, x, y2);
  const cb = (doc: jsPDF, x: number, y: number, label: string, checked?: boolean) => {
    doc.rect(x, y - 3.2, 3.2, 3.2);
    if (checked) {
      doc.setLineWidth(0.5);
      doc.line(x + 0.5, y - 2.4, x + 2.7, y - 0.2);
      doc.line(x + 2.7, y - 2.4, x + 0.5, y - 0.2);
      doc.setLineWidth(0.3);
    }
    doc.text(label, x + 4.8, y);
  };
  const isLinhaVazia = (l: Linha) =>
    !(
      l.animal.trim() ||
      l.pesoManha.trim() ||
      l.pesoTarde.trim() ||
      l.total.trim() ||
      l.leite ||
      l.sangue
    );

  // ===== Layout (LANDSCAPE) =====
  const drawHeader = (doc: jsPDF, page: number, totalPages: number) => {
    const W = doc.internal.pageSize.getWidth(); // 297mm
    const innerW = W - 30; // 15mm de cada lado
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);

    // Moldura superior com 3 células (LOGO | Título | Página)
    const headerY = 10;
    const headerH = 16;
    const leftCellW = 80;
    const rightCellW = 60;
    const centerCellW = innerW - leftCellW - rightCellW;

    doc.rect(15, headerY, innerW, headerH);              // moldura geral
    doc.rect(15, headerY, leftCellW, headerH);           // LOGO
    doc.rect(15 + innerW - rightCellW, headerY, rightCellW, headerH); // Página

    doc.text("LOGO", 15 + 12, headerY + 10);             // troque por addImage()

    doc.text("21.0 – COLHEITA DE AMOSTRA DE LEITE", 15 + leftCellW + centerCellW / 2, headerY + 10, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Página", 15 + innerW - rightCellW + rightCellW / 2, headerY + 6, { align: "center" });
    doc.text(String(page), 15 + innerW - rightCellW + rightCellW / 2 - 12, headerY + 10, { align: "center" });
    doc.text("de",    15 + innerW - rightCellW + rightCellW / 2 + 2,  headerY + 6);
    doc.text(String(totalPages), 15 + innerW - 8, headerY + 10);

    // Linha “Área / Nº DOC / Versão”
    const metaY = headerY + headerH + 4; // 30
    doc.text("Área: Estudos clínicos", 20, metaY);
    doc.text(`N° DOC.: ${numeroDocumento}`, 15 + leftCellW + centerCellW / 2, metaY, { align: "center" });
    doc.text(`Versão: ${versao}`, W - 20, metaY, { align: "right" });

    // Faixa com borda: "Código do estudo | Data | Momento: D ___"
    const bandY = metaY + 6; // 36
    const bandH = 12;
    doc.rect(15, bandY, innerW, bandH);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Código do estudo:", 20, bandY + 8);
    doc.setFont("helvetica", "normal");
    line(doc, 63, bandY + 8.5, 15 + innerW / 2 - 5);
    if (codigoEstudo) doc.text(codigoEstudo, 64, bandY + 7.5);

    doc.setFont("helvetica", "bold");
    doc.text("Data:", 15 + innerW / 2 + 2, bandY + 8);
    doc.setFont("helvetica", "normal");
    line(doc, 15 + innerW / 2 + 16, bandY + 8.5, W - 90);
    if (data) doc.text(data, 15 + innerW / 2 + 18, bandY + 7.5);

    doc.setFont("helvetica", "bold");
    doc.text("Momento: D", W - 86, bandY + 8);
    doc.setFont("helvetica", "normal");
    line(doc, W - 58, bandY + 8.5, W - 20);
    if (momento) doc.text(momento, W - 56, bandY + 7.5);

    // Cabeçalho da tabela (logo abaixo da faixa)
    const yTop = bandY + bandH + 4; // ~52
    // Larguras exatas (somam 267mm úteis)
    // 60 | 44 | 44 | 50 | 34 | 35
    const x0 = 15;                // Animal
    const x1 = x0 + 60;           // Manhã
    const x2 = x1 + 44;           // Tarde
    const x3 = x2 + 44;           // Total
    const x4 = x3 + 50;           // Leite
    const x5 = x4 + 34;           // Sangue
    const x6 = 15 + innerW;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Animal", x0 + 3, yTop + 5);

    doc.text("Ordenha da manhã", x1 + 3, yTop + 2.8);
    doc.setFontSize(9);
    doc.text("Peso² (kg)", x1 + 3, yTop + 8);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Ordenha da tarde", x2 + 3, yTop + 2.8);
    doc.setFontSize(9);
    doc.text("Peso² (kg)", x2 + 3, yTop + 8);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Ordenha manhã + ordenha tarde", x3 + 3, yTop + 2.8);
    doc.setFontSize(9);
    doc.text("Total (kg)", x3 + 3, yTop + 8);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Coleta de", x4 + 3, yTop + 2.8);
    doc.text("Leite", x4 + 3, yTop + 8);

    doc.text("Coleta de", x5 + 3, yTop + 2.8);
    doc.text("Sangue", x5 + 3, yTop + 8);

    // linhas/colunas do cabeçalho
    line(doc, 15, yTop + 11, 15 + innerW);
    vline(doc, x0, yTop, yTop + 11);
    vline(doc, x1, yTop, yTop + 11);
    vline(doc, x2, yTop, yTop + 11);
    vline(doc, x3, yTop, yTop + 11);
    vline(doc, x4, yTop, yTop + 11);
    vline(doc, x5, yTop, yTop + 11);
    vline(doc, x6, yTop, yTop + 11);

    return { yTop, x0, x1, x2, x3, x4, x5, x6 };
  };

  const drawRow = (
    doc: jsPDF,
    top: number,
    rowH: number,
    l: Linha,
    x: { x0: number; x1: number; x2: number; x3: number; x4: number; x5: number; x6: number }
  ) => {
    const left = 15, right = doc.internal.pageSize.getWidth() - 15;

    // grade da linha
    line(doc, left, top + rowH, right);
    vline(doc, x.x0, top, top + rowH);
    vline(doc, x.x1, top, top + rowH);
    vline(doc, x.x2, top, top + rowH);
    vline(doc, x.x3, top, top + rowH);
    vline(doc, x.x4, top, top + rowH);
    vline(doc, x.x5, top, top + rowH);
    vline(doc, x.x6, top, top + rowH);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    // Traços e textos (Animal / pesos)
    line(doc, x.x0 + 3, top + rowH - 6, x.x1 - 3); if (l.animal) doc.text(l.animal, x.x0 + 3, top + rowH - 7.5);
    line(doc, x.x1 + 3, top + rowH - 6, x.x2 - 3); if (l.pesoManha) doc.text(l.pesoManha, x.x1 + 3, top + rowH - 7.5);
    line(doc, x.x2 + 3, top + rowH - 6, x.x3 - 3); if (l.pesoTarde) doc.text(l.pesoTarde, x.x2 + 3, top + rowH - 7.5);
    line(doc, x.x3 + 3, top + rowH - 6, x.x4 - 3); if (l.total) doc.text(l.total, x.x3 + 3, top + rowH - 7.5);

    // Coleta de Leite (S/Não/NA¹)
    cb(doc, x.x4 + 3, top + 6, "Sim", l.leite === "S");
    cb(doc, x.x4 + 3, top + 11.5, "Não", l.leite === "N");
    cb(doc, x.x4 + 3, top + 17, "NA¹", l.leite === "NA");

    // Coleta de Sangue
    cb(doc, x.x5 + 3, top + 6, "Sim", l.sangue === "S");
    cb(doc, x.x5 + 3, top + 11.5, "Não", l.sangue === "N");
    cb(doc, x.x5 + 3, top + 17, "NA¹", l.sangue === "NA");
  };

  const drawLegendObsAndSign = (doc: jsPDF, startY: number) => {
    const W = doc.internal.pageSize.getWidth();
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Legenda: ¹NA – Não aplicável; ²Peso – Volume de leite coletado (kg).", 20, startY);

    // Observações (duas linhas sublinhadas como no modelo)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Observações:", 20, startY + 8);
    doc.setFont("helvetica", "normal");
    line(doc, 20, startY + 14, W - 15);
    line(doc, 20, startY + 22, W - 15);

    // Assinatura
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Registrado por (iniciais):", 20, startY + 38);
    doc.setFont("helvetica", "normal");
    line(doc, 95, startY + 38.5, 200);
    doc.text("Data:", 208, startY + 38);
    line(doc, 221, startY + 38.5, W - 20);

    if (registradoPor) doc.text(registradoPor, 97, startY + 37.5);
    if (registradoData) doc.text(registradoData, 223, startY + 37.5);
  };

  // ===== Exportação =====
  const handleExportarPDF = () => {
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    doc.setFont("helvetica", "normal");
    doc.setLineWidth(0.3);

    const filled = linhas.filter((l) => !isLinhaVazia(l));
    // layout vertical
    const ROW_H = 18;               // cabe 3 checkboxes (6/11.5/17)
    const firstTopOffset = 11 + 4 + 12 + 4 + 11; // headerH + gap + bandH + gap + tableHeadH ≈ 42
    let page = 1;

    // Primeiro desenha o cabeçalho e pega as posições de coluna
    const { yTop, ...xCols } = drawHeader(doc, page, 1); // totalPages será recalculado
    let y = yTop + 11; // começa logo abaixo do head (linha já desenhada)

    // Simula paginação para saber totalPages
    const usableBottomFirst = 200;  // antes de legenda/assinatura
    const usableBottomOther = 205;  // páginas seguintes (sem legenda)
    const bottomLimit = (p: number) => (p === 1 ? usableBottomFirst : usableBottomOther);

    let pagesNeeded = 1;
    let tempY = y;
    for (let i = 0; i < filled.length; i++) {
      if (tempY + ROW_H > bottomLimit(pagesNeeded)) {
        pagesNeeded++;
        tempY = yTop + 11;
      }
      tempY += ROW_H;
    }

    // Recomeça com numeração correta
    doc.deletePage(1);
    page = 1;
    doc.addPage();
    const cols = drawHeader(doc, page, Math.max(1, pagesNeeded));
    y = cols.yTop + 11;

    if (filled.length === 0) {
      // sem linhas: ainda assim imprime legenda/assinatura
      drawLegendObsAndSign(doc, 214);
    } else {
      for (let i = 0; i < filled.length; i++) {
        if (y + ROW_H > bottomLimit(page)) {
          // numeração extra rodapé
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10);
          doc.text(`Página ${page} de ${pagesNeeded}`, doc.internal.pageSize.getWidth() - 30, 205);
          // próxima página
          doc.addPage();
          page++;
          const colsNext = drawHeader(doc, page, pagesNeeded);
          y = colsNext.yTop + 11;
        }
        drawRow(doc, y, ROW_H, filled[i], cols);
        y += ROW_H;
      }

      // Legenda/observações/assinatura apenas na 1ª página
      doc.setPage(1);
      drawLegendObsAndSign(doc, 214);
    }

    // numeração extra no rodapé (todas as páginas)
    for (let p = 1; p <= Math.max(1, pagesNeeded); p++) {
      doc.setPage(p);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(`Página ${p} de ${Math.max(1, pagesNeeded)}`, doc.internal.pageSize.getWidth() - 30, 205);
    }

    doc.save("FOR-EC-21.0-Colheita-Amostra-de-Leite.pdf");
  };

  // ===== UI =====
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-7xl bg-white rounded-2xl shadow-lg p-6 space-y-6">
        <h1 className="text-2xl font-semibold text-center text-gray-800">
          21.0 – Colheita de Amostra de Leite
        </h1>

        {/* Cabeçalho do PDF */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Código do Estudo</Label>
            <Input value={codigoEstudo} readOnly disabled />
          </div>
          <div>
            <Label>Data</Label>
            <Input placeholder="DD/MM/AAAA" value={data} onChange={(e) => setData(e.target.value)} />
          </div>
          <div>
            <Label>Momento (D)</Label>
            <Input placeholder="Ex.: 0, 1, 7, 14" value={momento} onChange={(e) => setMomento(e.target.value)} />
          </div>
        </div>

        {/* Editor de linhas (começa com 1) */}
        {linhas.map((l, i) => (
          <div key={i} className="grid grid-cols-1 md:grid-cols-12 gap-2 border rounded-lg p-3">
            <div className="md:col-span-3">
              <Label>Animal</Label>
              <Input value={l.animal} onChange={(e) => updateLinha(i, "animal", e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <Label>Ordenha manhã (kg)</Label>
              <Input value={l.pesoManha} onChange={(e) => updateLinha(i, "pesoManha", e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <Label>Ordenha tarde (kg)</Label>
              <Input value={l.pesoTarde} onChange={(e) => updateLinha(i, "pesoTarde", e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <Label>Total (kg)</Label>
              <Input value={l.total} onChange={(e) => updateLinha(i, "total", e.target.value)} />
            </div>
            <div className="md:col-span-1">
              <Label>Leite</Label>
              <div className="grid grid-cols-3 gap-1 text-xs">
                <label className="flex items-center gap-1">
                  <input type="checkbox" checked={l.leite === "S"} onChange={() => updateLinha(i, "leite", l.leite === "S" ? "" : "S")} /> S
                </label>
                <label className="flex items-center gap-1">
                  <input type="checkbox" checked={l.leite === "N"} onChange={() => updateLinha(i, "leite", l.leite === "N" ? "" : "N")} /> N
                </label>
                <label className="flex items-center gap-1">
                  <input type="checkbox" checked={l.leite === "NA"} onChange={() => updateLinha(i, "leite", l.leite === "NA" ? "" : "NA")} /> NA
                </label>
              </div>
            </div>
            <div className="md:col-span-2">
              <Label>Sangue</Label>
              <div className="grid grid-cols-3 gap-1 text-xs">
                <label className="flex items-center gap-1">
                  <input type="checkbox" checked={l.sangue === "S"} onChange={() => updateLinha(i, "sangue", l.sangue === "S" ? "" : "S")} /> S
                </label>
                <label className="flex items-center gap-1">
                  <input type="checkbox" checked={l.sangue === "N"} onChange={() => updateLinha(i, "sangue", l.sangue === "N" ? "" : "N")} /> N
                </label>
                <label className="flex items-center gap-1">
                  <input type="checkbox" checked={l.sangue === "NA"} onChange={() => updateLinha(i, "sangue", l.sangue === "NA" ? "" : "NA")} /> NA
                </label>
              </div>
            </div>
            <div className="md:col-span-12 flex justify-end">
              <Button variant="ghost" onClick={() => removeLinha(i)} disabled={linhas.length === 1}>
                Remover linha
              </Button>
            </div>
          </div>
        ))}

        {/* Observações & Assinatura (usadas no PDF) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-3">
            <Label>Observações</Label>
            <textarea
              className="w-full border rounded-md p-2 h-24"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
            />
          </div>
          <div className="md:col-span-2 grid grid-cols-2 gap-4">
            <div>
              <Label>Registrado por (iniciais)</Label>
              <Input value={registradoPor} onChange={(e) => setRegistradoPor(e.target.value)} />
            </div>
            <div>
              <Label>Data</Label>
              <Input value={registradoData} onChange={(e) => setRegistradoData(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button onClick={addLinha}>Adicionar linha</Button>
          <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={handleExportarPDF}>
            Exportar PDF
          </Button>
        </div>

        <p className="text-xs text-gray-500">
          Legenda: ¹ NA – Não aplicável; ² Peso – volume de leite coletado (kg).
        </p>
      </div>
    </div>
  );
}
