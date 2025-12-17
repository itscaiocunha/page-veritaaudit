import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2, ChevronLeft, AlertTriangle, Save, ArrowRight, AlertCircle, FileDown } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import jsPDF from "jspdf";
import logoImg from "/images/auditoria.png"; // Ajuste o caminho se necessário

// --- Schema de Validação ---
const validationSchema = yup.object({
  // Informações do PVI
  nomeProduto: yup.string().required("Nome/Código do produto é obrigatório."),
  principioAtivo: yup.string().required("Princípio ativo é obrigatório."),
  fabricante: yup.string().required("Fabricante é obrigatório."),
  lote: yup.string().required("Partida/Lote é obrigatório."),

  // Informações de Recebimento
  dataRecebimento: yup.string().required("Data é obrigatória."),
  horarioRecebimento: yup.string().required("Horário é obrigatório."),
  apresentacao: yup.string().required("Apresentação é obrigatória."),
  quantidade: yup.string().required("Quantidade é obrigatória."),
  
  // Checklists (Radio Buttons)
  condicoesTransporte: yup.string().oneOf(["de_acordo", "desacordo"], "Selecione uma opção.").required("Campo obrigatório."),
  temperaturaTransporte: yup.string().oneOf(["de_acordo", "desacordo"], "Selecione uma opção.").required("Campo obrigatório."),
  embalagemLacrada: yup.string().oneOf(["sim", "nao"], "Selecione uma opção.").required("Campo obrigatório."),
  pviAprovado: yup.string().oneOf(["sim", "nao"], "Selecione uma opção.").required("Campo obrigatório."),
  
  responsavelRecebimento: yup.string().required("Responsável pelo recebimento é obrigatório."),

  // Informações de Custódia
  temperaturaArmazenamento: yup.string().required("Temperatura é obrigatória."),
  localArmazenamento: yup.string().required("Local é obrigatório."),
  responsavelArmazenamento: yup.string().required("Responsável pelo armazenamento é obrigatório."),
});

type FormValues = yup.InferType<typeof validationSchema>;

// --- Componente Header ---
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

