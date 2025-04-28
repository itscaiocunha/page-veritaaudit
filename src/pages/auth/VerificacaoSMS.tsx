import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  InputOTP,
  InputOTPGroup,
  InputOTPSlot 
} from "@/components/ui/input-otp";
import { toast } from "@/components/ui/sonner";
import { useNavigate } from "react-router-dom";

// Mock da API - Remova quando a API real estiver disponível
const mockApi = {
  sendSMSCode: async () => {
    // Simula delay de rede
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true };
  },
  
  verifySMSCode: async (code: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock de validação - código "5678" é considerado válido
    if (code === "5678") {
      return { valid: true };
    } else {
      return { valid: false, error: "Código inválido" };
    }
  }
};

const ValidarSMS = () => {
  const [value, setValue] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [lastSentTime, setLastSentTime] = useState<Date | null>(null);
  const [canResend, setCanResend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  // Efeito para controlar tempo de reenvio (1 minuto)
  useEffect(() => {
    if (lastSentTime) {
      const timer = setTimeout(() => {
        setCanResend(true);
      }, 60000);
      
      return () => clearTimeout(timer);
    }
  }, [lastSentTime]);

  // Envia o código inicial quando o componente montar
  useEffect(() => {
    handleResendCode();
  }, []);

  const handleValidate = async () => {
    if (value.length < 4) {
      toast.error("Por favor, insira o código completo de 4 dígitos.");
      return;
    }

    if (attempts >= 3) {
      toast.error("Limite de tentativas excedido. Por favor, solicite um novo código.");
      return;
    }

    setIsLoading(true);
    
    try {
      // Substitua esta chamada pela API real quando disponível
      // const response = await axios.post('/api/gestores/confirm-mfa', {...});
      const response = await mockApi.verifySMSCode(value);
      
      if (response.valid) {
        toast.success("Número validado com sucesso!");
        setValue("");
        navigate('/cadastro-concluido');
      } else {
        setAttempts(prev => prev + 1);
        const remainingAttempts = 3 - attempts - 1;
        toast.error(`Código inválido. ${remainingAttempts > 0 ? `Tentativas restantes: ${remainingAttempts}` : 'Solicite um novo código.'}`);
      }
    } catch (error) {
      toast.error("Erro ao validar código. Por favor, tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!canResend && lastSentTime) {
      const timeLeft = Math.ceil((60000 - (Date.now() - lastSentTime.getTime())) / 1000);
      toast.info(`Aguarde ${timeLeft} segundos para reenviar o código`);
      return;
    }

    setIsLoading(true);
    
    try {
      // Substitua esta chamada pela API real quando disponível
      // await axios.post('/api/gestores/verify/sms');
      await mockApi.sendSMSCode();
      
      setLastSentTime(new Date());
      setCanResend(false);
      setAttempts(0);
      setValue("");
    } catch (error) {
      toast.error("Erro ao enviar novo código. Por favor, tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="w-full max-w-md border-[3px] border-[#90EE90] rounded-lg p-8 flex flex-col items-center">
        <div className="bg-gray-200 w-24 h-12 mb-6 flex items-center justify-center" aria-hidden="true">
          {/* Logo placeholder */}
        </div>
        
        <h1 className="text-2xl font-semibold mb-2 text-center">Valide seu número</h1>
        <p className="text-gray-500 text-sm mb-6 text-center">
          Enviamos um SMS para o seu telefone
          <br />
        </p>
        
        <div className="mb-6 w-full flex justify-center">
          <InputOTP 
            maxLength={4}
            value={value} 
            onChange={(value) => {
              setValue(value);
              if (attempts > 0) setAttempts(0);
            }}
            className="[&>div>div]:gap-5"
            aria-label="Código de verificação por SMS"
          >
            <InputOTPGroup>
              {[0, 1, 2, 3].map((index) => (
                <InputOTPSlot 
                  key={index}
                  index={index} 
                  className="border border-[#90EE90] rounded-md h-14 w-14 text-lg focus:border-[#90EE90] focus:outline-none" 
                />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>
        
        <p className="text-sm text-gray-500 mb-6">
          Não recebeu o código?{" "}
          <button 
            onClick={handleResendCode}
            className="text-black font-bold hover:underline disabled:opacity-50"
            disabled={!canResend && !!lastSentTime}
            aria-label="Reenviar código de verificação"
          >
            {canResend ? "Reenviar código" : "Aguarde para reenviar"}
          </button>
        </p>
    
        {attempts > 0 && (
          <p className="text-sm text-red-500 mb-4">
            Código incorreto!
          </p>
        )}
        
        <Button 
          className="w-300px bg-[#90EE90] hover:bg-[#90EE90] text-white disabled:opacity-50"
          onClick={handleValidate}
          disabled={isLoading || value.length < 4 || attempts >= 3}
          aria-label="Validar código de SMS"
        >
          {isLoading ? "Validando..." : "Validar Telefone"}
        </Button>
        
        <div className="flex justify-center mt-4 space-x-2">
          <div className="w-2 h-2 rounded-full bg-[#90EE90]"></div>
          <div className="w-2 h-2 rounded-full bg-[#90EE90]"></div>
        </div>
      </div>
    </div>
  );
};

export default ValidarSMS;