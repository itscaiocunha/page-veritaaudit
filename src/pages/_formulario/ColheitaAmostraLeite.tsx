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
import autoTable, { CellInput, RowInput } from 'jspdf-autotable';

// --- Tipos de Dados ---
type CmtOpcao = "" | "NEG" | "+" | "++" | "+++";

interface LinhaLeite {
  animal: string;
  horario: string;
  grumos: "Presentes" | "Ausentes" | "";
  cmtAplicavel: boolean;
  cmtNA: boolean;
  cmt: { q1: CmtOpcao; q2: CmtOpcao; q3: CmtOpcao; q4: CmtOpcao };
  coletou: "Sim" | "Nao" | "";
  volume: string;
  tipoAmostra: { unica: boolean; prova: boolean; contraprova: boolean };
  realizadoPor: string;
}

// --- Componente Principal ---
export default function ColheitaAmostraLeite() {
  const codigoEstudo = "00-0001-25";
  const numeroDocumento = "FOR-EC-20";
  const versao = "0";

  const [data, setData] = useState("");
  const [momento, setMomento] = useState("");

  const [linhas, setLinhas] = useState<LinhaLeite[]>([]);
  const [novo, setNovo] = useState<LinhaLeite>({
    animal: "",
    horario: "",
    grumos: "",
    cmtAplicavel: true,
    cmtNA: false,
    cmt: { q1: "", q2: "", q3: "", q4: "" },
    coletou: "",
    volume: "",
    tipoAmostra: { unica: false, prova: false, contraprova: false },
    realizadoPor: "",
  });

  const addLinha = () => {
    if (!novo.animal.trim()) return;
    setLinhas((prev) => [...prev, novo]);
    setNovo({
      animal: "", horario: "", grumos: "", cmtAplicavel: true, cmtNA: false,
      cmt: { q1: "", q2: "", q3: "", q4: "" }, coletou: "", volume: "",
      tipoAmostra: { unica: false, prova: false, contraprova: false }, realizadoPor: "",
    });
  };

  const removeLinha = (idx: number) => setLinhas((prev) => prev.filter((_, i) => i !== idx));

  const handleExportarPDF = () => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;

    const printHeader = (pageNum: number, totalPages: number) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.rect(margin, 12, 35, 16);
      doc.text("LOGO", margin + 17.5, 22, { align: "center" });
      doc.rect(margin + 35, 12, pageWidth - (margin * 2) - 50, 16);
      doc.text("20.0 - COLHEITA DE AMOSTRA DE LEITE", pageWidth / 2 - 7.5, 22, { align: "center" });
      doc.rect(pageWidth - margin - 15, 12, 15, 16);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(`Pág ${pageNum}/${totalPages}`, pageWidth - margin - 7.5, 22, { align: "center" });
      doc.rect(margin, 28, 50, 8);
      doc.text("Área: Estudos Clínicos", margin + 2, 33);
      doc.rect(margin + 50, 28, pageWidth - (margin * 2) - 80, 8);
      doc.text(`N° DOC.: ${numeroDocumento}`, margin + 52, 33);
      doc.rect(pageWidth - margin - 30, 28, 30, 8);
      doc.text(`Versão: ${versao}`, pageWidth - margin - 28, 33);
      doc.rect(margin, 38, pageWidth - (margin * 2), 12);
      doc.text(`Código do estudo: ${codigoEstudo}`, margin + 2, 43);
      doc.text(`Data: ${data || "___/___/____"}`, pageWidth / 2 - 20, 43);
      doc.text(`Momento: D ${momento || "____"}`, pageWidth - margin - 40, 43);
    };

    const head: RowInput[] = [
      [
        { content: 'ANIMAL', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
        { content: 'Horário (HH:MM)', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
        { content: 'Teste Caneca Fundo Preto\n(Grumos)¹', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
        { content: 'CMT²', colSpan: 4, styles: { halign: 'center' } },
        { content: 'Coletou amostra?', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
        { content: 'Amostra', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
        { content: 'Realizado por (iniciais)', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
      ],
      ['1º', '2º', '3º', '4º'],
    ];

    const body: RowInput[] = linhas.map(l => [
        l.animal,
        l.horario,
        { content: '', data: { type: 'grumos', value: l.grumos } },
        { content: l.cmt.q1, data: { type: 'cmt' } },
        { content: l.cmt.q2, data: { type: 'cmt' } },
        { content: l.cmt.q3, data: { type: 'cmt' } },
        { content: l.cmt.q4, data: { type: 'cmt' } },
        { content: '', data: { type: 'coleta', value: l.coletou, volume: l.volume } },
        { content: '', data: { type: 'amostra', value: l.tipoAmostra } },
        l.realizadoPor,
    ]);

    autoTable(doc, {
      startY: 52,
      head: head,
      body: body,
      theme: 'grid',
      styles: { 
          font: "helvetica", 
          fontSize: 8, 
          cellPadding: 1, 
          halign: 'center', 
          valign: 'middle'
      },
      // <<< CORREÇÃO AQUI >>>
      bodyStyles: {
          minCellHeight: 22 // Aplica a altura mínima apenas nas linhas do corpo
      },
      headStyles: { fontStyle: 'bold', fillColor: [220, 220, 220], textColor: 0 },
      columnStyles: {
          0: { cellWidth: 20 }, 2: { cellWidth: 20 }, 7: { cellWidth: 30 }, 8: { cellWidth: 25 }, 9: {cellWidth: 15}
      },
      didDrawPage: (data) => printHeader(data.pageNumber, doc.getNumberOfPages()),
      didDrawCell: (data) => {
          const { cell, row } = data;
          const cellData = (cell.raw as CellInput & { data?: any })?.data;
          
          if (row.section === 'body' && cellData) {
              doc.setFontSize(8);
              const drawCheckbox = (x: number, y: number, text: string, checked: boolean) => {
                  doc.rect(x, y - 2.5, 3, 3);
                  if (checked) { doc.setFont('helvetica', 'bold'); doc.text('X', x + 0.8, y + 0.5); doc.setFont('helvetica', 'normal'); }
                  doc.text(text, x + 4, y);
              };

              if (cellData.type === 'grumos') {
                  const yPos1 = cell.y + cell.height * 0.33;
                  const yPos2 = cell.y + cell.height * 0.66;
                  drawCheckbox(cell.x + 2, yPos1, "Presentes", cellData.value === 'Presentes');
                  drawCheckbox(cell.x + 2, yPos2, "Ausentes", cellData.value === 'Ausentes');
              } else if (cellData.type === 'coleta') {
                  const yPos1 = cell.y + cell.height * 0.33;
                  const yPos2 = cell.y + cell.height * 0.66;
                  drawCheckbox(cell.x + 2, yPos1, `Sim, ${cellData.volume || '___'} mL`, cellData.value === 'Sim');
                  drawCheckbox(cell.x + 2, yPos2, "Não", cellData.value === 'Nao');
              } else if (cellData.type === 'amostra') {
                  const yPos1 = cell.y + cell.height * 0.25;
                  const yPos2 = cell.y + cell.height * 0.50;
                  const yPos3 = cell.y + cell.height * 0.75;
                  drawCheckbox(cell.x + 2, yPos1, "Única", cellData.value.unica);
                  drawCheckbox(cell.x + 2, yPos2, "Prova", cellData.value.prova);
                  drawCheckbox(cell.x + 2, yPos3, "Contraprova", cellData.value.contraprova);
              }
          }
      },
    });

    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        printHeader(i, totalPages);
    }

    doc.save("FOR-EC-20.0-Colheita-Leite.pdf");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-7xl bg-white rounded-2xl shadow-lg p-6 space-y-6">
        <h1 className="text-2xl font-semibold text-center text-gray-800">20.0 – Colheita de Amostra de Leite</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><Label>Código do Estudo</Label><Input value={codigoEstudo} readOnly disabled /></div>
            <div><Label>Data</Label><Input type="date" value={data} onChange={e => setData(e.target.value)} /></div>
            <div><Label>Momento (D)</Label><Input value={momento} onChange={e => setMomento(e.target.value)} placeholder="Ex: 0, 7, 14..."/></div>
        </div>

        {linhas.length > 0 && (
            <Table>
                <TableHeader><TableRow><TableHead>Animal</TableHead><TableHead>Horário</TableHead><TableHead>Grumos</TableHead><TableHead>CMT</TableHead><TableHead>Coleta</TableHead><TableHead>Amostra</TableHead><TableHead>Por</TableHead><TableHead></TableHead></TableRow></TableHeader>
                <TableBody>
                    {linhas.map((l, i) => (
                        <TableRow key={i}>
                            <TableCell>{l.animal}</TableCell>
                            <TableCell>{l.horario}</TableCell>
                            <TableCell>{l.grumos}</TableCell>
                            <TableCell>{`1º:${l.cmt.q1} 2º:${l.cmt.q2} 3º:${l.cmt.q3} 4º:${l.cmt.q4}`}</TableCell>
                            <TableCell>{l.coletou === 'Sim' ? `${l.volume} mL` : l.coletou}</TableCell>
                            <TableCell>{Object.entries(l.tipoAmostra).filter(([,v]) => v).map(([k]) => k).join(', ')}</TableCell>
                            <TableCell>{l.realizadoPor}</TableCell>
                            <TableCell><Button variant="ghost" size="sm" onClick={() => removeLinha(i)}>Remover</Button></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        )}

        <div className="border p-4 rounded-lg space-y-4">
            <h2 className="text-lg font-medium">Adicionar Registro</h2>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                <div className="md:col-span-2"><Label>Animal</Label><Input value={novo.animal} onChange={e => setNovo({...novo, animal: e.target.value})}/></div>
                <div className="md:col-span-1"><Label>Horário</Label><Input type="time" value={novo.horario} onChange={e => setNovo({...novo, horario: e.target.value})}/></div>
                <div className="md:col-span-1"><Label>Grumos</Label><select className="w-full border rounded-md h-10 px-2" value={novo.grumos} onChange={e => setNovo({...novo, grumos: e.target.value as any})}><option value="">-</option><option>Presentes</option><option>Ausentes</option></select></div>
                <div className="md:col-span-2"><Label>CMT</Label><div className="flex gap-1">{(['q1','q2','q3','q4'] as const).map(q => <Input key={q} className="w-12" placeholder={q} value={novo.cmt[q]} onChange={e => setNovo({...novo, cmt: {...novo.cmt, [q]: e.target.value as CmtOpcao}})} />)}</div></div>
                <div className="md:col-span-2"><Label>Coleta</Label><div className="flex items-center gap-2"><select className="border rounded h-10 px-1" value={novo.coletou} onChange={e => setNovo({...novo, coletou: e.target.value as any})}><option value="">-</option><option>Sim</option><option>Nao</option></select><Input placeholder="mL" disabled={novo.coletou !== 'Sim'} value={novo.volume} onChange={e => setNovo({...novo, volume: e.target.value})} /></div></div>
                <div className="md:col-span-2 text-sm"><Label>Amostra</Label><div className="grid grid-cols-2 gap-1"><label className="flex items-center gap-1"><input type="checkbox" checked={novo.tipoAmostra.unica} onChange={() => setNovo({...novo, tipoAmostra: {...novo.tipoAmostra, unica: !novo.tipoAmostra.unica}})}/>Única</label><label className="flex items-center gap-1"><input type="checkbox" checked={novo.tipoAmostra.prova} onChange={() => setNovo({...novo, tipoAmostra: {...novo.tipoAmostra, prova: !novo.tipoAmostra.prova}})}/>Prova</label><label className="flex items-center gap-1"><input type="checkbox" checked={novo.tipoAmostra.contraprova} onChange={() => setNovo({...novo, tipoAmostra: {...novo.tipoAmostra, contraprova: !novo.tipoAmostra.contraprova}})}/>Contraprova</label></div></div>
                <div className="md:col-span-1"><Label>Por</Label><Input value={novo.realizadoPor} onChange={e => setNovo({...novo, realizadoPor: e.target.value})}/></div>
                
                <Button variant="secondary" onClick={addLinha}>Adicionar</Button>
            </div>
        </div>
        
        <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold" onClick={handleExportarPDF} disabled={linhas.length === 0}>Exportar PDF</Button>
      </div>
    </div>
  );
}