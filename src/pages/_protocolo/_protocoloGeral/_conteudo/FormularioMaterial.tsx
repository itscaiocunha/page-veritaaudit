import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Loader2, Save, ArrowRight, ChevronLeft, AlertCircle, FlaskConical, CheckCircle2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import { useToast } from "@/hooks/use-toast";

// --- Esquemas de Validação ---
const caracteristicasGeraisSchema = yup.object({
    especie: yup.string().required("Obrigatório"),
    raca: yup.string().required("Obrigatório"),
    sexo: yup.string().required("Obrigatório"),
    idade: yup.string().required("Obrigatório"),
    peso: yup.string().required("Obrigatório"),
    identificacao: yup.string().required("Obrigatório"),
});

const outrasAvaliacoesSchema = yup.object({
    nome: yup.string().required("Nome obrigatório"),
    descricao: yup.string().required("Descrição obrigatória"),
});

const pviSchema = yup.object().shape({
    identificacao: yup.string().required("Obrigatório."),
    principioAtivo: yup.string().required("Obrigatório."),
    concentracao: yup.string().required("Obrigatório."),
    apresentacoes: yup.string().required("Obrigatório."),
    lote: yup.string().required("Obrigatório."),
    dataFabricacao: yup.string().required("Obrigatório."),
    dataValidade: yup.string().required("Obrigatório."),
    fabricante: yup.string().required("Obrigatório."),
    dosagem: yup.string().required("Obrigatório."),
    viaAdministracao: yup.string().required("Obrigatório."),
});

const validationSchema = yup.object({
    // 6.1
    animais: yup.object({
        origemDestino: yup.string().required("Origem e Destino é obrigatório."),
        caracteristicasGerais: yup.array().of(caracteristicasGeraisSchema).min(1, "Adicione pelo menos um animal."),
        justificativaN: yup.string().required("A justificativa do 'n' amostral é obrigatória."),
    }),
    // 6.2
    manejoAlojamento: yup.object({
        instalacaoManejo: yup.string().required("Instalação e Manejo é obrigatório."),
        alimentacaoAgua: yup.string().required("Alimentação e Água é obrigatório."),
    }),
    // 6.3
    criterios: yup.object({
        inclusao: yup.string().required("Critérios de Inclusão são obrigatórios."),
        exclusao: yup.string().required("Critérios de Exclusão são obrigatórios."),
        remocao: yup.string().required("Critérios de Remoção são obrigatórios."),
    }),
    // 6.4
    avaliacaoClinica: yup.object({
        // Adicionando limite de 255 caracteres conforme erro do banco de dados
        exameFisico: yup.string().required("Exame Físico é obrigatório.").max(255, "Máximo de 255 caracteres permitidos."),
        exameLaboratorial: yup.string().required("Exame Laboratorial é obrigatório.").max(255, "Máximo de 255 caracteres permitidos."),
        outrasAvaliacoes: yup.array().of(outrasAvaliacoesSchema),
    }),
    // 6.5 a 6.8
    aclimatacao: yup.string().required("Aclimatação/Quarentena é obrigatório."),
    selecao: yup.string().required("Seleção é obrigatório."),
    randomizacao: yup.string().required("Randomização é obrigatório."),
    cegamento: yup.string().required("Cegamento é obrigatório."),
    // 6.9
    tratamento: yup.object({
        descricao: yup.string().required("A descrição do tratamento é obrigatória."),
        pvi: pviSchema.required("Dados do PVI incompletos."),
    }),
    // 6.10
    parametrosAvaliacao: yup.string().required("Parâmetros de Avaliação são obrigatórios."),
});

type FormValues = yup.InferType<typeof validationSchema>;

const newEmptyPVI = {
    identificacao: "",
    principioAtivo: "",
    concentracao: "",
    apresentacoes: "",
    lote: "",
    dataFabricacao: "",
    dataValidade: "",
    fabricante: "",
    dosagem: "",
    viaAdministracao: "",
};

