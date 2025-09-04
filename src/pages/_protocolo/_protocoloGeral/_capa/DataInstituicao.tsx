import { useState } from "react";
import { useForm, useFieldArray, Controller, FieldPath } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

// --- Helpers, Componentes e Schemas Auxiliares ---
const phoneRegExp = /^\(\d{2}\) \d{5}-\d{4}$/;
const cepRegExp = /^\d{5}-\d{3}$/;

// --- Máscaras ---
const applyPhoneMask = (value: string) => {
    if (!value) return "";
    return value.replace(/\D/g, "").replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d)(\d{4})$/, "$1-$2").slice(0, 15);
};

const applyCepMask = (value: string) => {
    if (!value) return "";
    return value.replace(/\D/g, "").replace(/^(\d{5})(\d)/, "$1-$2").slice(0, 9);
};

const RequiredField = ({ children }: { children: React.ReactNode }) => (
  <>{children} <span className="text-red-500 font-bold">*</span></>
);

// --- Icone de Carregando ---
const LoadingSpinner = () => (
    <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
);

// Schema de Validação
const addressSchema = yup.object().shape({
    cep: yup.string().matches(cepRegExp, "CEP inválido. Use XXXXX-XXX").required("O CEP é obrigatório."),
    logradouro: yup.string().required("O logradouro é obrigatório."),
    numero: yup.string().required("O número é obrigatório."),
    complemento: yup.string(),
    bairro: yup.string().required("O bairro é obrigatório."),
    cidade: yup.string().required("A cidade é obrigatória."),
    uf: yup.string().required("O UF é obrigatório."),
});

const investigadorSchema = yup.object().shape({
    nome: yup.string().required("O nome é obrigatório."),
    formacao: yup.string().required("A formação é obrigatória."),
    telefone: yup.string().matches(phoneRegExp, "Telefone inválido.").required("O telefone é obrigatório."),
    email: yup.string().email("Digite um e-mail válido.").required("O e-mail é obrigatório."),
    registro: yup.string().required("O N° de registro é obrigatório."),
    expanded: yup.boolean(),
    endereco: addressSchema
});

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

type FormValues = yup.InferType<typeof validationSchema>;

