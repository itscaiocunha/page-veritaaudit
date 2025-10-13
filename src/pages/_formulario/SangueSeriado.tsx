import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

import jsPDF from "jspdf";
import autoTable, { RowInput } from "jspdf-autotable";

type Horarios = [string, string, string]; // até 3 horários por coleta
type Coleta = {
  tempoH: string;   // "1.5", "2", etc
  data: string;     // "DD/MM/AA"
  horarios: Horarios;
};
type Linha = {
  animal: string;
  c1: Coleta; c2: Coleta; c3: Coleta; c4: Coleta; c5: Coleta; c6: Coleta;
  realizadoPor: string;
};

const novaColeta = (): Coleta => ({ tempoH: "", data: "", horarios: ["", "", ""] });
const MAX_HORARIOS = 3;

export default function ColheitaSangueSeriada() {
  // cabeçalho
  const codigoEstudo = "00-0001-25";
  const versao = "0";
  const numeroDocumento = "FOR-EC-18";

  // lista e nova linha
  const [linhas, setLinhas] = useState<Linha[]>([]);
  const [novo, setNovo] = useState<Linha>({
    animal: "",
    c1: novaColeta(), c2: novaColeta(), c3: novaColeta(),
    c4: novaColeta(), c5: novaColeta(), c6: novaColeta(),
    realizadoPor: "",
  });

  const addLinha = () => {
    if (!novo.animal.trim()) return;
    setLinhas((prev) => [...prev, novo]);
    setNovo({
      animal: "",
      c1: novaColeta(), c2: novaColeta(), c3: novaColeta(),
      c4: novaColeta(), c5: novaColeta(), c6: novaColeta(),
      realizadoPor: "",
    });
  };
  const removeLinha = (idx: number) =>
    setLinhas((prev) => prev.filter((_, i) => i !== idx));

  // helpers de UI
  const setColetaField = (key: keyof Coleta, idx: number, col: 1|2|3|4|5|6, value: string) => {
    setNovo((cur) => {
      const target = { ...cur[`c${col}` as const] };
      if (key === "horarios") return cur; // protegemos; horários setados por setHorario
      (target as any)[key] = value;
      return { ...cur, [`c${col}`]: target } as Linha;
    });
  };
  const setHorario = (col: 1|2|3|4|5|6, pos: number, value: string) => {
    setNovo((cur) => {
      const target = { ...cur[`c${col}` as const] };
      const hrs = [...target.horarios] as string[];
      hrs[pos] = value;
      target.horarios = hrs as Horarios;
      return { ...cur, [`c${col}`]: target } as Linha;
    });
  };

  // renderiza texto da célula de coleta para a tabela e PDF
  const renderColeta = (c: Coleta) => {
    const horariosStr = c.horarios.filter(Boolean).join("  ·  ");
    return `Tempo: ${c.tempoH || "—"} h\nData: ${c.data || "—"}\nHorário: ${horariosStr || "—"}`;
  };

  // ====== EXPORTAÇÃO ======
  const handleExportarPDF = () => {
    // A4 retrato, margens generosas para evitar overlap
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pw = doc.internal.pageSize.getWidth();

    // Cabeçalho por página
    const drawHeader = (page: number, total: number) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);

      // LOGO placeholder (substitua por addImage)
      doc.rect(15, 10, 40, 12);
      doc.text("LOGO", 35, 18, { align: "center" });

      const title = "18.0 – COLHEITA DE SANGUE SERIADA";
      doc.text(title, pw / 2, 17, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Página ${page} de ${total}`, pw - 20, 12, { align: "right" });

      doc.setFontSize(9);
      doc.text("Área: Estudos Clínicos", 15, 27);
      doc.text(`N° DOC.: ${numeroDocumento}`, pw / 2 - 10, 27);
      doc.text(`Versão: ${versao}`, pw - 20, 27, { align: "right" });

      // Código
      doc.setDrawColor(0);
      doc.setLineWidth(0.4);
      doc.rect(15, 32, pw - 30, 10);
      doc.setFontSize(10);
      doc.text("Código do estudo:", 19, 38);
      doc.text(codigoEstudo, 60, 38);
    };

    // Montar tabela
    const head = [[
      "Animal",
      "Coleta 1\n(Tempo/Data/ Horários)",
      "Coleta 2\n(Tempo/Data/ Horários)",
      "Coleta 3\n(Tempo/Data/ Horários)",
      "Coleta 4\n(Tempo/Data/ Horários)",
      "Coleta 5\n(Tempo/Data/ Horários)",
      "Coleta 6\n(Tempo/Data/ Horários)",
      "Realizado por\n(iniciais)",
    ]];

    const body: RowInput[] = linhas.map((l) => [
      l.animal,
      renderColeta(l.c1),
      renderColeta(l.c2),
      renderColeta(l.c3),
      renderColeta(l.c4),
      renderColeta(l.c5),
      renderColeta(l.c6),
      l.realizadoPor || "",
    ]);

    autoTable(doc, {
      startY: 45,
      head,
      body,
      theme: "grid",
      tableWidth: doc.internal.pageSize.getWidth() - 30, // 15 mm de cada lado
      styles: {
        font: "helvetica",
        fontSize: 8.5,            // um pouco menor
        cellPadding: 1.8,         // padding menor
        valign: "top",
        overflow: "linebreak",    // força quebra
        lineColor: [0, 0, 0],
        lineWidth: 0.25,
      },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: 0,
        fontStyle: "bold",
        halign: "center",
      },
      // Larguras que somam 180 mm (área útil)
      columnStyles: {
        0: { cellWidth: 24, halign: "left" }, // Animal
        1: { cellWidth: 22 },                 // Coleta 1
        2: { cellWidth: 22 },                 // Coleta 2
        3: { cellWidth: 22 },                 // Coleta 3
        4: { cellWidth: 22 },                 // Coleta 4
        5: { cellWidth: 22 },                 // Coleta 5
        6: { cellWidth: 22 },                 // Coleta 6
        7: { cellWidth: 24 },                 // Realizado por
      },
      margin: { left: 15, right: 15 },
      didDrawPage: () => {
        const cur = doc.getCurrentPageInfo().pageNumber;
        const total = doc.getNumberOfPages();
        drawHeader(cur, total);
      },
      pageBreak: "auto",
    });


    // Legenda + Registrado por
    const finalY = (doc as any).lastAutoTable?.finalY || 260;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(
      "Legenda: ¹ Data – preencher no formato DD/MM/AA; ² Horário – preencher no formato HH:MM (24h).",
      15,
      finalY + 8
    );

    doc.setFontSize(10);
    doc.text(
      "Registrado por (iniciais): _______________________________________   Data: ________________",
      15,
      finalY + 22
    );

    doc.save("FOR-EC-18.0-ColheitaSangueSeriada.pdf");
  };

  // ====== UI ======
  const BlocoColeta = ({ idx, col }: { idx: number; col: 1|2|3|4|5|6 }) => {
    const c = novo[`c${col}` as const];
    return (
      <div className="space-y-2">
        <Label>Coleta {col}</Label>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <Label className="text-xs">Tempo (h)</Label>
            <Input value={c.tempoH} onChange={(e) => setColetaField("tempoH", idx, col, e.target.value)} />
          </div>
          <div className="col-span-2">
            <Label className="text-xs">Data (DD/MM/AA)</Label>
            <Input value={c.data} onChange={(e) => setColetaField("data", idx, col, e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[...Array(MAX_HORARIOS)].map((_, i) => (
            <div key={i}>
              <Label className="text-xs">Horário {i + 1}</Label>
              <Input value={c.horarios[i]} onChange={(e) => setHorario(col, i, e.target.value)} placeholder="HH:MM" />
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-lg p-6 space-y-6">
        <h1 className="text-2xl font-semibold text-center text-gray-800">
          18.0 – Colheita de Sangue Seriada
        </h1>

        {/* Cabeçalho fixo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <Label>Código do Estudo</Label>
            <Input value={codigoEstudo} readOnly disabled />
          </div>
          <div>
            <Label>Nº DOC.</Label>
            <Input value={numeroDocumento} readOnly disabled />
          </div>
          <div>
            <Label>Versão</Label>
            <Input value={versao} readOnly disabled />
          </div>
        </div>

        {/* Linha nova */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-3">
            <Label>Animal</Label>
            <Input value={novo.animal} onChange={(e) => setNovo({ ...novo, animal: e.target.value })} />
          </div>
          <div className="lg:col-span-9">
            <Label>Realizado por (iniciais)</Label>
            <Input value={novo.realizadoPor} onChange={(e) => setNovo({ ...novo, realizadoPor: e.target.value })} />
          </div>
          {/* blocos de coleta */}
          <div className="lg:col-span-12 grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            <BlocoColeta idx={0} col={1} />
            <BlocoColeta idx={0} col={2} />
            <BlocoColeta idx={0} col={3} />
            <BlocoColeta idx={0} col={4} />
            <BlocoColeta idx={0} col={5} />
            <BlocoColeta idx={0} col={6} />
          </div>
          <div className="lg:col-span-12">
            <Button variant="secondary" onClick={addLinha}>
              Adicionar linha
            </Button>
          </div>
        </div>

        {/* Tabela visual (preenchidos) */}
        {linhas.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Animal</TableHead>
                <TableHead>Coleta 1</TableHead>
                <TableHead>Coleta 2</TableHead>
                <TableHead>Coleta 3</TableHead>
                <TableHead>Coleta 4</TableHead>
                <TableHead>Coleta 5</TableHead>
                <TableHead>Coleta 6</TableHead>
                <TableHead>Realizado por</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {linhas.map((l, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium">{l.animal}</TableCell>
                  <TableCell className="whitespace-pre-wrap">{renderColeta(l.c1)}</TableCell>
                  <TableCell className="whitespace-pre-wrap">{renderColeta(l.c2)}</TableCell>
                  <TableCell className="whitespace-pre-wrap">{renderColeta(l.c3)}</TableCell>
                  <TableCell className="whitespace-pre-wrap">{renderColeta(l.c4)}</TableCell>
                  <TableCell className="whitespace-pre-wrap">{renderColeta(l.c5)}</TableCell>
                  <TableCell className="whitespace-pre-wrap">{renderColeta(l.c6)}</TableCell>
                  <TableCell>{l.realizadoPor}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" onClick={() => removeLinha(idx)}>Remover</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Exportação */}
        <Button
          className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold"
          onClick={handleExportarPDF}
        >
          Exportar PDF
        </Button>

        <p className="text-xs text-gray-500 leading-relaxed">
          Dica: use Horários no formato 24h (ex.: 08:30, 14:05).
        </p>
      </div>
    </div>
  );
}
