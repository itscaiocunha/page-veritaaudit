import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2 } from "lucide-react";

// --- Tipagens ---
type Pesagem = {
  animal: string;
  peso1: string;
  peso2: string;
  peso3: string;
  peso4: string;
};

type FormValues = {
  diasEstudo: string[];
  datas: string[];
  horarios: string[];
  pesagens: Pesagem[];
  realizadoPor: string;
  dataRealizado: string;
  registradoPor: string;
  dataRegistrado: string;
};

// --- Componente Principal ---
const PesagemAnimais = () => {
  const navigate = useNavigate();
  const [scriptsLoaded, setScriptsLoaded] = useState(false);

  // --- Efeito para carregar os scripts do jsPDF e autoTable ---
  useEffect(() => {
    const jspdfScript = document.createElement("script");
    jspdfScript.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    jspdfScript.onload = () => {
      const autotableScript = document.createElement("script");
      autotableScript.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.23/jspdf.plugin.autotable.js";
      autotableScript.onload = () => setScriptsLoaded(true);
      document.body.appendChild(autotableScript);
    };
    document.body.appendChild(jspdfScript);
  }, []);

  // --- Configuração do React Hook Form ---
  const { register, control, handleSubmit, watch } = useForm<FormValues>({
    defaultValues: {
      diasEstudo: ["", "", "", ""],
      datas: ["", "", "", ""],
      horarios: ["", "", "", ""],
      pesagens: [{ animal: "", peso1: "", peso2: "", peso3: "", peso4: "" }],
      realizadoPor: "",
      dataRealizado: "",
      registradoPor: "",
      dataRegistrado: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "pesagens",
  });

  // --- Função para Exportar PDF ---
  const handleExportarPDF = (data: FormValues) => {
    if (!scriptsLoaded) {
      alert("Aguarde o carregamento dos recursos para gerar o PDF.");
      return;
    }
    const doc = new (window as any).jspdf.jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // --- Cabeçalho ---
     (doc as any).autoTable({
        startY: 10,
        body: [
            [
                { content: 'LOGO', styles: { fontStyle: 'bold', fontSize: 12, valign: 'middle' } },
                { content: '4.0 – PESAGEM DOS ANIMAIS', styles: { fontStyle: 'bold', halign: 'center', valign: 'middle', fontSize: 12 } },
                { content: `1\nPágina de 1`, styles: { halign: 'center', valign: 'middle' } },
            ],
            [
                { content: 'Área: Estudos clínicos' },
                { content: 'Nº DOC.: FOR-EC-4', styles: { halign: 'center' } },
                { content: `Versão: 0`, styles: { halign: 'center' } }
            ]
        ],
        theme: 'grid',
        styles: { font: "helvetica", fontSize: 10, lineColor: [0, 0, 0], lineWidth: 0.2 },
        columnStyles: { 0: { cellWidth: 40 }, 2: { cellWidth: 30 } }
    });
     (doc as any).autoTable({
        startY: (doc as any).lastAutoTable.finalY + 2,
        body: [[`Código do estudo: `]], // Adicionar código do estudo aqui
        theme: 'grid',
        styles: { font: "helvetica", fontSize: 11, lineColor: [0, 0, 0], lineWidth: 0.2 },
    });

    // --- Tabela Principal ---
    const tableHead = [
      [
        { content: "Dia do Estudo:", styles: { halign: 'left' } }, ...data.diasEstudo,
      ],
      [
        { content: "Data:", styles: { halign: 'left' } }, ...data.datas.map(d => `(DD/MM/AA)`),
      ],
       [
        { content: "Horário:", styles: { halign: 'left' } }, ...data.horarios.map(h => `(HH:MM)`),
      ],
       [
        { content: "Animal", styles: { halign: 'left' } }, "Peso (kg)", "Peso (kg)", "Peso (kg)", "Peso (kg)"
      ],
    ];

    const tableBody = data.pesagens.map(p => [
        p.animal, p.peso1, p.peso2, p.peso3, p.peso4
    ]);

     (doc as any).autoTable({
        startY: (doc as any).lastAutoTable.finalY + 5,
        head: tableHead,
        body: tableBody,
        theme: 'grid',
        styles: { font: "helvetica", fontSize: 9, cellPadding: 2, lineColor: [0,0,0], lineWidth: 0.2 },
        headStyles: { fontStyle: 'bold', fillColor: [255,255,255], textColor: [0,0,0] },
        columnStyles: { 0: { halign: 'left' } }
     });

     let finalY = (doc as any).lastAutoTable.finalY;

     // --- Rodapé ---
     doc.setFontSize(10);
     doc.text("Realizado por (iniciais): ____________________________", 15, finalY + 15);
     doc.text(`Data: ${data.dataRealizado || '___/___/___'}`, pageWidth - 60, finalY + 15);
     doc.text("Registrado por (iniciais): ____________________________", 15, finalY + 25);
     doc.text(`Data: ${data.dataRegistrado || '___/___/___'}`, pageWidth - 60, finalY + 25);
     doc.text("Página 1 de 1", pageWidth - 30, doc.internal.pageSize.getHeight() - 10);
    
    doc.save("FOR-EC-4.0-PesagemAnimais.pdf");
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 p-4">
      <header className="w-full max-w-7xl bg-white/30 backdrop-blur-lg shadow-sm p-4 flex items-center justify-center relative border-b border-white/20 mb-6 rounded-t-2xl">
        <Button onClick={() => navigate(-1)} className="absolute left-4 top-1/2 -translate-y-1/2">Voltar</Button>
        <h1 className="text-xl sm:text-2xl font-bold text-center text-gray-800">Verita Audit</h1>
      </header>

      <div className="w-full max-w-7xl bg-white rounded-b-2xl shadow-xl p-8 space-y-6">
        <h1 className="text-3xl font-bold text-center text-gray-800">
          Formulário de Pesagem dos Animais
        </h1>

        <form onSubmit={handleSubmit(handleExportarPDF)}>
            <div className="border rounded-lg p-4">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-1/4">Dia do Estudo:</TableHead>
                        {watch('diasEstudo').map((_, index) => (
                             <TableCell key={index}><Input {...register(`diasEstudo.${index}`)} placeholder={`D${index+1}`} /></TableCell>
                        ))}
                    </TableRow>
                     <TableRow>
                        <TableHead>Data:</TableHead>
                        {watch('datas').map((_, index) => (
                             <TableCell key={index}><Input type="date" {...register(`datas.${index}`)} /></TableCell>
                        ))}
                    </TableRow>
                     <TableRow>
                        <TableHead>Horário:</TableHead>
                        {watch('horarios').map((_, index) => (
                             <TableCell key={index}><Input type="time" {...register(`horarios.${index}`)} /></TableCell>
                        ))}
                    </TableRow>
                     <TableRow>
                        <TableHead>Animal</TableHead>
                        <TableHead>Peso (kg)</TableHead>
                        <TableHead>Peso (kg)</TableHead>
                        <TableHead>Peso (kg)</TableHead>
                        <TableHead>Peso (kg)</TableHead>
                        <TableHead>Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {fields.map((field, index) => (
                        <TableRow key={field.id}>
                            <TableCell><Input placeholder={`Animal ${index + 1}`} {...register(`pesagens.${index}.animal`)} /></TableCell>
                            <TableCell><Input placeholder="0.00" {...register(`pesagens.${index}.peso1`)} /></TableCell>
                            <TableCell><Input placeholder="0.00" {...register(`pesagens.${index}.peso2`)} /></TableCell>
                            <TableCell><Input placeholder="0.00" {...register(`pesagens.${index}.peso3`)} /></TableCell>
                            <TableCell><Input placeholder="0.00" {...register(`pesagens.${index}.peso4`)} /></TableCell>
                             <TableCell>
                                <Button type="button" variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => remove(index)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
             <Button
                type="button"
                variant="outline"
                className="mt-4"
                onClick={() => append({ animal: "", peso1: "", peso2: "", peso3: "", peso4: "" })}
            >
                <Plus className="mr-2 h-4 w-4" /> Adicionar Animal
            </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
                <div>
                    <Label>Realizado por (iniciais):</Label>
                    <Input {...register('realizadoPor')} />
                </div>
                 <div>
                    <Label>Data:</Label>
                    <Input type="date" {...register('dataRealizado')} />
                </div>
                 <div>
                    <Label>Registrado por (iniciais):</Label>
                    <Input {...register('registradoPor')} />
                </div>
                 <div>
                    <Label>Data:</Label>
                    <Input type="date" {...register('dataRegistrado')} />
                </div>
            </div>
          
            <Button type="submit" className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white font-bold py-3 text-lg">
                Exportar PDF
            </Button>
        </form>
      </div>
    </div>
  );
};

export default PesagemAnimais;

