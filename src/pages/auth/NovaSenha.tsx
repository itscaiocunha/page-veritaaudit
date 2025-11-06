import { useState } from "react";
import { Eye, EyeOff, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";
// --- ALTERAÇÃO NA IMPORTAÇÃO ---
import { useNavigate, useSearchParams } from "react-router-dom"; // Trocado useParams por useSearchParams
import axios from "axios";

// --- Schema (Sem alterações) ---
const schema = yup.object({
  password: yup.string()
    .required("Senha é obrigatória")
    .min(8, "Mínimo 8 caracteres")
    .matches(/[A-Z]/, "Pelo menos 1 letra maiúscula")
    .matches(/[a-z]/, "Pelo menos 1 letra minúscula")
    .matches(/[0-9]/, "Pelo menos 1 número")
    .matches(/[!@#$%^&*(),.?\":{}|<>]/, "Pelo menos 1 caractere especial"),
  confirmPassword: yup.string()
    .oneOf([yup.ref("password")], "As senhas não coincidem")
    .required("Confirmação obrigatória")
});

type FormData = yup.InferType<typeof schema>;

const NovaSenha = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // --- ALTERAÇÃO NA LEITURA DO TOKEN ---
  // Substitui o useParams
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token"); // Pega o valor do parâmetro 'token' da URL
  // --- FIM DA ALTERAÇÃO ---

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

  // --- Função onSubmit (Atualizada com API Key) ---
  const onSubmit = async (data: FormData) => {
    
    const apiKey = "2NtzCUDl8Ib2arnDRck0xK8taguGeFYuZqnUzpiZ9Wp-tUZ45--/i=tKxzwTPBvtykMSx!0t?7c/Z?NllkokY=TEC2DSonmOMUu0gxdCeh70/rA2NSsm7Ohjn7VM2BeP";
    
    const config = {
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
    };

    try {
      const apiUrl = "https://verita-brgchubha6ceathm.brazilsouth-01.azurewebsites.net/api/user/salvar-senha";

      const requestBody = {
        token: token,         // Este 'token' agora vem do useSearchParams
        senha: data.password
      };
      
      // Verifica se o token foi lido corretamente
      if (!token) {
        toast.error("Token não encontrado na URL. Verifique o link.");
        return; // Interrompe a execução se não houver token
      }

      await axios.post(apiUrl, requestBody, config);
      
      toast.success("Senha redefinida com sucesso!");
      reset();
      setTimeout(() => navigate("/login"), 2000);

    } catch (err: any) {
      toast.error("Erro ao redefinir a senha. O link pode ter expirado.");
      console.error("Falha na chamada da API:", err.response || err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="hidden md:flex w-1/2 justify-center items-center bg-[#90EE90]">
        <img src="/images/novasenha.png" alt="Imagem" className="max-h-[70vh] object-contain" />
      </div>

      <div className="md:hidden w-full flex justify-center pt-8 bg-white">
        <img src="/images/novasenha.png" alt="Imagem" className="object-contain h-[300px]" />
      </div>

      <div className="w-full md:w-1/2 flex flex-col justify-center items-center px-6 py-10">
        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md space-y-6">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Nova Senha</h1>

          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Senha*"
              className="pr-10 py-6"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
            <div className="mt-3 space-y-2">
              <PasswordRequirement isValid={watch("password")?.length >= 8} text="Mínimo de 8 caracteres" hasValue={!!watch("password")} />
              <PasswordRequirement isValid={/[A-Z]/.test(watch("password") || "")} text="Pelo menos 1 letra maiúscula" hasValue={!!watch("password")} />
              <PasswordRequirement isValid={/[a-z]/.test(watch("password") || "")} text="Pelo menos 1 letra minúscula" hasValue={!!watch("password")} />
              <PasswordRequirement isValid={/[0-9]/.test(watch("password") || "")} text="Pelo menos 1 número" hasValue={!!watch("password")} />
              <PasswordRequirement isValid={/[!@#$%^&*(),.?\":{}|<>]/.test(watch("password") || "")} text="Pelo menos 1 caractere especial" hasValue={!!watch("password")} />
            </div>
          </div>

          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Confirmar senha*"
              className="pr-10 py-6"
              {...register("confirmPassword")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className={`w-full py-6 text-white font-bold ${isValid ? "bg-[#90EE90] hover:bg-[#90EE90]" : "bg-gray-400 cursor-not-allowed"}`}
            disabled={!isValid}
          >
            Criar nova senha
          </Button>
        </form>
      </div>
    </div>
  );
};

// --- Componente Auxiliar (Sem alterações) ---
const PasswordRequirement = ({ isValid, text, hasValue }: { isValid: boolean, text: string, hasValue: boolean }) => {
  if (!hasValue) {
    return <div className="text-gray-400 text-sm">{text}</div>;
  }

  return (
    <div className={`flex items-center text-sm ${isValid ? "text-green-600" : "text-red-500"}`}>
      {isValid ? <Check className="w-4 h-4 mr-2" /> : <X className="w-4 h-4 mr-2" />}
      {text}
    </div>
  );
};

export default NovaSenha;