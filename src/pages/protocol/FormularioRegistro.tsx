import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

// --- Schema ---
const validationSchema = yup.object({
  conteudoRegistro: yup.string().required("Este campo é obrigatório."),
});

type FormValues = yup.InferType<typeof validationSchema>;

const FormularioRegistro = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormValues>({
    resolver: yupResolver(validationSchema),
    defaultValues: { conteudoRegistro: "" },
  });

  useEffect(() => {
    const savedData = JSON.parse(localStorage.getItem("dadosRegistro") || "[]");
    if (savedData.length > 0) {
      reset(savedData[savedData.length - 1]);
    }
  }, [reset]);

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const existingData = JSON.parse(localStorage.getItem("dadosRegistro") || "[]");
      existingData.push(data);
      localStorage.setItem("dadosRegistro", JSON.stringify(existingData));
    } catch (error) {
      console.error("Erro ao salvar os dados:", error);
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsSubmitting(false);
    navigate("/protocolo-final");
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-8 px-4 bg-gray-50 font-inter">
      <h1 className="text-4xl font-bold mb-8">VERITA AUDIT</h1>
      <div className="w-full max-w-4xl rounded-lg p-8 bg-white shadow-md">
        <h2 className="text-2xl font-semibold text-center mb-6">10. Registro</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <div className="flex items-center gap-2">
              <Label htmlFor="conteudoRegistro" className="text-base font-semibold">
                Conteúdo do Registro
              </Label>
            </div>

            <Textarea
              id="conteudoRegistro"
              {...register("conteudoRegistro")}
              className="min-h-[200px] mt-2"
            />
            <p className="text-red-500 text-sm mt-1">{errors.conteudoRegistro?.message}</p>
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

export default FormularioRegistro;
