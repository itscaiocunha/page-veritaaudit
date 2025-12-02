import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, LayoutGrid, List, FileText } from "lucide-react";

const ALL_PROTOCOL_FORMS = [
  { id: "ec-1-0", title: "1.0 - Registro de equipe executora e treinamento do protocolo", path: "/equipe-treinamento" },
  { id: "ec-2-0", title: "2.0 - Local da etapa clínica", path: "/local-etapa-clinica" },
  { id: "ec-3-0", title: "3.0 - Inventário do produto veterinário investigacional", path: "/inventario-produto-veterinario" },
  { id: "ec-4-0", title: "4.0 - Pesagem dos animais por Dia", path: "/pesagem-animais" },
  { id: "ec-5-0", title: "5.0 - Exame físico e laboratorial", path: "/exame-fisico-laboratorial" },
  { id: "ec-6-0", title: "6.0 - Identificação dos animais", path: "/identificacao-animais" },
  { id: "ec-7-0", title: "7.0 - Seleção dos animais", path: "/selecao-animais" },
  { id: "ec-8-0", title: "8.0 - Randomização", path: "/randomizacao" },
  { id: "ec-9-0", title: "9.0 - Tratamento", path: "/tratamento" },
  { id: "ec-10-0", title: "10.0 - Observações gerais de saúde (OGS)", path: "/observacoes-saude" },
  { id: "ec-11-0", title: "11.0 - Relatório técnico veterinário", path: "/relatorio-veterinario" },
  { id: "ec-12-0", title: "12.0 - Evento adverso", path: "/evento-adverso" },
  { id: "ec-13-0", title: "13.0 - Finalização da participação na pesquisa", path: "/finalizacao-pesquisa" },
  { id: "ec-14-0", title: "14.0 - Necropsia", path: "/necropsia" },
  { id: "ec-15-0", title: "15.0 - Destino da carcaça", path: "/destino-carcaca" },
  { id: "ec-17-0", title: "17.0 - Colheita de sangue", path: "/colheita-sangue" },
  { id: "ec-18-0", title: "18.0 - Colheita de sangue seriada", path: "/colheita-sangue-seriada" },
  { id: "ec-19-0", title: "19.0 - Colheita de matriz de tecido e processamento de amostra", path: "/colheita-tecido" },
  { id: "ec-20-0", title: "20.0 - Colheita de amostra de leite", path: "/colheita-leite" },
  { id: "ec-21-0", title: "21.0 - Produtividade das vacas leiteiras", path: "/produtividade-vacas" },
  { id: "ec-24-0", title: "24.0 - Escore de condição corporal", path: "/escore-corporal" },
  { id: "ec-27-0", title: "27.0 - Notas ao Estudo", path: "/notas-estudo" },
  { id: "ec-28-0", title: "28.0 - Envio de Produto", path: "/envio-produto" },
  { id: "ec-30-0", title: "30.0 - Rastreamento de envio e recebimento de documentos", path: "/rastreamento-documentos" },
  { id: "ec-31-0", title: "31.0 - Avaliação do local de aplicação", path: "/avaliacao-local-aplicacao" },
  { id: "ec-32-0", title: "32.0 - Triagem Bovinos", path: "/triagem-bovinos" },
  { id: "consentimento", title: "Formulário de Consentimento Livre e Esclarecido (TCLE)", path: "/tcle" },
  { id: "termoAssentimento", title: "Termo de Assentimento Livre e Esclarecido (TALE)", path: "/tale" },
];

// --- Interfaces ---
interface ProtocoloVersao {
  id: number;
  ativo: boolean;
  dataCriacao: string;
  titulo: string;
}

interface FormularioSelecionado {
  id: string;
  title: string;
  path: string; // Adicionado path
}

// --- Função de Formatação de Data ---
const formatarData = (isoDate: string) => {
  if (!isoDate) return "Data desconhecida";
  try {
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) {
      const [ano, mes, dia] = isoDate.split("T")[0].split("-");
      return `${dia}/${mes}/${ano}`;
    }
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch (e) {
    console.error("Erro ao formatar data:", isoDate, e);
    return isoDate;
  }
};

// --- Componentes de Card (Grid View) ---

const VersaoCard: React.FC<{ versao: ProtocoloVersao; onClick: () => void }> = ({ versao, onClick }) => (
  <div onClick={onClick} className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow border border-gray-200 flex flex-col overflow-hidden cursor-pointer group" role="button">
    <div className="p-4 flex-grow">
      <h3 className="font-bold text-lg text-gray-800 truncate group-hover:text-blue-600 transition-colors" title={versao.titulo}>{versao.titulo}</h3>
      <p className="text-sm text-gray-600 mt-2"><strong>ID da Versão:</strong> {versao.id}</p>
      <p className="text-sm text-gray-500"><strong>Criação:</strong> {formatarData(versao.dataCriacao)}</p>
      <p className={`text-sm font-bold mt-2 ${versao.ativo ? "text-green-600" : "text-gray-500"}`}>{versao.ativo ? "● Ativo" : "○ Inativo"}</p>
    </div>
  </div>
);

