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
 * 5.0 – EXAME FÍSICO E LABORATORIAL
 * Tela + Exportação em PDF espelhando o formulário oficial (A4 retrato, 2 páginas).
 * Substitua a LOGO no PDF usando doc.addImage() onde indicado.
 */

interface LinhaExame {
  animal: string;
  ogs: "Normal" | "Alterado" | ""; // Observações Gerais de Saúde
  ecc: string; // 1 a 5 (pode ter 0,25)
  hidratacao: "Normal" | "Alterado" | "";
  tr: string; // °C
  fc: string; // bpm
  fr: string; // mpm
  mr: string; // mp2m
  mucosas: "0" | "1" | "2" | "3" | "4" | "5" | "";
  linfonodo: "NA" | "Normal" | "Alterado" | "";
  ubre: "Normal" | "Alterado" | ""; // Avaliação do úbere
  grumos: "NA" | "Presentes" | "Ausentes" | ""; // Teste Caneca de Fundo Preto
  sangue: "NA" | "Sim" | "Não" | ""; // Coleta de sangue
  obs: string;
}

export default function DataExameFisicoLaboratorial() {
  // Metadados fixos do documento
  const codigoEstudo = "00-0001-25";
  const versao = "0";
  const numeroDocumento = "FOR-EC-5";

  // Cabeçalho
  const [data, setData] = useState("");
  const [diaDoEstudo, setDiaDoEstudo] = useState("");

  // Rodapé (iniciais + datas)
  const [realizadoPor, setRealizadoPor] = useState("");
  const [realizadoData, setRealizadoData] = useState("");
  const [registradoPor, setRegistradoPor] = useState("");
  const [registradoData, setRegistradoData] = useState("");

  // Linhas da tabela
  const [linhas, setLinhas] = useState<LinhaExame[]>([]);
  const [novo, setNovo] = useState<LinhaExame>({
    animal: "",
    ogs: "",
    ecc: "",
    hidratacao: "",
    tr: "",
    fc: "",
    fr: "",
    mr: "",
    mucosas: "",
    linfonodo: "",
    ubre: "",
    grumos: "",
    sangue: "",
    obs: "",
  });

  const addLinha = () => {
    if (!novo.animal.trim()) return;
    setLinhas((prev) => [...prev, novo]);
    setNovo({
      animal: "",
      ogs: "",
      ecc: "",
      hidratacao: "",
      tr: "",
      fc: "",
      fr: "",
      mr: "",
      mucosas: "",
      linfonodo: "",
      ubre: "",
      grumos: "",
      sangue: "",
      obs: "",
    });
  };

  const removeLinha = (idx: number) => setLinhas((prev) => prev.filter((_, i) => i !== idx));

  const handleExportarPDF = () => {
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

    const header = (pageNumber: number) => {
      const pageWidth = doc.internal.pageSize.getWidth();
      doc.setFont("times", "bold");
      doc.setFontSize(12);

      // LOGO (trocar por addImage)
      doc.text("LOGO", 15, 12);

      const title = "5.0 – EXAME FÍSICO E LABORATORIAL";
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
      doc.text(`Dia do Estudo: D ${diaDoEstudo || "_______________"}`, pageWidth - 15, 28, { align: "right" });
    };

    // Cabeçalho de duas linhas (para incluir unidades)
    const head = [
      [
        "Animal",
        "OGS¹",
        "ECC² (1 a 5)",
        "Hidratação",
        "TR³ (°C)",
        "FC⁴ (bpm)",
        "FR⁵ (mpm)",
        "MR⁶ (mp2m)",
        "Mucosas⁷",
        "Linfonodo",
        "Úbere",
        "Grumos⁹",
        "Sangue",
        "Obs.",
      ],
    ];

    const body: RowInput[] = linhas.map((l) => [
      l.animal,
      l.ogs,
      l.ecc,
      l.hidratacao,
      l.tr,
      l.fc,
      l.fr,
      l.mr,
      l.mucosas,
      l.linfonodo,
      l.ubre,
      l.grumos,
      l.sangue,
      l.obs,
    ]);

    // Forçar no mínimo de linhas para ocupar 2 páginas
    const linhasMinimas = 18; // ajuste fino para garantir duas páginas com a largura de 14 colunas
    while (body.length < Math.max(linhasMinimas, linhas.length)) {
      body.push(["", "", "", "", "", "", "", "", "", "", "", "", "", ""]);
    }

    autoTable(doc, {
      startY: 36,
      head,
      body,
      theme: "grid",
      styles: {
        font: "times",
        fontSize: 8, // mais compacto para caber em retrato
        halign: "center",
        valign: "middle",
        cellPadding: 1.5,
        lineColor: [0, 0, 0],
        lineWidth: 0.3,
      },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: 0,
        fontStyle: "bold",
        halign: "center",
        fontSize: 8,
      },
      columnStyles: {
        0: { cellWidth: 24, halign: "left" }, // Animal
        1: { cellWidth: 18 }, // OGS
        2: { cellWidth: 18 }, // ECC
        3: { cellWidth: 20 }, // Hidratação
        4: { cellWidth: 14 }, // TR
        5: { cellWidth: 14 }, // FC
        6: { cellWidth: 14 }, // FR
        7: { cellWidth: 16 }, // MR
        8: { cellWidth: 20 }, // Mucosas
        9: { cellWidth: 20 }, // Linfonodo
        10:{ cellWidth: 22 }, // Úbere
        11:{ cellWidth: 22 }, // Grumos
        12:{ cellWidth: 18 }, // Sangue
        13:{ cellWidth: 27, halign: "left" }, // Obs (ajustado para caber no A4 horizontal)
      },
      didDrawPage: () => {
        header(doc.internal.getNumberOfPages());

        const finalY = (doc as any).lastAutoTable?.finalY || 260;
        doc.setFont("times", "normal");
        doc.setFontSize(7);
        doc.text(
          "Legenda: 1OGS – Observações Gerais de Saúde; ²ECC – vacas leiteiras: 1 a 5 (0,25); demais: 1 a 5; ³TR – Temperatura retal (°C); ⁴FC – bpm; ⁵FR – mpm; ⁶MR – movimentos ruminais/2min; ⁷Mucosas – 0 rósea clara, 1 rósea pálida, 2 cianótica, 3 congesta, 4 vermelho tijolo, 5 ictérica; ⁸TPC – Tempo de Preenchimento Capilar; ⁹Grumos – presença/ausência nos 3 primeiros jatos.",
          15,
          finalY + 6,
          { maxWidth: doc.internal.pageSize.getWidth() - 30 }
        );

        doc.setFontSize(10);
        doc.text(
          "Realizado por (iniciais): _______________________________________  Data: ______________",
          15,
          finalY + 20
        );
        doc.text(
          "Registrado por (iniciais): ______________________________________  Data: ______________",
          15,
          finalY + 30
        );
      },
      pageBreak: "auto",
      margin: { left: 15, right: 15 },
    });

    // Corrigir numeração total e garantir 2 páginas
    let total = doc.getNumberOfPages();
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

    // Preencher assinaturas na última página (se informadas)
    doc.setPage(total);
    const lastY = (doc as any).lastAutoTable?.finalY || 260;
    doc.setFont("times", "normal");
    doc.setFontSize(10);
    if (realizadoPor || realizadoData) {
      doc.text(
        `Realizado por (iniciais): ${realizadoPor || "_______________________"}  Data: ${
          realizadoData || "______________"
        }`,
        15,
        lastY + 20
      );
    }
    if (registradoPor || registradoData) {
      doc.text(
        `Registrado por (iniciais): ${registradoPor || "______________________"}  Data: ${
          registradoData || "______________"
        }`,
        15,
        lastY + 30
      );
    }

    doc.save("FOR-EC-5.0-ExameFisicoLaboratorial.pdf");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-7xl bg-white rounded-2xl shadow-lg p-6 space-y-6">
        <h1 className="text-2xl font-semibold text-center text-gray-800">5.0 – Exame Físico e Laboratorial</h1>

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

        {/* Linha nova */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          <div>
            <Label>Animal</Label>
            <Input value={novo.animal} onChange={(e) => setNovo({ ...novo, animal: e.target.value })} />
          </div>
          <div>
            <Label>OGS¹</Label>
            <select className="w-full border rounded-md h-10 px-2" value={novo.ogs} onChange={(e) => setNovo({ ...novo, ogs: e.target.value as any })}>
              <option value="">—</option>
              <option>Normal</option>
              <option>Alterado</option>
            </select>
          </div>
          <div>
            <Label>ECC² (1 a 5)</Label>
            <Input value={novo.ecc} onChange={(e) => setNovo({ ...novo, ecc: e.target.value })} placeholder="ex.: 3,25" />
          </div>
          <div>
            <Label>Hidratação</Label>
            <select className="w-full border rounded-md h-10 px-2" value={novo.hidratacao} onChange={(e) => setNovo({ ...novo, hidratacao: e.target.value as any })}>
              <option value="">—</option>
              <option>Normal</option>
              <option>Alterado</option>
            </select>
          </div>
          <div>
            <Label>TR³ (°C)</Label>
            <Input value={novo.tr} onChange={(e) => setNovo({ ...novo, tr: e.target.value })} />
          </div>
          <div>
            <Label>FC⁴ (bpm)</Label>
            <Input value={novo.fc} onChange={(e) => setNovo({ ...novo, fc: e.target.value })} />
          </div>
          <div>
            <Label>FR⁵ (mpm)</Label>
            <Input value={novo.fr} onChange={(e) => setNovo({ ...novo, fr: e.target.value })} />
          </div>
          <div>
            <Label>MR⁶ (mp2m)</Label>
            <Input value={novo.mr} onChange={(e) => setNovo({ ...novo, mr: e.target.value })} />
          </div>
          <div>
            <Label>Mucosas⁷</Label>
            <select className="w-full border rounded-md h-10 px-2" value={novo.mucosas} onChange={(e) => setNovo({ ...novo, mucosas: e.target.value as any })}>
              <option value="">—</option>
              <option value="0">0</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </select>
          </div>
          <div>
            <Label>Linfonodo</Label>
            <select className="w-full border rounded-md h-10 px-2" value={novo.linfonodo} onChange={(e) => setNovo({ ...novo, linfonodo: e.target.value as any })}>
              <option value="">—</option>
              <option>NA</option>
              <option>Normal</option>
              <option>Alterado</option>
            </select>
          </div>
          <div>
            <Label>Úbere</Label>
            <select className="w-full border rounded-md h-10 px-2" value={novo.ubre} onChange={(e) => setNovo({ ...novo, ubre: e.target.value as any })}>
              <option value="">—</option>
              <option>Normal</option>
              <option>Alterado</option>
            </select>
          </div>
          <div>
            <Label>Grumos⁹</Label>
            <select className="w-full border rounded-md h-10 px-2" value={novo.grumos} onChange={(e) => setNovo({ ...novo, grumos: e.target.value as any })}>
              <option value="">—</option>
              <option>NA</option>
              <option>Presentes</option>
              <option>Ausentes</option>
            </select>
          </div>
          <div>
            <Label>Sangue</Label>
            <select className="w-full border rounded-md h-10 px-2" value={novo.sangue} onChange={(e) => setNovo({ ...novo, sangue: e.target.value as any })}>
              <option value="">—</option>
              <option>NA</option>
              <option>Sim</option>
              <option>Não</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <Label>Obs.</Label>
            <Input value={novo.obs} onChange={(e) => setNovo({ ...novo, obs: e.target.value })} />
          </div>
          <Button variant="secondary" onClick={addLinha}>Adicionar</Button>
        </div>

        {/* Tabela */}
        {linhas.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Animal</TableHead>
                <TableHead>OGS¹</TableHead>
                <TableHead>ECC²</TableHead>
                <TableHead>Hidratação</TableHead>
                <TableHead>TR³ (°C)</TableHead>
                <TableHead>FC⁴</TableHead>
                <TableHead>FR⁵</TableHead>
                <TableHead>MR⁶</TableHead>
                <TableHead>Mucosas⁷</TableHead>
                <TableHead>Linfonodo</TableHead>
                <TableHead>Úbere</TableHead>
                <TableHead>Grumos⁹</TableHead>
                <TableHead>Sangue</TableHead>
                <TableHead>Obs.</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {linhas.map((l, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium">{l.animal}</TableCell>
                  <TableCell>{l.ogs}</TableCell>
                  <TableCell>{l.ecc}</TableCell>
                  <TableCell>{l.hidratacao}</TableCell>
                  <TableCell>{l.tr}</TableCell>
                  <TableCell>{l.fc}</TableCell>
                  <TableCell>{l.fr}</TableCell>
                  <TableCell>{l.mr}</TableCell>
                  <TableCell>{l.mucosas}</TableCell>
                  <TableCell>{l.linfonodo}</TableCell>
                  <TableCell>{l.ubre}</TableCell>
                  <TableCell>{l.grumos}</TableCell>
                  <TableCell>{l.sangue}</TableCell>
                  <TableCell className="max-w-[200px] truncate" title={l.obs}>{l.obs}</TableCell>
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
          formulário oficial. Para ficar idêntico, ajuste a imagem de LOGO no método de exportação e, se necessário,
          altere o número mínimo de linhas para calibrar a quebra entre as páginas.
        </p>
      </div>
    </div>
  );
}
