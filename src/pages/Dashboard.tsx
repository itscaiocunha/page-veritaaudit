import { Search, LogOut, Menu } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Sidebar } from '../components/Sidebar';

type PageType = "home" | "projects" | "universities" | "labs" | "profile";

interface DashboardProps {
  formData: {
    name: string;
  };
  setCurrentStep?: (step: "login" | "register" | "additional" | "dashboard") => void;
}

export function Dashboard({ formData }: DashboardProps): JSX.Element {
  const [currentPage, setCurrentPage] = useState<PageType>("home");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();

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
          onPageChange={(page: PageType) => setCurrentPage(page)}
          // isCollapsed={!isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />
      </div>
      
      {/* Conteúdo Principal */}
      <div className="flex-1 h-screen overflow-y-auto p-4 lg:p-8 bg-gray-50 transition-all duration-300">
        {/* Cabeçalho e Barra de Pesquisa */}
        <div className="sticky top-0 bg-gray-50 z-50 p-4 shadow-md flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden bg-white p-2 rounded-md shadow-md"
            >
              <Menu className="h-6 w-6 text-gray-600" />
            </button>
            <h2 className="text-xl lg:text-2xl font-bold text-gray-800">
              Bem-vindo(a), {formData.name || "Usuário"}
            </h2>
            <button
              onClick={() => navigate("/welcome")}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
            >
              <LogOut className="h-5 w-5" />
              <span>Sair</span>
            </button>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Pesquisar projetos ou pesquisas..."
              className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          </div>
        </div>

        {/* Renderização de Conteúdo por Página */}
        {currentPage === "home" && (
          <div className="space-y-6 lg:space-y-12 mt-12">
            {/* Conteúdo da página home */}
          </div>
        )}
      </div>
    </div>
  );
}
