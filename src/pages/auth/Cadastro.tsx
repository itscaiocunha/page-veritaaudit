import { useState, useRef, useEffect } from "react";
import { Eye, EyeOff, Check, X, Camera, Upload } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import { toast } from "react-toastify";
import InputMask from "react-input-mask";
import api from '@/lib/axios';

// Validação (sem alterações)
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

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPictureTaken: (file: File) => void;
}

interface PasswordRequirementProps {
  isValid: boolean;
  text: string;
  hasValue: boolean;
}

// Componente do Modal da Câmera (integrado e com tipos)
const CameraModal = ({ isOpen, onClose, onPictureTaken }: CameraModalProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startAndSetupCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err: any) {
        console.error("Erro ao acessar a câmera: ", err);
        let errorMessage = "Não foi possível acessar a câmera.";
        if (err.name === "NotAllowedError") {
            errorMessage = "Você negou a permissão da câmera. Habilite nas configurações do navegador.";
        } else if (err.name === "NotFoundError") {
            errorMessage = "Nenhuma câmera foi encontrada no seu dispositivo.";
        }
        
        setError(errorMessage);
        toast.error(errorMessage);
      }
    };

    if (isOpen) {
      setError(null);
      startAndSetupCamera();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context?.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(blob => {
        if (blob) {
          const pictureFile = new File([blob], "webcam-photo.jpg", { type: "image/jpeg" });
          onPictureTaken(pictureFile);
          onClose();
        }
      }, 'image/jpeg');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-[9999]">
      <div className="bg-white p-6 rounded-lg shadow-xl text-center w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">Tirar Foto</h2>
        <div className="relative bg-gray-200 rounded overflow-hidden">
            {error ? (
                <div className="flex items-center justify-center h-64 text-red-500 font-semibold px-4">{error}</div>
            ) : (
                <video ref={videoRef} autoPlay playsInline className="w-full h-auto" />
            )}
        </div>
        <canvas ref={canvasRef} className="hidden" />
        <div className="mt-4 flex justify-center gap-4">
          <Button onClick={handleCapture} className="bg-green-500 hover:bg-green-600" disabled={!!error}>Capturar</Button>
          <Button onClick={onClose} variant="outline">Cancelar</Button>
        </div>
      </div>
    </div>
  );
};

