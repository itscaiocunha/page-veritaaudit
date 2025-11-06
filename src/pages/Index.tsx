import { Link } from "react-router-dom";
import { ArrowRight, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Página inicial do sistema Verita Audit.
 * 
 * - Entradas principais: Login e Cadastro
 * - Acessível (WCAG 2.1 AA) e responsivo (mobile-first)
 * 
 * @see RF22 - Usabilidade
 * @see RF24 - Acessibilidade
 */

const Index = () => {
  return (
    <>
      {/* Mobile: layout vertical */}
      <div className="md:hidden min-h-screen flex flex-col justify-center items-center p-6 bg-white">
        <div className=" flex justify-center items-center p-8">
          <img
            src="/images/auditoria.png"
            alt="Ilustração representando uma auditoria pecuária com gráficos e animais"
            className="h-auto max-h-[80vh] w-auto max-w-full object-contain"
            loading="eager"
          />
        </div>

        <div className="w-full max-w-xs space-y-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900">VERITA AUDIT</h1>

          <div className="space-y-4">
            <Link to="/login" className="block">
              <Button
                className="w-full bg-[#90EE90] hover:bg-[#90EE90] text-white py-6 text-lg focus-visible:outline focus-visible:outline-2"
              >
                Entrar <ArrowRight className="ml-2 inline" aria-hidden="true" />
              </Button>
            </Link>

            <Link to="/cadastro" className="block">
              <Button
                variant="outline"
                className="w-full border-[#90EE90] text-[#90EE90] hover:bg-[#90EE90] hover:text-white py-6 text-lg focus-visible:outline focus-visible:outline-2"
              >
                Criar Cadastro <UserPlus className="ml-2 inline" aria-hidden="true" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Desktop: layout dividido com imagem */}
      <div className="hidden md:flex min-h-screen">
        <div className="w-1/2 flex flex-col justify-center items-center p-12 bg-white">
          <div className="w-full max-w-md">
            <h1 className="text-4xl font-bold text-gray-900 text-center mb-12">
              VERITA AUDIT
            </h1>

            <div className="space-y-8">
              <Link to="/login">
                <Button
                  className="w-full bg-[#90EE90] hover:bg-[#90EE90] text-white py-6 text-lg focus-visible:outline focus-visible:outline-2"
                >
                  Entrar <ArrowRight className="ml-2 inline" aria-hidden="true" />
                </Button>
              </Link>

              <Link to="/cadastro">
                <Button
                  variant="outline"
                  className="w-full mt-4 border-[#90EE90] text-[#90EE90] hover:bg-[#90EE90] hover:text-white py-6 text-lg focus-visible:outline focus-visible:outline-2"
                >
                  Criar Cadastro <UserPlus className="ml-2 inline" aria-hidden="true" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="w-1/2 flex justify-center items-center" 
            style={{ 
              background: "linear-gradient(to bottom right, white 50%, #90EE90 50%)" 
            }}>
          <img
            src="/images/auditoria.png"
            alt="Ilustração representando uma auditoria pecuária com gráficos e animais"
            className="h-auto max-h-[80vh] w-auto max-w-full object-contain"
            loading="eager"
          />
        </div>
      </div>
    </>
  );
};

export default Index;
