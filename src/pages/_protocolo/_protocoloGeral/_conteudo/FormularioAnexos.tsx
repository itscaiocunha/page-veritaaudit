import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Loader2, AlertCircle } from "lucide-react";

// ---
// PASSO 1: Lista Mestre de Formulários (Revisada e Corrigida)
// ---
const ALL_PROTOCOL_FORMS = [
  {
    id: "ec-1-0",
    title: "1.0 - Registro de equipe executora e treinamento do protocolo",
    path: "/equipe-treinamento",
    ordem: 1.0,
    tags: null, // 'null' significa que sempre aparece
  },
  {
    id: "ec-2-0",
    title: "2.0 - Local da etapa clínica",
    path: "/local-etapa-clinica",
    ordem: 2.0,
    tags: ["clinica", "clínico", "local"],
  },
  {
    id: "ec-3-0",
    title: "3.0 - Inventário do produto veterinário investigacional",
    path: "/inventario-produto-veterinario",
    ordem: 3.0,
    tags: ["veterinario", "produto", "investigacional", "inventario"],
  },
  {
    id: "ec-4-0",
    title: "4.0 - Pesagem dos animais por Dia",
    path: "/pesagem-animais",
    ordem: 4.0,
    tags: ["animal", "animais", "peso", "pesagem", "bovino", "bovinos", "vaca", "vacas"],
  },
  {
    id: "ec-5-0",
    title: "5.0 - Exame físico e laboratorial",
    path: "/exame-fisico-laboratorial",
    ordem: 5.0,
    tags: ["exame", "fisico", "laboratorial", "clinico", "clinica", "animal", "animais"],
  },
  {
    id: "ec-6-0",
    title: "6.0 - Identificação dos animais",
    path: "/identificacao-animais",
    ordem: 6.0,
    tags: ["animal", "animais", "identificacao", "bovino", "bovinos"],
  },
  {
    id: "ec-7-0",
    title: "7.0 - Seleção dos animais",
    path: "/selecao-animais",
    ordem: 7.0,
    tags: ["animal", "animais", "selecao", "triagem", "bovino", "bovinos"],
  },
  {
    id: "ec-8-0",
    title: "8.0 - Randomização",
    path: "/randomizacao",
    ordem: 8.0,
    tags: ["randomizacao", "delineamento", "animal", "animais", "clinico", "clinica"],
  },
  {
    id: "ec-9-0",
    title: "9.0 - Tratamento",
    path: "/tratamento",
    ordem: 9.0,
    tags: ["tratamento", "medicamento", "dose", "aplicacao"],
  },
  {
    id: "ec-10-0",
    title: "10.0 - Observações gerais de saúde (OGS)",
    path: "/observacoes-saude",
    ordem: 10.0,
    tags: ["saude", "observacoes", "ogs", "animal", "animais", "clinico", "clinica"],
  },
  {
    id: "ec-11-0",
    title: "11.0 - Relatório técnico veterinário",
    path: "/relatorio-veterinario",
    ordem: 11.0,
    tags: ["relatorio", "veterinario", "animal", "animais"],
  },
  {
    id: "ec-12-0",
    title: "12.0 - Evento adverso",
    path: "/evento-adverso",
    ordem: 12.0,
    tags: ["evento adverso", "seguranca", "toxicidade", "ea"],
  },
  {
    id: "ec-13-0",
    title: "13.0 - Finalização da participação na pesquisa",
    path: "/finalizacao-pesquisa",
    ordem: 13.0,
    tags: null,
  },
  {
    id: "ec-14-0",
    title: "14.0 - Necropsia",
    path: "/necropsia",
    ordem: 14.0,
    tags: ["necropsia", "morte", "animal", "animais", "patologia", "tecido"],
  },
  {
    id: "ec-15-0",
    title: "15.0 - Destino da carcaça",
    path: "/destino-carcaca",
    ordem: 15.0,
    tags: ["carcaca", "necropsia", "animal", "animais", "descarte"],
  },
  {
    id: "ec-17-0",
    title: "17.0 - Colheita de sangue",
    path: "/colheita-sangue",
    ordem: 17.0,
    tags: ["sangue", "colheita", "coleta", "amostra", "exame", "laboratorial"],
  },
  {
    id: "ec-18-0",
    title: "18.0 - Colheita de sangue seriada",
    path: "/colheita-sangue-seriada",
    ordem: 18.0,
    tags: ["sangue", "colheita", "coleta", "seriada", "farmacocinetica", "pk"],
  },
  {
    id: "ec-19-0",
    title: "19.0 - Colheita de matriz de tecido e processamento de amostra",
    path: "/colheita-tecido",
    ordem: 19.0,
    tags: ["tecido", "colheita", "coleta", "amostra", "necropsia", "patologia"],
  },
  {
    id: "ec-20-0",
    title: "20.0 - Colheita de amostra de leite",
    path: "/colheita-leite",
    ordem: 20.0,
    tags: ["leite", "colheita", "coleta", "amostra", "bovino", "vaca", "vacas"],
  },
  {
    id: "ec-21-0",
    title: "21.0 - Produtividade das vacas leiteiras",
    path: "/produtividade-vacas",
    ordem: 21.0,
    tags: ["vaca", "vacas", "leite", "produtividade", "bovino", "bovinos"],
  },
  {
    id: "ec-24-0",
    title: "24.0 - Escore de condição corporal",
    path: "/escore-corporal",
    ordem: 24.0,
    tags: ["escore corporal", "ecc", "animal", "animais", "peso", "saude"],
  },
  {
    id: "ec-27-0",
    title: "27.0 - Notas ao Estudo",
    path: "/notas-estudo",
    ordem: 27.0,
    tags: null,
  },
  {
    id: "ec-28-0",
    title: "28.0 - Envio de Produto",
    path: "/envio-produto",
    ordem: 28.0,
    tags: ["produto", "envio", "logistica"],
  },
  {
    id: "ec-30-0",
    title: "30.0 - Rastreamento de envio e recebimento de documentos",
    path: "/rastreamento-documentos",
    ordem: 30.0,
    tags: null,
  },
  {
    id: "ec-31-0",
    title: "31.0 - Avaliação do local de aplicação",
    path: "/avaliacao-local-aplicacao",
    ordem: 31.0,
    tags: ["aplicacao", "local", "tratamento", "injecao", "dermatologia"], // Corrigido
  },
  {
    id: "ec-32-0",
    title: "32.0 - Triagem Bovinos",
    path: "/triagem-bovinos",
    ordem: 32.0,
    tags: ["bovino", "bovinos", "vaca", "vacas", "triagem", "selecao", "animal"],
  },
  {
    id: 'consentimento',
    title: 'Formulário de Consentimento Livre e Esclarecido (TCLE)',
    path: '/tcle',
    ordem: 90.0,
    tags: ['tcle', 'consentimento', 'humano', 'paciente', 'clinico', 'clinica']
  },
  {
    id: 'termoAssentimento',
    title: 'Termo de Assentimento Livre e Esclarecido (TALE)',
    path: '/tale',
    ordem: 90.1,
    tags: ['tale', 'assentimento', 'humano', 'paciente', 'clinico', 'clinica', 'criança']
  },
];

