import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

// --- Schema de Validação para a seção 8 ---
const validationSchema = yup.object({
  definicao: yup.string().required("Este campo é obrigatório."),
  classificacao: yup.string().required("Este campo é obrigatório."),
  gravidadeEA: yup.string().required("Este campo é obrigatório."),
  intensidadeEA: yup.string().required("Este campo é obrigatório."),
  relacaoEATerapia: yup.string().required("Este campo é obrigatório."),
  expectativa: yup.string().required("Este campo é obrigatório."),
  desfechoEA: yup.string().required("Este campo é obrigatório."),
  registroNotificacaoEA: yup.string().required("Este campo é obrigatório."),
});

type FormValues = yup.InferType<typeof validationSchema>;

const FormularioEventoAdverso = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormValues>({
    resolver: yupResolver(validationSchema),
  });

  useEffect(() => {
    // Carrega os dados salvos do localStorage ao iniciar
    const savedData = JSON.parse(localStorage.getItem("dadosEventoAdverso") || "null");
    if (savedData) {
      reset(savedData);
    }
  }, [reset]);

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    console.log(data);
    try {
      // Salva os dados no localStorage
      localStorage.setItem("dadosEventoAdverso", JSON.stringify(data));
    } catch (error) {
      console.error("Erro ao salvar os dados:", error);
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsSubmitting(false);
    navigate("/eutanasia"); 
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-8 px-4 bg-gray-50 font-inter">
      <h1 className="text-4xl font-bold mb-8">VERITA AUDIT</h1>
      <div className="w-full max-w-4xl rounded-lg p-8 bg-white shadow-md">
        <h2 className="text-2xl font-semibold text-center mb-6">8. EVENTO ADVERSO</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          
          {/* Mapeamento dos campos da seção de Evento Adverso */}
          {[
            { id: "definicao", label: "8.1 Definição" },
            { id: "classificacao", label: "8.2 Classificação" },
            { id: "gravidadeEA", label: "8.3 Gravidade do EA" },
            { id: "intensidadeEA", label: "8.4 Intensidade do EA" },
            { id: "relacaoEATerapia", label: "8.5 Relação do EA com a terapia" },
            { id: "expectativa", label: "8.6 Expectativa" },
            { id: "desfechoEA", label: "8.7 Desfecho do EA" },
            { id: "registroNotificacaoEA", label: "8.8 Registro e notificação do EA" },
          ].map(field => (
            <div key={field.id}>
              <Label htmlFor={field.id} className="text-base font-semibold">{field.label}</Label>
              <Textarea
                id={field.id}
                {...register(field.id as keyof FormValues)}
                className="min-h-[120px] mt-2"
              />
              <p className="text-red-500 text-sm mt-1">{errors[field.id as keyof FormValues]?.message}</p>
            </div>
          ))}

          {/* Botão de Submissão */}
          <div className="flex justify-end pt-6 border-t">
            <Button
              type="submit"
              className="bg-[#90EE90] hover:bg-[#7CCD7C] text-black font-bold px-8 py-3 text-lg h-auto rounded-md"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Salvando..." : "Salvar e Avançar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormularioEventoAdverso;