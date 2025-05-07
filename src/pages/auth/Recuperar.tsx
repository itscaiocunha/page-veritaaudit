import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const RecuperarSenha = () => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Imagem visível apenas em mobile e acima do formulário */}
      <div className="md:hidden w-full flex justify-center pt-8">
        <img 
          src="/images/esqueceu.png"
          alt="Esqueceu" 
          className="object-contain"
        />
      </div>

      {/* Container do formulário - agora ocupa metade em desktop */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2 mb-8">
            <h1 className="text-3xl font-semibold mb-6">Esqueceu sua senha?</h1>
            <p className="text-gray-600">Digite seu e-mail cadastrado</p>            
          </div>

          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                type="email"
                placeholder="E-mail"
                className="pl-10 py-6"
              />
            </div>
          </div>

          <Button className="w-full bg-[#90EE90] hover:bg-[#90EE90] text-white py-6">
            Enviar Código
          </Button>

          <div className="text-center space-y-2">
            <Link to="/login" className="text-sm text-[#90EE90] hover:underline block">
              Voltar ao login!
            </Link>
          </div>
        </div>
      </div>

      {/* Imagem visível apenas em desktop */}
      <div className="hidden md:flex w-1/2 justify-center items-center"
          style={{ 
            background: "linear-gradient(to bottom left, #90EE90 50%, white 50%)" 
          }}>
        <img 
          src="/images/esqueceu.png" 
          alt="Login" 
          className="max-h-[80vh] w-auto object-contain"
        />
      </div>
    </div>
  );
};

export default RecuperarSenha;