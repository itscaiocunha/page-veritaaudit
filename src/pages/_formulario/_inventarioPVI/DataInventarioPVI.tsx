import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";


// --- Interface para definir a estrutura dos dados do produto ---
interface ProdutoVeterinario {
  produto: string;
  apresentacao: string;
  lote: string;
  dataFab: string;
  dataVal: string;
  quantidadeRec: string;
  condicaoRec: string;
  dataRec: string;
  responsavelRec: string;
  condicaoArm: string;
  quantidadeUtil: string;
}

// --- Componente Principal ---
const InventarioPVIs = () => {
  // --- Estado para armazenar a lista de produtos adicionados ---
  const [produtos, setProdutos] = useState<ProdutoVeterinario[]>([]);
  // --- Estado para controlar os valores dos campos de entrada do novo produto ---
  const [novoProduto, setNovoProduto] = useState<ProdutoVeterinario>({
    produto: "",
    apresentacao: "",
    lote: "",
    dataFab: "",
    dataVal: "",
    quantidadeRec: "",
    condicaoRec: "",
    dataRec: "",
    responsavelRec: "",
    condicaoArm: "",
    quantidadeUtil: "",
  });
  // --- Estado para verificar se as bibliotecas de PDF foram carregadas ---
  const [scriptsLoaded, setScriptsLoaded] = useState(false);
  const navigate = useNavigate();

  // --- Mapeamento de chaves para labels do UI e PDF ---
  const labelMapping: { [key in keyof ProdutoVeterinario]: string } = {
      produto: "Produto",
      apresentacao: "Apresentação",
      lote: "Partida/Lote",
      dataFab: "Data de Fabricação",
      dataVal: "Data de Validade",
      quantidadeRec: "Quantidade recebida",
      condicaoRec: "Condições de recebimento",
      dataRec: "Data de recebimento",
      responsavelRec: "Responsável pelo recebimento",
      condicaoArm: "Condições de armazenamento",
      quantidadeUtil: "Quantidade utilizada na etapa clínica",
  };

  // --- Efeito para carregar os scripts do jsPDF e autoTable dinamicamente ---
  useEffect(() => {
    const jspdfScript = document.createElement("script");
    jspdfScript.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    jspdfScript.onload = () => {
      const autotableScript = document.createElement("script");
      autotableScript.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.23/jspdf.plugin.autotable.js";
      autotableScript.onload = () => {
        setScriptsLoaded(true);
      };
      document.body.appendChild(autotableScript);
    };
    document.body.appendChild(jspdfScript);
  }, []);

  // --- Constantes para informações do documento ---
  const codigoEstudo = "00-0001-25"; // Exemplo, pode ser dinâmico
  const versao = "0"; // Exemplo, pode ser dinâmico

  // --- Função para lidar com a mudança nos campos de entrada ---
  const handleInputChange = (field: keyof ProdutoVeterinario, value: string) => {
    setNovoProduto(prev => ({ ...prev, [field]: value }));
  };

  // --- Função para adicionar o novo produto à lista ---
  const handleAddProduto = () => {
    if (!novoProduto.produto || !novoProduto.lote) {
        alert("Por favor, preencha pelo menos o Produto e o Lote/Partida.");
        return;
    };
    setProdutos([...produtos, novoProduto]);
    // --- Limpa os campos para a próxima entrada ---
    setNovoProduto({
        produto: "",
        apresentacao: "",
        lote: "",
        dataFab: "",
        dataVal: "",
        quantidadeRec: "",
        condicaoRec: "",
        dataRec: "",
        responsavelRec: "",
        condicaoArm: "",
        quantidadeUtil: "",
    });
  };

  // --- Função para gerar e exportar o PDF ---
  const handleExportarPDF = () => {
    if (!scriptsLoaded) {
      alert("Aguarde o carregamento das bibliotecas de PDF.");
      return;
    }
    const doc = new (window as any).jspdf.jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();

    // === Cabeçalho com autoTable ===
    (doc as any).autoTable({
        startY: 10,
        body: [
            [
                { content: 'LOGO', styles: { fontStyle: 'bold', fontSize: 12, valign: 'middle' } },
                { content: '3.0 – INVENTÁRIO DO PRODUTO VETERINÁRIO INVESTIGACIONAL', styles: { fontStyle: 'bold', halign: 'center', valign: 'middle', fontSize: 12 } },
                { content: `1\nPágina de 2`, styles: { halign: 'center', valign: 'middle' } },
            ],
            [
                { content: 'Área: Estudos clínicos' },
                { content: 'Nº DOC.: FOR-EC-3', styles: { halign: 'center' } },
                { content: `Versão: ${versao}`, styles: { halign: 'center' } }
            ]
        ],
        theme: 'grid',
        styles: { font: "helvetica", fontSize: 10, lineColor: [0, 0, 0], lineWidth: 0.2 },
        columnStyles: { 0: { cellWidth: 40 }, 2: { cellWidth: 30 } }
    });

    // === Código do Estudo com autoTable ===
    (doc as any).autoTable({
        startY: (doc as any).lastAutoTable.finalY + 2,
        body: [[`Código do estudo: ${codigoEstudo}`]],
        theme: 'grid',
        styles: { font: "helvetica", fontSize: 11, lineColor: [0, 0, 0], lineWidth: 0.2 },
    });


    let yPosition = (doc as any).lastAutoTable.finalY + 15;
    const leftMargin = 15;
    const lineSpacing = 10;
    const valueStartX = 80; // Posição X fixa para o início dos valores
    const lineEndX = pageWidth - leftMargin;
    
    produtos.forEach((produto, index) => {
        if (index > 0) {
             yPosition += lineSpacing * 1.5; // Espaço extra entre os produtos
             doc.setLineDashPattern([1, 1], 0);
             doc.line(leftMargin, yPosition - (lineSpacing / 2), lineEndX, yPosition - (lineSpacing / 2));
             doc.setLineDashPattern([], 0);
        }
        
        // --- Adiciona cada campo do produto ---
        Object.keys(produto).forEach(key => {
            if (yPosition > 270) { // Verifica se precisa de uma nova página
                doc.addPage();
                yPosition = 20; // Posição Y inicial na nova página
            }
            const label = labelMapping[key as keyof ProdutoVeterinario];
            const value = produto[key as keyof ProdutoVeterinario];
            
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            doc.text(label, leftMargin, yPosition);
            
            // --- Desenha a linha para o valor ---
            doc.setDrawColor(180, 180, 180); // Cor cinza para a linha
            doc.line(valueStartX, yPosition, lineEndX, yPosition);

            // --- Escreve o valor em cima da linha ---
            if(value) {
                doc.setFont("helvetica", "bold");
                doc.text(value, valueStartX + 2, yPosition - 0.5);
            }

            yPosition += lineSpacing;
        });
    });

    let finalY = yPosition;

    // === Assinatura ===
    if (finalY > 250) {
        doc.addPage();
        finalY = 20;
    }

    doc.setFontSize(10);
    doc.text("Investigador:", 15, finalY + 20);
    doc.line(45, finalY + 20, 120, finalY + 20); // Linha da assinatura

    doc.text("Data:", pageWidth - 70, finalY + 20);
    doc.line(pageWidth - 60, finalY + 20, pageWidth - 15, finalY + 20); // Linha da data

    // --- Salvar o PDF ---
    doc.save("FOR-EC-3.0-InventarioProduto.pdf");
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 p-4">
        <header className="w-full max-w-6xl bg-white/30 backdrop-blur-lg shadow-sm p-4 flex items-center justify-center relative border-b border-white/20 mb-6 rounded-t-2xl">
            <Button
            onClick={() => navigate(-1)}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-gray hover:bg-gray-300 text-gray-800 font-semibold py-2 px-3 rounded-lg inline-flex items-center text-sm"
            >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Voltar</span>
            </Button>
            <h1 className="text-xl sm:text-2xl font-bold text-center text-gray-800">Verita Audit</h1>
        </header>

      <div className="w-full max-w-6xl bg-white rounded-b-2xl shadow-xl p-8 space-y-6">
        <h1 className="text-3xl font-bold text-center text-gray-800">
          Inventário do Produto Veterinário Investigacional
        </h1>

        {/* --- Formulário para adicionar novo produto --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 items-end p-4 border rounded-lg">
            {Object.keys(novoProduto).map((key) => (
                 <div key={key}>
                    <Label className="text-sm font-medium text-gray-700">{labelMapping[key as keyof ProdutoVeterinario]}</Label>
                    <Input
                        type={key.toLowerCase().includes('data') ? 'date' : 'text'}
                        value={novoProduto[key as keyof ProdutoVeterinario]}
                        onChange={(e) => handleInputChange(key as keyof ProdutoVeterinario, e.target.value)}
                        className="py-3 h-12 text-base bg-white/50 focus:bg-white/80"
                    />
                </div>
            ))}
             <Button className="bg-[#90EE90] hover:bg-[#7CCD7C] text-white font-bold h-12 text-base" onClick={handleAddProduto}>
                <Plus className="mr-2 h-5 w-5" /> Adicionar
            </Button>
        </div>

        {/* --- Tabela de Produtos Adicionados --- */}
        {produtos.length > 0 && (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  {Object.keys(novoProduto).map(key => <TableHead key={key}>{labelMapping[key as keyof ProdutoVeterinario]}</TableHead>)}
                </TableRow>
              </TableHeader>
              <TableBody>
                {produtos.map((produto, idx) => (
                  <TableRow key={idx}>
                    {Object.values(produto).map((value, i) => <TableCell key={i}>{value}</TableCell>)}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* --- Botão de Exportação --- */}
        <Button
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 text-lg h-auto rounded-md"
          onClick={handleExportarPDF}
          disabled={produtos.length === 0 || !scriptsLoaded}
        >
          {scriptsLoaded ? 'Exportar PDF' : 'Carregando Biblioteca PDF...'}
        </Button>
      </div>
    </div>
  );
};

export default InventarioPVIs;

