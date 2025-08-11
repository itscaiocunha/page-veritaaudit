import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

// --- Schema de Validação e Tipos ---

const validationSchema = yup.object({
    resumoEstudos: yup.string().required("Este campo é obrigatório."),
    resumoRiscos: yup.string().required("Este campo é obrigatório."),
    justificativaViaAdministracao: yup.string().required("Este campo é obrigatório."),
    descricaoEspecie: yup.string().required("Este campo é obrigatório."),
    citacoesLiteratura: yup.string().required("Este campo é obrigatório."),
});

type FormValues = yup.InferType<typeof validationSchema>;

// --- COMPONENTE PRINCIPAL ---

const FormularioIntroducao = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const { register, handleSubmit, formState: { errors }, reset } = useForm<FormValues>({
        resolver: yupResolver(validationSchema),
        defaultValues: {
            resumoEstudos: "",
            resumoRiscos: "",
            justificativaViaAdministracao: "",
            descricaoEspecie: "",
            citacoesLiteratura: "",
        },
    });

    useEffect(() => {
        const savedData = JSON.parse(localStorage.getItem('dadosIntroducao') || '[]');
        if (savedData.length > 0) {
            reset(savedData[savedData.length - 1]);
        }
    }, [reset]);

    const onSubmit = async (data: FormValues) => {
        setIsSubmitting(true);
        console.log("Dados da Introdução:", data);

        try {
            const existingData = JSON.parse(localStorage.getItem('dadosIntroducao') || '[]');
            existingData.push(data);
            localStorage.setItem('dadosIntroducao', JSON.stringify(existingData));
            console.log("Dados da Introdução salvos no localStorage.");
        } catch (error) {
            console.error("Erro ao salvar os dados no localStorage:", error);
        }

        await new Promise(resolve => setTimeout(resolve, 500));
        setIsSubmitting(false);
        navigate('/objetivo'); // Navega para a próxima página
    };

    const renderTextareaField = (id: keyof FormValues, label: string, description: string) => (
        <div>
            <Label htmlFor={id} className="text-base font-semibold">{label}</Label>
            <p className="text-sm text-gray-600 mb-2">{description}</p>
            <Textarea 
                id={id} 
                {...register(id)} 
                className="min-h-[120px]"
            />
            <p className="text-red-500 text-sm mt-1">{errors[id]?.message}</p>
        </div>
    );

    return (
        <div className="min-h-screen flex flex-col items-center py-8 px-4 bg-gray-50 font-inter">
            <h1 className="text-4xl font-bold mb-8">VERITA AUDIT</h1>
            <div className="w-full max-w-4xl rounded-lg p-8 bg-white shadow-md">
                <h2 className="text-2xl font-semibold text-center mb-6">2. Introdução</h2>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {renderTextareaField(
                        "resumoEstudos",
                        "Resumo de Estudos Anteriores",
                        "Resumo de dados de estudos não clínicos que potencialmente têm significado clínico e de estudos clínicos que são relevantes para o estudo."
                    )}
                    {renderTextareaField(
                        "resumoRiscos",
                        "Resumo de Riscos",
                        "Resumo de riscos conhecidos e potenciais para o pessoal envolvido no estudo."
                    )}
                    {renderTextareaField(
                        "justificativaViaAdministracao",
                        "Via de Administração e Dosagem",
                        "Descrição e justificativa da via de administração, dosagem, regime de dosagem e período(s) de tratamento."
                    )}
                    {renderTextareaField(
                        "descricaoEspecie",
                        "Descrição da Espécie Animal",
                        "Descrição da espécie animal a ser estudada, bem como, se for o caso, caraterísticas da categoria (p.ex. animais jovens) a ser avaliada."
                    )}
                    {renderTextareaField(
                        "citacoesLiteratura",
                        "Referências",
                        "Citações de literatura e outros dados não científicos que possam subsidiar o estudo."
                    )}

                    <div className="flex justify-end pt-6 border-t">
                        <Button type="submit" className="bg-[#90EE90] hover:bg-[#7CCD7C] text-white font-bold px-8 py-3 text-lg h-auto rounded-md" disabled={isSubmitting}>
                            {isSubmitting ? 'Salvando' : 'Avançar'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FormularioIntroducao;