// MODIFICADO: Adicionado onClick
const AnexoCard: React.FC<{ anexo: FormularioSelecionado; onClick: () => void }> = ({ anexo, onClick }) => (
  <div 
    onClick={onClick}
    className="bg-white rounded-lg shadow-md hover:shadow-lg hover:border-blue-300 transition-all border border-gray-200 flex flex-col overflow-hidden p-4 cursor-pointer group"
    role="button"
  >
    <div className="flex items-start gap-3">
      <div className="p-2 bg-blue-50 rounded-lg text-blue-600 shrink-0 group-hover:bg-blue-100 transition-colors">
        <FileText className="h-6 w-6" />
      </div>
      <div>
        <h3 className="font-semibold text-gray-800 text-sm leading-tight group-hover:text-blue-600 transition-colors">{anexo.title}</h3>
        <p className="text-xs text-gray-400 mt-1">ID: {anexo.id}</p>
      </div>
    </div>
  </div>
);

// --- Componentes de Lista (List View) ---

const VersaoListItem: React.FC<{ versao: ProtocoloVersao; onClick: () => void }> = ({ versao, onClick }) => (
  <div onClick={onClick} className="w-full p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-200 last:border-b-0" role="button">
    <div className="flex-1 min-w-0">
      <h3 className="font-bold text-base text-gray-800 truncate">{versao.titulo}</h3>
      <p className="text-sm text-gray-500 mt-1">ID: {versao.id} | Criação: {formatarData(versao.dataCriacao)}</p>
    </div>
    <div className="flex-shrink-0 ml-4">
      <p className={`text-sm font-bold ${versao.ativo ? "text-green-600" : "text-gray-500"}`}>{versao.ativo ? "● Ativo" : "○ Inativo"}</p>
    </div>
  </div>
);

// MODIFICADO: Adicionado onClick e hover effects
const AnexoListItem: React.FC<{ anexo: FormularioSelecionado; onClick: () => void }> = ({ anexo, onClick }) => (
  <div 
    onClick={onClick}
    className="w-full p-4 flex items-center gap-4 border-b border-gray-200 last:border-b-0 hover:bg-blue-50 transition-colors cursor-pointer group"
    role="button"
  >
    <FileText className="h-5 w-5 text-blue-500 shrink-0 group-hover:text-blue-700" />
    <div className="flex-1">
      <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-700">{anexo.title}</h3>
      <p className="text-xs text-gray-500">ID: {anexo.id}</p>
    </div>
  </div>
);

// --- PÁGINA PRINCIPAL ---

