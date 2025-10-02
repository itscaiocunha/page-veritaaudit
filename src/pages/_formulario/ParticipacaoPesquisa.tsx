import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import jsPDF from "jspdf";
import autoTable, { RowInput } from "jspdf-autotable";

/** FOR-EC-13.0 – FINALIZAÇÃO DA PARTICIPAÇÃO NA PESQUISA
 * A4 LANDSCAPE • margens 15 mm • Helvetica/Arial
 * Tabela: Animal | Momento (D) | Data (DD/MM/AA) | Finalização | Destino | Observação¹ | Registrado por
 * - Cabeçalho com moldura + faixa “Código do estudo”
 * - Checkboxes como “☐/☒” em 3 linhas por coluna (Finalização/Destino)
 * - Tipografia/tabela ajustadas (padding, minCellHeight, alinhamentos)
 * - Só exporta linhas preenchidas, mas completa a grade (10 por página)
 */

type Finalizacao = "" | "CONCLUIU" | "REMOCAO" | "NAO_SELECIONADO";
type Destino = { plantel: boolean; composteira: boolean; outros: boolean; outrosTexto: string };

type Linha = {
  animal: string;
  momento: string;
  data: string;
  finalizacao: Finalizacao;
  destino: Destino;
  observacao: string;
  registradoPor: string;
};

