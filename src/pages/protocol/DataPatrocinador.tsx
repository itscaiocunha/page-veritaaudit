import { useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { useNavigate } from 'react-router-dom';
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, ChevronDown, ChevronUp } from "lucide-react";

// --- Schema de Validação ---
const phoneRegExp = /^\(\d{2}\) \d{5}-\d{4}$/;

const pessoaSchema = yup.object().shape({
    id: yup.number(),
    nome: yup.string().required("O nome é obrigatório."),
    formacao: yup.string().required("A formação é obrigatória."),
    // O campo 'cargo' não precisa de validação 'required' aqui se for opcional
    cargo: yup.string(), 
    endereco: yup.string().required("O endereço é obrigatório."),
    telefone: yup.string().matches(phoneRegExp, "Telefone inválido. Use (XX) XXXXX-XXXX").required("O telefone é obrigatório."),
    email: yup.string().email("Digite um e-mail válido.").required("O e-mail é obrigatório."),
    registro: yup.string().required("O N° de registro é obrigatório."),
    expanded: yup.boolean()
});

const validationSchema = yup.object().shape({
  patrocinador: yup.object().shape({
    nome: yup.string().required("O nome do patrocinador é obrigatório."),
    endereco: yup.string().required("O endereço é obrigatório."),
    telefone: yup.string().matches(phoneRegExp, "Telefone inválido. Use (XX) XXXXX-XXXX").required("O telefone é obrigatório."),
  }),
  // CORREÇÃO: Aplicando o schema 'pessoaSchema' ao representante.
  // O campo 'cargo' no representante é opcional no schema, mas o 'formacao' não. Ajustei o schema para refletir isso.
  representante: pessoaSchema,
  monitores: yup.array().of(pessoaSchema).min(1, "É necessário adicionar pelo menos um monitor."),
  equipe: yup.array().of(pessoaSchema).min(1, "É necessário adicionar pelo menos um membro à equipe."),
});

