import { useState } from "react";
import { Eye, EyeOff, Check, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import InputMask from 'react-input-mask';
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import { toast } from "react-toastify";

// Schema de validação com Yup
const schema = yup.object({
  nome: yup.string().required("Nome completo é obrigatório"),
  cpf: yup.string()
    .required("CPF é obrigatório")
    .matches(/^\d{3}\.\d{3}\.\d{3}\-\d{2}$/, "CPF inválido"),
  telefone: yup.string()
    .required("Telefone é obrigatório")
    .matches(/^\(\d{2}\) \d{5}\-\d{4}$/, "Telefone inválido"),
  emailPrincipal: yup.string()
    .required("E-mail principal é obrigatório")
    .email("E-mail inválido")
    .test("no-gmail", "Permitido apenas domínios próprios", value => 
      !value?.toLowerCase().endsWith('@gmail.com')
    ),
  emailSecundario: yup.string()
    .email("E-mail secundário inválido")
    .notRequired(),
  password: yup.string()
    .required("Senha é obrigatória")
    .min(8, "Senha deve ter no mínimo 8 caracteres")
    .matches(/[A-Z]/, "Deve conter pelo menos uma letra maiúscula")
    .matches(/[a-z]/, "Deve conter pelo menos uma letra minúscula")
    .matches(/[0-9]/, "Deve conter pelo menos um número")
    .matches(/[!@#$%^&*(),.?":{}|<>]/, "Deve conter pelo menos um caractere especial")
});

type FormData = yup.InferType<typeof schema>;

const Cadastro = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Configuração do React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
    reset
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    mode: "onChange"
  });

  const onSubmit = async (data: FormData) => {
    try {
      const dadosParaEnviar = {
        ...data,
        cpf: data.cpf.replace(/\D/g, ''),
        telefone: data.telefone.replace(/\D/g, ''),
        role: "gestor"
      };

      // const response = await axios.post('/api/gestores', dadosParaEnviar);
      console.log("Dados que serão enviados: ", dadosParaEnviar);
      toast.success("Cadastrado com sucesso!");
      reset();
      
      setTimeout(() => {
        navigate('/verificacao');
      }, 2000);
    } catch (error) {
      toast.error("Erro ao cadastrar. Por favor, tente novamente.");
      console.error("Erro no cadastro:", error);
    }
  };

  const handleMaskChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof FormData) => {
    setValue(field, e.target.value, { shouldValidate: true });
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Seção da imagem */}
      <div className="md:hidden w-full flex justify-center pt-8 bg-white">
        <img src="/images/register.png" alt="Cadastro" className="object-contain h-48"/>
      </div>

      <div className="hidden md:flex md:w-1/2 items-center justify-center p-8 bg-white">
        <img src="/images/register.png" alt="Cadastro" className="max-h-[80vh] w-auto object-contain"/>
      </div>
      
      {/* Seção do formulário */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-4 md:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md space-y-6">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">CADASTRO</h1>

          <div className="space-y-4">
            {/* Campo Nome */}
            <div>
              <Input
                type="text"
                placeholder="Nome completo*"
                className="py-6"
                {...register("nome")}
              />
              {errors.nome && <p className="text-red-500 text-sm mt-1">{errors.nome.message}</p>}
            </div>

            {/* Campo CPF */}
            <div>
              <InputMask
                mask="999.999.999-99"
                value={watch("cpf") || ""}
                onChange={(e) => handleMaskChange(e, "cpf")}
              >
                {(inputProps: any) => (
                  <Input
                    {...inputProps}
                    type="text"
                    placeholder="CPF*"
                    className="py-6"
                  />
                )}
              </InputMask>
              {errors.cpf && <p className="text-red-500 text-sm mt-1">{errors.cpf.message}</p>}
            </div>

            {/* Campo Telefone */}
            <div>
              <InputMask
                mask="(99) 99999-9999"
                value={watch("telefone") || ""}
                onChange={(e) => handleMaskChange(e, "telefone")}
              >
                {(inputProps: any) => (
                  <Input
                    {...inputProps}
                    type="tel"
                    placeholder="Telefone/Celular*"
                    className="py-6"
                  />
                )}
              </InputMask>
              {errors.telefone && <p className="text-red-500 text-sm mt-1">{errors.telefone.message}</p>}
            </div>

            {/* Campo E-mail Principal */}
            <div>
              <Input
                type="email"
                placeholder="E-mail Principal*"
                className="py-6"
                {...register("emailPrincipal")}
              />
              {errors.emailPrincipal && (
                <p className="text-red-500 text-sm mt-1">{errors.emailPrincipal.message}</p>
              )}
            </div>

            {/* Campo E-mail Secundário */}
            <div>
              <Input
                type="email"
                placeholder="E-mail Secundário"
                className="py-6"
                {...register("emailSecundario")}              
              />
              {errors.emailSecundario && (
                <p className="text-red-500 text-sm mt-1">{errors.emailSecundario.message}</p>
              )}
            </div>

            {/* Campo Senha */}
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
                {showPassword ? <EyeOff className="h-5 w-5"/> : <Eye className="h-5 w-5"/>}
              </button>
              
              {/* Validações da senha */}
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
          </div>

          <Button 
            type="submit"
            className={`w-full py-6 text-white font-bold ${isValid ? 'bg-[#90EE90] hover:bg-[#90EE90]' : 'bg-gray-400 cursor-not-allowed'}`}
            disabled={!isValid}
          >
            Cadastrar
          </Button>
        </form>

        <div className="text-center mt-6">
          <Link to="/login" className="text-sm text-[#90EE90] hover:text-[#90EE90] hover:underline">
            Já possui uma conta? Faça login
          </Link>
        </div>
      </div>
    </div>
  );
};

// Componente auxiliar para mostrar os requisitos da senha
const PasswordRequirement = ({ isValid, text, hasValue }: { isValid: boolean, text: string, hasValue: boolean }) => {
  if (!hasValue) {
    return <div className="text-gray-400 text-sm">{text}</div>;
  }

  return (
    <div className={`flex items-center ${isValid ? 'text-green-500' : 'text-red-500'}`}>
      {isValid ? <Check className="h-4 w-4 mr-2"/> : <X className="h-4 w-4 mr-2"/>}
      <span>{text}</span>
    </div>
  );
};

export default Cadastro;