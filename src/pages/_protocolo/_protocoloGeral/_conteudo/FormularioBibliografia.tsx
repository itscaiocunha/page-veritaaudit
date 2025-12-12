import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Plus, Trash2, Loader2, Info, ChevronLeft, AlertCircle, BookOpen, CheckCircle2, ArrowRight, Save } from "lucide-react";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import { useToast } from "@/hooks/use-toast";

// --- Esquemas de Validação ---
const authorSchema = yup.object({
  nome: yup.string().required("Obrigatório"),
  sobrenome: yup.string().required("Obrigatório"),
});

const generatorSchema = yup.object({
  autores: yup.array().of(authorSchema).min(1, "Adicione pelo menos um autor."),
  tituloArtigo: yup.string().required("O título do artigo é obrigatório."),
  tituloPublicacao: yup.string().required("O título do site/publicação é obrigatório."),
  local: yup.string().required("O local (cidade) é obrigatório."),
  editora: yup.string().required("A editora/instituição é obrigatória."),
  ano: yup.number()
    .typeError("O ano deve ser um número.")
    .required("O ano é obrigatório.")
    .integer("O ano deve ser um número inteiro.")
    .min(1000, "Ano inválido.")
    .max(new Date().getFullYear(), "O ano não pode ser no futuro."),
  doi: yup.string(),
  url: yup.string().url("Insira uma URL válida.").required("A URL é obrigatória."),
  dataAcesso: yup.string().required("A data de acesso é obrigatória."),
});

const mainFormSchema = yup.object({
  conteudoBibliografia: yup.string().required("A bibliografia não pode estar vazia. Adicione pelo menos uma referência."),
});

type MainFormValues = yup.InferType<typeof mainFormSchema>;
type GeneratorFormValues = yup.InferType<typeof generatorSchema>;

// --- Instruções (Tooltip) ---
const instrucoes = (
  <div className="text-left">
    <p className="font-semibold mb-2">Referências Bibliográficas:</p>
    <ul className="list-disc list-inside space-y-1">
      <li>Utilize o gerador abaixo para criar referências no formato ABNT.</li>
      <li>Preencha os campos e clique em "Adicionar à Lista".</li>
      <li>As referências geradas aparecerão na lista abaixo.</li>
      <li>Você pode remover itens da lista se necessário.</li>
    </ul>
  </div>
);

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

// --- Componente de Exibição de Referência ---
const ReferenceDisplay = ({ text, onRemove }: { text: string, onRemove: () => void }) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    
    return (
        <div className="group flex justify-between items-start p-3 bg-gray-50 border border-gray-200 rounded-md hover:bg-white hover:shadow-sm transition-all duration-200">
            <p className="text-gray-700 text-sm leading-relaxed flex-1 pr-4">
                {parts.map((part, index) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                        return <strong key={index} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>;
                    }
                    return <span key={index}>{part}</span>;
                })}
            </p>
            <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                onClick={onRemove} 
                className="h-6 w-6 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
    );
};

