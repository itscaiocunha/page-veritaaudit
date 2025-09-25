import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import jsPDF from "jspdf";

/** FOR-EC-17.0 – COLHEITA DE SANGUE (A4 portrait, grid manual, sem sobreposição no rodapé) */

type Linha = {
  animal: string;
  momento: string;   // D
  horario: string;   // HH:MM
  coletou: "" | "S" | "N";
  avaliacao: { hemograma: boolean; bioquimico: boolean };
};

export default function ColheitaSangue() {
  // Metadados fixos do formulário
  const codigoEstudo = "00-0001-25";
  const numeroDocumento = "FOR-EC-17";
  const versao = "0";

  // Cabeçalho variável
  const [data, setData] = useState("");

  // Rodapés (assinaturas)
  const [realizadoPor, setRealizadoPor] = useState("");
  const [realizadoData, setRealizadoData] = useState("");
  const [registradoPor, setRegistradoPor] = useState("");
  const [registradoData, setRegistradoData] = useState("");

  // Começa com 1 linha
  const makeLinha = (): Linha => ({
    animal: "",
    momento: "",
    horario: "",
    coletou: "",
    avaliacao: { hemograma: false, bioquimico: false },
  });
  const [linhas, setLinhas] = useState<Linha[]>([makeLinha()]);

  // ==== UI helpers ====
  const updateLinha = <K extends keyof Linha>(i: number, key: K, value: Linha[K]) =>
    setLinhas((prev) => prev.map((l, idx) => (idx === i ? { ...l, [key]: value } : l)));
  const toggleCheck = (i: number, field: "S" | "N") =>
    setLinhas((prev) =>
      prev.map((l, idx) =>
        idx === i ? { ...l, coletou: l.coletou === field ? "" : field } : l
      )
    );
  const toggleAval = (i: number, which: "hemograma" | "bioquimico") =>
    setLinhas((prev) =>
      prev.map((l, idx) =>
        idx === i ? { ...l, avaliacao: { ...l.avaliacao, [which]: !l.avaliacao[which] } } : l
      )
    );
  const addLinha = () => setLinhas((prev) => [...prev, makeLinha()]);
  const removeLinha = (i: number) =>
    setLinhas((prev) => (prev.length === 1 ? prev : prev.filter((_, idx) => idx !== i)));

  // ==== PDF helpers (Helvetica ≈ Arial) ====
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

  const drawHeader = (doc: jsPDF, pageNum: number, total: number) => {
    const W = doc.internal.pageSize.getWidth();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);

    // Molduras topo
    doc.rect(15, 10, W - 30, 16);         // moldura geral
    doc.rect(15, 10, 40, 16);             // LOGO
    doc.rect(W - 50, 10, 35, 16);         // Página
    doc.text("LOGO", 26, 20);             // troque por addImage()

    const title = "17.0 – COLHEITA DE SANGUE";
    const tw = doc.getTextWidth(title);
    doc.text(title, (W - tw) / 2, 20);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    // numeração
    doc.text(String(pageNum), W - 38, 18);
    doc.text("Página", W - 28, 16);
    doc.text("de", W - 20, 16);
    doc.text(String(total), W - 14, 18);

    // linha meta
    doc.text("Área: Estudos clínicos", 20, 30);
    doc.text(`N° DOC.: ${numeroDocumento}`, W / 2 - 10, 30);
    doc.text(`Versão: ${versao}`, W - 20, 30, { align: "right" });

    // Código / Data
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Código do estudo:", 20, 40);
    doc.setFont("helvetica", "normal");
    line(doc, 63, 40.5, W / 2 - 10);
    doc.setFont("helvetica", "bold");
    doc.text("Data:", W / 2, 40);
    doc.setFont("helvetica", "normal");
    line(doc, W / 2 + 10, 40.5, W - 20);
    doc.text(codigoEstudo, 64, 39.5);
    if (data) doc.text(data, W / 2 + 12, 39.5);

    // Cabeçalho da tabela
    const left = 15;  // margem esquerda
    const right = W - 15;
    const yTop = 50;

    // colunas (somam 180mm)
    const colAnimal = left + 0;     // largura 40
    const colMomento = left + 40;   // largura 26
    const colHorario = left + 66;   // largura 34
    const colColetou = left + 100;  // largura 40
    const colAvaliacao = left + 140;// largura 55
    const colEnd = right;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Animal", colAnimal + 3, yTop + 5);
    doc.text("Momento (D)", colMomento + 3, yTop + 5);
    doc.text("Horário (HH:MM)", colHorario + 3, yTop + 5);
    doc.text("Coletou?", colColetou + 3, yTop + 5);
    doc.text("Avaliação", colAvaliacao + 3, yTop + 5);

    // linhas/colunas do cabeçalho
    line(doc, left, yTop + 9, colEnd);
    vline(doc, colAnimal, yTop, yTop + 9);
    vline(doc, colMomento, yTop, yTop + 9);
    vline(doc, colHorario, yTop, yTop + 9);
    vline(doc, colColetou, yTop, yTop + 9);
    vline(doc, colAvaliacao, yTop, yTop + 9);
    vline(doc, colEnd, yTop, yTop + 9);
  };

  const drawRow = (doc: jsPDF, rowTop: number, rowH: number, L: Linha) => {
    const W = doc.internal.pageSize.getWidth();
    const left = 15;
    const right = W - 15;

    // colunas (mesmas do header)
    const x0 = left;
    const x1 = left + 40;
    const x2 = left + 66;
    const x3 = left + 100;
    const x4 = left + 140;
    const x5 = right;

    // retícula horizontal/vertical
    line(doc, x0, rowTop + rowH, x5);
    vline(doc, x0, rowTop, rowTop + rowH);
    vline(doc, x1, rowTop, rowTop + rowH);
    vline(doc, x2, rowTop, rowTop + rowH);
    vline(doc, x3, rowTop, rowTop + rowH);
    vline(doc, x4, rowTop, rowTop + rowH);
    vline(doc, x5, rowTop, rowTop + rowH);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    // Linhas de preenchimento visuais + textos
    // Animal
    line(doc, x0 + 3, rowTop + rowH - 6, x1 - 3);
    if (L.animal) doc.text(L.animal, x0 + 3, rowTop + rowH - 7.5);
    // Momento
    line(doc, x1 + 3, rowTop + rowH - 6, x2 - 3);
    if (L.momento) doc.text(L.momento, x1 + 3, rowTop + rowH - 7.5);
    // Horário
    line(doc, x2 + 3, rowTop + rowH - 6, x3 - 3);
    if (L.horario) doc.text(L.horario, x2 + 3, rowTop + rowH - 7.5);

    // Coletou? (duas linhas de checkboxes)
    cb(doc, x3 + 3, rowTop + 6, "Sim", L.coletou === "S");
    cb(doc, x3 + 3, rowTop + 12.5, "Não", L.coletou === "N");

    // Avaliação (duas linhas de checkboxes)
    cb(doc, x4 + 3, rowTop + 6, "Hemograma", L.avaliacao.hemograma);
    cb(doc, x4 + 3, rowTop + 12.5, "Bioquímico", L.avaliacao.bioquimico);
  };

  // ÚNICA definição de rodapé (com baseY explícito!)
  const drawFooter = (
    doc: jsPDF,
    variant: "realizado" | "registrado",
    baseY: number
  ) => {
    const W = doc.internal.pageSize.getWidth();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);

    if (variant === "realizado") {
      doc.text("Realizado por (iniciais):", 20, baseY);
      doc.setFont("helvetica", "normal");
      line(doc, 80, baseY + 0.5, 170);
      doc.text("Data:", 180, baseY);
      line(doc, 193, baseY + 0.5, W - 20);
      if (realizadoPor) doc.text(realizadoPor, 82, baseY - 1);
      if (realizadoData) doc.text(realizadoData, 195, baseY - 1);
    } else {
      doc.text("Registrado por (iniciais):", 20, baseY);
      doc.setFont("helvetica", "normal");
      line(doc, 90, baseY + 0.5, 180);
      doc.text("Data:", 190, baseY);
      line(doc, 203, baseY + 0.5, W - 20);
      if (registradoPor) doc.text(registradoPor, 92, baseY - 1);
      if (registradoData) doc.text(registradoData, 205, baseY - 1);
    }
  };

  // ==== Exportação — sem sobreposição ====
  const handleExportarPDF = () => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    doc.setFont("helvetica", "normal");
    doc.setLineWidth(0.3);

    const ROWS_PER_PAGE = 11;   // reduzido para abrir espaço ao rodapé
    const ROW_H = 16;
    const firstRowTop = 59;
    const totalPages = Math.max(1, Math.ceil(Math.max(1, linhas.length) / ROWS_PER_PAGE));

    for (let p = 0; p < totalPages; p++) {
      if (p > 0) doc.addPage();
      drawHeader(doc, p + 1, totalPages);

      let y = firstRowTop + 9;
      const start = p * ROWS_PER_PAGE;
      const end = Math.min(start + ROWS_PER_PAGE, linhas.length);

      // dados
      for (let i = start; i < end; i++) {
        drawRow(doc, y, ROW_H, linhas[i]);
        y += ROW_H;
      }
      // completa grade até ROWS_PER_PAGE
      for (let i = end; i < start + ROWS_PER_PAGE; i++) {
        drawRow(doc, y, ROW_H, makeLinha());
        y += ROW_H;
      }

      // rodapés (agora com baseY explícito)
      if (p === 0) drawFooter(doc, "realizado", 265);
      if (p === totalPages - 1) drawFooter(doc, "registrado", 278);

      // numeração extra no rodapé direito
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(`Página ${p + 1} de ${totalPages}`, doc.internal.pageSize.getWidth() - 30, 292);
    }

    doc.save("FOR-EC-17.0-Colheita-de-Sangue.pdf");
  };

  // ==== UI ====
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-lg p-6 space-y-6">
        <h1 className="text-2xl font-semibold text-center text-gray-800">17.0 – Colheita de Sangue</h1>

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
            <Label>Nº DOC. / Versão</Label>
            <Input value={`${numeroDocumento} • v${versao}`} readOnly disabled />
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
              <Label>Momento (D)</Label>
              <Input value={l.momento} onChange={(e) => updateLinha(i, "momento", e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <Label>Horário (HH:MM)</Label>
              <Input value={l.horario} onChange={(e) => updateLinha(i, "horario", e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <Label>Coletou?</Label>
              <div className="flex items-center gap-4 text-sm">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={l.coletou === "S"} onChange={() => toggleCheck(i, "S")} />
                  Sim
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={l.coletou === "N"} onChange={() => toggleCheck(i, "N")} />
                  Não
                </label>
              </div>
            </div>
            <div className="md:col-span-3">
              <Label>Avaliação</Label>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={l.avaliacao.hemograma} onChange={() => toggleAval(i, "hemograma")} />
                  Hemograma
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={l.avaliacao.bioquimico} onChange={() => toggleAval(i, "bioquimico")} />
                  Bioquímico
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

        {/* Assinaturas (preenchimento; linhas saem no PDF) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Realizado por (iniciais)</Label>
              <Input value={realizadoPor} onChange={(e) => setRealizadoPor(e.target.value)} />
            </div>
            <div>
              <Label>Data</Label>
              <Input value={realizadoData} onChange={(e) => setRealizadoData(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
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
      </div>
    </div>
  );
}
