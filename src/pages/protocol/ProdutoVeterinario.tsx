import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

// --- Schema de Validação e Tipos ---

// Schema para um único produto veterinário
const produtoSchema = yup.object().shape({
    identificacao: yup.string().required("A Identificação/Código é obrigatória."),
    principioAtivo: yup.string().required("O Princípio Ativo é obrigatório."),
    concentracao: yup.string().required("A Concentração é obrigatória."),
    apresentacoes: yup.string().required("A Apresentação é obrigatória."),
    lote: yup.string().required("A Partida/lote é obrigatória."),
    dataFabricacao: yup.string().required("A Data de Fabricação é obrigatória."),
    dataValidade: yup.string().required("A Data de Validade é obrigatória."),
    fabricante: yup.string().required("O Fabricante é obrigatório."),
    dosagem: yup.string().required("A Dosagem indicada é obrigatória."),
    viaAdministracao: yup.string().required("A Via de administração é obrigatória."),
    expanded: yup.boolean(), // Para controlar o estado de expandido/recolhido
});

// Schema principal do formulário
const validationSchema = yup.object({
    produtos: yup
        .array()
        .of(produtoSchema)
        .min(1, "É necessário adicionar pelo menos um produto.")
        .required(),
});

// Inferindo o tipo dos valores do formulário a partir do schema
type FormValues = yup.InferType<typeof validationSchema>;

const newEmptyProduct = {
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
    expanded: true,
};


// --- COMPONENTE PRINCIPAL ---

