// Dashboard.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, LogOut, Menu, PlusCircle } from "lucide-react";
import { Sidebar } from "../components/Sidebar";

export type PageType = "home" | "projects" | "universities" | "labs" | "profile";

interface Protocolo {
  id: number;
  codigo: string;
  dataCriacao: string;
}

const getInitials = (text?: string) => {
  if (!text) return "";
  return text
    .split(" ")
    .map((w) => w[0]?.toUpperCase() || "")
    .join("")
    .slice(0, 2);
};

const formatarData = (isoDate: string) => {
  if (!isoDate) return "Data desconhecida";
  try {
    const [ano, mes, dia] = isoDate.split("-");
    return `${dia}/${mes}/${ano}`;
  } catch (e) {
    console.error("Erro ao formatar data:", isoDate, e);
    return isoDate;
  }
};

const ProtocoloCard: React.FC<{ protocolo: Protocolo; onClick: () => void }> = ({
  protocolo,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow border border-gray-200 flex flex-col overflow-hidden cursor-pointer min-h-[160px]"
      role="button"
      aria-label={`Abrir protocolo ${protocolo.codigo}`}
    >
      <div className="p-4 flex-grow flex flex-col justify-between">
        <h3
          className="font-bold text-lg text-gray-800 truncate"
          title={protocolo.codigo}
        >
          {protocolo.codigo}
        </h3>
        <div>
          <p className="text-sm text-gray-600 mt-2">
            <strong>Criação:</strong> {formatarData(protocolo.dataCriacao)}
          </p>
        </div>
      </div>
    </div>
  );
};

/* Dashboard */
const Dashboard: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageType>("home");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [protocolos, setProtocolos] = useState<Protocolo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedName = localStorage.getItem("nome");
    if (storedName) {
      setUserName(storedName);
    }
  }, []);

  useEffect(() => {
    const fetchProtocolos = async () => {
      setIsLoading(true);
      setError(null);

      const apiKey =
        "2NtzCUDl8Ib2arnDRck0xK8taguGeFYuZqnUzpiZ9Wp-tUZ45--/i=tKxzwTPBvtykMSx!0t?7c/Z?NllkokY=TEC2DSonmOMUu0gxdCeh70/rA2NSsm7Ohjn7VM2BeP";
      
      let TOKEN = sessionStorage.getItem("token");

      if (!TOKEN) {
        setError("Usuário não autenticado. Faça o login novamente.");
        setIsLoading(false);
        navigate("/login");
        return;
      }
      
      TOKEN = TOKEN.replace(/"/g, ''); 

      const API_URL = `https://verita-brgchubha6ceathm.brazilsouth-01.azurewebsites.net/api/protocolo`;
      
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
            setError("Sessão expirada ou não autorizada. Faça o login novamente.");
             navigate("/login");
          } else {
            const errorData = await response.text();
            throw new Error(
              `Erro ${response.status}: ${response.statusText}. Detalhes: ${errorData}`
            );
          }
          throw new Error(`Erro de autenticação ${response.status}`);
        }

        const data: Protocolo[] = await response.json();
        setProtocolos(data);
      } catch (err) {
        console.error("Erro ao carregar dados da API:", err);
        if (err instanceof Error && !error) {
          setError(err.message);
        } else if (!error) {
          setError("Ocorreu um erro desconhecido.");
        }
        setProtocolos([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProtocolos();
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      <div
        className={`fixed lg:static z-50 h-full transition-all duration-300 bg-white shadow-lg ${
          isSidebarOpen ? "w-64" : "w-16"
        } lg:w-64 lg:block ${isSidebarOpen ? "block" : "hidden"} md:flex`}
      >
        <Sidebar
          currentPage={currentPage}
          onPageChange={(p) => setCurrentPage(p as PageType)}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />
      </div>

      {/* Main */}
      <div className="flex-1 h-screen overflow-y-auto p-4 lg:p-8 bg-gray-50 transition-all duration-300">
        <header className="sticky top-0 bg-gray-50 z-50 p-4 shadow-md flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden bg-white p-2 rounded-md shadow-md"
            >
              <Menu className="h-6 w-6 text-gray-600" />
            </button>

            <h2 className="text-xl lg:text-2xl font-bold text-gray-800">
              Bem-vindo(a), {userName || "Usuário"}
            </h2>

            <div className="flex items-center space-x-4">
              <div className="relative hidden sm:block">
                <input
                  type="text"
                  placeholder="Pesquisar projetos ou pesquisas..."
                  className="w-72 p-2 pl-9 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              </div>

              <button
                onClick={() => {
                  sessionStorage.removeItem("token");
                  navigate("/login");
                }}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
              >
                <LogOut className="h-5 w-5" />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </header>

        {currentPage === "home" && (
          <main className="space-y-6 lg:space-y-12 mt-12">
            <h3 className="text-2xl font-bold text-gray-700 mb-6">
              Meus Protocolos
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {/* Criar Novo */}
              <div
                role="button"
                onClick={() => navigate("/protocolo/criar")}
                className="border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center p-6 text-gray-500 hover:bg-gray-100 hover:border-gray-400 transition h-full min-h-[160px] cursor-pointer"
              >
                <PlusCircle className="h-10 w-10 mb-2" />
                <span className="font-semibold">Criar Novo Protocolo</span>
              </div>

              {/* Protocolos (ATUALIZADO) */}
              {isLoading ? (
                <div className="col-span-full text-center text-gray-500 py-12">
                  Carregando protocolos...
                </div>
              ) : error ? (
                <div className="col-span-full text-center text-red-500 py-12">
                  {error}
                </div>
              ) : protocolos.length === 0 ? (
                <div className="col-span-full text-center text-gray-500 py-12">
                  Nenhum protocolo encontrado.
                </div>
              ) : (
                protocolos.map((p) => (
                  <ProtocoloCard
                    key={p.id}
                    protocolo={p}
                    onClick={() => navigate(`/projeto/${p.id}`)}
                  />
                ))
              )}
            </div>
          </main>
        )}
      </div>
    </div>
  );
};

export default Dashboard;