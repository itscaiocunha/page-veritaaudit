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
  conteudoEventoAdverso: yup.string().required("Este campo é obrigatório."),
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
    navigate("/medicacao-concomitante"); 
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-8 px-4 bg-gray-50 font-inter">
      <h1 className="text-4xl font-bold mb-8">VERITA AUDIT</h1>
      <div className="w-full max-w-4xl rounded-lg p-8 bg-white shadow-md">
        <h2 className="text-2xl font-semibold text-center mb-6">8. EVENTO ADVERSO</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          
          <div>
            <Label htmlFor="conteudoEventoAdverso" className="text-base font-semibold">Conteúdo de Evento Adverso</Label>
            <Textarea
              id="conteudoEventoAdverso"
              {...register("conteudoEventoAdverso")}
              className="min-h-[250px] mt-2"
            />
            <p className="text-red-500 text-sm mt-1">{errors.conteudoEventoAdverso?.message}</p>
          </div>

          {/* Botão de Submissão */}
          <div className="flex justify-end pt-6">
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
