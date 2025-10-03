import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import jsPDF from "jspdf";
import autoTable, { RowInput } from "jspdf-autotable";

type Destino = "GRAXARIA" | "OUTROS" | "";
type Linha = {
  animal: string;
  destino: Destino;
  outrosTexto: string;
};

export default function DestinoCarcaca() {
  // Metadados (fixos no cabeçalho)
  const codigoEstudo = "00-0001-25";
  const numeroDocumento = "FOR-EC-15";
  const versao = "0";

  // Campos do topo
  const [data, setData] = useState("");
  const [dia, setDia] = useState("");
  const [grupoAbate, setGrupoAbate] = useState("");

  // Tabela (começa com 1 linha; o usuário adiciona mais)
  const nova = (): Linha => ({ animal: "", destino: "", outrosTexto: "" });
  const [linhas, setLinhas] = useState<Linha[]>([nova()]);
  const addLinha = () => setLinhas((p) => [...p, nova()]);
  const removeLinha = (i: number) =>
    setLinhas((p) => (p.length === 1 ? p : p.filter((_, k) => k !== i)));
  const setL = <K extends keyof Linha>(i: number, k: K, v: Linha[K]) =>
    setLinhas((p) => p.map((l, idx) => (idx === i ? { ...l, [k]: v } : l)));

  // Rodapé de observação/assinatura
  const [obs, setObs] = useState("");
  const [veterinario, setVeterinario] = useState("");

  // Helpers
  const isEmpty = (l: Linha) => !(l.animal || l.destino || l.outrosTexto);
  const box = (checked: boolean, label: string) => `${checked ? "☒" : "☐"} ${label}`;
  const destinoText = (l: Linha) =>
    [
      box(l.destino === "GRAXARIA", "Graxaria"),
      `${box(l.destino === "OUTROS", "Outros:")} ${
        l.destino === "OUTROS" ? (l.outrosTexto || "____________") : "____________"
      }`,
    ].join("\n");

  // ========== Cabeçalho (LANDSCAPE padrão dos demais) ==========
  const drawHeader = (doc: jsPDF, page: number, total: number) => {
    const W = doc.internal.pageSize.getWidth(); // 297
    const innerW = W - 30;                       // 267
    const headerY = 10;
    const headerH = 18;

    const leftW = 80;                            // LOGO
    const rightW = 70;                           // Página X de Y
    const centerW = innerW - leftW - rightW;     // Título

    doc.setLineWidth(0.5);
    doc.rect(15, headerY, innerW, headerH);
    doc.rect(15, headerY, leftW, headerH);
    doc.rect(15 + innerW - rightW, headerY, rightW, headerH);

    // LOGO
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("LOGO", 15 + 12, headerY + headerH / 2 + 3);

    // Título (auto-ajuste para não sobrepor)
    const title = "15.0 – DESTINO DA CARCAÇA";
    const centerX = 15 + leftW + centerW / 2;
    let titleFont = 12;
    doc.setFontSize(titleFont);
    const maxCenterWidth = centerW - 12; // padding interno
    const w = doc.getTextWidth(title);
    if (w > maxCenterWidth) {
      const scale = maxCenterWidth / w;
      titleFont = Math.max(9, Math.floor(12 * scale * 10) / 10);
      doc.setFontSize(titleFont);
    }
    doc.text(title, centerX, headerY + headerH / 2 + 3, { align: "center" });

    // Página X de Y
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const pageBoxX = 15 + innerW - rightW;
    const baseY = headerY + 6;
    doc.text("Página", pageBoxX + 8, baseY);
    doc.text(String(page), pageBoxX + 35, baseY);
    doc.text("de", pageBoxX + 44, baseY);
    doc.text(String(total), pageBoxX + 58, baseY);

    // Linha meta
    const metaY = headerY + headerH + 5;
    doc.text("Área: Estudos clínicos", 20, metaY);
    doc.text(`N° DOC.: ${numeroDocumento}`, 15 + leftW + centerW / 2, metaY, { align: "center" });
    doc.text(`Versão: ${versao}`, W - 20, metaY, { align: "right" });

    // Faixa “Código do estudo”
    const bandY = metaY + 6;
    doc.rect(15, bandY, innerW, 10);
    doc.setFont("helvetica", "bold");
    doc.text("Código do estudo:", 20, bandY + 7);
    doc.setFont("helvetica", "normal");
    doc.text(codigoEstudo, 63, bandY + 7);

    // Linha com Data / Dia / Grupo de Abate
    const infoY = bandY + 16;
    doc.setFont("helvetica", "bold");
    doc.text("Data:", 20, infoY);
    doc.setFont("helvetica", "normal");
    doc.text(data || "____/____/____  (DD/MM/AA)", 35, infoY);

    doc.setFont("helvetica", "bold");
    doc.text("Dia do estudo:", 120, infoY);
    doc.setFont("helvetica", "normal");
    doc.text(dia ? `D ${dia}` : "D ____", 158, infoY);

    const infoY2 = infoY + 6;
    doc.setFont("helvetica", "bold");
    doc.text("Grupo de Abate:", 20, infoY2);
    doc.setFont("helvetica", "normal");
    doc.text(grupoAbate || "__________________", 60, infoY2);

    return infoY2 + 6; // y de início da tabela
  };

  // ========== Exportar ==========
  const handleExportarPDF = () => {
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    doc.setFont("helvetica", "normal");
    doc.setLineWidth(0.35);

    // Apenas linhas preenchidas
    const bodyRows: RowInput[] = linhas
      .filter((l) => !isEmpty(l))
      .map((l) => [l.animal, destinoText(l)]);

    const head = [["Animal", "Destino da Carcaça"]];

    // Página 1 (total será acertado no didDrawPage)
    const startY = drawHeader(doc, 1, 1);
    autoTable(doc, {
      startY: startY + 2,
      head,
      body: bodyRows,
      theme: "grid",
      styles: {
        font: "helvetica",
        fontSize: 10,
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
        cellPadding: { top: 4, bottom: 4, left: 2, right: 2 },
      },
      columnStyles: {
        0: { cellWidth: 70, halign: "left" },   // Animal
        1: { cellWidth: 180, halign: "left" },  // Destino (checkboxes)
      } as any,
      margin: { left: 15, right: 15 },
      didDrawPage: () => {
        const total = doc.getNumberOfPages();
        const current = doc.getCurrentPageInfo().pageNumber;
        drawHeader(doc, current, total);
      },
      pageBreak: "auto",
    });

    // Rodapé: OBS + Veterinário
    const yEnd = (doc as any).lastAutoTable?.finalY ?? 160;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("OBS:", 20, yEnd + 10);
    doc.setFont("helvetica", "normal");
    doc.text(
      obs || "______________________________________________________________________________________________________________",
      35,
      yEnd + 10,
      { maxWidth: doc.internal.pageSize.getWidth() - 50 }
    );

    doc.setFont("helvetica", "bold");
    doc.text("Veterinário Responsável:", 20, yEnd + 25);
    doc.setFont("helvetica", "normal");
    doc.text(
      (veterinario || "_______________________________________________") + "    (assinatura e carimbo)",
      80,
      yEnd + 25
    );

    doc.save("FOR-EC-15.0-Destino-da-Carcaca.pdf");
  };

  // ========== UI ==========
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-lg p-6 space-y-6">
        <h1 className="text-2xl font-semibold text-center text-gray-800">
          15.0 – Destino da Carcaça
        </h1>

        {/* Topo (Data / Dia / Grupo) */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="md:col-span-2">
            <Label>Código do estudo</Label>
            <Input value={codigoEstudo} readOnly disabled />
          </div>
          <div>
            <Label>Data (DD/MM/AA)</Label>
            <Input value={data} onChange={(e) => setData(e.target.value)} />
          </div>
          <div>
            <Label>Dia do estudo (D)</Label>
            <Input value={dia} onChange={(e) => setDia(e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <Label>Grupo de Abate</Label>
            <Input value={grupoAbate} onChange={(e) => setGrupoAbate(e.target.value)} />
          </div>
        </div>

        {/* Linhas da tabela */}
        {linhas.map((l, i) => (
          <div key={i} className="grid grid-cols-1 md:grid-cols-12 gap-3 border rounded-lg p-4">
            <div className="md:col-span-4">
              <Label>Animal</Label>
              <Input value={l.animal} onChange={(e) => setL(i, "animal", e.target.value)} />
            </div>
            <div className="md:col-span-8">
              <Label>Destino da Carcaça</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={l.destino === "GRAXARIA"}
                    onChange={() => setL(i, "destino", l.destino === "GRAXARIA" ? "" : "GRAXARIA")}
                  />
                  Graxaria
                </label>
                <label className="flex items-center gap-2 md:col-span-2">
                  <input
                    type="checkbox"
                    checked={l.destino === "OUTROS"}
                    onChange={() => setL(i, "destino", l.destino === "OUTROS" ? "" : "OUTROS")}
                  />
                  Outros:
                  <Input
                    className="h-8"
                    value={l.outrosTexto}
                    onChange={(e) => setL(i, "outrosTexto", e.target.value)}
                    placeholder="descreva"
                  />
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

        <div className="flex gap-3">
          <Button onClick={addLinha}>Adicionar linha</Button>
          <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={handleExportarPDF}>
            Exportar PDF
          </Button>
        </div>

        {/* Campos de rodapé (entram no PDF) */}
        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label>OBS</Label>
            <Input value={obs} onChange={(e) => setObs(e.target.value)} placeholder="Observações gerais" />
          </div>
          <div>
            <Label>Veterinário Responsável (assinatura e carimbo)</Label>
            <Input value={veterinario} onChange={(e) => setVeterinario(e.target.value)} />
          </div>
        </div>
      </div>
    </div>
  );
}
