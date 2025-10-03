import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import jsPDF from "jspdf";
import autoTable, { RowInput } from "jspdf-autotable";

/**
 * FOR-EC-24.0 – ESCORE DE CONDIÇÃO CORPORAL (PORTRAIT)
 * A4 portrait • margens 15mm • Helvetica (Arial)
 * Exporta SOMENTE as linhas preenchidas (não completa com linhas vazias).
 */

type Linha = {
  animal: string;
  ecc1: string; // D/Data #1
  ecc2: string; // D/Data #2
  ecc3: string; // D/Data #3
  ecc4: string; // D/Data #4
};

export default function EscoreCondicaoCorporal() {
  // Metadados
  const codigoEstudo = "00-0001-25";
  const numeroDocumento = "FOR-EC-24";
  const versao = "0";

  // Cabeçalho extra (até 4 momentos)
  const [dia1, setDia1] = useState("");
  const [dia2, setDia2] = useState("");
  const [dia3, setDia3] = useState("");
  const [dia4, setDia4] = useState("");

  const [data1, setData1] = useState("");
  const [data2, setData2] = useState("");
  const [data3, setData3] = useState("");
  const [data4, setData4] = useState("");

  // Tabela (UI)
  const nova = (): Linha => ({ animal: "", ecc1: "", ecc2: "", ecc3: "", ecc4: "" });
  const [linhas, setLinhas] = useState<Linha[]>([nova()]);
  const addLinha = () => setLinhas((p) => [...p, nova()]);
  const removeLinha = (i: number) => setLinhas((p) => (p.length === 1 ? p : p.filter((_, k) => k !== i)));
  const setL = <K extends keyof Linha>(i: number, k: K, v: Linha[K]) =>
    setLinhas((p) => p.map((l, idx) => (idx === i ? { ...l, [k]: v } : l)));

  const [realizadoPor, setRealizadoPor] = useState("");
  const [realizadoData, setRealizadoData] = useState("");
  const [registradoPor, setRegistradoPor] = useState("");
  const [registradoData, setRegistradoData] = useState("");

  // Helpers
  const isEmpty = (l: Linha) => !(l.animal || l.ecc1 || l.ecc2 || l.ecc3 || l.ecc4);

  const drawHeader = (doc: jsPDF, page: number, total: number) => {
    const W = doc.internal.pageSize.getWidth();
    const innerW = W - 30;                      
    const headerY = 10;
    const headerH = 16;
    const leftW = 65;
    const rightW = 62;
    const centerW = innerW - leftW - rightW;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);

    // moldura superior
    doc.rect(15, headerY, innerW, headerH);
    doc.rect(15, headerY, leftW, headerH);
    doc.rect(15 + innerW - rightW, headerY, rightW, headerH);

    doc.text("LOGO", 24, headerY + 10);
    doc.text("24.0 – ESCORE DE CONDIÇÃO CORPORAL", 15 + leftW + centerW / 2, headerY + 10, {
      align: "center",
    });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Página", 15 + innerW - rightW + 10, headerY + 6);
    doc.text(`${page}`, 15 + innerW - rightW + 32, headerY + 6);
    doc.text("de", 15 + innerW - rightW + 37, headerY + 6);
    doc.text(`${total}`, 15 + innerW - 10, headerY + 6);

    const metaY = headerY + headerH + 4;
    doc.text("Área: Estudos clínicos", 20, metaY);
    doc.text(`N° DOC.: ${numeroDocumento}`, 15 + leftW + centerW / 2, metaY, { align: "center" });
    doc.text(`Versão: ${versao}`, W - 20, metaY, { align: "right" });

    // faixa “Código do estudo”
    const bandY = metaY + 6;
    doc.rect(15, bandY, innerW, 10);
    doc.setFont("helvetica", "bold");
    doc.text("Código do estudo:", 20, bandY + 7);
    doc.setFont("helvetica", "normal");
    doc.text(codigoEstudo, 63, bandY + 7);

    return bandY + 14; // y inicial abaixo da faixa
  };

  const drawDayDateBlock = (doc: jsPDF, y: number) => {
    const x = 15;
    const W = doc.internal.pageSize.getWidth(); 
    const usable = W - 30;         
    const colW = usable / 4;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Dia do Estudo:", x, y);

    doc.setFont("helvetica", "normal");
    doc.text(`   D: ${dia1 || "____"}`, x + 24, y);
    doc.text(`D: ${dia2 || "____"}`, x + 24 + colW, y);
    doc.text(`D: ${dia3 || "____"}`, x + 24 + 2 * colW, y);
    doc.text(`D: ${dia4 || "____"}`, x + 24 + 3 * colW, y);

    const y2 = y + 6;
    doc.setFont("helvetica", "bold");
    doc.text("Data:", x, y2);

    doc.setFont("helvetica", "normal");
    doc.text(`${data1 || "____/____/____"}`, x + 24, y2);
    doc.text(`${data2 || "____/____/____"}`, x + 24 + colW, y2);
    doc.text(`${data3 || "____/____/____"}`, x + 24 + 2 * colW, y2);
    doc.text(`${data4 || "____/____/____"}`, x + 24 + 3 * colW, y2);

    return y2 + 6;
  };

  const handleExportarPDF = () => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" }); // <<< VERTICAL
    doc.setFont("helvetica", "normal");
    doc.setLineWidth(0.35);

    // Cabeçalho + bloco dias/datas
    const y0 = drawHeader(doc, 1, 1);  // total é recalculado no didDrawPage
    const yAfterBlock = drawDayDateBlock(doc, y0);

    // Apenas linhas preenchidas
    const filled = linhas.filter((l) => !isEmpty(l));

    // Monta corpo (sem padding)
    const body: RowInput[] = filled.map((l) => [l.animal, l.ecc1, l.ecc2, l.ecc3, l.ecc4]);

    // Cabeçalho da tabela
    const head = [[
      "Animal",
      "ECC¹",
      "ECC¹",
      "ECC¹",
      "ECC¹",
    ]];

    // Larguras para portrait (útil ~180mm)
    // Animal 70 | ECC1 27.5 | ECC2 27.5 | ECC3 27.5 | ECC4 27.5  => 180
    const columnStyles = {
      0: { cellWidth: 70, halign: "left" },
      1: { cellWidth: 27.5, halign: "center" },
      2: { cellWidth: 27.5, halign: "center" },
      3: { cellWidth: 27.5, halign: "center" },
      4: { cellWidth: 27.5, halign: "center" },
    } as const;

    autoTable(doc, {
      startY: yAfterBlock + 2,
      head,
      body,
      theme: "grid",
      styles: {
        font: "helvetica",
        fontSize: 9.5,
        overflow: "linebreak",
        cellPadding: { top: 4, right: 6, bottom: 4, left: 6 }, // mais espaço interno
        halign: "center",
        valign: "middle",
        lineColor: [0, 0, 0],
        lineWidth: 0.35,
        minCellHeight: 12, // altura mínima maior
      },
      headStyles: {
        fontStyle: "bold",
        fontSize: 10,
        halign: "center",
        valign: "middle",
        fillColor: [255, 255, 255],
        textColor: 0,
        lineWidth: 0.5,
        cellPadding: { top: 4, bottom: 4, left: 2, right: 2 },
      },
      columnStyles: columnStyles as any,
      margin: { left: 15, right: 15 },
      didDrawPage: () => {
        // Atualiza cabeçalho e total de páginas
        const total = doc.getNumberOfPages();
        const current = doc.getCurrentPageInfo().pageNumber;
        drawHeader(doc, current, total);

        // Legenda + rodapé (somente página 1)
        if (current === 1) {
          const finalY = (doc as any).lastAutoTable?.finalY ?? 240;
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.text(
            "Legenda: ¹Escore de condição corporal conforme Edmonson et al. (1989), escala de 1 a 5 com intervalo de 0,25.",
            20,
            finalY + 8,
            { maxWidth: doc.internal.pageSize.getWidth() - 40 }
          );
          doc.setFontSize(10);
          doc.text(
            `Realizado por (iniciais): ${realizadoPor || "____________________________________"}   Data: ${realizadoData || "____________"}`,
            15,
            finalY + 22
          );
          doc.text(
            `Registrado por (iniciais): ${registradoPor || "___________________________________"}   Data: ${registradoData || "____________"}`,
            15,
            finalY + 32
          );
        }
      },
      pageBreak: "auto",
    });

    doc.save("FOR-EC-24.0-Escore-Condicao-Corporal.pdf");
  };

  // ====== UI ======
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg p-6 space-y-6">
        <h1 className="text-2xl font-semibold text-center text-gray-800">
          24.0 – Escore de Condição Corporal
        </h1>

        {/* Bloco de dias/datas (até 4 momentos) */}
        <div className="grid grid-cols-1 md:grid-cols-8 gap-4">
          <div className="md:col-span-2">
            <Label>Código do estudo</Label>
            <Input value={codigoEstudo} readOnly disabled />
          </div>

          <div>
            <Label>Dia 1 (D)</Label>
            <Input value={dia1} onChange={(e) => setDia1(e.target.value)} />
          </div>
          <div>
            <Label>Data 1 (DD/MM/AA)</Label>
            <Input value={data1} onChange={(e) => setData1(e.target.value)} />
          </div>

          <div>
            <Label>Dia 2 (D)</Label>
            <Input value={dia2} onChange={(e) => setDia2(e.target.value)} />
          </div>
          <div>
            <Label>Data 2 (DD/MM/AA)</Label>
            <Input value={data2} onChange={(e) => setData2(e.target.value)} />
          </div>

          <div>
            <Label>Dia 3 (D)</Label>
            <Input value={dia3} onChange={(e) => setDia3(e.target.value)} />
          </div>
          <div>
            <Label>Data 3 (DD/MM/AA)</Label>
            <Input value={data3} onChange={(e) => setData3(e.target.value)} />
          </div>

          <div>
            <Label>Dia 4 (D)</Label>
            <Input value={dia4} onChange={(e) => setDia4(e.target.value)} />
          </div>
          <div>
            <Label>Data 4 (DD/MM/AA)</Label>
            <Input value={data4} onChange={(e) => setData4(e.target.value)} />
          </div>
        </div>

        {/* Tabela (edição rápida) */}
        {linhas.map((l, i) => (
          <div key={i} className="grid grid-cols-1 md:grid-cols-10 gap-3 border rounded-lg p-4">
            <div className="md:col-span-4">
              <Label>Animal</Label>
              <Input value={l.animal} onChange={(e) => setL(i, "animal", e.target.value)} />
            </div>
            <div>
              <Label>ECC¹ (1º)</Label>
              <Input value={l.ecc1} onChange={(e) => setL(i, "ecc1", e.target.value)} />
            </div>
            <div>
              <Label>ECC¹ (2º)</Label>
              <Input value={l.ecc2} onChange={(e) => setL(i, "ecc2", e.target.value)} />
            </div>
            <div>
              <Label>ECC¹ (3º)</Label>
              <Input value={l.ecc3} onChange={(e) => setL(i, "ecc3", e.target.value)} />
            </div>
            <div>
              <Label>ECC¹ (4º)</Label>
              <Input value={l.ecc4} onChange={(e) => setL(i, "ecc4", e.target.value)} />
            </div>

            <div className="md:col-span-2 flex items-end justify-end">
              <Button variant="ghost" onClick={() => removeLinha(i)} disabled={linhas.length === 1}>
                Remover
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

        <p className="text-xs text-gray-500">
          ¹ Escore de condição corporal (Edmonson et al., 1989): escala de 1 a 5, em incrementos de 0,25.
        </p>

        {/* Assinaturas ( usadas no PDF ) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Realizado por (iniciais)</Label>
              <Input value={realizadoPor} onChange={(e) => setRealizadoPor(e.target.value)} />
            </div>
            <div>
              <Label>Data</Label>
              <Input value={realizadoData} onChange={(e) => setRealizadoData(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
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
