import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const validationSchema = yup.object({
  delineamentoEstudo: yup.string().required("Este campo é obrigatório."),
  origemDestino: yup.string().required("Este campo é obrigatório."),
  numeroAnimaisAvaliacao: yup.number().typeError("Deve ser um número").positive("Deve ser um número positivo").integer().required("Este campo é obrigatório."),
  numeroAnimaisParticipantes: yup.number().typeError("Deve ser um número").positive("Deve ser um número positivo").integer().required("Este campo é obrigatório."),
  prontuariosHistorico: yup.string().required("Este campo é obrigatório."),
  quarentena: yup.string().required("Este campo é obrigatório."),
  manejoAlojamento: yup.string().required("Este campo é obrigatório."),
  alimentacaoAgua: yup.string().required("Este campo é obrigatório."),
  criteriosInclusao: yup.string().required("Este campo é obrigatório."),
  criteriosExclusao: yup.string().required("Este campo é obrigatório."),
  criteriosRemocao: yup.string().required("Este campo é obrigatório."),
  exameFisico: yup.string().required("Este campo é obrigatório."),
  exameLaboratorial: yup.string().required("Este campo é obrigatório."),
  aclimatacao: yup.string().required("Este campo é obrigatório."),
  selecao: yup.string().required("Este campo é obrigatório."),
  randomizacao: yup.string().required("Este campo é obrigatório."),
  cegamento: yup.string().required("Este campo é obrigatório."),
  tratamento: yup.string().required("Este campo é obrigatório."),
  parametros: yup.string().required("Este campo é obrigatório."),
  analiseEstatistica: yup.string().required("Este campo é obrigatório."),
});

type FormValues = yup.InferType<typeof validationSchema>;

const instrucoes = {
  delineamentoEstudo: [
    { title: "Tipo de Ensaio", description: "Descrição do tipo/delineamento do ensaio clínico a ser realizado (cego)." },
    { title: "Avaliação de Parâmetros", description: "Argumentação adequada sobre a avaliação dos parâmetros primários e secundários (se houver), a serem avaliados durante o ensaio." },
    { title: "Diagrama do Estudo", description: "Diagrama esquemático do delineamento do estudo, procedimentos e fases." },
    { title: "Minimização de Viés", description: "Descrição das medidas tomadas para minimizar/evitar viés, incluindo randomização e estudo cego." },
    { title: "Tratamento", description: "Descrição do tratamento empregado no estudo clínico. Posologia conforme bula/prescrição do produto." },
    { title: "Duração e Sequência", description: "Duração prevista da participação dos animais e descrição da sequência e duração de todos os períodos de avaliação." },
    { title: "Critérios de Interrupção", description: "Descrição das “regras de interrupção” ou “critérios de descontinuação” para animais, partes do estudo ou todo o estudo." },
    { title: "Prestação de Contas", description: "Transparência na prestação de contas (reconciliação) referente ao produto em investigação, incluindo os controles." },
  ],
  caracteristicasGerais: [
    { title: "Animais para Avaliação", description: "Número de animais suficientes para que seja possível incluir o N amostral do estudo clínico." },
    { title: "Animais Participantes", description: "Número de animais selecionados para participarem do estudo clínico conforme cálculo amostral." },
    { title: "Cálculo Amostral", description: "Incluir informações sobre o Cálculo amostral realizado para embasar o número de animais participantes, como anexo ou justificativa baseada em orientações." },
  ],
  analiseEstatistica: [
    { title: "Hipóteses", description: "Hipóteses a serem testadas." },
    { title: "Parâmetros", description: "Parâmetros a serem estimados." },
    { title: "Suposições", description: "Suposições a serem feitas e seu nível de significância." },
    { title: "Unidade Experimental", description: "Definição da unidade experimental." },
    { title: "Modelo Estatístico", description: "Modelo estatístico a ser utilizado." },
  ],
};

type InstructionTip = {
  title: string;
  description: string;
};

