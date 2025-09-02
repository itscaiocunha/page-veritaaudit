import { useState, useEffect, useMemo } from "react";
import { useForm, useFieldArray, Controller, FieldPath } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Plus, ChevronDown, ChevronUp } from "lucide-react";

// --- Helpers e Componentes Auxiliares ---
const phoneRegExp = /^\(\d{2}\) \d{5}-\d{4}$/;
const cepRegExp = /^\d{5}-\d{3}$/;

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

const LoadingSpinner = () => (
    <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
);

// --- Schemas de Validação ---
const addressSchema = yup.object().shape({
    cep: yup.string().matches(cepRegExp, "CEP inválido. Use XXXXX-XXX").required("O CEP é obrigatório."),
    logradouro: yup.string().required("O logradouro é obrigatório."),
    numero: yup.string().required("O número é obrigatório."),
    complemento: yup.string(),
    bairro: yup.string().required("O bairro é obrigatório."),
    cidade: yup.string().required("A cidade é obrigatória."),
    uf: yup.string().required("O UF é obrigatório."),
});

const etapaClinicaSchema = yup.object().shape({
    identificacao: yup.string().required("A identificação é obrigatória."),
    telefone: yup.string().matches(phoneRegExp, "Formato: (XX) XXXXX-XXXX").required("O telefone é obrigatório."),
    email: yup.string().email("Digite um e-mail válido.").required("O e-mail é obrigatório."),
    geolocalizacao: yup.string().required("A geolocalização é obrigatória."),
    registroCiaep: yup.string().required("O N° de Registro CIAEP é obrigatório."),
    responsavel: yup.string().required("O responsável é obrigatório."),
    expanded: yup.boolean(),
    endereco: addressSchema,
});

const etapaLaboratorialSchema = yup.object().shape({
    identificacao: yup.string().required("A identificação é obrigatória."),
    telefone: yup.string().matches(phoneRegExp, "Formato: (XX) XXXXX-XXXX").required("O telefone é obrigatório."),
    email: yup.string().email("Digite um e-mail válido.").required("O e-mail é obrigatório."),
    credenciamento: yup.string().required("O credenciamento é obrigatório."),
    expanded: yup.boolean(),
    endereco: addressSchema,
});

const etapaEstatisticaSchema = yup.object().shape({
    identificacao: yup.string().required("A identificação é obrigatória."),
    telefone: yup.string().matches(phoneRegExp, "Formato: (XX) XXXXX-XXXX").required("O telefone é obrigatório."),
    email: yup.string().email("Digite um e-mail válido.").required("O e-mail é obrigatório."),
    expanded: yup.boolean(),
    endereco: addressSchema,
});

type FormValues = yup.InferType<ReturnType<typeof createValidationSchema>>;
type ArrayName = 'etapasClinicas' | 'etapasLaboratoriais' | 'etapasEstatisticas';

const createValidationSchema = (activeSections: { clinica: boolean; laboratorial: boolean; estatistica: boolean; }) => {
    return yup.object().shape({
        etapasClinicas: activeSections.clinica
            ? yup.array().of(etapaClinicaSchema).min(1, "Adicione pelo menos uma etapa clínica.")
            : yup.array().of(etapaClinicaSchema),
        etapasLaboratoriais: activeSections.laboratorial
            ? yup.array().of(etapaLaboratorialSchema).min(1, "Adicione pelo menos uma etapa laboratorial.")
            : yup.array().of(etapaLaboratorialSchema),
        etapasEstatisticas: activeSections.estatistica
            ? yup.array().of(etapaEstatisticaSchema).min(1, "Adicione pelo menos uma etapa estatística.")
            : yup.array().of(etapaEstatisticaSchema),
    }).test(
        'at-least-one-section-selected',
        'Selecione e preencha pelo menos uma das etapas.',
        () => activeSections.clinica || activeSections.laboratorial || activeSections.estatistica
    );
};


