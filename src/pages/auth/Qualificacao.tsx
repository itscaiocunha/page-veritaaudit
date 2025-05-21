import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { useDropzone } from "react-dropzone";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Titulo = {
  tipo: string;
  curso: string;
  instituicao: string;
  dataConclusao: string;
  expanded: boolean;
};

const tiposTitulacao = [
  "Técnico",
  "Graduação",
  "Especialização",
  "Mestrado",
  "Doutorado",
  "Pós-Doutorado",
];

const FileDropzone = ({ 
  onFileAccepted, 
  file, 
  onRemove, 
  type 
}: { 
  onFileAccepted: (file: File) => void, 
  file: File | null, 
  onRemove: () => void,
  type: 'curriculo' | 'extra'
}) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    onDrop: acceptedFiles => {
      if (acceptedFiles.length > 0) {
        onFileAccepted(acceptedFiles[0]);
      }
    }
  });

  return (
    <div 
      {...getRootProps()} 
      className={`flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-md cursor-pointer 
        ${isDragActive ? 'border-green-500 bg-green-50' : 'border-gray-300'} hover:bg-gray-50`}
    >
      <input {...getInputProps()} />
      {file ? (
        <div className="flex items-center gap-2 w-full">
          <FileText className="h-5 w-5 text-gray-500" />
          <span className="truncate flex-1">{file.name}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="text-red-500 hover:text-red-700"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      ) : (
        <>
          <FileText className="h-10 w-10 text-gray-400 mb-2" />
          <p className="text-sm text-gray-600 text-center">
            {isDragActive ? 
              'Solte o arquivo PDF aqui' : 
              `Arraste e solte ${type === 'curriculo' ? 'seu currículo' : 'seu certificado'} em PDF aqui, ou clique para selecionar`}
          </p>
          <p className="text-xs text-gray-500 mt-1">Tamanho máximo: 5MB</p>
        </>
      )}
    </div>
  );
};

const RequiredField = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-1">
    {children}
    <span className="text-red-500">*</span>
  </div>
);

const LoadingSpinner = () => (
  <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
);

