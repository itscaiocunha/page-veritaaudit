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
import api from "@/lib/axios"; // CONFIRA ESTE CAMINHO
import { isAxiosError } from "axios";

// Tipos
type Titulo = {
  tipo: string;
  curso: string;
  instituicao: string;
  capacitacao: string;
  dataConclusao: string;
  expanded: boolean;
};

type FileEntry = {
  file: File | null;
  description: string;
};

type StoredTitulo = Omit<Titulo, 'expanded' | 'capacitacao'> & {
  capacitacao?: string; // Para compatibilidade com localStorage antigo
  expanded?: boolean;
};

// Constantes
const tiposTitulacao = [
  "TECNICO",
  "GRADUACAO",
  "ESPECIALIZACAO",
  "MESTRADO",
  "DOUTORADO",
  "POS_GRADUACAO",
];

const tiposCapacitacao = [
  { value: "ETNICA", label: "Étnica" },
  { value: "PRATICA", label: "Prática" },
  { value: "ESPECIFICA", label: "Específica" },
];

// Componente FileDropzone
const FileDropzone = ({
  onFileAccepted,
  fileData,
  onRemove,
  onDescriptionChange,
  type
}: {
  onFileAccepted: (file: File) => void,
  fileData: FileEntry,
  onRemove: () => void,
  onDescriptionChange?: (description: string) => void,
  type: 'curriculo' | 'extra'
}) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] },
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
              onClick={(e) => { e.stopPropagation(); onRemove(); }}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          </div>
          {type === 'extra' && onDescriptionChange && (
            <Input
              placeholder="Descrição do certificado*"
              value={fileData.description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              className="mt-2 py-4"
              onClick={(e) => e.stopPropagation()}
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

// Componente RequiredField
const RequiredField = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-1">
    {children}
    <span className="text-red-500">*</span>
  </div>
);

// Componente LoadingSpinner
const LoadingSpinner = () => (
  <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
);

// Componente Principal Qualificacao
const Qualificacao = () => {
  const navigate = useNavigate();

  const [titulos, setTitulos] = useState<Titulo[]>([{
    tipo: "", curso: "", instituicao: "", capacitacao: "", dataConclusao: "", expanded: true,
  }]);
  const [curriculos, setCurriculos] = useState<FileEntry[]>([]);
  const [extras, setExtras] = useState<FileEntry[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const storedTitulosRaw = localStorage.getItem('userTitulos');
    if (storedTitulosRaw) {
      try {
        const parsedStoredTitulos: StoredTitulo[] = JSON.parse(storedTitulosRaw);
        if (Array.isArray(parsedStoredTitulos) && parsedStoredTitulos.length > 0) {
          setTitulos(parsedStoredTitulos.map(t => ({
            tipo: t.tipo || "",
            curso: t.curso || "",
            instituicao: t.instituicao || "",
            capacitacao: t.capacitacao || "", 
            dataConclusao: t.dataConclusao || "",
            expanded: false, 
          })));
        } else {
          setTitulos([{ tipo: "", curso: "", instituicao: "", capacitacao: "", dataConclusao: "", expanded: true }]);
        }
      } catch (e) {
        console.error("Erro ao parsear títulos do localStorage ou formato inválido:", e);
        setTitulos([{ tipo: "", curso: "", instituicao: "", capacitacao: "", dataConclusao: "", expanded: true }]);
      }
    } else {
      setTitulos([{ tipo: "", curso: "", instituicao: "", capacitacao: "", dataConclusao: "", expanded: true }]);
    }
  }, []);

  const validarPDF = (file: File): boolean => file.type === "application/pdf";
  const validarTamanhoArquivo = (file: File): boolean => (5 * 1024 * 1024) >= file.size;

  const validarData = (data: string): boolean => {
    if (!data) return false;
    const hoje = new Date();
    const dataSelecionada = new Date(data + 'T00:00:00Z'); 
    hoje.setUTCHours(0, 0, 0, 0);
    return dataSelecionada <= hoje;
  };

  const adicionarTitulo = () => {
    setTitulos(prev => [...prev, { tipo: "", curso: "", instituicao: "", capacitacao: "", dataConclusao: "", expanded: true }]);
  };

  const toggleExpandirTitulo = (index: number) => {
    setTitulos(prev => prev.map((t, i) => i === index ? { ...t, expanded: !t.expanded } : t));
  };

  const atualizarTitulo = (index: number, campo: keyof Omit<Titulo, 'expanded'>, valor: string) => {
    setTitulos(prev => prev.map((t, i) => i === index ? { ...t, [campo]: valor } : t));
  };

  const removerTitulo = (index: number) => {
    setTitulos(prev => prev.filter((_, i) => i !== index));
    toast.success("Título removido!");
  };

  const adicionarCurriculo = () => setCurriculos(prev => [...prev, { file: null, description: '' }]);
  const adicionarExtra = () => setExtras(prev => [...prev, { file: null, description: '' }]);
  
  const removerCurriculo = (index: number) => {
    setCurriculos(prev => prev.filter((_, i) => i !== index));
    toast.success("Currículo removido!");
  };
  const removerExtra = (index: number) => {
    setExtras(prev => prev.filter((_, i) => i !== index));
    toast.success("Certificado removido!");
  };

  const handleFinalizar = async () => {
    setIsSubmitting(true);

    try {
      // Validações de Títulos
      if (titulos.length === 0) {
        toast.error("Por favor, adicione pelo menos um título de qualificação.");
        setIsSubmitting(false); return;
      }
      for (const [index, titulo] of titulos.entries()) {
        if (!titulo.tipo) { toast.error(`O tipo é obrigatório para o título ${index + 1}.`); setIsSubmitting(false); return; }
        if (!titulo.capacitacao) { toast.error(`A capacitação é obrigatória para o título ${index + 1}.`); setIsSubmitting(false); return; }
        if (!titulo.instituicao.trim()) { toast.error(`A instituição é obrigatória para o título ${index + 1}.`); setIsSubmitting(false); return; }
        if (!titulo.curso.trim()) { toast.error(`O nome do curso é obrigatório para o título ${index + 1}.`); setIsSubmitting(false); return; }
        if (!titulo.dataConclusao) { toast.error(`A data de conclusão é obrigatória para o título ${index + 1}.`); setIsSubmitting(false); return; }
        if (!validarData(titulo.dataConclusao)) { toast.error(`A data de conclusão do título ${index + 1} não pode ser futura.`); setIsSubmitting(false); return; }
      }

      // Validações de Currículos
      if (curriculos.length === 0) {
        toast.error("É obrigatório adicionar pelo menos um currículo.");
        setIsSubmitting(false); return;
      }
      const curriculoSlotVazio = curriculos.findIndex(entry => entry.file === null);
      if (curriculoSlotVazio !== -1) {
        toast.error(`Por favor, adicione o arquivo para o currículo ${curriculoSlotVazio + 1}.`);
        setIsSubmitting(false); return;
      }

      // Validações de Certificados Extras
      for (const [index, extra] of extras.entries()) {
        if (!extra.file) { toast.error(`Por favor, adicione o arquivo para o certificado extra ${index + 1}.`); setIsSubmitting(false); return; }
        if (!extra.description.trim()) { toast.error(`A descrição é obrigatória para o certificado extra ${index + 1}.`); setIsSubmitting(false); return; }
      }

      const formData = new FormData();
      curriculos.forEach(entry => entry.file && formData.append('curriculo', entry.file));
      extras.forEach(entry => entry.file && formData.append('certificados', entry.file));

      const titulosParaAPI = titulos.map(t => ({
        titulacaoType: t.tipo,
        instituicao: t.instituicao,
        curso: t.curso,
        dataConclusao: t.dataConclusao,
        capacitacaoType: t.capacitacao
      }));

      const certificadosDetailsParaAPI = extras.map(entry => ({
        descricao: entry.description
      }));

      const jsonDataPayload = { titulacao: titulosParaAPI, certificadosDetails: certificadosDetailsParaAPI };
      
      console.log("Payload JSON a ser enviado no campo 'data':", JSON.stringify(jsonDataPayload, null, 2));
      // Adicionar um nome de arquivo ao Blob pode ajudar alguns backends, embora geralmente não seja necessário para JSON.
      formData.append('data', new Blob([JSON.stringify(jsonDataPayload)], { type: 'application/json' }), 'payload.json'); 
      
      const token = sessionStorage.getItem('token');
      if (!token) {
        toast.error("Sessão expirada ou token não encontrado. Faça login novamente.");
        setIsSubmitting(false);
        navigate('/login');
        return;
      }

      const response = await api.post('/gestor/qualification', formData, {
        headers: { 'Authorization': `Bearer ${token}` }
        // Content-Type para multipart/form-data é definido automaticamente pelo Axios/navegador
      });

      if (response.status === 201 || response.status === 200) {
        toast.success("Qualificações salvas com sucesso!");
        localStorage.removeItem('userTitulos');
        setTitulos([{ tipo: "", curso: "", instituicao: "", capacitacao: "", dataConclusao: "", expanded: true }]);
        setCurriculos([]);
        setExtras([]);
        navigate('/dashboard'); // Ou para onde for apropriado
      } else {
        toast.info(`Resposta do servidor: ${response.status}. Verifique os dados ou tente novamente.`);
      }

    } catch (error) {
      if (isAxiosError(error)) {
        const responseData = error.response?.data;
        const errorMessage = responseData?.error || responseData?.message || (error.response?.status === 400 ? "Requisição malformatada: verifique os dados enviados." : 'Erro ao salvar as qualificações.');
        toast.error(String(errorMessage));
        console.error("Erro na API de qualificação:", responseData || error.message, error.response?.status, error.config);
        if (error.response?.status === 401) {
          toast.error("Sua sessão pode ter expirado ou você não tem permissão. Faça login novamente.");
          navigate('/login');
        }
      } else {
        toast.error("Ocorreu um erro desconhecido ao processar sua solicitação.");
        console.error("Erro desconhecido:", error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-8 px-4 bg-gray-50 font-inter">
      <h1 className="text-4xl font-bold mb-8">VERITA AUDIT</h1>
      <div className="w-full max-w-4xl rounded-lg p-8 bg-white shadow-md">
        <h2 className="text-2xl font-semibold text-center mb-6">Qualificações Profissionais</h2>
        
        <div className="space-y-6 mb-6">
          {/* Seção de Titulação */}
          <div className="space-y-4">
            <label className="block text-lg font-semibold mb-1">
              <RequiredField>Titulação</RequiredField>
            </label>
            <Button variant="outline" className="bg-[#90EE90] hover:bg-[#7CCD7C] text-white font-bold flex items-center gap-2 rounded-md px-4 py-2 text-sm" onClick={adicionarTitulo}>
              <Plus className="h-4 w-4" /> Adicionar Título
            </Button>
            {titulos.map((titulo, index) => (
              <div key={`titulo-${index}`} className="mt-4 border rounded-lg p-4 shadow-sm bg-white">
                <div className="flex justify-between items-center cursor-pointer hover:bg-gray-50 p-2 -m-2 rounded" onClick={() => toggleExpandirTitulo(index)}>
                  <h3 className="font-medium text-gray-800">{titulo.curso || titulo.capacitacao || titulo.tipo || `Novo Título ${index + 1}`}</h3>
                  {titulo.expanded ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
                </div>
                {titulo.expanded && (
                  <div className="mt-4 space-y-4 pt-2 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700"><RequiredField>Tipo de Titulação</RequiredField></label>
                        <Select value={titulo.tipo} onValueChange={(value) => atualizarTitulo(index, 'tipo', value)}>
                          <SelectTrigger className="h-11 py-2 rounded-md"><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
                          <SelectContent>{tiposTitulacao.map((tipoOption) => (<SelectItem key={tipoOption} value={tipoOption}>{tipoOption}</SelectItem>))}</SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700"><RequiredField>Capacitação</RequiredField></label>
                        <Select value={titulo.capacitacao} onValueChange={(value) => atualizarTitulo(index, 'capacitacao', value)}>
                          <SelectTrigger className="h-11 py-2 rounded-md"><SelectValue placeholder="Selecione a capacitação" /></SelectTrigger>
                          <SelectContent>{tiposCapacitacao.map((capOption) => (<SelectItem key={capOption.value} value={capOption.value}>{capOption.label}</SelectItem>))}</SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700"><RequiredField>Instituição</RequiredField></label>
                        <Input value={titulo.instituicao} onChange={(e) => atualizarTitulo(index, 'instituicao', e.target.value)} placeholder="Nome da instituição" className="h-11 py-2 rounded-md" />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700"><RequiredField>Nome do Curso</RequiredField></label>
                        <Input value={titulo.curso} onChange={(e) => atualizarTitulo(index, 'curso', e.target.value)} placeholder="Ex: Direito, Engenharia Civil" className="h-11 py-2 rounded-md" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700"><RequiredField>Data de Conclusão</RequiredField></label>
                        <Input type="date" value={titulo.dataConclusao} onChange={(e) => atualizarTitulo(index, 'dataConclusao', e.target.value)} className="h-11 py-2 rounded-md" />
                      </div>
                    </div>
                    <div className="flex justify-end mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removerTitulo(index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md px-3 py-1.5 text-sm"
                        disabled={titulos.length === 1 && 
                                  !titulo.tipo && 
                                  !titulo.curso && 
                                  !titulo.instituicao && 
                                  !titulo.capacitacao &&
                                  !titulo.dataConclusao &&
                                  index === 0
                                 }
                      >
                        <Trash2 className="h-4 w-4 mr-1.5" /> Remover Título
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Seção de Currículos */}
          <div className="space-y-4">
            <label className="block text-lg font-semibold mb-1"><RequiredField>Currículos (PDF)</RequiredField></label>
            <Button variant="outline" className="bg-[#90EE90] hover:bg-[#7CCD7C] text-white font-bold flex items-center gap-2 mb-2 rounded-md px-4 py-2 text-sm" onClick={adicionarCurriculo}>
              <Plus className="h-4 w-4" /> Adicionar Currículo
            </Button>
            {curriculos.map((fileEntry, index) => (
              <div key={`curriculo-${index}`} className="mt-2">
                <FileDropzone
                  onFileAccepted={(file) => {
                    if (!validarPDF(file)) { toast.error("Por favor, selecione um arquivo PDF."); return; }
                    if (!validarTamanhoArquivo(file)) { toast.error("O arquivo do currículo não pode exceder 5MB."); return; }
                    const novos = [...curriculos];
                    novos[index] = { ...novos[index], file: file };
                    setCurriculos(novos);
                    toast.success(`Currículo ${file.name} adicionado.`);
                  }}
                  fileData={fileEntry}
                  onRemove={() => removerCurriculo(index)}
                  type="curriculo"
                />
              </div>
            ))}
          </div>

          {/* Seção de Certificados */}
          <div className="space-y-4">
            <label className="block text-lg font-semibold mb-1">Certificados (PDF) <span className="text-sm font-normal text-gray-500">(Opcional)</span></label>
            <Button variant="outline" className="bg-[#90EE90] hover:bg-[#7CCD7C] text-white font-bold flex items-center gap-2 mb-2 rounded-md px-4 py-2 text-sm" onClick={adicionarExtra}>
              <Plus className="h-4 w-4" /> Adicionar Certificado
            </Button>
            {extras.map((fileEntry, index) => (
              <div key={`certificado-${index}`} className="mt-2">
                <FileDropzone
                  onFileAccepted={(file) => {
                    if (!validarPDF(file)) { toast.error("Por favor, selecione um arquivo PDF."); return; }
                    if (!validarTamanhoArquivo(file)) { toast.error("O arquivo do certificado não pode exceder 5MB."); return; }
                    const novos = [...extras];
                    novos[index] = { ...novos[index], file: file };
                    setExtras(novos);
                    toast.success(`Certificado ${file.name} adicionado.`);
                  }}
                  fileData={fileEntry}
                  onRemove={() => removerExtra(index)}
                  onDescriptionChange={(description) => {
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
            className="bg-[#90EE90] hover:bg-[#7CCD7C] text-white font-bold px-8 py-3 text-lg h-auto rounded-md"
            onClick={handleFinalizar}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <LoadingSpinner /> Salvando...
              </div>
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