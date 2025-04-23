import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Cadastro = () => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Imagem visível apenas em mobile e acima do formulário */}
      <div className="md:hidden w-full flex justify-center pt-8">
        <img 
          src="/images/register.png" 
          alt="Cadastro" 
          className="object-contain"
        />
      </div>

      {/* Imagem visível apenas em desktop */}
      <div className="hidden md:flex md:w-1/2 items-center justify-center p-8">
        <img 
          src="/images/register.png" 
          alt="Cadastro" 
          className="max-h-[80vh] w-auto object-contain"
        />
      </div>
      {/* Right side with form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8">
        <div className="w-full max-w-md space-y-6">
          <h1 className="text-3xl font-semibold text-center mb-8">CADASTRO</h1>

          <div className="space-y-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Nome*"
                required
                className="py-6"
              />
            </div>

            <div className="relative">
              <Input
                type="text"
                placeholder="CPF*"
                required
                className="py-6"
              />
            </div>

            <div className="relative">
              <Input
                type="tel"
                placeholder="Telefone/Celular*"
                required
                className="py-6"
              />
            </div>

            <div className="relative">
              <Input
                type="email"
                placeholder="E-mail Principal*"
                required
                className="py-6"
              />
            </div>

            <div className="relative">
              <Input
                type="email"
                placeholder="E-mail Secundário"
                className="py-6"
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
            Cadastrar
          </Button>
        </div>

        <div className="text-center space-y-2 mt-4 mb-10">
          <Link to="/login" className="text-sm text-[#90EE90] hover:underline block">
            Já possuo login!
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cadastro;