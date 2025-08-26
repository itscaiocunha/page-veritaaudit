import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom"; // Removido para corrigir o erro
import { useState, useEffect } from "react";

// --- Lista de Formulários Disponíveis ---
const formulariosDisponiveis = [
    { id: 'consentimento', label: 'Formulário de Consentimento Livre e Esclarecido (TCLE)' },
    { id: 'fichaClinica', label: 'Ficha Clínica Individual do Animal' },
    { id: 'eventoAdverso', label: 'Formulário de Registro de Evento Adverso' },
    { id: 'administracaoTratamento', label: 'Formulário de Administração de Tratamento' },
    { id: 'coletaAmostras', label: 'Formulário de Coleta de Amostras Biológicas' },
    { id: 'avaliacaoClinica', label: 'Formulário de Avaliação de Parâmetros Clínicos' },
    { id: 'inventarioProdutos', label: 'Formulário de Inventário de Produtos Veterinários' },
    { id: 'termoAssentimento', label: 'Termo de Assentimento Livre e Esclarecido (TALE)' },
];

// --- Schema de Validação ---
const validationSchema = yup.object({
  // Cria um objeto com chaves dinâmicas para cada formulário
  formularios: yup.object().shape(
    formulariosDisponiveis.reduce((acc, curr) => {
      acc[curr.id] = yup.boolean();
      return acc;
    }, {} as Record<string, yup.BooleanSchema>)
  ).test(
    'at-least-one-checked', // nome do teste
    'Selecione pelo menos um formulário para anexar.', // mensagem de erro
    (value) => value ? Object.values(value).some(v => v === true) : false // a função de validação
  ),
});

type FormValues = yup.InferType<typeof validationSchema>;

const FormularioAnexos = () => {
  const navigate = useNavigate(); // Removido para corrigir o erro
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, formState: { errors }, reset } = useForm<FormValues>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
        formularios: formulariosDisponiveis.reduce((acc, curr) => {
            acc[curr.id] = false;
            return acc;
        }, {} as Record<string, boolean>)
    }
  });

  useEffect(() => {
    // Carrega os dados salvos do localStorage ao iniciar
    const savedData = JSON.parse(localStorage.getItem("dadosAnexos") || "null");
    if (savedData) {
      reset(savedData);
    }
  }, [reset]);

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    console.log("Formulários Selecionados:", data);
    try {
      // Salva os dados no localStorage
      localStorage.setItem("dadosAnexos", JSON.stringify(data));
    } catch (error) {
      console.error("Erro ao salvar os dados:", error);
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsSubmitting(false);
    navigate("/bibliografia");
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-8 px-4 bg-gray-50 font-inter">
      <h1 className="text-4xl font-bold mb-8">VERITA AUDIT</h1>
      <div className="w-full max-w-4xl rounded-lg p-8 bg-white shadow-md">
        <h2 className="text-2xl font-semibold text-center mb-8">12. Anexos - Formulários de Registro</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          
          <div>
            <Label className="text-base font-semibold">Selecione os formulários que serão utilizados no estudo:</Label>
            <div className="mt-4 space-y-3 rounded-md border p-4">
                {formulariosDisponiveis.map((form) => (
                    <div key={form.id} className="flex items-center space-x-3">
                        <Controller
                            name={`formularios.${form.id}` as const}
                            control={control}
                            render={({ field }) => (
                                <Checkbox
                                    id={form.id}
                                    checked={field.value || false}
                                    onCheckedChange={field.onChange}
                                />
                            )}
                        />
                        <Label htmlFor={form.id} className="font-normal cursor-pointer">
                            {form.label}
                        </Label>
                    </div>
                ))}
            </div>
            
          </div>


          {/* Botão de Submissão */}
          <div className="flex justify-end pt-6 border-t">
            <Button
              type="submit"
              className="bg-[#90EE90] hover:bg-[#7CCD7C] text-black font-bold px-8 py-3 text-lg h-auto rounded-md"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Salvando..." : "Salvar e Avançar "}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormularioAnexos;