// ---
// PASSO 2: Schema e Defaults (Dinâmicos, sem alteração)
// ---
const buildSchemaShape = () => {
    const shape = ALL_PROTOCOL_FORMS.reduce((acc, curr) => {
        acc[curr.id] = yup.boolean();
        return acc;
    }, {} as Record<string, yup.BooleanSchema>);
    return shape;
};

const validationSchema = yup.object({
  formularios: yup.object().shape(buildSchemaShape())
    .test(
      'at-least-one-checked',
      'Selecione pelo menos um formulário para anexar.',
      (value) => value ? Object.values(value).some(v => v === true) : false
    ),
});

const getDefaultValues = () => {
    const defaults = ALL_PROTOCOL_FORMS.reduce((acc, curr) => {
        acc[curr.id] = false;
        return acc;
    }, {} as Record<string, boolean>);
    return { formularios: defaults };
};

type FormValues = yup.InferType<typeof validationSchema>;


// ---
// PASSO 3: O Componente Principal
// ---
const FormularioAnexos = () => {
  const navigate = useNavigate();
  const { id: protocoloMestreId } = useParams<{ id: string }>();

  // --- Estados ---
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // A lista de formulários que será MOSTRADA (filtrada)
  const [formulariosSugeridos, setFormulariosSugeridos] = useState<typeof ALL_PROTOCOL_FORMS>([]);

  const { control, handleSubmit, formState: { errors }, reset } = useForm<FormValues>({
    resolver: yupResolver(validationSchema),
    defaultValues: getDefaultValues()
  });

  // --- Efeito 1: Carregar dados salvos do localStorage ---
  useEffect(() => {
    // Carrega os dados salvos do localStorage ao iniciar
    const storageKey = `dadosAnexos_${protocoloMestreId || "draft"}`;
    const savedData = JSON.parse(localStorage.getItem(storageKey) || "null");
    if (savedData) {
      reset(savedData);
    }
  }, [reset, protocoloMestreId]);

  // ---
  // Efeito 2: Buscar palavras-chave e filtrar formulários (VERSÃO CORRIGIDA)
  // ---
  useEffect(() => {
    if (!protocoloMestreId) {
      setError("ID do protocolo não encontrado.");
      setFormulariosSugeridos(ALL_PROTOCOL_FORMS.sort((a, b) => a.ordem - b.ordem));
      setIsLoading(false);
      return;
    }

    const fetchProtocoloEFiltrar = async () => {
      setIsLoading(true);
      setError(null);
      
      let palavrasChavesString = "";

      // --- PASSO 1: TENTAR LER DO LOCAL STORAGE PRIMEIRO ---
      try {
        const introStorageKey = `dadosIntroducao_${protocoloMestreId}`;
        const savedIntroData = JSON.parse(localStorage.getItem(introStorageKey) || "null");

        if (savedIntroData && Array.isArray(savedIntroData) && savedIntroData.length > 0) {
            palavrasChavesString = savedIntroData[savedIntroData.length - 1].palavrasChaves || "";
        }
      } catch (e) {
        console.warn("Não foi possível ler palavras-chave do Local Storage.", e);
      }

      // --- PASSO 2: SE NÃO ACHOU, TENTAR API (PLANO B) ---
      if (!palavrasChavesString) {
        try {
          const apiKey = "2NtzCUDl8Ib2arnDRck0xK8taguGeFYuZqnUzpiZ9Wp-tUZ45--/i=tKxzwTPBvtykMSx!0t?7c/Z?NllkokY=TEC2DSonmOMUu0gxdCeh70/rA2NSsm7Ohjn7VM2BeP";
          let TOKEN = sessionStorage.getItem("token");

          if (!TOKEN) {
            setError("Usuário não autenticado.");
            setIsLoading(false);
            return;
          }
          TOKEN = TOKEN.replace(/"/g, "");
          const API_URL = `https://verita-brgchubha6ceathm.brazilsouth-01.azurewebsites.net/api/protocolo/versao/ativo/detalhes/${protocoloMestreId}`;

          const response = await fetch(API_URL, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${TOKEN}`,
              "X-API-KEY": apiKey,
            },
          });

          if (!response.ok) {
            throw new Error("Falha ao carregar dados do protocolo.");
          }

          const data = await response.json();
          
          palavrasChavesString = data.introducao?.palavrasChaves || "";

        } catch (err) {
          console.error("Erro ao filtrar formulários:", err);
          if (err instanceof Error) setError(err.message);
          else setError("Erro desconhecido ao carregar.");
          // Em caso de erro, mostrar todos como fallback
          setFormulariosSugeridos(ALL_PROTOCOL_FORMS.sort((a, b) => a.ordem - b.ordem));
          setIsLoading(false); 
          return; 
        }
      }

      // --- PASSO 3: PROCESSAR E FILTRAR (COM AS PALAVRAS ENCONTRADAS) ---
      
      const userKeywords = palavrasChavesString
        .split(/[,;]/) // <-- CORREÇÃO: Aceita vírgula E ponto-e-vírgula
        .map((k) => k.trim().toLowerCase())
        .filter((k) => k.length > 0);

      // Lógica de filtragem
      const formulariosFiltrados = ALL_PROTOCOL_FORMS.filter((form) => {
        if (!form.tags) { // Se tags: null, sempre mostra
          return true;
        }
        if (userKeywords.length > 0) {
            return form.tags.some((tag) => userKeywords.includes(tag.toLowerCase()));
        }
        return false; // Se não houver keywords, não mostra (exceto os 'null')
      });

      // Ordena pela 'ordem'
      const formulariosOrdenados = formulariosFiltrados.sort(
        (a, b) => a.ordem - b.ordem
      );
      
      setFormulariosSugeridos(formulariosOrdenados);
      setIsLoading(false); // Parar o loading no final de tudo
    };

    fetchProtocoloEFiltrar();

  }, [protocoloMestreId]);


  // --- Submissão ---
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    const storageKey = `dadosAnexos_${protocoloMestreId || "draft"}`;

    try {
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch (error) {
      console.error("Erro ao salvar os dados:", error);
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsSubmitting(false);
    navigate("/bibliografia"); // Ajuste a rota se necessário
  };

  // ---
  // PASSO 4: Renderização (Sem alterações)
  // ---
  return (
    <div className="min-h-screen flex flex-col items-center py-8 px-4 bg-gray-50 font-inter">
      {/* (Mantive seu Header) */}
      <h1 className="text-4xl font-bold mb-8">VERITA AUDIT</h1> 
      
      <div className="w-full max-w-4xl rounded-lg p-8 bg-white shadow-md">
        <h2 className="text-2xl font-semibold text-center mb-8">13. Anexos - Formulários de Registro</h2>

        {error && (
            <div className="mb-4 flex items-center gap-2 rounded-md border border-red-300 bg-red-50 p-4 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div>
            <Label className="text-base font-semibold">
              {isLoading 
                ? "Carregando sugestões de formulários..." 
                : "Formulários sugeridos com base nas palavras-chave (ou todos, em caso de erro):"}
            </Label>
            
            {isLoading ? (
                <div className="flex justify-center items-center min-h-[200px]">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
                </div>
            ) : (
                <div className="mt-4 space-y-3 rounded-md border p-4 max-h-[500px] overflow-y-auto">
                    {formulariosSugeridos.length > 0 ? (
                        formulariosSugeridos.map((form) => (
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
                                    {form.title}
                                </Label>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 text-center">Nenhum formulário sugerido com base nas palavras-chave. Verifique as tags.</p>
                    )}
                </div>
            )}
          </div>

          <div className="flex justify-between items-center pt-6 border-t">
             <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)} // Botão Voltar
                disabled={isSubmitting}
            >
                Voltar
            </Button>

            <Button
              type="submit"
              className="bg-[#90EE90] hover:bg-[#7CCD7C] text-black font-bold px-8 py-3 text-lg h-auto rounded-md"
              disabled={isSubmitting || isLoading}
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