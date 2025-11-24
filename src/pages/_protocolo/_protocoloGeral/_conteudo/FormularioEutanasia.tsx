import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Info, Loader2, ChevronLeft, AlertCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";

// --- Schema ---
const validationSchema = yup.object({
  conteudoEutanasia: yup.string().required("Este campo é obrigatório."),
});

type FormValues = yup.InferType<typeof validationSchema>;

// --- Componente de Header ---
const FormHeader = () => {
  const navigate = useNavigate();

  return (
    <header className="bg-white/30 backdrop-blur-lg shadow-sm w-full p-4 flex items-center justify-center relative border-b border-white/20">
      <Button
        onClick={() => navigate(-1)}
        variant="outline"
        size="sm"
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/50 hover:bg-white/80 text-gray-800"
      >
        <ChevronLeft className="h-5 w-5 sm:mr-1" />
        <span className="hidden sm:inline">Voltar</span>
      </Button>
      <h1 className="text-xl sm:text-2xl font-bold text-center text-gray-800">
        Verita Audit
      </h1>
    </header>
  );
};

// --- Componente Principal ---
const FormularioEutanasia = () => {
  const navigate = useNavigate();
  const { id: protocoloMestreId } = useParams<{ id: string }>();

  // --- Estados ---
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [protocoloVersaoId, setProtocoloVersaoId] = useState<number | null>(
    null
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    trigger,
    getValues,
  } = useForm<FormValues>({
    resolver: yupResolver(validationSchema),
    defaultValues: { conteudoEutanasia: "" },
  });

  // useEffect para carregar dados
  useEffect(() => {
    const storageKey = `dadosEutanasia_${protocoloMestreId || "draft"}`;

    if (!protocoloMestreId) {
      setError("ID do protocolo não encontrado. (Modo rascunho)");
      setIsDataLoading(false);
      setProtocoloVersaoId(null);
      const savedData = JSON.parse(
        localStorage.getItem(storageKey) || "[]"
      );
      if (savedData.length > 0) {
        reset(savedData[savedData.length - 1]);
      }
      return;
    }

    const fetchVersaoAtiva = async () => {
      setIsDataLoading(true);
      setError(null);
      setProtocoloVersaoId(null);

      const apiKey =
        "2NtzCUDl8Ib2arnDRck0xK8taguGeFYuZqnUzpiZ9Wp-tUZ45--/i=tKxzwTPBvtykMSx!0t?7c/Z?NllkokY=TEC2DSonmOMUu0gxdCeh70/rA2NSsm7Ohjn7VM2BeP";
      let TOKEN = sessionStorage.getItem("token");

      if (!TOKEN) {
        setError("Usuário não autenticado. Redirecionando para login...");
        setIsDataLoading(false);
        setTimeout(() => navigate("/login"), 2000);
        return;
      }
      TOKEN = TOKEN.replace(/"/g, "");

      const API_URL = `https://verita-brgchubha6ceathm.brazilsouth-01.azurewebsites.net/api/protocolo/versao/ativo/detalhes/${protocoloMestreId}`;

      try {
        const response = await fetch(API_URL, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${TOKEN}`,
            "X-API-KEY": apiKey,
          },
        });

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            throw new Error("Sessão expirada. Faça o login novamente.");
          } else if (response.status === 404) {
            console.warn("Nenhuma versão ativa encontrada (404), limpando.");
            localStorage.removeItem(storageKey);
            reset({ conteudoEutanasia: "" });
            setError("Nenhuma versão ativa encontrada para este protocolo.");
            return;
          } else {
            const errorData = await response.text();
            throw new Error(`Erro ${response.status}: ${errorData}`);
          }
        }

        const data = await response.json();
        
        // Tenta buscar o campo 'eutanasiaMortalidade'
        const conteudoApi = data.eutanasia?.conteudo;
        const versaoIdApi = data.id;

        if (versaoIdApi) {
          setProtocoloVersaoId(versaoIdApi);
        } else {
          console.warn("API não retornou um 'id' para a versão do protocolo.");
        }

        if (conteudoApi) {
          const dadosApi = { conteudoEutanasia: conteudoApi };
          localStorage.setItem(storageKey, JSON.stringify([dadosApi]));
          reset(dadosApi);
        } else {
          localStorage.removeItem(storageKey);
          reset({ conteudoEutanasia: "" });
        }
      } catch (err) {
        console.error("Erro ao carregar versão do protocolo:", err);
        setProtocoloVersaoId(null);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Ocorreu um erro desconhecido.");
        }
        // Fallback para localStorage
        const savedData = JSON.parse(
          localStorage.getItem(storageKey) || "[]"
        );
        if (savedData.length > 0) {
          reset(savedData[savedData.length - 1]);
        }
      } finally {
        setIsDataLoading(false);
      }
    };

    fetchVersaoAtiva();
  }, [protocoloMestreId, navigate, reset]);

  // --- Função: Salvar na API ---
  const handleSaveApi = async (data: FormValues) => {
    if (!protocoloVersaoId) {
      setError("Não é possível salvar, ID da versão do protocolo não encontrado.");
      throw new Error("ID da versão do protocolo não encontrado.");
    }

    const apiKey =
      "2NtzCUDl8Ib2arnDRck0xK8taguGeFYuZqnUzpiZ9Wp-tUZ45--/i=tKxzwTPBvtykMSx!0t?7c/Z?NllkokY=TEC2DSonmOMUu0gxdCeh70/rA2NSsm7Ohjn7VM2BeP";
    let TOKEN = sessionStorage.getItem("token");
    if (!TOKEN) throw new Error("Usuário não autenticado.");
    TOKEN = TOKEN.replace(/"/g, "");

    // Endpoint solicitado
    const API_URL = `https://verita-brgchubha6ceathm.brazilsouth-01.azurewebsites.net/api/protocolo/versao/eutanasia-mortalidade`;

    const body = {
      idProtocolo: protocoloVersaoId,
      conteudo: data.conteudoEutanasia,
    };

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${TOKEN}`,
          "X-API-KEY": apiKey,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        try {
          const errorData = await response.json();
          const errorMessage =
            errorData.idProtocolo || JSON.stringify(errorData);
          throw new Error(`Falha ao salvar na API: ${errorMessage}`);
        } catch (jsonError) {
          const errorText = await response.text();
          throw new Error(`Falha ao salvar na API: ${errorText}`);
        }
      }

      const responseData = await response.json();
      const novoProtocoloVersaoId = responseData.id;

      if (novoProtocoloVersaoId && typeof novoProtocoloVersaoId === "number") {
        setProtocoloVersaoId(novoProtocoloVersaoId);
        console.log(
          "Salvo na API. ID da versão atualizado para:",
          novoProtocoloVersaoId
        );
      } else {
        console.warn("API salvou, mas não retornou um novo ID na resposta.");
      }

      const storageKey = `dadosEutanasia_${protocoloMestreId}`;
      localStorage.setItem(storageKey, JSON.stringify([data]));
      setError(null);
    } catch (err) {
      console.error("Erro ao salvar dados na API:", err);
      if (err instanceof Error) {
        setError(`${err.message}`);
      } else {
        setError("Falha ao salvar na API.");
      }
      throw err;
    }
  };

  // --- Função: Salvar no LocalStorage (Fallback) ---
  const handleSaveLocalStorage = async (data: FormValues) => {
    const storageKey = `dadosEutanasia_${protocoloMestreId || "draft"}`;
    try {
      const newData = [data];
      localStorage.setItem(storageKey, JSON.stringify(newData));
      await new Promise((resolve) => setTimeout(resolve, 200));
    } catch (error) {
      console.error("Erro ao salvar dados no localStorage:", error);
      setError("Falha ao salvar dados localmente.");
      throw error;
    }
  };

  // --- Função do Botão "Salvar" ---
  const handleJustSave = async () => {
    if (!protocoloVersaoId) {
      setError("Não é possível salvar. ID do protocolo não carregado.");
      return;
    }

    setIsSaving(true);
    const isValid = await trigger();

    if (isValid) {
      const data = getValues();
      try {
        await handleSaveApi(data);
      } catch (error) {
        console.error("Falha no 'Salvar':", error);
      }
    }
    setIsSaving(false);
  };

  // --- Função "Salvar e Avançar" (Submit) ---
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      if (protocoloVersaoId) {
        await handleSaveApi(data);
      } else {
        await handleSaveLocalStorage(data);
      }

      // Navegação para a próxima rota
      if (protocoloMestreId) {
        navigate(`/cronograma/${protocoloMestreId}`);
      } else {
        navigate("/cronograma");
      }
    } catch (error) {
      console.error("Falha ao salvar e avançar:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- JSX (Render) ---
  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-br from-gray-100 to-gray-200 font-inter">
      <FormHeader />

      <main className="flex-1 flex flex-col items-center justify-center py-12 px-4">
        <div className="w-full max-w-4xl rounded-xl p-6 sm:p-8 bg-white/70 backdrop-blur-md shadow-xl border border-white/30">
          <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">
            11. Eutanásia ou Mortalidade Não Programada
          </h2>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-md border border-red-300 bg-red-50 p-4 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Label
                  htmlFor="conteudoEutanasia"
                  className="text-base font-semibold text-gray-700"
                >
                  Conteúdo da Eutanásia ou Mortalidade Não Programada
                </Label>
              </div>

              <div className="relative">
                {isDataLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm rounded-md z-10">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
                  </div>
                )}
                <Textarea
                  id="conteudoEutanasia"
                  {...register("conteudoEutanasia")}
                  className="min-h-[200px] mt-1 bg-white"
                  disabled={isDataLoading}
                />
              </div>

              <p className="text-red-500 text-sm mt-1">
                {errors.conteudoEutanasia?.message}
              </p>
            </div>

            {/* --- SEÇÃO DE BOTÕES --- */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-200">
              {/* BOTÃO VOLTAR */}
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                disabled={isSubmitting || isSaving || isDataLoading}
                className="text-gray-800 bg-white/80 hover:bg-gray-50"
              >
                Voltar
              </Button>

              <div className="flex gap-4">
                {/* BOTÃO SALVAR (API) */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleJustSave}
                  disabled={
                    !protocoloVersaoId ||
                    isDataLoading ||
                    isSubmitting ||
                    isSaving
                  }
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-6 py-3 text-lg h-auto rounded-md transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Salvando...</span>
                    </>
                  ) : (
                    "Salvar"
                  )}
                </Button>

                {/* BOTÃO SALVAR E AVANÇAR (SUBMIT) */}
                <Button
                  type="submit"
                  className="bg-[#90EE90] hover:bg-[#7CCD7C] text-green-950 font-bold px-8 py-3 text-lg h-auto rounded-md transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={isDataLoading || isSubmitting || isSaving}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Salvando...</span>
                    </>
                  ) : (
                    "Salvar e Avançar"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default FormularioEutanasia;