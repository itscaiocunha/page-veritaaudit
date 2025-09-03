import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";

// --- Esquema de Validação para o Gerador ---
const authorSchema = yup.object({
  nome: yup.string().required("Obrigatório"),
  sobrenome: yup.string().required("Obrigatório"),
});

const generatorSchema = yup.object({
  autores: yup.array().of(authorSchema).min(1, "Adicione pelo menos um autor."),
  tituloArtigo: yup.string().required("O título do artigo é obrigatório."),
  tituloPublicacao: yup.string().required("O título do site/publicação é obrigatório."),
  local: yup.string().required("O local (cidade) é obrigatório."),
  editora: yup.string().required("A editora/instituição é obrigatória."),
  ano: yup.number().typeError("O ano deve ser um número.").required("O ano é obrigatório.").integer("O ano deve ser um número inteiro.").min(1000, "Ano inválido.").max(new Date().getFullYear(), "O ano não pode ser no futuro."),
  doi: yup.string(), // Opcional
  url: yup.string().url("Insira uma URL válida.").required("A URL é obrigatória."),
  dataAcesso: yup.string().required("A data de acesso é obrigatória."),
});


// --- Esquema de Validação para o Formulário Principal ---
const mainFormSchema = yup.object({
  conteudoBibliografia: yup.string().required("A bibliografia não pode estar vazia. Adicione pelo menos uma referência."),
});

type MainFovalues = yup.InferType<typeof mainFormSchema>;
type GeneratorFormValues = yup.InferType<typeof generatorSchema>;

// --- Componente para Renderizar a Referência com Negrito ---
const ReferenceDisplay = ({ text, onRemove }) => {
    const parts = text.split('**');
    return (
        <div className="flex justify-between items-start p-3 bg-gray-50 rounded-md">
            <p className="text-gray-700 text-sm flex-1">
                {parts.map((part, index) =>
                    index % 2 === 1 ? <strong key={index}>{part}</strong> : part
                )}
            </p>
            <Button type="button" variant="ghost" size="icon" onClick={onRemove} className="text-red-500 hover:text-red-700 ml-4">
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
    );
};