// --- Componentes e Funções Auxiliares ---
const RequiredField = ({ children }: { children: React.ReactNode }) => ( <>{children} <span className="text-red-500 font-bold">*</span></> );
const applyPhoneMask = (value: string) => { 
    if (!value) return ""; 
    value = value.replace(/\D/g, ""); 
    value = value.replace(/^(\d{2})(\d)/g, "($1) $2"); 
    value = value.replace(/(\d)(\d{4})$/, "$1-$2"); 
    return value; 
};
const LoadingSpinner = () => ( <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" /> );

// --- COMPONENTE PRINCIPAL ---
const FormularioParticipantes = () => {
    
    // --- HOOKS e ESTADOS ---
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [expandedSections, setExpandedSections] = useState({
        patrocinador: true,
        representante: true,
    });
    
    const { 
        register, 
        control, 
        handleSubmit, 
        formState: { errors }, 
        setValue, 
        watch 
    } = useForm({
        resolver: yupResolver(validationSchema),
        defaultValues: {
            patrocinador: { nome: "", endereco: "", telefone: ""},
            // Incluído 'formacao' que estava faltando e é obrigatório pelo schema.
            representante: { nome: "", formacao: "", cargo: "", endereco: "", telefone: "", email: "", registro: "" },
            monitores: [{ id: 1, nome: "", formacao: "", registro: "", endereco: "", telefone: "", email: "", expanded: true }],
            equipe: [{ id: 1, nome: "", formacao: "", registro: "", endereco: "", telefone: "", email: "", expanded: true }],
        }
    });

    const { fields: monitoresFields, append: appendMonitor, remove: removeMonitor } = useFieldArray({
        control,
        name: "monitores",
    });

    const { fields: equipeFields, append: appendEquipe, remove: removeEquipe } = useFieldArray({
        control,
        name: "equipe",
    });

    // --- FUNÇÕES ---

    // CORREÇÃO: Lógica de navegação movida para dentro do onSubmit
    const onSubmit = async (data: any) => {
        setIsSubmitting(true);
        console.log("Dados Validados:", data);
        
        // Simula o tempo de espera de uma chamada de API
        await new Promise(resolve => setTimeout(resolve, 1500)); 
        
        // Lógica a ser executada APÓS o sucesso do envio
        setIsSubmitting(false);
        
        // Navega para a próxima página
        navigate('/instituicao-cadastro');
    };

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections(prev => ({...prev, [section]: !prev[section]}));
    };

    const toggleArrayItem = (fieldName: 'monitores' | 'equipe', index: number) => {
        const currentExpandedState = watch(`${fieldName}.${index}.expanded`);
        setValue(`${fieldName}.${index}.expanded`, !currentExpandedState, { shouldValidate: false }); // Evita revalidação desnecessária
    };

    // --- RENDERIZAÇÃO ---
    return (
        <div className="min-h-screen flex flex-col items-center py-8 px-4 bg-gray-50 font-inter">
            <h1 className="text-4xl font-bold mb-8">VERITA AUDIT</h1>
            <div className="w-full max-w-4xl rounded-lg p-8 bg-white shadow-md">
                <h2 className="text-2xl font-semibold text-center mb-6">Informações do Patrocinador</h2>
                
                {/* O 'handleSubmit' do react-hook-form cuida da validação antes de chamar 'onSubmit' */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    
                    {/* Seção Patrocinador */}
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
                                <div><Label><RequiredField>Endereço</RequiredField></Label><Input {...register("patrocinador.endereco")} /><p className="text-red-500 text-sm mt-1">{errors.patrocinador?.endereco?.message}</p></div>
                            </div>
                        )}
                    </div>

                    {/* Seção Representante do Patrocinador */}
                    <div className="border rounded-lg p-4 shadow-sm bg-white">
                         <div className="flex justify-between items-center cursor-pointer hover:bg-gray-50 p-2 -m-2 rounded" onClick={() => toggleSection('representante')}>
                            <h3 className="text-lg font-semibold text-gray-800">Representante do Patrocinador</h3>
                            {expandedSections.representante ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
                        </div>
                        {expandedSections.representante && (
                            <div className="mt-4 space-y-4 pt-4 border-t">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div><Label><RequiredField>Identificação/Nome</RequiredField></Label><Input {...register("representante.nome")} /><p className="text-red-500 text-sm mt-1">{errors.representante?.nome?.message}</p></div>
                                    {/* Adicionado o campo 'Formação' que é obrigatório */}
                                    <div><Label><RequiredField>Formação</RequiredField></Label><Input {...register("representante.formacao")} /><p className="text-red-500 text-sm mt-1">{errors.representante?.formacao?.message}</p></div>
                                    {/* Alterado label para refletir que este campo é opcional */}
                                    <div><Label>Cargo (Opcional)</Label><Input {...register("representante.cargo")} /><p className="text-red-500 text-sm mt-1">{errors.representante?.cargo?.message}</p></div>
                                    <div><Label><RequiredField>Telefone</RequiredField></Label><Controller name="representante.telefone" control={control} render={({ field }) => ( <Input {...field} onChange={(e) => field.onChange(applyPhoneMask(e.target.value))} type="tel" maxLength={15} /> )}/><p className="text-red-500 text-sm mt-1">{errors.representante?.telefone?.message}</p></div>
                                    <div><Label><RequiredField>E-mail</RequiredField></Label><Input {...register("representante.email")} /><p className="text-red-500 text-sm mt-1">{errors.representante?.email?.message}</p></div>
                                    <div className="md:col-span-2"><Label><RequiredField>Endereço</RequiredField></Label><Input {...register("representante.endereco")} /><p className="text-red-500 text-sm mt-1">{errors.representante?.endereco?.message}</p></div>
                                    <div><Label><RequiredField>N° de Registro</RequiredField></Label><Input {...register("representante.registro")} /><p className="text-red-500 text-sm mt-1">{errors.representante?.registro?.message}</p></div>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* Seção Monitores */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-lg font-semibold"><RequiredField>Monitor(es)</RequiredField></label>
                            <Button type="button" variant="outline" className="bg-[#90EE90] hover:bg-[#7CCD7C] text-white font-bold" onClick={() => appendMonitor({ id: Date.now(), nome: "", formacao: "", registro: "", endereco: "", telefone: "", email: "", expanded: true })}><Plus className="h-4 w-4 mr-2" /> Adicionar Monitor</Button>
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
                                            <div className="md:col-span-2"><Label><RequiredField>Endereço</RequiredField></Label><Input {...register(`monitores.${index}.endereco`)} /><p className="text-red-500 text-sm mt-1">{errors.monitores?.[index]?.endereco?.message}</p></div>
                                            <div><Label><RequiredField>N° de Registro</RequiredField></Label><Input {...register(`monitores.${index}.registro`)} /><p className="text-red-500 text-sm mt-1">{errors.monitores?.[index]?.registro?.message}</p></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                        {errors.monitores?.root?.message && <p className="text-red-500 text-sm mt-1">{errors.monitores.root.message}</p>}
                    </div>

                    {/* Seção Equipe Técnica */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-lg font-semibold"><RequiredField>Equipe Técnica</RequiredField></label>
                            <Button type="button" variant="outline" className="bg-[#90EE90] hover:bg-[#7CCD7C] text-white font-bold" onClick={() => appendEquipe({ id: Date.now(), nome: "", formacao: "", registro: "", endereco: "", telefone: "", email: "", expanded: true })}><Plus className="h-4 w-4 mr-2" /> Adicionar Membro</Button>
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
                                           <div className="md:col-span-2"><Label><RequiredField>Endereço</RequiredField></Label><Input {...register(`equipe.${index}.endereco`)} /><p className="text-red-500 text-sm mt-1">{errors.equipe?.[index]?.endereco?.message}</p></div>
                                           <div><Label><RequiredField>N° de Registro</RequiredField></Label><Input {...register(`equipe.${index}.registro`)} /><p className="text-red-500 text-sm mt-1">{errors.equipe?.[index]?.registro?.message}</p></div>
                                       </div>
                                   </div>
                                )}
                            </div>
                        ))}
                        {errors.equipe?.root?.message && <p className="text-red-500 text-sm mt-1">{errors.equipe.root.message}</p>}
                    </div>

                    {/* Botão de Submissão */}
                    <div className="flex justify-end pt-6">
                        <Button
                            // CORREÇÃO: Removido o onClick daqui
                            type="submit"
                            className="bg-[#90EE90] hover:bg-[#7CCD7C] text-white font-bold px-8 py-3 text-lg h-auto rounded-md"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <div className="flex items-center gap-2">
                                    <LoadingSpinner /> Salvando...
                                </div>
                            ) : (
                                // Texto alterado para refletir a ação completa
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