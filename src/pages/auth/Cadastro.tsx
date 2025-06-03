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
import api from "@/lib/axios"; // Certifique-se de que esta instância do axios está configurada corretamente
import { toast } from "react-toastify";

// Schema de validação
const schema = yup.object({
  foto: yup.string().required("Foto é obrigatíorio"),
  nome: yup.string().required("Nome completo é obrigatório"),
  cpf: yup.string().required("CPF é obrigatório").matches(/^[0-9]{3}\.[0-9]{3}\.[0-9]{3}-[0-9]{2}$/, "CPF inválido"),
  telefone: yup.string().required("Telefone é obrigatório").matches(/^\(\d{2}\) \d{5}-\d{4}$/, "Telefone inválido"),
  emailPrincipal: yup.string().email("E-mail principal inválido").required("E-mail principal é obrigatório"),
  emailSecundario: yup.string().email("E-mail secundário inválido").notRequired(),
  password: yup.string().required("Senha é obrigatória").min(8, "Mínimo de 8 caracteres").matches(/[A-Z]/, "Pelo menos 1 letra maiúscula").matches(/[a-z]/, "Pelo menos 1 letra minúscula").matches(/[0-9]/, "Pelo menos 1 número").matches(/[!@#$%^&*(),.?":{}|<>]/, "Pelo menos 1 caractere especial"),
  cnpj: yup.string().required("CNPJ da Empresa é obrigatório").matches(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, "CNPJ inválido"),
  tipoEmpresa: yup.string().required("Escolha um tipo de empresa"),
  profissao: yup.string().required("Profissão é obrigatória"),
  curriculoLattes: yup.string().url("Informe uma URL válida para o currículo Lattes").notRequired(),
  linkedin: yup.string().url("Informe uma URL válida para o LinkedIn").notRequired(),
  cep: yup.string().required("CEP é obrigatório").matches(/^\d{5}-\d{3}$/, "CEP inválido"),
  numero: yup.string().required("Número é obrigatório"),
  logradouro: yup.string().required("Logradouro é obrigatório"),
  bairro: yup.string().required("Bairro é obrigatório"),
  cidade: yup.string().required("Cidade é obrigatória"),
  uf: yup.string().required("UF é obrigatória"),
  complemento: yup.string().notRequired(),
  razaoSocial: yup.string().notRequired(),
  relacaoEmpresa: yup.string().notRequired(),
});

type FormData = yup.InferType<typeof schema>;

const Cadastro = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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

  // Função para lidar com mudanças em campos mascarados
  const handleMaskChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof FormData) => {
    setValue(field, e.target.value, { shouldValidate: true });
  };

  // Avançar para o próximo passo (dados pessoais)
  const handleNext = async () => {
    const valid = await trigger(["foto", "nome", "cpf", "telefone", "emailPrincipal", "emailSecundario", "password"]);
    if (valid) setStep(2);
  };

  // Avançar para o próximo passo (dados de endereço)
  const handleNextAddress = async () => {
    const valid = await trigger(["cnpj", "tipoEmpresa", "profissao", "curriculoLattes", "linkedin", "razaoSocial", "relacaoEmpresa"]);
    if (valid) setStep(3);
  };

  // Função de submissão do formulário
  // Função de submissão do formulário
const onSubmit = async (data: FormData) => {
  try {
    const formData = new FormData();

    const dadosParaEnviar = {
      nome: data.nome,
      cpf: data.cpf.replace(/\D/g, ''),
      celular: data.telefone.replace(/\D/g, ''),
      emailPrincipal: data.emailPrincipal,
      emailSecundario: data.emailSecundario || undefined,
      senha: data.password,
      profissao: data.profissao,
      linkLinkedin: data.linkedin || undefined,
      curriculoLattes: data.curriculoLattes || undefined,
      endereco: {
        cep: data.cep.replace(/\D/g, ''),
        rua: data.logradouro,
        bairro: data.bairro,
        numeral: parseInt(data.numero, 10),
        complemento: data.complemento || undefined,
        uf: data.uf,
        cidade: data.cidade,
      },
      empresa: {
        cnpj: data.cnpj.replace(/\D/g, ''),
        razaoSocial: data.razaoSocial || "Não Informado",
        tipoEmpresa: data.tipoEmpresa,
        relacaoEmpresa: data.relacaoEmpresa || "Não Informado"
      }
    };

    const jsonBlob = new Blob([JSON.stringify(dadosParaEnviar)], { type: 'application/json' });
    formData.append('data', jsonBlob);

    if (selectedFile) {
      formData.append('foto', selectedFile, selectedFile.name);
      console.log("File type being sent:", selectedFile.type);
      if (!selectedFile.type.startsWith('image/')) {
        toast.error("O arquivo selecionado não é uma imagem válida.");
        return;
      }
    } else {
      toast.error("Por favor, selecione uma foto de perfil.");
      return;
    }

    // --- Debugging FormData content (Corrected) ---
    console.log("Conteúdo do campo 'data' (objeto antes de stringify):", dadosParaEnviar);
    console.log("Início do log do FormData:");
    for (const [key, entryValue] of formData.entries()) {
      const value = entryValue as unknown; // Cast to unknown to allow broader type checks

      if (value instanceof File) {
        // File is a specific type of Blob, check first
        console.log(`${key}: File (name: ${value.name}, type: ${value.type}, size: ${value.size} bytes)`);
      } else if (value instanceof Blob) {
        // Catches other Blobs (like our jsonBlob)
        console.log(`${key}: Blob (type: ${value.type}, size: ${value.size} bytes)`);
      } else if (typeof value === 'string') {
        console.log(`${key}: ${value}`);
      } else {
        // Should not happen with standard FormData values
        console.log(`${key}: Unexpected type of value - ${typeof value}`, value);
      }
    }
    console.log("Fim do log do FormData.");
    // --- Fim do Debugging FormData content ---

    const response = await api.post('/gestor', formData);

    if (response.status === 200 || response.status === 201) {
      toast.success("Cadastrado com sucesso!");
      reset();
      setSelectedFile(null);
      localStorage.setItem('userEmail', response.data.emailPrincipal || data.emailPrincipal);
      localStorage.setItem('userTelefone', response.data.telefone || response.data.celular || data.telefone.replace(/\D/g, ''));
      setTimeout(() => navigate('/verificacao-email'), 2000);
    } else {
      toast.info("Cadastro realizado, mas com um status inesperado. Verifique.");
    }

  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessageFromApi = error.response?.data?.message || 'Erro ao processar sua solicitação.';
      const detailedError = error.response?.data?.error || errorMessageFromApi;
      toast.error(detailedError);
      console.error("Erro no cadastro (API):", {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers,
        message: error.message,
      });
    } else {
      toast.error("Erro desconhecido ao cadastrar. Por favor, tente novamente.");
      console.error("Erro desconhecido no cadastro:", error);
    }
  }
};

  // Função para buscar endereço pelo CEP
  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawCep = e.target.value.replace(/\D/g, "");
    setValue("cep", e.target.value, { shouldValidate: true });

    if (rawCep.length === 8) {
      try {
        const res = await axios.get(`https://viacep.com.br/ws/${rawCep}/json/`);
        if (res.data.erro) {
          toast.error("CEP não encontrado");
          setValue("logradouro", "");
          setValue("bairro", "");
          setValue("cidade", "");
          setValue("uf", "");
          setValue("complemento", "");
          return;
        }
        setValue("logradouro", res.data.logradouro || "CEP ÚNICO", { shouldValidate: true });
        setValue("bairro", res.data.bairro || "CEP ÚNICO", { shouldValidate: true });
        setValue("cidade", res.data.localidade || "", { shouldValidate: true });
        setValue("uf", res.data.uf || "", { shouldValidate: true });
        setValue("complemento", res.data.complemento || "", { shouldValidate: true });
      } catch (error) {
        toast.error("Erro ao buscar o CEP. Verifique sua conexão.");
        console.error("Erro ViaCEP:", error);
      }
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Imagem de registro para telas pequenas */}
      <div className="md:hidden w-full flex justify-center pt-8 bg-white">
        <img src="/images/register.png" alt="Cadastro" className="object-contain h-48" />
      </div>

      {/* Imagem de registro para telas médias e grandes */}
      <div className="w-1/2 hidden md:flex justify-center items-center" style={{ background: "linear-gradient(to bottom right, #90EE90 50%, white 50%)" }}>
        <img src="/images/register.png" alt="Cadastro" className="max-h-[80vh] w-auto object-contain" />
      </div>

      {/* Formulário de Cadastro */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-4 md:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md space-y-6">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">CADASTRO</h1>

          {/* Passo 1: Dados Pessoais */}
          {step === 1 && (
            <>
              <div className="flex flex-col items-center mb-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setSelectedFile(file); // Armazena o objeto File real
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setValue("foto", reader.result as string, { shouldValidate: true }); // Para preview e validação do yup
                      };
                      reader.readAsDataURL(file);
                    } else {
                      setSelectedFile(null);
                      setValue("foto", "", { shouldValidate: true });
                    }
                  }}
                  className="hidden"
                  id="foto-upload"
                />
                <label htmlFor="foto-upload" className="cursor-pointer">
                  <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden shadow-md hover:ring-2 hover:ring-[#90EE90] transition">
                    {watch("foto") ? (
                      <img src={watch("foto")} alt="Preview" className="object-cover w-full h-full" />
                    ) : (
                      <span className="text-gray-500 text-sm">Foto</span>
                    )}
                  </div>
                </label>
                {errors.foto && <p className="text-red-500 text-sm mt-2">{errors.foto.message}</p>}
              </div>
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

          {/* Passo 2: Dados da Empresa e Profissão */}
          {step === 2 && (
            <>
              <InputMask mask="99.999.999/9999-99" value={watch("cnpj") || ""} onChange={(e) => handleMaskChange(e, "cnpj")}>
                {(inputProps: any) => <Input {...inputProps} placeholder="CNPJ da Empresa*" className="py-6" />}
              </InputMask>
              {errors.cnpj && <p className="text-red-500 text-sm">{errors.cnpj.message}</p>}

              <Input placeholder="Razão Social (opcional)" className="py-6" {...register("razaoSocial")} />
              {errors.razaoSocial && <p className="text-red-500 text-sm">{errors.razaoSocial.message}</p>}

              <div className="mb-4">
                <select
                  {...register("tipoEmpresa")}
                  className="w-full py-4 px-4 rounded-md border border-gray-300 bg-white text-gray-700 shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#90EE90] focus:border-transparent"
                  defaultValue=""
                >
                  <option value="" disabled>Tipo de Empresa*</option>
                  <option value="PATROCINADORA">Patrocinadora</option>
                  <option value="CENTRO_DE_PESQUISA_OPERACIONAL">CPO (Centro de Pesquisa Operacional)</option>
                  <option value="LABORATORIO">Laboratório</option>
                </select>
                {errors.tipoEmpresa && <p className="text-red-500 text-sm mt-1">{errors.tipoEmpresa.message}</p>}
              </div>

              <div className="mb-4">
                <select
                  {...register("relacaoEmpresa")}
                  className="w-full py-4 px-4 rounded-md border border-gray-300 bg-white text-gray-700 shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#90EE90] focus:border-transparent"
                  defaultValue=""
                >
                  <option value="" disabled>Relação com a Empresa (opcional)</option>
                  <option value="MATRIZ">Matriz</option>
                  <option value="FILIAL">Filial</option>
                </select>
                {errors.relacaoEmpresa && <p className="text-red-500 text-sm mt-1">{errors.relacaoEmpresa.message}</p>}
              </div>

              <Input placeholder="Profissão*" className="py-6" {...register("profissao")} />
              {errors.profissao && <p className="text-red-500 text-sm">{errors.profissao.message}</p>}

              <Input
                type="url"
                placeholder="Link do Currículo Lattes (opcional)"
                className="py-6"
                {...register("curriculoLattes")}
              />
              {errors.curriculoLattes && <p className="text-red-500 text-sm">{errors.curriculoLattes.message}</p>}

              <Input
                type="url"
                placeholder="Link do LinkedIn (opcional)"
                className="py-6"
                {...register("linkedin")}
              />
              {errors.linkedin && <p className="text-red-500 text-sm">{errors.linkedin.message}</p>}

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

          {/* Passo 3: Endereço */}
          {step === 3 && (
            <>
              <InputMask mask="99999-999" value={watch("cep") || ""} onChange={handleCepChange}>
                {(props: any) => <Input {...props} placeholder="CEP*" />}
              </InputMask>
              {errors.cep && <p className="text-red-500 text-sm">{errors.cep.message}</p>}
              <Input {...register("numero")} placeholder="Número*" />
              {errors.numero && <p className="text-red-500 text-sm">{errors.numero.message}</p>}
              <Input {...register("logradouro")} placeholder="Logradouro*" disabled />
              {errors.logradouro && <p className="text-red-500 text-sm">{errors.logradouro.message}</p>}
              <Input {...register("bairro")} placeholder="Bairro*" disabled />
              {errors.bairro && <p className="text-red-500 text-sm">{errors.bairro.message}</p>}
              <Input {...register("cidade")} placeholder="Cidade*" disabled />
              {errors.cidade && <p className="text-red-500 text-sm">{errors.cidade.message}</p>}
              <Input {...register("uf")} placeholder="UF*" disabled />
              {errors.uf && <p className="text-red-500 text-sm">{errors.uf.message}</p>}
              <Input {...register("complemento")} placeholder="Complemento (opcional)" />
              {errors.complemento && <p className="text-red-500 text-sm">{errors.complemento.message}</p>}

              <div className="flex justify-between gap-4">
                <Button type="button" onClick={() => setStep(2)} className="w-full py-6 bg-gray-300 text-black hover:bg-gray-400">
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

// Componente para exibir requisitos de senha
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
