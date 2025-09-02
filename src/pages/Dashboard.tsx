// Dashboard.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, LogOut, Menu, PlusCircle } from "lucide-react";
import { Sidebar } from "../components/Sidebar";

export type PageType = "home" | "projects" | "universities" | "labs" | "profile";

interface DashboardProps {
  formData?: { name?: string };
}

interface Protocolo {
  titulo: string;
  codigo: string;
  patrocinador: string;
  miniatura: string | null;
  index: number;
}

/* Helpers */
const getInitials = (text?: string) => {
  if (!text) return "";
  return text
    .split(" ")
    .map((w) => w[0]?.toUpperCase() || "")
    .join("")
    .slice(0, 2);
};

/* Card Component */
const ProtocoloCard: React.FC<{ protocolo: Protocolo; onClick: () => void }> = ({ protocolo, onClick }) => {
  const initials = getInitials(protocolo.titulo);

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow border border-gray-200 flex flex-col overflow-hidden cursor-pointer"
      role="button"
      aria-label={`Abrir protocolo ${protocolo.titulo}`}
    >
      <div className="p-4 flex-grow">
        <h3 className="font-bold text-lg text-gray-800 truncate" title={protocolo.titulo}>
          {protocolo.titulo}
        </h3>
        <p className="text-sm text-gray-600 mt-2">
          <strong>Código:</strong> {protocolo.codigo}
        </p>
        <p className="text-sm text-gray-500">
          <strong>Patrocinador:</strong> {protocolo.patrocinador}
        </p>
      </div>
    </div>
  );
};

/* Dashboard */
const Dashboard: React.FC<DashboardProps> = ({ formData }) => {
  const [currentPage, setCurrentPage] = useState<PageType>("home");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [protocolos, setProtocolos] = useState<Protocolo[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const rawPatro = localStorage.getItem("dadosPatrocinador");
      const rawFull = localStorage.getItem("fullProtocolData");

      const parsedPatro = rawPatro ? JSON.parse(rawPatro) : [];
      const parsedFull = rawFull ? JSON.parse(rawFull) : [];

      const patrocinadoresArray = Array.isArray(parsedPatro)
        ? parsedPatro
        : (parsedPatro && Object.keys(parsedPatro).length ? [parsedPatro] : []);
      const fullDataArray = Array.isArray(parsedFull)
        ? parsedFull
        : (parsedFull && Object.keys(parsedFull).length ? [parsedFull] : []);

      const numProtocolos = Math.max(patrocinadoresArray.length, fullDataArray.length);

      if (numProtocolos === 0) {
        setProtocolos([]);
        return;
      }

      const loaded: Protocolo[] = [];

      for (let i = 0; i < numProtocolos; i++) {
        const patrocinadorData = patrocinadoresArray[i] || {};
        const fullData = fullDataArray[i] || {};

        const titulo =
          fullData?.protocolo?.titulo ||
          fullData?.titulo ||
          (typeof fullData === "string" ? fullData : `Protocolo ${i + 1}`);

        const codigo =
          fullData?.codigoEstudo ||
          fullData?.protocolo?.codigoEstudo ||
          fullData?.codigo ||
          `COD-${(i + 1).toString().padStart(3, "0")}`;

        const patrocinador =
          patrocinadorData?.patrocinador?.nome ||
          fullData?.protocolo?.patrocinador ||
          fullData?.patrocinador ||
          "Patrocinador Desconhecido";

        loaded.push({
          titulo,
          codigo,
          patrocinador,
          miniatura: null, // gerada no card
          index: i,
        });
      }

      setProtocolos(loaded);
    } catch (err) {
      console.error("Erro ao carregar dados do localStorage:", err);
      setProtocolos([]);
    }
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
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
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden bg-white p-2 rounded-md shadow-md">
              <Menu className="h-6 w-6 text-gray-600" />
            </button>

            <h2 className="text-xl lg:text-2xl font-bold text-gray-800">Bem-vindo(a), {formData?.name || "Usuário"}</h2>

            <div className="flex items-center space-x-4">
              <div className="relative hidden sm:block">
                <input
                  type="text"
                  placeholder="Pesquisar projetos ou pesquisas..."
                  className="w-72 p-2 pl-9 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              </div>

              <button onClick={() => navigate("/welcome")} className="flex items-center space-x-2 text-gray-600 hover:text-gray-800">
                <LogOut className="h-5 w-5" />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </header>

        {currentPage === "home" && (
          <main className="space-y-6 lg:space-y-12 mt-12">
            <h3 className="text-2xl font-bold text-gray-700 mb-6">Meus Protocolos</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {/* Criar Novo */}
              <div
                role="button"
                onClick={() => navigate("/protocolo/criar")}
                className="border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center p-6 text-gray-500 hover:bg-gray-100 hover:border-gray-400 transition h-full min-h-[250px] cursor-pointer"
              >
                <PlusCircle className="h-10 w-10 mb-2" />
                <span className="font-semibold">Criar Novo Protocolo</span>
              </div>

              {/* Protocolos */}
              {protocolos.length === 0 ? (
                <div className="col-span-full text-center text-gray-500 py-12">Nenhum protocolo encontrado.</div>
              ) : (
                protocolos.map((p) => (
                  <ProtocoloCard key={p.index} protocolo={p} onClick={() => navigate(`/protocolo-final`)} />
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
