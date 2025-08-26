import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

// --- Schema de Validação ---
const atividadeSchema = yup.object({
  diaEstudo: yup.string().required("Obrigatório"),
  datas: yup.string().required("Obrigatório"),
  atividade: yup.string().required("Obrigatório"),
  fichas: yup.string().required("Obrigatório"),
});

const validationSchema = yup.object({
  duracaoEstudo: yup.number().typeError("Deve ser um número").positive("Deve ser um número positivo").integer().required("A duração é obrigatória."),
  atividades: yup.array().of(atividadeSchema).min(1, "Adicione pelo menos uma atividade ao cronograma."),
});

type FormValues = yup.InferType<typeof validationSchema>;

const newEmptyActivity = {
    diaEstudo: "",
    datas: "",
    atividade: "",
    fichas: "",
};

const FormularioCronograma = () => {
  const navigate = useNavigate(); // Removido para corrigir o erro
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, control, handleSubmit, formState: { errors }, reset } = useForm<FormValues>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
        atividades: [newEmptyActivity],
    }
  });

  const { fields, append, remove } = useFieldArray({
      control,
      name: "atividades",
  });

  useEffect(() => {
    // Carrega os dados salvos do localStorage ao iniciar
    const savedData = JSON.parse(localStorage.getItem("dadosCronograma") || "null");
    if (savedData) {
      reset(savedData);
    }
  }, [reset]);

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    console.log(data);
    try {
      // Salva os dados no localStorage
      localStorage.setItem("dadosCronograma", JSON.stringify(data));
    } catch (error) {
      console.error("Erro ao salvar os dados:", error);
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsSubmitting(false);
    navigate("/anexos");
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-8 px-4 bg-gray-50 font-inter">
      <h1 className="text-4xl font-bold mb-8">VERITA AUDIT</h1>
      <div className="w-full max-w-5xl rounded-lg p-8 bg-white shadow-md">
        <h2 className="text-2xl font-semibold text-center mb-8">11. Cronograma do Estudo</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          
          <div className="md:w-1/3">
            <Label htmlFor="duracaoEstudo" className="text-base font-semibold">Duração do Estudo (dias)</Label>
            <Input 
                id="duracaoEstudo" 
                type="number"
                {...register("duracaoEstudo")}
                className="mt-2"
            />
            <p className="text-red-500 text-sm mt-1">{errors.duracaoEstudo?.message}</p>
          </div>

          <div>
            <div className="border rounded-lg overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50 hover:bg-gray-100">
                            <TableHead className="w-1/6">Dia do estudo</TableHead>
                            <TableHead className="w-1/6">Datas</TableHead>
                            <TableHead className="w-3/6">Atividade</TableHead>
                            <TableHead className="w-1/6">Fichas</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {fields.map((field, index) => (
                            <TableRow key={field.id}>
                                <TableCell>
                                    <Input placeholder="Ex: D-1, D0" {...register(`atividades.${index}.diaEstudo`)} />
                                </TableCell>
                                <TableCell>
                                    <Input type="date" {...register(`atividades.${index}.datas`)} />
                                </TableCell>
                                <TableCell>
                                    <Textarea placeholder="Descreva a atividade" {...register(`atividades.${index}.atividade`)} />
                                </TableCell>
                                <TableCell>
                                    <Input placeholder="Ex: CTA-FC-001-A" {...register(`atividades.${index}.fichas`)} />
                                </TableCell>
                                <TableCell>
                                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="text-red-500 hover:text-red-700">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
             <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => append(newEmptyActivity)}>
                <Plus className="h-4 w-4 mr-2" /> Adicionar Atividade
            </Button>
            {errors.atividades && <p className="text-red-500 text-sm mt-1">{errors.atividades.message}</p>}
          </div>


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

export default FormularioCronograma;