// --- Componente Helper para Tooltip com o CSS FORÇADO para o tema claro ---
const InfoTooltip = ({ content }: { content: InstructionTip[] }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Info className="w-4 h-4 text-gray-500 cursor-pointer" />
      </TooltipTrigger>
      {/* CORREÇÃO DEFINITIVA: 
        Forçando o estilo de fundo branco, texto preto e borda, 
        para garantir que ele não seja sobrescrito por um tema escuro.
      */}
      <TooltipContent className="max-w-sm p-3 bg-white text-black border rounded-md shadow-lg"> 
        <div className="space-y-2">
          {content.map((item, idx) => (
            <div key={idx}>
              <p className="font-semibold">{item.title}</p>
              <p className="text-sm text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

const FormularioMaterialMetodo = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormValues>({
    resolver: yupResolver(validationSchema),
  });

  useEffect(() => {
    const savedData = JSON.parse(localStorage.getItem("dadosMaterialMetodo") || "null");
    if (savedData) {
      reset(savedData);
    }
  }, [reset]);

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    console.log(data);
    try {
      localStorage.setItem("dadosMaterialMetodo", JSON.stringify(data));
    } catch (error) {
      console.error("Erro ao salvar os dados:", error);
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsSubmitting(false);
    navigate("/saude");
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-8 px-4 bg-gray-50 font-inter">
      <h1 className="text-4xl font-bold mb-8">VERITA AUDIT</h1>
      <div className="w-full max-w-4xl rounded-lg p-8 bg-white shadow-md">
        <h2 className="text-2xl font-semibold text-center mb-6">6. MATERIAL E MÉTODO</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* O restante do formulário continua aqui, sem alterações... */}
          <section>
            <h3 className="text-xl font-semibold mb-4 border-b pb-2">6.1 Delineamento ao estudo</h3>
            <div className="flex items-center gap-2">
              <Label htmlFor="delineamentoEstudo" className="text-base font-semibold">
                Descrição completa do delineamento
              </Label>
              <InfoTooltip content={instrucoes.delineamentoEstudo} />
            </div>
            <Textarea id="delineamentoEstudo" {...register("delineamentoEstudo")} className="min-h-[200px] mt-2" />
            <p className="text-red-500 text-sm mt-1">{errors.delineamentoEstudo?.message}</p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-4 border-b pb-2">6.2 Animais</h3>
            
            <div className="space-y-6 pl-4 border-l-2">
              <div>
                <Label htmlFor="origemDestino" className="text-base font-semibold">6.2.1 Origem e Destino</Label>
                <Textarea id="origemDestino" {...register("origemDestino")} className="min-h-[100px] mt-2" />
                <p className="text-red-500 text-sm mt-1">{errors.origemDestino?.message}</p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                   <h4 className="text-base font-semibold">6.2.2 Características gerais</h4>
                   <InfoTooltip content={instrucoes.caracteristicasGerais} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="numeroAnimaisAvaliacao">Número de animais para avaliação</Label>
                    <Input id="numeroAnimaisAvaliacao" type="number" {...register("numeroAnimaisAvaliacao")} />
                    <p className="text-red-500 text-sm mt-1">{errors.numeroAnimaisAvaliacao?.message}</p>
                  </div>
                  <div>
                    <Label htmlFor="numeroAnimaisParticipantes">Número de animais participantes</Label>
                    <Input id="numeroAnimaisParticipantes" type="number" {...register("numeroAnimaisParticipantes")} />
                    <p className="text-red-500 text-sm mt-1">{errors.numeroAnimaisParticipantes?.message}</p>
                  </div>
                </div>
              </div>

              {[
                { id: "prontuariosHistorico", label: "6.2.2.1 Prontuários e/ou Histórico" },
                { id: "quarentena", label: "6.2.3 Quarentena" },
                { id: "manejoAlojamento", label: "6.2.4 Manejo e alojamento dos animais" },
                { id: "alimentacaoAgua", label: "6.2.4.1 Alimentação e água" },
                { id: "criteriosInclusao", label: "6.2.5.1 Critérios de Inclusão" },
                { id: "criteriosExclusao", label: "6.2.5.2 Critérios de Exclusão" },
                { id: "criteriosRemocao", label: "6.2.5.3 Critérios de Remoção" },
                { id: "exameFisico", label: "6.2.6.1 Exame físico" },
                { id: "exameLaboratorial", label: "6.2.6.2 Exame laboratorial" },
                { id: "aclimatacao", label: "6.2.7 Aclimatação" },
                { id: "selecao", label: "6.2.8 Seleção" },
                { id: "randomizacao", label: "6.2.9 Randomização" },
                { id: "cegamento", label: "6.2.9.1 Cegamento" },
                { id: "tratamento", label: "6.2.10 Tratamento" },
              ].map(field => (
                <div key={field.id}>
                  <Label htmlFor={field.id} className="text-base font-semibold">{field.label}</Label>
                  <Textarea id={field.id} {...register(field.id as keyof FormValues)} className="min-h-[100px] mt-2" />
                  <p className="text-red-500 text-sm mt-1">{errors[field.id as keyof FormValues]?.message}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-4 border-b pb-2">6.3 Parâmetros Para Determinação EFICÁCIA/SEGURANÇA CLÍNICA/RESÍDUO/BIODISPONIBILIDADE</h3>
            <Textarea id="parametros" {...register("parametros")} className="min-h-[150px] mt-2" />
            <p className="text-red-500 text-sm mt-1">{errors.parametros?.message}</p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-4 border-b pb-2">6.4 ANÁLISE ESTATÍSTICA</h3>
            <div className="flex items-center gap-2">
              <Label htmlFor="analiseEstatistica" className="text-base font-semibold">
                Descrição da Análise Estatística
              </Label>
              <InfoTooltip content={instrucoes.analiseEstatistica} />
            </div>
            <Textarea id="analiseEstatistica" {...register("analiseEstatistica")} className="min-h-[150px] mt-2" />
            <p className="text-red-500 text-sm mt-1">{errors.analiseEstatistica?.message}</p>
          </section>

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

export default FormularioMaterialMetodo;