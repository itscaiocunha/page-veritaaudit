import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, LayoutGrid, List, FileText } from "lucide-react";

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

  const [ano, mes, dia] = isoDate.split("-");
  const date = new Date(Number(ano), Number(mes) - 1, Number(dia));

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// --- Componentes de Card (Grid View) ---

const VersaoCard: React.FC<{ versao: ProtocoloVersao; onClick: () => void }> = ({ versao, onClick }) => (
  <div onClick={onClick} className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow border border-gray-200 flex flex-col overflow-hidden cursor-pointer group" role="button">
    <div className="p-4 flex-grow">
      <h3 className="font-bold text-lg text-gray-800 truncate group-hover:text-green-600 transition-colors" title={versao.titulo}>{versao.titulo}</h3>
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
    className="bg-white rounded-lg shadow-md hover:shadow-lg hover:border-green-300 transition-all border border-gray-200 flex flex-col overflow-hidden p-4 cursor-pointer group"
    role="button"
  >
    <div className="flex items-start gap-3">
      <div className="p-2 bg-green-50 rounded-lg text-green-600 shrink-0 group-hover:bg-green-100 transition-colors">
        <FileText className="h-6 w-6" />
      </div>
      <div>
        <h3 className="font-semibold text-gray-800 text-sm leading-tight group-hover:text-green-600 transition-colors">{anexo.title}</h3>
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
    className="w-full p-4 flex items-center gap-4 border-b border-gray-200 last:border-b-0 hover:bg-green-50 transition-colors cursor-pointer group"
    role="button"
  >
    <FileText className="h-5 w-5 text-green-500 shrink-0 group-hover:text-green-700" />
    <div className="flex-1">
      <h3 className="text-sm font-medium text-gray-900 group-hover:text-green-700">{anexo.title}</h3>
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

  // 2. Carregar Anexos (Formulários Selecionados) via API de Detalhes
  useEffect(() => {
    if (!protocoloMestreId) return;

    const fetchAnexos = async () => {
      const apiKey = "2NtzCUDl8Ib2arnDRck0xK8taguGeFYuZqnUzpiZ9Wp-tUZ45--/i=tKxzwTPBvtykMSx!0t?7c/Z?NllkokY=TEC2DSonmOMUu0gxdCeh70/rA2NSsm7Ohjn7VM2BeP";
      let TOKEN = sessionStorage.getItem("token");

      if (!TOKEN) {
        console.error("Usuário não autenticado ao buscar anexos.");
        navigate("/login");
        return;
      }

      TOKEN = TOKEN.replace(/"/g, '');

      const API_URL_DETALHES = `https://verita-brgchubha6ceathm.brazilsouth-01.azurewebsites.net/api/protocolo/versao/ativo/detalhes/${protocoloMestreId}`;

      try {
        const response = await fetch(API_URL_DETALHES, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${TOKEN}`,
            "X-API-KEY": apiKey,
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Erro ao buscar anexos: ${response.status} - ${errorText}`);
          setAnexosSelecionados([]);
          return;
        }

        const data = await response.json();
        const anexosApi = (data?.anexos || []).map((anexo: any) => ({
          id: String(anexo.identificador),
          title: anexo.titulo,
          path: anexo.path,
        }));

        setAnexosSelecionados(anexosApi);
      } catch (err) {
        console.error("Erro ao carregar anexos do protocolo:", err);
        setAnexosSelecionados([]);
      }
    };

    fetchAnexos();
  }, [protocoloMestreId, navigate]);
  
  // Navegação para Versões
  const handleVersaoClick = (versaoClicada: ProtocoloVersao) => {    
    navigate(`/introducao/${protocoloMestreId}`);
  };

  const handleAnexoClick = (anexo: FormularioSelecionado) => {
    if (!anexo.path) return;

    // path vem da API, ex: "/local-etapa-clinica"
    // Resultado final: /formulario/local-etapa-clinica
    const cleanedPath = anexo.path.startsWith("/") ? anexo.path : `/${anexo.path}`;
    navigate(`/formulario${cleanedPath}`);
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
            className={`p-1.5 rounded transition-colors ${viewMode === "grid" ? "bg-green-600 text-white shadow" : "text-gray-500 hover:bg-gray-100"}`}
            title="Visualização em Grade"
          >
            <LayoutGrid className="h-5 w-5" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-1.5 rounded transition-colors ${viewMode === "list" ? "bg-green-600 text-white shadow" : "text-gray-500 hover:bg-gray-100"}`}
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