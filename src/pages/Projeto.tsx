import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, LayoutGrid, List } from "lucide-react";

interface ProtocoloVersao {
  id: number;
  ativo: boolean;
  dataCriacao: string;
  titulo: string;
}

// Função de data (sem alterações)
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

// --- Componente de Card (Grid View) (Sem alterações) ---
const VersaoCard: React.FC<{ versao: ProtocoloVersao; onClick: () => void }> = ({
  versao,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow border border-gray-200 flex flex-col overflow-hidden cursor-pointer"
      role="button"
      aria-label={`Abrir versão ${versao.titulo}`}
    >
      <div className="p-4 flex-grow">
        <h3 className="font-bold text-lg text-gray-800 truncate" title={versao.titulo}>
          {versao.titulo}
        </h3>
        <p className="text-sm text-gray-600 mt-2">
          <strong>ID da Versão:</strong> {versao.id}
        </p>
        <p className="text-sm text-gray-500">
          <strong>Criação:</strong> {formatarData(versao.dataCriacao)}
        </p>
        <p className={`text-sm font-bold mt-2 ${versao.ativo ? "text-green-600" : "text-gray-500"}`}>
          {versao.ativo ? "● Ativo" : "○ Inativo"}
        </p>
      </div>
    </div>
  );
};

// ---
// MODIFICADO: Componente de Item (List View)
// Removido o 'last:border-b-0'
// ---
const VersaoListItem: React.FC<{ versao: ProtocoloVersao; onClick: () => void }> = ({
  versao,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className="w-full p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-200"
      role="button"
      aria-label={`Abrir versão ${versao.titulo}`}
    >
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-base text-gray-800 truncate" title={versao.titulo}>
          {versao.titulo}
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          ID: {versao.id} | Criação: {formatarData(versao.dataCriacao)}
        </p>
      </div>
      <div className="flex-shrink-0 ml-4">
        <p className={`text-sm font-bold ${versao.ativo ? "text-green-600" : "text-gray-500"}`}>
          {versao.ativo ? "● Ativo" : "○ Inativo"}
        </p>
      </div>
    </div>
  );
};


const ProjetoPage: React.FC = () => {
  const { id: protocoloMestreId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [versoes, setVersoes] = useState<ProtocoloVersao[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Lógica de fetch (sem alterações)
  useEffect(() => {
    if (!protocoloMestreId) {
      setError("ID do protocolo não encontrado.");
      setIsLoading(false);
      return;
    }

    const fetchVersoes = async () => {
      setIsLoading(true);
      setError(null);

      const apiKey =
        "2NtzCUDl8Ib2arnDRck0xK8taguGeFYuZqnUzpiZ9Wp-tUZ45--/i=tKxzwTPBvtykMSx!0t?7c/Z?NllkokY=TEC2DSonmOMUu0gxdCeh70/rA2NSsm7Ohjn7VM2BeP";
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
        
        // Coloca o objeto dentro de um array
        // Para testar, você pode duplicar o item: setVersoes([data, data]);
        setVersoes([data]); 

      } catch (err) {
        console.error("Erro ao carregar versões do protocolo:", err);
        if (err instanceof Error && !error) {
          setError(err.message);
        } else if (!error) {
          setError("Ocorreu um erro desconhecido.");
        }
        setVersoes([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVersoes();
  }, [protocoloMestreId, navigate]);
  
  const handleVersaoClick = (versaoClicada: ProtocoloVersao) => {    
    navigate(`/introducao/${protocoloMestreId}`);
  };

  return (
    <div className="flex-1 h-screen overflow-y-auto p-4 lg:p-8 bg-gray-50">
      
      {/* Header com botões (sem alterações) */}
      <header className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 p-2 rounded-md bg-white shadow-sm"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Voltar ao Dashboard</span>
        </button>
        
        <div className="flex items-center space-x-2 bg-white shadow-sm rounded-md p-1 border">
          <button
            onClick={() => setViewMode("grid")}
            aria-label="Visualização em Grade"
            className={`p-1.5 rounded ${
              viewMode === "grid"
                ? "bg-blue-600 text-white shadow"
                : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            <LayoutGrid className="h-5 w-5" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            aria-label="Visualização em Lista"
            className={`p-1.5 rounded ${
              viewMode === "list"
                ? "bg-blue-600 text-white shadow"
                : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            <List className="h-5 w-5" />
          </button>
        </div>
      </header>
      
      <main className="space-y-6">
        <h3 className="text-2xl font-bold text-gray-700">
          {isLoading 
            ? "Carregando protocolo..." 
            : (versoes.length > 0 ? `Protocolo: ${versoes[0].titulo}` : `Protocolo (ID: ${protocoloMestreId})`)
          }
        </h3>
        
        {/* Lógica de renderização */}
        <div>
          {isLoading ? (
            <div className="col-span-full text-center text-gray-500 py-12">
              Carregando versões...
            </div>
          ) : error ? (
            <div className="col-span-full text-center text-red-500 py-12">
              {error}
            </div>
          ) : versoes.length > 0 ? (
            
            viewMode === "grid" ? (
              // Grid View (Sem alterações)
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {versoes.map((versao) => (
                  <VersaoCard 
                    key={versao.id} 
                    versao={versao} 
                    onClick={() => handleVersaoClick(versao)} 
                  />
                ))}
              </div>
            ) : (
              // ---
              // MODIFICADO: List View
              // Removido rounded-lg, shadow-md, e border.
              // Adicionado border-t.
              // ---
              <div className="bg-white border-t border-gray-200 overflow-hidden">
                 {versoes.map((versao) => (
                  <VersaoListItem 
                    key={versao.id} 
                    versao={versao} 
                    onClick={() => handleVersaoClick(versao)} 
                  />
                ))}
              </div>
            )

          ) : (
             <div className="col-span-full text-center text-gray-500 py-12">
                Nenhuma versão encontrada.
              </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProjetoPage;