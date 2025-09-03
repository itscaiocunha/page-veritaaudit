import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "@/components/ui/sonner";
import { useNavigate } from "react-router-dom";
import { Mail, Phone } from "lucide-react";

// Dados fictícios do usuário
const USER_EMAIL = "usuario@exemplo.com";
const USER_PHONE = "(11) 91234-5678";

const Validacao = () => {
  const [deliveryMethod, setDeliveryMethod] = useState<"email" | "sms" | null>(null);
  const [codeSent, setCodeSent] = useState(false);
  const [value, setValue] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [lastSentTime, setLastSentTime] = useState<Date | null>(null);
  const [canResend, setCanResend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (lastSentTime) {
      const timer = setTimeout(() => setCanResend(true), 60000);
      return () => clearTimeout(timer);
    }
  }, [lastSentTime]);

  useEffect(() => {
    if (deliveryMethod) {
      handleSendCode();
    }
  }, [deliveryMethod]);

  const handleSendCode = async () => {
    setIsLoading(true);
    try {
      // Simulação do envio do código
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 🔧 Quando tiver a API real, substitua pelo:
      // await axios.post("/api/send-code", {
      //   method: deliveryMethod,
      //   to: deliveryMethod === "email" ? USER_EMAIL : USER_PHONE,
      // });

      setCodeSent(true);
      setLastSentTime(new Date());
      setCanResend(false);
      setAttempts(0);
      setValue("");
      toast.success(`Código enviado via ${deliveryMethod === "email" ? "E-mail" : "SMS"}.`);
    } catch {
      toast.error("Erro ao enviar código. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidate = async () => {
    if (value.length < 6) {
      toast.error("Insira os 6 dígitos do código.");
      return;
    }
    if (attempts >= 3) {
      toast.error("Limite de tentativas excedido. Solicite um novo código.");
      return;
    }

    setIsLoading(true);
    try {
      // Simulação da verificação do código
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockValid = value === "123456";

      // 🔧 Quando tiver a API real, substitua pelo:
      // const response = await axios.post("/api/verify-code", { code: value });
      // const mockValid = response.data.valid;

      if (mockValid) {
        toast.success("Código validado com sucesso!");
        navigate("/dashboard");
      } else {
        setAttempts(prev => prev + 1);
        const remaining = 2 - attempts;
        toast.error(`Código inválido. ${remaining >= 0 ? `Tentativas restantes: ${remaining}` : 'Solicite um novo código.'}`);
      }
    } catch {
      toast.error("Erro ao validar o código.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
      <div className="w-full max-w-md border-[3px] border-[#90EE90] rounded-lg p-8 flex flex-col items-center">
        <div className="bg-gray-200 w-24 h-12 mb-6 flex items-center justify-center">
          {/* Logo */}
        </div>

        <h1 className="text-2xl font-semibold text-center mb-4">Confirme sua identidade</h1>

        {!deliveryMethod ? (
          <div className="flex gap-4 mb-6">
            <Button onClick={() => setDeliveryMethod("email")} className="flex items-center gap-2">
              <Mail size={16} /> Enviar por E-mail
            </Button>
            <Button onClick={() => setDeliveryMethod("sms")} className="flex items-center gap-2">
              <Phone size={16} /> Enviar por SMS
            </Button>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-600 text-center mb-4">
              Código enviado para:{" "}
              <strong>{deliveryMethod === "email" ? USER_EMAIL : USER_PHONE}</strong>
            </p>

            <div className="mb-4 w-full flex justify-center">
              <InputOTP
                maxLength={6}
                value={value}
                onChange={setValue}
                className="[&>div>div]:gap-4"
              >
                <InputOTPGroup>
                  {[...Array(6)].map((_, i) => (
                    <InputOTPSlot
                      key={i}
                      index={i}
                      className="border border-[#90EE90] rounded-md h-14 w-10 text-lg"
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Button
              className="w-full bg-[#90EE90] text-white disabled:opacity-50 mb-4"
              onClick={handleValidate}
              disabled={isLoading || value.length < 6 || attempts >= 3}
            >
              {isLoading ? "Validando..." : "Validar Código"}
            </Button>

            <p className="text-sm text-gray-500 mb-2 text-center">
              Não recebeu?{" "}
              <button
                onClick={handleSendCode}
                className="text-black font-bold hover:underline disabled:opacity-50"
                disabled={!canResend}
              >
                {canResend ? "Reenviar código" : "Aguarde..."}
              </button>
            </p>

            {attempts > 0 && (
              <p className="text-sm text-red-500 text-center">Código incorreto.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Validacao;
