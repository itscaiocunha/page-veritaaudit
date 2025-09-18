import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import jsPDF from "jspdf";
import autoTable, { RowInput } from "jspdf-autotable";

/**
 * 7.0 – SELEÇÃO DOS ANIMAIS
 * Tela + Exportação em PDF espelhando o formulário oficial.
 * Substitua a LOGO no PDF usando doc.addImage() onde indicado.
 */

interface LinhaAnimal {
  numero: string;
  selecionado: "S" | "N" | ""; // "" = não marcado
  justificativa: string;
}

export default function DataSelecaoAnimais() {
  //\-\- Metadados fixos do documento (ajuste conforme necessário)
  const codigoEstudo = "00-0001-25";
  const versao = "0";
  const numeroDocumento = "FOR-EC-7";

  //\-\- Cabeçalho da página (inputs)
  const [data, setData] = useState("");
  const [diaDoEstudo, setDiaDoEstudo] = useState("");

  //\-\- Equipe (rodapé)
  const [realizadoPor, setRealizadoPor] = useState(""); // iniciais
  const [realizadoData, setRealizadoData] = useState("");
  const [registradoPor, setRegistradoPor] = useState(""); // iniciais
  const [registradoData, setRegistradoData] = useState("");

  //\-\- Linhas de animais
  const [linhas, setLinhas] = useState<LinhaAnimal[]>([]);
  const [novo, setNovo] = useState<LinhaAnimal>({ numero: "", selecionado: "", justificativa: "" });

  const addLinha = () => {
    if (!novo.numero.trim()) return;
    setLinhas((prev) => [...prev, novo]);
    setNovo({ numero: "", selecionado: "", justificativa: "" });
  };

  const removeLinha = (idx: number) => setLinhas((prev) => prev.filter((_, i) => i !== idx));

  const toggleSN = (idx: number, valor: "S" | "N") => {
    setLinhas((prev) =>
      prev.map((l, i) => (i === idx ? { ...l, selecionado: l.selecionado === valor ? "" : valor } : l))
    );
  };

  const handleExportarPDF = () => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    // Helper: header & footer por página
    const header = (d: any) => {
      const pageWidth = doc.internal.pageSize.getWidth();
      doc.setFont("times", "bold");
      doc.setFontSize(12);

      // LOGO (troque por addImage se desejar)
      doc.text("LOGO", 15, 12);

      const title = "7.0 – SELEÇÃO DOS ANIMAIS"; // centralizado
      const textWidth = doc.getTextWidth(title);
      doc.text(title, (pageWidth - textWidth) / 2, 12);

      doc.setFont("times", "normal");
      doc.setFontSize(10);

      // Linha 2 do cabeçalho
      doc.text("Área: Estudos clínicos", 15, 20);
      doc.text(`N° DOC.: ${numeroDocumento}`, 100, 20);
      doc.text(`Versão: ${versao}`, pageWidth - 30, 20, { align: "right" });

      // Linha 3: Código, Data, Dia D
      doc.setFontSize(11);
      doc.text(`Código do estudo: ${codigoEstudo}`, 15, 28);
      doc.text(`Data: ${data || "___________________"}`, 100, 28);
      doc.text(`Dia do Estudo: D ${diaDoEstudo || "_______________"}`, pageWidth - 15, 28, { align: "right" });
    };

    // Montagem dos dados da tabela
    // O formulário oficial tem colunas: Número do Animal | S | N | "Selecionado (S/N) * Se não, justifique."
    const head = [["Número do Animal", "S", "N", "Selecionado (S/N) * Se não, justifique."]];

    // Garante um número de linhas para preencher 2 páginas se necessário (ex.: 24 por página)
    const linhasMinimas = 24; // ajuste se quiser espelhar ainda mais fielmente
    const corpo: RowInput[] = [...linhas].map((l) => [
      l.numero,
      l.selecionado === "S" ? "X" : "",
      l.selecionado === "N" ? "X" : "",
      l.selecionado === "N" ? (l.justificativa || "") : "",
    ]);

    while (corpo.length < Math.max(linhasMinimas, linhas.length)) {
      corpo.push(["", "", "", ""]);
    }

    autoTable(doc, {
      startY: 36,
      head: head,
      body: corpo,
      theme: "grid",
      styles: {
        font: "times",
        fontSize: 10,
        halign: "center",
        valign: "middle",
        cellPadding: 2,
        lineColor: [0, 0, 0],
        lineWidth: 0.3,
      },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: 0,
        fontStyle: "bold",
        halign: "center",
      },
      columnStyles: {
        0: { cellWidth: 50, halign: "left" },
        1: { cellWidth: 10 },
        2: { cellWidth: 10 },
        3: { cellWidth: 110, halign: "left" },
      },
      didDrawPage: (data) => {
        // Cabeçalho por página
        header({ pageNumber: doc.internal.getNumberOfPages() });

        // Rodapé por página
        const pageWidth = doc.internal.pageSize.getWidth();
        let finalY = (doc as any).lastAutoTable?.finalY || 260;

        doc.setFont("times", "normal");
        doc.setFontSize(8);

        doc.setFontSize(10);
      },
      pageBreak: "auto",
      margin: { left: 15, right: 15 },
    });

    // Substitui {total} na numeração das páginas pelo total real
    const total = doc.getNumberOfPages();
    const replaceTotal = () => {
      for (let i = 1; i <= total; i++) {
        doc.setPage(i);
        const pageWidth = doc.internal.pageSize.getWidth();
        doc.setFont("times", "normal");
        doc.setFontSize(10);
        // Sobrescreve a string "{total}" no mesmo local
        doc.text(`Página ${i} de ${total}`, pageWidth - 25, 8);
      }
    };
    replaceTotal();

    // Preenche os campos de assinatura se fornecidos (apenas para a última página)
    doc.setPage(total);
    const lastY = (doc as any).lastAutoTable?.finalY || 260;
    doc.setFont("times", "normal");
    doc.setFontSize(10);
    if (realizadoPor || realizadoData) {
      doc.text(
        `Realizado por (iniciais): ${realizadoPor || "________________________"}  Data: ${
          realizadoData || "___________"
        }`,
        15,
        lastY + 18
      );
    }
    if (registradoPor || registradoData) {
      doc.text(
        `Registrado por (iniciais): ${registradoPor || "_______________________"}  Data: ${
          registradoData || "___________"
        }`,
        15,
        lastY + 28
      );
    }

    doc.save("FOR-EC-7.0.pdf");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-lg p-6 space-y-6">
        <h1 className="text-2xl font-semibold text-center text-gray-800">
          7.0 – Seleção dos Animais
        </h1>

        {/* --- Cabeçalho --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Código do Estudo</Label>
            <Input value={codigoEstudo} readOnly disabled />
          </div>
          <div>
            <Label>Data</Label>
            <Input
              placeholder="DD/MM/AAAA"
              value={data}
              onChange={(e) => setData(e.target.value)}
            />
          </div>
          <div>
            <Label>Dia do Estudo (D)</Label>
            <Input
              placeholder="Ex.: 0, 1, 7, 14"
              value={diaDoEstudo}
              onChange={(e) => setDiaDoEstudo(e.target.value)}
            />
          </div>
        </div>

        {/* --- Linha nova --- */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
          <div className="md:col-span-2">
            <Label>Número do Animal</Label>
            <Input
              value={novo.numero}
              onChange={(e) => setNovo({ ...novo, numero: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-2">
            <Label className="mr-2">S</Label>
            <input
              type="checkbox"
              checked={novo.selecionado === "S"}
              onChange={() =>
                setNovo((n) => ({ ...n, selecionado: n.selecionado === "S" ? "" : "S" }))
              }
              className="h-5 w-5"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label className="mr-2">N</Label>
            <input
              type="checkbox"
              checked={novo.selecionado === "N"}
              onChange={() =>
                setNovo((n) => ({ ...n, selecionado: n.selecionado === "N" ? "" : "N" }))
              }
              className="h-5 w-5"
            />
          </div>
          <div className="md:col-span-2">
            <Label>Se não, justifique</Label>
            <Input
              value={novo.justificativa}
              onChange={(e) => setNovo({ ...novo, justificativa: e.target.value })}
            />
          </div>
          <Button variant="secondary" onClick={addLinha}>
            Adicionar
          </Button>
        </div>

        {/* --- Tabela --- */}
        {linhas.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número do Animal</TableHead>
                <TableHead className="text-center">S</TableHead>
                <TableHead className="text-center">N</TableHead>
                <TableHead>Se não, justifique</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {linhas.map((l, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium">{l.numero}</TableCell>
                  <TableCell className="text-center">
                    <input
                      type="checkbox"
                      checked={l.selecionado === "S"}
                      onChange={() => toggleSN(idx, "S")}
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <input
                      type="checkbox"
                      checked={l.selecionado === "N"}
                      onChange={() => toggleSN(idx, "N")}
                    />
                  </TableCell>
                  <TableCell>{l.justificativa}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" onClick={() => removeLinha(idx)}>
                      Remover
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* --- Equipe (rodapé do PDF) --- */}
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

        {/* --- Exportar --- */}
        <Button
          className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold"
          onClick={handleExportarPDF}
        >
          Exportar PDF
        </Button>

        <p className="text-xs text-gray-500 leading-relaxed">
          Observação: o PDF exportado replica cabeçalho, numeração de páginas, colunas e rodapé do
          formulário oficial. Para ficar idêntico, ajuste a imagem de LOGO no método de exportação.
        </p>
      </div>
    </div>
  );
}