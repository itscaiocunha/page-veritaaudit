import { useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, ChevronDown, ChevronUp } from "lucide-react";

// --- Schema de Validação (sem alterações) ---
const phoneRegExp = /^\(\d{2}\) \d{5}-\d{4}$/;
const investigadorSchema = yup.object().shape({
    id: yup.number(),
    nome: yup.string().required("O nome é obrigatório."),
    formacao: yup.string().required("A formação é obrigatória."),
    endereco: yup.string().required("O endereço é obrigatório."),
    telefone: yup.string().matches(phoneRegExp, "Telefone inválido. Use (XX) XXXXX-XXXX").required("O telefone é obrigatório."),
    email: yup.string().email("Digite um e-mail válido.").required("O e-mail é obrigatório."),
    registro: yup.string().required("O N° de registro é obrigatório."),
    expanded: yup.boolean()
});
const validationSchema = yup.object().shape({
  instituicao: yup.object().shape({
    nome: yup.string().required("O nome da instituição é obrigatório."),
    endereco: yup.string().required("O endereço é obrigatório."),
    telefone: yup.string().matches(phoneRegExp, "Telefone inválido.").required("O telefone é obrigatório."),
    registroCiaep: yup.string().required("O N° de Registro CIAEP é obrigatório."),
  }),
  investigador: investigadorSchema,
  equipeInstituicao: yup.array().of(investigadorSchema).min(1, "É necessário adicionar pelo menos um membro à equipe."),
});

// --- Componentes e Funções Auxiliares (sem alterações) ---
const RequiredField = ({ children }: { children: React.ReactNode }) => (
  <>{children} <span className="text-red-500 font-bold">*</span></>
);
const applyPhoneMask = (value: string) => {
    if (!value) return "";
    value = value.replace(/\D/g, "");
    value = value.replace(/^(\d{2})(\d)/g, "($1) $2");
    value = value.replace(/(\d)(\d{4})$/, "$1-$2");
    return value;
};

// Componente para o spinner de carregamento, como no exemplo
const LoadingSpinner = () => (
    <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
);


