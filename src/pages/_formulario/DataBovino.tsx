import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import InputMask from "react-input-mask";

interface Linha {
  sequencial: string;
  animal: string;
  sexo: string;
  peso: string;
  ogs: string;
  ecc: string;
  sangue: string;
  brucelose: string;
  tuberculose: string;
}

const TriagemBovino = () => {
  const [data, setData] = useState("");
  const [local, setLocal] = useState("");
  const [linhas, setLinhas] = useState<Linha[]>([]);
  const [novaLinha, setNovaLinha] = useState<Linha>({
    sequencial: "",
    animal: "",
    sexo: "",
    peso: "",
    ogs: "",
    ecc: "",
    sangue: "",
    brucelose: "",
    tuberculose: "",
  });

  const handleAddLinha = () => {
    if (!novaLinha.sequencial || !novaLinha.animal) return;
    setLinhas([...linhas, novaLinha]);
    setNovaLinha({
      sequencial: "",
      animal: "",
      sexo: "",
      peso: "",
      ogs: "",
      ecc: "",
      sangue: "",
      brucelose: "",
      tuberculose: "",
    });
  };

  const handleExportarPDF = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();

    // Cabeçalho
    doc.setFont("times", "bold");
    doc.setFontSize(12);
    doc.text("LOGO", 15, 15);
    const title = "32.0 – TRIAGEM BOVINOS";
    const titleWidth = doc.getTextWidth(title);
    doc.text(title, (pageWidth - titleWidth) / 2, 15);
    doc.setFontSize(10);
    doc.setFont("times", "normal");
    doc.text("Página 1 de 1", pageWidth - 25, 10);

    doc.text("Área: Estudos clínicos", 15, 25);
    doc.text("Nº DOC.: FCR-EC-32", 90, 25);
    doc.text("Versão: 0", 160, 25);

    // Data e Local
    doc.text(`Data: ${data}`, 15, 35);
    doc.text(`Local: ${local}`, 15, 40);

    // Cabeçalho tabela
    const head = [[
      "N° Sequencial",
      "N° Animal",
      "Sexo",
      "Peso Corporal (Kg)",
      "OGS¹",
      "ECC²",
      "Coleta de Sangue³",
      "Marcação Brucelose³",
      "Teste Tuberculose³"
    ]];

    // Preenche linhas vazias até 20
    const body = [
      ...linhas.map(l => [
        l.sequencial,
        l.animal,
        l.sexo,
        l.peso,
        l.ogs,
        l.ecc,
        l.sangue,
        l.brucelose,
        l.tuberculose
      ]),
      ...Array.from({ length: Math.max(0, 20 - linhas.length) }, () => Array(9).fill(""))
    ];

    // Gera tabela com margens ajustadas
    autoTable(doc, {
      startY: 45,
      head,
      body,
      theme: "grid",
      margin: { left: 10, right: 10 },
      styles: {
        font: "times",
        fontSize: 9,
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
      },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 20 },
        2: { cellWidth: 15 },
        3: { cellWidth: 28 },
        4: { cellWidth: 15 },
        5: { cellWidth: 15 },
        6: { cellWidth: 28 },
        7: { cellWidth: 28 },
        8: { cellWidth: 28 },
      },
    });

    let finalY = (doc as any).lastAutoTable.finalY || 60;

    // Legenda
    doc.setFontSize(8);
    doc.text(
      "¹ OGS (Observações Gerais de Saúde – N: Normal; A: Alterado); ² ECC (Escore de Condição Corporal – de 1 a 5, conforme Machado et al., 2008); ³ Sim (S) ou Não (N).",
      15,
      finalY + 6,
      { maxWidth: pageWidth - 30 }
    );

    // Assinatura
    doc.setFontSize(10);
    doc.text(
      "Realizado por (Iniciais): ______________________________________",
      15,
      finalY + 16
    );
    doc.text("Data: _______________", 160, finalY + 16);

    doc.save("FCR-EC-32-TriagemBovinos.pdf");
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-gray-50">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-lg p-6 space-y-6">
        <h1 className="text-2xl font-semibold text-center">
          Triagem Bovinos
        </h1>

        {/* Campos principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Data</Label>
            <InputMask
              mask="99/99/9999"
              value={data}
              onChange={(e) => setData(e.target.value)}
            >
              {(inputProps: any) => <Input {...inputProps} />}
            </InputMask>
          </div>
          <div>
            <Label>Local</Label>
            <Input value={local} onChange={(e) => setLocal(e.target.value)} />
          </div>
        </div>

        {/* Linha de inserção */}
        <div className="grid grid-cols-9 gap-2 items-end">
          <div>
            <Label>N° Sequencial</Label>
            <Input
              value={novaLinha.sequencial}
              onChange={(e) => setNovaLinha({ ...novaLinha, sequencial: e.target.value })}
              placeholder="Ex: 01"
            />
          </div>
          <div>
            <Label>N° Animal</Label>
            <Input
              value={novaLinha.animal}
              onChange={(e) => setNovaLinha({ ...novaLinha, animal: e.target.value })}
              placeholder="Ex: 123"
            />
          </div>
          <div>
            <Label>Sexo</Label>
            <Input
              value={novaLinha.sexo}
              onChange={(e) => setNovaLinha({ ...novaLinha, sexo: e.target.value })}
              placeholder="M/F"
            />
          </div>
          <div>
            <Label>Peso Corporal</Label>
            <Input
              value={novaLinha.peso}
              onChange={(e) => setNovaLinha({ ...novaLinha, peso: e.target.value })}
              placeholder="Ex: 450"
            />
          </div>
          <div>
            <Label>OGS¹</Label>
            <Input
              value={novaLinha.ogs}
              onChange={(e) => setNovaLinha({ ...novaLinha, ogs: e.target.value })}
              placeholder="N/A"
            />
          </div>
          <div>
            <Label>ECC²</Label>
            <Input
              value={novaLinha.ecc}
              onChange={(e) => setNovaLinha({ ...novaLinha, ecc: e.target.value })}
              placeholder="1 a 5"
            />
          </div>
          <div>
            <Label>Coleta Sangue³</Label>
            <Input
              value={novaLinha.sangue}
              onChange={(e) => setNovaLinha({ ...novaLinha, sangue: e.target.value })}
              placeholder="S/N"
            />
          </div>
          <div>
            <Label>Brucelose³</Label>
            <Input
              value={novaLinha.brucelose}
              onChange={(e) => setNovaLinha({ ...novaLinha, brucelose: e.target.value })}
              placeholder="S/N"
            />
          </div>
          <div>
            <Label>Tuberculose³</Label>
            <Input
              value={novaLinha.tuberculose}
              onChange={(e) => setNovaLinha({ ...novaLinha, tuberculose: e.target.value })}
              placeholder="S/N"
            />
          </div>
        </div>

        <Button onClick={handleAddLinha} variant="secondary">
          Adicionar Linha
        </Button>

        {/* Tabela final */}
        {linhas.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N° Seq.</TableHead>
                <TableHead>N° Animal</TableHead>
                <TableHead>Sexo</TableHead>
                <TableHead>Peso (Kg)</TableHead>
                <TableHead>OGS</TableHead>
                <TableHead>ECC</TableHead>
                <TableHead>Coleta Sangue</TableHead>
                <TableHead>Brucelose</TableHead>
                <TableHead>Tuberculose</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {linhas.map((linha, index) => (
                <TableRow key={index}>
                  {Object.values(linha).map((valor, idx) => (
                    <TableCell key={idx}>{valor}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <Button
          onClick={handleExportarPDF}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold"
        >
          Exportar PDF
        </Button>
      </div>
    </div>
  );
};

export default TriagemBovino;