const ProjetoPage: React.FC = () => {
  const { id: protocoloMestreId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [versoes, setVersoes] = useState<ProtocoloVersao[]>([]);
  const [anexosSelecionados, setAnexosSelecionados] = useState<FormularioSelecionado[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Fetch da Versão Ativa (API)
  useEffect(() => {
    if (!protocoloMestreId) {
      setError("ID do protocolo não encontrado.");
      setIsLoading(false);
      return;
    }

    const fetchVersoes = async () => {
      setIsLoading(true);
      setError(null);

      const apiKey = "2NtzCUDl8Ib2arnDRck0xK8taguGeFYuZqnUzpiZ9Wp-tUZ45--/i=tKxzwTPBvtykMSx!0t?7c/Z?NllkokY=TEC2DSonmOMUu0gxdCeh70/rA2NSsm7Ohjn7VM2BeP";
      let TOKEN = sessionStorage.getItem("token");

      if (!TOKEN) {
        setError("Usuário não autenticado.");
        setIsLoading(false);
        navigate("/login");
        return;
      }
      TOKEN = TOKEN.replace(/"/g, '');

      const API_URL = `https://verita-brgchubha6ceathm.brazilsouth-01.azurewebsites.net/api/protocolo/versao/ativo/${protocoloMestreId}`;

      try {
        const response = await fetch(API_URL, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${TOKEN}`,
            "X-API-KEY": apiKey,
          },
        });

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            setError("Sessão expirada. Faça o login novamente.");
            navigate("/login");
          } else if (response.status === 404) {
            setError("Nenhuma versão encontrada para este protocolo.");
          } else {
            const errorData = await response.text();
            throw new Error(`Erro ${response.status}: ${errorData}`);
          }
          throw new Error(`Erro ${response.status}`);
        }

        const data: ProtocoloVersao = await response.json();
        setVersoes([data]); 

      } catch (err) {
        console.error("Erro ao carregar versões do protocolo:", err);
        if (err instanceof Error && !error) setError(err.message);
        else if (!error) setError("Ocorreu um erro desconhecido.");
        setVersoes([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVersoes();
  }, [protocoloMestreId, navigate]);

  // 2. Carregar Anexos do LocalStorage
  useEffect(() => {
    if (!protocoloMestreId) return;

    try {
      const storageKey = `dadosAnexos_${protocoloMestreId}`;
      const savedData = localStorage.getItem(storageKey);

      if (savedData) {
        const parsedData = JSON.parse(savedData);
        const formulariosObj = parsedData.formularios || {};

        // Filtra a lista mestre e mapeia para incluir o path
        const selecionados = ALL_PROTOCOL_FORMS
          .filter(form => formulariosObj[form.id] === true)
          .map(form => ({
            id: form.id,
            title: form.title,
            path: form.path
          }));
        
        setAnexosSelecionados(selecionados);
      }
    } catch (err) {
      console.error("Erro ao ler anexos do localStorage:", err);
    }
  }, [protocoloMestreId]);
  
  // Navegação para Versões
  const handleVersaoClick = (versaoClicada: ProtocoloVersao) => {    
    navigate(`/introducao/${protocoloMestreId}`);
  };

  const handleAnexoClick = (anexo: FormularioSelecionado) => {
    // Navega para o path do formulário + ID do protocolo mestre
    // Ex: /equipe-treinamento/123
    if (anexo.path) {
      navigate('/formulario/equipe-executora');
    }
  };

  return (
    <div className="flex-1 h-screen overflow-y-auto p-4 lg:p-8 bg-gray-50 font-inter">
      
      {/* HEADER */}
      <header className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 p-2 rounded-md bg-white shadow-sm transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Voltar ao Dashboard</span>
        </button>
        
        {/* Seletor de View */}
        <div className="flex items-center space-x-2 bg-white shadow-sm rounded-md p-1 border border-gray-200">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded transition-colors ${viewMode === "grid" ? "bg-blue-600 text-white shadow" : "text-gray-500 hover:bg-gray-100"}`}
            title="Visualização em Grade"
          >
            <LayoutGrid className="h-5 w-5" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-1.5 rounded transition-colors ${viewMode === "list" ? "bg-blue-600 text-white shadow" : "text-gray-500 hover:bg-gray-100"}`}
            title="Visualização em Lista"
          >
            <List className="h-5 w-5" />
          </button>
        </div>
      </header>
      
      <main className="space-y-8">
        
        {/* TÍTULO */}
        <h3 className="text-2xl font-bold text-gray-800">
          {isLoading 
            ? "Carregando protocolo..." 
            : (versoes.length > 0 ? `Protocolo: ${versoes[0].titulo}` : `Protocolo (ID: ${protocoloMestreId})`)
          }
        </h3>
        
        {/* SEÇÃO 1: VERSÕES (Dados da API) */}
        <section>
          <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 ml-1">Versão Atual</h4>
          {isLoading ? (
            <div className="text-gray-500">Carregando...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : versoes.length > 0 ? (
            viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {versoes.map((versao) => (
                  <VersaoCard key={versao.id} versao={versao} onClick={() => handleVersaoClick(versao)} />
                ))}
              </div>
            ) : (
              <div className="bg-white border-t border-gray-200 overflow-hidden shadow-sm rounded-md">
                 {versoes.map((versao) => (
                  <VersaoListItem key={versao.id} versao={versao} onClick={() => handleVersaoClick(versao)} />
                ))}
              </div>
            )
          ) : (
             <div className="text-gray-500">Nenhuma versão encontrada.</div>
          )}
        </section>

        {/* SEÇÃO 2: FORMULÁRIOS SELECIONADOS (Dados do LocalStorage) */}
        <section>
          <div className="flex items-center gap-2 mb-3 ml-1">
            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Formulários Selecionados</h4>
            <span className="bg-gray-200 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full">{anexosSelecionados.length}</span>
          </div>
          
          {anexosSelecionados.length > 0 ? (
            viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {anexosSelecionados.map((anexo) => (
                  <AnexoCard 
                    key={anexo.id} 
                    anexo={anexo} 
                    onClick={() => handleAnexoClick(anexo)}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                {anexosSelecionados.map((anexo) => (
                  <AnexoListItem 
                    key={anexo.id} 
                    anexo={anexo} 
                    onClick={() => handleAnexoClick(anexo)}
                  />
                ))}
              </div>
            )
          ) : (
            <div className="p-8 text-center bg-gray-50 rounded-lg border border-dashed border-gray-300 text-gray-500">
              Nenhum formulário anexo selecionado para este protocolo.
            </div>
          )}
        </section>

      </main>
    </div>
  );
};

export default ProjetoPage;