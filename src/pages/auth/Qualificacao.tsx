import { useState, useEffect } from "react";
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
import { useNavigate } from 'react-router-dom';
import axios from "axios"; // Keep axios for direct use

// Define the type for a single titulation entry
type Titulo = {
  tipo: string;
  curso: string;
  instituicao: string;
  dataConclusao: string;
  expanded: boolean;
};

// Define the type for a file entry, including its description
type FileEntry = {
  file: File | null;
  description: string;
};

// Define the available titulation types
const tiposTitulacao = [
  "TECNICO",
  "GRADUACAO",
  "ESPECIALIZACAO",
  "MESTRADO",
  "DOUTORADO",
];

// FileDropzone component for handling file uploads with optional description
const FileDropzone = ({
  onFileAccepted,
  fileData, // Now expects a FileEntry object
  onRemove,
  onDescriptionChange, // New prop for description changes
  type
}: {
  onFileAccepted: (file: File) => void,
  fileData: FileEntry, // Pass the entire file entry object
  onRemove: () => void,
  onDescriptionChange?: (description: string) => void, // Optional for curriculum
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
      {fileData.file ? (
        <div className="flex flex-col gap-2 w-full">
          <div className="flex items-center gap-2 w-full">
            <FileText className="h-5 w-5 text-gray-500" />
            <span className="truncate flex-1">{fileData.file.name}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation(); // Prevent dropzone click when removing
                onRemove();
              }}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          </div>
          {type === 'extra' && onDescriptionChange && ( // Only for 'extra' type and if handler is provided
            <Input
              placeholder="Descrição do certificado*"
              value={fileData.description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              className="mt-2 py-4"
              onClick={(e) => e.stopPropagation()} // Prevent dropzone click when typing
            />
          )}
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

// RequiredField component to indicate mandatory fields
const RequiredField = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-1">
    {children}
    <span className="text-red-500">*</span>
  </div>
);

// LoadingSpinner component for visual feedback during submission
const LoadingSpinner = () => (
  <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
);

// Main Qualificacao component
const Qualificacao = () => {
  const navigate = useNavigate();

  // State for titulations (degrees/qualifications)
  const [titulos, setTitulos] = useState<Titulo[]>([{
    tipo: "",
    curso: "",
    instituicao: "",
    dataConclusao: "",
    expanded: true // Start with the first title expanded
  }]);
  // State for curriculum files
  const [curriculos, setCurriculos] = useState<FileEntry[]>([]);
  // State for extra certificate files, now including description
  const [extras, setExtras] = useState<FileEntry[]>([]);
  // State to manage submission loading status
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Effect to load titles from localStorage on component mount
  useEffect(() => {
    const storedTitulos = localStorage.getItem('userTitulos');

    if (storedTitulos) {
      try {
        const parsedTitulos = JSON.parse(storedTitulos);
        // Map stored titles, ensuring they are collapsed initially
        setTitulos(parsedTitulos.map((t: any) => ({ ...t, expanded: false })));
      } catch (e) {
        console.error("Erro ao parsear títulos do localStorage:", e);
      }
    }
  }, []);

  // Validates if the file is a PDF
  const validarPDF = (file: File): boolean => {
    return file.type === "application/pdf";
  };

  // Validates the file size (max 5MB)
  const validarTamanhoArquivo = (file: File): boolean => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    return file.size <= maxSize;
  };

  // Validates if the date is not in the future
  const validarData = (data: string): boolean => {
    const hoje = new Date();
    const dataSelecionada = new Date(data + 'T00:00:00'); // Ensure comparison is date-only
    hoje.setHours(0, 0, 0, 0); // Reset hours for accurate date comparison

    return dataSelecionada <= hoje;
  };

  // Adds a new titulation field to the state
  const adicionarTitulo = () => {
    const novoTitulo: Titulo = {
      tipo: "",
      curso: "",
      instituicao: "",
      dataConclusao: "",
      expanded: true // New title starts expanded
    };
    setTitulos([...titulos, novoTitulo]);
  };

  // Toggles the expanded/collapsed state of a titulation field
  const toggleExpandirTitulo = (index: number) => {
    const novosTitulos = [...titulos];
    novosTitulos[index].expanded = !novosTitulos[index].expanded;
    setTitulos(novosTitulos);
  };

  // Updates a specific field of a titulation entry
  const atualizarTitulo = (index: number, campo: keyof Titulo, valor: string) => {
    const novosTitulos = [...titulos];
    novosTitulos[index] = {
      ...novosTitulos[index],
      [campo]: valor
    };
    setTitulos(novosTitulos);
  };

  // Removes a titulation field from the state
  const removerTitulo = (index: number) => {
    const novos = titulos.filter((_, i) => i !== index);
    setTitulos(novos);
    toast.success("Título removido!");
  };

  // Adds a new curriculum file input slot
  const adicionarCurriculo = () => {
    setCurriculos([...curriculos, { file: null, description: '' }]); // Initialize with null file and empty description
  };

  // Adds a new extra certificate file input slot
  const adicionarExtra = () => {
    setExtras([...extras, { file: null, description: '' }]); // Initialize with null file and empty description
  };

  // Removes a curriculum file input slot
  const removerCurriculo = (index: number) => {
    const novos = curriculos.filter((_, i) => i !== index);
    setCurriculos(novos);
    toast.success("Currículo removido!");
  };

  // Removes an extra certificate file input slot
  const removerExtra = (index: number) => {
    const novos = extras.filter((_, i) => i !== index);
    setExtras(novos);
    toast.success("Certificado removido!");
  };

  // Handles the final submission of the form data
  const handleFinalizar = async () => {
    setIsSubmitting(true);

    try {
      // --- Validações ---
      if (titulos.length === 0) {
        toast.error("Por favor, adicione pelo menos um título.");
        setIsSubmitting(false);
        return;
      }

      for (const titulo of titulos) {
        if (!titulo.tipo) {
          toast.error("O tipo de titulação é obrigatório.");
          setIsSubmitting(false);
          return;
        }
        if (!titulo.instituicao) {
          toast.error("A instituição do título é obrigatória.");
          setIsSubmitting(false);
          return;
        }
        if (!titulo.curso) {
          toast.error("O nome do curso é obrigatório.");
          setIsSubmitting(false);
          return;
        }
        if (!titulo.dataConclusao) {
          toast.error("A data de conclusão do título é obrigatória.");
          setIsSubmitting(false);
          return;
        }

        if (!validarData(titulo.dataConclusao)) {
          toast.error("A data de conclusão não pode ser futura.");
          setIsSubmitting(false);
          return;
        }
      }

      if (curriculos.length === 0) {
        toast.error("É obrigatório enviar pelo menos um currículo.");
        setIsSubmitting(false);
        return;
      }

      // Check if all curriculum slots have a file
      if (curriculos.some(entry => entry.file === null)) {
        toast.error("Por favor, adicione todos os currículos nos campos disponíveis.");
        setIsSubmitting(false);
        return;
      }

      // Check if all extra certificate slots have a file
      if (extras.some(entry => entry.file === null)) {
        toast.error("Por favor, adicione todos os certificados nos campos disponíveis.");
        setIsSubmitting(false);
        return;
      }

      // --- Prepare FormData for submission ---
      const formData = new FormData();

      // Append curriculum files
      curriculos.forEach(entry => {
        if (entry.file) {
          formData.append('curriculo', entry.file);
        }
      });

      // Append extra certificate files and their descriptions
      const certificadosDescriptions: string[] = [];
      extras.forEach(entry => {
        if (entry.file) {
          formData.append('certificados', entry.file);
          certificadosDescriptions.push(entry.description);
        }
      });
      // Append descriptions as a JSON string
      formData.append('certificados_descriptions', new Blob(
        [JSON.stringify(certificadosDescriptions)],
        { type: 'application/json' }
      ));

      // Format titulations data for the API
      const titulosFormatadosParaAPI = titulos.map(t => ({
        titulacaoType: t.tipo,
        instituicao: t.instituicao,
        curso: t.curso,
        dataConclusao: t.dataConclusao
      }));

      // Append titulations data as a JSON blob
      formData.append('data', new Blob(
        [JSON.stringify({ titulacoes: titulosFormatadosParaAPI })],
        { type: 'application/json' }
      ));

      // Log FormData entries for debugging (optional)
      console.log([...formData.entries()]);

      // --- Send to API using axios directly ---
      const response = await axios.post('/gestor/qualification', formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Important for FormData
          'Authorization': `Bearer ${sessionStorage.getItem('token')}` // Include authorization token
        }
      });

      if (response.status === 201) {
        toast.success("Qualificações salvas com sucesso!");
        navigate('/dashboard'); // Navigate to dashboard on success
      } else {
        toast.info("As qualificações foram enviadas, mas houve uma resposta inesperada.");
      }

    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessageFromApi = error.response?.data?.message || 'Erro ao salvar as qualificações. Por favor, tente novamente.';
        toast.error(errorMessageFromApi);
        console.error("Erro na API de qualificação:", error.response?.data || error.message);
      } else {
        toast.error("Ocorreu um erro desconhecido ao salvar as informações.");
        console.error("Erro desconhecido:", error);
      }
    } finally {
      setIsSubmitting(false); // Reset submission state
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-8 px-4 bg-gray-50 font-inter">
      <h1 className="text-4xl font-bold mb-8">VERITA AUDIT</h1>

      <div className="w-full max-w-4xl rounded-lg p-8 bg-white shadow-md">
        <h2 className="text-2xl font-semibold text-center mb-6">Qualificações Profissionais</h2>

        <div className="space-y-6 mb-6">
          {/* Section for Titulation */}
          <div className="space-y-4">
            <label className="block text-lg font-semibold mb-2">
              <RequiredField>Titulação</RequiredField>
            </label>
            <Button
              variant="outline"
              className="bg-[#90EE90] hover:bg-[#90EE90] text-white font-bold flex items-center gap-2 rounded-md"
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
                          <SelectTrigger className="py-4 rounded-md">
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
                          className="py-4 rounded-md"
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
                          className="py-4 rounded-md"
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
                          className="py-4 rounded-md"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removerTitulo(index)}
                        className="text-red-500 hover:text-red-700 rounded-md"
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

          {/* Section for Curricula */}
          <div className="space-y-4">
            <label className="block text-lg font-semibold mb-2">
              <RequiredField>Currículos (PDF)</RequiredField>
            </label>
            <Button
              variant="outline"
              className="bg-[#90EE90] hover:bg-[#90EE90] text-white font-bold flex items-center gap-2 mb-2 rounded-md"
              onClick={adicionarCurriculo}
            >
              <Plus className="h-4 w-4" /> Adicionar Currículo
            </Button>

            {curriculos.map((fileEntry, index) => (
              <div key={`curriculo-${index}`} className="mt-2">
                <FileDropzone
                  onFileAccepted={(file) => {
                    if (!validarPDF(file)) {
                      toast.error("Por favor, selecione um arquivo PDF.");
                      return;
                    }
                    if (!validarTamanhoArquivo(file)) {
                      toast.error("O arquivo do currículo não pode exceder 5MB.");
                      return;
                    }
                    const novos = [...curriculos];
                    novos[index] = { ...novos[index], file: file }; // Update only the file
                    setCurriculos(novos);
                    toast.success(`Currículo ${file.name} adicionado.`);
                  }}
                  fileData={fileEntry} // Pass the entire file entry object
                  onRemove={() => removerCurriculo(index)}
                  type="curriculo"
                />
              </div>
            ))}
          </div>

          {/* Section for Certificates */}
          <div className="space-y-4">
            <label className="block text-lg font-semibold mb-2">
              <RequiredField>Certificados (PDF)</RequiredField>
            </label>
            <Button
              variant="outline"
              className="bg-[#90EE90] hover:bg-[#90EE90] text-white font-bold flex items-center gap-2 mb-2 rounded-md"
              onClick={adicionarExtra}
            >
              <Plus className="h-4 w-4" /> Adicionar Certificado
            </Button>

            {extras.map((fileEntry, index) => (
              <div key={`certificado-${index}`} className="mt-2">
                <FileDropzone
                  onFileAccepted={(file) => {
                    if (!validarPDF(file)) {
                      toast.error("Por favor, selecione um arquivo PDF.");
                      return;
                    }
                    if (!validarTamanhoArquivo(file)) {
                      toast.error("O arquivo do certificado não pode exceder 5MB.");
                      return;
                    }
                    const novos = [...extras];
                    novos[index] = { ...novos[index], file: file }; // Update only the file
                    setExtras(novos);
                    toast.success(`Certificado ${file.name} adicionado.`);
                  }}
                  fileData={fileEntry} // Pass the entire file entry object
                  onRemove={() => removerExtra(index)}
                  onDescriptionChange={(description) => { // New handler for description
                    const novos = [...extras];
                    novos[index] = { ...novos[index], description: description };
                    setExtras(novos);
                  }}
                  type="extra"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end mt-8">
          <Button
            className="bg-[#90EE90] hover:bg-[#90EE90] text-white font-bold px-8 py-6 text-lg rounded-md"
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