const FormularioBibliografia = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [referencias, setReferencias] = useState<string[]>([]);

  // --- Hook Form para o formulário principal ---
  const { register: registerMain, handleSubmit: handleSubmitMain, formState: { errors: errorsMain }, reset: resetMain, setValue } = useForm<MainFovalues>({
    resolver: yupResolver(mainFormSchema),
  });

  // --- Hook Form para o gerador de referências ---
  const {
      register: registerGenerator,
      control: controlGenerator,
      handleSubmit: handleSubmitGenerator,
      reset: resetGenerator,
      formState: { errors: errorsGenerator }
  } = useForm<GeneratorFormValues>({
      resolver: yupResolver(generatorSchema),
      defaultValues: {
          autores: [{ nome: '', sobrenome: '' }],
          tituloArtigo: '',
          tituloPublicacao: '',
          local: '',
          editora: '',
          ano: undefined,
          doi: '',
          url: '',
          dataAcesso: '',
      }
  });

  const { fields, append, remove } = useFieldArray({
      control: controlGenerator,
      name: "autores"
  });

  // Carrega dados do localStorage ao iniciar
  useEffect(() => {
    try {
        const savedDataJSON = localStorage.getItem("dadosBibliografia");
        if (savedDataJSON) {
            const savedData = JSON.parse(savedDataJSON);
            if (savedData && savedData.conteudoBibliografia) {
                const refs = savedData.conteudoBibliografia.split('\n\n').filter(r => r);
                setReferencias(refs);
            }
        }
    } catch (error) {
        console.error("Erro ao carregar ou processar dados da bibliografia do localStorage:", error);
    }
  }, []);

  // Atualiza o campo principal quando a lista de referências muda
  useEffect(() => {
    const fullText = referencias.join('\n\n');
    setValue('conteudoBibliografia', fullText, { shouldValidate: true });
  }, [referencias, setValue]);


  const formatarABNT = (data: GeneratorFormValues): string => {
    const autoresFormatados = data.autores.map(a => `${a.sobrenome.toUpperCase()}, ${a.nome}`).join('; ');
    
    // Processamento de data seguro contra fuso horário
    const [anoAcesso, mesAcesso, diaAcesso] = data.dataAcesso.split('-').map(Number);
    const meses = ["jan.", "fev.", "mar.", "abr.", "maio", "jun.", "jul.", "ago.", "set.", "out.", "nov.", "dez."];
    const mesFormatado = meses[mesAcesso - 1];
    const dataAcessoFormatada = `${diaAcesso} ${mesFormatado}. ${anoAcesso}`;

    let ref = `${autoresFormatados}. ${data.tituloArtigo}. ${data.tituloPublicacao}, ${data.local}: ${data.editora}, ${data.ano}. `;
    if (data.doi) {
      ref += `DOI/ISSN: ${data.doi}. `;
    }
    ref += `Disponível em: <${data.url}>. `;
    ref += `Acesso em: ${dataAcessoFormatada}.`;
    return ref;
  }

  const onAddReferencia = (data: GeneratorFormValues) => {
      const novaReferencia = formatarABNT(data);
      setReferencias(prev => [...prev, novaReferencia]);
      resetGenerator({
        autores: [{ nome: '', sobrenome: '' }],
        tituloArtigo: '',
        tituloPublicacao: '',
        local: '',
        editora: '',
        ano: undefined,
        doi: '',
        url: '',
        dataAcesso: '',
      });
  };

  const handleRemoveReferencia = (indexToRemove: number) => {
      setReferencias(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const onMainSubmit = async (data: MainFovalues) => {
    setIsSubmitting(true);
    try {
      localStorage.setItem("dadosBibliografia", JSON.stringify(data));
      console.log("Dados salvos:", data);
    } catch (error) {
      console.error("Erro ao salvar os dados:", error);
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsSubmitting(false);
    navigate("/protocolo-final");
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans p-4 sm:p-6 lg:p-8">
        <header className="max-w-5xl mx-auto mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 text-center">VERITA AUDIT</h1>
        </header>
        <div className="w-full max-w-5xl mx-auto rounded-xl p-6 md:p-10 bg-white shadow-lg">
            <h2 className="text-2xl font-semibold text-center mb-6">14. Bibliografia</h2>

            {/* Gerador de Referência */}
            <div className="p-6 border rounded-lg bg-gray-50/50 space-y-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-800">Gerador de Referência ABNT (Artigo Online)</h3>

                {/* Autores */}
                <div className="space-y-3">
                    <Label className="font-semibold text-gray-700">Autores</Label>
                    {fields.map((field, index) => (
                        <div key={field.id} className="flex items-center gap-2">
                            <Input {...registerGenerator(`autores.${index}.nome`)} placeholder="Nome" className="flex-1"/>
                            <Input {...registerGenerator(`autores.${index}.sobrenome`)} placeholder="Sobrenome" className="flex-1"/>
                            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length <= 1}>
                                <Trash2 className="h-4 w-4 text-gray-500"/>
                            </Button>
                        </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={() => append({ nome: '', sobrenome: '' })}>
                        <Plus className="h-4 w-4 mr-2"/> Adicionar Autor
                    </Button>
                    {errorsGenerator.autores && <p className="text-red-500 text-sm">{errorsGenerator.autores.message}</p>}
                </div>

                {/* Campos do Artigo */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="tituloArtigo">Título do Artigo</Label>
                        <Input id="tituloArtigo" {...registerGenerator("tituloArtigo")} />
                        <p className="text-red-500 text-sm mt-1">{errorsGenerator.tituloArtigo?.message}</p>
                    </div>
                     <div>
                        <Label htmlFor="tituloPublicacao">Título do Site/Publicação</Label>
                        <Input id="tituloPublicacao" {...registerGenerator("tituloPublicacao")} />
                        <p className="text-red-500 text-sm mt-1">{errorsGenerator.tituloPublicacao?.message}</p>
                    </div>
                    <div>
                        <Label htmlFor="local">Local (Cidade)</Label>
                        <Input id="local" {...registerGenerator("local")} />
                        <p className="text-red-500 text-sm mt-1">{errorsGenerator.local?.message}</p>
                    </div>
                    <div>
                        <Label htmlFor="editora">Editora/Instituição</Label>
                        <Input id="editora" {...registerGenerator("editora")} />
                        <p className="text-red-500 text-sm mt-1">{errorsGenerator.editora?.message}</p>
                    </div>
                    <div>
                        <Label htmlFor="ano">Ano de Publicação</Label>
                        <Input id="ano" type="number" {...registerGenerator("ano")} />
                        <p className="text-red-500 text-sm mt-1">{errorsGenerator.ano?.message}</p>
                    </div>
                    <div>
                        <Label htmlFor="doi">DOI/ISSN (Opcional)</Label>
                        <Input id="doi" {...registerGenerator("doi")} />
                        <p className="text-red-500 text-sm mt-1">{errorsGenerator.doi?.message}</p>
                    </div>
                    <div>
                        <Label htmlFor="url">URL</Label>
                        <Input id="url" type="url" placeholder="https://..." {...registerGenerator("url")} />
                        <p className="text-red-500 text-sm mt-1">{errorsGenerator.url?.message}</p>
                    </div>
                    <div>
                        <Label htmlFor="dataAcesso">Data de Acesso</Label>
                        <Input id="dataAcesso" type="date" {...registerGenerator("dataAcesso")} />
                        <p className="text-red-500 text-sm mt-1">{errorsGenerator.dataAcesso?.message}</p>
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button type="button" onClick={handleSubmitGenerator(onAddReferencia)} className="bg-blue-600 hover:bg-blue-700 text-white">
                        Adicionar Referência
                    </Button>
                </div>
            </div>


            <form onSubmit={handleSubmitMain(onMainSubmit)} className="space-y-6">
                 <div>
                    <Label className="text-base font-semibold">Bibliografia Gerada</Label>
                    <div className="mt-2 p-4 border rounded-md bg-gray-50 min-h-[150px] space-y-4">
                        {referencias.length > 0 ? (
                            referencias.map((ref, index) => (
                                <ReferenceDisplay key={index} text={ref} onRemove={() => handleRemoveReferencia(index)} />
                            ))
                        ) : (
                            <p className="text-gray-500 text-center py-8">Nenhuma referência adicionada ainda.</p>
                        )}
                    </div>
                    {/* Hidden textarea for validation and submission */}
                    <Textarea
                        {...registerMain("conteudoBibliografia")}
                        className="hidden"
                    />
                    <p className="text-red-500 text-sm mt-1">{errorsMain.conteudoBibliografia?.message}</p>
                </div>

                <div className="flex justify-end pt-6 border-t">
                    <Button
                        type="submit"
                        className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-3 text-lg h-auto rounded-md"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (<div className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Salvando...</div>) : "Finalizar Protocolo"}
                    </Button>
                </div>
            </form>
        </div>
    </div>
  );
};

export default FormularioBibliografia;