// --- COMPONENTE PRINCIPAL ---
const FormularioInstituicao = () => {
    const [expandedSections, setExpandedSections] = useState({
        instituicao: true,
        investigador: true,
    });
    
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loadingCep, setLoadingCep] = useState<string | null>(null);

    const defaultAddress = { cep: "", logradouro: "", numero: "", complemento: "", bairro: "", cidade: "", uf: "" };
    const defaultInvestigador = { nome: "", formacao: "", telefone: "", email: "", registro: "", expanded: true, endereco: defaultAddress };

    const { register, control, handleSubmit, formState: { errors }, setValue, watch, setFocus } = useForm<FormValues>({
        resolver: yupResolver(validationSchema),
        defaultValues: {
            instituicao: { nome: "", telefone: "", registroCiaep: "", endereco: defaultAddress },
            investigador: defaultInvestigador,
            equipeInstituicao: [{ ...defaultInvestigador }],
        }
    });

    const { fields: equipeFields, append: appendEquipe, remove: removeEquipe } = useFieldArray({
        control,
        name: "equipeInstituicao",
    });

    const onSubmit = async (data: FormValues) => {
        setIsSubmitting(true);
        console.log("Dados da Instituição de Pesquisa:", data);

        try {
            const existingDataString = localStorage.getItem('dadosInstituicao');
            const existingData = existingDataString ? JSON.parse(existingDataString) : [];
            existingData.push(data);
            localStorage.setItem('dadosInstituicao', JSON.stringify(existingData));
            console.log("Dados salvos no localStorage com a chave 'dadosInstituicao'.");
        } catch (error) {
            console.error("Erro ao salvar os dados no localStorage:", error);
        }
        
        await new Promise(resolve => setTimeout(resolve, 500));
        setIsSubmitting(false);
        navigate('/local-protocol');
    };

    // --- CEP ---
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
            // Clear fields on error
            setValue(`${basePath}.endereco.logradouro` as FieldPath<FormValues>, "", { shouldValidate: true });
            setValue(`${basePath}.endereco.bairro` as FieldPath<FormValues>, "", { shouldValidate: true });
            setValue(`${basePath}.endereco.cidade` as FieldPath<FormValues>, "", { shouldValidate: true });
            setValue(`${basePath}.endereco.uf` as FieldPath<FormValues>, "", { shouldValidate: true });
        } finally {
            setLoadingCep(null);
        }
    };

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections(prev => ({...prev, [section]: !prev[section]}));
    };

    const toggleArrayItem = (index: number) => {
        setValue(`equipeInstituicao.${index}.expanded`, !watch(`equipeInstituicao.${index}.expanded`));
    };

    const renderAddressFields = (basePath: string, fieldErrors: any) => (
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 pt-4 mt-4 border-t">
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
                            />
                        )}
                    />
                    {loadingCep === basePath && <LoadingSpinner />}
                </div>
                <p className="text-red-500 text-sm mt-1">{fieldErrors?.endereco?.cep?.message}</p>
            </div>
            <div className="md:col-span-4"><Label><RequiredField>Logradouro</RequiredField></Label><Input {...register(`${basePath}.endereco.logradouro` as FieldPath<FormValues>)} /><p className="text-red-500 text-sm mt-1">{fieldErrors?.endereco?.logradouro?.message}</p></div>
            <div className="md:col-span-2"><Label><RequiredField>Número</RequiredField></Label><Input {...register(`${basePath}.endereco.numero` as FieldPath<FormValues>)} /><p className="text-red-500 text-sm mt-1">{fieldErrors?.endereco?.numero?.message}</p></div>
            <div className="md:col-span-4"><Label>Complemento</Label><Input {...register(`${basePath}.endereco.complemento` as FieldPath<FormValues>)} /><p className="text-red-500 text-sm mt-1">{fieldErrors?.endereco?.complemento?.message}</p></div>
            <div className="md:col-span-2"><Label><RequiredField>Bairro</RequiredField></Label><Input {...register(`${basePath}.endereco.bairro` as FieldPath<FormValues>)} /><p className="text-red-500 text-sm mt-1">{fieldErrors?.endereco?.bairro?.message}</p></div>
            <div className="md:col-span-3"><Label><RequiredField>Cidade</RequiredField></Label><Input {...register(`${basePath}.endereco.cidade` as FieldPath<FormValues>)} /><p className="text-red-500 text-sm mt-1">{fieldErrors?.endereco?.cidade?.message}</p></div>
            <div className="md:col-span-1"><Label><RequiredField>UF</RequiredField></Label><Input {...register(`${basePath}.endereco.uf` as FieldPath<FormValues>)} /><p className="text-red-500 text-sm mt-1">{fieldErrors?.endereco?.uf?.message}</p></div>
        </div>
    );

    return (
        <div className="min-h-screen flex flex-col bg-gray-200">
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

            <div className="w-full flex flex-col justify-center items-center p-4 md:p-8 flex-grow">
                <div className="w-full max-w-4xl rounded-2xl p-6 md:p-8 bg-white/30 backdrop-blur-lg shadow-xl border border-white/20">
                <h1 className="text-2xl md:text-3xl font-semibold text-center mb-6 text-gray-800">Dados da Instituição ou CRO</h1>
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Seção Instituição de Pesquisa */}
                    <div className="border rounded-lg p-4 shadow-sm bg-white">
                        <div className="flex justify-between items-center cursor-pointer hover:bg-gray-50 p-2 -m-2 rounded" onClick={() => toggleSection('instituicao')}>
                            <h3 className="text-lg font-semibold text-gray-800">Instituição de Pesquisa</h3>
                            {expandedSections.instituicao ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
                        </div>
                        {expandedSections.instituicao && (
                            <div className="mt-4 space-y-4 pt-4 border-t">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2"><Label><RequiredField>Identificação/Nome</RequiredField></Label><Input {...register("instituicao.nome")} /><p className="text-red-500 text-sm mt-1">{errors.instituicao?.nome?.message}</p></div>
                                    <div><Label><RequiredField>Telefone</RequiredField></Label><Controller name="instituicao.telefone" control={control} render={({ field: { onChange, onBlur, value, ref } }) => ( <Input ref={ref} value={value || ''} onChange={(e) => onChange(applyPhoneMask(e.target.value))} onBlur={onBlur} type="tel" maxLength={15} /> )}/><p className="text-red-500 text-sm mt-1">{errors.instituicao?.telefone?.message}</p></div>
                                    <div><Label><RequiredField>N° Registro CIAEP</RequiredField></Label><Input {...register("instituicao.registroCiaep")} /><p className="text-red-500 text-sm mt-1">{errors.instituicao?.registroCiaep?.message}</p></div>
                                </div>
                                {renderAddressFields('instituicao', errors.instituicao)}
                            </div>
                        )}
                    </div>
    
                    {/* Seção Investigador */}
                    <div className="border rounded-lg p-4 shadow-sm bg-white">
                        <div className="flex justify-between items-center cursor-pointer hover:bg-gray-50 p-2 -m-2 rounded" onClick={() => toggleSection('investigador')}>
                            <h3 className="text-lg font-semibold text-gray-800">Investigador</h3>
                            {expandedSections.investigador ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
                        </div>
                        {expandedSections.investigador && (
                            <div className="mt-4 space-y-4 pt-4 border-t">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div><Label><RequiredField>Identificação/Nome</RequiredField></Label><Input {...register("investigador.nome")} /><p className="text-red-500 text-sm mt-1">{errors.investigador?.nome?.message}</p></div>
                                    <div><Label><RequiredField>Formação</RequiredField></Label><Input {...register("investigador.formacao")} /><p className="text-red-500 text-sm mt-1">{errors.investigador?.formacao?.message}</p></div>
                                    <div><Label><RequiredField>Telefone</RequiredField></Label><Controller name="investigador.telefone" control={control} render={({ field: { onChange, onBlur, value, ref } }) => ( <Input ref={ref} value={value || ''} onChange={(e) => onChange(applyPhoneMask(e.target.value))} onBlur={onBlur} type="tel" maxLength={15} /> )}/><p className="text-red-500 text-sm mt-1">{errors.investigador?.telefone?.message}</p></div>
                                    <div><Label><RequiredField>E-mail</RequiredField></Label><Input {...register("investigador.email")} /><p className="text-red-500 text-sm mt-1">{errors.investigador?.email?.message}</p></div>
                                    <div><Label><RequiredField>N° de Registro</RequiredField></Label><Input {...register("investigador.registro")} /><p className="text-red-500 text-sm mt-1">{errors.investigador?.registro?.message}</p></div>
                                </div>
                                {renderAddressFields('investigador', errors.investigador)}
                            </div>
                        )}
                    </div>
                    
                    {/* Seção Equipe Técnica da Instituição */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-lg font-semibold"><RequiredField>Equipe Técnica da Instituição</RequiredField></label>
                            <Button type="button" variant="outline" className="bg-[#90EE90] hover:bg-[#7CCD7C] text-white font-bold" onClick={() => appendEquipe({ ...defaultInvestigador })}><Plus className="h-4 w-4 mr-2" /> Adicionar Membro</Button>
                        </div>
                        {equipeFields.map((membro, index) => (
                             <div key={membro.id} className="border rounded-lg p-4 shadow-sm bg-white">
                                  <div className="flex justify-between items-center cursor-pointer hover:bg-gray-50 p-2 -m-2 rounded" onClick={() => toggleArrayItem(index)}>
                                      <h3 className="font-medium text-gray-800">{watch(`equipeInstituicao.${index}.nome`) || `Novo Membro da Equipe`}</h3>
                                      <div className="flex items-center">
                                          <Button type="button" variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={(e) => { e.stopPropagation(); removeEquipe(index);}}><Trash2 className="h-4 w-4 mr-1.5" /> Remover</Button>
                                          {watch(`equipeInstituicao.${index}.expanded`) ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
                                      </div>
                                  </div>
                                  {watch(`equipeInstituicao.${index}.expanded`) && (
                                      <div className="mt-4 space-y-4 pt-4 border-t">
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                              <div><Label><RequiredField>Identificação/Nome</RequiredField></Label><Input {...register(`equipeInstituicao.${index}.nome`)} /><p className="text-red-500 text-sm mt-1">{errors.equipeInstituicao?.[index]?.nome?.message}</p></div>
                                              <div><Label><RequiredField>Formação</RequiredField></Label><Input {...register(`equipeInstituicao.${index}.formacao`)} /><p className="text-red-500 text-sm mt-1">{errors.equipeInstituicao?.[index]?.formacao?.message}</p></div>
                                              <div><Label><RequiredField>Telefone</RequiredField></Label><Controller name={`equipeInstituicao.${index}.telefone`} control={control} render={({ field: { onChange, onBlur, value, ref } }) => ( <Input ref={ref} value={value || ''} onChange={(e) => onChange(applyPhoneMask(e.target.value))} onBlur={onBlur} type="tel" maxLength={15} /> )}/><p className="text-red-500 text-sm mt-1">{errors.equipeInstituicao?.[index]?.telefone?.message}</p></div>
                                              <div><Label><RequiredField>E-mail</RequiredField></Label><Input {...register(`equipeInstituicao.${index}.email`)} /><p className="text-red-500 text-sm mt-1">{errors.equipeInstituicao?.[index]?.email?.message}</p></div>
                                              <div><Label><RequiredField>N° de Registro</RequiredField></Label><Input {...register(`equipeInstituicao.${index}.registro`)} /><p className="text-red-500 text-sm mt-1">{errors.equipeInstituicao?.[index]?.registro?.message}</p></div>
                                          </div>
                                          {renderAddressFields(`equipeInstituicao.${index}`, (errors.equipeInstituicao as any)?.[index])}
                                      </div>
                                  )}
                             </div>
                        ))}
                        {errors.equipeInstituicao?.message && <p className="text-red-500 text-sm mt-1">{errors.equipeInstituicao.message}</p>}
                    </div>

                    {/* --- BOTÕES DE AÇÃO --- */}
                    <div className="flex justify-end items-center gap-4 pt-6">
                        <Button type="submit" className="bg-[#90EE90] hover:bg-[#7CCD7C] text-white font-bold px-8 py-3 text-lg h-auto rounded-md" disabled={isSubmitting}>
                            {isSubmitting ? (<div className="flex items-center gap-2"><LoadingSpinner /> Salvando...</div>) : ('Salvar e Avançar')}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    </ div>
    );
};

export default FormularioInstituicao;
