import { useMemo, useState } from "react";
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
 * 6.0 – IDENTIFICAÇÃO DOS ANIMAIS
 * Tela + Exportação em PDF espelhando o formulário oficial (A4 retrato, 2 páginas).
 * Substitua a LOGO no PDF usando doc.addImage() onde indicado.
 */

interface LinhaAnimal {
  animal: string;
  identificacao: string; // brinco / chip / tatuagem etc.
  idadeValor: string; // número
  idadeUnidade: "a" | "m" | "d" | ""; // anos / meses / dias
  raca: string;
  sexo: "M" | "F" | "";
}

export default function DataIdentificacaoAnimais() {
  // Metadados fixos do documento
  const codigoEstudo = "00-0001-25";
  const versao = "0";
  const numeroDocumento = "FOR-EC-6";

  // Cabeçalho
  const [data, setData] = useState("");
  const [momentoD, setMomentoD] = useState("");

  // Rodapé (iniciais + datas)
  const [realizadoPor, setRealizadoPor] = useState("");
  const [realizadoData, setRealizadoData] = useState("");
  const [registradoPor, setRegistradoPor] = useState("");
  const [registradoData, setRegistradoData] = useState("");

  // Linhas da tabela
  const [linhas, setLinhas] = useState<LinhaAnimal[]>([]);
  const [novo, setNovo] = useState<LinhaAnimal>({
    animal: "",
    identificacao: "",
    idadeValor: "",
    idadeUnidade: "",
    raca: "",
    sexo: "",
  });

  const addLinha = () => {
    if (!novo.animal.trim()) return;
    setLinhas((prev) => [...prev, novo]);
    setNovo({ animal: "", identificacao: "", idadeValor: "", idadeUnidade: "", raca: "", sexo: "" });
  };

  const removeLinha = (idx: number) => setLinhas((prev) => prev.filter((_, i) => i !== idx));

  const handleExportarPDF = () => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    const header = (pageNumber: number) => {
      const pageWidth = doc.internal.pageSize.getWidth();
      doc.setFont("times", "bold");
      doc.setFontSize(12);

      // LOGO (trocar por addImage)
      doc.text("LOGO", 15, 12);

      const title = "6.0 – IDENTIFICAÇÃO DOS ANIMAIS";
      const textWidth = doc.getTextWidth(title);
      doc.text(title, (pageWidth - textWidth) / 2, 12);

      doc.setFont("times", "normal");
      doc.setFontSize(10);
      doc.text(`Página ${pageNumber} de {total}`, pageWidth - 25, 8);

      doc.text("Área: Estudos clínicos", 15, 20);
      doc.text(`N° DOC.: ${numeroDocumento}`, 100, 20);
      doc.text(`Versão: ${versao}`, pageWidth - 30, 20, { align: "right" });

      doc.setFontSize(11);
      doc.text(`Código do estudo: ${codigoEstudo}`, 15, 28);
      doc.text(`Data: ${data || "___________________"}`, 100, 28);
      doc.text(`Momento: D ${momentoD || "_______________"}`, pageWidth - 15, 28, { align: "right" });
    };

    const head = [[
      "Animal",
      "Identificação",
      "Idade¹ (a/m/d)",
      "Raça",
      "Sexo² (M/F)",
    ]];

    // Converter as linhas para o corpo da tabela
    const body: RowInput[] = linhas.map((l) => [
      l.animal,
      l.identificacao,
      l.idadeValor ? `${l.idadeValor} ${l.idadeUnidade}` : "",
      l.raca,
      l.sexo,
    ]);

    // Forçar no mínimo de linhas para preencher até 2 páginas do formulário
    const linhasMinimas = 26; // ajuste fino conforme necessidade para gerar 2 páginas
    while (body.length < Math.max(linhasMinimas, linhas.length)) {
      body.push(["", "", "", "", ""]);
    }

    autoTable(doc, {
      startY: 36,
      head,
      body,
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
        0: { cellWidth: 40, halign: "left" }, // Animal
        1: { cellWidth: 50, halign: "left" }, // Identificação
        2: { cellWidth: 30 }, // Idade
        3: { cellWidth: 40, halign: "left" }, // Raça
        4: { cellWidth: 30 }, // Sexo
      },
      didDrawPage: () => {
        header(doc.internal.getNumberOfPages());

        // Rodapé: legenda + assinaturas (exibidas por página; a última página será sobrescrita com valores reais se houver)
        const finalY = (doc as any).lastAutoTable?.finalY || 260;
        doc.setFont("times", "normal");
        doc.setFontSize(8);
        doc.text("Legenda: ¹Idade - a = anos, m = meses, d = dias; ²Sexo - M = macho e F = fêmea.", 15, finalY + 6);

        doc.setFontSize(10);
        doc.text(
          "Realizado por (iniciais): ________________________________________  Data: ________________",
          15,
          finalY + 18
        );
        doc.text(
          "Registrado por (iniciais): _______________________________________  Data: ________________",
          15,
          finalY + 28
        );
      },
      pageBreak: "auto",
      margin: { left: 15, right: 15 },
    });

    // Corrigir numeração total
    let total = doc.getNumberOfPages();

    // Se por acaso gerou apenas 1 página, adiciona a segunda para respeitar o modelo "Página 1 de 2 / Página 2 de 2"
    if (total === 1) {
      doc.addPage();
      header(2);
      total = 2;
    }

    for (let i = 1; i <= total; i++) {
      doc.setPage(i);
      const pageWidth = doc.internal.pageSize.getWidth();
      doc.setFont("times", "normal");
      doc.setFontSize(10);
      doc.text(`Página ${i} de ${total}`, pageWidth - 25, 8);
    }

    // Preencher assinaturas na última página com valores informados (se houver)
    doc.setPage(total);
    const lastY = (doc as any).lastAutoTable?.finalY || 260;
    doc.setFont("times", "normal");
    doc.setFontSize(10);
    if (realizadoPor || realizadoData) {
      doc.text(
        `Realizado por (iniciais): ${realizadoPor || "________________________"}  Data: ${
          realizadoData || "______________"
        }`,
        15,
        lastY + 18
      );
    }
    if (registradoPor || registradoData) {
      doc.text(
        `Registrado por (iniciais): ${registradoPor || "_______________________"}  Data: ${
          registradoData || "______________"
        }`,
        15,
        lastY + 28
      );
    }

    doc.save("FOR-EC-6.0-IdentificacaoDosAnimais.pdf");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-lg p-6 space-y-6">
        <h1 className="text-2xl font-semibold text-center text-gray-800">6.0 – Identificação dos Animais</h1>

        {/* Cabeçalho */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <Label>Código do Estudo</Label>
            <Input value={codigoEstudo} readOnly disabled />
          </div>
          <div>
            <Label>Data</Label>
            <Input placeholder="DD/MM/AAAA" value={data} onChange={(e) => setData(e.target.value)} />
          </div>
          <div>
            <Label>Momento: D</Label>
            <Input placeholder="Ex.: 0, 1, 7, 14" value={momentoD} onChange={(e) => setMomentoD(e.target.value)} />
          </div>
        </div>

        {/* Linha nova */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-2">
            <Label>Animal</Label>
            <Input value={novo.animal} onChange={(e) => setNovo({ ...novo, animal: e.target.value })} />
          </div>
          <div className="md:col-span-3">
            <Label>Identificação</Label>
            <Input value={novo.identificacao} onChange={(e) => setNovo({ ...novo, identificacao: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <Label>Idade</Label>
            <div className="flex items-center gap-2">
              <Input className="w-20" placeholder="valor" value={novo.idadeValor} onChange={(e) => setNovo({ ...novo, idadeValor: e.target.value })} />
              <label className="flex items-center gap-1 text-sm">
                <input type="radio" name="idadeUn" checked={novo.idadeUnidade === "a"} onChange={() => setNovo({ ...novo, idadeUnidade: "a" })} /> a
              </label>
              <label className="flex items-center gap-1 text-sm">
                <input type="radio" name="idadeUn" checked={novo.idadeUnidade === "m"} onChange={() => setNovo({ ...novo, idadeUnidade: "m" })} /> m
              </label>
              <label className="flex items-center gap-1 text-sm">
                <input type="radio" name="idadeUn" checked={novo.idadeUnidade === "d"} onChange={() => setNovo({ ...novo, idadeUnidade: "d" })} /> d
              </label>
            </div>
          </div>
          <div className="md:col-span-2">
            <Label>Raça</Label>
            <Input value={novo.raca} onChange={(e) => setNovo({ ...novo, raca: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <Label>Sexo</Label>
            <div className="flex items-center gap-4 h-10">
              <label className="flex items-center gap-2">
                <input type="radio" name="sexoNovo" checked={novo.sexo === "M"} onChange={() => setNovo({ ...novo, sexo: "M" })} />
                <span>M</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="sexoNovo" checked={novo.sexo === "F"} onChange={() => setNovo({ ...novo, sexo: "F" })} />
                <span>F</span>
              </label>
            </div>
          </div>
          <Button variant="secondary" onClick={addLinha}>Adicionar</Button>
        </div>

        {/* Tabela */}
        {linhas.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Animal</TableHead>
                <TableHead>Identificação</TableHead>
                <TableHead>Idade¹ (a/m/d)</TableHead>
                <TableHead>Raça</TableHead>
                <TableHead>Sexo² (M/F)</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {linhas.map((l, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium">{l.animal}</TableCell>
                  <TableCell>{l.identificacao}</TableCell>
                  <TableCell>
                    {l.idadeValor} {l.idadeUnidade}
                  </TableCell>
                  <TableCell>{l.raca}</TableCell>
                  <TableCell>{l.sexo}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" onClick={() => removeLinha(idx)}>Remover</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Rodapé (assinaturas) */}
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

        {/* Exportar */}
        <Button className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold" onClick={handleExportarPDF}>
          Exportar PDF
        </Button>

        <p className="text-xs text-gray-500 leading-relaxed">
          Observação: o PDF exportado replica cabeçalho, numeração (forçada para 2 páginas), colunas e rodapé do
          formulário oficial. Para ficar idêntico, ajuste a imagem de LOGO no método de exportação.
        </p>
      </div>
    </div>
  );
}