// --- COMPONENTE PRINCIPAL ---
const FormularioInstituicao = () => {
    const [expandedSections, setExpandedSections] = useState({
        instituicao: true,
        investigador: true,
    });
    
    // 1. Adicionar estado para controlar o envio
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, control, handleSubmit, formState: { errors }, setValue, watch } = useForm({
        resolver: yupResolver(validationSchema),
        defaultValues: {
            instituicao: { nome: "", endereco: "", telefone: "", registroCiaep: "" },
            investigador: { nome: "", formacao: "", endereco: "", telefone: "", email: "", registro: "" },
            equipeInstituicao: [{ id: 1, nome: "", formacao: "", registro: "", endereco: "", telefone: "", email: "", expanded: true }],
        }
    });

    const { fields: equipeFields, append: appendEquipe, remove: removeEquipe } = useFieldArray({
        control,
        name: "equipeInstituicao",
    });

    // 2. Renomear a função de submit e adicionar a lógica de carregamento
    const handleFinalizar = async (data: any) => {
        setIsSubmitting(true);
        console.log("Dados da Instituição de Pesquisa:", data);
        
        // Simula uma chamada de API
        await new Promise(resolve => setTimeout(resolve, 2000));

        alert("Formulário salvo com sucesso!");
        setIsSubmitting(false);
    };

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections(prev => ({...prev, [section]: !prev[section]}));
    };

    const toggleArrayItem = (index: number) => {
        const currentExpandedState = watch(`equipeInstituicao.${index}.expanded`);
        setValue(`equipeInstituicao.${index}.expanded`, !currentExpandedState);
    };

    return (
        <div className="min-h-screen flex flex-col items-center py-8 px-4 bg-gray-50 font-inter">
            <h1 className="text-4xl font-bold mb-8">VERITA AUDIT</h1>
            <div className="w-full max-w-4xl rounded-lg p-8 bg-white shadow-md">
                <h2 className="text-2xl font-semibold text-center mb-6">Informações da Instituição de Pesquisa</h2>
                {/* O formulário agora chama a nova função handleFinalizar */}
                <form onSubmit={handleSubmit(handleFinalizar)} className="space-y-6">
                    
                    {/* ... todas as seções do formulário (Instituição, Investigador, Equipe) permanecem iguais ... */}
                    
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
                                    <div><Label><RequiredField>Telefone</RequiredField></Label><Controller name="instituicao.telefone" control={control} render={({ field }) => ( <Input {...field} onChange={(e) => field.onChange(applyPhoneMask(e.target.value))} type="tel" maxLength={15} /> )}/><p className="text-red-500 text-sm mt-1">{errors.instituicao?.telefone?.message}</p></div>
                                    <div><Label><RequiredField>N° Registro CIAEP</RequiredField></Label><Input {...register("instituicao.registroCiaep")} /><p className="text-red-500 text-sm mt-1">{errors.instituicao?.registroCiaep?.message}</p></div>
                                </div>
                                <div><Label><RequiredField>Endereço</RequiredField></Label><Input {...register("instituicao.endereco")} /><p className="text-red-500 text-sm mt-1">{errors.instituicao?.endereco?.message}</p></div>
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
                                   <div><Label><RequiredField>Telefone</RequiredField></Label><Controller name="investigador.telefone" control={control} render={({ field }) => ( <Input {...field} onChange={(e) => field.onChange(applyPhoneMask(e.target.value))} type="tel" maxLength={15} /> )}/><p className="text-red-500 text-sm mt-1">{errors.investigador?.telefone?.message}</p></div>
                                   <div><Label><RequiredField>E-mail</RequiredField></Label><Input {...register("investigador.email")} /><p className="text-red-500 text-sm mt-1">{errors.investigador?.email?.message}</p></div>
                                   <div className="md:col-span-2"><Label><RequiredField>Endereço</RequiredField></Label><Input {...register("investigador.endereco")} /><p className="text-red-500 text-sm mt-1">{errors.investigador?.endereco?.message}</p></div>
                                   <div><Label><RequiredField>N° de Registro</RequiredField></Label><Input {...register("investigador.registro")} /><p className="text-red-500 text-sm mt-1">{errors.investigador?.registro?.message}</p></div>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* Seção Equipe Técnica da Instituição */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-lg font-semibold"><RequiredField>Equipe Técnica da Instituição</RequiredField></label>
                            <Button type="button" variant="outline" className="bg-[#90EE90] hover:bg-[#7CCD7C] text-white font-bold" onClick={() => appendEquipe({ id: Date.now(), nome: "", formacao: "", registro: "", endereco: "", telefone: "", email: "", expanded: true })}><Plus className="h-4 w-4 mr-2" /> Adicionar Membro</Button>
                        </div>
                        {equipeFields.map((membro, index) => (
                             <div key={membro.id} className="border rounded-lg p-4 shadow-sm bg-white">
                                <div className="flex justify-between items-center cursor-pointer hover:bg-gray-50 p-2 -m-2 rounded" onClick={() => toggleArrayItem(index)}>
                                    <h3 className="font-medium text-gray-800">{watch(`equipeInstituicao.${index}.nome`) || `Novo Membro da Equipe`}</h3>
                                    {watch(`equipeInstituicao.${index}.expanded`) ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
                                </div>
                                {watch(`equipeInstituicao.${index}.expanded`) && (
                                   <div className="mt-4 space-y-4 pt-4 border-t">
                                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                           <div><Label><RequiredField>Identificação/Nome</RequiredField></Label><Input {...register(`equipeInstituicao.${index}.nome`)} /><p className="text-red-500 text-sm mt-1">{errors.equipeInstituicao?.[index]?.nome?.message}</p></div>
                                           <div><Label><RequiredField>Formação</RequiredField></Label><Input {...register(`equipeInstituicao.${index}.formacao`)} /><p className="text-red-500 text-sm mt-1">{errors.equipeInstituicao?.[index]?.formacao?.message}</p></div>
                                           <div><Label><RequiredField>Telefone</RequiredField></Label><Controller name={`equipeInstituicao.${index}.telefone`} control={control} render={({ field }) => ( <Input {...field} onChange={(e) => field.onChange(applyPhoneMask(e.target.value))} type="tel" maxLength={15} /> )}/><p className="text-red-500 text-sm mt-1">{errors.equipeInstituicao?.[index]?.telefone?.message}</p></div>
                                           <div><Label><RequiredField>E-mail</RequiredField></Label><Input {...register(`equipeInstituicao.${index}.email`)} /><p className="text-red-500 text-sm mt-1">{errors.equipeInstituicao?.[index]?.email?.message}</p></div>
                                           <div className="md:col-span-2"><Label><RequiredField>Endereço</RequiredField></Label><Input {...register(`equipeInstituicao.${index}.endereco`)} /><p className="text-red-500 text-sm mt-1">{errors.equipeInstituicao?.[index]?.endereco?.message}</p></div>
                                           <div><Label><RequiredField>N° de Registro</RequiredField></Label><Input {...register(`equipeInstituicao.${index}.registro`)} /><p className="text-red-500 text-sm mt-1">{errors.equipeInstituicao?.[index]?.registro?.message}</p></div>
                                       </div>
                                       <div className="flex justify-end mt-2">
                                           <Button type="button" variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => removeEquipe(index)}><Trash2 className="h-4 w-4 mr-1.5" /> Remover</Button>
                                       </div>
                                   </div>
                                )}
                            </div>
                        ))}
                        {errors.equipeInstituicao?.message && <p className="text-red-500 text-sm mt-1">{errors.equipeInstituicao.message}</p>}
                    </div>
                    {/* Fim das seções do formulário */}

                    <div className="flex justify-end pt-6">
                        {/* 3. BOTÃO DE SUBMISSÃO SUBSTITUÍDO */}
                        <Button
                            type="submit"
                            className="bg-[#90EE90] hover:bg-[#7CCD7C] text-white font-bold px-8 py-3 text-lg h-auto rounded-md"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <div className="flex items-center gap-2">
                                    <LoadingSpinner /> Salvando...
                                </div>
                            ) : (
                                'Salvar Informações'
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FormularioInstituicao;