const Qualificacao = () => {
  const [nome, setNome] = useState("Usuário");
  const [profissao, setProfissao] = useState("");
  const [cargo, setCargo] = useState("");
  const [curriculoLattes, setCurriculoLattes] = useState("");
  const [titulos, setTitulos] = useState<Titulo[]>([{
    tipo: "",
    curso: "",
    instituicao: "",
    dataConclusao: "",
    expanded: true
  }]);
  const [curriculos, setCurriculos] = useState<Array<File | null>>([]);
  const [extras, setExtras] = useState<Array<File | null>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Funções de validação
  const validarPDF = (file: File): boolean => {
    return file.type === "application/pdf";
  };

  const validarLattes = (url: string): boolean => {
    const lattesRegex = /^https?:\/\/(www\.)?lattes\.cnpq\.br\/\d+$/i;
    return lattesRegex.test(url);
  };

  const validarTamanhoArquivo = (file: File): boolean => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    return file.size <= maxSize;
  };

  const validarData = (data: string): boolean => {
    const hoje = new Date();
    const dataSelecionada = new Date(data);
    return dataSelecionada <= hoje;
  };

  // Funções para Títulos
  const adicionarTitulo = () => {
    const novoTitulo: Titulo = {
      tipo: "",
      curso: "",
      instituicao: "",
      dataConclusao: "",
      expanded: false // os próximos não abrem automaticamente
    };
    setTitulos([...titulos, novoTitulo]);
  };

  const toggleExpandirTitulo = (index: number) => {
    const novosTitulos = [...titulos];
    novosTitulos[index].expanded = !novosTitulos[index].expanded;
    setTitulos(novosTitulos);
  };

  const atualizarTitulo = (index: number, campo: keyof Titulo, valor: string) => {
    const novosTitulos = [...titulos];
    novosTitulos[index] = {
      ...novosTitulos[index],
      [campo]: valor
    };
    setTitulos(novosTitulos);
  };

  const removerTitulo = (index: number) => {
    const novos = titulos.filter((_, i) => i !== index);
    setTitulos(novos);
    toast.success("Título removido!");
  };

  // Funções para Arquivos
  const adicionarCurriculo = () => {
    setCurriculos([...curriculos, null]);
  };

  const adicionarExtra = () => {
    setExtras([...extras, null]);
  };

  const removerCurriculo = (index: number) => {
    const novos = curriculos.filter((_, i) => i !== index);
    setCurriculos(novos);
    toast.success("Currículo removido!");
  };

  const removerExtra = (index: number) => {
    const novos = extras.filter((_, i) => i !== index);
    setExtras(novos);
    toast.success("Certificado removido!");
  };

  const handleFinalizar = async () => {
    setIsSubmitting(true);
    
    try {
      // Validações básicas
      if (!profissao || !cargo) {
        toast.error("Por favor, preencha profissão e cargo");
        return;
      }

      if (titulos.length === 0) {
        toast.error("Por favor, adicione pelo menos um título");
        return;
      }

      // Validar todos os títulos
      for (const titulo of titulos) {
        if (!titulo.tipo || !titulo.curso || !titulo.instituicao || !titulo.dataConclusao) {
          toast.error("Por favor, preencha todos os campos obrigatórios dos títulos");
          return;
        }
        
        if (!validarData(titulo.dataConclusao)) {
          toast.error("A data de conclusão não pode ser futura");
          return;
        }
      }

      if (curriculos.some(file => file === null)) {
        toast.error("Por favor, adicione todos os currículos");
        return;
      }
      
      if (extras.some(file => file === null)) {
        toast.error("Por favor, adicione todos os certificados");
        return;
      }

      if (curriculoLattes && !validarLattes(curriculoLattes)) {
        toast.error(<div>
          <p className="font-semibold">Link do Lattes inválido</p>
          <p className="text-sm">O link deve seguir o formato: http://lattes.cnpq.br/123456789</p>
        </div>);
        return;
      }

      // Simulação de chamada API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success("Informações salvas com sucesso!");
      console.log({ 
        nome, 
        profissao, 
        cargo, 
        curriculoLattes, 
        titulos, 
        curriculos, 
        extras 
      });
    } catch (error) {
      toast.error("Ocorreu um erro ao salvar as informações");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-8 px-4 bg-gray-50">
      <h1 className="text-4xl font-bold mb-8">VERITA AUDIT</h1>

      <div className="w-full max-w-4xl rounded-lg p-8 bg-white shadow-md">
        <h2 className="text-2xl font-semibold text-center mb-6">Olá, {nome}</h2>


        <div className="space-y-6 mb-6">
          {/* Seção de Titulação */}
          <div className="space-y-4">
            <label className="block text-lg font-semibold mb-2">
              <RequiredField>Titulação</RequiredField>
            </label>
            <Button
              variant="outline"
              className="bg-[#90EE90] hover:bg-[#90EE90] text-white font-bold flex items-center gap-2"
              onClick={adicionarTitulo}
            >
              <Plus className="h-4 w-4" /> Adicionar Título
            </Button>
            
            {titulos.map((titulo, index) => (
              <div key={`titulo-${index}`} className="mt-4 border rounded-lg p-4 shadow-sm">
                <div 
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => toggleExpandirTitulo(index)}
                >
                  <h3 className="font-medium text-gray-800">
                    {titulo.tipo || "Novo Título"}
                  </h3>
                  {titulo.expanded ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </div>
                
                {titulo.expanded && (
                  <div className="mt-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium">
                          <RequiredField>Tipo de Titulação</RequiredField>
                        </label>
                        <Select
                          value={titulo.tipo}
                          onValueChange={(value) => atualizarTitulo(index, 'tipo', value)}
                        >
                          <SelectTrigger className="py-4">
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            {tiposTitulacao.map((tipo) => (
                              <SelectItem key={tipo} value={tipo}>
                                {tipo}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium">
                          <RequiredField>Instituição</RequiredField>
                        </label>
                        <Input
                          value={titulo.instituicao}
                          onChange={(e) => atualizarTitulo(index, 'instituicao', e.target.value)}
                          placeholder="Nome da instituição"
                          className="py-4"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium">
                          <RequiredField>Nome do Curso</RequiredField>
                        </label>
                        <Input
                          value={titulo.curso}
                          onChange={(e) => atualizarTitulo(index, 'curso', e.target.value)}
                          placeholder="Ex: Direito, Engenharia Civil"
                          className="py-4"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium">
                          <RequiredField>Data de Conclusão</RequiredField>
                        </label>
                        <Input
                          type="date"
                          value={titulo.dataConclusao}
                          onChange={(e) => atualizarTitulo(index, 'dataConclusao', e.target.value)}
                          className="py-4"
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removerTitulo(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remover Título
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Seção de Currículos */}
          <div className="space-y-4">
            <label className="block text-lg font-semibold mb-2">
              <RequiredField>Currículos (PDF)</RequiredField>
            </label>
            <Button
              variant="outline"
              className="bg-[#90EE90] hover:bg-[#90EE90] text-white font-bold flex items-center gap-2 mb-2"
              onClick={adicionarCurriculo}
            >
              <Plus className="h-4 w-4" /> Adicionar Currículo
            </Button>
            
            {curriculos.map((file, index) => (
              <div key={`curriculo-${index}`} className="mt-2">
                <FileDropzone
                  onFileAccepted={(file) => {
                    if (!validarPDF(file)) {
                      toast.error("Por favor, selecione um arquivo PDF");
                      return;
                    }
                    if (!validarTamanhoArquivo(file)) {
                      toast.error("O arquivo não pode exceder 5MB");
                      return;
                    }
                    const novos = [...curriculos];
                    novos[index] = file;
                    setCurriculos(novos);
                  }}
                  file={file}
                  onRemove={() => removerCurriculo(index)}
                  type="curriculo"
                />
              </div>
            ))}
          </div>

          {/* Seção de Certificados */}
          <div className="space-y-4">
            <label className="block text-lg font-semibold mb-2">
              <RequiredField>Certificados (PDF)</RequiredField>
            </label>
            <Button
              variant="outline"
              className="bg-[#90EE90] hover:bg-[#90EE90] text-white font-bold flex items-center gap-2 mb-2"
              onClick={adicionarExtra}
            >
              <Plus className="h-4 w-4" /> Adicionar Certificado
            </Button>

            {extras.map((file, index) => (
              <div key={`certificado-${index}`} className="mt-2">
                <FileDropzone
                  onFileAccepted={(file) => {
                    if (!validarPDF(file)) {
                      toast.error("Por favor, selecione um arquivo PDF");
                      return;
                    }
                    if (!validarTamanhoArquivo(file)) {
                      toast.error("O arquivo não pode exceder 5MB");
                      return;
                    }
                    const novos = [...extras];
                    novos[index] = file;
                    setExtras(novos);
                  }}
                  file={file}
                  onRemove={() => removerExtra(index)}
                  type="extra"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end mt-8">
          <Button
            className="bg-[#90EE90] hover:bg-[#90EE90] text-white font-bold px-8 py-6 text-lg"
            onClick={handleFinalizar}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner />
                Salvando...
              </>
            ) : (
              'Finalizar Cadastro'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Qualificacao;