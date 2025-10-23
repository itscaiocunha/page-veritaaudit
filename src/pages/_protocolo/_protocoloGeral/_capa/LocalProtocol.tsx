import { useState, useEffect, useMemo } from "react";
import { useForm, useFieldArray, Controller, FieldPath } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Plus, ChevronDown, ChevronUp } from "lucide-react";

// --- Helpers e Componentes Auxiliares ---
const phoneRegExp = /^\(\d{2}\) \d{4,5}-\d{4}$/;
const cepRegExp = /^\d{5}-\d{3}$/;

const applyPhoneMask = (value: string) => {
  if (!value) return "";
  return value
    .replace(/\D/g, "")
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d)(\d{4})$/, "$1-$2")
    .slice(0, 15);
};

const applyCepMask = (value: string) => {
  if (!value) return "";
  return value.replace(/\D/g, "").replace(/^(\d{5})(\d)/, "$1-$2").slice(0, 9);
};

const RequiredField = ({ children }: { children: React.ReactNode }) => (
  <>
    {children} <span className="text-red-500 font-bold">*</span>
  </>
);

const LoadingSpinner = () => (
  <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
);

// --- Schemas de Validação ---
const addressSchema = yup.object().shape({
  cep: yup.string().matches(cepRegExp, "CEP inválido. Use XXXXX-XXX").required("O CEP é obrigatório."),
  logradouro: yup.string().required("O logradouro é obrigatório."),
  numero: yup.string().required("O número é obrigatório."),
  complemento: yup.string(),
  bairro: yup.string().required("O bairro é obrigatório."),
  cidade: yup.string().required("A cidade é obrigatória."),
  uf: yup.string().required("O UF é obrigatório."),
});

const etapaClinicaSchema = yup.object().shape({
  identificacao: yup.string().required("A identificação é obrigatória."),
  telefone: yup.string().matches(phoneRegExp, "Formato: (XX) XXXXX-XXXX").required("O telefone é obrigatório."),
  email: yup.string().email("Digite um e-mail válido.").required("O e-mail é obrigatório."),
  registroCiaep: yup.string().required("O N° de Registro CIAEP é obrigatório."),
  responsavel: yup.string().required("O responsável é obrigatório."),
  expanded: yup.boolean(),
  endereco: addressSchema,
});

const etapaLaboratorialSchema = yup.object().shape({
  identificacao: yup.string().required("A identificação é obrigatória."),
  telefone: yup.string().matches(phoneRegExp, "Formato: (XX) XXXXX-XXXX").required("O telefone é obrigatório."),
  email: yup.string().email("Digite um e-mail válido.").required("O e-mail é obrigatório."),
  credenciamento: yup.string().required("O credenciamento é obrigatório."),
  expanded: yup.boolean(),
  endereco: addressSchema,
});

const etapaEstatisticaSchema = yup.object().shape({
  identificacao: yup.string().required("A identificação é obrigatória."),
  telefone: yup.string().matches(phoneRegExp, "Formato: (XX) XXXXX-XXXX").required("O telefone é obrigatório."),
  email: yup.string().email("Digite um e-mail válido.").required("O e-mail é obrigatório."),
  numeroRegistro: yup.string().required("O número de registro é obrigatório."), // <-- incluído
  expanded: yup.boolean(),
  endereco: addressSchema,
});

const createValidationSchema = (activeSections: { clinica: boolean; laboratorial: boolean; estatistica: boolean }) =>
  yup
    .object()
    .shape({
      etapasClinicas: activeSections.clinica
        ? yup.array().of(etapaClinicaSchema).min(1, "Adicione pelo menos uma etapa clínica.")
        : yup.array().of(etapaClinicaSchema),
      etapasLaboratoriais: activeSections.laboratorial
        ? yup.array().of(etapaLaboratorialSchema).min(1, "Adicione pelo menos uma etapa laboratorial.")
        : yup.array().of(etapaLaboratorialSchema),
      etapasEstatisticas: activeSections.estatistica
        ? yup.array().of(etapaEstatisticaSchema).min(1, "Adicione pelo menos uma etapa estatística.")
        : yup.array().of(etapaEstatisticaSchema),
    })
    .test(
      "at-least-one-section-selected",
      "Selecione e preencha pelo menos uma das etapas.",
      () => activeSections.clinica || activeSections.laboratorial || activeSections.estatistica
    );

