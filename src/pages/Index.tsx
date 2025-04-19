import { Link } from "react-router-dom";
import { ArrowRight, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Página inicial (Index) do sistema Verita Audit.
 * 
 * @remarks
 * - Fornece acesso rápido às telas de Login e Cadastro.
 * - Deve atender aos requisitos de acessibilidade (WCAG 2.1 AA).
 * - Responsividade: Mobile-first, com layout adaptativo para desktop.
 * 
 * @see Requisitos RF22 (Usabilidade), RF24 (Acessibilidade)
 */

const Index = () => {
  return (
    <>
      {/* MOBILE (centralizado) */}
      <div className="md:hidden min-h-screen flex flex-col justify-center items-center p-6 bg-white">
        <div className="w-full max-w-xs space-y-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900">VERITA AUDIT</h1>
          
          <div className="space-y-4">
            <Link 
              to="/login" 
              className="block"
              aria-label="Entrar no sistema"
            >
              <Button 
                className="w-full bg-[#4C956C] hover:bg-[#2C6E49] text-white py-6 text-lg"
                aria-label="Botão para entrar no sistema"
              >
                Entrar <ArrowRight className="ml-2 inline" aria-hidden="true" />
              </Button>
            </Link>
            
            <Link 
              to="/cadastro" 
              className="block"
              aria-label="Cadastrar no sistema"
            >
              <Button 
                variant="outline" 
                className="w-full border-[#4C956C] text-[#4C956C] hover:bg-[#4C956C] hover:text-white py-6 text-lg"
                aria-label="Botão para cadastrar no sistema"
              >
                Criar Cadastro <UserPlus className="ml-2 inline" aria-hidden="true" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Desktop: Layout dividido em 2 colunas (50% imagem, 50% conteúdo) */}
      <div className="hidden md:flex min-h-screen">
        <div className="w-1/2 flex flex-col justify-center items-center p-12 bg-white">
          <div className="w-full max-w-md">
            <h1 className="text-4xl font-bold text-gray-900 text-center mb-12">
              VERITA AUDIT
            </h1>
            
            <div className="space-y-8">
              <Link 
                to="/login" 
                aria-label="Entrar no sistema"
              >
                <Button 
                  className="w-full bg-[#4C956C] hover:bg-[#2C6E49] text-white py-6 text-lg"
                  aria-label="Botão para entrar no sistema"
                >
                  Entrar <ArrowRight className="ml-2 inline" />
                </Button>
              </Link>
              
              <Link 
                to="/cadastro"
                aria-label="Cadastrar no sistema"
              >
                <Button 
                  variant="outline" 
                  className="w-full mt-20 border-[#4C956C] text-[#4C956C] hover:bg-[#4C956C] hover:text-white py-6 text-lg"
                  aria-label="Botão para cadastrar no sistema"  
                >
                  Criar Cadastro <UserPlus className="ml-2 inline" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        <div className="w-1/2 flex justify-center items-center p-8">
          <img 
            src="/images/auditoria-pecuaria.png" 
            alt="Ilustração de auditoria pecuária com gráficos e animais" 
            className="h-auto max-h-[80vh] w-auto max-w-full object-contain"
            loading="lazy"
          />
        </div>
      </div>
    </>
  );
};

export default Index;