const FormularioBibliografia = () => {
  const navigate = useNavigate();
  const { id: protocoloMestreId } = useParams<{ id: string }>();
  const { toast } = useToast();

  // Estados
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [referencias, setReferencias] = useState<string[]>([]);
  const [protocoloVersaoId, setProtocoloVersaoId] = useState<number | null>(null);

  // Hook Form Principal
  const { 
    register: registerMain, 
    handleSubmit: handleSubmitMain, 
    formState: { errors: errorsMain }, 
    setValue 
  } = useForm<MainFormValues>({
    resolver: yupResolver(mainFormSchema),
  });

  // Hook Form Gerador
  const {
      register: registerGenerator,
      control: controlGenerator,
      handleSubmit: handleSubmitGenerator,
      reset: resetGenerator,
      formState: { errors: errorsGenerator }
  } = useForm<GeneratorFormValues>({
      resolver: yupResolver(generatorSchema),
      defaultValues: {
          autores: [{ nome: '', sobrenome: '' }],
          tituloArtigo: '',
          tituloPublicacao: '',
          local: '',
          editora: '',
          ano: undefined,
          doi: '',
          url: '',
          dataAcesso: '',
      }
  });

  const { fields, append, remove } = useFieldArray({
      control: controlGenerator,
      name: "autores"
  });

  // --- 1. Carregar Dados (API + Cache) ---
  useEffect(() => {
    const storageKey = `dadosBibliografia_${protocoloMestreId || "draft"}`;

    if (!protocoloMestreId) {
      setError("ID do protocolo não encontrado (Modo Rascunho).");
      setIsDataLoading(false);
      const saved = JSON.parse(localStorage.getItem(storageKey) || "{}");
      if (saved.conteudoBibliografia) {
         const refs = saved.conteudoBibliografia.split('\n\n').filter((r: string) => r);
         setReferencias(refs);
      }
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
          { 
            headers: { 
                "Content-Type": "application/json",
                Authorization: `Bearer ${TOKEN}`, 
                "X-API-KEY": apiKey 
            } 
          }
        );

        if (!response.ok) {
            let errorMsg = `Erro ${response.status}`;
            if (response.status === 404) {
                // errorMsg = "Protocolo não encontrado (404)."; // Opcional: ignorar erro 404 se for novo
            } else {
                try {
                    const text = await response.text();
                    try {
                        const jsonErr = JSON.parse(text);
                        if (jsonErr.message) errorMsg = jsonErr.message;
                        else if (jsonErr.error) errorMsg = jsonErr.error;
                        else errorMsg += `: ${text.slice(0, 50)}`;
                    } catch {
                        errorMsg += `: ${text.slice(0, 50)}`;
                    }
                } catch {}
                throw new Error(errorMsg);
            }
        }

        const data = await response.json();
        setProtocoloVersaoId(data.id);

        let savedRefs: string[] = [];
        
        if (data.bibliografia?.conteudos && Array.isArray(data.bibliografia.conteudos)) {
            savedRefs = data.bibliografia.conteudos;
        } 
        else if (data.bibliografia?.conteudo?.conteudoBibliografia) {
            savedRefs = data.bibliografia.conteudo.conteudoBibliografia.split('\n\n').filter((r: string) => r);
        }

        if (savedRefs.length > 0) {
            setReferencias(savedRefs);
            localStorage.setItem(storageKey, JSON.stringify({ conteudoBibliografia: savedRefs.join('\n\n') }));
        } else {
            const saved = JSON.parse(localStorage.getItem(storageKey) || "{}");
            if (saved.conteudoBibliografia) {
                const refs = saved.conteudoBibliografia.split('\n\n').filter((r: string) => r);
                setReferencias(refs);
            }
        }
      } catch (err) {
        console.error(err);
        const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
        setError(`Erro: ${errorMessage}. Carregando dados locais.`);
        
        const saved = JSON.parse(localStorage.getItem(storageKey) || "{}");
        if (saved.conteudoBibliografia) {
            const refs = saved.conteudoBibliografia.split('\n\n').filter((r: string) => r);
            setReferencias(refs);
        }
      } finally {
        setIsDataLoading(false);
      }
    };
    fetchDados();
  }, [protocoloMestreId, navigate]);

  // Sincroniza
  useEffect(() => {
    const fullText = referencias.join('\n\n');
    setValue('conteudoBibliografia', fullText, { shouldValidate: true });
  }, [referencias, setValue]);

  // --- Lógica ABNT ---
  const formatarABNT = (data: GeneratorFormValues): string => {
    const autoresFormatados = data.autores.map(a => `${a.sobrenome.toUpperCase()}, ${a.nome}`).join('; ');
    const [anoAcesso, mesAcesso, diaAcesso] = data.dataAcesso.split('-').map(Number);
    const meses = ["jan.", "fev.", "mar.", "abr.", "maio", "jun.", "jul.", "ago.", "set.", "out.", "nov.", "dez."];
    const mesFormatado = meses[(mesAcesso || 1) - 1]; 
    const dataAcessoFormatada = `${diaAcesso || 1} ${mesFormatado} ${anoAcesso || 2024}`;

    let ref = `${autoresFormatados}. ${data.tituloArtigo}. **${data.tituloPublicacao}**, ${data.local}: ${data.editora}, ${data.ano}. `;
    if (data.doi) ref += `DOI/ISSN: ${data.doi}. `;
    ref += `Disponível em: <${data.url}>. `;
    ref += `Acesso em: ${dataAcessoFormatada}.`;
    return ref;
  }

  const onAddReferencia = (data: GeneratorFormValues) => {
      const novaReferencia = formatarABNT(data);
      setReferencias(prev => [...prev, novaReferencia]);
      resetGenerator({
        autores: [{ nome: '', sobrenome: '' }],
        tituloArtigo: '',
        tituloPublicacao: '',
        local: '',
        editora: '',
        ano: undefined,
        doi: '',
        url: '',
        dataAcesso: '',
      });
  };

  const handleRemoveReferencia = (indexToRemove: number) => {
      setReferencias(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  // --- Salvar API ---
  const handleSaveApi = async (data: MainFormValues) => {
      if (!protocoloVersaoId) throw new Error("Versão do protocolo não identificada.");
      
      const apiKey = "2NtzCUDl8Ib2arnDRck0xK8taguGeFYuZqnUzpiZ9Wp-tUZ45--/i=tKxzwTPBvtykMSx!0t?7c/Z?NllkokY=TEC2DSonmOMUu0gxdCeh70/rA2NSsm7Ohjn7VM2BeP";
      let TOKEN = sessionStorage.getItem("token")?.replace(/"/g, "");
      
      const body = { 
          idProtocolo: protocoloVersaoId, 
          conteudos: referencias 
      };

      const response = await fetch(
        `https://verita-brgchubha6ceathm.brazilsouth-01.azurewebsites.net/api/protocolo/versao/bibliografia`, 
        {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${TOKEN}`, "X-API-KEY": apiKey },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
          const errorText = await response.text();
          try {
              const jsonErr = JSON.parse(errorText);
              throw new Error(jsonErr.message || "Erro desconhecido");
          } catch {
              throw new Error(`Falha ao salvar: ${errorText}`);
          }
      }
      
      setProtocoloVersaoId((prev) => (prev ? prev + 1 : null));
      localStorage.setItem(`dadosBibliografia_${protocoloMestreId}`, JSON.stringify(data));
  };

  const handleJustSave = async () => {
      setIsSaving(true);
      setError(null);
      try {
          const fullText = referencias.join('\n\n');
          if(protocoloVersaoId) await handleSaveApi({ conteudoBibliografia: fullText });
          else localStorage.setItem(`dadosBibliografia_${protocoloMestreId || "draft"}`, JSON.stringify({ conteudoBibliografia: fullText }));
          
          toast({
            title: "Sucesso!",
            description: "Rascunho salvo com sucesso.",
            action: <CheckCircle2 className="h-5 w-5 text-green-500" />,
            className: "bg-green-50 border-green-200 text-green-800",
          });
      } catch (e) {
          console.error(e);
          const errorMsg = e instanceof Error ? e.message : "Erro ao salvar.";
          setError(errorMsg);
          toast({ variant: "destructive", title: "Erro", description: errorMsg });
      } finally {
          setIsSaving(false);
      }
  };

  const onMainSubmit = async (data: MainFormValues) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await handleSaveApi(data);
      navigate(`/protocolo-final/${protocoloMestreId}`);
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
        <div className="w-full max-w-4xl rounded-xl p-6 sm:p-8 bg-white/70 backdrop-blur-md shadow-xl border border-white/30 relative">
            
            {isDataLoading && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm rounded-xl">
                    <Loader2 className="w-10 h-10 animate-spin text-green-600" />
                </div>
            )}

            <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">
                14. Bibliografia
            </h2>

            {error && (
                <div className="mb-4 flex items-center gap-2 rounded-md border border-red-300 bg-red-50 p-4 text-red-700">
                    <AlertCircle className="h-5 w-5" />
                    <p>{error}</p>
                </div>
            )}

            {/* --- SEÇÃO GERADOR (Collapsible style or just block) --- */}
            <div className="space-y-6">
                
                {/* --- HEADER COM TOOLTIP --- */}
                <div className="flex items-center gap-2 mb-2">
                    <Label className="text-base font-semibold text-gray-700">
                        Gerador de Referência (ABNT)
                    </Label>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Info className="w-4 h-4 text-gray-500 cursor-pointer" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-sm">
                                {instrucoes}
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg bg-white/50 space-y-4">
                    {/* Autores */}
                    <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-600">Autores</Label>
                        {fields.map((field, index) => (
                            <div key={field.id} className="flex gap-2">
                                <Input {...registerGenerator(`autores.${index}.nome`)} placeholder="Nome" className="bg-white text-sm" />
                                <Input {...registerGenerator(`autores.${index}.sobrenome`)} placeholder="Sobrenome" className="bg-white text-sm" />
                                <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length <= 1} className="text-gray-400 hover:text-red-500">
                                    <Trash2 className="h-4 w-4"/>
                                </Button>
                            </div>
                        ))}
                        <Button type="button" variant="outline" size="sm" onClick={() => append({ nome: '', sobrenome: '' })} className="text-xs">
                            <Plus className="h-3 w-3 mr-1"/> Adicionar Autor
                        </Button>
                        {errorsGenerator.autores && <p className="text-red-500 text-xs">{errorsGenerator.autores.message}</p>}
                    </div>

                    {/* Campos Artigo - Grid Compacto */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <Input {...registerGenerator("tituloArtigo")} placeholder="Título do Artigo" className="bg-white text-sm" />
                            <p className="text-red-500 text-xs mt-1">{errorsGenerator.tituloArtigo?.message}</p>
                        </div>
                        <div>
                            <Input {...registerGenerator("tituloPublicacao")} placeholder="Título da Publicação" className="bg-white text-sm" />
                            <p className="text-red-500 text-xs mt-1">{errorsGenerator.tituloPublicacao?.message}</p>
                        </div>
                        <div>
                            <Input {...registerGenerator("local")} placeholder="Local (Cidade)" className="bg-white text-sm" />
                            <p className="text-red-500 text-xs mt-1">{errorsGenerator.local?.message}</p>
                        </div>
                        <div>
                            <Input {...registerGenerator("editora")} placeholder="Editora/Instituição" className="bg-white text-sm" />
                            <p className="text-red-500 text-xs mt-1">{errorsGenerator.editora?.message}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <Input type="number" {...registerGenerator("ano")} placeholder="Ano" className="bg-white text-sm" />
                            <Input {...registerGenerator("doi")} placeholder="DOI/ISSN (Opcional)" className="bg-white text-sm" />
                        </div>
                        <div>
                            <Input
                                placeholder="Data de Acesso"
                                type="text"
                                onFocus={(e) => (e.target.type = "date")}
                                onBlur={(e) => (e.target.type = "text")}
                                {...registerGenerator("dataAcesso")}
                                className="bg-white text-sm text-gray-500"
                            />
                            <p className="text-red-500 text-xs mt-1">{errorsGenerator.dataAcesso?.message}</p>
                        </div>
                        <div className="md:col-span-2">
                            <Input {...registerGenerator("url")} placeholder="URL (https://...)" className="bg-white text-sm" />
                            <p className="text-red-500 text-xs mt-1">{errorsGenerator.url?.message}</p>
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <Button type="button" onClick={handleSubmitGenerator(onAddReferencia)} className="bg-[#90EE90] hover:bg-[#7CCD7C] text-green-950 font-bold px-4 py-3 text-lg h-auto rounded-md transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                            <Plus className="w-3 h-3 mr-2"/>
                            Adicionar à Lista
                        </Button>
                    </div>
                </div>
            </div>

            {/* --- LISTA DE REFERÊNCIAS --- */}
            <form onSubmit={handleSubmitMain(onMainSubmit)} className="space-y-8 mt-8">
                 <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Label className="text-base font-semibold text-gray-700">
                            Referências Geradas
                        </Label>
                    </div>
                    
                    <div className="space-y-2 min-h-[100px] p-4 bg-white/40 rounded-lg border border-white/20">
                        {referencias.length > 0 ? (
                            referencias.map((ref, index) => (
                                <ReferenceDisplay key={index} text={ref} onRemove={() => handleRemoveReferencia(index)} />
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                                <BookOpen className="w-8 h-8 mb-2 opacity-50" />
                                <p className="text-sm">Nenhuma referência adicionada.</p>
                            </div>
                        )}
                    </div>

                    {/* Campo oculto para validação */}
                    <Textarea {...registerMain("conteudoBibliografia")} className="hidden" />
                    <p className="text-red-500 text-sm mt-2">{errorsMain.conteudoBibliografia?.message}</p>
                </div>

                {/* --- BOTÕES --- */}
                <div className="flex flex-col sm:flex-row justify-between items-center pt-6 border-t border-gray-200 gap-4">
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

export default FormularioBibliografia;