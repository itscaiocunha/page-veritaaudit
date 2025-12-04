import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ChevronLeft, Save, AlertCircle, FileDown } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import jsPDF from "jspdf";
import logoImg from "/images/auditoria.png";

// --- Schema de Validação ---
const validationSchema = yup.object({
  // PVI (Pode vir preenchido, mas validamos)
  nomeProduto: yup.string().required("Nome do produto é obrigatório"),
  principioAtivo: yup.string().required("Princípio ativo é obrigatório"),
  fabricante: yup.string().required("Fabricante é obrigatório"),
  lote: yup.string().required("Lote é obrigatório"),

  // Produto em Desacordo (Opcional, mas se preencher um campo, valida os outros pode ser complexo. 
  // Simplificando: deixamos como string opcionais para permitir salvar parcial, 
  // ou obrigatório se for o foco. No PDF parece que pode ter um OU outro.)
  desacordoMotivo: yup.string(),
  desacordoUnidades: yup.string(),
  desacordoDestinacao: yup.string(),
  desacordoResponsavel: yup.string(),
  desacordoData: yup.string(),

  // Produto Não Utilizado
  naoUtilizadoMotivo: yup.string(),
  naoUtilizadoUnidades: yup.string(),
  naoUtilizadoDestinacao: yup.string(),
  naoUtilizadoResponsavel: yup.string(),
  naoUtilizadoData: yup.string(),
});

type FormValues = yup.InferType<typeof validationSchema>;

const FormHeader = () => {
  const navigate = useNavigate();
  return (
    <header className="bg-white/30 backdrop-blur-lg shadow-sm w-full p-4 flex items-center justify-center relative border-b border-white/20">
      <Button
        onClick={() => navigate(-1)}
        variant="outline"
        size="sm"
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/50 hover:bg-white/80 text-gray-800"
      >
        <ChevronLeft className="h-5 w-5 sm:mr-1" />
        <span className="hidden sm:inline">Voltar</span>
      </Button>
      <h1 className="text-xl sm:text-2xl font-bold text-center text-gray-800">
        Verita Audit
      </h1>
    </header>
  );
};

