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
import api from "@/lib/axios";
import { isAxiosError } from "axios";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";


// Tipos
type Titulo = {
  tipo: string;
  curso: string;
  instituicao: string;
  capacitacao: string[]; // Alterado para array de strings
  dataConclusao: string;
  expanded: boolean;
};

type Links = {
  linkedinLink: string;
  lattesLink: string;
};

type FileEntry = {
  file: File | null;
  description: string;
  capacitacao: string[]; // Alterado para array de strings
};

type StoredTitulo = Omit<Titulo, 'expanded' | 'capacitacao'> & {
  capacitacao?: string | string[]; // Permite string ou array ao ler do storage
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
  { value: "ETICA", label: "Ética" },
  { value: "PRATICA", label: "Prática" },
  { value: "ESPECIFICA", label: "Treinamento Específico" },
];

// Componente FileDropzone
const FileDropzone = ({
  onFileAccepted,
  fileData,
  onRemove,
  onDescriptionChange,
  onCapacitacaoChange,
  type
}: {
  onFileAccepted: (file: File) => void,
  fileData: FileEntry,
  onRemove: () => void,
  onDescriptionChange?: (description: string) => void,
  onCapacitacaoChange?: (capacitacoes: string[]) => void, // Alterado para array de strings
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

  // Função para adicionar/remover uma capacitação selecionada
  const handleCapacitacaoCheckboxChange = (value: string, checked: boolean) => {
    if (onCapacitacaoChange) {
      const currentCapacitacoes = fileData.capacitacao || [];
      const newCapacitacoes = checked
        ? [...currentCapacitacoes, value]
        : currentCapacitacoes.filter(item => item !== value);
      onCapacitacaoChange(newCapacitacoes);
    }
  };

  return (
    <div
      {...getRootProps()}
      className={`flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-md cursor-pointer ${isDragActive ? 'border-green-500 bg-green-50' : 'border-gray-300'} hover:bg-gray-50`}
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
          {type === 'extra' && (
            <>
              {onDescriptionChange && (
                <Input
                  placeholder="Descrição do certificado*"
                  value={fileData.description}
                  onChange={(e) => onDescriptionChange(e.target.value)}
                  className="mt-2 py-4"
                  onClick={(e) => e.stopPropagation()}
                />
              )}
              {onCapacitacaoChange && (
                <div className="mt-2 space-y-2" onClick={(e) => e.stopPropagation()}>
                  <label className="block text-sm font-medium text-gray-700">Capacitação*</label>
                  {tiposCapacitacao.map((capOption) => (
                    <div key={`extra-${capOption.value}`} className="flex items-center space-x-2">
                      <Checkbox
                        id={`extra-capacitacao-${capOption.value}`}
                        checked={fileData.capacitacao.includes(capOption.value)}
                        onCheckedChange={(checked: boolean) => handleCapacitacaoCheckboxChange(capOption.value, checked)}
                      />
                      <Label htmlFor={`extra-capacitacao-${capOption.value}`}>{capOption.label}</Label>
                    </div>
                  ))}
                </div>
              )}
            </>
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
    tipo: "", curso: "", instituicao: "", capacitacao: [], dataConclusao: "", expanded: true,
  }]);
  const [links, setLinks] = useState<Links>({ linkedinLink: "", lattesLink: "" });
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
            // Garante que 'capacitacao' seja sempre um array
            capacitacao: Array.isArray(t.capacitacao) ? t.capacitacao : (t.capacitacao ? [t.capacitacao] : []),
            dataConclusao: t.dataConclusao || "",
            expanded: false,
          })));
        } else {
          setTitulos([{ tipo: "", curso: "", instituicao: "", capacitacao: [], dataConclusao: "", expanded: true }]);
        }
      } catch (e) {
        console.error("Erro ao parsear títulos do localStorage ou formato inválido:", e);
        setTitulos([{ tipo: "", curso: "", instituicao: "", capacitacao: [], dataConclusao: "", expanded: true }]);
      }
    } else {
      setTitulos([{ tipo: "", curso: "", instituicao: "", capacitacao: [], dataConclusao: "", expanded: true }]);
    }
  }, []);

  const validarPDF = (file: File): boolean => file.type === "application/pdf";
  const validarTamanhoArquivo = (file: File): boolean => (5 * 1024 * 1024) >= file.size;

  const validarData = (data: string): boolean => {
    const date = new Date(data);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time for accurate date comparison

    return !isNaN(date.getTime()) && date <= today;
  };

  const adicionarTitulo = () => {
    setTitulos(prev => [...prev, { tipo: "", curso: "", instituicao: "", capacitacao: [], dataConclusao: "", expanded: true }]);
  };

  const toggleExpandirTitulo = (index: number) => {
    setTitulos(prev => prev.map((t, i) => i === index ? { ...t, expanded: !t.expanded } : t));
  };

  // Função para atualizar um campo de Titulo, incluindo o array de capacitação
  const actualizarTitulo = (index: number, campo: keyof Omit<Titulo, 'expanded'>, valor: string | string[]) => {
    setTitulos(prev => prev.map((t, i) => {
      if (i === index) {
        if (campo === 'capacitacao') {
          // Garante que 'valor' é um array para 'capacitacao'
          return { ...t, [campo]: Array.isArray(valor) ? valor : [] };
        }
        return { ...t, [campo]: valor };
      }
      return t;
    }));
  };

  // Função para lidar com a seleção de capacitação em Títulos (adicionar/remover)
  const handleTituloCapacitacaoCheckboxChange = (index: number, value: string, checked: boolean) => {
    setTitulos(prev => prev.map((t, i) => {
      if (i === index) {
        const currentCapacitacoes = t.capacitacao || [];
        const newCapacitacoes = checked
          ? [...currentCapacitacoes, value]
          : currentCapacitacoes.filter(item => item !== value);
        return { ...t, capacitacao: newCapacitacoes };
      }
      return t;
    }));
  };

  const removerTitulo = (index: number) => {
    setTitulos(prev => prev.filter((_, i) => i !== index));
    toast.success("Título removido!");
  };

  const adicionarCurriculo = () => setCurriculos(prev => [...prev, { file: null, description: '', capacitacao: [] }]);
  const adicionarExtra = () => setExtras(prev => [...prev, { file: null, description: '', capacitacao: [] }]); // Inicializa com array vazio

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
        // Validação de Tipo de Titulação (ainda é um Select)
        if (!titulo.tipo) { toast.error(`O tipo é obrigatório para o título ${index + 1}.`); setIsSubmitting(false); return; }
        // Validação da capacitação para ter pelo menos uma seleção (agora com checkboxes)
        if (!titulo.capacitacao || titulo.capacitacao.length === 0) { toast.error(`A capacitação é obrigatória para o título ${index + 1}.`); setIsSubmitting(false); return; }
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
        // Validação da capacitação para ter pelo menos uma seleção (agora com checkboxes)
        if (!extra.capacitacao || extra.capacitacao.length === 0) { toast.error(`A capacitação é obrigatória para o certificado extra ${index + 1}.`); setIsSubmitting(false); return; }
      }

      const formData = new FormData();
      curriculos.forEach(entry => entry.file && formData.append('curriculo', entry.file));
      extras.forEach(entry => entry.file && formData.append('certificados', entry.file));

      const titulosParaAPI = titulos.map(t => ({
        titulacaoType: t.tipo,
        instituicao: t.instituicao,
        curso: t.curso,
        dataConclusao: t.dataConclusao,
        capacitacaoType: t.capacitacao.join(', ') // Junta o array em uma string separada por vírgulas
      }));

      const certificadosDetailsParaAPI = extras.map(entry => ({
        descricao: entry.description,
        certificadoType: entry.capacitacao.join(', ') // Junta o array em uma string separada por vírgulas
      }));

      const jsonDataPayload: {
        titulacao: typeof titulosParaAPI;
        certificadosDetails: typeof certificadosDetailsParaAPI;
        curriculoLattes?: string;
        linkLinkedin?: string;
      } = {
        titulacao: titulosParaAPI,
        certificadosDetails: certificadosDetailsParaAPI,
      };

      // Add Lattes and LinkedIn links directly to the JSON payload if they exist
      if (links.lattesLink) {
        jsonDataPayload.curriculoLattes = links.lattesLink;
      }
      if (links.linkedinLink) {
        jsonDataPayload.linkLinkedin = links.linkedinLink;
      }

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
      });

      if (response.status === 201 || response.status === 200) {
        toast.success("Qualificações salvas com sucesso!");
        localStorage.removeItem('userTitulos');
        setTitulos([{ tipo: "", curso: "", instituicao: "", capacitacao: [], dataConclusao: "", expanded: true }]);
        setCurriculos([]);
        setExtras([]);
        navigate('/dashboard');
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
                  {/* Prioriza titulo.curso para o nome do título */}
                  <h3 className="font-medium text-gray-800">{titulo.curso || `Novo Título ${index + 1}`}</h3>
                  {titulo.expanded ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
                </div>
                {titulo.expanded && (
                  <div className="mt-4 space-y-4 pt-2 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700"><RequiredField>Tipo de Titulação</RequiredField></label>
                        {/* Mantendo Select para Tipo de Titulação, pois é seleção única */}
                        <Select value={titulo.tipo} onValueChange={(value) => actualizarTitulo(index, 'tipo', value)}>
                          <SelectTrigger className="h-11 py-2 rounded-md"><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
                          <SelectContent>{tiposTitulacao.map((tipoOption) => (<SelectItem key={tipoOption} value={tipoOption}>{tipoOption}</SelectItem>))}</SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700"><RequiredField>Capacitação</RequiredField></label>
                        <div className="mt-2 space-y-2"> {/* Container para os checkboxes */}
                          {tiposCapacitacao.map((capOption) => (
                            <div key={`titulo-${index}-capacitacao-${capOption.value}`} className="flex items-center space-x-2">
                              <Checkbox
                                id={`titulo-${index}-capacitacao-${capOption.value}`}
                                checked={titulo.capacitacao.includes(capOption.value)}
                                onCheckedChange={(checked: boolean) => handleTituloCapacitacaoCheckboxChange(index, capOption.value, checked)}
                              />
                              <Label htmlFor={`titulo-${index}-capacitacao-${capOption.value}`}>{capOption.label}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700"><RequiredField>Instituição</RequiredField></label>
                        <Input value={titulo.instituicao} onChange={(e) => actualizarTitulo(index, 'instituicao', e.target.value)} placeholder="Nome da instituição" className="h-11 py-2 rounded-md" />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700"><RequiredField>Nome do Curso</RequiredField></label>
                        <Input value={titulo.curso} onChange={(e) => actualizarTitulo(index, 'curso', e.target.value)} placeholder="Ex: Direito, Engenharia Civil" className="h-11 py-2 rounded-md" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700"><RequiredField>Data de Conclusão</RequiredField></label>
                        <Input type="date" value={titulo.dataConclusao} onChange={(e) => actualizarTitulo(index, 'dataConclusao', e.target.value)} className="h-11 py-2 rounded-md" />
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
                          titulo.capacitacao.length === 0 && // Verifica se o array está vazio
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
            <Input
              type="url"
              placeholder="Link do Currículo Lattes (opcional)"
              value={links.lattesLink}
              onChange={e => setLinks(prev => ({ ...prev, lattesLink: e.target.value }))} />
            <Input
              type="url"
              placeholder="Link do LinkedIn (opcional)"
              value={links.linkedinLink}
              onChange={e => setLinks(prev => ({ ...prev, linkedinLink: e.target.value }))}
            />
          </div>

          {/* Seção de Certificados */}
          <div className="space-y-4">
            <label className="block text-lg font-semibold mb-1">Treinamentos (PDF) <span className="text-sm font-normal text-gray-500">(Opcional)</span></label>
            <Button variant="outline" className="bg-[#90EE90] hover:bg-[#7CCD7C] text-white font-bold flex items-center gap-2 mb-2 rounded-md px-4 py-2 text-sm" onClick={adicionarExtra}>
              <Plus className="h-4 w-4" /> Adicionar Treinamento
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
                  onCapacitacaoChange={(capacitacoes) => { // Recebe um array de strings
                    const novos = [...extras];
                    novos[index] = { ...novos[index], capacitacao: capacitacoes };
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