// Helper para formatar data YYYY-MM-DD
const formatDateForInput = (dateString: string) => {
    if (!dateString) return "";
    return dateString.split('T')[0];
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

const FormularioMaterialMetodo = () => {
    const navigate = useNavigate();
    const { id: protocoloMestreId } = useParams<{ id: string }>();
    const { toast } = useToast();

    // Estados
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [protocoloVersaoId, setProtocoloVersaoId] = useState<number | null>(null);

    const { register, handleSubmit, formState: { errors }, reset, control, setValue, getValues } = useForm<FormValues>({
        resolver: yupResolver(validationSchema),
        defaultValues: {
            animais: {
                caracteristicasGerais: [{ especie: '', raca: '', sexo: '', idade: '', peso: '', identificacao: '' }]
            },
            avaliacaoClinica: {
                outrasAvaliacoes: []
            },
            tratamento: {
                pvi: newEmptyPVI,
            }
        }
    });

    const { fields: caracteristicasFields, append: appendCaracteristica, remove: removeCaracteristica } = useFieldArray({ control, name: "animais.caracteristicasGerais" });
    const { fields: outrasAvaliacoesFields, append: appendOutraAvaliacao, remove: removeOutraAvaliacao } = useFieldArray({ control, name: "avaliacaoClinica.outrasAvaliacoes" });

    // --- 1. Carregar Dados (API + Cache) ---
    useEffect(() => {
        const storageKey = `dadosMaterialMetodo_${protocoloMestreId || "draft"}`;

        if (!protocoloMestreId) {
            setError("ID do protocolo não encontrado (Modo Rascunho).");
            setIsDataLoading(false);
            const savedData = JSON.parse(localStorage.getItem(storageKey) || "null");
            if (savedData) reset(savedData);
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
                    { headers: { Authorization: `Bearer ${TOKEN}`, "X-API-KEY": apiKey } }
                );

                if (!response.ok) {
                    const text = await response.text();
                    throw new Error(`Erro ${response.status}: ${text.slice(0, 100)}`);
                }

                const data = await response.json();
                setProtocoloVersaoId(data.id);

                const backendData = data.materiaisMetodos?.conteudo;

                if (backendData) {
                    const formData: any = {
                        ...backendData,
                        animais: {
                            origemDestino: backendData.animal?.origemDestino || "",
                            justificativaN: backendData.animal?.quantidade || "", 
                            caracteristicasGerais: backendData.animal?.caracteristicas || []
                        },
                        avaliacaoClinica: {
                            ...backendData.avaliacaoClinica,
                            outrasAvaliacoes: backendData.outrasAvalicaoes || []
                        },
                        tratamento: {
                            descricao: backendData.tratamento || "",
                            pvi: {
                                identificacao: backendData.produtoVeterinario?.identificacao || "",
                                principioAtivo: backendData.produtoVeterinario?.principioAtivo || "",
                                concentracao: backendData.produtoVeterinario?.concentracao || "",
                                apresentacoes: backendData.produtoVeterinario?.apresentacoes || "",
                                lote: backendData.produtoVeterinario?.partidaLote || "",
                                dataFabricacao: formatDateForInput(backendData.produtoVeterinario?.dataFabricacao) || "",
                                dataValidade: formatDateForInput(backendData.produtoVeterinario?.dataValidade) || "",
                                fabricante: backendData.produtoVeterinario?.fabricante || "",
                                dosagem: backendData.produtoVeterinario?.dosagemIndicada || "",
                                viaAdministracao: backendData.produtoVeterinario?.viaAdministracao || ""
                            }
                        }
                    };
                    reset(formData);
                    localStorage.setItem(storageKey, JSON.stringify(formData));
                } else {
                    const savedData = JSON.parse(localStorage.getItem(storageKey) || "null");
                    if (savedData) reset(savedData);
                    else {
                        try {
                            const produtosData = JSON.parse(localStorage.getItem("dadosProdutoVeterinario") || "null");
                            if (produtosData?.produtos?.length > 0) {
                                const pviInventario = produtosData.produtos[0];
                                const pviMapeado = {
                                    identificacao: pviInventario.identificacao || "",
                                    principioAtivo: pviInventario.principioAtivo || "",
                                    concentracao: pviInventario.concentracao || "",
                                    apresentacoes: pviInventario.apresentacao || "",
                                    lote: pviInventario.lote || "",
                                    dataFabricacao: formatDateForInput(pviInventario.dataFabricacao) || "",
                                    dataValidade: formatDateForInput(pviInventario.dataValidade) || "",
                                    fabricante: pviInventario.fabricante || "",
                                    dosagem: "", 
                                    viaAdministracao: ""
                                };
                                setValue('tratamento.pvi', pviMapeado);
                            }
                        } catch (e) { console.error(e); }
                    }
                }
            } catch (err) {
                console.error(err);
                setError("Erro ao carregar dados. Usando cache local.");
                const savedData = JSON.parse(localStorage.getItem(storageKey) || "null");
                if (savedData) reset(savedData);
            } finally {
                setIsDataLoading(false);
            }
        };
        fetchDados();
    }, [protocoloMestreId, navigate, reset, setValue]);

    // --- Salvar API ---
    const handleSaveApi = async (data: FormValues) => {
        if (!protocoloVersaoId) throw new Error("ID da versão não identificado.");

        const apiKey = "2NtzCUDl8Ib2arnDRck0xK8taguGeFYuZqnUzpiZ9Wp-tUZ45--/i=tKxzwTPBvtykMSx!0t?7c/Z?NllkokY=TEC2DSonmOMUu0gxdCeh70/rA2NSsm7Ohjn7VM2BeP";
        let TOKEN = sessionStorage.getItem("token")?.replace(/"/g, "");

        const payload = {
            idProtocolo: protocoloVersaoId,
            animal: {
                origemDestino: data.animais.origemDestino,
                caracteristicas: data.animais.caracteristicasGerais,
                quantidade: data.animais.justificativaN 
            },
            manejoAlojamento: data.manejoAlojamento,
            criterios: data.criterios,
            avaliacaoClinica: {
                exameFisico: data.avaliacaoClinica.exameFisico,
                exameLaboratorial: data.avaliacaoClinica.exameLaboratorial
            },
            outrasAvalicaoes: data.avaliacaoClinica.outrasAvaliacoes || [],
            aclimatacao: data.aclimatacao,
            selecao: data.selecao,
            randomizacao: data.randomizacao,
            cegamento: data.cegamento,
            tratamento: data.tratamento.descricao,
            produtoVeterinario: {
                identificacao: data.tratamento.pvi.identificacao,
                principioAtivo: data.tratamento.pvi.principioAtivo,
                concentracao: data.tratamento.pvi.concentracao,
                partidaLote: data.tratamento.pvi.lote,
                fabricante: data.tratamento.pvi.fabricante,
                dataFabricacao: data.tratamento.pvi.dataFabricacao,
                dataValidade: data.tratamento.pvi.dataValidade,
                viaAdministracao: data.tratamento.pvi.viaAdministracao,
                apresentacoes: data.tratamento.pvi.apresentacoes,
                dosagemIndicada: data.tratamento.pvi.dosagem
            },
            parametrosAvaliacao: data.parametrosAvaliacao
        };

        const response = await fetch(
            `https://verita-brgchubha6ceathm.brazilsouth-01.azurewebsites.net/api/protocolo/versao/materiais-metodos`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${TOKEN}`, "X-API-KEY": apiKey },
                body: JSON.stringify(payload)
            }
        );

        if (!response.ok) {
            const text = await response.text();
            let msg = `Erro ao salvar: ${text}`;
            try {
                const json = JSON.parse(text);
                if (json.message) msg = json.message;
                else if (json.error) msg = json.error; // Pega o erro do banco de dados também
            } catch {}
            throw new Error(msg);
        }

        setProtocoloVersaoId(prev => prev ? prev + 1 : null);
        localStorage.setItem(`dadosMaterialMetodo_${protocoloMestreId}`, JSON.stringify(data));
    };

    // --- Salvar Rascunho ---
    const handleJustSave = async () => {
        setIsSaving(true);
        setError(null);
        try {
            const data = getValues();
            
            if (protocoloVersaoId) {
                await handleSaveApi(data);
                toast({
                    title: "Sucesso!",
                    description: "Dados salvos com sucesso.",
                    className: "bg-green-50 border-green-200 text-green-800",
                });
            } else {
                localStorage.setItem(`dadosMaterialMetodo_${protocoloMestreId || "draft"}`, JSON.stringify(data));
                toast({ title: "Rascunho salvo localmente." });
            }
        } catch (e) {
            console.error(e);
            const msg = e instanceof Error ? e.message : "Erro ao salvar";
            setError(msg);
            toast({ variant: "destructive", title: "Erro", description: msg });
        } finally {
            setIsSaving(false);
        }
    };

    // --- Submit Final ---
    const onSubmit = async (data: FormValues) => {
        setIsSubmitting(true);
        setError(null);
        try {
            if (protocoloVersaoId) {
                await handleSaveApi(data);
            } else {
                localStorage.setItem(`dadosMaterialMetodo_${protocoloMestreId || "draft"}`, JSON.stringify(data));
            }
            navigate(`/estatistica/${protocoloMestreId}`);
        } catch (e) {
            console.error(e);
            const msg = e instanceof Error ? e.message : "Erro ao salvar";
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
                            6. Material e Métodos
                        </h2>
                    </div>

                    {error && (
                        <div className="mb-6 flex items-center gap-2 rounded-md border border-red-300 bg-red-50 p-4 text-red-700">
                            <AlertCircle className="h-5 w-5" />
                            <p>{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
                        
                        {/* 6.1 Animais */}
                        <section className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
                            <h3 className="text-xl font-semibold text-gray-800 mb-6">6.1. Animais</h3>
                            <div className="space-y-6">
                                <div>
                                    <Label htmlFor="animais.origemDestino" className="font-medium text-gray-700">6.1.1 Origem e Destino</Label>
                                    <Textarea id="animais.origemDestino" {...register("animais.origemDestino")} className="min-h-[80px] mt-2 bg-gray-50/50" />
                                    <p className="text-red-500 text-xs mt-1">{errors.animais?.origemDestino?.message}</p>
                                </div>
                                <div>
                                    <Label className="font-medium text-gray-700">6.1.2 Característica Gerais</Label>
                                    <p className="text-sm text-gray-500 mt-1 mb-4">
                                        Descreva as características dos animais utilizados. Adicione grupos se necessário.
                                    </p>
                                    <div className="space-y-4">
                                        {caracteristicasFields.map((field, index) => (
                                            <div key={field.id} className="p-4 border rounded-lg bg-gray-50 relative group hover:border-blue-200 transition-colors">
                                                 <h4 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">Grupo {index + 1}</h4>
                                                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                    <div><Label className="text-xs">Espécie</Label><Input {...register(`animais.caracteristicasGerais.${index}.especie`)} className="bg-white h-9"/></div>
                                                    <div><Label className="text-xs">Raça</Label><Input {...register(`animais.caracteristicasGerais.${index}.raca`)} className="bg-white h-9"/></div>
                                                    <div><Label className="text-xs">Sexo</Label><Input {...register(`animais.caracteristicasGerais.${index}.sexo`)} className="bg-white h-9"/></div>
                                                    <div><Label className="text-xs">Idade</Label><Input {...register(`animais.caracteristicasGerais.${index}.idade`)} className="bg-white h-9"/></div>
                                                    <div><Label className="text-xs">Peso</Label><Input {...register(`animais.caracteristicasGerais.${index}.peso`)} className="bg-white h-9"/></div>
                                                    <div><Label className="text-xs">Identificação</Label><Input {...register(`animais.caracteristicasGerais.${index}.identificacao`)} className="bg-white h-9"/></div>
                                                 </div>
                                                 {caracteristicasFields.length > 1 && (
                                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeCaracteristica(index)} className="text-gray-400 hover:text-red-500 absolute top-2 right-2 h-6 w-6">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                 )}
                                            </div>
                                        ))}
                                    </div>
                                    <Button type="button" variant="outline" size="sm" className="mt-4 text-green-600 border-green-200 hover:bg-green-50" onClick={() => appendCaracteristica({ especie: '', raca: '', sexo: '', idade: '', peso: '', identificacao: '' })}>
                                        <Plus className="h-4 w-4 mr-2" /> Adicionar Grupo
                                    </Button>
                                    <p className="text-red-500 text-xs mt-1">{errors.animais?.caracteristicasGerais?.message}</p>
                                </div>
                                <div>
                                    <Label htmlFor="animais.justificativaN" className="font-medium text-gray-700">6.1.3 Quantidade e estatística ("n" amostral)</Label>
                                    <Textarea id="animais.justificativaN" {...register("animais.justificativaN")} className="min-h-[80px] mt-2 bg-gray-50/50" />
                                    <p className="text-red-500 text-xs mt-1">{errors.animais?.justificativaN?.message}</p>
                                </div>
                            </div>
                        </section>
                        
                        {/* 6.2 Manejo e Alojamento */}
                        <section className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
                            <h3 className="text-xl font-semibold text-gray-800 mb-6">6.2. Manejo e Alojamento</h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <Label htmlFor="manejoAlojamento.instalacaoManejo" className="font-medium text-gray-700">6.2.1 Instalação e Manejo</Label>
                                    <Textarea id="manejoAlojamento.instalacaoManejo" {...register("manejoAlojamento.instalacaoManejo")} className="min-h-[100px] mt-2 bg-gray-50/50" />
                                    <p className="text-red-500 text-xs mt-1">{errors.manejoAlojamento?.instalacaoManejo?.message}</p>
                                </div>
                                 <div>
                                    <Label htmlFor="manejoAlojamento.alimentacaoAgua" className="font-medium text-gray-700">6.2.2 Alimentação e Água</Label>
                                    <Textarea id="manejoAlojamento.alimentacaoAgua" {...register("manejoAlojamento.alimentacaoAgua")} className="min-h-[100px] mt-2 bg-gray-50/50" />
                                    <p className="text-red-500 text-xs mt-1">{errors.manejoAlojamento?.alimentacaoAgua?.message}</p>
                                </div>
                            </div>
                        </section>

                        {/* 6.3 Critérios */}
                        <section className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
                            <h3 className="text-xl font-semibold text-gray-800 mb-6">6.3. Critérios de Inclusão, Exclusão e Remoção</h3>
                            <div className="space-y-6">
                                <div>
                                    <Label htmlFor="criterios.inclusao" className="font-medium text-gray-700">6.3.1 Critérios de Inclusão</Label>
                                    <Textarea id="criterios.inclusao" {...register("criterios.inclusao")} className="min-h-[80px] mt-2 bg-gray-50/50" />
                                    <p className="text-red-500 text-xs mt-1">{errors.criterios?.inclusao?.message}</p>
                                </div>
                                 <div>
                                    <Label htmlFor="criterios.exclusao" className="font-medium text-gray-700">6.3.2 Critérios de Exclusão</Label>
                                    <Textarea id="criterios.exclusao" {...register("criterios.exclusao")} className="min-h-[80px] mt-2 bg-gray-50/50" />
                                    <p className="text-red-500 text-xs mt-1">{errors.criterios?.exclusao?.message}</p>
                                </div>
                                 <div>
                                    <Label htmlFor="criterios.remocao" className="font-medium text-gray-700">6.3.3 Remoção de Animais</Label>
                                    <Textarea id="criterios.remocao" {...register("criterios.remocao")} className="min-h-[80px] mt-2 bg-gray-50/50" />
                                    <p className="text-red-500 text-xs mt-1">{errors.criterios?.remocao?.message}</p>
                                </div>
                            </div>
                        </section>

                        {/* 6.4 Avaliação Clínica */}
                        <section className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
                            <h3 className="text-xl font-semibold text-gray-800 mb-6 ">6.4. Avaliação Clínica para Seleção</h3>
                            <div className="grid md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <Label htmlFor="avaliacaoClinica.exameFisico" className="font-medium text-gray-700">6.4.1 Exame Físico</Label>
                                    <Textarea id="avaliacaoClinica.exameFisico" {...register("avaliacaoClinica.exameFisico")} className="min-h-[100px] mt-2 bg-gray-50/50" />
                                    <p className="text-red-500 text-xs mt-1">{errors.avaliacaoClinica?.exameFisico?.message}</p>
                                </div>
                                <div>
                                    <Label htmlFor="avaliacaoClinica.exameLaboratorial" className="font-medium text-gray-700">6.4.2 Exame Laboratorial</Label>
                                    <Textarea id="avaliacaoClinica.exameLaboratorial" {...register("avaliacaoClinica.exameLaboratorial")} className="min-h-[100px] mt-2 bg-gray-50/50" />
                                    <p className="text-red-500 text-xs mt-1">{errors.avaliacaoClinica?.exameLaboratorial?.message}</p>
                                </div>
                            </div>
                            
                            <div className="pt-4 border-t border-gray-100">
                                <Label className="font-medium text-gray-700 block mb-3">Outras Avaliações</Label>
                                <div className="space-y-3">
                                    {outrasAvaliacoesFields.map((field, index) => (
                                        <div key={field.id} className="p-3 border rounded-md bg-gray-50 flex gap-3 items-start">
                                            <div className="flex-grow space-y-2">
                                                <Input placeholder="Nome da Avaliação" {...register(`avaliacaoClinica.outrasAvaliacoes.${index}.nome`)} className="bg-white h-9"/>
                                                <Textarea placeholder="Descrição" {...register(`avaliacaoClinica.outrasAvaliacoes.${index}.descricao`)} className="bg-white min-h-[60px]"/>
                                            </div>
                                            <Button type="button" variant="ghost" size="icon" onClick={() => removeOutraAvaliacao(index)} className="text-gray-400 hover:text-red-500 h-8 w-8">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                                <Button type="button" variant="outline" size="sm" className="mt-3 text-green-600 border-green-200 hover:bg-green-50" onClick={() => appendOutraAvaliacao({ nome: '', descricao: '' })}>
                                    <Plus className="h-4 w-4 mr-2" /> Adicionar Avaliação
                                </Button>
                            </div>
                        </section>

                        {/* Campos Curtos (Grid) */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <section className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">6.5. Aclimatação/Quarentena</h3>
                                <Textarea id="aclimatacao" {...register("aclimatacao")} className="min-h-[100px] bg-gray-50/50"/>
                                <p className="text-red-500 text-xs mt-1">{errors.aclimatacao?.message}</p>
                            </section>

                            <section className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">6.6. Seleção</h3>
                                <Textarea id="selecao" {...register("selecao")} className="min-h-[100px] bg-gray-50/50"/>
                                <p className="text-red-500 text-xs mt-1">{errors.selecao?.message}</p>
                            </section>

                            <section className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">6.7. Randomização</h3>
                                <Textarea id="randomizacao" {...register("randomizacao")} className="min-h-[100px] bg-gray-50/50"/>
                                <p className="text-red-500 text-xs mt-1">{errors.randomizacao?.message}</p>
                            </section>
                            
                            <section className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">6.8. Cegamento</h3>
                                <Textarea id="cegamento" {...register("cegamento")} className="min-h-[100px] bg-gray-50/50"/>
                                <p className="text-red-500 text-xs mt-1">{errors.cegamento?.message}</p>
                            </section>
                        </div>
                        
                        {/* 6.9 Tratamento */}
                        <section className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
                              <h3 className="text-xl font-semibold text-gray-800 mb-6">6.9. Tratamento</h3>
                              <div className="space-y-6">
                                  <div>
                                      <Label htmlFor="tratamento.descricao" className="font-medium text-gray-700">Descrição</Label>
                                      <Textarea id="tratamento.descricao" {...register("tratamento.descricao")} className="min-h-[100px] mt-2 bg-gray-50/50" />
                                      <p className="text-red-500 text-xs mt-1">{errors.tratamento?.descricao?.message}</p>
                                  </div>
                                  
                                  <div>
                                      <h4 className="font-semibold text-gray-700 mb-3">Produto Veterinário Investigacional (PVI)</h4>
                                      <div className="p-5 border rounded-lg bg-gray-50/80">
                                           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                              <div className="lg:col-span-2"><Label className="text-xs font-medium">Identificação/Código</Label><Input {...register(`tratamento.pvi.identificacao`)} className="bg-white"/></div>
                                              <div className="lg:col-span-1"><Label className="text-xs font-medium">Princípio Ativo</Label><Input {...register(`tratamento.pvi.principioAtivo`)} className="bg-white"/></div>
                                              <div><Label className="text-xs font-medium">Concentração</Label><Input {...register(`tratamento.pvi.concentracao`)} className="bg-white"/></div>
                                              <div><Label className="text-xs font-medium">Partida/lote</Label><Input {...register(`tratamento.pvi.lote`)} className="bg-white"/></div>
                                              <div><Label className="text-xs font-medium">Fabricante</Label><Input {...register(`tratamento.pvi.fabricante`)} className="bg-white"/></div>
                                              <div><Label className="text-xs font-medium">Data de Fabricação</Label><Input type="date" {...register(`tratamento.pvi.dataFabricacao`)} className="bg-white"/></div>
                                              <div><Label className="text-xs font-medium">Data de Validade</Label><Input type="date" {...register(`tratamento.pvi.dataValidade`)} className="bg-white"/></div>
                                              <div><Label className="text-xs font-medium">Via de administração</Label><Input {...register(`tratamento.pvi.viaAdministracao`)} className="bg-white"/></div>
                                              <div className="lg:col-span-3"><Label className="text-xs font-medium">Apresentações</Label><Textarea {...register(`tratamento.pvi.apresentacoes`)} className="bg-white min-h-[60px]"/></div>
                                              <div className="lg:col-span-3"><Label className="text-xs font-medium">Dosagem indicada</Label><Textarea {...register(`tratamento.pvi.dosagem`)} className="bg-white min-h-[60px]"/></div>
                                           </div>
                                           {errors.tratamento?.pvi && <p className="text-red-500 text-xs mt-2">Verifique os dados do PVI.</p>}
                                      </div>
                                  </div>
                              </div>
                        </section>

                        {/* 6.10 Parâmetros */}
                        <section className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">6.10. Parâmetros de Avaliação</h3>
                            <Textarea id="parametrosAvaliacao" {...register("parametrosAvaliacao")} className="min-h-[120px] bg-gray-50/50" />
                            <p className="text-red-500 text-xs mt-1">{errors.parametrosAvaliacao?.message}</p>
                        </section>

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

export default FormularioMaterialMetodo;