type FormValues = yup.InferType<ReturnType<typeof createValidationSchema>>;
type ArrayName = "etapasClinicas" | "etapasLaboratoriais" | "etapasEstatisticas";

// --- Helpers numéricos / arrays (com fallbacks) ---
const toIntOptional = (v: any): number | undefined => {
  if (v === null || v === undefined || v === "") return undefined;
  const n = parseInt(String(v), 10);
  return Number.isFinite(n) ? n : undefined;
};

// pega o primeiro número válido em uma lista de candidatos
const firstIntOrUndefined = (...candidates: any[]): number | undefined => {
  for (const c of candidates) {
    const n = toIntOptional(c);
    if (n !== undefined) return n;
  }
  return undefined;
};

const toIntOrError = (label: string, ...candidates: any[]): number => {
  const n = firstIntOrUndefined(...candidates);
  if (n === undefined) throw new Error(`Campo obrigatório ausente ou inválido: ${label}.`);
  return n;
};

// aceita plural/singular e converte para [{id:number}]
const formatIdArraySafe = (...possibleArrays: any[]): { id: number }[] => {
  const arr = possibleArrays.find((a) => Array.isArray(a)) as (string | number)[] | undefined;
  if (!arr) return [];
  return arr
    .map((id) => (typeof id === "string" ? parseInt(id, 10) : id))
    .filter((n) => Number.isFinite(n))
    .map((n) => ({ id: n as number }));
};

const stripEmpty = <T extends Record<string, any>>(obj: T): T => {
  const out: any = {};
  Object.entries(obj).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    if (typeof v === "string" && v.trim() === "") return;
    out[k] = v;
  });
  return out;
};

const transformAddress = (endereco: any) => {
  const addr = {
    cep: (endereco?.cep || "").replace(/\D/g, ""),
    rua: endereco?.logradouro,
    bairro: endereco?.bairro,
    numeral:
      endereco?.numero && String(endereco.numero).trim() !== ""
        ? parseInt(endereco.numero, 10)
        : undefined,
    complemento: endereco?.complemento, // pode ser undefined
    uf: (endereco?.uf || "").toUpperCase().slice(0, 2),
    cidade: endereco?.cidade,
  };
  return stripEmpty(addr);
};


const transformClinicaData = (etapas: any[] | undefined) => {
  if (!etapas) return [];
  return etapas.map((etapa) => ({
    nome: etapa.identificacao,
    telefone: (etapa.telefone || "").replace(/\D/g, ""),
    email: etapa.email,
    numeroRegistro: etapa.registroCiaep,
    responsavel: etapa.responsavel,
    // geolocalizacao REMOVIDO do payload
    endereco: transformAddress(etapa.endereco),
  }));
};

const transformLaboratorialData = (etapas: any[] | undefined) => {
  if (!etapas) return [];
  return etapas.map((etapa) => ({
    nome: etapa.identificacao,
    telefone: (etapa.telefone || "").replace(/\D/g, ""),
    email: etapa.email,
    numeroRegistro: etapa.credenciamento, // mapeado para numeroRegistro
    endereco: transformAddress(etapa.endereco),
  }));
};

const transformEstatisticaData = (etapas: any[] | undefined) => {
  if (!etapas) return [];
  return etapas.map((etapa) => ({
    nome: etapa.identificacao,
    telefone: (etapa.telefone || "").replace(/\D/g, ""),
    email: etapa.email,
    numeroRegistro: etapa.numeroRegistro, // <-- incluído no payload
    endereco: transformAddress(etapa.endereco),
  }));
};

