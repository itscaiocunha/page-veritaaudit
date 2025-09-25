// src/pages/_formulario/Tratamento.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import jsPDF from "jspdf";
import autoTable, { RowInput } from "jspdf-autotable";

type Grupo = "Controle negativo" | "Controle positivo" | "Tratamento" | "";

interface LinhaTratamento {
  animal: string;
  pesoD1: string;
  horario: string;
  grupo: Grupo;
  volCalculado: string;
  volAdministrado: string;
  via: {
    intradermico: boolean;
    endovenoso: boolean;
    topico: boolean;
    subcutanea: boolean;
    intramuscular: boolean;
  };
}

export default function Tratamento() {
  const codigoEstudo = "00-0001-25";
  const versao = "0";
  const numeroDocumento = "FOR-EC-9";

  const [data, setData] = useState("");
  const [momento, setMomento] = useState("");

  const [linhas, setLinhas] = useState<LinhaTratamento[]>([]);
  const [novo, setNovo] = useState<LinhaTratamento>({
    animal: "",
    pesoD1: "",
    horario: "",
    grupo: "",
    volCalculado: "",
    volAdministrado: "",
    via: {
      intradermico: false,
      endovenoso: false,
      topico: false,
      subcutanea: false,
      intramuscular: false,
    },
  });

  const [realizadoPor, setRealizadoPor] = useState("");
  const [realizadoData, setRealizadoData] = useState("");
  const [registradoPor, setRegistradoPor] = useState("");
  const [registradoData, setRegistradoData] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const addLinha = () => {
    if (!novo.animal.trim()) return;
    setLinhas((prev) => [...prev, novo]);
    setNovo({
      animal: "",
      pesoD1: "",
      horario: "",
      grupo: "",
      volCalculado: "",
      volAdministrado: "",
      via: {
        intradermico: false,
        endovenoso: false,
        topico: false,
        subcutanea: false,
        intramuscular: false,
      },
    });
  };

  const removeLinha = (idx: number) =>
    setLinhas((prev) => prev.filter((_, i) => i !== idx));
  
  const viaToText = (v: LinhaTratamento["via"]) => {
    const parts: string[] = [];
    parts.push(`${v.intradermico ? "[X]" : "[ ]"} Intradérmico`);
    parts.push(`${v.endovenoso ? "[X]" : "[ ]"} Endovenoso`);
    parts.push(`${v.topico ? "[X]" : "[ ]"} Tópico`);
    parts.push(`${v.subcutanea ? "[X]" : "[ ]"} Subcutânea`);
    parts.push(`${v.intramuscular ? "[X]" : "[ ]"} Intramuscular`);
    return parts.join("\n");
  };

  const grupoToText = (g: Grupo) => {
    const opts: Exclude<Grupo, "">[] = [
      "Controle negativo",
      "Controle positivo",
      "Tratamento",
    ];
    return opts
      .map((o) => (o === g ? `[X] ${o}` : `[ ] ${o}`))
      .join("\n");
  };

  const handleExportarPDF = () => {
    // A4 HORIZONTAL
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

    // cabeçalho
    const header = (pageNum: number, totalNum: number) => {
      const pageWidth = doc.internal.pageSize.getWidth();

      doc.setFont("helvetica", "bold"); // Arial ≈ Helvetica
      doc.setFontSize(12);
      doc.text("LOGO", 15, 12); // troque por addImage()

      const title = "9.0 – TRATAMENTO";
      const titleWidth = doc.getTextWidth(title);
      doc.text(title, (pageWidth - titleWidth) / 2, 12);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Página ${pageNum} de ${totalNum}`, pageWidth - 25, 8);

      doc.text("Área: Estudos clínicos", 15, 20);
      doc.text(`N° DOC.: ${numeroDocumento}`, 120, 20);
      doc.text(`Versão: ${versao}`, pageWidth - 30, 20, { align: "right" });

      doc.setFontSize(11);
      doc.text(`Código do estudo: ${codigoEstudo}`, 15, 28);
      doc.text(`Data: ${data || "___________________"}`, 120, 28);
      doc.text(`Momento: ${momento || "_______________"}`, pageWidth - 15, 28, { align: "right" });
    };

    const head = [
      [
        "Animal",
        "Peso (D-1)¹",
        "Horário",
        "Grupo²",
        "Volume Calculado (mL)",
        "Volume Administrado (mL)",
        "Local/Via",
      ],
    ];

    const body: RowInput[] = linhas.map((l) => [
      l.animal,
      l.pesoD1,
      l.horario,
      grupoToText(l.grupo),
      l.volCalculado,
      l.volAdministrado,
      viaToText(l.via),
    ]);

    // const linhasMinimas = 8;
    // while (body.length < Math.max(linhasMinimas, linhas.length)) {
    //   body.push([
    //     "", "", "",
    //     "[ ] Controle negativo\n[ ] Controle positivo\n[ ] Tratamento",
    //     "", "",
    //     "[ ] Intradérmico\n[ ] Endovenoso\n[ ] Tópico\n[ ] Subcutânea\n[ ] Intramuscular",
    //   ]);
    // }

    autoTable(doc, {
      startY: 36,
      head,
      body,
      theme: "grid",
      styles: {
        font: "helvetica",   
        fontSize: 9,
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
        fontSize: 9,
        valign: "middle",
      },
      columnStyles: {
        0: { cellWidth: 28, halign: "left" },
        1: { cellWidth: 25 },
        2: { cellWidth: 22 },
        3: { cellWidth: 55, halign: "left" },
        4: { cellWidth: 38 },
        5: { cellWidth: 40 },
        6: { cellWidth: 59, halign: "left" },
      },
      margin: { top: 36, left: 15, right: 15, bottom: 20 },
      didDrawPage: () => {
        header(doc.getNumberOfPages(), doc.getNumberOfPages());

        const finalY = (doc as any).lastAutoTable?.finalY || 180;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.text(
          "Observações: ¹Transcrito do Formulário 4 – Pesagem dos animais; ²Transcrito do Formulário 8 – Randomização.",
          15,
          finalY + 8,
          { maxWidth: doc.internal.pageSize.getWidth() - 30 }
        );

        doc.setFontSize(10);
        // doc.text(
        //   "Realizado por (iniciais): ________________________________________  Data: ________________",
        //   15,
        //   finalY + 22
        // );
        // doc.text(
        //   "Registrado por (iniciais): _______________________________________  Data: ________________",
        //   15,
        //   finalY + 32
        // );
      },
      pageBreak: "auto",
    });

    // corrige numeração em todas as páginas
    const total = doc.getNumberOfPages();
    for (let i = 1; i <= total; i++) {
      doc.setPage(i);
      const w = doc.internal.pageSize.getWidth();
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Página ${i} de ${total}`, w - 25, 8);
    }

    // sobrescreve assinaturas com valores (se preenchidos)
    doc.setPage(total);
    const lastY = (doc as any).lastAutoTable?.finalY || 180;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    if (realizadoPor || realizadoData) {
      doc.text(
        `Realizado por (iniciais): ${realizadoPor || "________________________"}  Data: ${realizadoData || "______________"}`,
        15,
        lastY + 22
      );
    }
    if (registradoPor || registradoData) {
      doc.text(
        `Registrado por (iniciais): ${registradoPor || "_______________________"}  Data: ${registradoData || "______________"}`,
        15,
        lastY + 32
      );
    }

    doc.save("FOR-EC-9.0-Tratamento.pdf");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-lg p-6 space-y-6">
        <h1 className="text-2xl font-semibold text-center text-gray-800">9.0 – Tratamento</h1>

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
            <Label>Momento</Label>
            <Input placeholder="Ex.: D0, D1, D7" value={momento} onChange={(e) => setMomento(e.target.value)} />
          </div>
        </div>

        {/* Linha nova */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          <div className="md:col-span-2">
            <Label>Animal</Label>
            <Input value={novo.animal} onChange={(e) => setNovo({ ...novo, animal: e.target.value })} />
          </div>
          <div>
            <Label>Peso (D-1)¹</Label>
            <Input value={novo.pesoD1} onChange={(e) => setNovo({ ...novo, pesoD1: e.target.value })} />
          </div>
          <div>
            <Label>Horário</Label>
            <Input value={novo.horario} onChange={(e) => setNovo({ ...novo, horario: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <Label>Grupo²</Label>
            <select
              className="w-full border rounded-md h-10 px-2"
              value={novo.grupo}
              onChange={(e) => setNovo({ ...novo, grupo: e.target.value as Grupo })}
            >
              <option value="">—</option>
              <option>Controle negativo</option>
              <option>Controle positivo</option>
              <option>Tratamento</option>
            </select>
          </div>
          <div>
            <Label>Vol. Calculado (mL)</Label>
            <Input value={novo.volCalculado} onChange={(e) => setNovo({ ...novo, volCalculado: e.target.value })} />
          </div>
          <div>
            <Label>Vol. Administrado (mL)</Label>
            <Input value={novo.volAdministrado} onChange={(e) => setNovo({ ...novo, volAdministrado: e.target.value })} />
          </div>
          <div className="md:col-span-3">
            <Label>Local/Via</Label>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={novo.via.intradermico}
                  onChange={() => setNovo({ ...novo, via: { ...novo.via, intradermico: !novo.via.intradermico } })} />
                Intradérmico
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={novo.via.endovenoso}
                  onChange={() => setNovo({ ...novo, via: { ...novo.via, endovenoso: !novo.via.endovenoso } })} />
                Endovenoso
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={novo.via.topico}
                  onChange={() => setNovo({ ...novo, via: { ...novo.via, topico: !novo.via.topico } })} />
                Tópico
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={novo.via.subcutanea}
                  onChange={() => setNovo({ ...novo, via: { ...novo.via, subcutanea: !novo.via.subcutanea } })} />
                Subcutânea
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={novo.via.intramuscular}
                  onChange={() => setNovo({ ...novo, via: { ...novo.via, intramuscular: !novo.via.intramuscular } })} />
                Intramuscular
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
                <TableHead>Peso (D-1)¹</TableHead>
                <TableHead>Horário</TableHead>
                <TableHead>Grupo²</TableHead>
                <TableHead>Vol. Calc. (mL)</TableHead>
                <TableHead>Vol. Admin. (mL)</TableHead>
                <TableHead>Local/Via</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {linhas.map((l, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium">{l.animal}</TableCell>
                  <TableCell>{l.pesoD1}</TableCell>
                  <TableCell>{l.horario}</TableCell>
                  <TableCell>{grupoToText(l.grupo)}</TableCell>
                  <TableCell>{l.volCalculado}</TableCell>
                  <TableCell>{l.volAdministrado}</TableCell>
                  <TableCell>{viaToText(l.via)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" onClick={() => removeLinha(idx)}>Remover</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Observações */}
        <div>
          <Label>Observações</Label>
          <Input value={observacoes} onChange={(e) => setObservacoes(e.target.value)} placeholder="Observações gerais do tratamento" />
        </div>

        {/* Assinaturas */}
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

        {/* Exportação */}
        <Button className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold" onClick={handleExportarPDF}>
          Exportar PDF
        </Button>

        <p className="text-xs text-gray-500 leading-relaxed">
          ¹ Transcrito do Formulário 4 - Pesagem; ² Transcrito do Formulário 8 - Randomização.
        </p>
      </div>
    </div>
  );
}
