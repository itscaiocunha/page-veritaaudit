import { useState, useCallback } from "react"; // Adicionado useCallback
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { useNavigate } from 'react-router-dom';
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, ChevronDown, ChevronUp } from "lucide-react";

// --- NOVO: Schema de Validação para o Endereço ---
const enderecoSchema = yup.object().shape({
    cep: yup.string().required("O CEP é obrigatório.").min(9, "CEP inválido."),
    logradouro: yup.string().required("O logradouro é obrigatório."),
    numero: yup.string().required("O número é obrigatório."),
    complemento: yup.string(), // Opcional
    bairro: yup.string().required("O bairro é obrigatório."),
    cidade: yup.string().required("A cidade é obrigatória."),
    estado: yup.string().required("O estado é obrigatório."),
});

// --- ALTERADO: Schema de Validação Principal ---
const phoneRegExp = /^\(\d{2}\) \d{5}-\d{4}$/;

const pessoaSchema = yup.object().shape({
    id: yup.number(),
    nome: yup.string().required("O nome é obrigatório."),
    formacao: yup.string().required("A formação é obrigatória."),
    cargo: yup.string(),
    endereco: enderecoSchema, // Alterado para o novo schema de endereço
    telefone: yup.string().matches(phoneRegExp, "Telefone inválido. Use (XX) XXXXX-XXXX").required("O telefone é obrigatório."),
    email: yup.string().email("Digite um e-mail válido.").required("O e-mail é obrigatório."),
    registro: yup.string().required("O N° de registro é obrigatório."),
    expanded: yup.boolean()
});

const validationSchema = yup.object().shape({
    patrocinador: yup.object().shape({
        nome: yup.string().required("O nome do patrocinador é obrigatório."),
        endereco: enderecoSchema, // Alterado para o novo schema de endereço
        telefone: yup.string().matches(phoneRegExp, "Telefone inválido. Use (XX) XXXXX-XXXX").required("O telefone é obrigatório."),
    }),
    representante: pessoaSchema,
    monitores: yup.array().of(pessoaSchema).min(1, "É necessário adicionar pelo menos um monitor."),
    equipe: yup.array().of(pessoaSchema).min(1, "É necessário adicionar pelo menos um membro à equipe."),
});