// --- COMPONENTE PRINCIPAL ---
const LocalProtocol = () => {
  // --- Sempre voltar ao topo ao carregar a página ---
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [loadingCep, setLoadingCep] = useState<string | null>(null);
  const [activeSections, setActiveSections] = useState({
    clinica: false,
    laboratorial: false,
    estatistica: false,
  });

  const validationSchema = useMemo(() => createValidationSchema(activeSections), [activeSections]);

  const defaultAddress = { cep: "", logradouro: "", numero: "", complemento: "", bairro: "", cidade: "", uf: "" };

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    setFocus,
    trigger,
    reset,
  } = useForm<FormValues>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      etapasClinicas: [],
      etapasLaboratoriais: [],
      etapasEstatisticas: [],
    },
  });

  const watchedValues = watch();

  const { fields: clinicaFields, append: appendClinica, remove: removeClinica } = useFieldArray({
    control,
    name: "etapasClinicas",
  });
  const { fields: laboratorialFields, append: appendLaboratorial, remove: removeLaboratorial } = useFieldArray({
    control,
    name: "etapasLaboratoriais",
  });
  const { fields: estatisticaFields, append: appendEstatistica, remove: removeEstatistica } = useFieldArray({
    control,
    name: "etapasEstatisticas",
  });

  // --- Carregar do localStorage ---
  useEffect(() => {
    try {
      const savedDataString = localStorage.getItem("dataLocal");
      if (savedDataString) {
        const savedData = JSON.parse(savedDataString)[0];
        const newActiveSections = {
          clinica: !!savedData.etapasClinicas?.length,
          laboratorial: !!savedData.etapasLaboratoriais?.length,
          estatistica: !!savedData.etapasEstatisticas?.length,
        };
        setActiveSections(newActiveSections);
        reset(savedData);
      } else {
        // Estado inicial
        setActiveSections({ clinica: true, laboratorial: false, estatistica: false });
        setValue("etapasClinicas", [
          {
            identificacao: "",
            telefone: "",
            email: "",
            registroCiaep: "",
            responsavel: "",
            expanded: true,
            endereco: defaultAddress,
          },
        ]);
      }
    } catch (error) {
      console.error("Erro ao carregar dados do localStorage:", error);
    }
  }, [reset, setValue]);

  // --- Salvar no localStorage (debounced) ---
  useEffect(() => {
    const debounceSave = setTimeout(() => {
      const hasActiveSections = activeSections.clinica || activeSections.laboratorial || activeSections.estatistica;
      if (hasActiveSections) {
        const dataToSave = {
          etapasClinicas: activeSections.clinica ? watchedValues.etapasClinicas : [],
          etapasLaboratoriais: activeSections.laboratorial ? watchedValues.etapasLaboratoriais : [],
          etapasEstatisticas: activeSections.estatistica ? watchedValues.etapasEstatisticas : [],
        };
        localStorage.setItem("dataLocal", JSON.stringify([dataToSave]));
      }
    }, 500);

    return () => clearTimeout(debounceSave);
  }, [watchedValues, activeSections]);

  const handleSectionToggle = (section: keyof typeof activeSections) => {
    const newActiveSections = { ...activeSections, [section]: !activeSections[section] };
    setActiveSections(newActiveSections);

    const sectionName = `etapas${section.charAt(0).toUpperCase() + section.slice(1)}` as ArrayName;

    if (!newActiveSections[section]) {
      setValue(sectionName, []);
    } else {
      const defaultValues: any = { identificacao: "", telefone: "", email: "", expanded: true, endereco: defaultAddress };
      if (section === "clinica") Object.assign(defaultValues, { registroCiaep: "", responsavel: "" });
      if (section === "laboratorial") Object.assign(defaultValues, { credenciamento: "" });
      if (section === "estatistica") Object.assign(defaultValues, { numeroRegistro: "" });
      setValue(sectionName, [defaultValues], { shouldValidate: true, shouldDirty: true, shouldTouch: true });
    }
    trigger();
  };

  const onSubmit = async (formData: FormValues) => {
    setIsSubmitting(true);
    setApiError(null);

    try {
      // 1) carregar etapas anteriores
      const capaDataString = localStorage.getItem("capaProtocolData");
      const patrocinadorDataString = localStorage.getItem("dataPatrocinador");
      const instituicaoDataString = localStorage.getItem("dataInstituicao");

      if (!capaDataString || !patrocinadorDataString || !instituicaoDataString) {
        throw new Error("Dados de etapas anteriores não encontrados. Por favor, preencha as etapas de Capa, Patrocinador e Instituição.");
      }

      const rawCapaData = JSON.parse(capaDataString);
      const capaData = Array.isArray(rawCapaData) ? rawCapaData[0] : rawCapaData;

      const rawPatrocinadorData = JSON.parse(patrocinadorDataString);
      const patrocinadorData = Array.isArray(rawPatrocinadorData) ? rawPatrocinadorData[0] : rawPatrocinadorData;

      const instituicaoData = JSON.parse(instituicaoDataString);

      // 2) montar payload EXATAMENTE como backend espera
      const payload = {
        titulo: capaData?.protocolo?.titulo,
        tipoEstudo: capaData?.protocolo?.tipoEstudo,
        classeTerapeutica: capaData?.protocolo?.tipoProduto,
        especieAnimal: capaData?.protocolo?.especie,
        responsavel: capaData?.protocolo?.responsavel,

        patrocinadorId: toIntOrError("patrocinadorId", patrocinadorData?.patrocinadorId, capaData?.protocolo?.patrocinadorId),
        representanteId: toIntOrError("representanteId", patrocinadorData?.representanteId, capaData?.protocolo?.representanteId),

        // aceita plural/singular
        monitores: formatIdArraySafe(patrocinadorData?.monitoresId, patrocinadorData?.monitorId),
        equipeTecnicaPatrocinador: formatIdArraySafe(patrocinadorData?.tecnicosId, patrocinadorData?.tecnicoId),

        instituicaoId: toIntOrError("instituicaoId", capaData?.protocolo?.instituicaoId, instituicaoData?.instituicaoId),
        investigadorId: toIntOrError("investigadorId", instituicaoData?.investigadorId),

        equipeTecnicaInstituicao: formatIdArraySafe(instituicaoData?.equipeIds),

        etapaClinica: activeSections.clinica ? transformClinicaData(formData.etapasClinicas) : [],
        etapaLaboratorial: activeSections.laboratorial ? transformLaboratorialData(formData.etapasLaboratoriais) : [],
        etapaEstatistica: activeSections.estatistica ? transformEstatisticaData(formData.etapasEstatisticas) : [],
      };

      console.log("JSON Body Enviado:", JSON.stringify(payload, null, 2));

      // 3) chamada API
      const jwtToken = sessionStorage.getItem("token");
      if (!jwtToken) throw new Error("Token de autenticação não encontrado. Por favor, faça login novamente.");

      const baseUrl = "https://verita-brgchubha6ceathm.brazilsouth-01.azurewebsites.net";
      const apiKey =
        "2NtzCUDl8Ib2arnDRck0xK8taguGeFYuZqnUzpiZ9Wp-tUZ45--/i=tKxzwTPBvtykMSx!0t?7c/Z?NllkokY=TEC2DSonmOMUu0gxdCeh70/rA2NSsm7Ohjn7VM2BeP";

      const response = await fetch(`${baseUrl}/api/protocolo`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwtToken}`,
          "X-API-KEY": apiKey,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json().catch(() => ({}));
        console.log("Protocolo criado com sucesso:", data);

      localStorage.setItem("dataLocal", JSON.stringify([formData]));
      localStorage.setItem("dataRequest", JSON.stringify(data));

        navigate("/dashboard");
      } else {
        let errorText = "";
        try {
          const errorData = await response.json();
          errorText = JSON.stringify(errorData?.errors || errorData);
        } catch {
          errorText = await response.text();
        }
        throw new Error(`Erro na API (${response.status} ${response.statusText}): ${errorText}`);
      }
    } catch (error: any) {
      console.error("Erro ao submeter o protocolo:", error);
      setApiError(error.message || "Ocorreu um erro desconhecido.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCepLookup = async (cep: string, arrayName: ArrayName, index: number) => {
    const cleanedCep = cep.replace(/\D/g, "");
    if (cleanedCep.length !== 8) return;

    const cepKey = `${arrayName}-${index}`;
    setLoadingCep(cepKey);

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanedCep}/json/`);
      if (!response.ok) throw new Error("CEP não encontrado.");

      const data = await response.json();
      if (data.erro) throw new Error("CEP inválido.");

      setValue(`${arrayName}.${index}.endereco.logradouro` as any, data.logradouro, { shouldValidate: true });
      setValue(`${arrayName}.${index}.endereco.bairro` as any, data.bairro, { shouldValidate: true });
      setValue(`${arrayName}.${index}.endereco.cidade` as any, data.localidade, { shouldValidate: true });
      setValue(`${arrayName}.${index}.endereco.uf` as any, data.uf, { shouldValidate: true });

      setFocus(`${arrayName}.${index}.endereco.numero` as any);
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
    } finally {
      setLoadingCep(null);
    }
  };

  const toggleArrayItem = (arrayName: ArrayName, index: number) => {
    const fieldName = `${arrayName}.${index}.expanded` as const;
    setValue(fieldName as any, !watch(fieldName as any));
  };

  const renderAddressFields = (arrayName: ArrayName, index: number) => {
    const cepKey = `${arrayName}-${index}`;
    const fieldErrors = (errors as any)[arrayName]?.[index]?.endereco;

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <Label>
              <RequiredField>CEP</RequiredField>
            </Label>
            <div className="flex items-center gap-2">
              <Controller
                name={`${arrayName}.${index}.endereco.cep` as FieldPath<FormValues>}
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    value={typeof value === "string" ? value : ""}
                    onChange={(e) => onChange(applyCepMask(e.target.value))}
                    onBlur={(e) => {
                      onBlur();
                      handleCepLookup(e.target.value, arrayName, index);
                    }}
                    maxLength={9}
                  />
                )}
              />
              {loadingCep === cepKey && <LoadingSpinner />}
            </div>
            <p className="text-red-500 text-xs mt-1 h-4">{fieldErrors?.cep?.message}</p>
          </div>
          <div className="md:col-span-2">
            <Label>
              <RequiredField>Logradouro</RequiredField>
            </Label>
            <Input {...register(`${arrayName}.${index}.endereco.logradouro` as FieldPath<FormValues>)} />
            <p className="text-red-500 text-xs mt-1 h-4">{fieldErrors?.logradouro?.message}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <Label>
              <RequiredField>Número</RequiredField>
            </Label>
            <Input {...register(`${arrayName}.${index}.endereco.numero` as FieldPath<FormValues>)} />
            <p className="text-red-500 text-xs mt-1 h-4">{fieldErrors?.numero?.message}</p>
          </div>
          <div className="md:col-span-2">
            <Label>Complemento (Opcional)</Label>
            <Input {...register(`${arrayName}.${index}.endereco.complemento` as FieldPath<FormValues>)} />
            <p className="text-red-500 text-xs mt-1 h-4">{fieldErrors?.complemento?.message}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>
              <RequiredField>Bairro</RequiredField>
            </Label>
            <Input {...register(`${arrayName}.${index}.endereco.bairro` as FieldPath<FormValues>)} />
            <p className="text-red-500 text-xs mt-1 h-4">{fieldErrors?.bairro?.message}</p>
          </div>
          <div>
            <Label>
              <RequiredField>Cidade</RequiredField>
            </Label>
            <Input {...register(`${arrayName}.${index}.endereco.cidade` as FieldPath<FormValues>)} />
            <p className="text-red-500 text-xs mt-1 h-4">{fieldErrors?.cidade?.message}</p>
          </div>
          <div>
            <Label>
              <RequiredField>UF</RequiredField>
            </Label>
            <Input {...register(`${arrayName}.${index}.endereco.uf` as FieldPath<FormValues>)} />
            <p className="text-red-500 text-xs mt-1 h-4">{fieldErrors?.uf?.message}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-200">
      {/* --- Cabeçalho --- */}
      <header className="bg-white/30 backdrop-blur-lg shadow-sm w-full p-4 flex items-center justify-center relative border-b border-white/20">
        <Button
            onClick={() => navigate(-1)}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-gray hover:bg-gray-300 text-gray-800 font-semibold py-2 px-3 rounded-lg inline-flex items-center text-sm"
          >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="hidden sm:inline">Voltar</span>
        </Button>
        <h1 className="text-xl sm:text-2xl font-bold text-center text-gray-800">Verita Audit</h1>
      </header>

      <div className="w-full flex flex-col justify-center items-center p-4 md:p-8 flex-grow">
        <div className="w-full max-w-4xl rounded-2xl p-6 md:p-8 bg-white/30 backdrop-blur-lg shadow-xl border border-white/20">
          <h1 className="text-2xl md:text-3xl font-semibold text-center mb-6 text-gray-800">Local da Execução do Protocolo</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* --- Etapa Clínica --- */}
            <div className="border rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4">
                  <Checkbox
                    id="toggleClinica"
                    checked={activeSections.clinica}
                    onCheckedChange={() => handleSectionToggle("clinica")}
                    className="data-[state=checked]:bg-green-400"
                  />
                  <label htmlFor="toggleClinica" className="text-xl font-semibold text-gray-800 cursor-pointer">
                    Etapa Clínica
                  </label>
                </div>
                {activeSections.clinica && (
                  <Button
                    type="button"
                    size="sm"
                    className="bg-green-400 hover:bg-green-500 text-white"
                    onClick={() =>
                      appendClinica({
                        identificacao: "",
                        telefone: "",
                        email: "",
                        registroCiaep: "",
                        responsavel: "",
                        expanded: true,
                        endereco: defaultAddress,
                      })
                    }
                  >
                    <Plus className="h-4 w-4 mr-2" /> Adicionar Local
                  </Button>
                )}
              </div>
              {activeSections.clinica && (
                <div className="space-y-6">
                  {clinicaFields.map((item, index) => {
                    const fieldErrors = (errors as any).etapasClinicas?.[index];
                    return (
                      <div key={item.id} className="border rounded-lg bg-gray-50/50">
                        <div className="flex justify-between items-center p-4 cursor-pointer" onClick={() => toggleArrayItem("etapasClinicas", index)}>
                          <h3 className="font-semibold text-gray-700">{watch(`etapasClinicas.${index}.identificacao`) || "Novo Local da Etapa Clínica"}</h3>
                          {watch(`etapasClinicas.${index}.expanded`) ? <ChevronUp className="h-5 w-5 text-gray-600" /> : <ChevronDown className="h-5 w-5 text-gray-600" />}
                        </div>
                        {watch(`etapasClinicas.${index}.expanded`) && (
                          <div className="p-4 border-t space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="md:col-span-2">
                                <Label>
                                  <RequiredField>Identificação/Nome</RequiredField>
                                </Label>
                                <Input {...register(`etapasClinicas.${index}.identificacao` as const)} />
                                <p className="text-red-500 text-xs mt-1 h-4">{fieldErrors?.identificacao?.message}</p>
                              </div>
                              <div>
                                <Label>
                                  <RequiredField>Telefone</RequiredField>
                                </Label>
                                <Controller
                                  name={`etapasClinicas.${index}.telefone` as const}
                                  control={control}
                                  render={({ field: { onChange, value } }) => (
                                    <Input value={value || ""} onChange={(e) => onChange(applyPhoneMask(e.target.value))} type="tel" maxLength={15} />
                                  )}
                                />
                                <p className="text-red-500 text-xs mt-1 h-4">{fieldErrors?.telefone?.message}</p>
                              </div>
                              <div>
                                <Label>
                                  <RequiredField>E-mail</RequiredField>
                                </Label>
                                <Input {...register(`etapasClinicas.${index}.email` as const)} />
                                <p className="text-red-500 text-xs mt-1 h-4">{fieldErrors?.email?.message}</p>
                              </div>
                              <div>
                                <Label>
                                  <RequiredField>N° Registro CIAEP</RequiredField>
                                </Label>
                                <Input {...register(`etapasClinicas.${index}.registroCiaep` as const)} />
                                <p className="text-red-500 text-xs mt-1 h-4">{fieldErrors?.registroCiaep?.message}</p>
                              </div>
                              <div className="md:col-span-2">
                                <Label>
                                  <RequiredField>Responsável pela Unidade</RequiredField>
                                </Label>
                                <Input {...register(`etapasClinicas.${index}.responsavel` as const)} />
                                <p className="text-red-500 text-xs mt-1 h-4">{fieldErrors?.responsavel?.message}</p>
                              </div>
                            </div>
                            <div className="pt-4 mt-4 border-t">
                              <h4 className="font-semibold mb-4 text-gray-700">Endereço do Local</h4>
                              {renderAddressFields("etapasClinicas", index)}
                            </div>
                            <div className="flex justify-end">
                              <Button type="button" variant="ghost" size="sm" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => removeClinica(index)}>
                                <Trash2 className="h-4 w-4 mr-1.5" /> Remover Local
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {(errors as any).etapasClinicas?.message && <p className="text-red-500 text-sm mt-2">{(errors as any).etapasClinicas.message}</p>}
                </div>
              )}
            </div>

            {/* --- Etapa Laboratorial --- */}
            <section className="border border-gray-200 rounded-xl p-6 transition-all">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4">
                  <Checkbox
                    id="toggleLaboratorial"
                    checked={activeSections.laboratorial}
                    onCheckedChange={() => handleSectionToggle("laboratorial")}
                    className="data-[state=checked]:bg-green-400"
                  />
                  <label htmlFor="toggleLaboratorial" className="text-xl font-semibold text-gray-800 cursor-pointer">
                    Etapa Laboratorial/Analítica
                  </label>
                </div>
                {activeSections.laboratorial && (
                  <Button
                    type="button"
                    size="sm"
                    className="bg-green-400 hover:bg-green-500 text-white"
                    onClick={() =>
                      appendLaboratorial({
                        identificacao: "",
                        telefone: "",
                        email: "",
                        credenciamento: "",
                        expanded: true,
                        endereco: defaultAddress,
                      })
                    }
                  >
                    <Plus className="h-4 w-4 mr-2" /> Adicionar Local
                  </Button>
                )}
              </div>
              {activeSections.laboratorial && (
                <div className="space-y-6">
                  {laboratorialFields.map((item, index) => {
                    const fieldErrors = (errors as any).etapasLaboratoriais?.[index];
                    return (
                      <div key={item.id} className="border rounded-lg bg-gray-50/50">
                        <div className="flex justify-between items-center p-4 cursor-pointer" onClick={() => toggleArrayItem("etapasLaboratoriais", index)}>
                          <h3 className="font-semibold text-gray-700">{watch(`etapasLaboratoriais.${index}.identificacao`) || "Novo Local da Etapa Laboratorial"}</h3>
                          {watch(`etapasLaboratoriais.${index}.expanded`) ? <ChevronUp className="h-5 w-5 text-gray-600" /> : <ChevronDown className="h-5 w-5 text-gray-600" />}
                        </div>
                        {watch(`etapasLaboratoriais.${index}.expanded`) && (
                          <div className="p-4 border-t space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                              <div className="md:col-span-2">
                                <Label>
                                  <RequiredField>Identificação/Nome</RequiredField>
                                </Label>
                                <Input {...register(`etapasLaboratoriais.${index}.identificacao` as const)} />
                                <p className="text-red-500 text-xs mt-1 h-4">{fieldErrors?.identificacao?.message}</p>
                              </div>
                              <div>
                                <Label>
                                  <RequiredField>Telefone</RequiredField>
                                </Label>
                                <Controller
                                  name={`etapasLaboratoriais.${index}.telefone` as const}
                                  control={control}
                                  render={({ field: { onChange, value } }) => (
                                    <Input value={value || ""} onChange={(e) => onChange(applyPhoneMask(e.target.value))} type="tel" maxLength={15} />
                                  )}
                                />
                                <p className="text-red-500 text-xs mt-1 h-4">{fieldErrors?.telefone?.message}</p>
                              </div>
                              <div>
                                <Label>
                                  <RequiredField>E-mail</RequiredField>
                                </Label>
                                <Input {...register(`etapasLaboratoriais.${index}.email` as const)} />
                                <p className="text-red-500 text-xs mt-1 h-4">{fieldErrors?.email?.message}</p>
                              </div>
                              <div className="md:col-span-2">
                                <Label>
                                  <RequiredField>Credenciamento</RequiredField>
                                </Label>
                                <Input {...register(`etapasLaboratoriais.${index}.credenciamento` as const)} />
                                <p className="text-red-500 text-xs mt-1 h-4">{fieldErrors?.credenciamento?.message}</p>
                              </div>
                            </div>
                            <div className="pt-4 mt-4 border-t">
                              <h4 className="font-semibold mb-4 text-gray-700">Endereço do Local</h4>
                              {renderAddressFields("etapasLaboratoriais", index)}
                            </div>
                            <div className="flex justify-end">
                              <Button type="button" variant="ghost" size="sm" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => removeLaboratorial(index)}>
                                <Trash2 className="h-4 w-4 mr-1.5" /> Remover Local
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {(errors as any).etapasLaboratoriais?.message && <p className="text-red-500 text-sm mt-2">{(errors as any).etapasLaboratoriais.message}</p>}
                </div>
              )}
            </section>

            {/* --- Etapa Estatística --- */}
            <section className="border border-gray-200 rounded-xl p-6 transition-all">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4">
                  <Checkbox
                    id="toggleEstatistica"
                    checked={activeSections.estatistica}
                    onCheckedChange={() => handleSectionToggle("estatistica")}
                    className="data-[state=checked]:bg-green-400"
                  />
                  <label htmlFor="toggleEstatistica" className="text-xl font-semibold text-gray-800 cursor-pointer">
                    Etapa Estatística
                  </label>
                </div>
                {activeSections.estatistica && (
                  <Button
                    type="button"
                    size="sm"
                    className="bg-green-400 hover:bg-green-500 text-white"
                    onClick={() =>
                      appendEstatistica({
                        identificacao: "",
                        telefone: "",
                        email: "",
                        numeroRegistro: "", // novo campo
                        expanded: true,
                        endereco: defaultAddress,
                      })
                    }
                  >
                    <Plus className="h-4 w-4 mr-2" /> Adicionar Local
                  </Button>
                )}
              </div>
              {activeSections.estatistica && (
                <div className="space-y-6">
                  {estatisticaFields.map((item, index) => {
                    const fieldErrors = (errors as any).etapasEstatisticas?.[index];
                    return (
                      <div key={item.id} className="border rounded-lg bg-gray-50/50">
                        <div className="flex justify-between items-center p-4 cursor-pointer" onClick={() => toggleArrayItem("etapasEstatisticas", index)}>
                          <h3 className="font-semibold text-gray-700">{watch(`etapasEstatisticas.${index}.identificacao`) || "Novo Local da Etapa Estatística"}</h3>
                          {watch(`etapasEstatisticas.${index}.expanded`) ? <ChevronUp className="h-5 w-5 text-gray-600" /> : <ChevronDown className="h-5 w-5 text-gray-600" />}
                        </div>
                        {watch(`etapasEstatisticas.${index}.expanded`) && (
                          <div className="p-4 border-t space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                              <div className="md:col-span-2">
                                <Label>
                                  <RequiredField>Identificação/Nome</RequiredField>
                                </Label>
                                <Input {...register(`etapasEstatisticas.${index}.identificacao` as const)} />
                                <p className="text-red-500 text-xs mt-1 h-4">{fieldErrors?.identificacao?.message}</p>
                              </div>
                              <div>
                                <Label>
                                  <RequiredField>Telefone</RequiredField>
                                </Label>
                                <Controller
                                  name={`etapasEstatisticas.${index}.telefone` as const}
                                  control={control}
                                  render={({ field: { onChange, value } }) => (
                                    <Input value={value || ""} onChange={(e) => onChange(applyPhoneMask(e.target.value))} type="tel" maxLength={15} />
                                  )}
                                />
                                <p className="text-red-500 text-xs mt-1 h-4">{fieldErrors?.telefone?.message}</p>
                              </div>
                              <div>
                                <Label>
                                  <RequiredField>E-mail</RequiredField>
                                </Label>
                                <Input {...register(`etapasEstatisticas.${index}.email` as const)} />
                                <p className="text-red-500 text-xs mt-1 h-4">{fieldErrors?.email?.message}</p>
                              </div>
                              <div className="md:col-span-2">
                                <Label>
                                  <RequiredField>Número de Registro</RequiredField>
                                </Label>
                                <Input {...register(`etapasEstatisticas.${index}.numeroRegistro` as const)} />
                                <p className="text-red-500 text-xs mt-1 h-4">{fieldErrors?.numeroRegistro?.message}</p>
                              </div>
                            </div>
                            <div className="pt-4 mt-4 border-t">
                              <h4 className="font-semibold mb-4 text-gray-700">Endereço do Local</h4>
                              {renderAddressFields("etapasEstatisticas", index)}
                            </div>
                            <div className="flex justify-end">
                              <Button type="button" variant="ghost" size="sm" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => removeEstatistica(index)}>
                                <Trash2 className="h-4 w-4 mr-1.5" /> Remover Local
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {(errors as any).etapasEstatisticas?.message && <p className="text-red-500 text-sm mt-2">{(errors as any).etapasEstatisticas.message}</p>}
                </div>
              )}
            </section>

            {apiError && <p className="text-red-500 text-center font-bold text-lg mt-4">{apiError}</p>}

            {/* --- Botão de Submissão --- */}
            <div className="flex justify-end pt-6">
              <Button type="submit" className="bg-[#90EE90] hover:bg-[#7CCD7C] text-white font-bold px-8 py-3 text-lg h-auto rounded-md" disabled={isSubmitting}>
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <LoadingSpinner /> A Salvar...
                  </div>
                ) : (
                  "Salvar e Avançar"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LocalProtocol;