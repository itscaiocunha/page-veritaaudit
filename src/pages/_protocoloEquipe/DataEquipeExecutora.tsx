import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Membro {
  nome: string;
  cargo: string;
  iniciais: string;
  treinamento: string;
  cego: string;
}

const DataEquipeExecutora = () => {
  const [membros, setMembros] = useState<Membro[]>([]);
  const [novoMembro, setNovoMembro] = useState<Membro>({
    nome: "",
    cargo: "",
    iniciais: "",
    treinamento: "Não",
    cego: "Não",
  });

  const codigoEstudo = "00-0001-25";
  const versao = "01-03.09.2025";

  const handleAddMembro = () => {
    if (!novoMembro.nome || !novoMembro.cargo) return;
    setMembros([...membros, novoMembro]);
    setNovoMembro({ nome: "", cargo: "", iniciais: "", treinamento: "Não", cego: "Não" });
  };

  const handleExportarPDF = () => {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  // === Cabeçalho ===
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setFont("times", "bold");
  doc.setFontSize(12);
  doc.text("LOGO", 15, 15); // Substituir por addImage() depois

  const title = "1.0 – REGISTRO DA EQUIPE EXECUTORA";
  const textWidth = doc.getTextWidth(title);
  doc.text(title, (pageWidth - textWidth) / 2, 15); // Centralizado

  doc.setFontSize(10);
  doc.setFont("times", "normal");
  doc.text("Página 1 de 1", pageWidth - 25, 10);

  doc.text("Área: Estudos clínicos", 15, 25);
  doc.text("Nº DOC.: FOR-EC-1", 120, 25);
  doc.text(`Versão: ${versao}`, 240, 25);

  // === Código do estudo ===
  doc.setFontSize(11);
  doc.text(`Código do estudo: ${codigoEstudo}`, 15, 35);

  // === Cabeçalho da Tabela ===
  const tableHead = [["NOME", "CARGO¹", "INICIAIS", "Treinamento²", "Cego ao Tratamento³"]];

  // Gera 10 linhas fixas
  const linhasTabela = Array.from({ length: 10 }, (_, i) => {
    const m = membros[i];
    return [
      m?.nome || "",
      m?.cargo || "",
      m?.iniciais || "",
      m ? m.treinamento : "",
      m ? m.cego : "",
    ];
  });

  autoTable(doc, {
    startY: 42,
    head: tableHead,
    body: linhasTabela,
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
      0: { cellWidth: 90, halign: "left" },
      1: { cellWidth: 45, halign: "left" },
      2: { cellWidth: 25 },
      3: { cellWidth: 50 },
      4: { cellWidth: 50 },
    },
  });

  let finalY = (doc as any).lastAutoTable.finalY || 60;

  // === Legenda ===
  doc.setFont("times", "normal");
  doc.setFontSize(8);
  doc.text("Legenda:", 15, finalY + 6);
  doc.text(
    "¹ Cargo: Investigador, Veterinário, Técnico, Campeiro, Auxiliar, Estagiário etc.",
    15,
    finalY + 11
  );
  doc.text(
    "² Treinamento: Capacitação da equipe frente ao Protocolo do Estudo a Campo e os Procedimentos Operacionais Padrões envolvidos no estudo.",
    15,
    finalY + 16,
    { maxWidth: pageWidth - 30 }
  );
  doc.text(
    "³ Cego ao Tratamento: os envolvidos não conhecem em que grupo, controle e experimental foi realizada a intervenção. Detalhes da pesquisa ficam no anonimato de maneira a evitar tendências.",
    15,
    finalY + 21,
    { maxWidth: pageWidth - 30 }
  );

  // === Assinatura ===
  doc.setFontSize(10);
  doc.text(
    "Investigador (iniciais): ______________________________________",
    15,
    finalY + 35
  );
  doc.text("Data: ___________", 200, finalY + 35);

  // Salvar PDF
  doc.save("FOR-EC-1.0-EquipeExecutora.pdf");
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg p-6 space-y-6">
        <h1 className="text-2xl font-semibold text-center text-gray-800">
          Registro da Equipe Executora
        </h1>

        {/* --- Dados do Estudo --- */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Código do Estudo</Label>
            <Input value={codigoEstudo} readOnly disabled />
          </div>
          <div>
            <Label>Versão</Label>
            <Input value={versao} readOnly disabled />
          </div>
        </div>

        {/* --- Formulário de Membro --- */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 items-end">
          <div>
            <Label>Nome</Label>
            <Input
              value={novoMembro.nome}
              onChange={(e) => setNovoMembro({ ...novoMembro, nome: e.target.value })}
            />
          </div>
          <div>
            <Label>Cargo</Label>
            <Input
              value={novoMembro.cargo}
              onChange={(e) => setNovoMembro({ ...novoMembro, cargo: e.target.value })}
            />
          </div>
          <div>
            <Label>Iniciais</Label>
            <Input
              value={novoMembro.iniciais}
              onChange={(e) => setNovoMembro({ ...novoMembro, iniciais: e.target.value })}
            />
          </div>
          <div>
            <Label>Treinamento?</Label>
            <select
              className="w-full border rounded-md h-10 px-2"
              value={novoMembro.treinamento}
              onChange={(e) => setNovoMembro({ ...novoMembro, treinamento: e.target.value })}
            >
              <option>Sim</option>
              <option>Não</option>
            </select>
          </div>
          <div>
            <Label>Cego?</Label>
            <select
              className="w-full border rounded-md h-10 px-2"
              value={novoMembro.cego}
              onChange={(e) => setNovoMembro({ ...novoMembro, cego: e.target.value })}
            >
              <option>Sim</option>
              <option>Não</option>
            </select>
          </div>
        </div>

        <Button variant="secondary" onClick={handleAddMembro}>
          Adicionar Membro
        </Button>

        {/* --- Tabela da Equipe --- */}
        {membros.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Iniciais</TableHead>
                <TableHead>Treinamento?</TableHead>
                <TableHead>Cego?</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {membros.map((m, idx) => (
                <TableRow key={idx}>
                  <TableCell>{m.nome}</TableCell>
                  <TableCell>{m.cargo}</TableCell>
                  <TableCell>{m.iniciais}</TableCell>
                  <TableCell>{m.treinamento}</TableCell>
                  <TableCell>{m.cego}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* --- Exportação --- */}
        <Button
          className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold"
          onClick={handleExportarPDF}
        >
          Exportar PDF
        </Button>
      </div>
    </div>
  );
};

export default DataEquipeExecutora;
