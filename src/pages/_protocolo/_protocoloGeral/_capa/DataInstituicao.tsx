import { useState, useCallback, useEffect } from "react";
import { useForm, useFieldArray, Controller, FieldPath } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

// --- Expressões regulares para validação de telefone (8 ou 9 dígitos) e CEP. ---
const phoneRegExp = /^\(\d{2}\) \d{4,5}-\d{4}$/;
const cepRegExp = /^\d{5}-\d{3}$/;

// --- Função para aplicar máscara de telefone (XX) XXXXX-XXXX. ---
const applyPhoneMask = (value: string) => {
    if (!value) return "";
    return value.replace(/\D/g, "").replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d)(\d{4})$/, "$1-$2").slice(0, 15);
};

// --- Função para aplicar máscara de CEP XXXXX-XXX. ---
const applyCepMask = (value: string) => {
    if (!value) return "";
    return value.replace(/\D/g, "").replace(/^(\d{5})(\d)/, "$1-$2").slice(0, 9);
};

// --- Componente para adicionar um asterisco vermelho em campos obrigatórios. ---
const RequiredField = ({ children }: { children: React.ReactNode }) => (
  <>{children} <span className="text-red-500 font-bold">*</span></>
);

// --- Componente de ícone de carregamento (spinner). ---
const LoadingSpinner = () => (
    <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
);

// --- Schema de Validação para o Endereço ---
const addressSchema = yup.object().shape({
    cep: yup.string().matches(cepRegExp, "CEP inválido. Use XXXXX-XXX").required("O CEP é obrigatório."),
    logradouro: yup.string().required("O logradouro é obrigatório."),
    numero: yup.string().required("O número é obrigatório."),
    complemento: yup.string().nullable(),
    bairro: yup.string().required("O bairro é obrigatório."),
    cidade: yup.string().required("A cidade é obrigatória."),
    uf: yup.string().required("O UF é obrigatório."),
});

// --- Schema de Validação para Investigador/Membro da Equipe ---
const investigadorSchema = yup.object().shape({
    nome: yup.string().required("O nome é obrigatório."),
    formacao: yup.string().required("A formação é obrigatória."),
    telefone: yup.string().matches(phoneRegExp, "Telefone inválido.").required("O telefone é obrigatório."),
    email: yup.string().email("Digite um e-mail válido.").required("O e-mail é obrigatório."),
    registro: yup.string().required("O N° de registro é obrigatório."),
    expanded: yup.boolean().default(true),
    endereco: addressSchema
});

// --- Schema de Validação Principal do Formulário ---
const validationSchema = yup.object().shape({
  instituicao: yup.object().shape({
    nome: yup.string().required("O nome da instituição é obrigatório."),
    telefone: yup.string().matches(phoneRegExp, "Telefone inválido.").required("O telefone é obrigatório."),
    registroCiaep: yup.string().required("O N° de Registro CIAEP é obrigatório."),
    endereco: addressSchema
  }),
  investigador: investigadorSchema,
  equipeInstituicao: yup.array().of(investigadorSchema).min(1, "É necessário adicionar pelo menos um membro à equipe."),
});

// --- Inferindo o tipo dos valores do formulário a partir do schema para ter tipagem forte. ---
type FormValues = yup.InferType<typeof validationSchema>;

// --- VALORES PADRÃO ---
const defaultAddress = { cep: "", logradouro: "", numero: "", complemento: "", bairro: "", cidade: "", uf: "" };
const defaultInvestigador = { nome: "", formacao: "", telefone: "", email: "", registro: "", expanded: true, endereco: defaultAddress };

