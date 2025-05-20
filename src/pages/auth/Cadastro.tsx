import { useState } from "react";
import { Eye, EyeOff, Check, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import InputMask from "react-input-mask";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import { toast } from "react-toastify";

// Schema de validação
const schema = yup.object({
  nome: yup.string().required("Nome completo é obrigatório"),
  cpf: yup.string().required("CPF é obrigatório").matches(/^[0-9]{3}\.[0-9]{3}\.[0-9]{3}-[0-9]{2}$/, "CPF inválido"),
  telefone: yup.string().required("Telefone é obrigatório").matches(/^\(\d{2}\) \d{5}-\d{4}$/, "Telefone inválido"),
  emailPrincipal: yup.string().required("E-mail principal é obrigatório").email("E-mail inválido").test("no-gmail", "Permitido apenas domínios próprios", value => !value?.toLowerCase().endsWith('@gmail.com')),
  emailSecundario: yup.string().email("E-mail secundário inválido").notRequired(),
  password: yup.string().required("Senha é obrigatória").min(8).matches(/[A-Z]/).matches(/[a-z]/).matches(/[0-9]/).matches(/[!@#$%^&*(),.?":{}|<>]/),
  cnpj: yup.string().required("CNPJ da Empresa é obrigatório").matches(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, "CNPJ inválido"),
  profissao: yup.string().required("Profissão é obrigatória"),
  curriculoLattes: yup.string().url("Informe uma URL válida para o currículo Lattes").notRequired(),
  cep: yup.string().required("CEP é obrigatório").matches(/^\d{5}-\d{3}$/, "CEP inválido"),
  numero: yup.string().required("Número é obrigatório"),
  logradouro: yup.string().required("Logradouro é obrigatório"),
  bairro: yup.string().required("Bairro é obrigatório"),
  cidade: yup.string().required("Cidade é obrigatória"),
  uf: yup.string().required("UF é obrigatória"),
  complemento: yup.string().notRequired()
});

type FormData = yup.InferType<typeof schema>;

const Cadastro = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
    trigger,
    reset
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    mode: "onChange"
  });

  const handleMaskChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof FormData) => {
    setValue(field, e.target.value, { shouldValidate: true });
  };

  const handleNext = async () => {
    const valid = await trigger(["nome", "cpf", "telefone", "emailPrincipal", "emailSecundario", "password"]);
    if (valid) setStep(2);
  };

  const handleNextAddress = async () => {
    const valid = await trigger(["cnpj", "profissao"]);
    if (valid) setStep(3);
  };

  const onSubmit = async (data: FormData) => {
    try {
      const dadosParaEnviar = {
        ...data,
        cpf: data.cpf.replace(/\D/g, ''),
        telefone: data.telefone.replace(/\D/g, ''),
        role: "gestor"
      };
      // await axios.post('/api/gestores', dadosParaEnviar);
      console.log("Dados que serão enviados:", dadosParaEnviar);
      toast.success("Cadastrado com sucesso!");
      reset();
      setTimeout(() => navigate('/verificacao-email'), 2000);
    } catch (error) {
      toast.error("Erro ao cadastrar. Por favor, tente novamente.");
      console.error("Erro no cadastro:", error);
    }
  };

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawCep = e.target.value.replace(/\D/g, "");
    setValue("cep", e.target.value);
    if (rawCep.length === 8) {
      try {
        const res = await axios.get(`https://viacep.com.br/ws/${rawCep}/json/`);
        if (res.data.erro) {
          toast.error("CEP não encontrado");
          return;
        }
        setValue("logradouro", res.data.logradouro || "");
        setValue("bairro", res.data.bairro || "");
        setValue("cidade", res.data.localidade || "");
        setValue("uf", res.data.uf || "");
        setValue("complemento", res.data.complemento || "");
      } catch {
        toast.error("Erro ao buscar o CEP");
      }
    }
  } 

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="md:hidden w-full flex justify-center pt-8 bg-white">
        <img src="/images/register.png" alt="Cadastro" className="object-contain h-48" />
      </div>

      <div className="w-1/2 hidden md:flex justify-center items-center" style={{ background: "linear-gradient(to bottom right, #90EE90 50%, white 50%)" }}>
        <img src="/images/register.png" alt="Cadastro" className="max-h-[80vh] w-auto object-contain" />
      </div>

      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-4 md:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md space-y-6">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">CADASTRO</h1>

          {step === 1 && (
            <>
              <Input placeholder="Nome completo*" className="py-6" {...register("nome")} />
              {errors.nome && <p className="text-red-500 text-sm">{errors.nome.message}</p>}

              <InputMask mask="999.999.999-99" value={watch("cpf") || ""} onChange={(e) => handleMaskChange(e, "cpf")}>
                {(inputProps: any) => <Input {...inputProps} placeholder="CPF*" className="py-6" />}
              </InputMask>
              {errors.cpf && <p className="text-red-500 text-sm">{errors.cpf.message}</p>}

              <InputMask mask="(99) 99999-9999" value={watch("telefone") || ""} onChange={(e) => handleMaskChange(e, "telefone")}>
                {(inputProps: any) => <Input {...inputProps} placeholder="Telefone/Celular*" className="py-6" />}
              </InputMask>
              {errors.telefone && <p className="text-red-500 text-sm">{errors.telefone.message}</p>}

              <Input placeholder="E-mail Principal*" className="py-6" {...register("emailPrincipal")} />
              {errors.emailPrincipal && <p className="text-red-500 text-sm">{errors.emailPrincipal.message}</p>}

              <Input placeholder="E-mail Secundário" className="py-6" {...register("emailSecundario")} />
              {errors.emailSecundario && <p className="text-red-500 text-sm">{errors.emailSecundario.message}</p>}

              <div className="relative">
                <Input type={showPassword ? "text" : "password"} placeholder="Senha*" className="pr-10 py-6" {...register("password")} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
                <div className="mt-3 space-y-2">
                  <PasswordRequirement isValid={watch("password")?.length >= 8} text="Mínimo de 8 caracteres" hasValue={!!watch("password")} />
                  <PasswordRequirement isValid={/[A-Z]/.test(watch("password") || "")} text="Pelo menos 1 letra maiúscula" hasValue={!!watch("password")} />
                  <PasswordRequirement isValid={/[a-z]/.test(watch("password") || "")} text="Pelo menos 1 letra minúscula" hasValue={!!watch("password")} />
                  <PasswordRequirement isValid={/[0-9]/.test(watch("password") || "")} text="Pelo menos 1 número" hasValue={!!watch("password")} />
                  <PasswordRequirement isValid={/[!@#$%^&*(),.?":{}|<>]/.test(watch("password") || "")} text="Pelo menos 1 caractere especial" hasValue={!!watch("password")} />
                </div>
              </div>

              <Button type="button" className="w-full py-6 font-bold bg-[#90EE90] hover:bg-[#90EE90]" onClick={handleNext}>
                Avançar
              </Button>
            </>
          )}

          {step === 2 && (
            <>
              <InputMask mask="99.999.999/9999-99" value={watch("cnpj") || ""} onChange={(e) => handleMaskChange(e, "cnpj")}>
                {(inputProps: any) => <Input {...inputProps} placeholder="CNPJ da Empresa*" className="py-6" />}
              </InputMask>
              {errors.cnpj && <p className="text-red-500 text-sm">{errors.cnpj.message}</p>}

              <Input placeholder="Profissão*" className="py-6" {...register("profissao")} />
              {errors.profissao && <p className="text-red-500 text-sm">{errors.profissao.message}</p>}

              <Input type="url" placeholder="Link do Currículo Lattes (opcional)" className="py-6" {...register("curriculoLattes")} />
              {errors.curriculoLattes && <p className="text-red-500 text-sm">{errors.curriculoLattes.message}</p>}

              <div className="flex justify-between gap-4">
                <Button type="button" onClick={() => setStep(1)} className="w-full py-6 bg-gray-300 text-black hover:bg-gray-400">
                  Voltar
                </Button>
                <Button type="button" className="w-full py-6 font-bold bg-[#90EE90] hover:bg-[#90EE90]" onClick={handleNextAddress}>
                  Avançar
                </Button>
              </div>
            </>
          )}
          {step === 3 && (
            <>
              <InputMask mask="99999-999" value={watch("cep") || ""} onChange={handleCepChange}>
                {(props: any) => <Input {...props} placeholder="CEP*" />}
              </InputMask>
              <Input {...register("numero")} placeholder="Número*" />
              <Input {...register("logradouro")} placeholder="Logradouro*" disabled />
              <Input {...register("bairro")} placeholder="Bairro*" disabled />
              <Input {...register("cidade")} placeholder="Cidade*" disabled />
              <Input {...register("uf")} placeholder="UF*" disabled />
              <Input {...register("complemento")} placeholder="Complemento (opcional)" />
              <div className="flex justify-between gap-4">
                <Button type="button" onClick={() => setStep(1)} className="w-full py-6 bg-gray-300 text-black hover:bg-gray-400">
                  Voltar
                </Button>
                <Button type="submit" disabled={!isValid} className="w-full py-6 font-bold bg-[#90EE90] hover:bg-[#90EE90]">
                  Cadastrar
                </Button>
              </div>
            </>
          )}
        </form>

        <div className="text-center mt-6">
          <Link to="/login" className="text-sm text-[#90EE90] hover:underline">
            Já possui uma conta? Faça login
          </Link>
        </div>
      </div>
    </div>
  );
};

const PasswordRequirement = ({ isValid, text, hasValue }: { isValid: boolean, text: string, hasValue: boolean }) => {
  if (!hasValue) return <div className="text-gray-400 text-sm">{text}</div>;
  return (
    <div className={`flex items-center ${isValid ? 'text-green-500' : 'text-red-500'}`}>
      {isValid ? <Check className="h-4 w-4 mr-2" /> : <X className="h-4 w-4 mr-2" />}
      <span>{text}</span>
    </div>
  );
};

export default Cadastro;