const DestinacaoPVI = () => {
  const navigate = useNavigate();
  const { id: protocoloMestreId } = useParams<{ id: string }>();

  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [protocoloVersaoId, setProtocoloVersaoId] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    getValues
  } = useForm<FormValues>({
    resolver: yupResolver(validationSchema),
  });

  // --- PDF Export ---
  const generatePDF = () => {
    const data = getValues();
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const W = doc.internal.pageSize.getWidth();
    const LM = 15;
    const RM = 15;
    const innerW = W - LM - RM;

    let y = 15;
    const headerH = 25;

    // Header Drawing
    doc.setLineWidth(0.3);
    doc.rect(LM, y, 40, headerH);
    doc.text("LOGO", LM+12, y+15);

    doc.rect(LM + 40, y, innerW - 75, headerH);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("DESTINAÇÃO DO PVI EM", LM + 42 + (innerW - 75)/2, y + 10, { align: "center" });
    doc.text("DESACORDO OU NÃO UTILIZADO", LM + 42 + (innerW - 75)/2, y + 18, { align: "center" });

    doc.rect(W - RM - 35, y, 35, headerH);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("N° DOC.: FOR-EC-023", W - RM - 33, y + 8);
    doc.text("Versão: 01", W - RM - 33, y + 16);

    y += headerH + 5;

    // Estudo
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.rect(LM, y, innerW, 8);
    doc.text("CÓDIGO DO ESTUDO: 00-0001-25", LM + 2, y + 5.5);
    y += 8;

    // --- Info PVI ---
    doc.setFillColor(230, 230, 230);
    doc.rect(LM, y, innerW, 7, "FD");
    doc.text("INFORMAÇÕES DO PVI", W / 2, y + 5, { align: "center" });
    y += 7;

    const rowH = 8;
    doc.setFont("helvetica", "normal");
    doc.rect(LM, y, innerW, rowH);
    doc.text(`Nome/Código do Produto: ${data.nomeProduto || ""}`, LM + 2, y + 5.5);
    y += rowH;
    doc.rect(LM, y, innerW, rowH);
    doc.text(`Princípio Ativo: ${data.principioAtivo || ""}`, LM + 2, y + 5.5);
    y += rowH;
    doc.rect(LM, y, innerW/2, rowH);
    doc.text(`Fabricante: ${data.fabricante || ""}`, LM + 2, y + 5.5);
    doc.rect(LM+innerW/2, y, innerW/2, rowH);
    doc.text(`Partida/Lote: ${data.lote || ""}`, LM+innerW/2+2, y + 5.5);
    y += rowH + 2;

    // --- DESACORDO ---
    doc.setFont("helvetica", "bold");
    doc.setFillColor(230, 230, 230);
    doc.rect(LM, y, innerW, 7, "FD");
    doc.text("PRODUTO EM DESACORDO", W / 2, y + 5, { align: "center" });
    y += 7;

    doc.setFont("helvetica", "normal");
    // Motivo (Box maior)
    doc.rect(LM, y, innerW, 10);
    doc.text("Motivo:", LM + 2, y + 5);
    const motivo1 = doc.splitTextToSize(data.desacordoMotivo || "", innerW - 5);
    doc.text(motivo1, LM + 2, y + 10);
    y += 10;

    // Unidades
    doc.rect(LM, y, innerW, rowH);
    doc.text(`N° de unidades: ${data.desacordoUnidades || ""}`, LM + 2, y + 5.5);
    y += rowH;

    // Destinação (Box maior)
    doc.rect(LM, y, innerW, 10);
    doc.text("Destinação:", LM + 2, y + 5);
    const dest1 = doc.splitTextToSize(data.desacordoDestinacao || "", innerW - 5);
    doc.text(dest1, LM + 2, y + 10);
    y += 10;

    // Resp / Data
    doc.rect(LM, y, innerW*0.7, rowH);
    doc.text(`Responsável: ${data.desacordoResponsavel || ""}`, LM + 2, y + 5.5);
    doc.rect(LM+innerW*0.7, y, innerW*0.3, rowH);
    doc.text(`Data: ${data.desacordoData ? new Date(data.desacordoData).toLocaleDateString('pt-BR') : ""}`, LM+innerW*0.7+2, y + 5.5);
    y += rowH + 2;

    // --- NÃO UTILIZADO ---
    doc.setFont("helvetica", "bold");
    doc.setFillColor(230, 230, 230);
    doc.rect(LM, y, innerW, 7, "FD");
    doc.text("PRODUTO NÃO UTILIZADO", W / 2, y + 5, { align: "center" });
    y += 7;

    doc.setFont("helvetica", "normal");
    // Motivo
    doc.rect(LM, y, innerW, 10);
    doc.text("Motivo:", LM + 2, y + 5);
    const motivo2 = doc.splitTextToSize(data.naoUtilizadoMotivo || "", innerW - 5);
    doc.text(motivo2, LM + 2, y + 10);
    y += 10;

    // Unidades
    doc.rect(LM, y, innerW, rowH);
    doc.text(`N° de unidades: ${data.naoUtilizadoUnidades || ""}`, LM + 2, y + 5.5);
    y += rowH;

    // Destinação
    doc.rect(LM, y, innerW, 10);
    doc.text("Destinação:", LM + 2, y + 5);
    const dest2 = doc.splitTextToSize(data.naoUtilizadoDestinacao || "", innerW - 5);
    doc.text(dest2, LM + 2, y + 10);
    y += 10;

    // Resp / Data
    doc.rect(LM, y, innerW*0.7, rowH);
    doc.text(`Responsável: ${data.naoUtilizadoResponsavel || ""}`, LM + 2, y + 5.5);
    doc.rect(LM+innerW*0.7, y, innerW*0.3, rowH);
    doc.text(`Data: ${data.naoUtilizadoData ? new Date(data.naoUtilizadoData).toLocaleDateString('pt-BR') : ""}`, LM+innerW*0.7+2, y + 5.5);

    doc.save("FOR-EC-034_Destinacao_PVI.pdf");
  };

  // --- API / Cache Loading ---
  useEffect(() => {
    const storageKey = `dadosDestinacaoPVI_${protocoloMestreId || "draft"}`;
    // Tentar carregar dados do PVI do formulário anterior para preencher automaticamente
    const pviData = JSON.parse(localStorage.getItem(`dadosRecebimentoCustodia_${protocoloMestreId || "draft"}`) || "[]");
    const lastPVI = pviData.length > 0 ? pviData[pviData.length - 1] : null;

    if (!protocoloMestreId) {
      setIsDataLoading(false);
      const saved = JSON.parse(localStorage.getItem(storageKey) || "[]");
      if (saved.length > 0) {
          reset(saved[saved.length - 1]);
      } else if (lastPVI) {
          // Pre-fill PVI info
          reset({
              nomeProduto: lastPVI.nomeProduto,
              principioAtivo: lastPVI.principioAtivo,
              fabricante: lastPVI.fabricante,
              lote: lastPVI.lote
          });
      }
      return;
    }

    const fetchDados = async () => {
        setIsDataLoading(true);
        const apiKey = "2NtzCUDl8Ib2arnDRck0xK8taguGeFYuZqnUzpiZ9Wp-tUZ45--/i=tKxzwTPBvtykMSx!0t?7c/Z?NllkokY=TEC2DSonmOMUu0gxdCeh70/rA2NSsm7Ohjn7VM2BeP";
        let TOKEN = sessionStorage.getItem("token");
        if (!TOKEN) { navigate("/login"); return; }
        TOKEN = TOKEN.replace(/"/g, "");

        try {
            const response = await fetch(
                `https://verita-brgchubha6ceathm.brazilsouth-01.azurewebsites.net/api/protocolo/versao/ativo/detalhes/${protocoloMestreId}`,
                { headers: { Authorization: `Bearer ${TOKEN}`, "X-API-KEY": apiKey } }
            );
            if (!response.ok) throw new Error("Erro carregando dados");
            const data = await response.json();
            setProtocoloVersaoId(data.id);
            
            // Se existir dados salvos de Destinação, usa eles
            if(data.destinacaoPVI?.conteudo) {
                reset(data.destinacaoPVI.conteudo);
            } 
            // Senão, tenta preencher com o que veio do Recebimento (se existir no banco)
            else if (data.recebimentoCustodia?.conteudo) {
                const rc = data.recebimentoCustodia.conteudo;
                reset({
                    nomeProduto: rc.nomeProduto,
                    principioAtivo: rc.principioAtivo,
                    fabricante: rc.fabricante,
                    lote: rc.lote
                });
            }
        } catch (err) {
            console.error(err);
            // Fallback Local Storage
            const saved = JSON.parse(localStorage.getItem(storageKey) || "[]");
            if (saved.length > 0) reset(saved[saved.length - 1]);
        } finally {
            setIsDataLoading(false);
        }
    };
    fetchDados();
  }, [protocoloMestreId, navigate, reset]);

  const handleSaveApi = async (data: FormValues) => {
    if (!protocoloVersaoId) throw new Error("ID Versão indefinido");
    const apiKey = "2NtzCUDl8Ib2arnDRck0xK8taguGeFYuZqnUzpiZ9Wp-tUZ45--/i=tKxzwTPBvtykMSx!0t?7c/Z?NllkokY=TEC2DSonmOMUu0gxdCeh70/rA2NSsm7Ohjn7VM2BeP";
    let TOKEN = sessionStorage.getItem("token")?.replace(/"/g, "");
    
    // Supondo endpoint similar
    const response = await fetch(
        `https://verita-brgchubha6ceathm.brazilsouth-01.azurewebsites.net/api/protocolo/versao/destinacao-pvi`, 
        {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${TOKEN}`, "X-API-KEY": apiKey },
            body: JSON.stringify({ idProtocolo: protocoloVersaoId, conteudo: data })
        }
    );
    if (!response.ok) throw new Error("Falha ao salvar API");
    localStorage.setItem(`dadosDestinacaoPVI_${protocoloMestreId}`, JSON.stringify([data]));
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
        await handleSaveApi(data);
        // Navigate to next form or dashboard
        // navigate(`/dashboard`);
        alert("Salvo com sucesso!");
    } catch (e) {
        if(e instanceof Error) setError(e.message);
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-br from-gray-100 to-gray-200 font-inter">
      <FormHeader />
      <main className="flex-1 flex flex-col items-center justify-center py-12 px-4">
        <div className="w-full max-w-5xl rounded-xl p-6 sm:p-8 bg-white/70 backdrop-blur-md shadow-xl border border-white/30 relative">
          
          {isDataLoading && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm rounded-xl">
                <Loader2 className="w-10 h-10 animate-spin text-green-600" />
            </div>
          )}

          <div className="flex justify-between items-center mb-8 border-b pb-4">
            <h2 className="text-2xl font-semibold text-gray-800">
              Destinação de PVI (Desacordo/Inutilizado)
            </h2>
            <Button variant="outline" onClick={generatePDF} className="text-blue-700 border-blue-200 hover:bg-blue-50">
                <FileDown className="w-4 h-4 mr-2"/>
                Exportar PDF
            </Button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded flex gap-2">
                <AlertCircle className="w-5 h-5"/> {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            
            {/* Info PVI */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-700 mb-4 border-l-4 border-gray-500 pl-3">
                    Informações do Produto (PVI)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label>Nome/Código</Label>
                        <Input {...register("nomeProduto")} className="mt-1 bg-gray-50" />
                    </div>
                    <div>
                        <Label>Princípio Ativo</Label>
                        <Input {...register("principioAtivo")} className="mt-1 bg-gray-50" />
                    </div>
                    <div>
                        <Label>Fabricante</Label>
                        <Input {...register("fabricante")} className="mt-1 bg-gray-50" />
                    </div>
                    <div>
                        <Label>Partida/Lote</Label>
                        <Input {...register("lote")} className="mt-1 bg-gray-50" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Desacordo */}
                <div className="bg-red-50/50 p-6 rounded-lg border border-red-100 shadow-sm">
                    <h3 className="text-lg font-bold text-red-800 mb-4 border-l-4 border-red-500 pl-3">
                        Produto em Desacordo
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <Label>Motivo</Label>
                            <Textarea {...register("desacordoMotivo")} className="mt-1 bg-white" placeholder="Descreva o motivo..." />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Unidades</Label>
                                <Input {...register("desacordoUnidades")} className="mt-1 bg-white" />
                            </div>
                            <div>
                                <Label>Data</Label>
                                <Input type="date" {...register("desacordoData")} className="mt-1 bg-white" />
                            </div>
                        </div>
                        <div>
                            <Label>Destinação</Label>
                            <Textarea {...register("desacordoDestinacao")} className="mt-1 bg-white" />
                        </div>
                        <div>
                            <Label>Responsável</Label>
                            <Input {...register("desacordoResponsavel")} className="mt-1 bg-white" />
                        </div>
                    </div>
                </div>

                {/* Não Utilizado */}
                <div className="bg-blue-50/50 p-6 rounded-lg border border-blue-100 shadow-sm">
                    <h3 className="text-lg font-bold text-blue-800 mb-4 border-l-4 border-blue-500 pl-3">
                        Produto Não Utilizado
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <Label>Motivo</Label>
                            <Textarea {...register("naoUtilizadoMotivo")} className="mt-1 bg-white" placeholder="Sobras, Vencimento..." />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Unidades</Label>
                                <Input {...register("naoUtilizadoUnidades")} className="mt-1 bg-white" />
                            </div>
                            <div>
                                <Label>Data</Label>
                                <Input type="date" {...register("naoUtilizadoData")} className="mt-1 bg-white" />
                            </div>
                        </div>
                        <div>
                            <Label>Destinação</Label>
                            <Textarea {...register("naoUtilizadoDestinacao")} className="mt-1 bg-white" />
                        </div>
                        <div>
                            <Label>Responsável</Label>
                            <Input {...register("naoUtilizadoResponsavel")} className="mt-1 bg-white" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-gray-200">
                <Button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : <Save className="w-4 h-4 mr-2"/>}
                    Salvar Formulário
                </Button>
            </div>
          </form>
        </div>
      </main>
      <ScrollToTopButton />
    </div>
  );
};

export default DestinacaoPVI;