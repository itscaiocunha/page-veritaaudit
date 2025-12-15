import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Plus, Loader2, Save, ArrowRight, ChevronLeft, AlertCircle, CalendarClock, CheckCircle2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import { useToast } from "@/hooks/use-toast";

// --- Schema de Validação ---
const atividadeSchema = yup.object({
  diaEstudo: yup.string().required("Obrigatório"),
  data: yup.string().required("Obrigatório"), // Ajustado para 'data' conforme API
  atividade: yup.string().required("Obrigatório"),
  numeroFormulario: yup.string().required("Obrigatório"), // Ajustado para 'numeroFormulario' conforme API
});

const validationSchema = yup.object({
  duracaoEstudo: yup.number()
    .typeError("Deve ser um número")
    .positive("Deve ser um número positivo")
    .integer("Deve ser um número inteiro")
    .required("A duração é obrigatória."),
  atividades: yup.array().of(atividadeSchema).min(1, "Adicione pelo menos uma atividade ao cronograma."),
});

type FormValues = yup.InferType<typeof validationSchema>;

const newEmptyActivity = {
    diaEstudo: "",
    data: "",
    atividade: "",
    numeroFormulario: "",
};

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

const FormularioCronograma = () => {
  const navigate = useNavigate();
  const { id: protocoloMestreId } = useParams<{ id: string }>();
  const { toast } = useToast();

  // Estados
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [protocoloVersaoId, setProtocoloVersaoId] = useState<number | null>(null);

  const { register, control, handleSubmit, formState: { errors }, reset, getValues } = useForm<FormValues>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
        duracaoEstudo: undefined,
        atividades: [newEmptyActivity],
    }
  });

  const { fields, append, remove } = useFieldArray({
      control,
      name: "atividades",
  });

  // --- 1. Carregar Dados (API + Cache) ---
  useEffect(() => {
    const storageKey = `dadosCronograma_${protocoloMestreId || "draft"}`;

    if (!protocoloMestreId) {
      setError("ID do protocolo não encontrado (Modo Rascunho).");
      setIsDataLoading(false);
      const saved = JSON.parse(localStorage.getItem(storageKey) || "{}");
      if (saved.duracaoEstudo) reset(saved);
      return;
    }

    const fetchDados = async () => {
      setIsDataLoading(true);
      const apiKey = "2NtzCUDl8Ib2arnDRck0xK8taguGeFYuZqnUzpiZ9Wp-tUZ45--/i=tKxzwTPBvtykMSx!0t?7c/Z?NllkokY=TEC2DSonmOMUu0gxdCeh70/rA2NSsm7Ohjn7VM2BeP";
      let TOKEN = sessionStorage.getItem("token")?.replace(/"/g, "");
      if (!TOKEN) { navigate("/login"); return; }

      try {
        const response = await fetch(
          `https://verita-brgchubha6ceathm.brazilsouth-01.azurewebsites.net/api/protocolo/versao/ativo/detalhes/${protocoloMestreId}`,
          { headers: { "Content-Type": "application/json", Authorization: `Bearer ${TOKEN}`, "X-API-KEY": apiKey } }
        );

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`Erro ${response.status}: ${text.slice(0, 100)}`);
        }

        const data = await response.json();
        setProtocoloVersaoId(data.id);

        const backendData = data.cronograma?.conteudo;
        
        if (backendData) {
            // Garante compatibilidade de campos se o backend retornar nomes diferentes no futuro
            // Mas assume que o backend retorna estrutura similar ao POST
            reset(backendData);
            localStorage.setItem(storageKey, JSON.stringify(backendData));
        } else {
            const saved = JSON.parse(localStorage.getItem(storageKey) || "{}");
            if (saved.duracaoEstudo) reset(saved);
        }
      } catch (err) {
        console.error(err);
        setError("Erro ao carregar dados do servidor. Usando cache local.");
        const saved = JSON.parse(localStorage.getItem(storageKey) || "{}");
        if (saved.duracaoEstudo) reset(saved);
      } finally {
        setIsDataLoading(false);
      }
    };
    fetchDados();
  }, [protocoloMestreId, navigate, reset]);

  // --- Função para Salvar na API ---
  const handleSaveApi = async (data: FormValues) => {
      if (!protocoloVersaoId) throw new Error("ID da versão do protocolo não identificado.");

      const apiKey = "2NtzCUDl8Ib2arnDRck0xK8taguGeFYuZqnUzpiZ9Wp-tUZ45--/i=tKxzwTPBvtykMSx!0t?7c/Z?NllkokY=TEC2DSonmOMUu0gxdCeh70/rA2NSsm7Ohjn7VM2BeP";
      let TOKEN = sessionStorage.getItem("token")?.replace(/"/g, "");

      // Payload conforme especificação
      const payload = {
          idProtocolo: protocoloVersaoId,
          duracaoEstudo: data.duracaoEstudo,
          atividades: data.atividades
      };

      const response = await fetch(
        `https://verita-brgchubha6ceathm.brazilsouth-01.azurewebsites.net/api/protocolo/versao/cronograma`,
        {
            method: "POST",
            headers: { 
                "Content-Type": "application/json", 
                "Authorization": `Bearer ${TOKEN}`, 
                "X-API-KEY": apiKey 
            },
            body: JSON.stringify(payload)
        }
      );

      if (!response.ok) {
          const text = await response.text();
          let msg = `Erro ao salvar: ${text}`;
          try {
              const json = JSON.parse(text);
              if (json.message) msg = json.message;
          } catch {}
          throw new Error(msg);
      }

      setProtocoloVersaoId(prev => prev ? prev + 1 : null);
      localStorage.setItem(`dadosCronograma_${protocoloMestreId}`, JSON.stringify(data));
  };

  // --- Handler: Apenas Salvar ---
  const handleJustSave = async () => {
      setIsSaving(true);
      setError(null);
      try {
          const data = getValues();
          // Validação manual básica para garantir que não quebre (opcional, o backend valida)
          // Mas como getValues não valida, enviamos o que tem.
          
          if (protocoloVersaoId) {
              // Se duration for undefined ou NaN, define como 0 ou trata
              const dataToSave = {
                  ...data,
                  duracaoEstudo: Number(data.duracaoEstudo) || 0
              };
              
              await handleSaveApi(dataToSave as FormValues);
              
              toast({
                  title: "Sucesso!",
                  description: "Cronograma salvo com sucesso.",
                  action: <CheckCircle2 className="h-5 w-5 text-green-500" />,
                  className: "bg-green-50 border-green-200 text-green-800",
              });
          } else {
              localStorage.setItem(`dadosCronograma_${protocoloMestreId || "draft"}`, JSON.stringify(data));
              toast({ title: "Rascunho salvo localmente." });
          }
      } catch (err) {
          console.error(err);
          const msg = err instanceof Error ? err.message : "Erro desconhecido";
          setError(msg);
          toast({ variant: "destructive", title: "Erro ao salvar", description: msg });
      } finally {
          setIsSaving(false);
      }
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setError(null);
    try {
      if (protocoloVersaoId) {
          await handleSaveApi(data);
      } else {
          localStorage.setItem(`dadosCronograma_${protocoloMestreId || "draft"}`, JSON.stringify(data));
      }
      // Navega para a próxima página (ajustar conforme fluxo real, ex: /anexos/90 ou /finalizacao)
      // Baseado no seu código anterior: navigate("/anexos/90");
      // Mas seguindo a lógica de rotas:
      navigate(`/anexos/${protocoloMestreId}`); // ou onde for o próximo passo
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Erro ao salvar";
      setError(msg);
      toast({ variant: "destructive", title: "Erro", description: msg });
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

            <div className="flex items-center gap-3 mb-8 border-b pb-4">
                <h2 className="text-2xl font-semibold text-gray-800">
                    12. Cronograma do Estudo
                </h2>
            </div>

            {error && (
                <div className="mb-6 flex items-center gap-2 rounded-md border border-red-300 bg-red-50 p-4 text-red-700">
                    <AlertCircle className="h-5 w-5" />
                    <p>{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              
              {/* Duração */}
              <div className="p-6 border border-gray-200 rounded-xl bg-white/50 space-y-4">
                  <div className="max-w-xs">
                    <Label htmlFor="duracaoEstudo" className="text-base font-semibold text-gray-700">Duração do Estudo (dias)</Label>
                    <Input 
                        id="duracaoEstudo" 
                        type="number"
                        placeholder="Ex: 30"
                        {...register("duracaoEstudo")}
                        className="mt-2 bg-white"
                    />
                    <p className="text-red-500 text-sm mt-1">{errors.duracaoEstudo?.message}</p>
                  </div>
              </div>

              {/* Tabela de Atividades */}
              <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50 hover:bg-gray-100">
                            <TableHead className="w-[15%] text-gray-700 font-semibold">Dia do estudo</TableHead>
                            <TableHead className="w-[20%] text-gray-700 font-semibold">Data</TableHead>
                            <TableHead className="w-[40%] text-gray-700 font-semibold">Atividade</TableHead>
                            <TableHead className="w-[20%] text-gray-700 font-semibold">Nº do Formulário</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {fields.map((field, index) => (
                            <TableRow key={field.id} className="hover:bg-gray-50/50">
                                <TableCell className="p-2 align-top">
                                    <Input placeholder="Ex: D0" {...register(`atividades.${index}.diaEstudo`)} className="bg-white" />
                                    <p className="text-red-500 text-xs mt-1">{errors.atividades?.[index]?.diaEstudo?.message}</p>
                                </TableCell>
                                <TableCell className="p-2 align-top">
                                    <Input type="date" {...register(`atividades.${index}.data`)} className="bg-white" />
                                    <p className="text-red-500 text-xs mt-1">{errors.atividades?.[index]?.data?.message}</p>
                                </TableCell>
                                <TableCell className="p-2 align-top">
                                    <Textarea 
                                        placeholder="Descreva a atividade..." 
                                        {...register(`atividades.${index}.atividade`)} 
                                        className="bg-white min-h-[40px] resize-y" 
                                    />
                                    <p className="text-red-500 text-xs mt-1">{errors.atividades?.[index]?.atividade?.message}</p>
                                </TableCell>
                                <TableCell className="p-2 align-top">
                                    <Input placeholder="Ex: 2A" {...register(`atividades.${index}.numeroFormulario`)} className="bg-white" />
                                    <p className="text-red-500 text-xs mt-1">{errors.atividades?.[index]?.numeroFormulario?.message}</p>
                                </TableCell>
                                <TableCell className="p-2 align-top text-center">
                                    <Button 
                                        type="button" 
                                        variant="ghost" 
                                        size="icon" 
                                        onClick={() => remove(index)} 
                                        className="text-gray-400 hover:text-red-600 hover:bg-red-50"
                                        disabled={fields.length === 1 && index === 0} // Impede remover o último se for o único
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                
                <div className="p-4 bg-gray-50 border-t border-gray-200">
                    <Button type="button" variant="outline" size="sm" onClick={() => append(newEmptyActivity)} className="bg-white hover:bg-gray-100 text-green-600 border-green-200">
                        <Plus className="h-4 w-4 mr-2" /> Adicionar Nova Atividade
                    </Button>
                    {errors.atividades && <p className="text-red-500 text-sm mt-2 font-medium">{errors.atividades.message}</p>}
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  disabled={isSubmitting || isSaving || isDataLoading}
                  className="text-gray-800 bg-white/80 hover:bg-gray-50"
                >
                  Voltar
                </Button>

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleJustSave}
                    disabled={
                      !protocoloVersaoId ||
                      isDataLoading ||
                      isSubmitting ||
                      isSaving
                    }
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-6 py-3 text-lg h-auto rounded-md transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Salvando...</span>
                      </>
                    ) : (
                      "Salvar"
                    )}
                  </Button>

                  <Button
                    type="submit"
                    className="bg-[#90EE90] hover:bg-[#7CCD7C] text-green-950 font-bold px-8 py-3 text-lg h-auto rounded-md transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled={isDataLoading || isSubmitting || isSaving}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Salvando...</span>
                      </>
                    ) : (
                      "Salvar e Avançar"
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

export default FormularioCronograma;