const ProdutoVeterinario = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const { register, control, handleSubmit, formState: { errors }, watch, setValue } = useForm<FormValues>({
        resolver: yupResolver(validationSchema),
        defaultValues: {
            produtos: [newEmptyProduct], // Começa com um produto na lista
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "produtos",
    });

    const handleSalvar = async (data: FormValues) => {
        setIsSubmitting(true);
        console.log("Dados Finais (Produtos Veterinários):", data);

        try {
            const existingDataString = localStorage.getItem('dadosProdutoVeterinario');
            const existingData = existingDataString ? JSON.parse(existingDataString) : [];
            existingData.push(data);
            localStorage.setItem('dadosProdutoVeterinario', JSON.stringify(existingData));
            console.log("Dados salvos no localStorage com a chave 'dadosProdutoVeterinario'.");
        } catch (error) {
            console.error("Erro ao salvar os dados no localStorage:", error);
        }

        // Simula uma chamada de API
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setIsSubmitting(false);
        navigate('/capa/00-0001-25');
    };

    const toggleItem = (index: number) => {
        const currentPath = `produtos.${index}.expanded` as const;
        setValue(currentPath, !watch(currentPath));
    };

    return (
        <div className="min-h-screen flex flex-col items-center py-8 px-4 bg-gray-50 font-inter">
            <h1 className="text-4xl font-bold mb-8">VERITA AUDIT</h1>
            <div className="w-full max-w-4xl rounded-lg p-8 bg-white shadow-md">
                <h2 className="text-2xl font-semibold text-center mb-6">Produto Veterinário Investigacional</h2>

                <form onSubmit={handleSubmit(handleSalvar)} className="space-y-6">
                    <div className="flex justify-between items-center border-b pb-4">
                        <h3 className="text-lg font-semibold">Produtos</h3>
                        <Button
                            type="button"
                            variant="outline"
                            className="bg-[#90EE90] hover:bg-[#7CCD7C] text-white font-bold"
                            onClick={() => append(newEmptyProduct)}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Adicionar Produto
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {fields.map((item, index) => (
                            <div key={item.id} className="border rounded-lg p-4 shadow-sm bg-white">
                                <div className="flex justify-between items-center cursor-pointer hover:bg-gray-50 p-2 -m-2 rounded" onClick={() => toggleItem(index)}>
                                    <h4 className="font-medium text-gray-800">
                                        {watch(`produtos.${index}.identificacao`) || "Novo Produto"}
                                    </h4>
                                    {watch(`produtos.${index}.expanded`) ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
                                </div>

                                {watch(`produtos.${index}.expanded`) && (
                                    <div className="mt-4 space-y-4 pt-4 border-t">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {/* Identificação/Código */}
                                            <div className="lg:col-span-2">
                                                <Label>Identificação/Código <span className="text-red-500">*</span></Label>
                                                <Input {...register(`produtos.${index}.identificacao`)} />
                                                <p className="text-red-500 text-sm mt-1">{errors.produtos?.[index]?.identificacao?.message}</p>
                                            </div>
                                            {/* Princípio Ativo */}
                                            <div className="lg:col-span-1">
                                                <Label>Princípio Ativo <span className="text-red-500">*</span></Label>
                                                <Input {...register(`produtos.${index}.principioAtivo`)} />
                                                <p className="text-red-500 text-sm mt-1">{errors.produtos?.[index]?.principioAtivo?.message}</p>
                                            </div>
                                            {/* Concentração */}
                                            <div>
                                                <Label>Concentração <span className="text-red-500">*</span></Label>
                                                <Input {...register(`produtos.${index}.concentracao`)} />
                                                <p className="text-red-500 text-sm mt-1">{errors.produtos?.[index]?.concentracao?.message}</p>
                                            </div>
                                            {/* Partida/lote */}
                                            <div>
                                                <Label>Partida/lote <span className="text-red-500">*</span></Label>
                                                <Input {...register(`produtos.${index}.lote`)} />
                                                <p className="text-red-500 text-sm mt-1">{errors.produtos?.[index]?.lote?.message}</p>
                                            </div>
                                             {/* Fabricante */}
                                             <div>
                                                <Label>Fabricante <span className="text-red-500">*</span></Label>
                                                <Input {...register(`produtos.${index}.fabricante`)} />
                                                <p className="text-red-500 text-sm mt-1">{errors.produtos?.[index]?.fabricante?.message}</p>
                                            </div>
                                            {/* Data de Fabricação */}
                                            <div>
                                                <Label>Data de Fabricação <span className="text-red-500">*</span></Label>
                                                <Input type="date" {...register(`produtos.${index}.dataFabricacao`)} />
                                                <p className="text-red-500 text-sm mt-1">{errors.produtos?.[index]?.dataFabricacao?.message}</p>
                                            </div>
                                            {/* Data de Validade */}
                                            <div>
                                                <Label>Data de Validade <span className="text-red-500">*</span></Label>
                                                <Input type="date" {...register(`produtos.${index}.dataValidade`)} />
                                                <p className="text-red-500 text-sm mt-1">{errors.produtos?.[index]?.dataValidade?.message}</p>
                                            </div>
                                            {/* Via de administração */}
                                            <div>
                                                <Label>Via de administração <span className="text-red-500">*</span></Label>
                                                <Input {...register(`produtos.${index}.viaAdministracao`)} />
                                                <p className="text-red-500 text-sm mt-1">{errors.produtos?.[index]?.viaAdministracao?.message}</p>
                                            </div>
                                            {/* Apresentações */}
                                            <div className="lg:col-span-3">
                                                <Label>Apresentações <span className="text-red-500">*</span></Label>
                                                <Textarea {...register(`produtos.${index}.apresentacoes`)} />
                                                <p className="text-red-500 text-sm mt-1">{errors.produtos?.[index]?.apresentacoes?.message}</p>
                                            </div>
                                             {/* Dosagem indicada */}
                                            <div className="lg:col-span-3">
                                                <Label>Dosagem indicada <span className="text-red-500">*</span></Label>
                                                <Textarea {...register(`produtos.${index}.dosagem`)} />
                                                <p className="text-red-500 text-sm mt-1">{errors.produtos?.[index]?.dosagem?.message}</p>
                                            </div>
                                        </div>
                                        <div className="flex justify-end mt-2">
                                            {fields.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-500 hover:text-red-700"
                                                    onClick={() => remove(index)}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-1.5" />
                                                    Remover Produto
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                        {errors.produtos && !Array.isArray(errors.produtos) && <p className="text-red-500 text-sm mt-1">{errors.produtos.message}</p>}
                    </div>

                    {/* --- BOTÕES DE AÇÃO --- */}
                    <div className="flex justify-end items-center gap-4 pt-6 border-t">
                        <Button type="submit" className="bg-[#90EE90] hover:bg-[#7CCD7C] text-white font-bold px-8 py-3 text-lg h-auto rounded-md" disabled={isSubmitting}>
                            {isSubmitting ? 'Salvando...' : 'Salvar e Finalizar Protocolo'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProdutoVeterinario;
