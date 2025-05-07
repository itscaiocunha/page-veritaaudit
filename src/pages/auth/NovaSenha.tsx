import { useState } from "react";
import { Eye, EyeOff, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

// Schema de validação
const schema = yup.object({
  password: yup.string()
    .required("Senha é obrigatória")
    .min(8, "Mínimo 8 caracteres")
    .matches(/[A-Z]/, "Pelo menos 1 letra maiúscula")
    .matches(/[a-z]/, "Pelo menos 1 letra minúscula")
    .matches(/[0-9]/, "Pelo menos 1 número")
    .matches(/[!@#$%^&*(),.?":{}|<>]/, "Pelo menos 1 caractere especial"),
  confirmPassword: yup.string()
    .oneOf([yup.ref("password")], "As senhas não coincidem")
    .required("Confirmação obrigatória")
});

type FormData = yup.InferType<typeof schema>;

const NovaSenha = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    reset
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    mode: "onChange"
  });

  const onSubmit = async (data: FormData) => {
    try {
      // Enviar nova senha para API
      console.log("Nova senha:", data.password);
      toast.success("Senha redefinida com sucesso!");
      reset();
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      toast.error("Erro ao redefinir a senha.");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Imagem Mobile */}
      <div className="md:hidden w-full flex justify-center pt-8 bg-white">
        <img src="/images/novasenha.png" alt="Nova senha" className="object-contain h-[350px]" />
      </div>

      {/* Imagem Desktop */}
      <div className="hidden md:flex w-1/2 justify-center items-center"
        style={{ background: "linear-gradient(to bottom right, #90EE90 50%, white 50%)" }}>
        <img src="/images/novasenha.png" alt="Nova senha" className="max-h-[70vh] w-auto object-contain" />
      </div>

      {/* Formulário */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-4 md:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md space-y-6">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Nova Senha</h1>

          {/* Senha */}
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Senha*"
              className="pr-10 py-6"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
            <div className="mt-3 space-y-2">
              <PasswordRequirement 
                isValid={watch("password")?.length >= 8}
                text="Mínimo de 8 caracteres"
                hasValue={!!watch("password")}
              />
              <PasswordRequirement 
                isValid={/[A-Z]/.test(watch("password") || "")}
                text="Pelo menos 1 letra maiúscula"
                hasValue={!!watch("password")}
              />
              <PasswordRequirement 
                isValid={/[a-z]/.test(watch("password") || "")}
                text="Pelo menos 1 letra minúscula"
                hasValue={!!watch("password")}
              />
              <PasswordRequirement 
                isValid={/[0-9]/.test(watch("password") || "")}
                text="Pelo menos 1 número"
                hasValue={!!watch("password")}
              />
              <PasswordRequirement 
                isValid={/[!@#$%^&*(),.?":{}|<>]/.test(watch("password") || "")}
                text="Pelo menos 1 caractere especial"
                hasValue={!!watch("password")}
              />
            </div>
          </div>

          {/* Confirmar Senha */}
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Confirmar senha*"
              className="pr-10 py-6"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
            )}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          <Button
            type="submit"
            className={`w-full py-6 text-white font-bold ${isValid ? 'bg-[#90EE90] hover:bg-[#90EE90]' : 'bg-gray-400 cursor-not-allowed'}`}
            disabled={!isValid}
          >
            Criar nova senha
          </Button>
        </form>
      </div>
    </div>
  );
};

const PasswordRequirement = ({ isValid, text, hasValue }: { isValid: boolean, text: string, hasValue: boolean }) => {
  if (!hasValue) {
    return <div className="text-gray-400 text-sm">{text}</div>;
  }

  return (
    <div className={`flex items-center ${isValid ? 'text-green-500' : 'text-red-500'}`}>
      {isValid ? <Check className="h-4 w-4 mr-2" /> : <X className="h-4 w-4 mr-2" />}
      <span>{text}</span>
    </div>
  );
};

export default NovaSenha;