export default function FinalizacaoParticipacao() {
  // Metadados do cabeçalho
  const codigoEstudo = "00-0001-25";
  const numeroDocumento = "FOR-EC-13";
  const versao = "0";

  // ===== UI (form padrão) =====
  const nova = (): Linha => ({
    animal: "",
    momento: "",
    data: "",
    finalizacao: "",
    destino: { plantel: false, composteira: false, outros: false, outrosTexto: "" },
    observacao: "",
    registradoPor: "",
  });

  const [linhas, setLinhas] = useState<Linha[]>([nova()]);
  const addLinha = () => setLinhas((p) => [...p, nova()]);
  const removeLinha = (i: number) => setLinhas((p) => (p.length === 1 ? p : p.filter((_, k) => k !== i)));
  const setL = <K extends keyof Linha>(i: number, k: K, v: Linha[K]) =>
    setLinhas((p) => p.map((l, idx) => (idx === i ? { ...l, [k]: v } : l)));
  const setD = (i: number, k: keyof Destino, v: any) =>
    setLinhas((p) => p.map((l, idx) => (idx === i ? { ...l, destino: { ...l.destino, [k]: v } } : l)));

  // ===== Helpers da exportação =====
  const ROWS_PER_PAGE = 10;

  const isVazia = (l: Linha) =>
    !(
      l.animal || l.momento || l.data || l.finalizacao ||
      l.destino.plantel || l.destino.composteira || l.destino.outros ||
      l.observacao || l.registradoPor
    );

  const box = (checked: boolean, label: string) => `${checked ? "☒" : "☐"} ${label}`;
  const blocoFinalizacao = (f: Finalizacao) =>
    [
      box(f === "CONCLUIU", "Concluiu participação"),
      box(f === "REMOCAO", "Remoção pós-seleção"),
      box(f === "NAO_SELECIONADO", "Não selecionado"),
    ].join("\n");

  const blocoDestino = (d: Destino) =>
    [
      box(d.plantel, "Plantel"),
      box(d.composteira, "Composteira"),
      `${box(d.outros, "Outros")}  (descrever)`,
    ].join("\n");

  const drawHeader = (doc: jsPDF, page: number, total: number) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    const W = doc.internal.pageSize.getWidth(); // 297
    const innerW = W - 30; // 267
    const headerY = 10;
    const headerH = 16;
    const leftW = 80;
    const rightW = 60;
    const centerW = innerW - leftW - rightW;

    // Moldura superior
    doc.rect(15, headerY, innerW, headerH);
    doc.rect(15, headerY, leftW, headerH);
    doc.rect(15 + innerW - rightW, headerY, rightW, headerH);

    doc.text("LOGO", 27, headerY + 10);
    doc.text(
      "13.0 – FINALIZAÇÃO DA PARTICIPAÇÃO NA PESQUISA",
      15 + leftW + centerW / 2,
      headerY + 10,
      { align: "center" }
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Página", 15 + innerW - rightW + 12, headerY + 6);
    doc.text(`${page}`, 15 + innerW - rightW + 37, headerY + 6);
    doc.text("de", 15 + innerW - rightW + 42, headerY + 6);
    doc.text(`${total}`, 15 + innerW - 10, headerY + 6);

    const metaY = headerY + headerH + 4;
    doc.text("Área: Estudos clínicos", 20, metaY);
    doc.text(`N° DOC.: ${numeroDocumento}`, 15 + leftW + centerW / 2, metaY, { align: "center" });
    doc.text(`Versão: ${versao}`, W - 20, metaY, { align: "right" });

    const bandY = metaY + 6;
    doc.rect(15, bandY, innerW, 10);
    doc.setFont("helvetica", "bold");
    doc.text("Código do estudo:", 20, bandY + 7);
    doc.setFont("helvetica", "normal");
    doc.text(codigoEstudo, 63, bandY + 7);

    return bandY + 14; // startY da tabela
  };

  // ===== Exportar =====
  const handleExportarPDF = () => {
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    doc.setFont("helvetica", "normal");
    doc.setLineWidth(0.35);

    const preenchidas = linhas.filter((l) => !isVazia(l));

    const corpo: RowInput[] = (preenchidas.length ? preenchidas : []).map((l) => [
      l.animal || "",
      l.momento || "",
      l.data || "",
      blocoFinalizacao(l.finalizacao),
      blocoDestino(l.destino),
      l.observacao || "",
      l.registradoPor || "",
    ]);

    // Completa grade (10 por página)
    const pad = corpo.length === 0 ? ROWS_PER_PAGE : (ROWS_PER_PAGE - (corpo.length % ROWS_PER_PAGE)) % ROWS_PER_PAGE;
    for (let i = 0; i < pad; i++) {
      corpo.push([
        "",
        "",
        "",
        "☐ Concluiu participação\n☐ Remoção pós-seleção\n☐ Não selecionado",
        "☐ Plantel\n☐ Composteira\n☐ Outros  (descrever)",
        "",
        "",
      ]);
    }

    // Cabeçalho da tabela
    const head = [[
      "Animal",
      "Momento (D)",
      "Data\n(DD/MM/AA)",
      "Finalização",
      "Destino",
      "Observação¹",
      "Registrado por",
    ]];

    // Larguras (somam ~267 úteis)
    const columnStyles = {
      0: { cellWidth: 45, halign: "left" },   // Animal
      1: { cellWidth: 22, halign: "center" }, // Momento
      2: { cellWidth: 40, halign: "center" }, // Data
      3: { cellWidth: 55, halign: "left" },   // Finalização
      4: { cellWidth: 55, halign: "left" },   // Destino
      5: { cellWidth: 30, halign: "left" },   // Observação
      6: { cellWidth: 25, halign: "left" },   // Registrado por
    } as const;

    const tableStartY = drawHeader(doc, 1, 1); // <<< definir antes do uso

    autoTable(doc, {
      startY: tableStartY,
      head,
      body: corpo,
      theme: "grid",
      styles: {
        font: "helvetica",
        fontSize: 9.5,
        // lineHeight não existe na tipagem; usamos minCellHeight e padding
        overflow: "linebreak",
        cellPadding: { top: 3, right: 3, bottom: 3, left: 3 },
        halign: "left",
        valign: "middle",
        lineColor: [0, 0, 0],
        lineWidth: 0.35,
        minCellHeight: 12,
      },
      headStyles: {
        fontStyle: "bold",
        fontSize: 10,
        halign: "center",
        valign: "middle",
        fillColor: [255, 255, 255],
        textColor: 0,
        lineWidth: 0.5,
        cellPadding: { top: 3, right: 4, bottom: 3, left: 4 },
      },
      bodyStyles: {
        textColor: 0,
      },
      columnStyles: columnStyles as any,
      margin: { left: 15, right: 15 },
      didParseCell: (data) => {
        const { section, column, cell } = data;
        if (section === "head") {
          if (column.index === 1 || column.index === 2) cell.styles.halign = "center"; // Momento/Data
          if (column.index === 0 || column.index >= 3) cell.styles.halign = "left";
        }
        // Ajuste de espaçamento para blocos com checkboxes (TS: usar 'as any')
        if (section === "body" && (column.index === 3 || column.index === 4)) {
          (cell as any).styles.fontSize = 9;
          (cell as any).styles.lineHeight = 1.25; // aceita em runtime; tipagem não expõe
        }
      },
      didDrawPage: () => {
        const total = doc.getNumberOfPages();
        const current = doc.getCurrentPageInfo().pageNumber;
        drawHeader(doc, current, total);

        const finalY = (doc as any).lastAutoTable?.finalY ?? 200;
        if (current === 1) {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.text("Legenda: ¹Observação – Descrever o motivo se aplicável.", 20, finalY + 8);
        }
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text(`Página ${current} de ${total}`, doc.internal.pageSize.getWidth() - 30, 205);
      },
      pageBreak: "auto",
    });

    doc.save("FOR-EC-13.0-Finalizacao-da-Participacao.pdf");
  };

  // ===== UI =====
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
              <Input value={l.animal} onChange={(e) => setL(i, "animal", e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <Label>Momento (D)</Label>
              <Input value={l.momento} onChange={(e) => setL(i, "momento", e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <Label>Data (DD/MM/AA)</Label>
              <Input value={l.data} onChange={(e) => setL(i, "data", e.target.value)} />
            </div>

            <div className="md:col-span-3">
              <Label>Finalização</Label>
              <div className="grid grid-cols-1 gap-1 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={l.finalizacao === "CONCLUIU"}
                    onChange={() => setL(i, "finalizacao", l.finalizacao === "CONCLUIU" ? "" : "CONCLUIU")}
                  />
                  Concluiu participação
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={l.finalizacao === "REMOCAO"}
                    onChange={() => setL(i, "finalizacao", l.finalizacao === "REMOCAO" ? "" : "REMOCAO")}
                  />
                  Remoção pós-seleção
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={l.finalizacao === "NAO_SELECIONADO"}
                    onChange={() =>
                      setL(i, "finalizacao", l.finalizacao === "NAO_SELECIONADO" ? "" : "NAO_SELECIONADO")
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
                    onChange={() => setD(i, "plantel", !l.destino.plantel)}
                  />
                  Plantel
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={l.destino.composteira}
                    onChange={() => setD(i, "composteira", !l.destino.composteira)}
                  />
                  Composteira
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={l.destino.outros}
                    onChange={() => setD(i, "outros", !l.destino.outros)}
                  />
                  Outros (descrever)
                </label>
                {l.destino.outros && (
                  <Input
                    placeholder="Descrever destino"
                    value={l.destino.outrosTexto}
                    onChange={(e) => setD(i, "outrosTexto", e.target.value)}
                  />
                )}
              </div>
            </div>

            <div className="md:col-span-2">
              <Label>Observação¹</Label>
              <Input value={l.observacao} onChange={(e) => setL(i, "observacao", e.target.value)} />
            </div>

            <div className="md:col-span-2">
              <Label>Registrado por</Label>
              <Input value={l.registradoPor} onChange={(e) => setL(i, "registradoPor", e.target.value)} />
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
