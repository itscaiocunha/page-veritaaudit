import { useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

// --- Schema de Validação (com campos de endereço detalhados) ---
const addressSchema = {
    cep: yup.string().matches(cepRegExp, "CEP inválido. Use XXXXX-XXX").required("O CEP é obrigatório."),
    logradouro: yup.string().required("O logradouro é obrigatório."),
    numero: yup.string().required("O número é obrigatório."),
    complemento: yup.string(),
    bairro: yup.string().required("O bairro é obrigatório."),
    cidade: yup.string().required("A cidade é obrigatória."),
    uf: yup.string().required("O UF é obrigatório."),
};

const etapaClinicaSchema = yup.object().shape({
    id: yup.number(),
    identificacao: yup.string().required("A identificação é obrigatória."),
    telefone: yup.string().matches(phoneRegExp, "Formato: (XX) XXXXX-XXXX").required("O telefone é obrigatório."),
    email: yup.string().email("Digite um e-mail válido.").required("O e-mail é obrigatório."),
    geolocalizacao: yup.string().required("A geolocalização é obrigatória."),
    registroCiaep: yup.string().required("O N° de Registro CIAEP é obrigatório."),
    responsavel: yup.string().required("O responsável é obrigatório."),
    expanded: yup.boolean(),
    ...addressSchema,
});

const etapaLaboratorialSchema = yup.object().shape({
    id: yup.number(),
    identificacao: yup.string().required("A identificação é obrigatória."),
    telefone: yup.string().matches(phoneRegExp, "Formato: (XX) XXXXX-XXXX").required("O telefone é obrigatório."),
    email: yup.string().email("Digite um e-mail válido.").required("O e-mail é obrigatório."),
    credenciamento: yup.string().required("O credenciamento é obrigatório."),
    expanded: yup.boolean(),
    ...addressSchema,
});

const etapaEstatisticaSchema = yup.object().shape({
    id: yup.number(),
    identificacao: yup.string().required("A identificação é obrigatória."),
    telefone: yup.string().matches(phoneRegExp, "Formato: (XX) XXXXX-XXXX").required("O telefone é obrigatório."),
    email: yup.string().email("Digite um e-mail válido.").required("O e-mail é obrigatório."),
    expanded: yup.boolean(),
    ...addressSchema,
});


const validationSchema = yup.object().shape({
    etapasClinicas: yup.array().of(etapaClinicaSchema).min(1, "Adicione pelo menos uma etapa clínica."),
    etapasLaboratoriais: yup.array().of(etapaLaboratorialSchema).min(1, "Adicione pelo menos uma etapa laboratorial."),
    etapasEstatisticas: yup.array().of(etapaEstatisticaSchema).min(1, "Adicione pelo menos uma etapa estatística."),
});

type ArrayName = 'etapasClinicas' | 'etapasLaboratoriais' | 'etapasEstatisticas';

// --- COMPONENTE PRINCIPAL: LocalProtocol ---
const LocalProtocol = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loadingCep, setLoadingCep] = useState<string | null>(null);
    
    const defaultAddress = { cep: "", logradouro: "", numero: "", complemento: "", bairro: "", cidade: "", uf: "" };

    const { register, control, handleSubmit, formState: { errors }, setValue, watch, setFocus, trigger } = useForm({
        resolver: yupResolver(validationSchema),
        defaultValues: {
            etapasClinicas: [{ id: 1, identificacao: "", telefone: "", email: "", geolocalizacao: "", registroCiaep: "", responsavel: "", expanded: true, ...defaultAddress }],
            etapasLaboratoriais: [{ id: 2, identificacao: "", telefone: "", email: "", credenciamento: "", expanded: true, ...defaultAddress }],
            etapasEstatisticas: [{ id: 3, identificacao: "", telefone: "", email: "", expanded: true, ...defaultAddress }],
        }
    });

    const { fields: clinicaFields, append: appendClinica, remove: removeClinica } = useFieldArray({ control, name: "etapasClinicas" });
    const { fields: laboratorialFields, append: appendLaboratorial, remove: removeLaboratorial } = useFieldArray({ control, name: "etapasLaboratoriais" });
    const { fields: estatisticaFields, append: appendEstatistica, remove: removeEstatistica } = useFieldArray({ control, name: "etapasEstatisticas" });

    const handleFinalizar = async (data: any) => {
        setIsSubmitting(true);
        console.log("Dados do Local de Execução:", data);
        await new Promise(resolve => setTimeout(resolve, 2000));
        alert("Formulário salvo com sucesso!");
        setIsSubmitting(false);
    };

    const handleCepLookup = async (cep: string, arrayName: ArrayName, index: number) => {
        const cleanedCep = cep.replace(/\D/g, "");
        if (cleanedCep.length !== 8) {
            return;
        }

        const cepKey = `${arrayName}-${index}`;
        setLoadingCep(cepKey);

        try {
            const response = await fetch(`https://viacep.com.br/ws/${cleanedCep}/json/`);
            if (!response.ok) throw new Error("CEP não encontrado.");
            
            const data = await response.json();
            if (data.erro) throw new Error("CEP inválido.");

            setValue(`${arrayName}.${index}.logradouro`, data.logradouro, { shouldValidate: true });
            setValue(`${arrayName}.${index}.bairro`, data.bairro, { shouldValidate: true });
            setValue(`${arrayName}.${index}.cidade`, data.localidade, { shouldValidate: true });
            setValue(`${arrayName}.${index}.uf`, data.uf, { shouldValidate: true });
            
            // Foca no campo 'numero' após preencher o endereço
            setFocus(`${arrayName}.${index}.numero`);

        } catch (error) {
            console.error("Erro ao buscar CEP:", error);
            // Opcional: Limpar campos se o CEP for inválido
            setValue(`${arrayName}.${index}.logradouro`, "", { shouldValidate: true });
            setValue(`${arrayName}.${index}.bairro`, "", { shouldValidate: true });
            setValue(`${arrayName}.${index}.cidade`, "", { shouldValidate: true });
            setValue(`${arrayName}.${index}.uf`, "", { shouldValidate: true });
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
        const fieldErrors = errors[arrayName]?.[index];

        return (
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                {/* CEP */}
                <div className="md:col-span-2">
                    <Label><RequiredField>CEP</RequiredField></Label>
                    <div className="flex items-center gap-2">
                         <Controller
                            name={`${arrayName}.${index}.cep`}
                            control={control}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    onChange={(e) => field.onChange(applyCepMask(e.target.value))}
                                    onBlur={(e) => {
                                        field.onBlur(); // Notifica o react-hook-form sobre o blur
                                        handleCepLookup(e.target.value, arrayName, index);
                                    }}
                                    maxLength={9}
                                />
                            )}
                        />
                        {loadingCep === cepKey && <LoadingSpinner />}
                    </div>
                    <p className="text-red-500 text-sm mt-1">{fieldErrors?.cep?.message}</p>
                </div>
                {/* Logradouro */}
                <div className="md:col-span-4"><Label><RequiredField>Logradouro</RequiredField></Label><Input {...register(`${arrayName}.${index}.logradouro`)} /><p className="text-red-500 text-sm mt-1">{fieldErrors?.logradouro?.message}</p></div>
                {/* Número */}
                <div className="md:col-span-2"><Label><RequiredField>Número</RequiredField></Label><Input {...register(`${arrayName}.${index}.numero`)} /><p className="text-red-500 text-sm mt-1">{fieldErrors?.numero?.message}</p></div>
                {/* Complemento */}
                <div className="md:col-span-4"><Label>Complemento (Opcional)</Label><Input {...register(`${arrayName}.${index}.complemento`)} /><p className="text-red-500 text-sm mt-1">{fieldErrors?.complemento?.message}</p></div>
                {/* Bairro */}
                <div className="md:col-span-2"><Label><RequiredField>Bairro</RequiredField></Label><Input {...register(`${arrayName}.${index}.bairro`)} /><p className="text-red-500 text-sm mt-1">{fieldErrors?.bairro?.message}</p></div>
                {/* Cidade */}
                <div className="md:col-span-3"><Label><RequiredField>Cidade</RequiredField></Label><Input {...register(`${arrayName}.${index}.cidade`)} /><p className="text-red-500 text-sm mt-1">{fieldErrors?.cidade?.message}</p></div>
                {/* UF */}
                <div className="md:col-span-1"><Label><RequiredField>UF</RequiredField></Label><Input {...register(`${arrayName}.${index}.uf`)} /><p className="text-red-500 text-sm mt-1">{fieldErrors?.uf?.message}</p></div>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen flex flex-col items-center py-8 px-4 bg-gray-50 font-inter">
            <h1 className="text-4xl font-bold mb-8">VERITA AUDIT</h1>
            <div className="w-full max-w-4xl rounded-lg p-8 bg-white shadow-md">
                <h2 className="text-2xl font-semibold text-center mb-6">Local da Execução do Protocolo</h2>
                
                <form onSubmit={handleSubmit(handleFinalizar)} className="space-y-8">
                    {/* --- Seção Etapa Clínica --- */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-xl font-semibold text-gray-800"><RequiredField>Etapa Clínica</RequiredField></label>
                            <Button type="button" variant="outline" className="bg-[#90EE90] hover:bg-[#7CCD7C] text-white font-bold" onClick={() => appendClinica({ id: Date.now(), identificacao: "", telefone: "", email: "", geolocalizacao: "", registroCiaep: "", responsavel: "", expanded: true, ...defaultAddress })}><Plus className="h-4 w-4 mr-2" /> Adicionar Local</Button>
                        </div>
                        {clinicaFields.map((item, index) => {
                            const fieldErrors = errors.etapasClinicas?.[index];
                            return (
                                <div key={item.id} className="border rounded-lg p-4 shadow-sm bg-white">
                                    <div className="flex justify-between items-center cursor-pointer hover:bg-gray-50 p-2 -m-2 rounded" onClick={() => toggleArrayItem('etapasClinicas', index)}>
                                        <h3 className="font-medium text-gray-800">{watch(`etapasClinicas.${index}.identificacao`) || 'Novo Local da Etapa Clínica'}</h3>
                                        {watch(`etapasClinicas.${index}.expanded`) ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
                                    </div>
                                    {watch(`etapasClinicas.${index}.expanded`) && (
                                       <div className="mt-4 space-y-4 pt-4 border-t">
                                            {/* Campos gerais */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="md:col-span-2"><Label><RequiredField>Identificação/Nome</RequiredField></Label><Input {...register(`etapasClinicas.${index}.identificacao`)} /><p className="text-red-500 text-sm mt-1">{fieldErrors?.identificacao?.message}</p></div>
                                                <div><Label><RequiredField>Telefone</RequiredField></Label><Controller name={`etapasClinicas.${index}.telefone`} control={control} render={({ field }) => ( <Input {...field} onChange={(e) => field.onChange(applyPhoneMask(e.target.value))} /> )}/><p className="text-red-500 text-sm mt-1">{fieldErrors?.telefone?.message}</p></div>
                                                <div><Label><RequiredField>E-mail</RequiredField></Label><Input {...register(`etapasClinicas.${index}.email`)} /><p className="text-red-500 text-sm mt-1">{fieldErrors?.email?.message}</p></div>
                                                <div><Label><RequiredField>Geolocalização</RequiredField></Label><Input {...register(`etapasClinicas.${index}.geolocalizacao`)} /><p className="text-red-500 text-sm mt-1">{fieldErrors?.geolocalizacao?.message}</p></div>
                                                <div><Label><RequiredField>N° Registro CIAEP</RequiredField></Label><Input {...register(`etapasClinicas.${index}.registroCiaep`)} /><p className="text-red-500 text-sm mt-1">{fieldErrors?.registroCiaep?.message}</p></div>
                                                <div className="md:col-span-2"><Label><RequiredField>Responsável pela Unidade</RequiredField></Label><Input {...register(`etapasClinicas.${index}.responsavel`)} /><p className="text-red-500 text-sm mt-1">{fieldErrors?.responsavel?.message}</p></div>
                                            </div>
                                            <div className="pt-4 mt-4 border-t"><h4 className="font-medium mb-2 text-gray-700">Endereço do Local</h4>{renderAddressFields('etapasClinicas', index)}</div>
                                            <div className="flex justify-end mt-2"><Button type="button" variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => removeClinica(index)}><Trash2 className="h-4 w-4 mr-1.5" /> Remover</Button></div>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                        {errors.etapasClinicas && <p className="text-red-500 text-sm mt-1">{errors.etapasClinicas.message}</p>}
                    </div>

                    {/* --- Seção Etapa Laboratorial/Analítica --- */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-xl font-semibold text-gray-800"><RequiredField>Etapa Laboratorial/Analítica</RequiredField></label>
                            <Button type="button" variant="outline" className="bg-[#90EE90] hover:bg-[#7CCD7C] text-white font-bold" onClick={() => appendLaboratorial({ id: Date.now(), identificacao: "", telefone: "", email: "", credenciamento: "", expanded: true, ...defaultAddress })}><Plus className="h-4 w-4 mr-2" /> Adicionar Local</Button>
                        </div>
                        {laboratorialFields.map((item, index) => {
                             const fieldErrors = errors.etapasLaboratoriais?.[index];
                             return (
                                <div key={item.id} className="border rounded-lg p-4 shadow-sm bg-white">
                                    <div className="flex justify-between items-center cursor-pointer hover:bg-gray-50 p-2 -m-2 rounded" onClick={() => toggleArrayItem('etapasLaboratoriais', index)}>
                                        <h3 className="font-medium text-gray-800">{watch(`etapasLaboratoriais.${index}.identificacao`) || 'Novo Local da Etapa Laboratorial'}</h3>
                                        {watch(`etapasLaboratoriais.${index}.expanded`) ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
                                    </div>
                                    {watch(`etapasLaboratoriais.${index}.expanded`) && (
                                    <div className="mt-4 space-y-4 pt-4 border-t">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="md:col-span-2"><Label><RequiredField>Identificação/Nome</RequiredField></Label><Input {...register(`etapasLaboratoriais.${index}.identificacao`)} /><p className="text-red-500 text-sm mt-1">{fieldErrors?.identificacao?.message}</p></div>
                                                <div><Label><RequiredField>Telefone</RequiredField></Label><Controller name={`etapasLaboratoriais.${index}.telefone`} control={control} render={({ field }) => ( <Input {...field} onChange={(e) => field.onChange(applyPhoneMask(e.target.value))} /> )}/><p className="text-red-500 text-sm mt-1">{fieldErrors?.telefone?.message}</p></div>
                                                <div><Label><RequiredField>E-mail</RequiredField></Label><Input {...register(`etapasLaboratoriais.${index}.email`)} /><p className="text-red-500 text-sm mt-1">{fieldErrors?.email?.message}</p></div>
                                                <div className="md:col-span-2"><Label><RequiredField>Credenciamento</RequiredField></Label><Input {...register(`etapasLaboratoriais.${index}.credenciamento`)} /><p className="text-red-500 text-sm mt-1">{fieldErrors?.credenciamento?.message}</p></div>
                                            </div>
                                            <div className="pt-4 mt-4 border-t"><h4 className="font-medium mb-2 text-gray-700">Endereço do Local</h4>{renderAddressFields('etapasLaboratoriais', index)}</div>
                                            <div className="flex justify-end mt-2"><Button type="button" variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => removeLaboratorial(index)}><Trash2 className="h-4 w-4 mr-1.5" /> Remover</Button></div>
                                    </div>
                                    )}
                                </div>
                            )
                        })}
                        {errors.etapasLaboratoriais && <p className="text-red-500 text-sm mt-1">{errors.etapasLaboratoriais.message}</p>}
                    </div>

                    {/* --- Seção Etapa Estatística --- */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-xl font-semibold text-gray-800"><RequiredField>Etapa Estatística</RequiredField></label>
                            <Button type="button" variant="outline" className="bg-[#90EE90] hover:bg-[#7CCD7C] text-white font-bold" onClick={() => appendEstatistica({ id: Date.now(), identificacao: "", telefone: "", email: "", expanded: true, ...defaultAddress })}><Plus className="h-4 w-4 mr-2" /> Adicionar Local</Button>
                        </div>
                        {estatisticaFields.map((item, index) => {
                            const fieldErrors = errors.etapasEstatisticas?.[index];
                            return (
                                <div key={item.id} className="border rounded-lg p-4 shadow-sm bg-white">
                                    <div className="flex justify-between items-center cursor-pointer hover:bg-gray-50 p-2 -m-2 rounded" onClick={() => toggleArrayItem('etapasEstatisticas', index)}>
                                        <h3 className="font-medium text-gray-800">{watch(`etapasEstatisticas.${index}.identificacao`) || 'Novo Local da Etapa Estatística'}</h3>
                                        {watch(`etapasEstatisticas.${index}.expanded`) ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
                                    </div>
                                    {watch(`etapasEstatisticas.${index}.expanded`) && (
                                        <div className="mt-4 space-y-4 pt-4 border-t">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="md:col-span-2"><Label><RequiredField>Identificação/Nome</RequiredField></Label><Input {...register(`etapasEstatisticas.${index}.identificacao`)} /><p className="text-red-500 text-sm mt-1">{fieldErrors?.identificacao?.message}</p></div>
                                                <div><Label><RequiredField>Telefone</RequiredField></Label><Controller name={`etapasEstatisticas.${index}.telefone`} control={control} render={({ field }) => ( <Input {...field} onChange={(e) => field.onChange(applyPhoneMask(e.target.value))} /> )}/><p className="text-red-500 text-sm mt-1">{fieldErrors?.telefone?.message}</p></div>
                                                <div><Label><RequiredField>E-mail</RequiredField></Label><Input {...register(`etapasEstatisticas.${index}.email`)} /><p className="text-red-500 text-sm mt-1">{fieldErrors?.email?.message}</p></div>
                                            </div>
                                            <div className="pt-4 mt-4 border-t"><h4 className="font-medium mb-2 text-gray-700">Endereço do Local</h4>{renderAddressFields('etapasEstatisticas', index)}</div>
                                            <div className="flex justify-end mt-2"><Button type="button" variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => removeEstatistica(index)}><Trash2 className="h-4 w-4 mr-1.5" /> Remover</Button></div>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                        {errors.etapasEstatisticas && <p className="text-red-500 text-sm mt-1">{errors.etapasEstatisticas.message}</p>}
                    </div>

                    {/* --- Botão de Submissão --- */}
                    <div className="flex justify-end pt-6">
                      <Button
                          type="button"
                          variant="outline"
                          className="bg-[#90EE90] hover:bg-[#7CCD7C] text-white font-bold px-8 py-3 text-lg h-auto rounded-md"
                          onClick={() => navigate("/produto-veterinario")}
                      >
                          {isSubmitting ? (<div className="flex items-center gap-2"><LoadingSpinner /> Salvando...</div>) : ('Salvar Informações')}
                      </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LocalProtocol;