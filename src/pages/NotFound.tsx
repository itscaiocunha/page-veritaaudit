import { useLocation, useNavigate } from "react-router-dom"; // Importamos 'useNavigate'
import { useEffect } from "react";
import { Button } from "@/components/ui/button"; // Usando o componente Button do shadcn/ui

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate(); // Hook para navegação

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 p-4 font-inter text-gray-800">
      <div className="text-center bg-white p-8 md:p-12 rounded-xl max-w-lg w-full flex flex-col items-center gap-6">
        {/* Imagem 404 */}
        <img
          src="/images/404.png" // Caminho para sua imagem
          alt="Página não encontrada - Ilustração de erro 404"
          className="max-w-xs md:max-w-sm h-auto animate-bounce-slow" // Animação sutil
        />

        <h1 className="text-5xl md:text-6xl font-extrabold text-green-700">
          Oops!
        </h1>
        <p className="text-xl md:text-2xl text-gray-700 font-medium">
          Parece que esta página não existe.
        </p>
        <p className="text-base text-gray-500 max-w-prose">
          A página que você está procurando pode ter sido removida, ter tido seu nome alterado ou está temporariamente indisponível.
        </p>

        {/* Botão de retorno estilizado (agora com o tema verde) */}
        <Button 
          onClick={() => navigate("/")} 
          className="mt-6 px-8 py-3 bg-[#90EE90] text-black font-semibold rounded-lg shadow-md hover:bg-[#7CCD7C] transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          Voltar para a Página Inicial
        </Button>
      </div>
    </div>
  );
};

export default NotFound;