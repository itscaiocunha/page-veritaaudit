import { useState, useCallback, useEffect } from "react";
import { useForm, useFieldArray, Controller, FieldPath } from "react-hook-form";
// import { useNavigate } from 'react-router-dom'; // Removido para corrigir o erro de contexto do Router
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, ChevronDown, ChevronUp } from "lucide-react";

// --- Schema de Validação para o Endereço ---
// --- Define as regras de validação para os campos de endereço. ---
const enderecoSchema = yup.object().shape({
    cep: yup.string().required("O CEP é obrigatório.").min(9, "CEP inválido."),
    logradouro: yup.string().required("O logradouro é obrigatório."),
    numero: yup.string().required("O número é obrigatório."),
    complemento: yup.string(), // --- Complemento é opcional. ---
    bairro: yup.string().required("O bairro é obrigatório."),
    cidade: yup.string().required("A cidade é obrigatória."),
    estado: yup.string().required("O estado é obrigatório."),
});

// --- Schema de Validação Principal ---
// --- Expressão regular para validar o formato do telefone. ---
const phoneRegExp = /^\(\d{2}\) \d{4,5}-\d{4}$/;

// --- Define as regras de validação para os campos de uma pessoa. ---
const pessoaSchema = yup.object().shape({
    // --- O 'id' é gerenciado pelo useFieldArray e não precisa estar no schema de dados. ---
    nome: yup.string().required("O nome é obrigatório."),
    formacao: yup.string().required("A formação é obrigatória."),
    cargo: yup.string(), // --- Cargo é opcional. ---
    endereco: enderecoSchema, // --- Utiliza o schema de endereço definido anteriormente. ---
    telefone: yup.string().matches(phoneRegExp, "Telefone inválido. Use (XX) XXXXX-XXXX ou (XX) XXXX-XXXX").required("O telefone é obrigatório."),
    email: yup.string().email("Digite um e-mail válido.").required("O e-mail é obrigatório."),
    registro: yup.string().required("O N° de registro é obrigatório."),
    expanded: yup.boolean() // --- Controla se a seção do item está expandida na UI. ---
});

// --- Agrupa todos os schemas em um schema de validação principal para o formulário. ---
const validationSchema = yup.object().shape({
    patrocinador: yup.object().shape({
        nome: yup.string().required("O nome do patrocinador é obrigatório."),
        endereco: enderecoSchema,
        telefone: yup.string().matches(phoneRegExp, "Telefone inválido. Use (XX) XXXXX-XXXX ou (XX) XXXX-XXXX").required("O telefone é obrigatório."),
    }),
    representante: pessoaSchema,
    monitores: yup.array().of(pessoaSchema).min(1, "É necessário adicionar pelo menos um monitor."),
    equipe: yup.array().of(pessoaSchema).min(1, "É necessário adicionar pelo menos um membro à equipe."),
});

// --- Inferindo o tipo dos valores do formulário a partir do schema ---
// --- Cria um tipo TypeScript com base no schema de validação para garantir a tipagem correta. ---
type FormValues = yup.InferType<typeof validationSchema>;


