import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Imagem visível apenas em mobile e acima do formulário */}
      <div className="md:hidden w-full flex justify-center pt-8">
        <img 
          src="/images/login.png" 
          alt="Login" 
          className="object-contain"
        />
      </div>

      {/* Container do formulário - agora ocupa metade em desktop */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8">
        <div className="w-full max-w-md space-y-6">
          <h1 className="text-3xl font-semibold text-center mb-8">Login</h1>

          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                type="email"
                placeholder="E-mail"
                className="pl-10 py-6"
              />
            </div>

            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Senha"
                className="pr-10 py-6"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <Button className="w-full bg-[#90EE90] hover:bg-[#90EE90] text-white py-6">
            Logar
          </Button>

          <div className="text-center space-y-2">
            <Link to="/recuperar-senha" className="text-sm text-[#90EE90] hover:underline block">
              Esqueci a Senha!
            </Link>
            <Link to="/cadastro" className="text-sm text-[#90EE90] hover:underline block">
              Não possuo login!
            </Link>
          </div>
        </div>
      </div>

      {/* Imagem visível apenas em desktop */}
      <div className="w-1/2 flex justify-center items-center" 
            style={{ 
              background: "linear-gradient(to bottom left, #90EE90 50%, white 50%)" 
            }}>
        <img 
          src="/images/login.png" 
          alt="Login" 
          className="max-h-[80vh] w-auto object-contain"
        />
      </div>
    </div>
  );
};

export default Login;