// --- COMPONENTE PRINCIPAL: LocalProtocol ---
const LocalProtocol = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loadingCep, setLoadingCep] = useState<string | null>(null);
    const [activeSections, setActiveSections] = useState({
        clinica: true,
        laboratorial: true,
        estatistica: true,
    });

    const validationSchema = useMemo(() => createValidationSchema(activeSections), [activeSections]);
    
    const defaultAddress = { cep: "", logradouro: "", numero: "", complemento: "", bairro: "", cidade: "", uf: "" };

    const { register, control, handleSubmit, formState: { errors }, setValue, watch, setFocus, trigger } = useForm<FormValues>({
        resolver: yupResolver(validationSchema),
        defaultValues: {
            etapasClinicas: [{ identificacao: "", telefone: "", email: "", geolocalizacao: "", registroCiaep: "", responsavel: "", expanded: true, endereco: defaultAddress }],
            etapasLaboratoriais: [],
            etapasEstatisticas: [],
        }
    });

    const { fields: clinicaFields, append: appendClinica, remove: removeClinica } = useFieldArray({ control, name: "etapasClinicas" });
    const { fields: laboratorialFields, append: appendLaboratorial, remove: removeLaboratorial } = useFieldArray({ control, name: "etapasLaboratoriais" });
    const { fields: estatisticaFields, append: appendEstatistica, remove: removeEstatistica } = useFieldArray({ control, name: "etapasEstatisticas" });

    const handleSectionToggle = (section: keyof typeof activeSections) => {
        const newActiveSections = { ...activeSections, [section]: !activeSections[section] };
        setActiveSections(newActiveSections);

        if (!newActiveSections[section]) {
            const sectionName = `etapas${section.charAt(0).toUpperCase() + section.slice(1)}` as ArrayName;
            setValue(sectionName, []);
        } else {
             const sectionName = `etapas${section.charAt(0).toUpperCase() + section.slice(1)}` as ArrayName;
             const defaultValues: any = { identificacao: "", telefone: "", email: "", expanded: true, endereco: defaultAddress };
             if(section === 'clinica') Object.assign(defaultValues, { geolocalizacao: "", registroCiaep: "", responsavel: ""});
             if(section === 'laboratorial') Object.assign(defaultValues, { credenciamento: ""});
             setValue(sectionName, [defaultValues]);
        }
        trigger();
    };


    const onSubmit = async (data: FormValues) => {
        setIsSubmitting(true);
        console.log("Dados do Local de Execução:", data);

        try {
            const dataToSave = {
                etapasClinicas: activeSections.clinica ? data.etapasClinicas : [],
                etapasLaboratoriais: activeSections.laboratorial ? data.etapasLaboratoriais : [],
                etapasEstatisticas: activeSections.estatistica ? data.etapasEstatisticas : [],
            };
            localStorage.setItem('dadosLocalProtocol', JSON.stringify([dataToSave]));
            console.log("Dados salvos no localStorage com a chave 'dadosLocalProtocol'.");
        } catch (error) {
            console.error("Erro ao salvar os dados no localStorage:", error);
        }
        
        await new Promise(resolve => setTimeout(resolve, 500));
        setIsSubmitting(false);
        navigate("/introducao");
    };

    const handleCepLookup = async (cep: string, arrayName: ArrayName, index: number) => {
        const cleanedCep = cep.replace(/\D/g, "");
        if (cleanedCep.length !== 8) return;

        const cepKey = `${arrayName}-${index}`;
        setLoadingCep(cepKey);

        try {
            const response = await fetch(`https://viacep.com.br/ws/${cleanedCep}/json/`);
            if (!response.ok) throw new Error("CEP não encontrado.");
            
            const data = await response.json();
            if (data.erro) throw new Error("CEP inválido.");

            setValue(`${arrayName}.${index}.endereco.logradouro`, data.logradouro, { shouldValidate: true });
            setValue(`${arrayName}.${index}.endereco.bairro`, data.bairro, { shouldValidate: true });
            setValue(`${arrayName}.${index}.endereco.cidade`, data.localidade, { shouldValidate: true });
            setValue(`${arrayName}.${index}.endereco.uf`, data.uf, { shouldValidate: true });
            
            setFocus(`${arrayName}.${index}.endereco.numero`);

        } catch (error) {
            console.error("Erro ao buscar CEP:", error);
        } finally {
            setLoadingCep(null);
        }
    };
    
    const toggleArrayItem = (arrayName: ArrayName, index: number) => {
        const fieldName = `${arrayName}.${index}.expanded` as const;
        setValue(fieldName, !watch(fieldName));
    };
    
    const renderAddressFields = (arrayName: ArrayName, index: number) => {
        const cepKey = `${arrayName}-${index}`;
        const fieldErrors = (errors as any)[arrayName]?.[index]?.endereco;

        return (
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-1">
                        <Label><RequiredField>CEP</RequiredField></Label>
                        <div className="flex items-center gap-2">
                            <Controller
                                name={`${arrayName}.${index}.endereco.cep` as FieldPath<FormValues>}
                                control={control}
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <Input
                                        value={value || ''}
                                        onChange={(e) => onChange(applyCepMask(e.target.value))}
                                        onBlur={(e) => { onBlur(); handleCepLookup(e.target.value, arrayName, index); }}
                                        maxLength={9}
                                    />
                                )}
                            />
                            {loadingCep === cepKey && <LoadingSpinner />}
                        </div>
                        <p className="text-red-500 text-xs mt-1 h-4">{fieldErrors?.cep?.message}</p>
                    </div>
                    <div className="md:col-span-2">
                        <Label><RequiredField>Logradouro</RequiredField></Label>
                        <Input {...register(`${arrayName}.${index}.endereco.logradouro` as FieldPath<FormValues>)} />
                        <p className="text-red-500 text-xs mt-1 h-4">{fieldErrors?.logradouro?.message}</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-1">
                        <Label><RequiredField>Número</RequiredField></Label>
                        <Input {...register(`${arrayName}.${index}.endereco.numero` as FieldPath<FormValues>)} />
                        <p className="text-red-500 text-xs mt-1 h-4">{fieldErrors?.numero?.message}</p>
                    </div>
                    <div className="md:col-span-2">
                        <Label>Complemento (Opcional)</Label>
                        <Input {...register(`${arrayName}.${index}.endereco.complemento` as FieldPath<FormValues>)} />
                        <p className="text-red-500 text-xs mt-1 h-4">{fieldErrors?.complemento?.message}</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <Label><RequiredField>Bairro</RequiredField></Label>
                        <Input {...register(`${arrayName}.${index}.endereco.bairro` as FieldPath<FormValues>)} />
                        <p className="text-red-500 text-xs mt-1 h-4">{fieldErrors?.bairro?.message}</p>
                    </div>
                    <div>
                        <Label><RequiredField>Cidade</RequiredField></Label>
                        <Input {...register(`${arrayName}.${index}.endereco.cidade` as FieldPath<FormValues>)} />
                        <p className="text-red-500 text-xs mt-1 h-4">{fieldErrors?.cidade?.message}</p>
                    </div>
                    <div>
                        <Label><RequiredField>UF</RequiredField></Label>
                        <Input {...register(`${arrayName}.${index}.endereco.uf` as FieldPath<FormValues>)} />
                        <p className="text-red-500 text-xs mt-1 h-4">{fieldErrors?.uf?.message}</p>
                    </div>
                </div>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-gray-100 font-sans">
            <header className="bg-white shadow-sm">
                <div className="max-w-6xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
                    <h1 className="text-2xl font-bold text-gray-800">VERITA AUDIT</h1>
                </div>
            </header>
            <main className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-xl shadow-lg p-8 md:p-10">
                    <h2 className="text-3xl font-bold text-center mb-2 text-gray-900">Local da Execução do Protocolo</h2>
                    <p className="text-center text-gray-500 mb-10">Selecione e preencha as seções necessárias para o estudo.</p>
                    
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
                        {/* --- Seção Etapa Clínica --- */}
                        <section className="border border-gray-200 rounded-xl p-6 transition-all">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-4">
                                    <Checkbox id="toggleClinica" checked={activeSections.clinica} onCheckedChange={() => handleSectionToggle('clinica')} className="data-[state=checked]:bg-green-400"/>
                                    <label htmlFor="toggleClinica" className="text-xl font-bold text-gray-800 cursor-pointer">Etapa Clínica</label>
                                </div>
                                {activeSections.clinica && <Button type="button" size="sm" className="bg-green-400 hover:bg-green-500 text-white" onClick={() => appendClinica({ identificacao: "", telefone: "", email: "", geolocalizacao: "", registroCiaep: "", responsavel: "", expanded: true, endereco: defaultAddress })}><Plus className="h-4 w-4 mr-2" /> Adicionar Local</Button>}
                            </div>
                            {activeSections.clinica && (
                                <div className="space-y-6">
                                    {clinicaFields.map((item, index) => {
                                        const fieldErrors = errors.etapasClinicas?.[index];
                                        return (
                                            <div key={item.id} className="border rounded-lg bg-gray-50/50">
                                                <div className="flex justify-between items-center p-4 cursor-pointer" onClick={() => toggleArrayItem('etapasClinicas', index)}>
                                                    <h3 className="font-semibold text-gray-700">{watch(`etapasClinicas.${index}.identificacao`) || 'Novo Local da Etapa Clínica'}</h3>
                                                    {watch(`etapasClinicas.${index}.expanded`) ? <ChevronUp className="h-5 w-5 text-gray-600" /> : <ChevronDown className="h-5 w-5 text-gray-600" />}
                                                </div>
                                                {watch(`etapasClinicas.${index}.expanded`) && (
                                                   <div className="p-4 border-t space-y-4">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                                            <div className="md:col-span-2"><Label><RequiredField>Identificação/Nome</RequiredField></Label><Input {...register(`etapasClinicas.${index}.identificacao`)} /><p className="text-red-500 text-xs mt-1 h-4">{fieldErrors?.identificacao?.message}</p></div>
                                                            <div><Label><RequiredField>Telefone</RequiredField></Label><Controller name={`etapasClinicas.${index}.telefone`} control={control} render={({ field: { onChange, value } }) => ( <Input value={value || ''} onChange={(e) => onChange(applyPhoneMask(e.target.value))} type="tel" maxLength={15} /> )}/><p className="text-red-500 text-xs mt-1 h-4">{fieldErrors?.telefone?.message}</p></div>
                                                            <div><Label><RequiredField>E-mail</RequiredField></Label><Input {...register(`etapasClinicas.${index}.email`)} /><p className="text-red-500 text-xs mt-1 h-4">{fieldErrors?.email?.message}</p></div>
                                                            <div><Label><RequiredField>Geolocalização</RequiredField></Label><Input {...register(`etapasClinicas.${index}.geolocalizacao`)} /><p className="text-red-500 text-xs mt-1 h-4">{fieldErrors?.geolocalizacao?.message}</p></div>
                                                            <div><Label><RequiredField>N° Registro CIAEP</RequiredField></Label><Input {...register(`etapasClinicas.${index}.registroCiaep`)} /><p className="text-red-500 text-xs mt-1 h-4">{fieldErrors?.registroCiaep?.message}</p></div>
                                                            <div className="md:col-span-2"><Label><RequiredField>Responsável pela Unidade</RequiredField></Label><Input {...register(`etapasClinicas.${index}.responsavel`)} /><p className="text-red-500 text-xs mt-1 h-4">{fieldErrors?.responsavel?.message}</p></div>
                                                        </div>
                                                        <div className="pt-4 mt-4 border-t"><h4 className="font-semibold mb-4 text-gray-700">Endereço do Local</h4>{renderAddressFields('etapasClinicas', index)}</div>
                                                        <div className="flex justify-end"><Button type="button" variant="ghost" size="sm" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => removeClinica(index)}><Trash2 className="h-4 w-4 mr-1.5" /> Remover Local</Button></div>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                    {errors.etapasClinicas?.message && <p className="text-red-500 text-sm mt-2">{errors.etapasClinicas.message}</p>}
                                </div>
                            )}
                        </section>

                        {/* --- Seção Etapa Laboratorial/Analítica --- */}
                        <section className="border border-gray-200 rounded-xl p-6 transition-all">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-4">
                                    <Checkbox id="toggleLaboratorial" checked={activeSections.laboratorial} onCheckedChange={() => handleSectionToggle('laboratorial')} className="data-[state=checked]:bg-green-400"/>
                                    <label htmlFor="toggleLaboratorial" className="text-xl font-bold text-gray-800 cursor-pointer">Etapa Laboratorial/Analítica</label>
                                </div>
                                {activeSections.laboratorial && <Button type="button" size="sm" className="bg-green-400 hover:bg-green-500 text-white" onClick={() => appendLaboratorial({ identificacao: "", telefone: "", email: "", credenciamento: "", expanded: true, endereco: defaultAddress })}><Plus className="h-4 w-4 mr-2" /> Adicionar Local</Button>}
                            </div>
                            {activeSections.laboratorial && (
                                <div className="space-y-6">
                                    {laboratorialFields.map((item, index) => {
                                         const fieldErrors = errors.etapasLaboratoriais?.[index];
                                         return (
                                            <div key={item.id} className="border rounded-lg bg-gray-50/50">
                                                <div className="flex justify-between items-center p-4 cursor-pointer" onClick={() => toggleArrayItem('etapasLaboratoriais', index)}>
                                                    <h3 className="font-semibold text-gray-700">{watch(`etapasLaboratoriais.${index}.identificacao`) || 'Novo Local da Etapa Laboratorial'}</h3>
                                                    {watch(`etapasLaboratoriais.${index}.expanded`) ? <ChevronUp className="h-5 w-5 text-gray-600" /> : <ChevronDown className="h-5 w-5 text-gray-600" />}
                                                </div>
                                                {watch(`etapasLaboratoriais.${index}.expanded`) && (
                                                <div className="p-4 border-t space-y-4">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                                            <div className="md:col-span-2"><Label><RequiredField>Identificação/Nome</RequiredField></Label><Input {...register(`etapasLaboratoriais.${index}.identificacao`)} /><p className="text-red-500 text-xs mt-1 h-4">{fieldErrors?.identificacao?.message}</p></div>
                                                            <div><Label><RequiredField>Telefone</RequiredField></Label><Controller name={`etapasLaboratoriais.${index}.telefone`} control={control} render={({ field: { onChange, value } }) => ( <Input value={value || ''} onChange={(e) => onChange(applyPhoneMask(e.target.value))} type="tel" maxLength={15} /> )}/><p className="text-red-500 text-xs mt-1 h-4">{fieldErrors?.telefone?.message}</p></div>
                                                            <div><Label><RequiredField>E-mail</RequiredField></Label><Input {...register(`etapasLaboratoriais.${index}.email`)} /><p className="text-red-500 text-xs mt-1 h-4">{fieldErrors?.email?.message}</p></div>
                                                            <div className="md:col-span-2"><Label><RequiredField>Credenciamento</RequiredField></Label><Input {...register(`etapasLaboratoriais.${index}.credenciamento`)} /><p className="text-red-500 text-xs mt-1 h-4">{fieldErrors?.credenciamento?.message}</p></div>
                                                        </div>
                                                        <div className="pt-4 mt-4 border-t"><h4 className="font-semibold mb-4 text-gray-700">Endereço do Local</h4>{renderAddressFields('etapasLaboratoriais', index)}</div>
                                                        <div className="flex justify-end"><Button type="button" variant="ghost" size="sm" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => removeLaboratorial(index)}><Trash2 className="h-4 w-4 mr-1.5" /> Remover Local</Button></div>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                    {errors.etapasLaboratoriais?.message && <p className="text-red-500 text-sm mt-2">{errors.etapasLaboratoriais.message}</p>}
                                </div>
                            )}
                        </section>

                        {/* --- Seção Etapa Estatística --- */}
                        <section className="border border-gray-200 rounded-xl p-6 transition-all">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-4">
                                    <Checkbox id="toggleEstatistica" checked={activeSections.estatistica} onCheckedChange={() => handleSectionToggle('estatistica')} className="data-[state=checked]:bg-green-400"/>
                                    <label htmlFor="toggleEstatistica" className="text-xl font-bold text-gray-800 cursor-pointer">Etapa Estatística</label>
                                </div>
                                {activeSections.estatistica && <Button type="button" size="sm" className="bg-green-400 hover:bg-green-500 text-white" onClick={() => appendEstatistica({ identificacao: "", telefone: "", email: "", expanded: true, endereco: defaultAddress })}><Plus className="h-4 w-4 mr-2" /> Adicionar Local</Button>}
                            </div>
                            {activeSections.estatistica && (
                                <div className="space-y-6">
                                    {estatisticaFields.map((item, index) => {
                                        const fieldErrors = errors.etapasEstatisticas?.[index];
                                        return (
                                            <div key={item.id} className="border rounded-lg bg-gray-50/50">
                                                <div className="flex justify-between items-center p-4 cursor-pointer" onClick={() => toggleArrayItem('etapasEstatisticas', index)}>
                                                    <h3 className="font-semibold text-gray-700">{watch(`etapasEstatisticas.${index}.identificacao`) || 'Novo Local da Etapa Estatística'}</h3>
                                                    {watch(`etapasEstatisticas.${index}.expanded`) ? <ChevronUp className="h-5 w-5 text-gray-600" /> : <ChevronDown className="h-5 w-5 text-gray-600" />}
                                                </div>
                                                {watch(`etapasEstatisticas.${index}.expanded`) && (
                                                    <div className="p-4 border-t space-y-4">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                                            <div className="md:col-span-2"><Label><RequiredField>Identificação/Nome</RequiredField></Label><Input {...register(`etapasEstatisticas.${index}.identificacao`)} /><p className="text-red-500 text-xs mt-1 h-4">{fieldErrors?.identificacao?.message}</p></div>
                                                            <div><Label><RequiredField>Telefone</RequiredField></Label><Controller name={`etapasEstatisticas.${index}.telefone`} control={control} render={({ field: { onChange, value } }) => ( <Input value={value || ''} onChange={(e) => onChange(applyPhoneMask(e.target.value))} type="tel" maxLength={15} /> )}/><p className="text-red-500 text-xs mt-1 h-4">{fieldErrors?.telefone?.message}</p></div>
                                                            <div><Label><RequiredField>E-mail</RequiredField></Label><Input {...register(`etapasEstatisticas.${index}.email`)} /><p className="text-red-500 text-xs mt-1 h-4">{fieldErrors?.email?.message}</p></div>
                                                        </div>
                                                        <div className="pt-4 mt-4 border-t"><h4 className="font-semibold mb-4 text-gray-700">Endereço do Local</h4>{renderAddressFields('etapasEstatisticas', index)}</div>
                                                        <div className="flex justify-end"><Button type="button" variant="ghost" size="sm" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => removeEstatistica(index)}><Trash2 className="h-4 w-4 mr-1.5" /> Remover Local</Button></div>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                    {errors.etapasEstatisticas?.message && <p className="text-red-500 text-sm mt-2">{errors.etapasEstatisticas.message}</p>}
                                </div>
                            )}
                        </section>
                        
                        {errors.root?.message && <p className="text-red-500 text-center font-bold text-lg mt-4">{errors.root.message}</p>}

                        {/* --- Botão de Submissão --- */}
                        <div className="flex justify-end pt-6">
                          <Button
                              type="submit"
                              className="bg-green-600 hover:bg-green-700 text-white font-bold px-10 py-3 text-lg h-auto rounded-lg shadow-md hover:shadow-lg transition-all"
                              disabled={isSubmitting}
                          >
                              {isSubmitting ? (<div className="flex items-center gap-2"><LoadingSpinner /> Salvando...</div>) : ('Salvar e Avançar')}
                          </Button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default LocalProtocol;
