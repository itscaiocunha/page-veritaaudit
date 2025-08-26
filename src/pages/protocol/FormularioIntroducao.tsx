import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

// --- Schema ---
const validationSchema = yup.object({
  conteudoIntroducao: yup.string().required("Este campo é obrigatório."),
});

type FormValues = yup.InferType<typeof validationSchema>;

// --- Texto único de instrução ---
const instrucoes = `
- Resumo de Estudos Anteriores: Resumo de dados de estudos não clínicos que potencialmente têm significado clínico e de estudos clínicos relevantes para o estudo.
- Resumo de Riscos: Resumo de riscos conhecidos e potenciais para o pessoal envolvido no estudo.
- Via de Administração e Dosagem: Descrição e justificativa da via de administração, dosagem, regime de dosagem e período(s) de tratamento.
- Descrição da Espécie Animal: Descrição da espécie animal a ser estudada, bem como características da categoria (p.ex. animais jovens) a ser avaliada.
- Referências: Citações de literatura e outros dados não científicos que possam subsidiar o estudo.
`;

const FormularioIntroducao = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormValues>({
    resolver: yupResolver(validationSchema),
    defaultValues: { conteudoIntroducao: "" },
  });

  useEffect(() => {
    const savedData = JSON.parse(localStorage.getItem("dadosIntroducao") || "[]");
    if (savedData.length > 0) {
      reset(savedData[savedData.length - 1]);
    }
  }, [reset]);

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const existingData = JSON.parse(localStorage.getItem("dadosIntroducao") || "[]");
      existingData.push(data);
      localStorage.setItem("dadosIntroducao", JSON.stringify(existingData));
    } catch (error) {
      console.error("Erro ao salvar os dados:", error);
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsSubmitting(false);
    navigate("/objetivo");
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-8 px-4 bg-gray-50 font-inter">
      <h1 className="text-4xl font-bold mb-8">VERITA AUDIT</h1>
      <div className="w-full max-w-4xl rounded-lg p-8 bg-white shadow-md">
        <h2 className="text-2xl font-semibold text-center mb-6">1. Introdução</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <div className="flex items-center gap-2">
              <Label htmlFor="conteudoIntroducao" className="text-base font-semibold">
                Conteúdo da Introdução
              </Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-4 h-4 text-gray-500 cursor-pointer" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm whitespace-pre-line">
                    {instrucoes}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <Textarea
              id="conteudoIntroducao"
              {...register("conteudoIntroducao")}
              className="min-h-[200px] mt-2"
            />
            <p className="text-red-500 text-sm mt-1">{errors.conteudoIntroducao?.message}</p>
          </div>

          <div className="flex justify-end pt-6 border-t">
            <Button
              type="submit"
              className="bg-[#90EE90] hover:bg-[#7CCD7C] text-white font-bold px-8 py-3 text-lg h-auto rounded-md"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Salvando" : "Salvar e Avançar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormularioIntroducao;