// --- Componentes e Funções Auxiliares ---
const RequiredField = ({ children }: { children: React.ReactNode }) => ( <>{children} <span className="text-red-500 font-bold">*</span></> );
const LoadingSpinner = () => ( <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" /> );

// --- ALTERADO: Funções de Máscara ---
const applyPhoneMask = (value: string) => {
    if (!value) return "";
    value = value.replace(/\D/g, "");
    value = value.replace(/^(\d{2})(\d)/g, "($1) $2");
    value = value.replace(/(\d)(\d{4})$/, "$1-$2");
    return value;
};

// --- NOVO: Máscara para CEP ---
const applyCepMask = (value: string) => {
    if (!value) return "";
    value = value.replace(/\D/g, "");
    value = value.replace(/^(\d{5})(\d)/, "$1-$2");
    return value;
};


// --- COMPONENTE PRINCIPAL ---
const FormularioParticipantes = () => {
    // --- HOOKS e ESTADOS ---
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [cepLoading, setCepLoading] = useState<string | null>(null); // Para controlar o feedback de "buscando..."
    const [expandedSections, setExpandedSections] = useState({
        patrocinador: true,
        representante: true,
    });

    // --- ALTERADO: Estrutura dos dados do endereço ---
    const defaultAddress = { cep: "", logradouro: "", numero: "", complemento: "", bairro: "", cidade: "", estado: "" };
    const defaultPessoa = { nome: "", formacao: "", cargo: "", endereco: defaultAddress, telefone: "", email: "", registro: "" };

    const {
        register,
        control,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        trigger, // Adicionado para disparar a validação
    } = useForm({
        resolver: yupResolver(validationSchema),
        defaultValues: {
            patrocinador: { nome: "", endereco: defaultAddress, telefone: "" },
            representante: defaultPessoa,
            monitores: [{ ...defaultPessoa, id: 1, expanded: true }],
            equipe: [{ ...defaultPessoa, id: 1, expanded: true }],
        }
    });

    const { fields: monitoresFields, append: appendMonitor, remove: removeMonitor } = useFieldArray({ control, name: "monitores" });
    const { fields: equipeFields, append: appendEquipe, remove: removeEquipe } = useFieldArray({ control, name: "equipe" });

    // --- FUNÇÕES ---

    // --- NOVO: Função para buscar o CEP ---
    const handleCepBlur = useCallback(async (e: React.FocusEvent<HTMLInputElement>, basePath: string) => {
        const cep = e.target.value.replace(/\D/g, "");
        if (cep.length !== 8) return;

        setCepLoading(basePath); // Ativa o loading para este campo específico

        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();

            if (data.erro) {
                console.error("CEP não encontrado.");
                 // Opcional: Limpar os campos se o CEP for inválido
                setValue(`${basePath}.logradouro`, "");
                setValue(`${basePath}.bairro`, "");
                setValue(`${basePath}.cidade`, "");
                setValue(`${basePath}.estado`, "");
            } else {
                setValue(`${basePath}.logradouro`, data.logradouro, { shouldValidate: true });
                setValue(`${basePath}.bairro`, data.bairro, { shouldValidate: true });
                setValue(`${basePath}.cidade`, data.localidade, { shouldValidate: true });
                setValue(`${basePath}.estado`, data.uf, { shouldValidate: true });

                // Foca no campo de número para o usuário preencher
                const numeroInput = document.querySelector(`input[name="${basePath}.numero"]`) as HTMLInputElement;
                numeroInput?.focus();
            }
        } catch (error) {
            console.error("Falha ao buscar CEP:", error);
        } finally {
            setCepLoading(null); // Desativa o loading
        }
    }, [setValue]);


    const onSubmit = async (data: any) => {
        setIsSubmitting(true);
        console.log("Dados Validados:", data);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsSubmitting(false);
        navigate('/instituicao-cadastro');
    };

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const toggleArrayItem = (fieldName: 'monitores' | 'equipe', index: number) => {
        const currentExpandedState = watch(`${fieldName}.${index}.expanded`);
        setValue(`${fieldName}.${index}.expanded`, !currentExpandedState, { shouldValidate: false });
    };

    // --- NOVO: Componente reutilizável para campos de endereço ---
    // Isso evita muita repetição de código no JSX
    const AddressFields = ({ basePath, errors }: { basePath: string; errors: any; }) => {
        const pathParts = basePath.split('.');
        let nestedErrors = errors;
        for (const part of pathParts) {
            nestedErrors = nestedErrors?.[part];
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 border p-4 rounded-md mt-2">
                <div className="md:col-span-2">
                    <Label><RequiredField>CEP</RequiredField></Label>
                    <div className="flex items-center">
                         <Controller
                            name={`${basePath}.cep`}
                            control={control}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    type="text"
                                    maxLength={9}
                                    onChange={(e) => field.onChange(applyCepMask(e.target.value))}
                                    onBlur={(e) => {
                                        field.onBlur(e); // Mantém o onBlur original do RHF
                                        handleCepBlur(e, basePath);
                                    }}
                                />
                            )}
                        />
                        {cepLoading === basePath && <LoadingSpinner />}
                    </div>
                    <p className="text-red-500 text-sm mt-1">{nestedErrors?.cep?.message}</p>
                </div>
                <div className="md:col-span-4">
                    <Label><RequiredField>Logradouro</RequiredField></Label>
                    <Input {...register(`${basePath}.logradouro`)} />
                    <p className="text-red-500 text-sm mt-1">{nestedErrors?.logradouro?.message}</p>
                </div>
                 <div className="md:col-span-2">
                    <Label><RequiredField>Número</RequiredField></Label>
                    <Input {...register(`${basePath}.numero`)} />
                    <p className="text-red-500 text-sm mt-1">{nestedErrors?.numero?.message}</p>
                </div>
                 <div className="md:col-span-4">
                    <Label>Complemento</Label>
                    <Input {...register(`${basePath}.complemento`)} />
                    <p className="text-red-500 text-sm mt-1">{nestedErrors?.complemento?.message}</p>
                </div>
                 <div className="md:col-span-3">
                    <Label><RequiredField>Bairro</RequiredField></Label>
                    <Input {...register(`${basePath}.bairro`)} />
                    <p className="text-red-500 text-sm mt-1">{nestedErrors?.bairro?.message}</p>
                </div>
                 <div className="md:col-span-2">
                    <Label><RequiredField>Cidade</RequiredField></Label>
                    <Input {...register(`${basePath}.cidade`)} />
                    <p className="text-red-500 text-sm mt-1">{nestedErrors?.cidade?.message}</p>
                </div>
                 <div className="md:col-span-1">
                    <Label><RequiredField>UF</RequiredField></Label>
                    <Input {...register(`${basePath}.estado`)} />
                    <p className="text-red-500 text-sm mt-1">{nestedErrors?.estado?.message}</p>
                </div>
            </div>
        );
    };

    // --- RENDERIZAÇÃO ---
    return (
        <div className="min-h-screen flex flex-col items-center py-8 px-4 bg-gray-50 font-inter">
            <h1 className="text-4xl font-bold mb-8">VERITA AUDIT</h1>
            <div className="w-full max-w-4xl rounded-lg p-8 bg-white shadow-md">
                <h2 className="text-2xl font-semibold text-center mb-6">Informações do Patrocinador</h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                    {/* --- ALTERADO: Seção Patrocinador --- */}
                    <div className="border rounded-lg p-4 shadow-sm bg-white">
                        <div className="flex justify-between items-center cursor-pointer hover:bg-gray-50 p-2 -m-2 rounded" onClick={() => toggleSection('patrocinador')}>
                            <h3 className="text-lg font-semibold text-gray-800">Patrocinador</h3>
                            {expandedSections.patrocinador ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
                        </div>
                        {expandedSections.patrocinador && (
                            <div className="mt-4 space-y-4 pt-4 border-t">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div><Label><RequiredField>Identificação/Nome</RequiredField></Label><Input {...register("patrocinador.nome")} /><p className="text-red-500 text-sm mt-1">{errors.patrocinador?.nome?.message}</p></div>
                                    <div><Label><RequiredField>Telefone</RequiredField></Label><Controller name="patrocinador.telefone" control={control} render={({ field }) => ( <Input {...field} onChange={(e) => field.onChange(applyPhoneMask(e.target.value))} type="tel" maxLength={15} /> )}/><p className="text-red-500 text-sm mt-1">{errors.patrocinador?.telefone?.message}</p></div>
                                </div>
                                <div>
                                    <Label><RequiredField>Endereço</RequiredField></Label>
                                    <AddressFields basePath="patrocinador.endereco" errors={errors} />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* --- ALTERADO: Seção Representante do Patrocinador --- */}
                    <div className="border rounded-lg p-4 shadow-sm bg-white">
                         <div className="flex justify-between items-center cursor-pointer hover:bg-gray-50 p-2 -m-2 rounded" onClick={() => toggleSection('representante')}>
                            <h3 className="text-lg font-semibold text-gray-800">Representante do Patrocinador</h3>
                            {expandedSections.representante ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
                        </div>
                        {expandedSections.representante && (
                            <div className="mt-4 space-y-4 pt-4 border-t">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div><Label><RequiredField>Identificação/Nome</RequiredField></Label><Input {...register("representante.nome")} /><p className="text-red-500 text-sm mt-1">{errors.representante?.nome?.message}</p></div>
                                    <div><Label><RequiredField>Formação</RequiredField></Label><Input {...register("representante.formacao")} /><p className="text-red-500 text-sm mt-1">{errors.representante?.formacao?.message}</p></div>
                                    <div><Label>Cargo (Opcional)</Label><Input {...register("representante.cargo")} /><p className="text-red-500 text-sm mt-1">{errors.representante?.cargo?.message}</p></div>
                                    <div><Label><RequiredField>Telefone</RequiredField></Label><Controller name="representante.telefone" control={control} render={({ field }) => ( <Input {...field} onChange={(e) => field.onChange(applyPhoneMask(e.target.value))} type="tel" maxLength={15} /> )}/><p className="text-red-500 text-sm mt-1">{errors.representante?.telefone?.message}</p></div>
                                    <div><Label><RequiredField>E-mail</RequiredField></Label><Input {...register("representante.email")} /><p className="text-red-500 text-sm mt-1">{errors.representante?.email?.message}</p></div>
                                    <div><Label><RequiredField>Registro Profissional</RequiredField></Label><Input {...register("representante.registro")} /><p className="text-red-500 text-sm mt-1">{errors.representante?.registro?.message}</p></div>
                                </div>
                                <div className="md:col-span-2">
                                    <Label><RequiredField>Endereço</RequiredField></Label>
                                     <AddressFields basePath="representante.endereco" errors={errors} />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* --- ALTERADO: Seção Monitores --- */}
                     <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-lg font-semibold"><RequiredField>Monitor(es)</RequiredField></label>
                            <Button type="button" variant="outline" className="bg-[#90EE90] hover:bg-[#7CCD7C] text-white font-bold" onClick={() => appendMonitor({ ...defaultPessoa, id: Date.now(), expanded: true })}><Plus className="h-4 w-4 mr-2" /> Adicionar Monitor</Button>
                        </div>
                        {monitoresFields.map((monitor, index) => (
                            <div key={monitor.id} className="border rounded-lg p-4 shadow-sm bg-white">
                                 <div className="flex justify-between items-center cursor-pointer hover:bg-gray-50 p-2 -m-2 rounded" onClick={() => toggleArrayItem('monitores', index)}>
                                    <h3 className="font-medium text-gray-800">{watch(`monitores.${index}.nome`) || `Novo Monitor`}</h3>
                                    <div className="flex items-center">
                                        <Button type="button" variant="ghost" size="sm" className="text-red-500 hover:text-red-700 mr-2" onClick={(e) => { e.stopPropagation(); removeMonitor(index); }}><Trash2 className="h-4 w-4" /></Button>
                                        {watch(`monitores.${index}.expanded`) ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
                                    </div>
                                </div>
                                {watch(`monitores.${index}.expanded`) && (
                                    <div className="mt-4 space-y-4 pt-4 border-t">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div><Label><RequiredField>Identificação/Nome</RequiredField></Label><Input {...register(`monitores.${index}.nome`)} /><p className="text-red-500 text-sm mt-1">{errors.monitores?.[index]?.nome?.message}</p></div>
                                            <div><Label><RequiredField>Formação</RequiredField></Label><Input {...register(`monitores.${index}.formacao`)} /><p className="text-red-500 text-sm mt-1">{errors.monitores?.[index]?.formacao?.message}</p></div>
                                            <div><Label><RequiredField>Telefone</RequiredField></Label><Controller name={`monitores.${index}.telefone`} control={control} render={({ field }) => ( <Input {...field} onChange={(e) => field.onChange(applyPhoneMask(e.target.value))} type="tel" maxLength={15} /> )}/><p className="text-red-500 text-sm mt-1">{errors.monitores?.[index]?.telefone?.message}</p></div>
                                            <div><Label><RequiredField>E-mail</RequiredField></Label><Input {...register(`monitores.${index}.email`)} /><p className="text-red-500 text-sm mt-1">{errors.monitores?.[index]?.email?.message}</p></div>
                                            <div><Label><RequiredField>N° de Registro</RequiredField></Label><Input {...register(`monitores.${index}.registro`)} /><p className="text-red-500 text-sm mt-1">{errors.monitores?.[index]?.registro?.message}</p></div>
                                        </div>
                                        <div className="md:col-span-2">
                                            <Label><RequiredField>Endereço</RequiredField></Label>
                                             <AddressFields basePath={`monitores.${index}.endereco`} errors={errors} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                        {errors.monitores?.root?.message && <p className="text-red-500 text-sm mt-1">{errors.monitores.root.message}</p>}
                    </div>

                    {/* --- ALTERADO: Seção Equipe Técnica --- */}
                     <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-lg font-semibold"><RequiredField>Equipe Técnica</RequiredField></label>
                            <Button type="button" variant="outline" className="bg-[#90EE90] hover:bg-[#7CCD7C] text-white font-bold" onClick={() => appendEquipe({ ...defaultPessoa, id: Date.now(), expanded: true })}><Plus className="h-4 w-4 mr-2" /> Adicionar Membro</Button>
                        </div>
                        {equipeFields.map((membro, index) => (
                             <div key={membro.id} className="border rounded-lg p-4 shadow-sm bg-white">
                                <div className="flex justify-between items-center cursor-pointer hover:bg-gray-50 p-2 -m-2 rounded" onClick={() => toggleArrayItem('equipe', index)}>
                                    <h3 className="font-medium text-gray-800">{watch(`equipe.${index}.nome`) || `Novo Membro`}</h3>
                                    <div className="flex items-center">
                                        <Button type="button" variant="ghost" size="sm" className="text-red-500 hover:text-red-700 mr-2" onClick={(e) => { e.stopPropagation(); removeEquipe(index); }}><Trash2 className="h-4 w-4" /></Button>
                                        {watch(`equipe.${index}.expanded`) ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
                                    </div>
                                </div>
                                {watch(`equipe.${index}.expanded`) && (
                                   <div className="mt-4 space-y-4 pt-4 border-t">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                             <div><Label><RequiredField>Identificação/Nome</RequiredField></Label><Input {...register(`equipe.${index}.nome`)} /><p className="text-red-500 text-sm mt-1">{errors.equipe?.[index]?.nome?.message}</p></div>
                                            <div><Label><RequiredField>Formação</RequiredField></Label><Input {...register(`equipe.${index}.formacao`)} /><p className="text-red-500 text-sm mt-1">{errors.equipe?.[index]?.formacao?.message}</p></div>
                                            <div><Label><RequiredField>Telefone</RequiredField></Label><Controller name={`equipe.${index}.telefone`} control={control} render={({ field }) => ( <Input {...field} onChange={(e) => field.onChange(applyPhoneMask(e.target.value))} type="tel" maxLength={15} /> )}/><p className="text-red-500 text-sm mt-1">{errors.equipe?.[index]?.telefone?.message}</p></div>
                                            <div><Label><RequiredField>E-mail</RequiredField></Label><Input {...register(`equipe.${index}.email`)} /><p className="text-red-500 text-sm mt-1">{errors.equipe?.[index]?.email?.message}</p></div>
                                            <div><Label><RequiredField>N° de Registro</RequiredField></Label><Input {...register(`equipe.${index}.registro`)} /><p className="text-red-500 text-sm mt-1">{errors.equipe?.[index]?.registro?.message}</p></div>
                                        </div>
                                         <div className="md:col-span-2">
                                            <Label><RequiredField>Endereço</RequiredField></Label>
                                            <AddressFields basePath={`equipe.${index}.endereco`} errors={errors} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                        {errors.equipe?.root?.message && <p className="text-red-500 text-sm mt-1">{errors.equipe.root.message}</p>}
                    </div>

                    {/* Botão de Submissão */}
                    <div className="flex justify-end pt-6">
                        <Button type="submit" className="bg-[#90EE90] hover:bg-[#7CCD7C] text-white font-bold px-8 py-3 text-lg h-auto rounded-md" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <div className="flex items-center gap-2"><LoadingSpinner /> Salvando...</div>
                            ) : (
                                'Salvar e Avançar'
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
export default FormularioParticipantes;