// Componente Principal de Cadastro
const Cadastro = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isCameraOpen, setCameraOpen] = useState(false);

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
    const valid = await trigger(["foto", "nome", "cpf", "telefone", "emailPrincipal", "emailSecundario", "password"]);
    if (valid) setStep(2);
  };

  const handleNextAddress = async () => {
    const valid = await trigger(["cnpj", "tipoEmpresa", "profissao", "razaoSocial", "relacaoEmpresa"]);
    if (valid) setStep(3);
  };

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
      } else {
        toast.error("Por favor, selecione uma foto de perfil.");
        return;
      }
      const response = await api.post('/gestor', formData);
      if (response.status === 200 || response.status === 201) {
        toast.success("Cadastrado com sucesso!");
        reset();
        setSelectedFile(null);
        localStorage.setItem('userEmail', response.data.emailPrincipal || data.emailPrincipal);
        localStorage.setItem('userTelefone', response.data.telefone || response.data.celular || data.telefone.replace(/\D/g, ''));
        setTimeout(() => navigate('/verificacao-email'), 2000);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const detailedError = error.response?.data?.error || 'Erro ao processar sua solicitação.';
        toast.error(detailedError);
      } else {
        toast.error("Erro desconhecido ao cadastrar. Tente novamente.");
      }
    }
  };

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawCep = e.target.value.replace(/\D/g, "");
    setValue("cep", e.target.value, { shouldValidate: true });
    if (rawCep.length === 8) {
      try {
        const res = await axios.get(`https://viacep.com.br/ws/${rawCep}/json/`);
        if (res.data.erro) {
          toast.error("CEP não encontrado");
        } else {
          setValue("logradouro", res.data.logradouro || "CEP ÚNICO", { shouldValidate: true });
          setValue("bairro", res.data.bairro || "CEP ÚNICO", { shouldValidate: true });
          setValue("cidade", res.data.localidade || "", { shouldValidate: true });
          setValue("uf", res.data.uf || "", { shouldValidate: true });
          setValue("complemento", res.data.complemento || "", { shouldValidate: true });
        }
      } catch (error) {
        toast.error("Erro ao buscar o CEP. Verifique sua conexão.");
      }
    }
  }

  const handleFileSelect = (file: File | null | undefined) => {
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setValue("foto", reader.result as string, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedFile(null);
      setValue("foto", "", { shouldValidate: true });
    }
  };

  return (
    <>
      <div className="min-h-screen flex flex-col md:flex-row">
        <div className="w-1/2 hidden md:flex justify-center items-center" style={{ background: "linear-gradient(to bottom right, #90EE90 50%, white 50%)" }}>
          <img src="/images/register.png" alt="Cadastro" className="max-h-[80vh] w-auto object-contain" />
        </div>
        <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-4 md:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md space-y-6">
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">CADASTRO</h1>
            {step === 1 && (
              <>
                <div className="flex flex-col items-center mb-4">
                  <input type="file" accept="image/*" onChange={(e) => handleFileSelect(e.target.files?.[0])} className="hidden" id="foto-upload" />
                  <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden shadow-md mb-4">
                    {watch("foto") ? <img src={watch("foto")} alt="Preview" className="object-cover w-full h-full" /> : <span className="text-gray-500 text-sm text-center">Foto de Perfil</span>}
                  </div>
                  <div className="flex gap-4">
                    <Button type="button" onClick={() => setCameraOpen(true)}><Camera className="h-4 w-4 mr-2" /> Usar Webcam</Button>
                    <label htmlFor="foto-upload" className="cursor-pointer">
                      <Button type="button" asChild><span><Upload className="h-4 w-4 mr-2" /> Escolher Arquivo</span></Button>
                    </label>
                  </div>
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
                <Button type="button" className="w-full py-6 font-bold bg-[#90EE90] hover:bg-[#90EE90]" onClick={handleNext}>Avançar</Button>
              </>
            )}
            {step === 2 && (
              <>
                <Input placeholder="CNPJ da Empresa* (formato: 99.999.999/9999-99)" className="py-6" {...register("cnpj")} />
                {errors.cnpj && <p className="text-red-500 text-sm">{errors.cnpj.message}</p>}
                <Input placeholder="Razão Social (opcional)" className="py-6" {...register("razaoSocial")} />
                {errors.razaoSocial && <p className="text-red-500 text-sm">{errors.razaoSocial.message}</p>}
                <div className="mb-4">
                  <select {...register("tipoEmpresa")} className="w-full py-4 px-4 rounded-md border border-gray-300 bg-white text-gray-700 shadow-sm" defaultValue="">
                    <option value="" disabled>Tipo de Empresa*</option>
                    <option value="PATROCINADORA">Patrocinadora</option>
                    <option value="CENTRO_DE_PESQUISA_OPERACIONAL">CPO</option>
                    <option value="LABORATORIO">Laboratório</option>
                  </select>
                  {errors.tipoEmpresa && <p className="text-red-500 text-sm mt-1">{errors.tipoEmpresa.message}</p>}
                </div>
                <div className="mb-4">
                  <select {...register("relacaoEmpresa")} className="w-full py-4 px-4 rounded-md border border-gray-300 bg-white text-gray-700 shadow-sm" defaultValue="">
                     <option value="" disabled>Relação com a Empresa (opcional)</option>
                     <option value="MATRIZ">Matriz</option>
                     <option value="FILIAL">Filial</option>
                  </select>
                  {errors.relacaoEmpresa && <p className="text-red-500 text-sm mt-1">{errors.relacaoEmpresa.message}</p>}
                </div>
                <Input placeholder="Profissão*" className="py-6" {...register("profissao")} />
                {errors.profissao && <p className="text-red-500 text-sm">{errors.profissao.message}</p>}
                <div className="flex justify-between gap-4">
                  <Button type="button" onClick={() => setStep(1)} className="w-full py-6 bg-gray-300 text-black hover:bg-gray-400">Voltar</Button>
                  <Button type="button" className="w-full py-6 font-bold bg-[#90EE90] hover:bg-[#90EE90]" onClick={handleNextAddress}>Avançar</Button>
                </div>
              </>
            )}
            {step === 3 && (
              <>
                <Input placeholder="CEP* (formato: 99999-999)" {...register("cep")} onChange={handleCepChange} />
                {errors.cep && <p className="text-red-500 text-sm">{errors.cep.message}</p>}
                <Input {...register("numero")} placeholder="Número*" />
                {errors.numero && <p className="text-red-500 text-sm">{errors.numero.message}</p>}
                <Input {...register("logradouro")} placeholder="Logradouro*" />
                {errors.logradouro && <p className="text-red-500 text-sm">{errors.logradouro.message}</p>}
                <Input {...register("bairro")} placeholder="Bairro*" />
                {errors.bairro && <p className="text-red-500 text-sm">{errors.bairro.message}</p>}
                <Input {...register("cidade")} placeholder="Cidade*" disabled />
                {errors.cidade && <p className="text-red-500 text-sm">{errors.cidade.message}</p>}
                <Input {...register("uf")} placeholder="UF*" disabled />
                {errors.uf && <p className="text-red-500 text-sm">{errors.uf.message}</p>}
                <Input {...register("complemento")} placeholder="Complemento (opcional)" />
                {errors.complemento && <p className="text-red-500 text-sm">{errors.complemento.message}</p>}
                <div className="flex justify-between gap-4">
                  <Button type="button" onClick={() => setStep(2)} className="w-full py-6 bg-gray-300 text-black hover:bg-gray-400">Voltar</Button>
                  <Button type="submit" disabled={!isValid} className="w-full py-6 font-bold bg-[#90EE90] hover:bg-[#90EE90]">Cadastrar</Button>
                </div>
              </>
            )}
          </form>
          <div className="text-center mt-6">
            <Link to="/login" className="text-sm text-[#90EE90] hover:underline">Já possui uma conta? Faça login</Link>
          </div>
        </div>
      </div>
      <CameraModal isOpen={isCameraOpen} onClose={() => setCameraOpen(false)} onPictureTaken={handleFileSelect} />
    </>
  );
};

const PasswordRequirement = ({ isValid, text, hasValue }: PasswordRequirementProps) => {
  if (!hasValue) return <div className="text-gray-400 text-sm">{text}</div>;
  return (
    <div className={`flex items-center ${isValid ? 'text-green-500' : 'text-red-500'}`}>
      {isValid ? <Check className="h-4 w-4 mr-2" /> : <X className="h-4 w-4 mr-2" />}
      <span>{text}</span>
    </div>
  );
};

export default Cadastro;