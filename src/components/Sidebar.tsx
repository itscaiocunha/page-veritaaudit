import { useNavigate } from "react-router-dom";
import { Home, Newspaper, FileText, Building2, FlaskRound as Flask, User } from 'lucide-react';

type Page = "home" | "projects" | "universities" | "labs" | "profile" | "protocolo";

interface SidebarProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ currentPage, onPageChange, isCollapsed = false }: SidebarProps) {
  const navigate = useNavigate();

  const menuItems: { id: Page; label: string; icon: React.ElementType }[] = [
    // Outros menus desabilitados
    { id: "protocolo", label: "Add Protocolo", icon: Newspaper },
  ];

  const handleClick = (id: Page) => {
    onPageChange(id); // Atualiza estado do Dashboard, se necessário
    if (id === "protocolo") {
      navigate("/protocolo");
    }
  };

  return (
    <div
      className={`h-full bg-white shadow-lg flex flex-col transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Cabeçalho do menu */}
      <div className="p-4 flex items-center justify-between border-b">
        {!isCollapsed && <span className="font-semibold text-gray-800">Menu</span>}
      </div>

      {/* Navegação */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => handleClick(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                currentPage === item.id
                  ? "bg-blue-50 text-blue-900"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon
                className={`h-5 w-5 flex-shrink-0 ${
                  currentPage === item.id ? "text-blue-900" : "text-gray-400"
                }`}
              />
              {!isCollapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