// --- Componentes e Funções Auxiliares ---
// --- Componente para adicionar um asterisco vermelho em campos obrigatórios. ---
const RequiredField = ({ children }: { children: React.ReactNode }) => ( <>{children} <span className="text-red-500 font-bold">*</span></> );
// --- Componente de spinner para indicar carregamento. ---
const LoadingSpinner = () => ( <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" /> );

// --- Função para aplicar a máscara de telefone (XX) XXXXX-XXXX. ---
const applyPhoneMask = (value: string) => {
    if (!value) return "";
    value = String(value).replace(/\D/g, "");
    value = value.replace(/^(\d{2})(\d)/g, "($1) $2");
    value = value.replace(/(\d)(\d{4})$/, "$1-$2");
    return value;
};

// --- Função para aplicar a máscara de CEP XXXXX-XXX. ---
const applyCepMask = (value: string) => {
    if (!value) return "";
    value = String(value).replace(/\D/g, "");
    value = value.replace(/^(\d{5})(\d)/, "$1-$2");
    return value;
};


// --- COMPONENTE PRINCIPAL ---
const FormularioParticipantes = () => {
    // --- Hook para navegação entre rotas. ---
    // const navigate = useNavigate(); // Removido para corrigir erro. A navegação deve ser tratada pelo ambiente que renderiza este componente.
    // --- Estado para controlar o status de submissão do formulário. ---
    const [isSubmitting, setIsSubmitting] = useState(false);
    // --- Estado para controlar o carregamento da busca de CEP. ---
    const [cepLoading, setCepLoading] = useState<string | null>(null);
    // --- Estado para armazenar a lista de representantes buscada da API. ---
    const [representantes, setRepresentantes] = useState<{ id: number; nome: string }[]>([]);
    // --- Estado para armazenar a lista de monitores buscada da API. ---
    const [monitoresList, setMonitoresList] = useState<{ id: number; nome: string }[]>([]);
    // --- Estado para armazenar a lista da equipe técnica buscada da API. ---
    const [equipeList, setEquipeList] = useState<{ id: number; nome: string }[]>([]);
     // --- Estado para controlar a expansão das seções do formulário. ---
    const [expandedSections, setExpandedSections] = useState({
        patrocinador: true,
        representante: true,
    });

    // --- Valores padrão para os objetos de endereço e pessoa. ---
    const defaultAddress = { cep: "", logradouro: "", numero: "", complemento: "", bairro: "", cidade: "", estado: "" };
    const defaultPessoa = { nome: "", formacao: "", cargo: "", endereco: defaultAddress, telefone: "", email: "", registro: "" };

    // --- Hooks do React Hook Form para gerenciar o estado e validação do formulário. ---
    const {
        register,
        control,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
    } = useForm<FormValues>({
        resolver: yupResolver(validationSchema), // --- Integra o Yup para validação. ---
        defaultValues: {
            patrocinador: { nome: "", endereco: defaultAddress, telefone: "" },
            representante: defaultPessoa,
            monitores: [{ ...defaultPessoa, expanded: true }],
            equipe: [{ ...defaultPessoa, expanded: true }],
        }
    });

    // --- Hooks para gerenciar campos de array dinâmicos (monitores e equipe). ---
    const { fields: monitoresFields, append: appendMonitor, remove: removeMonitor } = useFieldArray({ control, name: "monitores" });
    const { fields: equipeFields, append: appendEquipe, remove: removeEquipe } = useFieldArray({ control, name: "equipe" });

    // --- EFEITO PARA CARREGAR DADOS INICIAIS ---
    // --- Busca os dados do patrocinador, representantes, monitores e equipe na API quando o componente é montado. ---
    useEffect(() => {
        const fetchData = async () => {
            const capaProtocolDataString = localStorage.getItem('capaProtocolData');
            const jwtToken = sessionStorage.getItem('token');
            let patrocinadorId = null;

            if (capaProtocolDataString) {
                try {
                    const capaData = JSON.parse(capaProtocolDataString);
                    patrocinadorId = capaData?.protocolo?.patrocinadorId;
                } catch (error) {
                    console.error("Erro ao parsear 'capaProtocolData' do localStorage:", error);
                    return;
                }
            }

            if (!patrocinadorId || !jwtToken) {
                console.error("ID do patrocinador ou token JWT não encontrado.");
                return;
            }

            const baseUrl = 'https://verita-brgchubha6ceathm.brazilsouth-01.azurewebsites.net';
            const apiKey = '2NtzCUDl8Ib2arnDRck0xK8taguGeFYuZqnUzpiZ9Wp-tUZ45--/i=tKxzwTPBvtykMSx!0t?7c/Z?NllkokY=TEC2DSonmOMUu0gxdCeh70/rA2NSsm7Ohjn7VM2BeP';
            const headers = {
                'Authorization': `Bearer ${jwtToken}`,
                'X-API-KEY': apiKey,
                'Content-Type': 'application/json',
            };

            // --- Fetch Patrocinador Data ---
            try {
                const response = await fetch(`${baseUrl}/api/patrocinador/${patrocinadorId}`, { method: 'GET', headers });
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();

                setValue('patrocinador.nome', data.nome, { shouldValidate: true });
                setValue('patrocinador.telefone', applyPhoneMask(data.telefone), { shouldValidate: true });
                if (data.endereco) {
                    setValue('patrocinador.endereco.cep', applyCepMask(data.endereco.cep), { shouldValidate: true });
                    setValue('patrocinador.endereco.logradouro', data.endereco.logradouro, { shouldValidate: true });
                    setValue('patrocinador.endereco.numero', String(data.endereco.numero), { shouldValidate: true });
                    setValue('patrocinador.endereco.complemento', data.endereco.complemento, { shouldValidate: true });
                    setValue('patrocinador.endereco.bairro', data.endereco.bairro, { shouldValidate: true });
                    setValue('patrocinador.endereco.cidade', data.endereco.cidade, { shouldValidate: true });
                    setValue('patrocinador.endereco.estado', data.endereco.uf, { shouldValidate: true });
                }
            } catch (error) {
                console.error("Erro ao carregar dados do patrocinador:", error);
            }

            // --- Fetch Representantes List ---
            try {
                const response = await fetch(`${baseUrl}/api/patrocinador/representante?patrocinador_id=${patrocinadorId}`, { method: 'GET', headers });
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                setRepresentantes(data);
            } catch (error) {
                console.error("Erro ao carregar lista de representantes:", error);
            }

            // --- Fetch Monitores List ---
            try {
                const response = await fetch(`${baseUrl}/api/patrocinador/monitor?patrocinador_id=${patrocinadorId}`, { method: 'GET', headers });
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                setMonitoresList(data);
            } catch (error) {
                console.error("Erro ao carregar lista de monitores:", error);
            }

            // --- Fetch Equipe Tecnica List ---
            try {
                const response = await fetch(`${baseUrl}/api/patrocinador/tecnico?patrocinador_id=${patrocinadorId}`, { method: 'GET', headers });
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                setEquipeList(data);
            } catch (error) {
                console.error("Erro ao carregar lista da equipe técnica:", error);
            }
        };

        fetchData();
    }, [setValue]);

    // --- Função para lidar com a mudança de representante selecionado ---
    const handleRepresentanteChange = async (representanteId: string) => {
        if (!representanteId) {
            setValue('representante', defaultPessoa, { shouldValidate: true });
            localStorage.removeItem('representanteId');
            return;
        }

        localStorage.setItem('representanteId', representanteId);
        const jwtToken = sessionStorage.getItem('token');
        if (!jwtToken) {
            console.error("Token JWT não encontrado para buscar detalhes do representante.");
            return;
        }

        try {
            const baseUrl = 'https://verita-brgchubha6ceathm.brazilsouth-01.azurewebsites.net';
            const apiKey = '2NtzCUDl8Ib2arnDRck0xK8taguGeFYuZqnUzpiZ9Wp-tUZ45--/i=tKxzwTPBvtykMSx!0t?7c/Z?NllkokY=TEC2DSonmOMUu0gxdCeh70/rA2NSsm7Ohjn7VM2BeP';
            const response = await fetch(`${baseUrl}/api/patrocinador/representante/${representanteId}`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${jwtToken}`, 'X-API-KEY': apiKey }
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();

            setValue('representante.nome', data.nome, { shouldValidate: true });
            setValue('representante.formacao', data.formacao, { shouldValidate: true });
            setValue('representante.cargo', data.cargo, { shouldValidate: true });
            setValue('representante.telefone', applyPhoneMask(data.telefone), { shouldValidate: true });
            setValue('representante.email', data.email, { shouldValidate: true });
            setValue('representante.registro', String(data.numeroRegistro), { shouldValidate: true });
            if (data.endereco) {
                setValue('representante.endereco.cep', applyCepMask(data.endereco.cep), { shouldValidate: true });
                setValue('representante.endereco.logradouro', data.endereco.logradouro, { shouldValidate: true });
                setValue('representante.endereco.numero', String(data.endereco.numero), { shouldValidate: true });
                setValue('representante.endereco.complemento', data.endereco.complemento, { shouldValidate: true });
                setValue('representante.endereco.bairro', data.endereco.bairro, { shouldValidate: true });
                setValue('representante.endereco.cidade', data.endereco.cidade, { shouldValidate: true });
                setValue('representante.endereco.estado', data.endereco.uf, { shouldValidate: true });
            }
        } catch (error) {
            console.error("Erro ao buscar detalhes do representante:", error);
        }
    };
    
    // --- Função para lidar com a mudança de monitor selecionado ---
    const handleMonitorChange = async (monitorId: string, index: number) => {
        if (!monitorId) {
            const { nome, ...restOfDefault } = defaultPessoa;
            Object.keys(restOfDefault).forEach(field => {
                 setValue(`monitores.${index}.${field as keyof typeof restOfDefault}` as FieldPath<FormValues>, restOfDefault[field as keyof typeof restOfDefault], { shouldValidate: true });
            });
            setValue(`monitores.${index}.nome`, '', { shouldValidate: true });
            return;
        }

        const currentMonitorIds = JSON.parse(localStorage.getItem('monitorIds') || '{}');
        currentMonitorIds[index] = monitorId;
        localStorage.setItem('monitorIds', JSON.stringify(currentMonitorIds));

        const jwtToken = sessionStorage.getItem('token');
        if (!jwtToken) {
            console.error("Token JWT não encontrado para buscar detalhes do monitor.");
            return;
        }

        try {
            const baseUrl = 'https://verita-brgchubha6ceathm.brazilsouth-01.azurewebsites.net';
            const apiKey = '2NtzCUDl8Ib2arnDRck0xK8taguGeFYuZqnUzpiZ9Wp-tUZ45--/i=tKxzwTPBvtykMSx!0t?7c/Z?NllkokY=TEC2DSonmOMUu0gxdCeh70/rA2NSsm7Ohjn7VM2BeP';
            const response = await fetch(`${baseUrl}/api/patrocinador/monitor/${monitorId}`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${jwtToken}`, 'X-API-KEY': apiKey }
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();

            setValue(`monitores.${index}.nome`, data.nome, { shouldValidate: true });
            setValue(`monitores.${index}.formacao`, data.formacao, { shouldValidate: true });
            setValue(`monitores.${index}.telefone`, applyPhoneMask(data.telefone), { shouldValidate: true });
            setValue(`monitores.${index}.email`, data.email, { shouldValidate: true });
            setValue(`monitores.${index}.registro`, String(data.numeroRegistro), { shouldValidate: true });
            if (data.endereco) {
                setValue(`monitores.${index}.endereco.cep`, applyCepMask(data.endereco.cep), { shouldValidate: true });
                setValue(`monitores.${index}.endereco.logradouro`, data.endereco.logradouro, { shouldValidate: true });
                setValue(`monitores.${index}.endereco.numero`, String(data.endereco.numero), { shouldValidate: true });
                setValue(`monitores.${index}.endereco.complemento`, data.endereco.complemento, { shouldValidate: true });
                setValue(`monitores.${index}.endereco.bairro`, data.endereco.bairro, { shouldValidate: true });
                setValue(`monitores.${index}.endereco.cidade`, data.endereco.cidade, { shouldValidate: true });
                setValue(`monitores.${index}.endereco.estado`, data.endereco.uf, { shouldValidate: true });
            }
        } catch (error) {
            console.error(`Erro ao buscar detalhes do monitor no índice ${index}:`, error);
        }
    };

    const handleRemoveMonitor = (index: number) => {
        removeMonitor(index);
        const currentMonitorIds = JSON.parse(localStorage.getItem('monitorIds') || '{}');
        delete currentMonitorIds[index];
        localStorage.setItem('monitorIds', JSON.stringify(currentMonitorIds));
    };

    // --- Função para lidar com a mudança de membro da equipe selecionado ---
    const handleEquipeChange = async (tecnicoId: string, index: number) => {
        if (!tecnicoId) {
            const { nome, ...restOfDefault } = defaultPessoa;
            Object.keys(restOfDefault).forEach(field => {
                 setValue(`equipe.${index}.${field as keyof typeof restOfDefault}` as FieldPath<FormValues>, restOfDefault[field as keyof typeof restOfDefault], { shouldValidate: true });
            });
            setValue(`equipe.${index}.nome`, '', { shouldValidate: true });
            return;
        }

        const currentEquipeIds = JSON.parse(localStorage.getItem('equipeIds') || '{}');
        currentEquipeIds[index] = tecnicoId;
        localStorage.setItem('equipeIds', JSON.stringify(currentEquipeIds));

        const jwtToken = sessionStorage.getItem('token');
        if (!jwtToken) {
            console.error("Token JWT não encontrado para buscar detalhes do membro da equipe.");
            return;
        }

        try {
            const baseUrl = 'https://verita-brgchubha6ceathm.brazilsouth-01.azurewebsites.net';
            const apiKey = '2NtzCUDl8Ib2arnDRck0xK8taguGeFYuZqnUzpiZ9Wp-tUZ45--/i=tKxzwTPBvtykMSx!0t?7c/Z?NllkokY=TEC2DSonmOMUu0gxdCeh70/rA2NSsm7Ohjn7VM2BeP';
            const response = await fetch(`${baseUrl}/api/patrocinador/tecnico/${tecnicoId}`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${jwtToken}`, 'X-API-KEY': apiKey }
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();

            setValue(`equipe.${index}.nome`, data.nome, { shouldValidate: true });
            setValue(`equipe.${index}.formacao`, data.formacao, { shouldValidate: true });
            setValue(`equipe.${index}.telefone`, applyPhoneMask(data.telefone), { shouldValidate: true });
            setValue(`equipe.${index}.email`, data.email, { shouldValidate: true });
            setValue(`equipe.${index}.registro`, String(data.numeroRegistro), { shouldValidate: true });
            if (data.endereco) {
                setValue(`equipe.${index}.endereco.cep`, applyCepMask(data.endereco.cep), { shouldValidate: true });
                setValue(`equipe.${index}.endereco.logradouro`, data.endereco.logradouro, { shouldValidate: true });
                setValue(`equipe.${index}.endereco.numero`, String(data.endereco.numero), { shouldValidate: true });
                setValue(`equipe.${index}.endereco.complemento`, data.endereco.complemento, { shouldValidate: true });
                setValue(`equipe.${index}.endereco.bairro`, data.endereco.bairro, { shouldValidate: true });
                setValue(`equipe.${index}.endereco.cidade`, data.endereco.cidade, { shouldValidate: true });
                setValue(`equipe.${index}.endereco.estado`, data.endereco.uf, { shouldValidate: true });
            }
        } catch (error) {
            console.error(`Erro ao buscar detalhes do membro da equipe no índice ${index}:`, error);
        }
    };

    const handleRemoveEquipe = (index: number) => {
        removeEquipe(index);
        const currentEquipeIds = JSON.parse(localStorage.getItem('equipeIds') || '{}');
        delete currentEquipeIds[index];
        localStorage.setItem('equipeIds', JSON.stringify(currentEquipeIds));
    };


    // --- Função para buscar o CEP ---
    // --- Busca dados de endereço na API ViaCEP quando o campo CEP perde o foco. ---
    const handleCepBlur = useCallback(async (e: React.FocusEvent<HTMLInputElement>, basePath: string) => {
        const cep = e.target.value.replace(/\D/g, "");
        if (cep.length !== 8) return;

        setCepLoading(basePath);

        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();

            if (data.erro) {
                console.error("CEP não encontrado.");
                setValue(`${basePath}.logradouro` as FieldPath<FormValues>, "");
                setValue(`${basePath}.bairro` as FieldPath<FormValues>, "");
                setValue(`${basePath}.cidade` as FieldPath<FormValues>, "");
                setValue(`${basePath}.estado` as FieldPath<FormValues>, "");
            } else {
                setValue(`${basePath}.logradouro` as FieldPath<FormValues>, data.logradouro, { shouldValidate: true });
                setValue(`${basePath}.bairro` as FieldPath<FormValues>, data.bairro, { shouldValidate: true });
                setValue(`${basePath}.cidade` as FieldPath<FormValues>, data.localidade, { shouldValidate: true });
                setValue(`${basePath}.estado` as FieldPath<FormValues>, data.uf, { shouldValidate: true });
                const numeroInput = document.querySelector(`input[name="${basePath}.numero"]`) as HTMLInputElement;
                numeroInput?.focus();
            }
        } catch (error) {
            console.error("Falha ao buscar CEP:", error);
        } finally {
            setCepLoading(null);
        }
    }, [setValue]);

    // --- Função de submissão do formulário ---
    const onSubmit = async (data: FormValues) => {
        setIsSubmitting(true);
        
        console.log("Dados do formulário validados e prontos para avançar:", data);
        
        // A lógica de envio para a API (PUT) foi removida conforme solicitado.
        // Adicione aqui a lógica de navegação ou o que for necessário ao clicar em "Avançar".
        
        // Simula um tempo de espera para o feedback visual
        await new Promise(resolve => setTimeout(resolve, 500)); 
        
        console.log("Avançando para a próxima etapa...");
        // Exemplo: window.location.href = '/proxima-pagina'; // Se precisar de navegação

        setIsSubmitting(false);
    };

    // --- Função para alternar a visibilidade de uma seção principal (Patrocinador, Representante). ---
    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    // --- Função para alternar a visibilidade de um item em um array (Monitores, Equipe). ---
    const toggleArrayItem = (fieldName: 'monitores' | 'equipe', index: number) => {
        const currentPath = `${fieldName}.${index}.expanded` as FieldPath<FormValues>;
        const currentExpandedState = watch(currentPath);
        setValue(currentPath, !currentExpandedState, { shouldValidate: false });
    };

    // --- Componente reutilizável para renderizar os campos de endereço. ---
    const AddressFields = ({ basePath, errors }: { basePath: string; errors: any; }) => {
        const pathParts = basePath.split('.');
        let nestedErrors = errors;
        for (const part of pathParts) { nestedErrors = nestedErrors?.[part]; }

        return (
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 border p-4 rounded-md mt-2">
                <div className="md:col-span-2">
                    <Label><RequiredField>CEP</RequiredField></Label>
                    <div className="flex items-center">
                         <Controller
                            name={`${basePath}.cep` as FieldPath<FormValues>}
                            control={control}
                            render={({ field: { onChange, onBlur, value, ref } }) => (
                                <Input ref={ref} type="text" maxLength={9} value={value || ''} onChange={(e) => onChange(applyCepMask(e.target.value))} onBlur={(e) => { onBlur(); handleCepBlur(e, basePath); }} className="py-3 h-12 text-base bg-white/50 focus:bg-white/80" />
                            )} />
                        {cepLoading === basePath && <LoadingSpinner />}
                    </div>
                    <p className="text-red-500 text-sm mt-1">{nestedErrors?.cep?.message}</p>
                </div>
                <div className="md:col-span-4">
                    <Label><RequiredField>Logradouro</RequiredField></Label>
                    <Input {...register(`${basePath}.logradouro` as FieldPath<FormValues>)} className="py-3 h-12 text-base bg-white/50 focus:bg-white/80" />
                    <p className="text-red-500 text-sm mt-1">{nestedErrors?.logradouro?.message}</p>
                </div>
                 <div className="md:col-span-2">
                    <Label><RequiredField>Número</RequiredField></Label>
                    <Input {...register(`${basePath}.numero` as FieldPath<FormValues>)} className="py-3 h-12 text-base bg-white/50 focus:bg-white/80" />
                    <p className="text-red-500 text-sm mt-1">{nestedErrors?.numero?.message}</p>
                </div>
                 <div className="md:col-span-4">
                    <Label>Complemento</Label>
                    <Input {...register(`${basePath}.complemento` as FieldPath<FormValues>)} className="py-3 h-12 text-base bg-white/50 focus:bg-white/80" />
                    <p className="text-red-500 text-sm mt-1">{nestedErrors?.complemento?.message}</p>
                </div>
                 <div className="md:col-span-3">
                    <Label><RequiredField>Bairro</RequiredField></Label>
                    <Input {...register(`${basePath}.bairro` as FieldPath<FormValues>)} className="py-3 h-12 text-base bg-white/50 focus:bg-white/80" />
                    <p className="text-red-500 text-sm mt-1">{nestedErrors?.bairro?.message}</p>
                </div>
                 <div className="md:col-span-2">
                    <Label><RequiredField>Cidade</RequiredField></Label>
                    <Input {...register(`${basePath}.cidade` as FieldPath<FormValues>)} className="py-3 h-12 text-base bg-white/50 focus:bg-white/80" />
                    <p className="text-red-500 text-sm mt-1">{nestedErrors?.cidade?.message}</p>
                </div>
                 <div className="md:col-span-1">
                    <Label><RequiredField>UF</RequiredField></Label>
                    <Input {...register(`${basePath}.estado` as FieldPath<FormValues>)} className="py-3 h-12 text-base bg-white/50 focus:bg-white/80" />
                    <p className="text-red-500 text-sm mt-1">{nestedErrors?.estado?.message}</p>
                </div>
            </div>
        );
    };

    // --- Renderização do componente ---
    return (
        <div className="min-h-screen flex flex-col bg-gray-200">
            <header className="bg-white/30 backdrop-blur-lg shadow-sm w-full p-4 flex items-center justify-center relative border-b border-white/20">
                <Button onClick={() => window.history.back()} className="absolute left-4 top-1/2 -translate-y-1/2 bg-gray hover:bg-gray-300 text-gray-800 font-semibold py-2 px-3 rounded-lg inline-flex items-center text-sm" >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    <span className="hidden sm:inline">Voltar</span>
                </Button>
                <h1 className="text-xl sm:text-2xl font-bold text-center text-gray-800">Verita Audit</h1>
            </header>

            <div className="w-full flex flex-col justify-center items-center p-4 md:p-8 flex-grow">
                <div className="w-full max-w-4xl rounded-2xl p-6 md:p-8 bg-white/30 backdrop-blur-lg shadow-xl border border-white/20">
                <h1 className="text-2xl md:text-3xl font-semibold text-center mb-6 text-gray-800">Dados do Patrocinador</h1>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                    {/* --- Seção do Patrocinador --- */}
                    <div className="border rounded-lg p-4 shadow-sm">
                        <div className="flex justify-between items-center cursor-pointer p-2 -m-2 rounded" onClick={() => toggleSection('patrocinador')}>
                            <h3 className="text-lg font-semibold text-gray-800">Patrocinador</h3>
                            {expandedSections.patrocinador ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
                        </div>
                        {expandedSections.patrocinador && (
                            <div className="mt-4 space-y-4 pt-4 border-t">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div><Label><RequiredField>Identificação/Nome</RequiredField></Label><Input {...register("patrocinador.nome")} className="py-3 h-12 text-base bg-white/50 focus:bg-white/80" /><p className="text-red-500 text-sm mt-1">{errors.patrocinador?.nome?.message}</p></div>
                                    <div>
                                        <Label><RequiredField>Telefone</RequiredField></Label>
                                        <Controller name="patrocinador.telefone" control={control} render={({ field: { onChange, onBlur, value, ref } }) => ( <Input ref={ref} value={value || ''} onChange={(e) => onChange(applyPhoneMask(e.target.value))} onBlur={onBlur} type="tel" maxLength={15} className="py-3 h-12 text-base bg-white/50 focus:bg-white/80" /> )} />
                                        <p className="text-red-500 text-sm mt-1">{errors.patrocinador?.telefone?.message}</p>
                                    </div>
                                </div>
                                <div>
                                    <Label><RequiredField>Endereço</RequiredField></Label>
                                    <AddressFields basePath="patrocinador.endereco" errors={errors.patrocinador?.endereco} />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* --- Seção do Representante do Patrocinador --- */}
                    <div className="border rounded-lg p-4 shadow-sm">
                         <div className="flex justify-between items-center cursor-pointer p-2 -m-2 rounded" onClick={() => toggleSection('representante')}>
                            <h3 className="text-lg font-semibold text-gray-800">Representante do Patrocinador</h3>
                            {expandedSections.representante ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
                        </div>
                        {expandedSections.representante && (
                            <div className="mt-4 space-y-4 pt-4 border-t">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label><RequiredField>Selecionar Representante</RequiredField></Label>
                                        <select onChange={(e) => handleRepresentanteChange(e.target.value)} className="w-full px-3 py-3 h-12 text-base bg-white/50 focus:bg-white/80 border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500" >
                                            <option value="">Selecione um representante</option>
                                            {representantes.map(rep => (<option key={rep.id} value={rep.id}>{rep.nome}</option>))}
                                        </select>
                                    </div>
                                    <div><Label><RequiredField>Nome (preenchido automaticamente)</RequiredField></Label><Input {...register("representante.nome")} readOnly className="py-3 h-12 text-base bg-gray-100" /><p className="text-red-500 text-sm mt-1">{errors.representante?.nome?.message}</p></div>
                                    <div><Label><RequiredField>Formação</RequiredField></Label><Input {...register("representante.formacao")} className="py-3 h-12 text-base bg-white/50 focus:bg-white/80" /><p className="text-red-500 text-sm mt-1">{errors.representante?.formacao?.message}</p></div>
                                    <div><Label>Cargo (Opcional)</Label><Input {...register("representante.cargo")} className="py-3 h-12 text-base bg-white/50 focus:bg-white/80" /><p className="text-red-500 text-sm mt-1">{errors.representante?.cargo?.message}</p></div>
                                    <div>
                                        <Label><RequiredField>Telefone</RequiredField></Label>
                                        <Controller name="representante.telefone" control={control} render={({ field: { onChange, onBlur, value, ref } }) => ( <Input ref={ref} value={value || ''} onChange={(e) => onChange(applyPhoneMask(e.target.value))} onBlur={onBlur} type="tel" maxLength={15} className="py-3 h-12 text-base bg-white/50 focus:bg-white/80" /> )}/>
                                        <p className="text-red-500 text-sm mt-1">{errors.representante?.telefone?.message}</p>
                                    </div>
                                    <div><Label><RequiredField>E-mail</RequiredField></Label><Input {...register("representante.email")} className="py-3 h-12 text-base bg-white/50 focus:bg-white/80" /><p className="text-red-500 text-sm mt-1">{errors.representante?.email?.message}</p></div>
                                    <div><Label><RequiredField>Registro Profissional</RequiredField></Label><Input {...register("representante.registro")} className="py-3 h-12 text-base bg-white/50 focus:bg-white/80" /><p className="text-red-500 text-sm mt-1">{errors.representante?.registro?.message}</p></div>
                                </div>
                                <div className="md:col-span-2">
                                    <Label><RequiredField>Endereço</RequiredField></Label>
                                     <AddressFields basePath="representante.endereco" errors={errors.representante?.endereco} />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* --- Seção de Monitores (Array Dinâmico) --- */}
                     <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-lg font-semibold"><RequiredField>Monitor(es)</RequiredField></label>
                            <Button type="button" variant="outline" className="bg-[#90EE90] hover:bg-[#7CCD7C] text-white font-bold" onClick={() => appendMonitor({ ...defaultPessoa, expanded: true })}><Plus className="h-4 w-4 mr-2" /> Adicionar Monitor</Button>
                        </div>
                        {monitoresFields.map((monitor, index) => (
                            <div key={monitor.id} className="border rounded-lg p-4 shadow-sm">
                                 <div className="flex justify-between items-center cursor-pointer p-2 -m-2 rounded" onClick={() => toggleArrayItem('monitores', index)}>
                                    <h3 className="font-medium text-gray-800">{watch(`monitores.${index}.nome`) || 'Novo Monitor'}</h3>
                                    <div className="flex items-center">
                                        <Button type="button" variant="ghost" size="sm" className="text-red-500 hover:text-red-700 mr-2" onClick={(e) => { e.stopPropagation(); handleRemoveMonitor(index); }}><Trash2 className="h-4 w-4" /></Button>
                                        {watch(`monitores.${index}.expanded`) ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
                                    </div>
                                </div>
                                {watch(`monitores.${index}.expanded`) && (
                                    <div className="mt-4 space-y-4 pt-4 border-t">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                             <div>
                                                <Label><RequiredField>Selecionar Monitor</RequiredField></Label>
                                                <select onChange={(e) => handleMonitorChange(e.target.value, index)} className="w-full px-3 py-3 h-12 text-base bg-white/50 focus:bg-white/80 border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500" >
                                                    <option value="">Selecione um monitor</option>
                                                    {monitoresList.map(mon => (<option key={mon.id} value={mon.id}>{mon.nome}</option>))}
                                                </select>
                                                <p className="text-red-500 text-sm mt-1">{errors.monitores?.[index]?.nome?.message}</p>
                                            </div>
                                            <div><Label><RequiredField>Nome (preenchido automaticamente)</RequiredField></Label><Input {...register(`monitores.${index}.nome`)} readOnly className="py-3 h-12 text-base bg-gray-100" /></div>
                                            <div><Label><RequiredField>Formação</RequiredField></Label><Input {...register(`monitores.${index}.formacao`)} className="py-3 h-12 text-base bg-white/50 focus:bg-white/80" /><p className="text-red-500 text-sm mt-1">{errors.monitores?.[index]?.formacao?.message}</p></div>
                                            <div>
                                                <Label><RequiredField>Telefone</RequiredField></Label>
                                                <Controller name={`monitores.${index}.telefone`} control={control} render={({ field: { onChange, onBlur, value, ref } }) => ( <Input ref={ref} value={value || ''} onChange={(e) => onChange(applyPhoneMask(e.target.value))} onBlur={onBlur} type="tel" maxLength={15} className="py-3 h-12 text-base bg-white/50 focus:bg-white/80" /> )}/>
                                                <p className="text-red-500 text-sm mt-1">{errors.monitores?.[index]?.telefone?.message}</p>
                                            </div>
                                            <div><Label><RequiredField>E-mail</RequiredField></Label><Input {...register(`monitores.${index}.email`)} className="py-3 h-12 text-base bg-white/50 focus:bg-white/80" /><p className="text-red-500 text-sm mt-1">{errors.monitores?.[index]?.email?.message}</p></div>
                                            <div><Label><RequiredField>N° de Registro</RequiredField></Label><Input {...register(`monitores.${index}.registro`)} className="py-3 h-12 text-base bg-white/50 focus:bg-white/80" /><p className="text-red-500 text-sm mt-1">{errors.monitores?.[index]?.registro?.message}</p></div>
                                        </div>
                                        <div className="md:col-span-2">
                                            <Label><RequiredField>Endereço</RequiredField></Label>
                                             <AddressFields basePath={`monitores.${index}.endereco`} errors={errors.monitores?.[index]?.endereco} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                        {errors.monitores?.message && <p className="text-red-500 text-sm mt-1">{errors.monitores.message}</p>}
                    </div>

                    {/* --- Seção da Equipe Técnica (Array Dinâmico) --- */}
                     <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-lg font-semibold"><RequiredField>Equipe Técnica</RequiredField></label>
                            <Button type="button" variant="outline" className="bg-[#90EE90] hover:bg-[#7CCD7C] text-white font-bold" onClick={() => appendEquipe({ ...defaultPessoa, expanded: true })}><Plus className="h-4 w-4 mr-2" /> Adicionar Membro</Button>
                        </div>
                        {equipeFields.map((membro, index) => (
                             <div key={membro.id} className="border rounded-lg p-4 shadow-sm">
                                <div className="flex justify-between items-center cursor-pointer p-2 -m-2 rounded" onClick={() => toggleArrayItem('equipe', index)}>
                                    <h3 className="font-medium text-gray-800">{watch(`equipe.${index}.nome`) || 'Novo Membro'}</h3>
                                    <div className="flex items-center">
                                        <Button type="button" variant="ghost" size="sm" className="text-red-500 hover:text-red-700 mr-2" onClick={(e) => { e.stopPropagation(); handleRemoveEquipe(index); }}><Trash2 className="h-4 w-4" /></Button>
                                        {watch(`equipe.${index}.expanded`) ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
                                    </div>
                                </div>
                                {watch(`equipe.${index}.expanded`) && (
                                   <div className="mt-4 space-y-4 pt-4 border-t">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label><RequiredField>Selecionar Membro da Equipe</RequiredField></Label>
                                                <select onChange={(e) => handleEquipeChange(e.target.value, index)} className="w-full px-3 py-3 h-12 text-base bg-white/50 focus:bg-white/80 border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500" >
                                                    <option value="">Selecione um membro</option>
                                                    {equipeList.map(tec => (<option key={tec.id} value={tec.id}>{tec.nome}</option>))}
                                                </select>
                                                <p className="text-red-500 text-sm mt-1">{errors.equipe?.[index]?.nome?.message}</p>
                                            </div>
                                            <div><Label><RequiredField>Nome (preenchido automaticamente)</RequiredField></Label><Input {...register(`equipe.${index}.nome`)} readOnly className="py-3 h-12 text-base bg-gray-100" /></div>
                                            <div><Label><RequiredField>Formação</RequiredField></Label><Input {...register(`equipe.${index}.formacao`)} className="py-3 h-12 text-base bg-white/50 focus:bg-white/80" /><p className="text-red-500 text-sm mt-1">{errors.equipe?.[index]?.formacao?.message}</p></div>
                                            <div>
                                                <Label><RequiredField>Telefone</RequiredField></Label>
                                                <Controller name={`equipe.${index}.telefone`} control={control} render={({ field: { onChange, onBlur, value, ref } }) => ( <Input ref={ref} value={value || ''} onChange={(e) => onChange(applyPhoneMask(e.target.value))} onBlur={onBlur} type="tel" maxLength={15} className="py-3 h-12 text-base bg-white/50 focus:bg-white/80" /> )}/>
                                                <p className="text-red-500 text-sm mt-1">{errors.equipe?.[index]?.telefone?.message}</p>
                                            </div>
                                            <div><Label><RequiredField>E-mail</RequiredField></Label><Input {...register(`equipe.${index}.email`)} className="py-3 h-12 text-base bg-white/50 focus:bg-white/80" /><p className="text-red-500 text-sm mt-1">{errors.equipe?.[index]?.email?.message}</p></div>
                                            <div><Label><RequiredField>N° de Registro</RequiredField></Label><Input {...register(`equipe.${index}.registro`)} className="py-3 h-12 text-base bg-white/50 focus:bg-white/80" /><p className="text-red-500 text-sm mt-1">{errors.equipe?.[index]?.registro?.message}</p></div>
                                        </div>
                                         <div className="md:col-span-2">
                                            <Label><RequiredField>Endereço</RequiredField></Label>
                                            <AddressFields basePath={`equipe.${index}.endereco`} errors={errors.equipe?.[index]?.endereco} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                        {errors.equipe?.message && <p className="text-red-500 text-sm mt-1">{errors.equipe.message}</p>}
                    </div>

                    <div className="flex justify-end pt-6">
                        <Button type="submit" className="bg-[#90EE90] hover:bg-[#7CCD7C] text-white font-bold px-8 py-3 text-lg h-auto rounded-md" disabled={isSubmitting}>
                            {isSubmitting ? (<div className="flex items-center gap-2"><LoadingSpinner /> Salvando...</div>) : ('Avançar')}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
        </ div>
    );
};
export default FormularioParticipantes;

