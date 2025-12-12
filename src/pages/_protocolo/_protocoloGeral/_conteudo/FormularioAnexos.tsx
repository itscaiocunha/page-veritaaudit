import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Loader2, AlertCircle, CheckCircle2, Save, ArrowRight, ChevronLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast"; // Import do Toast

// ---
// PASSO 1: Lista Mestre de Formulários (MANTIDA)
// ---
const ALL_PROTOCOL_FORMS = [
  {
    id: "10",
    title: "1.0 - Registro de equipe executora e treinamento do protocolo",
    path: "/equipe-treinamento",
    ordem: 1.0,
    tags: [
      "registro", "Registro",
      "equipe", "Equipe", "staff", "pessoal", "colaboradores",
      "treinamento", "Treinamento", "capacitação", "training",
      "protocolo", "Protocolo",
      "assinatura", "log", "delegation",
      "investigador", "pesquisador",
      "GCP", "BPC", "boas práticas"
    ],
  },
  {
    id: "20",
    title: "2.0 - Local da etapa clínica",
    path: "/local-etapa-clinica",
    ordem: 2.0,
    tags: [
      "clinica", "clínica", "Clinica", "Clínica",
      "local", "Local", "site", "fase clínica",
      "fazenda", "farm", "instalação", "facility",
      "ambulatório", "hospital",
      "endereço", "estrutura", "baias", "piquetes"
    ],
  },
  {
    id: "30",
    title: "3.0 - Inventário do produto veterinário investigacional",
    path: "/inventario-produto-veterinario",
    ordem: 3.0,
    tags: [
      "veterinario", "veterinário", "Veterinário",
      "produto", "Produto", "drug",
      "investigacional", "teste", "experimental",
      "inventario", "inventário", "Inventário",
      "estoque", "stock", "contagem", "contabilidade",
      "controle", "armazenamento", "geladeira", "temperatura",
      "PVI", "CP", "artigo de teste"
    ],
  },
  {
    id: "40",
    title: "4.0 - Pesagem dos animais por Dia",
    path: "/pesagem-animais",
    ordem: 4.0,
    tags: [
      "animal", "animais", "Animal", "Animais",
      "peso", "Peso", "weight",
      "pesagem", "Pesagem", "weighing",
      "bovino", "bovinos", "vaca", "vacas",
      "balança", "tara", "kg", "quilogramas",
      "ganho de peso", "GMD", "evolução"
    ],
  },
  {
    id: "50",
    title: "5.0 - Exame físico e laboratorial",
    path: "/exame-fisico-laboratorial",
    ordem: 5.0,
    tags: [
      "exame", "Exame", "exam",
      "fisico", "físico", "Físico", "physical",
      "laboratorial", "lab", "análises",
      "clinico", "clínico", "Clínico", "clinica",
      "animal", "animais",
      "temperatura", "frequência cardíaca", "frequência respiratória",
      "TPC", "mucosas", "linfonodos", "checkup", "triagem"
    ],
  },
  {
    id: "60",
    title: "6.0 - Identificação dos animais",
    path: "/identificacao-animais",
    ordem: 6.0,
    tags: [
      "animal", "animais",
      "identificacao", "identificação", "Identificação", "ID",
      "bovino", "bovinos",
      "brinco", "tag", "ear tag",
      "chip", "microchip", "transponder",
      "tatuagem", "marca", "numeração", "número"
    ],
  },
  {
    id: "70",
    title: "7.0 - Seleção dos animais",
    path: "/selecao-animais",
    ordem: 7.0,
    tags: [
      "animal", "animais",
      "selecao", "seleção", "Seleção", "selection",
      "triagem", "screening",
      "bovino", "bovinos",
      "inclusão", "exclusão", "critérios", "elegibilidade",
      "apto", "inapto", "escolha"
    ],
  },
  {
    id: "80",
    title: "8.0 - Randomização",
    path: "/randomizacao",
    ordem: 8.0,
    tags: [
      "randomizacao", "randomização", "Randomização",
      "delineamento", "design",
      "animal", "animais",
      "clinico", "clínico",
      "sorteio", "acaso", "randomization",
      "grupo", "bloco", "tratamento", "alocação", "allocation"
    ],
  },
  {
    id: "90",
    title: "9.0 - Tratamento",
    path: "/tratamento",
    ordem: 9.0,
    tags: [
      "tratamento", "Tratamento", "treatment",
      "medicamento", "fármaco", "remédio",
      "dose", "dosagem", "volume",
      "aplicacao", "aplicação", "administração",
      "via", "oral", "subcutânea", "intramuscular", "injetável",
      "D0", "dia 0", "terapia"
    ],
  },
  {
    id: "100",
    title: "10.0 - Observações gerais de saúde (OGS)",
    path: "/observacoes-saude",
    ordem: 10.0,
    tags: [
      "saude", "saúde", "Saúde", "health",
      "observacoes", "observações", "Observações",
      "ogs", "OGS",
      "animal", "animais",
      "clinico", "clínico",
      "monitoramento", "diário", "bem-estar",
      "comportamento", "apetite", "escore", "rotina"
    ],
  },
  {
    id: "110",
    title: "11.0 - Relatório técnico veterinário",
    path: "/relatorio-veterinario",
    ordem: 11.0,
    tags: [
      "relatorio", "relatório", "Relatório", "report",
      "veterinario", "veterinário", "vet",
      "animal", "animais",
      "laudo", "parecer", "conclusão",
      "técnico", "responsável", "assinatura"
    ],
  },
  {
    id: "120",
    title: "12.0 - Evento adverso",
    path: "/evento-adverso",
    ordem: 12.0,
    tags: [
      "evento adverso", "Evento Adverso",
      "seguranca", "segurança", "safety",
      "toxicidade", "tox",
      "ea", "EA", "SAE", "adverse event",
      "reação", "efeito colateral", "sintoma",
      "grave", "inesperado", "morte"
    ],
  },
  {
    id: "130",
    title: "13.0 - Finalização da participação na pesquisa",
    path: "/finalizacao-pesquisa",
    ordem: 13.0,
    tags: [
      "finalizacao", "finalização", "Finalização",
      "pesquisa", "estudo", "study",
      "término", "conclusão", "fim",
      "saída", "discharge", "alta",
      "end of study", "encerramento"
    ],
  },
  {
    id: "140",
    title: "14.0 - Necropsia",
    path: "/necropsia",
    ordem: 14.0,
    tags: [
      "necropsia", "Necropsia", "necropsy",
      "morte", "óbito", "sacrifício", "eutanásia",
      "animal", "animais",
      "patologia", "pathology",
      "tecido", "órgão",
      "macroscopia", "autópsia", "post-mortem", "lesão"
    ],
  },
  {
    id: "150",
    title: "15.0 - Destino da carcaça",
    path: "/destino-carcaca",
    ordem: 15.0,
    tags: [
      "carcaca", "carcaça", "Carcaça", "corpo",
      "necropsia",
      "animal", "animais",
      "descarte", "destino", "disposal",
      "incineração", "enterro", "compostagem",
      "resíduo", "biológico"
    ],
  },
  {
    id: "170",
    title: "17.0 - Colheita de sangue",
    path: "/colheita-sangue",
    ordem: 17.0,
    tags: [
      "sangue", "Sangue", "blood",
      "colheita", "coleta", "amostragem", "sampling",
      "amostra",
      "exame", "laboratorial",
      "tubo", "seringa", "vacutainer",
      "hematologia", "bioquímica", "soro", "plasma",
      "jugular", "coccígea", "punção"
    ],
  },
  {
    id: "180",
    title: "18.0 - Colheita de sangue seriada",
    path: "/colheita-sangue-seriada",
    ordem: 18.0,
    tags: [
      "sangue", "blood",
      "colheita", "coleta",
      "seriada", "série", "curva",
      "farmacocinetica", "farmacocinética", "PK", "pharmacokinetics",
      "tempo", "horário", "timepoint", "T0", "Tmax",
      "concentração", "absorção"
    ],
  },
  {
    id: "190",
    title: "19.0 - Colheita de matriz de tecido e processamento de amostra",
    path: "/colheita-tecido",
    ordem: 19.0,
    tags: [
      "tecido", "Tecido", "tissue",
      "colheita", "coleta",
      "amostra", "sample",
      "necropsia",
      "patologia", "histopatologia", "histologia",
      "biópsia", "fígado", "rim", "músculo", "gordura", "pele",
      "formol", "congelamento", "processamento"
    ],
  },
  {
    id: "200",
    title: "20.0 - Colheita de amostra de leite",
    path: "/colheita-leite",
    ordem: 20.0,
    tags: [
      "leite", "Leite", "milk",
      "colheita", "coleta",
      "amostra",
      "bovino", "vaca", "vacas", "lactante",
      "ordenha", "ubere", "teto",
      "resíduo", "gordura", "proteína"
    ],
  },
  {
    id: "210",
    title: "21.0 - Produtividade das vacas leiteiras",
    path: "/produtividade-vacas",
    ordem: 21.0,
    tags: [
      "vaca", "vacas", "leiteira",
      "leite", "Leite",
      "produtividade", "produção", "yield",
      "bovino", "bovinos",
      "litros", "kg", "pesagem de leite",
      "ordenha", "lactação"
    ],
  },
  {
    id: "240",
    title: "24.0 - Escore de condição corporal",
    path: "/escore-corporal",
    ordem: 24.0,
    tags: [
      "escore corporal", "Escore", "Score",
      "ecc", "ECC", "BCS",
      "animal", "animais",
      "peso", "magreza", "obesidade",
      "saude", "nutrição",
      "avaliação visual", "corporal"
    ],
  },
  {
    id: "270",
    title: "27.0 - Notas ao Estudo",
    path: "/notas-estudo",
    ordem: 27.0,
    tags: [
      "notas", "Notas", "notes",
      "estudo", "protocolo",
      "observação", "obs", "comentário",
      "desvio", "registro", "adicional",
      "ocorrência", "diário de campo"
    ],
  },
  {
    id: "280",
    title: "28.0 - Envio de Produto",
    path: "/envio-produto",
    ordem: 28.0,
    tags: [
      "produto", "Produto",
      "envio", "Envio", "remessa", "expedição",
      "logistica", "logística",
      "transporte", "transportadora", "shipping",
      "correio", "rastreio"
    ],
  },
  {
    id: "300",
    title: "30.0 - Rastreamento de envio e recebimento de documentos",
    path: "/rastreamento-documentos",
    ordem: 30.0,
    tags: [
      "rastreamento", "Rastreamento", "tracking",
      "documentos", "documento", "docs",
      "envio", "recebimento",
      "correio", "protocolo", "arquivo",
      "regulatório", "papelada"
    ],
  },
  {
    id: "310",
    title: "31.0 - Avaliação do local de aplicação",
    path: "/avaliacao-local-aplicacao",
    ordem: 31.0,
    tags: [
      "aplicacao", "aplicação", "injeção",
      "local", "sítio", "site",
      "tratamento",
      "dermatologia", "pele",
      "reação", "edema", "inchaço", "dor", "rubor",
      "avaliação", "score"
    ],
  },
  {
    id: "320",
    title: "32.0 - Triagem Bovinos",
    path: "/triagem-bovinos",
    ordem: 32.0,
    tags: [
      "bovino", "bovinos", "Bovinos",
      "vaca", "vacas", "boi", "bezerro",
      "triagem", "Triagem", "screening",
      "selecao", "seleção",
      "animal", "animais",
      "chegada", "recepção", "conferência", "exame inicial"
    ],
  },
  {
    id: "330",
    title: "33.0 - Recebimento e custódia do produto Veterinário Investigacional (PVI)",
    path: "/recebimento-custodia",
    ordem: 33.0,
    tags: [
      "produto", "veterinario", "investigacional", "PVI",
      "recebimento", "Recebimento", "chegada",
      "custodia", "custódia", "guarda",
      "conferência", "nota fiscal", "lote", "validade",
      "cadeia de frio", "armazenagem"
    ],
  },
  {
    id: "340",
    title: "34.0 - Destinação do Produto Veterinário Investigacional (PVI) em desacordo ou não utilizado",
    path: "/destinacao-desacordo-inutilizado",
    ordem: 34.0,
    tags: [
      "produto", "veterinario", "investigacional", "PVI",
      "desacordo", "irregularidade", "falha",
      "inutilizado", "sobra", "resto",
      "destinacao", "destinação", "destino",
      "devolução", "descarte", "quebra", "vencido", "expirado"
    ],
  },
  {
    id: "900",
    title: "Formulário de Consentimento Livre e Esclarecido (TCLE)",
    path: "/tcle",
    ordem: 90.0,
    tags: [
      "tcle", "TCLE", "termo",
      "consentimento", "Consentimento",
      "humano", "paciente", "voluntário", "participante",
      "clinico", "clinica", "ética",
      "assinatura", "legal", "jurídico", "esclarecimento"
    ],
  },
  {
    id: "910",
    title: "Termo de Assentimento Livre e Esclarecido (TALE)",
    path: "/tale",
    ordem: 90.1,
    tags: [
      "tale", "TALE",
      "assentimento", "Assentimento",
      "humano", "paciente",
      "clinico", "clinica",
      "criança", "menor", "adolescente", "pediatria",
      "responsável", "tutor", "pais", "ética"
    ],
  },
];