// --- COMPONENTE PRINCIPAL ---
const FormularioInstituicao = () => {
    // --- Estado para controlar a visibilidade das seções sanfonadas (collapsible). ---
    const [expandedSections, setExpandedSections] = useState({
        instituicao: true,
        investigador: true,
    });
    
    const [investigadoresList, setInvestigadoresList] = useState<{ id: number; nome: string }[]>([]);
    const [equipeList, setEquipeList] = useState<{ id: number; nome: string }[]>([]);
    const [selectedInvestigadorId, setSelectedInvestigadorId] = useState<string | null>(null);
    const [selectedEquipeIds, setSelectedEquipeIds] = useState<(string | null)[]>([]);

    // --- Hook do React Router para navegação programática. ---
    const navigate = useNavigate();
    // --- Estado para controlar o feedback de carregamento no botão de submissão. ---
    const [isSubmitting, setIsSubmitting] = useState(false);
    // --- Estado para exibir o spinner durante a busca do CEP. ---
    const [loadingCep, setLoadingCep] = useState<string | null>(null);

    // --- Hooks do React Hook Form para gerenciamento do formulário. ---
    const { register, control, handleSubmit, formState: { errors }, setValue, watch, setFocus } = useForm<FormValues>({
        resolver: yupResolver(validationSchema),
        defaultValues: {
            instituicao: { nome: "", telefone: "", registroCiaep: "", endereco: defaultAddress },
            investigador: defaultInvestigador,
            equipeInstituicao: [], // Inicia vazio para ser populado pelo useEffect
        }
    });

    // --- Hook para gerenciar o array dinâmico da equipe da instituição. ---
    const { fields: equipeFields, append: appendEquipe, remove: removeEquipe, replace: replaceEquipe } = useFieldArray({
        control,
        name: "equipeInstituicao",
    });

    // --- Função auxiliar para formatar o endereço para o formulário ---
    const formatAddressForForm = (address: any) => {
        if (!address) return defaultAddress;
        return {
            cep: applyCepMask(address.cep || ""),
            logradouro: address.logradouro || "",
            numero: address.numero || "",
            complemento: address.complemento || "",
            bairro: address.bairro || "",
            cidade: address.cidade || address.localidade || "", // API ViaCEP usa 'localidade'
            uf: address.uf || ""
        };
    };
    
    // --- Função para lidar com a mudança do investigador selecionado ---
    const handleInvestigadorChange = useCallback(async (investigadorId: string) => {
        setSelectedInvestigadorId(investigadorId);
        try {
            const storedData = JSON.parse(localStorage.getItem('dataInstituicao') || '{}');
            storedData.investigadorId = investigadorId;
            localStorage.setItem('dataInstituicao', JSON.stringify(storedData));
        } catch (error) {
            console.error("Erro ao salvar o ID do investigador:", error);
        }

        if (!investigadorId) {
            setValue('investigador', defaultInvestigador);
            return;
        }

        const jwtToken = sessionStorage.getItem('token');
        if (!jwtToken) return console.error("Token JWT não encontrado.");

        const baseUrl = 'https://verita-brgchubha6ceathm.brazilsouth-01.azurewebsites.net';
        const apiKey = '2NtzCUDl8Ib2arnDRck0xK8taguGeFYuZqnUzpiZ9Wp-tUZ45--/i=tKxzwTPBvtykMSx!0t?7c/Z?NllkokY=TEC2DSonmOMUu0gxdCeh70/rA2NSsm7Ohjn7VM2BeP';
        
        try {
            const response = await fetch(`${baseUrl}/api/instituicao/investigador/${investigadorId}`, {
                headers: { 'Authorization': `Bearer ${jwtToken}`, 'X-API-KEY': apiKey }
            });
            if (!response.ok) throw new Error("Falha ao buscar dados do investigador");
            const data = await response.json();
            
            setValue('investigador', {
                nome: data.nome || '',
                formacao: data.formacao || '',
                telefone: applyPhoneMask(data.telefone || ''),
                email: data.email || '',
                registro: String(data.numeroRegistro || ''),
                expanded: true,
                endereco: formatAddressForForm(data.endereco)
            }, { shouldValidate: true });

        } catch (error) {
            console.error("Erro ao carregar dados do investigador:", error);
        }
    }, [setValue]);
    
    // --- Função para lidar com a mudança do membro da equipe selecionado ---
    const handleEquipeChange = useCallback(async (tecnicoId: string, index: number) => {
        setSelectedEquipeIds(prevIds => {
            const newIds = [...prevIds];
            newIds[index] = tecnicoId;
            return newIds;
        });
        try {
            const storedData = JSON.parse(localStorage.getItem('dataInstituicao') || '{}');
            const equipeIds = storedData.equipeIds || [];
            equipeIds[index] = tecnicoId;
            storedData.equipeIds = [...new Set(equipeIds.filter(id => id))]; // Garante IDs únicos e remove nulos/vazios
            localStorage.setItem('dataInstituicao', JSON.stringify(storedData));
        } catch (error) {
            console.error("Erro ao salvar ID do membro da equipe:", error);
        }

        if(!tecnicoId) {
            setValue(`equipeInstituicao.${index}`, defaultInvestigador);
            return;
        }

        const jwtToken = sessionStorage.getItem('token');
        if (!jwtToken) return console.error("Token JWT não encontrado.");

        const baseUrl = 'https://verita-brgchubha6ceathm.brazilsouth-01.azurewebsites.net';
        const apiKey = '2NtzCUDl8Ib2arnDRck0xK8taguGeFYuZqnUzpiZ9Wp-tUZ45--/i=tKxzwTPBvtykMSx!0t?7c/Z?NllkokY=TEC2DSonmOMUu0gxdCeh70/rA2NSsm7Ohjn7VM2BeP';

        try {
            const response = await fetch(`${baseUrl}/api/instituicao/tecnico/${tecnicoId}`, {
                headers: { 'Authorization': `Bearer ${jwtToken}`, 'X-API-KEY': apiKey }
            });
            if (!response.ok) throw new Error("Falha ao buscar dados do técnico.");
            const data = await response.json();

            setValue(`equipeInstituicao.${index}`, {
                nome: data.nome || '',
                formacao: data.formacao || '',
                telefone: applyPhoneMask(data.telefone || ''),
                email: data.email || '',
                registro: String(data.numeroRegistro || ''),
                expanded: true,
                endereco: formatAddressForForm(data.endereco)
            }, { shouldValidate: true });

        } catch(error) {
            console.error("Erro ao buscar dados do membro da equipe:", error);
        }
    }, [setValue]);

    // --- EFEITO PARA CARREGAR DADOS INICIAIS ---
    useEffect(() => {
        const loadInitialData = async () => {
            const jwtToken = sessionStorage.getItem('token');
            if (!jwtToken) {
                console.error("Token JWT não encontrado.");
                return;
            }

            const storedDataString = localStorage.getItem('dataInstituicao');
            const storedData = storedDataString ? JSON.parse(storedDataString) : {};
            let { instituicaoId, investigadorId, equipeIds } = storedData;
            
            if (!instituicaoId) {
                const capaProtocolDataString = localStorage.getItem('capaProtocolData');
                if (capaProtocolDataString) {
                    const capaData = JSON.parse(capaProtocolDataString);
                    instituicaoId = capaData?.protocolo?.instituicaoId;
                    if (instituicaoId) {
                        storedData.instituicaoId = instituicaoId;
                        localStorage.setItem('dataInstituicao', JSON.stringify(storedData));
                    }
                }
            }

            if (!instituicaoId) {
                console.error("ID da Instituição não encontrado.");
                return;
            }

            const baseUrl = 'https://verita-brgchubha6ceathm.brazilsouth-01.azurewebsites.net';
            const apiKey = '2NtzCUDl8Ib2arnDRck0xK8taguGeFYuZqnUzpiZ9Wp-tUZ45--/i=tKxzwTPBvtykMSx!0t?7c/Z?NllkokY=TEC2DSonmOMUu0gxdCeh70/rA2NSsm7Ohjn7VM2BeP';
            const headers = { 'Authorization': `Bearer ${jwtToken}`, 'X-API-KEY': apiKey, 'Content-Type': 'application/json' };

            try {
                // 1. Busca dados da instituição e listas para os dropdowns
                const [instituicaoRes, investigadorListRes, equipeListRes] = await Promise.all([
                    fetch(`${baseUrl}/api/instituicao/${instituicaoId}`, { headers }),
                    fetch(`${baseUrl}/api/instituicao/investigador?instituicao_id=${instituicaoId}`, { headers }),
                    fetch(`${baseUrl}/api/instituicao/tecnico?instituicao_id=${instituicaoId}`, { headers })
                ]);

                if (instituicaoRes.ok) {
                    const data = await instituicaoRes.json();
                    setValue('instituicao.nome', data.nome, { shouldValidate: true });
                    setValue('instituicao.telefone', applyPhoneMask(data.telefone), { shouldValidate: true });
                    setValue('instituicao.registroCiaep', data.numeroRegistro, { shouldValidate: true });
                    setValue('instituicao.endereco', formatAddressForForm(data.endereco), { shouldValidate: true });
                }

                if(investigadorListRes.ok) setInvestigadoresList(await investigadorListRes.json() || []);
                if(equipeListRes.ok) setEquipeList(await equipeListRes.json() || []);
                
                // 2. Se houver um investigadorId salvo, carrega seus dados
                if (investigadorId) {
                    setSelectedInvestigadorId(investigadorId);
                    await handleInvestigadorChange(investigadorId);
                }

                // 3. Se houver equipeIds salvos, carrega os dados de cada membro
                if (equipeIds && Array.isArray(equipeIds) && equipeIds.length > 0) {
                    setSelectedEquipeIds(equipeIds);
                    const equipePromises = equipeIds.map(id => 
                        fetch(`${baseUrl}/api/instituicao/tecnico/${id}`, { headers })
                            .then(res => res.ok ? res.json() : null)
                    );
                    const equipeData = await Promise.all(equipePromises);
                    const newEquipe = equipeData
                        .filter(data => data !== null)
                        .map(data => ({
                            nome: data.nome || '',
                            formacao: data.formacao || '',
                            telefone: applyPhoneMask(data.telefone || ''),
                            email: data.email || '',
                            registro: String(data.numeroRegistro || ''),
                            expanded: true,
                            endereco: formatAddressForForm(data.endereco)
                        }));
                    replaceEquipe(newEquipe); // Substitui a lista de equipe com os dados carregados
                } else {
                     // Se não houver equipe no localStorage, adiciona um membro padrão
                    replaceEquipe([{ ...defaultInvestigador }]);
                }
                
            } catch (error) {
                console.error("Erro ao carregar dados iniciais:", error);
            }
        };

        loadInitialData();
    }, [setValue, replaceEquipe, handleInvestigadorChange]);
    
    // --- Função de submissão do formulário. ---
    const onSubmit = async (data: FormValues) => {
        setIsSubmitting(true);
        console.log("Dados do formulário validados, navegando para a próxima etapa:", data);
        
        // A lógica de salvar os dados completos do formulário no localStorage foi removida.
        // Apenas os IDs são mantidos, salvos através das funções 'handle...Change'.
        
        await new Promise(resolve => setTimeout(resolve, 500));
        setIsSubmitting(false);
        navigate('/protocolo/local');
    };

    // --- Função para buscar endereço a partir do CEP usando a API ViaCEP. ---
    const handleCepLookup = async (cep: string, basePath: string) => {
        const cleanedCep = cep.replace(/\D/g, "");
        if (cleanedCep.length !== 8) return;

        setLoadingCep(basePath);
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cleanedCep}/json/`);
            const data = await response.json();
            if (data.erro) throw new Error("CEP não encontrado.");

            setValue(`${basePath}.endereco.logradouro` as FieldPath<FormValues>, data.logradouro, { shouldValidate: true });
            setValue(`${basePath}.endereco.bairro` as FieldPath<FormValues>, data.bairro, { shouldValidate: true });
            setValue(`${basePath}.endereco.cidade` as FieldPath<FormValues>, data.localidade, { shouldValidate: true });
            setValue(`${basePath}.endereco.uf` as FieldPath<FormValues>, data.uf, { shouldValidate: true });
            setFocus(`${basePath}.endereco.numero` as FieldPath<FormValues>);

        } catch (error) {
            console.error("Erro ao buscar CEP:", error);
            // Limpa os campos se houver erro
            setValue(`${basePath}.endereco.logradouro` as FieldPath<FormValues>, "", { shouldValidate: true });
            setValue(`${basePath}.endereco.bairro` as FieldPath<FormValues>, "", { shouldValidate: true });
            setValue(`${basePath}.endereco.cidade` as FieldPath<FormValues>, "", { shouldValidate: true });
            setValue(`${basePath}.endereco.uf` as FieldPath<FormValues>, "", { shouldValidate: true });
        } finally {
            setLoadingCep(null);
        }
    };

    // --- Funções para controlar a UI de seções sanfonadas (collapsible). ---
    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections(prev => ({...prev, [section]: !prev[section]}));
    };

    const toggleArrayItem = (index: number) => {
        setValue(`equipeInstituicao.${index}.expanded`, !watch(`equipeInstituicao.${index}.expanded`));
    };

    const addTeamMember = () => {
        appendEquipe({ ...defaultInvestigador });
        setSelectedEquipeIds(prev => [...prev, null]);
    };

    const removeTeamMember = (index: number) => {
        removeEquipe(index);
        setSelectedEquipeIds(prev => prev.filter((_, i) => i !== index));
        try {
            const storedData = JSON.parse(localStorage.getItem('dataInstituicao') || '{}');
            if (storedData.equipeIds && Array.isArray(storedData.equipeIds)) {
                storedData.equipeIds.splice(index, 1);
                localStorage.setItem('dataInstituicao', JSON.stringify(storedData));
            }
        } catch (error) {
            console.error("Erro ao remover ID do membro da equipe do localStorage:", error);
        }
    };

    // --- Componente reutilizável para renderizar os campos de endereço. ---
    const renderAddressFields = (basePath: string, fieldErrors: any) => (
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 border p-4 rounded-md mt-2">
            <div className="md:col-span-2">
                <Label><RequiredField>CEP</RequiredField></Label>
                <div className="flex items-center gap-2">
                    <Controller
                        name={`${basePath}.endereco.cep` as FieldPath<FormValues>}
                        control={control}
                        render={({ field: { onChange, onBlur, value, ref } }) => (
                            <Input
                                ref={ref}
                                value={value || ''}
                                onChange={(e) => onChange(applyCepMask(e.target.value))}
                                onBlur={(e) => {
                                    onBlur();
                                    handleCepLookup(e.target.value, basePath);
                                }}
                                maxLength={9}
                                className="py-3 h-12 text-base bg-white/50 focus:bg-white/80"
                            />
                        )}
                    />
                    {loadingCep === basePath && <LoadingSpinner />}
                </div>
                <p className="text-red-500 text-sm mt-1">{fieldErrors?.endereco?.cep?.message}</p>
            </div>
            <div className="md:col-span-4"><Label><RequiredField>Logradouro</RequiredField></Label><Input {...register(`${basePath}.endereco.logradouro` as FieldPath<FormValues>)} className="py-3 h-12 text-base bg-white/50 focus:bg-white/80" /><p className="text-red-500 text-sm mt-1">{fieldErrors?.endereco?.logradouro?.message}</p></div>
            <div className="md:col-span-2"><Label><RequiredField>Número</RequiredField></Label><Input {...register(`${basePath}.endereco.numero` as FieldPath<FormValues>)} className="py-3 h-12 text-base bg-white/50 focus:bg-white/80" /><p className="text-red-500 text-sm mt-1">{fieldErrors?.endereco?.numero?.message}</p></div>
            <div className="md:col-span-4"><Label>Complemento</Label><Input {...register(`${basePath}.endereco.complemento` as FieldPath<FormValues>)} className="py-3 h-12 text-base bg-white/50 focus:bg-white/80" /><p className="text-red-500 text-sm mt-1">{fieldErrors?.endereco?.complemento?.message}</p></div>
            <div className="md:col-span-2"><Label><RequiredField>Bairro</RequiredField></Label><Input {...register(`${basePath}.endereco.bairro` as FieldPath<FormValues>)} className="py-3 h-12 text-base bg-white/50 focus:bg-white/80" /><p className="text-red-500 text-sm mt-1">{fieldErrors?.endereco?.bairro?.message}</p></div>
            <div className="md:col-span-3"><Label><RequiredField>Cidade</RequiredField></Label><Input {...register(`${basePath}.endereco.cidade` as FieldPath<FormValues>)} className="py-3 h-12 text-base bg-white/50 focus:bg-white/80" /><p className="text-red-500 text-sm mt-1">{fieldErrors?.endereco?.cidade?.message}</p></div>
            <div className="md:col-span-1"><Label><RequiredField>UF</RequiredField></Label><Input {...register(`${basePath}.endereco.uf` as FieldPath<FormValues>)} className="py-3 h-12 text-base bg-white/50 focus:bg-white/80" /><p className="text-red-500 text-sm mt-1">{fieldErrors?.endereco?.uf?.message}</p></div>
        </div>
    );

    // --- Renderização do componente ---
    return (
        <div className="min-h-screen flex flex-col bg-gray-200">
            {/* --- Cabeçalho da Página --- */}
            <header className="bg-white/30 backdrop-blur-lg shadow-sm w-full p-4 flex items-center justify-center relative border-b border-white/20">
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

            {/* --- Conteúdo Principal do Formulário --- */}
            <div className="w-full flex flex-col justify-center items-center p-4 md:p-8 flex-grow">
                <div className="w-full max-w-4xl rounded-2xl p-6 md:p-8 bg-white/30 backdrop-blur-lg shadow-xl border border-white/20">
                <h1 className="text-2xl md:text-3xl font-semibold text-center mb-6 text-gray-800">Dados da Instituição ou CRO</h1>
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* --- Seção: Instituição de Pesquisa --- */}
                    <div className="border rounded-lg p-4 shadow-sm">
                        <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleSection('instituicao')}>
                            <h3 className="text-lg font-semibold text-gray-800">Instituição de Pesquisa</h3>
                            {expandedSections.instituicao ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
                        </div>
                        {expandedSections.instituicao && (
                            <div className="mt-4 space-y-4 pt-4 border-t">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2"><Label><RequiredField>Identificação/Nome</RequiredField></Label><Input {...register("instituicao.nome")} className="py-3 h-12 text-base bg-white/50 focus:bg-white/80" /><p className="text-red-500 text-sm mt-1">{errors.instituicao?.nome?.message}</p></div>
                                    <div><Label><RequiredField>Telefone</RequiredField></Label><Controller name="instituicao.telefone" control={control} render={({ field: { onChange, onBlur, value, ref } }) => ( <Input ref={ref} value={value || ''} onChange={(e) => onChange(applyPhoneMask(e.target.value))} onBlur={onBlur} type="tel" maxLength={15} className="py-3 h-12 text-base bg-white/50 focus:bg-white/80" /> )}/><p className="text-red-500 text-sm mt-1">{errors.instituicao?.telefone?.message}</p></div>
                                    <div><Label><RequiredField>N° Registro CIAEP</RequiredField></Label><Input {...register("instituicao.registroCiaep")} className="py-3 h-12 text-base bg-white/50 focus:bg-white/80" /><p className="text-red-500 text-sm mt-1">{errors.instituicao?.registroCiaep?.message}</p></div>
                                </div>
                                {renderAddressFields('instituicao', errors.instituicao)}
                            </div>
                        )}
                    </div>
    
                    {/* --- Seção: Investigador --- */}
                    <div className="border rounded-lg p-4 shadow-sm">
                        <div className="flex justify-between items-center cursor-pointer hover:bg-gray-50 p-2 -m-2 rounded" onClick={() => toggleSection('investigador')}>
                            <h3 className="text-lg font-semibold text-gray-800">Investigador</h3>
                            {expandedSections.investigador ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
                        </div>
                        {expandedSections.investigador && (
                            <div className="mt-4 space-y-4 pt-4 border-t">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label><RequiredField>Selecionar Investigador</RequiredField></Label>
                                        <select 
                                            value={selectedInvestigadorId || ''}
                                            onChange={(e) => handleInvestigadorChange(e.target.value)} 
                                            className="w-full px-3 py-3 h-12 text-base bg-white/50 focus:bg-white/80 border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500" >
                                            <option value="">Selecione um investigador</option>
                                            {investigadoresList.map(inv => (<option key={inv.id} value={inv.id}>{inv.nome}</option>))}
                                        </select>
                                    </div>
                                    <div><Label><RequiredField>Formação</RequiredField></Label><Input {...register("investigador.formacao")} className="py-3 h-12 text-base bg-white/50 focus:bg-white/80" /><p className="text-red-500 text-sm mt-1">{errors.investigador?.formacao?.message}</p></div>
                                    <div><Label><RequiredField>Telefone</RequiredField></Label><Controller name="investigador.telefone" control={control} render={({ field: { onChange, onBlur, value, ref } }) => ( <Input ref={ref} value={value || ''} onChange={(e) => onChange(applyPhoneMask(e.target.value))} onBlur={onBlur} type="tel" maxLength={15} className="py-3 h-12 text-base bg-white/50 focus:bg-white/80" /> )}/><p className="text-red-500 text-sm mt-1">{errors.investigador?.telefone?.message}</p></div>
                                    <div><Label><RequiredField>E-mail</RequiredField></Label><Input {...register("investigador.email")} className="py-3 h-12 text-base bg-white/50 focus:bg-white/80" /><p className="text-red-500 text-sm mt-1">{errors.investigador?.email?.message}</p></div>
                                    <div><Label><RequiredField>N° de Registro</RequiredField></Label><Input {...register("investigador.registro")} className="py-3 h-12 text-base bg-white/50 focus:bg-white/80" /><p className="text-red-500 text-sm mt-1">{errors.investigador?.registro?.message}</p></div>
                                </div>
                                {renderAddressFields('investigador', errors.investigador)}
                            </div>
                        )}
                    </div>
                    
                    {/* --- Seção: Equipe Técnica da Instituição (Array Dinâmico) --- */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-lg font-semibold"><RequiredField>Equipe Técnica da Instituição</RequiredField></label>
                            <Button type="button" variant="outline" className="bg-[#90EE90] hover:bg-[#7CCD7C] text-white font-bold" onClick={addTeamMember}><Plus className="h-4 w-4 mr-2" /> Adicionar Membro</Button>
                        </div>
                        {equipeFields.map((membro, index) => (
                                <div key={membro.id} className="border rounded-lg p-4 shadow-sm">
                                    <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleArrayItem(index)}>
                                        <h3 className="font-medium text-gray-800">{watch(`equipeInstituicao.${index}.nome`) || `Novo Membro da Equipe`}</h3>
                                        <div className="flex items-center">
                                            <Button type="button" variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={(e) => { e.stopPropagation(); removeTeamMember(index);}}><Trash2 className="h-4 w-4" /></Button>
                                            {watch(`equipeInstituicao.${index}.expanded`) ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
                                        </div>
                                    </div>
                                    {watch(`equipeInstituicao.${index}.expanded`) && (
                                        <div className="mt-4 space-y-4 pt-4 border-t">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <Label><RequiredField>Selecionar Membro da Equipe</RequiredField></Label>
                                                    <select 
                                                        value={selectedEquipeIds[index] || ''}
                                                        onChange={(e) => handleEquipeChange(e.target.value, index)} 
                                                        className="w-full px-3 py-3 h-12 text-base bg-white/50 focus:bg-white/80 border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500" >
                                                        <option value="">Selecione um membro</option>
                                                        {equipeList.map(tec => (<option key={tec.id} value={tec.id}>{tec.nome}</option>))}
                                                    </select>
                                                </div>

                                                <div><Label><RequiredField>Formação</RequiredField></Label><Input {...register(`equipeInstituicao.${index}.formacao`)} className="py-3 h-12 text-base bg-white/50 focus:bg-white/80" /><p className="text-red-500 text-sm mt-1">{errors.equipeInstituicao?.[index]?.formacao?.message}</p></div>
                                                <div><Label><RequiredField>Telefone</RequiredField></Label><Controller name={`equipeInstituicao.${index}.telefone`} control={control} render={({ field: { onChange, onBlur, value, ref } }) => ( <Input ref={ref} value={value || ''} onChange={(e) => onChange(applyPhoneMask(e.target.value))} onBlur={onBlur} type="tel" maxLength={15} className="py-3 h-12 text-base bg-white/50 focus:bg-white/80" /> )}/><p className="text-red-500 text-sm mt-1">{errors.equipeInstituicao?.[index]?.telefone?.message}</p></div>
                                                <div><Label><RequiredField>E-mail</RequiredField></Label><Input {...register(`equipeInstituicao.${index}.email`)} className="py-3 h-12 text-base bg-white/50 focus:bg-white/80" /><p className="text-red-500 text-sm mt-1">{errors.equipeInstituicao?.[index]?.email?.message}</p></div>
                                                <div><Label><RequiredField>N° de Registro</RequiredField></Label><Input {...register(`equipeInstituicao.${index}.registro`)} className="py-3 h-12 text-base bg-white/50 focus:bg-white/80" /><p className="text-red-500 text-sm mt-1">{errors.equipeInstituicao?.[index]?.registro?.message}</p></div>
                                            </div>
                                            {renderAddressFields(`equipeInstituicao.${index}`, (errors.equipeInstituicao as any)?.[index])}
                                        </div>
                                    )}
                                </div>
                        ))}
                        {errors.equipeInstituicao?.message && <p className="text-red-500 text-sm mt-1">{errors.equipeInstituicao.message}</p>}
                    </div>

                    {/* --- Botões de Ação do Formulário --- */}
                    <div className="flex justify-end items-center gap-4 pt-6">
                        <Button type="submit" className="bg-[#90EE90] hover:bg-[#7CCD7C] text-white font-bold px-8 py-3 text-lg h-auto rounded-md" disabled={isSubmitting}>
                            {isSubmitting ? (<div className="flex items-center gap-2"><LoadingSpinner /> A Salvar...</div>) : ('Salvar e Avançar')}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    );
};

export default FormularioInstituicao;

