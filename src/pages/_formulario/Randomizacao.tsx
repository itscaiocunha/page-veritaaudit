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
 * 8.0 – RANDOMIZAÇÃO
 * Tela + Exportação em PDF espelhando o formulário oficial (A4 retrato).
 * Substitua a LOGO no PDF usando doc.addImage() onde indicado.
 */

interface LinhaAnimal {
  animal: string; // Número / ID do animal
  sexo: "Macho" | "Fêmea" | "";
  peso: string; // kg
  grupo: string; // Grupo alocado (A, B, 1, 2, etc.)
}

export default function DataRandomizacao() {
  // Metadados fixos do documento (ajuste se necessário)
  const codigoEstudo = "00-0001-25";
  const versao = "0";
  const numeroDocumento = "FOR-EC-8";

  // Campos de cabeçalho
  const [data, setData] = useState("");
  const [diaDoEstudo, setDiaDoEstudo] = useState("");

  // Rodapé (iniciais + datas)
  const [realizadoPor, setRealizadoPor] = useState("");
  const [realizadoData, setRealizadoData] = useState("");
  const [registradoPor, setRegistradoPor] = useState("");
  const [registradoData, setRegistradoData] = useState("");

  // Grupos possíveis (para assistência de randomização – opcional)
  const [grupos, setGrupos] = useState<string>("A,B"); // separado por vírgula

  // Linhas da tabela
  const [linhas, setLinhas] = useState<LinhaAnimal[]>([]);
  const [novo, setNovo] = useState<LinhaAnimal>({ animal: "", sexo: "", peso: "", grupo: "" });

  const gruposArray = useMemo(() =>
    grupos
      .split(",")
      .map((g) => g.trim())
      .filter(Boolean),
  [grupos]);

  const addLinha = () => {
    if (!novo.animal.trim()) return;
    setLinhas((prev) => [...prev, novo]);
    setNovo({ animal: "", sexo: "", peso: "", grupo: "" });
  };

  const removeLinha = (idx: number) => setLinhas((prev) => prev.filter((_, i) => i !== idx));

  const balancearRandomico = () => {
    if (gruposArray.length === 0) return;
    const aloc: LinhaAnimal[] = [];
    let i = 0;
    for (const l of linhas) {
      aloc.push({ ...l, grupo: gruposArray[i % gruposArray.length] });
      i++;
    }
    setLinhas(aloc);
  };

  const embaralharEAtribuir = () => {
    if (gruposArray.length === 0) return;
    const copia = [...linhas];
    for (let i = copia.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    const aloc = copia.map((l, i) => ({ ...l, grupo: gruposArray[i % gruposArray.length] }));
    setLinhas(aloc);
  };

  const handleExportarPDF = () => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    const header = (d: any) => {
      const pageWidth = doc.internal.pageSize.getWidth();
      doc.setFont("times", "bold");
      doc.setFontSize(12);
      // LOGO (trocar por addImage)
      doc.text("LOGO", 15, 12);

      const title = "8.0 – RANDOMIZAÇÃO";
      const textWidth = doc.getTextWidth(title);
      doc.text(title, (pageWidth - textWidth) / 2, 12);

      doc.setFont("times", "normal");
      doc.setFontSize(10);
      doc.text(`Página ${d.pageNumber} de {total}`, pageWidth - 25, 8);

      doc.text("Área: Estudos clínicos", 15, 20);
      doc.text(`N° DOC.: ${numeroDocumento}`, 100, 20);
      doc.text(`Versão: ${versao}`, pageWidth - 30, 20, { align: "right" });

      doc.setFontSize(11);
      doc.text(`Código do estudo: ${codigoEstudo}`, 15, 28);
      doc.text(`Data: ${data || "___________________"}`, 100, 28);
      doc.text(`Dia do Estudo: D ${diaDoEstudo || "_______________"}`, pageWidth - 15, 28, { align: "right" });
    };

    // Cabeçalho da tabela
    const head = [["Animal", "Sexo", "Peso (Kg)", "Grupo"]];

    // O PDF oficial mostra duas colunas de sexo (Macho/Fêmea). Para espelhar isso visualmente, marcamos com "Macho" ou "Fêmea" no campo Sexo.
    const linhasMinimas = 25; // o anexo distribui ~25 linhas em 2 páginas

    const body: RowInput[] = linhas.map((l) => [
      l.animal,
      l.sexo,
      l.peso,
      l.grupo,
    ]);

    while (body.length < Math.max(linhasMinimas, linhas.length)) {
      body.push(["", "", "", ""]);
    }

    autoTable(doc, {
      startY: 36,
      head: head,
      body: body,
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
        0: { cellWidth: 60, halign: "left" }, // Animal
        1: { cellWidth: 30 }, // Sexo
        2: { cellWidth: 30 }, // Peso
        3: { cellWidth: 60 }, // Grupo
      },
      didDrawPage: (data) => {
        // Cabeçalho por página
        header({ pageNumber: doc.internal.getNumberOfPages() });

        // Rodapé por página (linhas de assinatura apenas na última página, mas desenhar aqui não atrapalha)
        const pageWidth = doc.internal.pageSize.getWidth();
        let finalY = (doc as any).lastAutoTable?.finalY || 260;

        doc.setFont("times", "normal");
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

    // Corrige contagem total de páginas
    const total = doc.getNumberOfPages();
    for (let i = 1; i <= total; i++) {
      doc.setPage(i);
      const pageWidth = doc.internal.pageSize.getWidth();
      doc.setFont("times", "normal");
      doc.setFontSize(10);
      doc.text(`Página ${i} de ${total}`, pageWidth - 25, 8);
    }

    // Preenche assinaturas se informadas na última página
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

    doc.save("FOR-EC-8.0-Randomizacao.pdf");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-lg p-6 space-y-6">
        <h1 className="text-2xl font-semibold text-center text-gray-800">8.0 – Randomização</h1>

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
            <Label>Dia do Estudo (D)</Label>
            <Input placeholder="Ex.: 0, 1, 7, 14" value={diaDoEstudo} onChange={(e) => setDiaDoEstudo(e.target.value)} />
          </div>
        </div>

        {/* Assistência de Randomização (opcional) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <Label>Grupos (separados por vírgula)</Label>
            <Input value={grupos} onChange={(e) => setGrupos(e.target.value)} placeholder="A,B ou 1,2,3" />
          </div>
          <Button variant="secondary" onClick={balancearRandomico}>Balancear (A, B, A, B…)</Button>
          <Button variant="secondary" onClick={embaralharEAtribuir}>Embaralhar e Atribuir</Button>
        </div>

        {/* Linha nova */}
        <div className="grid grid-cols-1 md:grid-cols-8 gap-4 items-end">
          <div className="md:col-span-3">
            <Label>Animal</Label>
            <Input value={novo.animal} onChange={(e) => setNovo({ ...novo, animal: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <Label>Sexo</Label>
            <div className="flex gap-4 items-center h-10">
              <label className="flex items-center gap-2">
                <input type="radio" name="sexoNovo" checked={novo.sexo === "Macho"} onChange={() => setNovo({ ...novo, sexo: "Macho" })} />
                <span>Macho</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="sexoNovo" checked={novo.sexo === "Fêmea"} onChange={() => setNovo({ ...novo, sexo: "Fêmea" })} />
                <span>Fêmea</span>
              </label>
            </div>
          </div>
          <div>
            <Label>Peso (Kg)</Label>
            <Input value={novo.peso} onChange={(e) => setNovo({ ...novo, peso: e.target.value })} />
          </div>
          <div>
            <Label>Grupo</Label>
            <Input value={novo.grupo} onChange={(e) => setNovo({ ...novo, grupo: e.target.value })} />
          </div>
          <Button variant="secondary" onClick={addLinha}>Adicionar</Button>
        </div>

        {/* Tabela */}
        {linhas.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Animal</TableHead>
                <TableHead>Sexo</TableHead>
                <TableHead>Peso (Kg)</TableHead>
                <TableHead>Grupo</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {linhas.map((l, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium">{l.animal}</TableCell>
                  <TableCell>{l.sexo}</TableCell>
                  <TableCell>{l.peso}</TableCell>
                  <TableCell>{l.grupo}</TableCell>
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
          Observação: o PDF exportado replica cabeçalho, numeração de páginas, colunas e rodapé do
          formulário oficial. Para ficar idêntico, ajuste a imagem de LOGO no método de exportação e o número
          mínimo de linhas (25) para duas páginas.
        </p>
      </div>
    </div>
  );
}
