import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import jsPDF from "jspdf";
import autoTable, { RowInput } from "jspdf-autotable";

interface LinhaAnimal {
  numero: string;
  selecionado: "S" | "N" | "";
  justificativa: string;     // Comentários
  observadoPor: string;      // <<< NOVO
}

export default function DataObservacaoSaude() {
  const codigoEstudo = "00-0001-25";
  const versao = "0";
  const numeroDocumento = "FOR-EC-10";

  const [data, setData] = useState("");
  const [diaDoEstudo, setDiaDoEstudo] = useState("");

  const [realizadoPor, setRealizadoPor] = useState("");
  const [realizadoData, setRealizadoData] = useState("");
  const [registradoPor, setRegistradoPor] = useState("");
  const [registradoData, setRegistradoData] = useState("");

  const [linhas, setLinhas] = useState<LinhaAnimal[]>([]);
  const [novo, setNovo] = useState<LinhaAnimal>({
    numero: "",
    selecionado: "",
    justificativa: "",
    observadoPor: "",
  });

  const addLinha = () => {
    if (!novo.numero.trim()) return;
    setLinhas((prev) => [...prev, novo]);
    setNovo({ numero: "", selecionado: "", justificativa: "", observadoPor: "" });
  };

  const removeLinha = (idx: number) =>
    setLinhas((prev) => prev.filter((_, i) => i !== idx));

  const toggleSN = (idx: number, valor: "S" | "N") => {
    setLinhas((prev) =>
      prev.map((l, i) => (i === idx ? { ...l, selecionado: l.selecionado === valor ? "" : valor } : l))
    );
  };

  const handleExportarPDF = () => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    const header = () => {
      const pageWidth = doc.internal.pageSize.getWidth();
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);

      doc.text("LOGO", 15, 12);

      const title = "10.0 - OBSERVAÇÕES GERAIS DE SAÚDE (OGS)";
      const textWidth = doc.getTextWidth(title);
      doc.text(title, (pageWidth - textWidth) / 2, 12);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text("Área: Estudos clínicos", 15, 20);
      doc.text(`N° DOC.: ${numeroDocumento}`, 100, 20);
      doc.text(`Versão: ${versao}`, pageWidth - 30, 20, { align: "right" });

      doc.setFontSize(11);
      doc.text(`Código do estudo: ${codigoEstudo}`, 15, 28);
      doc.text(`Data: ${data || "___________________"}`, 100, 28);
      doc.text(`Dia do Estudo: D ${diaDoEstudo || "_______________"}`, pageWidth - 15, 28, { align: "right" });
    };

    // ===== Tabela =====
    const head = [["Número do Animal", "S", "N", "Comentários", "Observado por:"]];

    // Monta o corpo com **5 células por linha**
    const corpo: RowInput[] = linhas.map((l) => [
      l.numero,
      l.selecionado === "S" ? "X" : "",
      l.selecionado === "N" ? "X" : "",
      l.justificativa || "",
      l.observadoPor || "",
    ]);

    // Preenche linhas vazias até completar a página (opcional)
    const linhasMinimas = 24;
    while (corpo.length < Math.max(linhasMinimas, linhas.length)) {
      corpo.push(["", "", "", "", ""]);
    }

    autoTable(doc, {
      startY: 36,
      head,
      body: corpo,
      theme: "grid",
      styles: {
        font: "helvetica",     // Arial ≈ Helvetica
        fontSize: 10,
        halign: "center",
        valign: "middle",
        cellPadding: 2,
        lineColor: [0, 0, 0],
        lineWidth: 0.3,
        overflow: "linebreak", // <<< evita “estourar” célula
      },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: 0,
        fontStyle: "bold",
        halign: "center",
      },
      // Larguras = 180 mm (210 - 15 - 15) para não “quebrar” a tabela
      columnStyles: {
        0: { cellWidth: 45, halign: "left" },                 // Número
        1: { cellWidth: 12 },                                 // S
        2: { cellWidth: 12 },                                 // N
        3: { cellWidth: 91, halign: "left", cellWidthType: "wrap" as any }, // Comentários (quebra de linha)
        4: { cellWidth: 20, halign: "left" },                 // Observado por
      },
      margin: { top: 36, left: 15, right: 15, bottom: 20 },
      didDrawPage: () => {
        header();
        // numeração no topo
        const w = doc.internal.pageSize.getWidth();
        const cur = doc.getCurrentPageInfo().pageNumber;
        const tot = doc.getNumberOfPages();
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text(`Página ${cur} de ${tot}`, w - 25, 8);

        // rodapé (assinaturas) – só na última página
        if (cur === tot) {
          const finalY = (doc as any).lastAutoTable?.finalY || 260;
          doc.setFontSize(10);
          doc.text(
            `Realizado por (iniciais): ${realizadoPor || "________________________"}  Data: ${realizadoData || "___________"}`,
            15,
            finalY + 18
          );
          doc.text(
            `Registrado por (iniciais): ${registradoPor || "_______________________"}  Data: ${registradoData || "___________"}`,
            15,
            finalY + 28
          );
        }
      },
      pageBreak: "auto",
      rowPageBreak: "auto",
      // garante que o cabeçalho da tabela reapareça a cada página
      showHead: "everyPage",
      showFoot: "lastPage",
    });

    doc.save("FOR-EC-10.0-OGS.pdf");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-lg p-6 space-y-6">
        <h1 className="text-2xl font-semibold text-center text-gray-800">
          10.0 - OBSERVAÇÕES GERAIS DE SAÚDE (OGS)
        </h1>

        {/* Cabeçalho */}
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
            <Label>Dia do Estudo (D)</Label>
            <Input placeholder="Ex.: 0, 1, 7, 14" value={diaDoEstudo} onChange={(e) => setDiaDoEstudo(e.target.value)} />
          </div>
        </div>

        {/* Linha nova */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-end">
          <div className="md:col-span-2">
            <Label>Número do animal</Label>
            <Input value={novo.numero} onChange={(e) => setNovo({ ...novo, numero: e.target.value })} />
          </div>
          <div className="flex items-center gap-2">
            <Label className="mr-2">S</Label>
            <input
              type="checkbox"
              checked={novo.selecionado === "S"}
              onChange={() => setNovo((n) => ({ ...n, selecionado: n.selecionado === "S" ? "" : "S" }))}
              className="h-5 w-5"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label className="mr-2">N</Label>
            <input
              type="checkbox"
              checked={novo.selecionado === "N"}
              onChange={() => setNovo((n) => ({ ...n, selecionado: n.selecionado === "N" ? "" : "N" }))}
              className="h-5 w-5"
            />
          </div>
          <div className="md:col-span-2">
            <Label>Comentários</Label>
            <Input value={novo.justificativa} onChange={(e) => setNovo({ ...novo, justificativa: e.target.value })} />
          </div>
          <div>
            <Label>Observado por</Label>
            <Input value={novo.observadoPor} onChange={(e) => setNovo({ ...novo, observadoPor: e.target.value })} />
          </div>
          <Button variant="secondary" onClick={addLinha}>Adicionar</Button>
        </div>

        {/* Tabela visual */}
        {linhas.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número do Animal</TableHead>
                <TableHead className="text-center">S</TableHead>
                <TableHead className="text-center">N</TableHead>
                <TableHead>Comentários</TableHead>
                <TableHead>Observado por</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {linhas.map((l, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium">{l.numero}</TableCell>
                  <TableCell className="text-center">
                    <input type="checkbox" checked={l.selecionado === "S"} onChange={() => toggleSN(idx, "S")} />
                  </TableCell>
                  <TableCell className="text-center">
                    <input type="checkbox" checked={l.selecionado === "N"} onChange={() => toggleSN(idx, "N")} />
                  </TableCell>
                  <TableCell>{l.justificativa}</TableCell>
                  <TableCell>{l.observadoPor}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" onClick={() => removeLinha(idx)}>Remover</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Rodapé (para preencher e aparecer no PDF) */}
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

        <Button className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold" onClick={handleExportarPDF}>
          Exportar PDF
        </Button>
      </div>
    </div>
  );
}