// ---
// PASSO 2: Schema e Defaults
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

// --- Componente Header ---
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

// ---
// PASSO 3: O Componente Principal
// ---
const FormularioAnexos = () => {
  const navigate = useNavigate();
  const { id: protocoloMestreId } = useParams<{ id: string }>();
  const { toast } = useToast();

  // --- Estados ---
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false); // Estado para "Salvar" (sem avançar)
  const [error, setError] = useState<string | null>(null);
  const [protocoloVersaoId, setProtocoloVersaoId] = useState<number | null>(null);
  
  // Duas listas: Sugeridos e Todos
  const [formulariosSugeridos, setFormulariosSugeridos] = useState<typeof ALL_PROTOCOL_FORMS>([]);
  const [todosFormularios, setTodosFormularios] = useState<typeof ALL_PROTOCOL_FORMS>(ALL_PROTOCOL_FORMS.sort((a, b) => a.ordem - b.ordem));

  const { control, handleSubmit, formState: { errors }, reset, getValues } = useForm<FormValues>({
    resolver: yupResolver(validationSchema),
    defaultValues: getDefaultValues()
  });

  // --- Efeito: Carregar dados da API e Filtrar ---
  useEffect(() => {
    if (!protocoloMestreId) {
      setError("ID do protocolo não encontrado. (Modo Rascunho)");
      setIsLoading(false);
      // Carrega do localStorage se for rascunho
      const storageKey = `dadosAnexos_${"draft"}`;
      const savedData = JSON.parse(localStorage.getItem(storageKey) || "null");
      if (savedData) reset(savedData);
      return;
    }

    const fetchDados = async () => {
      setIsLoading(true);
      setError(null);
      
      const apiKey = "2NtzCUDl8Ib2arnDRck0xK8taguGeFYuZqnUzpiZ9Wp-tUZ45--/i=tKxzwTPBvtykMSx!0t?7c/Z?NllkokY=TEC2DSonmOMUu0gxdCeh70/rA2NSsm7Ohjn7VM2BeP";
      let TOKEN = sessionStorage.getItem("token");

      if (!TOKEN) {
        navigate("/login");
        return;
      }
      TOKEN = TOKEN.replace(/"/g, "");

      try {
        const response = await fetch(
          `https://verita-brgchubha6ceathm.brazilsouth-01.azurewebsites.net/api/protocolo/versao/ativo/detalhes/${protocoloMestreId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${TOKEN}`,
              "X-API-KEY": apiKey,
            },
          }
        );

        if (!response.ok) {
           // Tenta ler mensagem de erro
           const text = await response.text();
           throw new Error(`Erro ${response.status}: ${text.slice(0, 100)}`);
        }

        const data = await response.json();
        
        // 1. Armazena o ID da versão para o POST
        if (data.id) setProtocoloVersaoId(data.id);

        // 2. Preenche os formulários já salvos (se houver)
        if (data.anexos && Array.isArray(data.anexos)) {
            const savedForms = getDefaultValues().formularios;
            data.anexos.forEach((idAnexo: number) => {
                const strId = String(idAnexo);
                if (savedForms.hasOwnProperty(strId)) {
                    savedForms[strId] = true;
                }
            });
            reset({ formularios: savedForms });
        } else {
            // Fallback para localStorage
            const storageKey = `dadosAnexos_${protocoloMestreId}`;
            const savedData = JSON.parse(localStorage.getItem(storageKey) || "null");
            if (savedData) reset(savedData);
        }

        // 3. Lógica de sugestão baseada na Introdução (palavras-chave)
        const palavrasChavesString = data.introducao?.palavrasChaves || data.introducao?.palavrasChave || "";
        const userKeywords = palavrasChavesString
          .split(/[,;]/)
          .map((k: string) => k.trim().toLowerCase())
          .filter((k: string) => k.length > 0);

        const filtrados = ALL_PROTOCOL_FORMS.filter((form) => {
          if (!form.tags) return true; // Sempre mostra os obrigatórios/comuns
          if (userKeywords.length > 0) {
             return form.tags.some((tag) => userKeywords.includes(tag.toLowerCase()));
          }
          return false;
        });

        // Atualiza estado de sugeridos
        const sugeridosOrdenados = filtrados.sort((a, b) => a.ordem - b.ordem);
        setFormulariosSugeridos(sugeridosOrdenados);

      } catch (err) {
        console.error("Erro ao carregar dados:", err);
        setError("Erro ao carregar dados do servidor.");
        // Em erro, sugeridos fica vazio (ou todos), mas a lista 'Todos' estará disponível abaixo.
        // Tenta recuperar do localStorage
        const storageKey = `dadosAnexos_${protocoloMestreId}`;
        const savedData = JSON.parse(localStorage.getItem(storageKey) || "null");
        if (savedData) reset(savedData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDados();
  }, [protocoloMestreId, navigate, reset]);

  // --- Função para Salvar na API ---
  const handleSaveApi = async (data: FormValues) => {
      if (!protocoloVersaoId) throw new Error("ID da versão do protocolo não identificado.");

      const apiKey = "2NtzCUDl8Ib2arnDRck0xK8taguGeFYuZqnUzpiZ9Wp-tUZ45--/i=tKxzwTPBvtykMSx!0t?7c/Z?NllkokY=TEC2DSonmOMUu0gxdCeh70/rA2NSsm7Ohjn7VM2BeP";
      let TOKEN = sessionStorage.getItem("token")?.replace(/"/g, "");

      const idsSelecionados = Object.entries(data.formularios)
        .filter(([_, isChecked]) => isChecked)
        .map(([id]) => parseInt(id, 10));

      const payload = {
          idProtocolo: protocoloVersaoId,
          anexos: idsSelecionados
      };

      const response = await fetch(
        `https://verita-brgchubha6ceathm.brazilsouth-01.azurewebsites.net/api/protocolo/versao/anexos`,
        {
            method: "POST",
            headers: { 
                "Content-Type": "application/json", 
                "Authorization": `Bearer ${TOKEN}`, 
                "X-API-KEY": apiKey 
            },
            body: JSON.stringify(payload)
        }
      );

      if (!response.ok) {
          const text = await response.text();
          let msg = `Erro ao salvar: ${text}`;
          try {
              const json = JSON.parse(text);
              if (json.message) msg = json.message;
          } catch {}
          throw new Error(msg);
      }

      setProtocoloVersaoId(prev => prev ? prev + 1 : null);
      localStorage.setItem(`dadosAnexos_${protocoloMestreId}`, JSON.stringify(data));
  };

  // --- Handler: Apenas Salvar ---
  const handleJustSave = async () => {
      setIsSaving(true);
      setError(null);
      try {
          const data = getValues();
          
          if (protocoloVersaoId) {
              await handleSaveApi(data);
              toast({
                  title: "Sucesso!",
                  description: "Anexos salvos com sucesso.",
                  action: <CheckCircle2 className="h-5 w-5 text-green-500" />,
                  className: "bg-green-50 border-green-200 text-green-800",
              });
          } else {
              localStorage.setItem(`dadosAnexos_${protocoloMestreId || "draft"}`, JSON.stringify(data));
              toast({ title: "Rascunho salvo localmente." });
          }
      } catch (err) {
          console.error(err);
          const msg = err instanceof Error ? err.message : "Erro desconhecido";
          setError(msg);
          toast({ variant: "destructive", title: "Erro ao salvar", description: msg });
      } finally {
          setIsSaving(false);
      }
  };

  // --- Handler: Salvar e Avançar ---
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setError(null);
    try {
      if (protocoloVersaoId) {
          await handleSaveApi(data);
      } else {
          localStorage.setItem(`dadosAnexos_${protocoloMestreId || "draft"}`, JSON.stringify(data));
      }
      
      navigate(`/bibliografia/${protocoloMestreId}`);
    } catch (err) {
      console.error("Erro no submit:", err);
      const msg = err instanceof Error ? err.message : "Erro ao salvar";
      setError(msg);
      toast({ variant: "destructive", title: "Erro", description: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-br from-gray-100 to-gray-200 font-inter">
      <FormHeader />

      <main className="flex-1 flex flex-col items-center justify-center py-12 px-4">
        <div className="w-full max-w-4xl rounded-xl p-6 sm:p-8 bg-white/70 backdrop-blur-md shadow-xl border border-white/30 relative">
            
            {isLoading && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm rounded-xl">
                    <Loader2 className="w-10 h-10 animate-spin text-green-600" />
                </div>
            )}

            <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">
                13. Anexos - Formulários de Registro
            </h2>

            {error && (
                <div className="mb-6 flex items-center gap-2 rounded-md border border-red-300 bg-red-50 p-4 text-red-700">
                <AlertCircle className="h-5 w-5" />
                <p>{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            
            {/* SEÇÃO 1: SUGESTÕES */}
            <div>
                <Label className="text-base font-semibold text-gray-700 block mb-2">
                    {isLoading 
                        ? "Carregando sugestões..." 
                        : "Sugestões (Baseado na Introdução):"}
                </Label>
                
                {!isLoading && (
                    <div className="space-y-3 rounded-md border p-4 max-h-[300px] overflow-y-auto bg-green-50/30 border-green-200">
                        {formulariosSugeridos.length > 0 ? (
                            formulariosSugeridos.map((form) => (
                                <div key={form.id} className="flex items-center space-x-3 hover:bg-white p-2 rounded transition-colors">
                                    <Controller
                                        name={`formularios.${form.id}` as any}
                                        control={control}
                                        render={({ field }) => (
                                            <Checkbox
                                                id={`sug-${form.id}`}
                                                checked={field.value || false}
                                                onCheckedChange={field.onChange}
                                                className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                                            />
                                        )}
                                    />
                                    <Label htmlFor={`sug-${form.id}`} className="font-normal cursor-pointer text-gray-700 flex-1">
                                        {form.title}
                                    </Label>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-center py-4 text-sm">Nenhuma sugestão específica encontrada.</p>
                        )}
                    </div>
                )}
            </div>

            {/* SEÇÃO 2: TODOS OS FORMULÁRIOS */}
            <div>
                <Label className="text-base font-semibold text-gray-700 block mb-2">
                    Todos os Formulários Disponíveis:
                </Label>
                
                <div className="space-y-3 rounded-md border p-4 max-h-[400px] overflow-y-auto bg-gray-50/50">
                    {todosFormularios.map((form) => (
                        <div key={form.id} className="flex items-center space-x-3 hover:bg-white p-2 rounded transition-colors border-b border-gray-100 last:border-0">
                            <Controller
                                name={`formularios.${form.id}` as any}
                                control={control}
                                render={({ field }) => (
                                    <Checkbox
                                        id={`all-${form.id}`}
                                        checked={field.value || false}
                                        onCheckedChange={field.onChange}
                                        className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                    />
                                )}
                            />
                            <Label htmlFor={`all-${form.id}`} className="font-normal cursor-pointer text-gray-700 flex-1 text-sm">
                                {form.title}
                            </Label>
                        </div>
                    ))}
                </div>
                
                {errors.formularios && (
                    <p className="text-red-500 text-sm mt-2 font-medium">Selecione pelo menos um formulário.</p>
                )}
            </div>

            {/* --- Botões de Ação --- */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                disabled={isSubmitting || isSaving}
                className="text-gray-800 bg-white/80 hover:bg-gray-50"
              >
                Voltar
              </Button>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleJustSave}
                  disabled={
                    !protocoloVersaoId ||
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

                <Button
                  type="submit"
                  className="bg-[#90EE90] hover:bg-[#7CCD7C] text-green-950 font-bold px-8 py-3 text-lg h-auto rounded-md transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={isSubmitting || isSaving}
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

export default FormularioAnexos;