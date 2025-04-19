import { Link } from "react-router-dom";
import { ArrowRight, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <>
      {/* MOBILE (centralizado) */}
      <div className="md:hidden min-h-screen flex flex-col justify-center items-center p-6 bg-white">
        <div className="w-full max-w-xs space-y-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900">VERITA AUDIT</h1>
          
          <div className="space-y-4"> {/* Espaço entre botões mobile */}
            <Link to="/login" className="block">
              <Button className="w-full bg-[#4C956C] hover:bg-[#2C6E49] text-white py-6 text-lg">
                Entrar <ArrowRight className="ml-2 inline" />
              </Button>
            </Link>
            
            <Link to="/cadastro" className="block">
              <Button variant="outline" className="w-full border-[#4C956C] text-[#4C956C] hover:bg-[#4C956C] hover:text-white py-6 text-lg">
                Criar Cadastro <UserPlus className="ml-2 inline" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* DESKTOP (com imagem) */}
      <div className="hidden md:flex min-h-screen">
        <div className="w-1/2 flex flex-col justify-center items-center p-12 bg-white">
          <div className="w-full max-w-md">
            <h1 className="text-4xl font-bold text-gray-900 text-center mb-12"> {/* Aumentei o margin-bottom */}
              VERITA AUDIT
            </h1>
            
            <div className="space-y-8"> {/* Aumentei o espaço entre botões desktop */}
              <Link to="/login">
                <Button className="w-full bg-[#4C956C] hover:bg-[#2C6E49] text-white py-6 text-lg">
                  Entrar <ArrowRight className="ml-2 inline" />
                </Button>
              </Link>
              
              <Link to="/cadastro">
                <Button variant="outline" className="w-full mt-20 border-[#4C956C] text-[#4C956C] hover:bg-[#4C956C] hover:text-white py-6 text-lg">
                  Criar Cadastro <UserPlus className="ml-2 inline" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        <div className="w-1/2 flex justify-center items-center p-8">
          <img 
            src="/images/auditoria-pecuaria.png" 
            alt="Auditoria pecuária" 
            className="h-auto max-h-[80vh] w-auto max-w-full object-contain" 
          />
        </div>
      </div>
    </>
  );
};

export default Index;