// --- Componente Principal ---
const FormularioRecebimentoCustodia = () => {
  const navigate = useNavigate();
  const { id: protocoloMestreId } = useParams<{ id: string }>();

  // Estados
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
    watch,
    getValues
  } = useForm<FormValues>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      condicoesTransporte: undefined,
      temperaturaTransporte: undefined,
      embalagemLacrada: undefined,
      pviAprovado: undefined
    }
  });

  // Monitorar valor para exibir alerta condicional
  const pviAprovadoValue = watch("pviAprovado");

  // --- Função de Exportação PDF ---
  const generatePDF = () => {
    const data = getValues();
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const W = doc.internal.pageSize.getWidth();
    const LM = 15; // Left Margin
    const RM = 15; // Right Margin
    const innerW = W - LM - RM;

    // Helper para desenhar checkbox estilo [X] ou [ ]
    const drawCheck = (label: string, isChecked: boolean, x: number, y: number) => {
      doc.rect(x, y - 4, 4, 4);
      if (isChecked) doc.text("X", x + 0.5, y - 0.5);
      doc.text(label, x + 6, y);
    };

    // --- CABEÇALHO ---
    let y = 15;
    const headerH = 25;
    
    // Logo Box
    doc.setLineWidth(0.3);
    doc.rect(LM, y, 40, headerH);
    doc.text("LOGO", LM + 12, y + 15);
    
    // Título Box
    doc.rect(LM + 40, y, innerW - 75, headerH);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("RECEBIMENTO E CUSTÓDIA DO PRODUTO", LM + 42 + (innerW - 75)/2, y + 10, { align: "center" });
    doc.text("VETERINÁRIO INVESTIGACIONAL (PVI)", LM + 42 + (innerW - 75)/2, y + 18, { align: "center" });

    // Info Doc Box
    doc.rect(W - RM - 35, y, 35, headerH);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("N° DOC.: FOR-EC-022", W - RM - 33, y + 8);
    doc.text("Versão: 01", W - RM - 33, y + 16);

    y += headerH + 5;

    // Código do Estudo
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.rect(LM, y, innerW, 8);
    doc.text("CÓDIGO DO ESTUDO: 00-0001-25", LM + 2, y + 5.5);
    y += 8;

    // --- SEÇÃO 1: INFORMAÇÕES DO PVI ---
    doc.setFillColor(230, 230, 230);
    doc.rect(LM, y, innerW, 7, "FD");
    doc.text("INFORMAÇÕES DO PVI", W / 2, y + 5, { align: "center" });
    y += 7;

    const rowH = 8;
    doc.setFont("helvetica", "normal");
    
    // Linha 1
    doc.rect(LM, y, innerW, rowH);
    doc.text(`Nome/Código do Produto: ${data.nomeProduto || ""}`, LM + 2, y + 5.5);
    doc.rect(LM + innerW / 2, y, innerW / 2, rowH);
    doc.text(`Princípio Ativo: ${data.principioAtivo || ""}`, LM + innerW / 2 + 2, y + 5.5);
    y += rowH;

    // Linha 2
    doc.rect(LM, y, innerW / 2, rowH);
    doc.text(`Fabricante: ${data.fabricante || ""}`, LM + 2, y + 5.5);
    
    doc.rect(LM + innerW / 2, y, innerW / 2, rowH);
    doc.text(`Partida/Lote: ${data.lote || ""}`, LM + innerW / 2 + 2, y + 5.5);
    y += rowH + 2;

    // --- SEÇÃO 2: RECEBIMENTO ---
    doc.setFont("helvetica", "bold");
    doc.setFillColor(230, 230, 230);
    doc.rect(LM, y, innerW, 7, "FD");
    doc.text("INFORMAÇÕES DE RECEBIMENTO DO PVI", W / 2, y + 5, { align: "center" });
    y += 7;

    doc.setFont("helvetica", "normal");

    // Linha 1 (Data/Hora)
    doc.rect(LM, y, innerW / 2, rowH);
    doc.text(`Data do recebimento: ${data.dataRecebimento ? new Date(data.dataRecebimento).toLocaleDateString('pt-BR') : ""}`, LM + 2, y + 5.5);

    doc.rect(LM + innerW / 2, y, innerW / 2, rowH);
    doc.text(`Horário do recebimento: ${data.horarioRecebimento || ""}`, LM + innerW / 2 + 2, y + 5.5);
    y += rowH;

    // Linha 2 (Apresentação/Qtd)
    doc.rect(LM, y, innerW / 2, rowH);
    doc.text(`Apresentação: ${data.apresentacao || ""}`, LM + 2, y + 5.5);

    doc.rect(LM + innerW / 2, y, innerW / 2, rowH);
    doc.text(`Quantidade: ${data.quantidade || ""}`, LM + innerW / 2 + 2, y + 5.5);
    y += rowH;

    // Checkboxes (Linha a Linha)
    const checkH = 9;

    // Transporte
    doc.rect(LM, y, innerW, checkH);
    doc.text("Condições adequadas para o transporte do PVI:", LM + 2, y + 6);
    drawCheck("De Acordo", data.condicoesTransporte === "de_acordo", LM + 100, y + 6);
    drawCheck("Desacordo", data.condicoesTransporte === "desacordo", LM + 140, y + 6);
    y += checkH;

    // Temperatura
    doc.rect(LM, y, innerW, checkH);
    doc.text("Temperatura adequada para o transporte do PVI:", LM + 2, y + 6);
    drawCheck("De Acordo", data.temperaturaTransporte === "de_acordo", LM + 100, y + 6);
    drawCheck("Desacordo", data.temperaturaTransporte === "desacordo", LM + 140, y + 6);
    y += checkH;

    // Embalagem
    doc.rect(LM, y, innerW, checkH);
    doc.text("Embalagem lacrada:", LM + 2, y + 6);
    drawCheck("Sim", data.embalagemLacrada === "sim", LM + 100, y + 6);
    drawCheck("Não", data.embalagemLacrada === "nao", LM + 140, y + 6);
    y += checkH;

    // PVI Geral
    doc.rect(LM, y, innerW, checkH);
    doc.text("PVI De Acordo para o estudo:", LM + 2, y + 6);
    drawCheck("Sim", data.pviAprovado === "sim", LM + 100, y + 6);
    drawCheck("Não", data.pviAprovado === "nao", LM + 140, y + 6);
    y += checkH;

    // Responsável
    doc.rect(LM, y, innerW, rowH);
    doc.text(`Responsável pelo recebimento: ${data.responsavelRecebimento || ""}`, LM + 2, y + 5.5);
    y += rowH + 2;

    // --- SEÇÃO 3: CUSTÓDIA ---
    doc.setFont("helvetica", "bold");
    doc.setFillColor(230, 230, 230);
    doc.rect(LM, y, innerW, 7, "FD");
    doc.text("INFORMAÇÕES DE CUSTÓDIA DO PVI", W / 2, y + 5, { align: "center" });
    y += 7;

    doc.setFont("helvetica", "normal");
    
    // Temp
    doc.rect(LM, y, innerW, rowH);
    doc.text(`Temperatura de Armazenamento: ${data.temperaturaArmazenamento || ""}`, LM + 2, y + 5.5);
    y += rowH;

    // Local
    doc.rect(LM, y, innerW, rowH);
    doc.text(`Local de Armazenamento: ${data.localArmazenamento || ""}`, LM + 2, y + 5.5);
    y += rowH;

    // Responsável
    doc.rect(LM, y, innerW, rowH);
    doc.text(`Responsável pelo armazenamento: ${data.responsavelArmazenamento || ""}`, LM + 2, y + 5.5);
    y += rowH + 5;

    // Rodapé Obs
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    const obs = "Obs: Se o PVI não estiver De Acordo, devido às condições de transporte, temperatura ou lacre, deve ser segregado e documentado no Formulário 'Destinação de PVI em Desacordo ou Não Utilizado'.";
    const obsSplit = doc.splitTextToSize(obs, innerW);
    doc.text(obsSplit, LM, y);

    doc.save("FOR-EC-33_Recebimento_Custodia_PVI.pdf");
  };

  // --- 1. Carregar Dados ---
  useEffect(() => {
    const storageKey = `dadosRecebimentoCustodia_${protocoloMestreId || "draft"}`;

    if (!protocoloMestreId) {
      setError("ID do protocolo não encontrado (Modo Rascunho).");
      setIsDataLoading(false);
      const saved = JSON.parse(localStorage.getItem(storageKey) || "[]");
      if (saved.length > 0) reset(saved[saved.length - 1]);
      return;
    }

    const fetchDados = async () => {
      setIsDataLoading(true);
      setError(null);
      
      const apiKey = "2NtzCUDl8Ib2arnDRck0xK8taguGeFYuZqnUzpiZ9Wp-tUZ45--/i=tKxzwTPBvtykMSx!0t?7c/Z?NllkokY=TEC2DSonmOMUu0gxdCeh70/rA2NSsm7Ohjn7VM2BeP";
      let TOKEN = sessionStorage.getItem("token");
      if (!TOKEN) { navigate("/login"); return; }
      TOKEN = TOKEN.replace(/"/g, "");

      try {
        const response = await fetch(
          `https://verita-brgchubha6ceathm.brazilsouth-01.azurewebsites.net/api/protocolo/versao/ativo/detalhes/${protocoloMestreId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${TOKEN}`,
              "X-API-KEY": apiKey,
            },
          }
        );

        if (!response.ok) throw new Error("Erro ao carregar dados.");

        const data = await response.json();
        setProtocoloVersaoId(data.id);

        const backendData = data.recebimentoCustodia?.conteudo;
        
        if (backendData) {
           reset(backendData);
           localStorage.setItem(storageKey, JSON.stringify([backendData]));
        } else {
           const saved = JSON.parse(localStorage.getItem(storageKey) || "[]");
           if (saved.length > 0) reset(saved[saved.length - 1]);
        }

      } catch (err) {
        console.error(err);
        setError("Erro ao carregar dados. Usando cache local se disponível.");
        const saved = JSON.parse(localStorage.getItem(storageKey) || "[]");
        if (saved.length > 0) reset(saved[saved.length - 1]);
      } finally {
        setIsDataLoading(false);
      }
    };

    fetchDados();
  }, [protocoloMestreId, navigate, reset]);

  // --- 2. Salvar Dados (API) ---
  const handleSaveApi = async (data: FormValues) => {
    if (!protocoloVersaoId) throw new Error("ID da versão não encontrado.");

    const apiKey = "2NtzCUDl8Ib2arnDRck0xK8taguGeFYuZqnUzpiZ9Wp-tUZ45--/i=tKxzwTPBvtykMSx!0t?7c/Z?NllkokY=TEC2DSonmOMUu0gxdCeh70/rA2NSsm7Ohjn7VM2BeP";
    let TOKEN = sessionStorage.getItem("token");
    if (!TOKEN) throw new Error("Sem token.");
    TOKEN = TOKEN.replace(/"/g, "");

    const body = {
      idProtocolo: protocoloVersaoId,
      conteudo: data, 
    };

    const response = await fetch(
      `https://verita-brgchubha6ceathm.brazilsouth-01.azurewebsites.net/api/protocolo/versao/recebimento-custodia`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${TOKEN}`,
          "X-API-KEY": apiKey,
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Erro API: ${text}`);
    }

    const storageKey = `dadosRecebimentoCustodia_${protocoloMestreId}`;
    localStorage.setItem(storageKey, JSON.stringify([data]));
  };

  // --- Handlers de Botão ---
  const handleJustSave = async () => {
    setIsSaving(true);
    try {
        const data = getValues();
        if(protocoloVersaoId) await handleSaveApi(data);
        else {
            const storageKey = `dadosRecebimentoCustodia_${protocoloMestreId || "draft"}`;
            localStorage.setItem(storageKey, JSON.stringify([data]));
        }
    } catch (e) {
        console.error(e);
        setError("Erro ao salvar rascunho.");
    } finally {
        setIsSaving(false);
    }
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
        await handleSaveApi(data);
        navigate(`/formulario/destinacao-desacordo-inutilizado/${protocoloMestreId}`);
    } catch (e) {
        console.error(e);
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
              Recebimento e Custódia do PVI
            </h2>
            <Button variant="outline" onClick={generatePDF} className="text-blue-700 border-blue-200 hover:bg-blue-50">
                <FileDown className="w-4 h-4 mr-2"/>
                Exportar PDF
            </Button>
          </div>

          {error && (
            <div className="mb-6 flex items-center gap-2 rounded-md border border-red-300 bg-red-50 p-4 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            
            {/* --- SEÇÃO 1: INFORMAÇÕES DO PVI --- */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-700 mb-4 border-l-4 border-green-500 pl-3">
                    Informações do Produto (PVI)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label>Nome/Código do Produto</Label>
                        <Input {...register("nomeProduto")} className="mt-1" placeholder="Ex: Vacina X" />
                        <p className="text-red-500 text-xs mt-1">{errors.nomeProduto?.message}</p>
                    </div>
                    <div>
                        <Label>Princípio Ativo</Label>
                        <Input {...register("principioAtivo")} className="mt-1" />
                        <p className="text-red-500 text-xs mt-1">{errors.principioAtivo?.message}</p>
                    </div>
                    <div>
                        <Label>Fabricante</Label>
                        <Input {...register("fabricante")} className="mt-1" />
                        <p className="text-red-500 text-xs mt-1">{errors.fabricante?.message}</p>
                    </div>
                    <div>
                        <Label>Partida/Lote</Label>
                        <Input {...register("lote")} className="mt-1" />
                        <p className="text-red-500 text-xs mt-1">{errors.lote?.message}</p>
                    </div>
                </div>
            </div>

            {/* --- SEÇÃO 2: RECEBIMENTO --- */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-700 mb-4 border-l-4 border-blue-500 pl-3">
                    Informações de Recebimento
                </h3>
                
                {/* Linha 1: Dados básicos */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div>
                        <Label>Data Recebimento</Label>
                        <Input type="date" {...register("dataRecebimento")} className="mt-1" />
                        <p className="text-red-500 text-xs mt-1">{errors.dataRecebimento?.message}</p>
                    </div>
                    <div>
                        <Label>Horário</Label>
                        <Input type="time" {...register("horarioRecebimento")} className="mt-1" />
                        <p className="text-red-500 text-xs mt-1">{errors.horarioRecebimento?.message}</p>
                    </div>
                    <div>
                        <Label>Apresentação</Label>
                        <Input {...register("apresentacao")} className="mt-1" placeholder="Ex: Frasco-ampola" />
                        <p className="text-red-500 text-xs mt-1">{errors.apresentacao?.message}</p>
                    </div>
                    <div>
                        <Label>Quantidade</Label>
                        <Input {...register("quantidade")} className="mt-1" placeholder="Ex: 50 unidades" />
                        <p className="text-red-500 text-xs mt-1">{errors.quantidade?.message}</p>
                    </div>
                </div>

                {/* Linha 2: Checklist (Radio Buttons Customizados) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-md">
                    
                    {/* Item 1 */}
                    <div className="flex flex-col gap-2">
                        <Label className="text-sm font-semibold">Condições adequadas p/ transporte?</Label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" value="de_acordo" {...register("condicoesTransporte")} className="accent-green-600 w-4 h-4" />
                                <span>De Acordo</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" value="desacordo" {...register("condicoesTransporte")} className="accent-red-600 w-4 h-4" />
                                <span>Desacordo</span>
                            </label>
                        </div>
                        <p className="text-red-500 text-xs">{errors.condicoesTransporte?.message}</p>
                    </div>

                    {/* Item 2 */}
                    <div className="flex flex-col gap-2">
                        <Label className="text-sm font-semibold">Temperatura adequada p/ transporte?</Label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" value="de_acordo" {...register("temperaturaTransporte")} className="accent-green-600 w-4 h-4" />
                                <span>De Acordo</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" value="desacordo" {...register("temperaturaTransporte")} className="accent-red-600 w-4 h-4" />
                                <span>Desacordo</span>
                            </label>
                        </div>
                        <p className="text-red-500 text-xs">{errors.temperaturaTransporte?.message}</p>
                    </div>

                    {/* Item 3 */}
                    <div className="flex flex-col gap-2">
                        <Label className="text-sm font-semibold">Embalagem lacrada?</Label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" value="sim" {...register("embalagemLacrada")} className="accent-green-600 w-4 h-4" />
                                <span>Sim</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" value="nao" {...register("embalagemLacrada")} className="accent-red-600 w-4 h-4" />
                                <span>Não</span>
                            </label>
                        </div>
                        <p className="text-red-500 text-xs">{errors.embalagemLacrada?.message}</p>
                    </div>

                    {/* Item 4 */}
                    <div className="flex flex-col gap-2">
                        <Label className="text-sm font-semibold">PVI De Acordo para o estudo?</Label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" value="sim" {...register("pviAprovado")} className="accent-green-600 w-4 h-4" />
                                <span>Sim</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" value="nao" {...register("pviAprovado")} className="accent-red-600 w-4 h-4" />
                                <span>Não</span>
                            </label>
                        </div>
                        <p className="text-red-500 text-xs">{errors.pviAprovado?.message}</p>
                    </div>
                </div>

                {/* Alerta Condicional baseado no PDF */}
                {pviAprovadoValue === "nao" && (
                    <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-md flex items-start gap-3 text-orange-800">
                        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                        <div className="text-sm">
                            <strong>Atenção:</strong> Se o PVI não estiver De Acordo (devido transporte, temperatura ou lacre), 
                            ele deve ser segregado e documentado no formulário <em>"Destinação de PVI em Desacordo"</em>.
                        </div>
                    </div>
                )}

                <div className="mt-6">
                    <Label>Responsável pelo Recebimento</Label>
                    <Input {...register("responsavelRecebimento")} className="mt-1" />
                    <p className="text-red-500 text-xs mt-1">{errors.responsavelRecebimento?.message}</p>
                </div>
            </div>

            {/* --- SEÇÃO 3: CUSTÓDIA --- */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-700 mb-4 border-l-4 border-purple-500 pl-3">
                    Informações de Custódia
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label>Temperatura de Armazenamento</Label>
                        <Input {...register("temperaturaArmazenamento")} className="mt-1" placeholder="Ex: 2°C a 8°C" />
                        <p className="text-red-500 text-xs mt-1">{errors.temperaturaArmazenamento?.message}</p>
                    </div>
                    <div>
                        <Label>Local de Armazenamento</Label>
                        <Input {...register("localArmazenamento")} className="mt-1" />
                        <p className="text-red-500 text-xs mt-1">{errors.localArmazenamento?.message}</p>
                    </div>
                    <div className="md:col-span-2">
                        <Label>Responsável pelo Armazenamento</Label>
                        <Input {...register("responsavelArmazenamento")} className="mt-1" />
                        <p className="text-red-500 text-xs mt-1">{errors.responsavelArmazenamento?.message}</p>
                    </div>
                </div>
            </div>

            {/* --- BOTÕES --- */}
            <div className="flex flex-col sm:flex-row justify-between items-center pt-6 border-t border-gray-200 gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                disabled={isSubmitting || isSaving}
                className="w-full sm:w-auto text-gray-800 bg-white hover:bg-gray-50"
              >
                Voltar
              </Button>

              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleJustSave}
                  disabled={isSubmitting || isSaving}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 w-full sm:w-auto"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  Salvar
                </Button>

                <Button
                  type="submit"
                  disabled={isSubmitting || isSaving}
                  className="bg-[#90EE90] hover:bg-[#7CCD7C] text-green-950 font-bold w-full sm:w-auto"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      Salvar e Avançar
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>

          </form>
        </div>
      </main>
      
      <ScrollToTopButton />
    </div>
  );
};

export default FormularioRecebimentoCustodia;