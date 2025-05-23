import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot
} from "@/components/ui/input-otp";
import { toast } from "@/components/ui/sonner";
import { useNavigate } from "react-router-dom";
import api from "@/lib/axios";
import axios from "axios"; // Importe axios se estiver usando axios.isAxiosError

const ValidarEmail = () => {
  const [value, setValue] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [lastSentTime, setLastSentTime] = useState<Date | null>(null);
  const [canResend, setCanResend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [validationToken, setValidationToken] = useState<string | null>(null);
  const navigate = useNavigate();

  // Obtenha o identificador do usuário. Adapte esta linha conforme onde você armazena.
  const userIdentifier = localStorage.getItem('userEmailForValidation') || 'caiogrilocunha@gmail.com';

  // Efeito para controlar tempo de reenvio (5 minutos)
  useEffect(() => {
    if (lastSentTime) {
      const timer = setTimeout(() => {
        setCanResend(true);
      }, 300000); // <-- ALTERADO: 300000 milissegundos = 5 minutos

      return () => clearTimeout(timer);
    }
  }, [lastSentTime]);

  // --- Função para enviar o código ---
  const sendVerificationCode = async () => {
    if (!userIdentifier) {
      toast.error("Erro: Identificador do usuário não encontrado. Por favor, refaça o login.");
      navigate('/login');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/gestor/verify/email', {
        identificador: userIdentifier
      });

      if (response.data && response.data.token) {
        setValidationToken(response.data.token);
        setLastSentTime(new Date());
        setCanResend(false);
        setAttempts(0);
        setValue("");
        toast.success("Código de verificação enviado para o seu e-mail!");
      } else {
        toast.error("Erro ao receber o token. Tente novamente.");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessageFromApi = error.response?.data?.message;
        if (errorMessageFromApi) {
          toast.error(errorMessageFromApi);
        } else {
          toast.error("Erro ao enviar código de verificação. Por favor, tente novamente.");
        }
      } else {
        toast.error("Erro desconhecido ao enviar código.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // --- Efeito para enviar o código automaticamente ao carregar a página ---
  useEffect(() => {
    if (!validationToken) {
      sendVerificationCode();
    }
  }, []);

  const handleValidate = async () => {
    if (value.length < 6) {
      toast.error("Por favor, insira o código completo de 6 dígitos.");
      return;
    }

    if (!validationToken) {
      toast.error("Erro: Token de validação não encontrado. Por favor, solicite um novo código.");
      return;
    }

    if (attempts >= 3) {
      toast.error("Limite de tentativas excedido. Por favor, solicite um novo código.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/gestor/auth/email', {
        token: validationToken,
        codigo: value
      });

      if (response.status === 200) {
        toast.success("E-mail validado com sucesso!");
        setValue("");
        setAttempts(0);
        navigate('/verificacao-sms');
      } else {
        setAttempts(prev => prev + 1);
        const remainingAttempts = 3 - attempts - 1;
        toast.error(`Código inválido. ${remainingAttempts > 0 ? `Tentativas restantes: ${remainingAttempts}` : 'Solicite um novo código.'}`);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessageFromApi = error.response?.data?.message;
        if (errorMessageFromApi) {
          toast.error(errorMessageFromApi);
        } else {
          toast.error("Erro ao validar código. Por favor, tente novamente.");
        }
      } else {
        toast.error("Erro desconhecido ao validar código.");
      }
      setAttempts(prev => prev + 1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = () => {
    if (!canResend && lastSentTime) {
      // Cálculo do tempo restante em segundos
      const timeLeft = Math.ceil((300000 - (Date.now() - lastSentTime.getTime())) / 1000);
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      toast.info(`Aguarde ${minutes > 0 ? `${minutes} minuto(s) e ` : ''}${seconds} segundo(s) para reenviar o código`);
      return;
    }
    sendVerificationCode();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="w-full max-w-md border-[3px] border-[#90EE90] rounded-lg p-8 flex flex-col items-center">
        <div className="bg-gray-200 w-24 h-12 mb-6 flex items-center justify-center" aria-hidden="true">
          {/* Logo placeholder */}
        </div>

        <h1 className="text-2xl font-semibold mb-2 text-center">Valide seu e-mail</h1>
        <p className="text-gray-500 text-sm mb-6 text-center">
          Enviamos um código para o seu e-mail
          <br />
        </p>

        <div className="mb-6 w-full flex justify-center">
          <InputOTP
            maxLength={6}
            value={value}
            onChange={setValue}
            className="[&>div>div]:gap-5"
            aria-label="Código de verificação de e-mail"
          >
            <InputOTPGroup>
              {[0, 1, 2, 3, 4, 5].map((index) => (
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
            disabled={isLoading || (!canResend && !!lastSentTime)}
            aria-label="Reenviar código de verificação"
          >
            {isLoading && !canResend ? "Enviando..." : (canResend ? "Reenviar código" : "Aguarde 5 min para reenviar")}
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
          disabled={isLoading || value.length < 6 || attempts >= 3}
          aria-label="Validar código de e-mail"
        >
          {isLoading ? "Validando..." : "Validar E-mail"}
        </Button>

        <div className="flex justify-center mt-4 space-x-2">
          <div className="w-2 h-2 rounded-full bg-[#90EE90]"></div>
          <div className="w-2 h-2 rounded-full bg-gray-300"></div>
        </div>
      </div>
    </div>
  );
};

export default ValidarEmail;