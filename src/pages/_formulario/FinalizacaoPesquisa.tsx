import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import jsPDF from "jspdf";

/** FOR-EC-13.0 – FINALIZAÇÃO DA PARTICIPAÇÃO NA PESQUISA
 * UI (do código antigo) + exportação NOVA (A4 landscape, margens 15mm, Helvetica/Arial)
 * - Só exporta linhas preenchidas
 * - Paginação automática
 */

type Finalizacao = "" | "CONCLUIU" | "REMOCAO" | "NAO_SELECIONADO";
type Destino = { plantel: boolean; composteira: boolean; outros: boolean; outrosTexto: string };

type Linha = {
  animal: string;
  momento: string;      // D
  data: string;         // DD/MM/AA
  finalizacao: Finalizacao;
  destino: Destino;
  observacao: string;
  registradoPor: string;
};

export default function FinalizacaoParticipacao() {
  // Metadados fixos do formulário
  const codigoEstudo = "00-0001-25";
  const numeroDocumento = "FOR-EC-13";
  const versao = "0";

  // ====== FORM (mesmo layout do “antigo”) ======
  const makeLinha = (): Linha => ({
    animal: "",
    momento: "",
    data: "",
    finalizacao: "",
    destino: { plantel: false, composteira: false, outros: false, outrosTexto: "" },
    observacao: "",
    registradoPor: "",
  });

  const [linhas, setLinhas] = useState<Linha[]>([makeLinha()]);
  const addLinha = () => setLinhas((p) => [...p, makeLinha()]);
  const removeLinha = (i: number) =>
    setLinhas((p) => (p.length === 1 ? p : p.filter((_, idx) => idx !== i)));

  const updateLinha = <K extends keyof Linha>(i: number, k: K, v: Linha[K]) =>
    setLinhas((prev) => prev.map((l, idx) => (idx === i ? { ...l, [k]: v } : l)));

  const updateDestino = (i: number, k: keyof Destino, v: any) =>
    setLinhas((prev) =>
      prev.map((l, idx) =>
        idx === i ? { ...l, destino: { ...l.destino, [k]: v } } : l
      )
    );

  // ====== PDF HELPERS (exportação nova) ======
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
    doc.text(label, x + 5, y);
  };

  const isLinhaVazia = (l: Linha) =>
    !(
      l.animal.trim() ||
      l.momento.trim() ||
      l.data.trim() ||
      l.finalizacao ||
      l.destino.plantel ||
      l.destino.composteira ||
      l.destino.outros ||
      l.destino.outrosTexto.trim() ||
      l.observacao.trim() ||
      l.registradoPor.trim()
    );

  // Cabeçalho (LANDSCAPE)
  const drawHeader = (doc: jsPDF, pageNum: number, totalPages: number) => {
    const W = doc.internal.pageSize.getWidth(); // 297
    const innerW = W - 30; // margens 15

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);

    // Moldura topo (LOGO | Título | Página)
    const headerY = 10;
    const headerH = 16;
    const leftW = 80;
    const rightW = 60;
    const centerW = innerW - leftW - rightW;

    doc.rect(15, headerY, innerW, headerH);
    doc.rect(15, headerY, leftW, headerH);
    doc.rect(15 + innerW - rightW, headerY, rightW, headerH);

    doc.text("LOGO", 15 + 12, headerY + 10);
    doc.text(
      "13.0 – FINALIZAÇÃO DA PARTICIPAÇÃO NA PESQUISA",
      15 + leftW + centerW / 2,
      headerY + 10,
      { align: "center" }
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Página ${pageNum} de ${totalPages}`, 15 + innerW - rightW + 15, headerY + 10);

    // Linha “Área / Nº DOC / Versão”
    const metaY = headerY + headerH + 4; // ~30
    doc.text("Área: Estudos clínicos", 20, metaY);
    doc.text(`N° DOC.: ${numeroDocumento}`, 15 + leftW + centerW / 2, metaY, { align: "center" });
    doc.text(`Versão: ${versao}`, W - 20, metaY, { align: "right" });

    // Faixa “Código do estudo”
    const bandY = metaY + 6; // 36
    const bandH = 10;
    doc.rect(15, bandY, innerW, bandH);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Código do estudo:", 20, bandY + 7);
    doc.setFont("helvetica", "normal");
    // linha “subentendida” visualmente: só imprimimos o código
    doc.text(codigoEstudo, 70, bandY + 7);

    // Cabeçalho da tabela
    const yTop = bandY + bandH + 4; // ~50

  // Larguras ajustadas (somam ~267mm): 32 | 32 | 28 | 32 | 56 | 52 | 35
  const x0 = 15;                // Animal (32)
  const x1 = x0 + 32;           // Momento (D) (32)
  const x2 = x1 + 32;           // Data (28)
  const x3 = x2 + 32;           // Finalização (32)
  const x4 = x3 + 46;           // Destino (56)
  const x5 = x4 + 40;           // Observação¹ (52)
  const x6 = x5 + 50;           // Registrado por (35)
  const x7 = 15 + innerW;       // borda direita

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Animal", x0 + 3, yTop + 5);
    doc.text("Momento (D)", x1 + 3, yTop + 5);
    doc.text("Data", x2 + 3, yTop + 5);
    doc.text("Finalização", x3 + 3, yTop + 5);
    doc.text("Destino", x4 + 3, yTop + 5);
    doc.text("Observação¹", x5 + 3, yTop + 5);
    doc.text("Registrado por", x6 + 3, yTop + 5);

    line(doc, 15, yTop + 9, x7);
    [x0, x1, x2, x3, x4, x5, x6, x7].forEach((xx) => vline(doc, xx, yTop, yTop + 9));

    return { yTop: yTop + 9, x0, x1, x2, x3, x4, x5, x6, x7 };
  };

  const drawRow = (
    doc: jsPDF,
    top: number,
    rowH: number,
    l: Linha,
    x: { x0: number; x1: number; x2: number; x3: number; x4: number; x5: number; x6: number; x7: number }
  ) => {
    line(doc, 15, top + rowH, x.x7);
    [x.x0, x.x1, x.x2, x.x3, x.x4, x.x5, x.x6, x.x7].forEach((xx) => vline(doc, xx, top, top + rowH));

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    // linhas de preenchimento tipo “sub-linha”
    line(doc, x.x0 + 3, top + rowH - 6, x.x1 - 3);
    line(doc, x.x1 + 3, top + rowH - 6, x.x2 - 3);
    line(doc, x.x2 + 3, top + rowH - 6, x.x3 - 3);
    line(doc, x.x5 + 3, top + rowH - 6, x.x6 - 3);
    line(doc, x.x6 + 3, top + rowH - 6, x.x7 - 3);

    if (l.animal) doc.text(l.animal, x.x0 + 3, top + rowH - 7.4);
    if (l.momento) doc.text(l.momento, x.x1 + 3, top + rowH - 7.4);
    if (l.data) doc.text(l.data, x.x2 + 3, top + rowH - 7.4);
    if (l.observacao) doc.text(doc.splitTextToSize(l.observacao, (x.x6 - 3) - (x.x5 + 3)), x.x5 + 3, top + rowH - 7.4);
    if (l.registradoPor) doc.text(l.registradoPor, x.x6 + 3, top + rowH - 7.4);

    // Finalização (3 opções)
    const fy = top + 6;
    cb(doc, x.x3 + 3, fy, "Concluiu participação", l.finalizacao === "CONCLUIU");
    cb(doc, x.x3 + 3, fy + 6, "Remoção pós-seleção", l.finalizacao === "REMOCAO");
    cb(doc, x.x3 + 3, fy + 12, "Não selecionado", l.finalizacao === "NAO_SELECIONADO");

    // Destino (3 opções)
    const dy = top + 6;
    cb(doc, x.x4 + 3, dy, "Plantel", l.destino.plantel);
    cb(doc, x.x4 + 3, dy + 6, "Composteira", l.destino.composteira);
    cb(doc, x.x4 + 3, dy + 12, "Outros", l.destino.outros);
    // linha para “Outros (descrever)”
    line(doc, x.x4 + 23, dy + 12.5, x.x5 - 3);
    if (l.destino.outros && l.destino.outrosTexto) {
      doc.text(
        doc.splitTextToSize(l.destino.outrosTexto, (x.x5 - 3) - (x.x4 + 24)),
        x.x4 + 24,
        dy + 11.5
      );
    }
  };

  const drawLegend = (doc: jsPDF) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Legenda: ¹Observação – Descrever o motivo se aplicável.", 20, 205);
  };

  // ====== EXPORTAÇÃO (paisagem) ======
  const handleExportarPDF = () => {
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    doc.setFont("helvetica", "normal");
    doc.setLineWidth(0.3);

    // somente linhas preenchidas
    const filled = linhas.filter((l) => !isLinhaVazia(l));

  // medidas
  const ROW_H = 26;         // altura maior para evitar sobreposição dos checkboxes
  const startY = 0;         // será calculado após o header
  const bottomFirst = 200;  // limite para linhas na 1ª página (antes da legenda)
  const bottomOther = 205;  // nas demais

    // simular para obter total de páginas
    let pageCount = 1;
    {
      const tmp = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const { yTop } = drawHeader(tmp, 1, 1);
      let y = yTop; // logo abaixo do cabeçalho da tabela
      for (let i = 0; i < filled.length; i++) {
        const limit = pageCount === 1 ? bottomFirst : bottomOther;
        if (y + ROW_H > limit) {
          pageCount++;
          y = yTop;
        }
        y += ROW_H;
      }
    }

    // render definitivo
    let currentPage = 1;
    const cols = drawHeader(doc, currentPage, Math.max(1, pageCount));
    let y = cols.yTop; // início das linhas

    if (filled.length === 0) {
      drawLegend(doc);
    } else {
      for (let i = 0; i < filled.length; i++) {
        const limit = currentPage === 1 ? bottomFirst : bottomOther;
        if (y + ROW_H > limit) {
          // rodapé (numeração extra)
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10);
          doc.text(`Página ${currentPage} de ${pageCount}`, doc.internal.pageSize.getWidth() - 30, 205);
          // próxima página
          doc.addPage();
          currentPage++;
          const colsNext = drawHeader(doc, currentPage, pageCount);
          y = colsNext.yTop;
        }
        drawRow(doc, y, ROW_H, filled[i], cols);
        y += ROW_H;
      }
      // legenda somente na 1ª
      doc.setPage(1);
      drawLegend(doc);
    }

    // numeração adicional (todas páginas, canto inferior direito)
    for (let p = 1; p <= Math.max(1, pageCount); p++) {
      doc.setPage(p);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(`Página ${p} de ${Math.max(1, pageCount)}`, doc.internal.pageSize.getWidth() - 30, 205);
    }

    doc.save("FOR-EC-13.0-Finalizacao-da-Participacao.pdf");
  };

  // ====== UI (do “antigo”) ======
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-7xl bg-white rounded-2xl shadow-lg p-6 space-y-6">
        <h1 className="text-2xl font-semibold text-center text-gray-800">
          13.0 – Finalização da Participação na Pesquisa
        </h1>

        {linhas.map((l, i) => (
          <div key={i} className="grid grid-cols-1 md:grid-cols-12 gap-3 border rounded-lg p-4">
            <div className="md:col-span-3">
              <Label>Animal</Label>
              <Input value={l.animal} onChange={(e) => updateLinha(i, "animal", e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <Label>Momento (D)</Label>
              <Input value={l.momento} onChange={(e) => updateLinha(i, "momento", e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <Label>Data (DD/MM/AA)</Label>
              <Input value={l.data} onChange={(e) => updateLinha(i, "data", e.target.value)} />
            </div>

            <div className="md:col-span-3">
              <Label>Finalização</Label>
              <div className="grid grid-cols-1 gap-1 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={l.finalizacao === "CONCLUIU"}
                    onChange={() =>
                      updateLinha(i, "finalizacao", l.finalizacao === "CONCLUIU" ? "" : "CONCLUIU")
                    }
                  />
                  Concluiu participação
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={l.finalizacao === "REMOCAO"}
                    onChange={() =>
                      updateLinha(i, "finalizacao", l.finalizacao === "REMOCAO" ? "" : "REMOCAO")
                    }
                  />
                  Remoção pós-seleção
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={l.finalizacao === "NAO_SELECIONADO"}
                    onChange={() =>
                      updateLinha(
                        i,
                        "finalizacao",
                        l.finalizacao === "NAO_SELECIONADO" ? "" : "NAO_SELECIONADO"
                      )
                    }
                  />
                  Não selecionado
                </label>
              </div>
            </div>

            <div className="md:col-span-3">
              <Label>Destino</Label>
              <div className="grid grid-cols-1 gap-1 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={l.destino.plantel}
                    onChange={() => updateDestino(i, "plantel", !l.destino.plantel)}
                  />
                  Plantel
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={l.destino.composteira}
                    onChange={() => updateDestino(i, "composteira", !l.destino.composteira)}
                  />
                  Composteira
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={l.destino.outros}
                    onChange={() => updateDestino(i, "outros", !l.destino.outros)}
                  />
                  Outros (descrever)
                </label>
                {l.destino.outros && (
                  <Input
                    placeholder="Descrever destino"
                    value={l.destino.outrosTexto}
                    onChange={(e) => updateDestino(i, "outrosTexto", e.target.value)}
                  />
                )}
              </div>
            </div>

            <div className="md:col-span-2">
              <Label>Observação¹</Label>
              <Input
                value={l.observacao}
                onChange={(e) => updateLinha(i, "observacao", e.target.value)}
              />
            </div>

            <div className="md:col-span-2">
              <Label>Registrado por (iniciais)</Label>
              <Input
                value={l.registradoPor}
                onChange={(e) => updateLinha(i, "registradoPor", e.target.value)}
              />
            </div>

            <div className="md:col-span-12 flex justify-end">
              <Button variant="ghost" onClick={() => removeLinha(i)} disabled={linhas.length === 1}>
                Remover linha
              </Button>
            </div>
          </div>
        ))}

        <div className="flex gap-3">
          <Button onClick={addLinha}>Adicionar linha</Button>
          <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={handleExportarPDF}>
            Exportar PDF
          </Button>
        </div>

        <p className="text-xs text-gray-500">Legenda: ¹Observação – Descrever o motivo se aplicável.</p>
      </div>
    </div>
  );
}
