import { useForm, useFieldArray, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Info, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

// --- Esquema de Validação ---
const caracteristicasGeraisSchema = yup.object({
    especie: yup.string().required("Obrigatório"),
    raca: yup.string().required("Obrigatório"),
    sexo: yup.string().required("Obrigatório"),
    idade: yup.string().required("Obrigatório"),
    peso: yup.string().required("Obrigatório"),
    identificacao: yup.string().required("Obrigatório"),
});

const outrasAvaliacoesSchema = yup.object({
    nome: yup.string().required("O nome da avaliação é obrigatório"),
    descricao: yup.string().required("A descrição é obrigatória"),
});

const pviSchema = yup.object().shape({
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
});

const validationSchema = yup.object({
    // 5.1
    animais: yup.object({
        origemDestino: yup.string().required("Origem e Destino é obrigatório."),
        caracteristicasGerais: yup.array().of(caracteristicasGeraisSchema).min(1, "Adicione pelo menos uma linha na tabela."),
        justificativaN: yup.string().required("A justificativa do 'n' amostral é obrigatória."),
    }),
    // 5.2
    manejoAlojamento: yup.object({
        instalacaoManejo: yup.string().required("Instalação e Manejo é obrigatório."),
        alimentacaoAgua: yup.string().required("Alimentação e Água é obrigatório."),
    }),
    // 5.3
    criterios: yup.object({
        inclusao: yup.string().required("Critérios de Inclusão são obrigatórios."),
        exclusao: yup.string().required("Critérios de Exclusão são obrigatórios."),
        remocao: yup.string().required("Critérios de Remoção são obrigatórios."),
    }),
    // 5.4
    avaliacaoClinica: yup.object({
        exameFisico: yup.string().required("Exame Físico é obrigatório."),
        exameLaboratorial: yup.string().required("Exame Laboratorial é obrigatório."),
        outrasAvaliacoes: yup.array().of(outrasAvaliacoesSchema),
    }),
    // 5.5 a 5.8
    aclimatacao: yup.string().required("Aclimatação/Quarentena é obrigatório."),
    selecao: yup.string().required("Seleção é obrigatório."),
    randomizacao: yup.string().required("Randomização é obrigatório."),
    cegamento: yup.string().required("Cegamento é obrigatório."),
    // 5.9
    tratamento: yup.object({
        descricao: yup.string().required("A descrição do tratamento é obrigatória."),
        pvi: pviSchema.required("Os dados do PVI são obrigatórios"),
    }),
    // 5.10
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


const FormularioMaterialMetodo = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, handleSubmit, formState: { errors }, reset, control, setValue } = useForm<FormValues>({
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

    useEffect(() => {
        // Carregar dados do PVI do localStorage e popular o formulário
        try {
            const produtosData = JSON.parse(localStorage.getItem("dadosProdutoVeterinario") || "null");
            if (produtosData && produtosData.produtos && produtosData.produtos.length > 0) {
                // Popula os campos do PVI com os dados encontrados
                setValue('tratamento.pvi', produtosData.produtos[0]);
            }
        } catch (e) {
            console.error("Erro ao carregar dados do PVI:", e);
        }

        // Carregar dados salvos deste formulário (sobrescreve se houver)
        const savedData = JSON.parse(localStorage.getItem("dadosMaterialMetodo") || "null");
        if (savedData) {
            reset(savedData);
        }
    }, [reset, setValue]);

    const onSubmit = async (data: FormValues) => {
        setIsSubmitting(true);
        console.log(data);
        try {
            localStorage.setItem("dadosMaterialMetodo", JSON.stringify(data));
        } catch (error) {
            console.error("Erro ao salvar os dados:", error);
        }

        await new Promise((resolve) => setTimeout(resolve, 500));
        setIsSubmitting(false);
        navigate("/estatistica");
    };

    return (
        <div className="min-h-screen bg-gray-100 font-sans p-4 sm:p-6 lg:p-8">
            <header className="max-w-5xl mx-auto mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 text-center">VERITA AUDIT</h1>
            </header>
            <div className="w-full max-w-5xl mx-auto rounded-xl p-6 md:p-10 bg-white shadow-lg">
                <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-gray-900">5. Material e Métodos</h2>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
                    
                    {/* 5.1 Animais */}
                    <section>
                        <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">5.1. Animais</h3>
                        <div className="space-y-6">
                            <div>
                                <Label htmlFor="animais.origemDestino" className="font-semibold text-gray-700">5.1.1 Origem e Destino</Label>
                                <Textarea id="animais.origemDestino" {...register("animais.origemDestino")} className="min-h-[100px] mt-2" />
                                <p className="text-red-500 text-sm mt-1">{errors.animais?.origemDestino?.message}</p>
                            </div>
                            <div>
                                <Label className="font-semibold text-gray-700">5.1.2 Característica Gerais</Label>
                                <div className="mt-2 border rounded-lg overflow-hidden">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-gray-50">
                                                <TableHead>Espécie</TableHead>
                                                <TableHead>Raça</TableHead>
                                                <TableHead>Sexo</TableHead>
                                                <TableHead>Idade</TableHead>
                                                <TableHead>Peso</TableHead>
                                                <TableHead>Identificação</TableHead>
                                                <TableHead></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {caracteristicasFields.map((field, index) => (
                                                <TableRow key={field.id}>
                                                    <TableCell><Input {...register(`animais.caracteristicasGerais.${index}.especie`)} /></TableCell>
                                                    <TableCell><Input {...register(`animais.caracteristicasGerais.${index}.raca`)} /></TableCell>
                                                    <TableCell><Input {...register(`animais.caracteristicasGerais.${index}.sexo`)} /></TableCell>
                                                    <TableCell><Input {...register(`animais.caracteristicasGerais.${index}.idade`)} /></TableCell>
                                                    <TableCell><Input {...register(`animais.caracteristicasGerais.${index}.peso`)} /></TableCell>
                                                    <TableCell><Input {...register(`animais.caracteristicasGerais.${index}.identificacao`)} /></TableCell>
                                                    <TableCell>
                                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeCaracteristica(index)} className="text-red-500 hover:text-red-700">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                                <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => appendCaracteristica({ especie: '', raca: '', sexo: '', idade: '', peso: '', identificacao: '' })}>
                                    <Plus className="h-4 w-4 mr-2" /> Adicionar Linha
                                </Button>
                                <p className="text-red-500 text-sm mt-1">{errors.animais?.caracteristicasGerais?.message}</p>
                            </div>
                            <div>
                                <Label htmlFor="animais.justificativaN" className="font-semibold text-gray-700">5.1.3 Justificativa do "n" amostral</Label>
                                <Textarea id="animais.justificativaN" {...register("animais.justificativaN")} className="min-h-[100px] mt-2" />
                                <p className="text-red-500 text-sm mt-1">{errors.animais?.justificativaN?.message}</p>
                            </div>
                        </div>
                    </section>
                    
                    {/* 5.2 Manejo e Alojamento */}
                    <section>
                        <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">5.2. Manejo e Alojamento</h3>
                        <div className="space-y-6">
                            <div>
                                <Label htmlFor="manejoAlojamento.instalacaoManejo" className="font-semibold text-gray-700">5.2.1 Instalação e Manejo</Label>
                                <Textarea id="manejoAlojamento.instalacaoManejo" {...register("manejoAlojamento.instalacaoManejo")} className="min-h-[100px] mt-2" />
                                <p className="text-red-500 text-sm mt-1">{errors.manejoAlojamento?.instalacaoManejo?.message}</p>
                            </div>
                             <div>
                                <Label htmlFor="manejoAlojamento.alimentacaoAgua" className="font-semibold text-gray-700">5.2.2 Alimentação e Água</Label>
                                <Textarea id="manejoAlojamento.alimentacaoAgua" {...register("manejoAlojamento.alimentacaoAgua")} className="min-h-[100px] mt-2" />
                                <p className="text-red-500 text-sm mt-1">{errors.manejoAlojamento?.alimentacaoAgua?.message}</p>
                            </div>
                        </div>
                    </section>

                    {/* 5.3 Critérios */}
                    <section>
                        <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">5.3. Critérios de Inclusão, exclusão e remoção dos animais</h3>
                        <div className="space-y-6">
                            <div>
                                <Label htmlFor="criterios.inclusao" className="font-semibold text-gray-700">5.3.1 Critérios de Inclusão</Label>
                                <Textarea id="criterios.inclusao" {...register("criterios.inclusao")} className="min-h-[100px] mt-2" />
                                <p className="text-red-500 text-sm mt-1">{errors.criterios?.inclusao?.message}</p>
                            </div>
                             <div>
                                <Label htmlFor="criterios.exclusao" className="font-semibold text-gray-700">5.3.2 Critérios de Exclusão</Label>
                                <Textarea id="criterios.exclusao" {...register("criterios.exclusao")} className="min-h-[100px] mt-2" />
                                <p className="text-red-500 text-sm mt-1">{errors.criterios?.exclusao?.message}</p>
                            </div>
                             <div>
                                <Label htmlFor="criterios.remocao" className="font-semibold text-gray-700">5.3.3 Remoção de Animais após estudo</Label>
                                <Textarea id="criterios.remocao" {...register("criterios.remocao")} className="min-h-[100px] mt-2" />
                                <p className="text-red-500 text-sm mt-1">{errors.criterios?.remocao?.message}</p>
                            </div>
                        </div>
                    </section>

                    {/* 5.4 Avaliação Clínica */}
                    <section>
                        <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">5.4. Avaliação Clínica para Seleção</h3>
                        <div className="space-y-6">
                            <div>
                                <Label htmlFor="avaliacaoClinica.exameFisico" className="font-semibold text-gray-700">5.4.1 Exame Físico</Label>
                                <Textarea id="avaliacaoClinica.exameFisico" {...register("avaliacaoClinica.exameFisico")} className="min-h-[100px] mt-2" />
                                <p className="text-red-500 text-sm mt-1">{errors.avaliacaoClinica?.exameFisico?.message}</p>
                            </div>
                            <div>
                                <Label htmlFor="avaliacaoClinica.exameLaboratorial" className="font-semibold text-gray-700">5.4.2 Exame Laboratorial</Label>
                                <Textarea id="avaliacaoClinica.exameLaboratorial" {...register("avaliacaoClinica.exameLaboratorial")} className="min-h-[100px] mt-2" />
                                <p className="text-red-500 text-sm mt-1">{errors.avaliacaoClinica?.exameLaboratorial?.message}</p>
                            </div>
                            <div>
                                <Label className="font-semibold text-gray-700">Outras Avaliações</Label>
                                <div className="space-y-4 mt-2">
                                    {outrasAvaliacoesFields.map((field, index) => (
                                        <div key={field.id} className="p-4 border rounded-md bg-gray-50 flex gap-4 items-start">
                                            <div className="flex-grow space-y-2">
                                                <Input placeholder="Nome da Avaliação" {...register(`avaliacaoClinica.outrasAvaliacoes.${index}.nome`)} />
                                                <Textarea placeholder="Descrição da Avaliação" {...register(`avaliacaoClinica.outrasAvaliacoes.${index}.descricao`)} />
                                            </div>
                                            <Button type="button" variant="ghost" size="icon" onClick={() => removeOutraAvaliacao(index)} className="text-red-500 hover:text-red-700 mt-1">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                                <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => appendOutraAvaliacao({ nome: '', descricao: '' })}>
                                    <Plus className="h-4 w-4 mr-2" /> Adicionar Avaliação
                                </Button>
                            </div>
                        </div>
                    </section>

                    {/* 5.5 a 5.8 */}
                    <section className="space-y-6">
                        <div>
                            <Label htmlFor="aclimatacao" className="text-xl font-bold text-gray-800 border-b pb-2 block mb-4">5.5. Aclimatação/Quarentena</Label>
                            <Textarea id="aclimatacao" {...register("aclimatacao")} className="min-h-[100px]" />
                            <p className="text-red-500 text-sm mt-1">{errors.aclimatacao?.message}</p>
                        </div>
                        <div>
                            <Label htmlFor="selecao" className="text-xl font-bold text-gray-800 border-b pb-2 block mb-4">5.6. Seleção</Label>
                            <Textarea id="selecao" {...register("selecao")} className="min-h-[100px]" />
                            <p className="text-red-500 text-sm mt-1">{errors.selecao?.message}</p>
                        </div>
                        <div>
                            <Label htmlFor="randomizacao" className="text-xl font-bold text-gray-800 border-b pb-2 block mb-4">5.7. Randomização</Label>
                            <Textarea id="randomizacao" {...register("randomizacao")} className="min-h-[100px]" />
                            <p className="text-red-500 text-sm mt-1">{errors.randomizacao?.message}</p>
                        </div>
                        <div>
                            <Label htmlFor="cegamento" className="text-xl font-bold text-gray-800 border-b pb-2 block mb-4">5.8. Cegamento</Label>
                            <Textarea id="cegamento" {...register("cegamento")} className="min-h-[100px]" />
                            <p className="text-red-500 text-sm mt-1">{errors.cegamento?.message}</p>
                        </div>
                    </section>
                    
                    {/* 5.9 Tratamento */}
                    <section>
                         <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">5.9. Tratamento</h3>
                         <div className="space-y-6">
                            <div>
                                <Label htmlFor="tratamento.descricao" className="font-semibold text-gray-700">Descrição</Label>
                                <Textarea id="tratamento.descricao" {...register("tratamento.descricao")} className="min-h-[100px] mt-2" />
                                <p className="text-red-500 text-sm mt-1">{errors.tratamento?.descricao?.message}</p>
                            </div>
                            
                            <div>
                                <h4 className="font-semibold text-gray-700">Produto Veterinário Investigacional (PVI)</h4>
                                <div className="p-4 border rounded-md bg-gray-50 mt-2">
                                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div className="lg:col-span-2"><Label>Identificação/Código</Label><Input {...register(`tratamento.pvi.identificacao`)} /></div>
                                        <div className="lg:col-span-1"><Label>Princípio Ativo</Label><Input {...register(`tratamento.pvi.principioAtivo`)} /></div>
                                        <div><Label>Concentração</Label><Input {...register(`tratamento.pvi.concentracao`)} /></div>
                                        <div><Label>Partida/lote</Label><Input {...register(`tratamento.pvi.lote`)} /></div>
                                        <div><Label>Fabricante</Label><Input {...register(`tratamento.pvi.fabricante`)} /></div>
                                        <div><Label>Data de Fabricação</Label><Input type="date" {...register(`tratamento.pvi.dataFabricacao`)} /></div>
                                        <div><Label>Data de Validade</Label><Input type="date" {...register(`tratamento.pvi.dataValidade`)} /></div>
                                        <div><Label>Via de administração</Label><Input {...register(`tratamento.pvi.viaAdministracao`)} /></div>
                                        <div className="lg:col-span-3"><Label>Apresentações</Label><Textarea {...register(`tratamento.pvi.apresentacoes`)} /></div>
                                        <div className="lg:col-span-3"><Label>Dosagem indicada</Label><Textarea {...register(`tratamento.pvi.dosagem`)} /></div>
                                    </div>
                                </div>
                            </div>
                         </div>
                    </section>

                    {/* 5.10 Parâmetros de Avaliação */}
                    <section>
                        <Label htmlFor="parametrosAvaliacao" className="text-xl font-bold text-gray-800 border-b pb-2 block mb-4">5.10. Parâmetros de Avaliação</Label>
                        <Textarea id="parametrosAvaliacao" {...register("parametrosAvaliacao")} className="min-h-[150px]" />
                        <p className="text-red-500 text-sm mt-1">{errors.parametrosAvaliacao?.message}</p>
                    </section>

                    <div className="flex justify-end pt-6 border-t">
                        <Button
                            type="submit"
                            className="bg-green-600 hover:bg-green-700 text-white font-bold px-10 py-3 text-lg h-auto rounded-lg shadow-md hover:shadow-lg transition-all"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (<div className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Salvando...</div>) : "Salvar e Avançar"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FormularioMaterialMetodo;
