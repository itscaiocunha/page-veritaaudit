import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import { toast } from "react-toastify";

const schema = yup.object({
  email: yup.string().email("E-mail inválido").required("Campo obrigatório"),
});

type FormData = yup.InferType<typeof schema>;

const RecuperarSenha = () => {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      await axios.post("/auth/forgot-password", { email: data.email });
      toast.success("Código enviado para o e-mail informado.");
      reset();
    } catch (err: any) {
      toast.error("Erro ao enviar código. Verifique o e-mail.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Imagem visível apenas em mobile */}
      <div className="md:hidden w-full flex justify-center pt-8">
        <img 
          src="/images/esqueceu.png"
          alt="Esqueceu" 
          className="object-contain"
        />
      </div>

      {/* Container do formulário */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full max-w-md space-y-6"
        >
          <div className="text-center space-y-2 mb-8">
            <h1 className="text-3xl font-semibold mb-6">Esqueceu sua senha?</h1>
            <p className="text-gray-600">Digite seu e-mail cadastrado</p>            
          </div>

          <div className="relative">
            <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input
              type="email"
              placeholder="E-mail"
              className="pl-10 py-6"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={!isValid || loading}
            className={`w-full py-6 text-white font-bold ${
              isValid ? "bg-[#90EE90] hover:bg-[#90EE90]" : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            {loading ? "Enviando..." : "Enviar Código"}
          </Button>

          <div className="text-center space-y-2">
            <Link to="/login" className="text-sm text-[#90EE90] hover:underline block">
              Voltar ao login!
            </Link>
          </div>
        </form>
      </div>

      {/* Imagem visível apenas em desktop */}
      <div
        className="hidden md:flex w-1/2 justify-center items-center"
        style={{ 
          background: "linear-gradient(to bottom left, #90EE90 50%, white 50%)" 
        }}
      >
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
