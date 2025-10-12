// src/pages/_formulario/ColheitaMatriz.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import jsPDF from "jspdf";
import autoTable, { CellInput, RowInput } from "jspdf-autotable";

/**
 * FOR-EC-19.0 – COLHEITA DE MATRIZ DE TECIDO E PROCESSAMENTO DE AMOSTRA
 * - Exporta em A4 (portrait), replicando o layout exato do formulário.
 */

type Matriz = "Gordura" | "Músculo" | "Rins" | "Fígado" | "";

interface Linha {
  animal: string;
  matriz: Matriz;
  coletada: "Sim" | "Não" | "";
  amostraProva: boolean;
  amostraContraprova: boolean;
  peso: string;                 // g
  horaAbate: string;            // HH:MM 24h
  procInicio: string;           // HH:MM 24h
  procTermino: string;          // HH:MM 24h
  realizadoPor: string;         // iniciais
}

export default function ColheitaMatriz() {
  // Cabeçalho fixo
  const codigoEstudo = "00-0001-25";
  const versao = "0";
  const numeroDocumento = "FOR-EC-19";

  // Cabeçalho variável
  const [data, setData] = useState("10/10/2025");
  const [momento, setMomento] = useState("2");
  const [grupo, setGrupo] = useState("2");

  // Linhas
  const [linhas, setLinhas] = useState<Linha[]>([
     // Dados de exemplo para teste
    { animal: 'Boi', matriz: 'Gordura', coletada: 'Sim', amostraProva: true, amostraContraprova: false, peso: '100', horaAbate: '10:00', procInicio: '10:00', procTermino: '10:00', realizadoPor: 'CA' },
    { animal: 'Boi', matriz: 'Músculo', coletada: '', amostraProva: false, amostraContraprova: false, peso: '', horaAbate: '10:00', procInicio: '10:00', procTermino: '10:00', realizadoPor: 'CA' },
  ]);
  const [novo, setNovo] = useState<Linha>({
    animal: "", matriz: "", coletada: "", amostraProva: false, amostraContraprova: false, peso: "", horaAbate: "", procInicio: "", procTermino: "", realizadoPor: "",
  });

  const addLinha = () => {
    if (!novo.animal.trim() || !novo.matriz) return;
    setLinhas((prev) => [...prev, novo]);
    setNovo({
      animal: "", matriz: "", coletada: "", amostraProva: false, amostraContraprova: false, peso: "", horaAbate: "", procInicio: "", procTermino: "", realizadoPor: "",
    });
  };

  const removeLinha = (idx: number) =>
    setLinhas((prev) => prev.filter((_, i) => i !== idx));

  const handleExportarPDF = () => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;

    const printHeader = (pageNum: number, totalPages: number) => {
        const firstLineY = 18;
        doc.setFont("helvetica", "bold"); doc.setFontSize(12); doc.setDrawColor(0);
        doc.rect(margin, 12, 35, 16);
        doc.text("LOGO", margin + 17.5, firstLineY + 2, { align: "center", baseline: "middle" });
        doc.rect(margin + 35, 12, pageWidth - (margin * 2) - 50, 16);
        doc.text("19.0 – COLHEITA DE MATRIZ DE TECIDO E PROCESSAMENTO DE", pageWidth / 2 - 7.5, firstLineY - 1, { align: "center" });
        doc.text("AMOSTRA", pageWidth / 2 - 7.5, firstLineY + 5, { align: "center" });
        doc.rect(pageWidth - margin - 15, 12, 15, 16);
        doc.setFont("helvetica", "normal"); doc.setFontSize(9);
        doc.text(`Página ${pageNum} de ${totalPages}`, pageWidth - margin - 7.5, firstLineY + 2, { align: "center", baseline: "middle" });
        const secondLineY = 32;
        doc.rect(margin, 28, 35, 8); doc.text("Área: Estudos Clínicos", margin + 2, secondLineY);
        doc.rect(margin + 35, 28, pageWidth - (margin * 2) - 50, 8);
        doc.text(`N° DOC.: ${numeroDocumento}`, margin + 37, secondLineY);
        doc.rect(pageWidth - margin - 15, 28, 15, 8); doc.text(`Versão: ${versao}`, pageWidth - margin - 13, secondLineY);
        doc.rect(margin, 38, pageWidth - (margin * 2), 12);
        doc.text(`Código do estudo: ${codigoEstudo}`, margin + 2, 43);
        doc.text(`Data: ${data || "__________________"}`, pageWidth / 2, 43);
        doc.text(`Momento: D ${momento || "____"}`, margin + 2, 48);
        doc.text(`Grupo: ${grupo || "__________________"}`, pageWidth / 2, 48);
    };

    const animais = new Map<string, Linha[]>();
    linhas.forEach(l => {
      if (!animais.has(l.animal)) animais.set(l.animal, []);
      animais.get(l.animal)?.push(l);
    });

    const head: RowInput[] = [
      [
        { content: 'ABATE E COLETA', colSpan: 3, styles: { fillColor: [220, 220, 220], halign: 'center' } },
        { content: 'Processamento dos tecidos', rowSpan: 2 },
        { content: 'Checklist das amostras*', rowSpan: 2 },
        { content: 'Peso (g)', rowSpan: 2 },
        { content: 'Realizado por (iniciais)', rowSpan: 2 },
      ],
      [
        { content: 'ANIMAL', styles: { fillColor: [220, 220, 220] } },
        { content: 'Matriz', styles: { fillColor: [220, 220, 220] } },
        { content: 'Coletada?', styles: { fillColor: [220, 220, 220] } },
      ]
    ];

    const body: RowInput[] = [];
    const todasMatrizes: Matriz[] = ["Gordura", "Músculo", "Rins", "Fígado"];

    animais.forEach((dadosAnimal, nomeAnimal) => {
      const primeiroRegistro = dadosAnimal[0];
      todasMatrizes.forEach((matriz, index) => {
        const registroMatriz = dadosAnimal.find(d => d.matriz === matriz);
        const row: CellInput[] = [];

        if (index === 0) {
          row.push({
            content: `${nomeAnimal}\n\nHora do abate\n(HH:MM 24h)\n${primeiroRegistro?.horaAbate ?? ''}`,
            rowSpan: 4,
          });
        }
        row.push({ content: matriz, data: { checked: !!registroMatriz?.matriz } });
        row.push({ content: '', data: { coletada: registroMatriz?.coletada ?? '' } });
        if (index === 0) {
          row.push({
            content: `\nInício\n(HH:MM 24h)\n${primeiroRegistro?.procInicio ?? ''}\n\nTérmino\n(HH:MM 24h)\n${primeiroRegistro?.procTermino ?? ''}`,
            rowSpan: 4
          });
        }
        row.push({ content: '', data: { prova: registroMatriz?.amostraProva ?? false, contraprova: registroMatriz?.amostraContraprova ?? false } });
        row.push({ content: registroMatriz?.peso ?? '' });
        if (index === 0) {
          row.push({ content: primeiroRegistro?.realizadoPor ?? '', rowSpan: 4 });
        }
        body.push(row);
      });
    });

    autoTable(doc, {
      startY: 52,
      head,
      body,
      theme: 'grid',
      styles: { font: "helvetica", fontSize: 9, cellPadding: 1 },
      headStyles: { halign: 'center', fontStyle: 'bold', fillColor: [220, 220, 220], textColor: [0, 0, 0] },
      columnStyles: {
        0: { cellWidth: 35, halign: 'center', valign: 'middle' },
        1: { cellWidth: 25, halign: 'left', valign: 'middle' },
        2: { cellWidth: 20, halign: 'left', valign: 'middle' },
        3: { cellWidth: 30, halign: 'center', valign: 'middle', fontSize: 8 },
        4: { cellWidth: 35, halign: 'left', valign: 'middle' },
        5: { cellWidth: 15, halign: 'center', valign: 'middle' },
        6: { cellWidth: 20, halign: 'center', valign: 'middle' },
      },
      margin: { left: margin, right: margin },
      didDrawCell: (data) => {
        const { cell } = data;
        const cellData = (cell.raw as any)?.data;
        if (!cellData) return;

        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);

        const drawCheckbox = (x: number, y: number, text: string, checked: boolean) => {
          doc.rect(x, y - 2.5, 3, 3);
          if (checked) {
            doc.setFont('helvetica', 'bold'); doc.text('X', x + 0.8, y + 0.5); doc.setFont('helvetica', 'normal');
          }
          doc.text(text, x + 4, y);
        };

        if (data.column.index === 1) { // Matriz
          drawCheckbox(cell.x + 2, cell.y + cell.height / 2, (cell.raw as any).content as string, cellData.checked);
        }
        if (data.column.index === 2) { // Coletada?
          drawCheckbox(cell.x + 2, cell.y + 4, "Sim", cellData.coletada === 'Sim');
          drawCheckbox(cell.x + 2, cell.y + 10, "Não", cellData.coletada === 'Não');
        }
        if (data.column.index === 4) { // Checklist
          drawCheckbox(cell.x + 2, cell.y + 4, "Prova", cellData.prova);
          drawCheckbox(cell.x + 2, cell.y + 10, "Contraprova", cellData.contraprova);
        }
      },
      didDrawPage: (data) => {
        printHeader(data.pageNumber, doc.getNumberOfPages());
      }
    });

    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      printHeader(i, totalPages);
    }

    doc.save("FOR-EC-19.0-ColheitaMatriz.pdf");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-7xl bg-white rounded-2xl shadow-lg p-6 space-y-6">
        <h1 className="text-2xl font-semibold text-center text-gray-800">19.0 – Colheita de Matriz de Tecido e Processamento de Amostra</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><Label>Código do Estudo</Label><Input value={codigoEstudo} readOnly disabled /></div>
          <div><Label>Data</Label><Input placeholder="DD/MM/AAAA" value={data} onChange={(e) => setData(e.target.value)} /></div>
          <div><Label>Momento (D)</Label><Input placeholder="Ex.: 0, 1, 7..." value={momento} onChange={(e) => setMomento(e.target.value)} /></div>
          <div className="md:col-span-3"><Label>Grupo</Label><Input placeholder="Ex.: Controle / Tratamento A" value={grupo} onChange={(e) => setGrupo(e.target.value)} /></div>
        </div>
        <div className="border p-4 rounded-lg space-y-4">
          <h2 className="text-lg font-medium">Adicionar Registro</h2>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            <div className="md:col-span-2"><Label>Animal</Label><Input value={novo.animal} onChange={(e) => setNovo({ ...novo, animal: e.target.value })} /></div>
            <div className="md:col-span-2"><Label>Matriz</Label><select className="w-full border rounded-md h-10 px-2" value={novo.matriz} onChange={(e) => setNovo({ ...novo, matriz: e.target.value as Matriz })}> <option value="">—</option> <option>Gordura</option> <option>Músculo</option> <option>Rins</option> <option>Fígado</option> </select></div>
            <div><Label>Coletada?</Label><select className="w-full border rounded-md h-10 px-2" value={novo.coletada} onChange={(e) => setNovo({ ...novo, coletada: e.target.value as Linha["coletada"] })}> <option value="">—</option> <option>Sim</option> <option>Não</option> </select></div>
            <div className="md:col-span-2"><Label>Amostras</Label><div className="grid grid-cols-2 gap-2 text-sm pt-2"><label className="flex items-center gap-2"><input type="checkbox" checked={novo.amostraProva} onChange={() => setNovo({ ...novo, amostraProva: !novo.amostraProva })} /> Prova</label><label className="flex items-center gap-2"><input type="checkbox" checked={novo.amostraContraprova} onChange={() => setNovo({ ...novo, amostraContraprova: !novo.amostraContraprova })} /> Contraprova</label></div></div>
            <div><Label>Peso (g)</Label><Input value={novo.peso} onChange={(e) => setNovo({ ...novo, peso: e.target.value })} /></div>
            <div><Label>Hora abate</Label><Input placeholder="HH:MM" value={novo.horaAbate} onChange={(e) => setNovo({ ...novo, horaAbate: e.target.value })} /></div>
            <div><Label>Proc. Início</Label><Input placeholder="HH:MM" value={novo.procInicio} onChange={(e) => setNovo({ ...novo, procInicio: e.target.value })} /></div>
            <div><Label>Proc. Término</Label><Input placeholder="HH:MM" value={novo.procTermino} onChange={(e) => setNovo({ ...novo, procTermino: e.target.value })} /></div>
            <div><Label>Realiz. por</Label><Input value={novo.realizadoPor} onChange={(e) => setNovo({ ...novo, realizadoPor: e.target.value })} /></div>
            <Button variant="secondary" onClick={addLinha}> Adicionar </Button>
          </div>
        </div>
        {linhas.length > 0 && (
          <Table>
            <TableHeader><TableRow><TableHead>Animal</TableHead><TableHead>Matriz</TableHead><TableHead>Coletada?</TableHead><TableHead>Checklist</TableHead><TableHead>Peso (g)</TableHead><TableHead>Hora do abate</TableHead><TableHead>Proc. Início</TableHead><TableHead>Proc. Término</TableHead><TableHead>Realizado por</TableHead><TableHead></TableHead></TableRow></TableHeader>
            <TableBody>
              {linhas.map((l, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium">{l.animal}</TableCell><TableCell>{l.matriz}</TableCell><TableCell>{l.coletada}</TableCell>
                  <TableCell>{(l.amostraProva ? "P" : "")}{(l.amostraProva && l.amostraContraprova) ? " / " : ""}{(l.amostraContraprova ? "CP" : "")}</TableCell>
                  <TableCell>{l.peso}</TableCell><TableCell>{l.horaAbate}</TableCell><TableCell>{l.procInicio}</TableCell><TableCell>{l.procTermino}</TableCell>
                  <TableCell>{l.realizadoPor}</TableCell>
                  <TableCell className="text-right"><Button variant="ghost" size="sm" onClick={() => removeLinha(idx)}>Remover</Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold" onClick={handleExportarPDF} disabled={linhas.length === 0} title={linhas.length === 0 ? "Adicione ao menos uma linha para exportar" : ""}>Exportar PDF</Button>
      </div>
    </div>
  );
}