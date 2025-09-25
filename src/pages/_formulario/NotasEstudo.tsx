import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import jsPDF from "jspdf";

/** FOR-EC-27.0 – NOTAS AO ESTUDO (A4 portrait, Helvetica≈Arial, margens 15 mm) */

type Nota = {
  data: string;
  descricao: string;
  registradoPor: string;
};

export default function NotasAoEstudo() {
  // metadados
  const codigoEstudo = "00-0001-25";
  const numeroDocumento = "FOR-EC-27";
  const versao = "0";

  // começa com 1 nota
  const makeNota = (): Nota => ({ data: "", descricao: "", registradoPor: "" });
  const [notas, setNotas] = useState<Nota[]>([makeNota()]);

  // UI helpers
  const updateNota = <K extends keyof Nota>(i: number, k: K, v: Nota[K]) =>
    setNotas((prev) => prev.map((n, idx) => (idx === i ? { ...n, [k]: v } : n)));
  const addNota = () => setNotas((p) => [...p, makeNota()]);
  const removeNota = (i: number) =>
    setNotas((p) => (p.length === 1 ? p : p.filter((_, idx) => idx !== i)));

  // ===== PDF helpers =====
  const H = (doc: jsPDF) => doc.internal.pageSize.getHeight();
  const W = (doc: jsPDF) => doc.internal.pageSize.getWidth();
  const line = (doc: jsPDF, x1: number, y: number, x2: number) => doc.line(x1, y, x2, y);
  const rect = (doc: jsPDF, x: number, y: number, w: number, h: number) => doc.rect(x, y, w, h);

  const drawHeader = (doc: jsPDF, pageNum: number, total: number) => {
    const w = W(doc);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);

    // molduras topo
    rect(doc, 15, 10, w - 30, 16);  // moldura geral
    rect(doc, 15, 10, 40, 16);      // LOGO
    rect(doc, w - 50, 10, 35, 16);  // Página
    doc.text("LOGO", 26, 20);

    const title = "27.0 – NOTAS AO ESTUDO";
    doc.text(title, w / 2, 20, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    // numeração na caixa
    doc.text("Página", w - 28, 16);
    doc.text(String(pageNum), w - 38, 18);
    doc.text("de", w - 20, 16);
    doc.text(String(total), w - 14, 18);

    // linha meta
    doc.text("Área: Estudos clínicos", 20, 30);
    doc.text(`N° DOC.: ${numeroDocumento}`, w / 2 - 8, 30);
    doc.text(`Versão: ${versao}`, w - 20, 30, { align: "right" });

    // código do estudo
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Código do estudo:", 20, 40);
    doc.setFont("helvetica", "normal");
    line(doc, 63, 40.5, w - 20);
    doc.text(codigoEstudo, 64, 39.5);
  };

  const drawNota = (doc: jsPDF, top: number, nota: Nota) => {
    const w = W(doc);
    const left = 15, right = w - 15, innerW = right - left;

    // DATA:
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("DATA:", left + 5, top + 6);
    doc.setFont("helvetica", "normal");
    line(doc, left + 22, top + 6.5, right - 5);
    if (nota.data) doc.text(nota.data, left + 24, top + 5.5);

    // Descrição (caixa grande)
    doc.setFont("helvetica", "bold");
    doc.text("Descrição:", left + 5, top + 16);
    rect(doc, left + 5, top + 18, innerW - 10, 30);
    if (nota.descricao) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const wrapped = doc.splitTextToSize(nota.descricao, innerW - 14);
      doc.text(wrapped, left + 8, top + 25);
    }

    // Registrado por
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Registrado por (iniciais):", left + 5, top + 54);
    doc.setFont("helvetica", "normal");
    line(doc, left + 70, top + 54.5, right - 30);
    doc.text("Data:", right - 26, top + 54);
    line(doc, right - 16, top + 54.5, right - 5);

    if (nota.registradoPor) doc.text(nota.registradoPor, left + 72, top + 53.5);
    // (opcional) data do registro preenchida pela própria pessoa; deixamos em branco.
  };

  const handleExportarPDF = () => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    doc.setFont("helvetica", "normal");
    doc.setLineWidth(0.3);

    // 6 notas por página (cabe certinho em 1 página se tiver até 6)
    const PER_PAGE = 6;
    const BLOCK_H = 62; // altura de cada bloco
    const firstTop = 46; // logo após "Código do estudo"

    const totalPages = Math.max(1, Math.ceil(notas.length / PER_PAGE));

    for (let p = 0; p < totalPages; p++) {
      if (p > 0) doc.addPage();
      drawHeader(doc, p + 1, totalPages);

      let top = firstTop;
      const start = p * PER_PAGE;
      const end = Math.min(start + PER_PAGE, notas.length);

      for (let i = start; i < end; i++) {
        // moldura do bloco (opcional, fica bonito e ajuda a guiar a escrita)
        rect(doc, 15, top + 2, W(doc) - 30, BLOCK_H - 6);
        drawNota(doc, top, notas[i]);
        top += BLOCK_H;
      }

      // numeração extra no rodapé (fora a caixa do topo)
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(`Página ${p + 1} de ${totalPages}`, W(doc) - 30, H(doc) - 5);
    }

    doc.save("FOR-EC-27.0-Notas-ao-Estudo.pdf");
  };

  // ===== UI =====
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-lg p-6 space-y-6">
        <h1 className="text-2xl font-semibold text-center text-gray-800">
          27.0 – Notas ao Estudo
        </h1>

        {/* editor de notas */}
        {notas.map((n, i) => (
          <div key={i} className="grid grid-cols-1 md:grid-cols-12 gap-3 border rounded-lg p-4">
            <div className="md:col-span-3">
              <Label>DATA</Label>
              <Input
                placeholder="DD/MM/AAAA"
                value={n.data}
                onChange={(e) => updateNota(i, "data", e.target.value)}
              />
            </div>
            <div className="md:col-span-9">
              <Label>Registrado por (iniciais)</Label>
              <Input
                value={n.registradoPor}
                onChange={(e) => updateNota(i, "registradoPor", e.target.value)}
              />
            </div>
            <div className="md:col-span-12">
              <Label>Descrição</Label>
              <textarea
                className="w-full border rounded-md p-2 h-28"
                value={n.descricao}
                onChange={(e) => updateNota(i, "descricao", e.target.value)}
              />
            </div>
            <div className="md:col-span-12 flex justify-between">
              <span className="text-xs text-gray-500">Bloco {i + 1}</span>
              <Button variant="ghost" onClick={() => removeNota(i)} disabled={notas.length === 1}>
                Remover bloco
              </Button>
            </div>
          </div>
        ))}

        <div className="flex gap-3">
          <Button onClick={addNota}>Adicionar bloco</Button>
          <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={handleExportarPDF}>
            Exportar PDF
          </Button>
        </div>
      </div>
    </div>
  );
}
