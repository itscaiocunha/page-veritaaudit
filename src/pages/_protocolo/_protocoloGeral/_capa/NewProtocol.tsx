import { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as yup from "yup";

// --- Tipagem para os dados da API ---
interface ApiListItem {
  id: string;
  nome: string;
}

const Protocolo = () => {
  // --- Estados do Formulário ---
  const [titulo, setTitulo] = useState("");
  const [patrocinador, setPatrocinador] = useState("");
  const [instituicao, setInstituicao] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [tipoEstudo, setTipoEstudo] = useState("");
  const [tipoProduto, setTipoProduto] = useState("");
  const [especie, setEspecie] = useState("");
  const [outroTipoProduto, setOutroTipoProduto] = useState("");
  const [outraEspecie, setOutraEspecie] = useState("");

  // --- Estados para os IDs ---
  const [patrocinadorId, setPatrocinadorId] = useState("");
  const [instituicaoId, setInstituicaoId] = useState("");

  // --- Estados para dados da API ---
  const [patrocinadores, setPatrocinadores] = useState<ApiListItem[]>([]);
  const [instituicoes, setInstituicoes] = useState<ApiListItem[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);

  // --- Estados para controlar a visibilidade dos dropdowns ---
  const [showPatrocinadorOptions, setShowPatrocinadorOptions] = useState(false);
  const [showInstituicaoOptions, setShowInstituicaoOptions] = useState(false);

  // --- Refs para detectar cliques fora dos componentes ---
  const patrocinadorRef = useRef<HTMLDivElement>(null);
  const instituicaoRef = useRef<HTMLDivElement>(null);

  // --- Estado para Erros de Validação ---
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // --- Navegação de Páginas ---
  const navigate = useNavigate();

  // --- Função para formatar strings para o localStorage ---
  const formatStringForStorage = (str: string) => {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase()
      .replace(/\s+/g, '_');
  };

  // --- Esquema de Validação Yup ---
  const schema = yup.object().shape({
    titulo: yup.string().required("O título do protocolo é obrigatório"),
    patrocinadorId: yup.string().required("O Patrocinador do protocolo é obrigatório"),
    instituicaoId: yup.string().required("A Instituição do protocolo é obrigatória"),
    tipoEstudo: yup.string().required("O tipo de estudo é obrigatório"),
    tipoProduto: yup.string().required("A classe terapêutica é obrigatória"),
    especie: yup.string().required("A espécie animal é obrigatória"),
    responsavel: yup.string().required("O responsável pelo protocolo é obrigatório"),
  });

  // --- Lógica para buscar dados das APIs ---
  useEffect(() => {
    const fetchData = async () => {
      const token = sessionStorage.getItem('token');
      const baseUrl = "https://verita-brgchubha6ceathm.brazilsouth-01.azurewebsites.net";
      const apiKey = "2NtzCUDl8Ib2arnDRck0xK8taguGeFYuZqnUzpiZ9Wp-tUZ45--/i=tKxzwTPBvtykMSx!0t?7c/Z?NllkokY=TEC2DSonmOMUu0gxdCeh70/rA2NSsm7Ohjn7VM2BeP";

      if (!token) {
        setApiError("Token de autenticação não encontrado. Por favor, faça login novamente.");
        navigate('/login');
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json'
      };

      try {
        setApiError(null);
        const [patrocinadorResponse, instituicaoResponse] = await Promise.all([
          fetch(`${baseUrl}/api/patrocinador`, { headers }),
          fetch(`${baseUrl}/api/instituicao`, { headers })
        ]);

        if (!patrocinadorResponse.ok) throw new Error(`Falha ao buscar patrocinadores`);
        setPatrocinadores(await patrocinadorResponse.json());

        if (!instituicaoResponse.ok) throw new Error(`Falha ao buscar instituições`);
        setInstituicoes(await instituicaoResponse.json());

      } catch (error) {
        console.error("Erro ao buscar dados da API:", error);
        setApiError("Não foi possível carregar os dados. Verifique o console para mais detalhes.");
      }
    };

    fetchData();
  }, [navigate]);

  // --- Lógica para fechar os dropdowns ao clicar fora ---
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (patrocinadorRef.current && !patrocinadorRef.current.contains(event.target as Node)) {
            setShowPatrocinadorOptions(false);
        }
        if (instituicaoRef.current && !instituicaoRef.current.contains(event.target as Node)) {
            setShowInstituicaoOptions(false);
        }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  const TIPO_PRODUTO_OPTIONS = ["ANABOLIZANTES", "ANALGESICO", "ANESTESICO", "ANTIARRITMICO", "ANTICOCCIDIANO", "ANTICOLINERGICO", "ANTICONVULSIVANTE", "ANTIEMETICOS", "ANTIESPASMODICO", "ANTIFISETICOS", "ANTIHIPERTENSIVO", "ANTI-HISTAMINICOS", "ANTI-INFLAMATORIO_ESTEROIDAL", "ANTI-INFLAMATORIO_NAO_ESTEROIDAL", "ANTIMICROBIANOS", "ANTIMICROBIANOS_ADITIVOS_ANTIMICROBIANOS_ADITIVOS_MELHORADORES_DE_DESEMPENHO", "ANTINEOPLASICOS", "ANTIPARASITARIOS", "ANTIPIRETICO", "ANTISSEPTICO", "ANTIVIRAL", "BRONCODILATADOR", "COLINERGICO", "DESINFETANTE", "ESPASMOLITICO", "FITOTERAPICO", "HIDRATACAO_SUPORTE", "HORMONIOS", "IMUNOMODULADOR", "MUCOLITICO", "NEUROLITICO", "PESTICIDA", "PROTETOR_DE_MUCOSA", "RELAXANTE_MUSCULAR", "VITAMINAS_E_MINERAIS"];
  const ESPECIE_ANIMAL_OPTIONS = ["ANFIBIO", "AVE", "ABELHAS", "BOVINO", "BUBALINO", "CAO", "CAMUNDONGO_HETEROGENICO", "CAMUNDONGO_ISOGENICO", "CAMUNDONGO_KNOCKOUT", "CAMUNDONGO_TRANSGENICO", "CAPRINO", "CHINCHILA", "COBAIA", "COELHOS", "EQUIDEO", "ESPECIE_SILVESTRE_BRASILEIRA", "ESPECIE_SILVESTRE_NAO_BRASILEIRA", "GATO", "GERBIL", "HAMSTER", "MUARES", "OVINO", "PEIXE", "PRIMATA_NAO_HUMANO", "RATO_HETEROGENICO", "RATO_ISOGENICO", "RATO_KNOCKOUT", "RATO_TRANSGENICO", "REPTIL", "SUINO"];


  // --- Lógica para Carregar Dados Salvos do LocalStorage ---
  useEffect(() => {
    if (patrocinadores.length > 0 && instituicoes.length > 0) {
        const capaProtocolData = JSON.parse(localStorage.getItem('capaProtocolData') || '{}');
        const dadosSalvos = capaProtocolData.protocolo;

        if (dadosSalvos) {
            setTitulo(dadosSalvos.titulo || "");
            setTipoEstudo(dadosSalvos.tipoEstudo || "");
            setResponsavel(dadosSalvos.responsavel || "");

            if (dadosSalvos.patrocinadorId) {
                const foundPatrocinador = patrocinadores.find(p => p.id === dadosSalvos.patrocinadorId);
                if (foundPatrocinador) {
                    setPatrocinador(foundPatrocinador.nome);
                    setPatrocinadorId(foundPatrocinador.id);
                }
            }

            if (dadosSalvos.instituicaoId) {
                const foundInstituicao = instituicoes.find(i => i.id === dadosSalvos.instituicaoId);
                if (foundInstituicao) {
                    setInstituicao(foundInstituicao.nome);
                    setInstituicaoId(foundInstituicao.id);
                }
            }

            const savedTipoProduto = dadosSalvos.tipoProduto || "";
            if (TIPO_PRODUTO_OPTIONS.includes(savedTipoProduto)) {
                setTipoProduto(savedTipoProduto);
            } else if (savedTipoProduto) {
                setTipoProduto("OUTRA");
                setOutroTipoProduto(savedTipoProduto.replace(/_/g, ' '));
            }

            const savedEspecie = dadosSalvos.especie || "";
            if (ESPECIE_ANIMAL_OPTIONS.includes(savedEspecie)) {
                setEspecie(savedEspecie);
            } else if (savedEspecie) {
                setEspecie("OUTRA");
                setOutraEspecie(savedEspecie.replace(/_/g, ' '));
            }
        }
    }
  }, [patrocinadores, instituicoes]);


  // --- Lógica para salvar dados no LocalStorage ao alterar campos ---
  useEffect(() => {
    const dadosFormulario = {
      titulo,
      patrocinadorId,
      instituicaoId,
      tipoEstudo,
      tipoProduto: tipoProduto === 'OUTRA' ? formatStringForStorage(outroTipoProduto) : tipoProduto,
      especie: especie === 'OUTRA' ? formatStringForStorage(outraEspecie) : especie,
      responsavel,
    };
    
    // Evita salvar no LS se não houver dados relevantes
    if (Object.values(dadosFormulario).every(v => !v)) return;

    const capaProtocolData = JSON.parse(localStorage.getItem('capaProtocolData') || '{}');
    capaProtocolData.protocolo = dadosFormulario;
    localStorage.setItem('capaProtocolData', JSON.stringify(capaProtocolData));
  }, [titulo, patrocinadorId, instituicaoId, tipoEstudo, tipoProduto, especie, responsavel, outroTipoProduto, outraEspecie]);

  // --- Lógica de Submissão ---
  const handleCriar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setErrors({});
      const finalTipoProduto = tipoProduto === 'OUTRA' ? formatStringForStorage(outroTipoProduto) : tipoProduto;
      const finalEspecie = especie === 'OUTRA' ? formatStringForStorage(outraEspecie) : especie;

      const dadosFormulario = {
        titulo, patrocinadorId, instituicaoId, responsavel,
        tipoEstudo, tipoProduto: finalTipoProduto, especie: finalEspecie,
      };

      await schema.validate(dadosFormulario, { abortEarly: false });
      
      const capaProtocolData = JSON.parse(localStorage.getItem('capaProtocolData') || '{}');
      capaProtocolData.protocolo = dadosFormulario;
      localStorage.setItem('capaProtocolData', JSON.stringify(capaProtocolData));

      navigate('/protocolo/patrocinador');
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const newErrors: { [key: string]: string } = {};
        err.inner.forEach(error => {
          if (error.path) newErrors[error.path] = error.message;
        });
        setErrors(newErrors);
      }
    }
  };

  // --- Funções para selecionar um item do dropdown ---
  const handleSelectPatrocinador = (p: ApiListItem) => {
    setPatrocinador(p.nome);
    setPatrocinadorId(p.id);
    setShowPatrocinadorOptions(false);
  };

  const handleSelectInstituicao = (i: ApiListItem) => {
    setInstituicao(i.nome);
    setInstituicaoId(i.id);
    setShowInstituicaoOptions(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-200">
      <header className="bg-white/30 backdrop-blur-lg shadow-sm w-full p-4 flex items-center justify-center relative border-b border-white/20">
        <Button onClick={() => navigate(-1)} className="absolute left-4 top-1/2 -translate-y-1/2 bg-gray hover:bg-gray-300 text-gray-800 font-semibold py-2 px-3 rounded-lg inline-flex items-center text-sm">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
           </svg>
           <span className="hidden sm:inline">Voltar</span>
        </Button>
        <h1 className="text-xl sm:text-2xl font-bold text-center text-gray-800">Verita Audit</h1>
      </header>

      <div className="w-full flex flex-col justify-center items-center p-4 md:p-8 flex-grow">
        <div className="w-full max-w-4xl rounded-2xl p-6 md:p-8 bg-white/30 backdrop-blur-lg shadow-xl border border-white/20">
          <h1 className="text-2xl md:text-3xl font-semibold text-center mb-6 text-gray-800">Criar Novo Protocolo</h1>
          
          {apiError && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-4">{apiError}</div>}

          <form className="space-y-3" onSubmit={handleCriar}>
            <div>
              <Label className="text-gray-700 font-medium">Título do Protocolo</Label>
              <Input type="text" placeholder="Título do Protocolo" className="py-3 h-12 text-base bg-white/50 focus:bg-white/80" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
              {errors.titulo && <p className="text-red-500 text-xs mt-1">{errors.titulo}</p>}
            </div>
            
            <div className="relative" ref={patrocinadorRef}>
              <Label className="text-gray-700 font-medium">Patrocinador do Protocolo</Label>
              <Input type="text" placeholder="Digite para buscar o Patrocinador" className="py-3 h-12 text-base bg-white/50 focus:bg-white/80" value={patrocinador} onFocus={() => setShowPatrocinadorOptions(true)} onChange={(e) => { setPatrocinador(e.target.value); setPatrocinadorId(""); if (!showPatrocinadorOptions) setShowPatrocinadorOptions(true); }} />
              {showPatrocinadorOptions && (
                   <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
                       {patrocinadores.filter(p => p.nome.toLowerCase().includes(patrocinador.toLowerCase())).map(p => (
                           <div key={p.id} className="px-4 py-2 cursor-pointer hover:bg-gray-100" onClick={() => handleSelectPatrocinador(p)}>
                               {p.nome}
                           </div>
                       ))}
                   </div>
              )}
              {errors.patrocinadorId && <p className="text-red-500 text-xs mt-1">{errors.patrocinadorId}</p>}
            </div>

            <div className="relative" ref={instituicaoRef}>
              <Label className="text-gray-700 font-medium">Instituição ou CRO do Protocolo</Label>
              <Input type="text" placeholder="Digite para buscar a Instituição ou CRO" className="py-3 h-12 text-base bg-white/50 focus:bg-white/80" value={instituicao} onFocus={() => setShowInstituicaoOptions(true)} onChange={(e) => { setInstituicao(e.target.value); setInstituicaoId(""); if(!showInstituicaoOptions) setShowInstituicaoOptions(true); }} />
              {showInstituicaoOptions && (
                <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
                    {instituicoes.filter(i => i.nome.toLowerCase().includes(instituicao.toLowerCase())).map(i => (
                        <div key={i.id} className="px-4 py-2 cursor-pointer hover:bg-gray-100" onClick={() => handleSelectInstituicao(i)}>
                            {i.nome}
                        </div>
                    ))}
                </div>
              )}
              {errors.instituicaoId && <p className="text-red-500 text-xs mt-1">{errors.instituicaoId}</p>}
            </div>

            <div>
              <Label className="text-gray-700 font-medium">Tipo de Estudo</Label>
              <div className="relative">
                <select value={tipoEstudo} onChange={(e) => setTipoEstudo(e.target.value)} className="appearance-none w-full border border-gray-300 rounded-md py-3 pl-4 pr-10 h-12 text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 focus:bg-white/80">
                  <option value="" disabled>Selecione o tipo de estudo</option>
                  <option value="EFICACIA">Eficácia</option>
                  <option value="SEGURANCA">Segurança</option>
                  <option value="RESIDUO">Resíduo</option>
                </select>
                 <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                   </svg>
                 </div>
              </div>
              {errors.tipoEstudo && <p className="text-red-500 text-xs mt-1">{errors.tipoEstudo}</p>}
            </div>
            
            <div>
                <Label className="text-gray-700 font-medium">Classe Terapêutica</Label>
                <div className="relative">
                    <select value={tipoProduto} onChange={(e) => setTipoProduto(e.target.value)} className="appearance-none w-full border border-gray-300 rounded-md py-3 pl-4 pr-10 h-12 text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 focus:bg-white/80">
                        <option value="" disabled>Selecione a classe terapêutica</option>
                        {TIPO_PRODUTO_OPTIONS.map(opt => <option key={opt} value={opt}>{opt.replace(/_/g, ' ')}</option>)}
                        <option value="OUTRA">Outra</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                </div>
                {tipoProduto === 'OUTRA' && (
                    <Input type="text" placeholder="Especifique a classe terapêutica" className="mt-2 py-3 h-12 text-base bg-white/50 focus:bg-white/80" value={outroTipoProduto} onChange={(e) => setOutroTipoProduto(e.target.value)} />
                )}
                {errors.tipoProduto && <p className="text-red-500 text-xs mt-1">{errors.tipoProduto}</p>}
            </div>
            
            <div>
                <Label className="text-gray-700 font-medium">Espécie Animal</Label>
                <div className="relative">
                    <select value={especie} onChange={(e) => setEspecie(e.target.value)} className="appearance-none w-full border border-gray-300 rounded-md py-3 pl-4 pr-10 h-12 text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 focus:bg-white/80">
                        <option value="" disabled>Selecione a espécie animal</option>
                        {ESPECIE_ANIMAL_OPTIONS.map(opt => <option key={opt} value={opt}>{opt.replace(/_/g, ' ')}</option>)}
                        <option value="OUTRA">Outra</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                </div>
                {especie === 'OUTRA' && (
                    <Input type="text" placeholder="Especifique a espécie" className="mt-2 py-3 h-12 text-base bg-white/50 focus:bg-white/80" value={outraEspecie} onChange={(e) => setOutraEspecie(e.target.value)} />
                )}
                {errors.especie && <p className="text-red-500 text-xs mt-1">{errors.especie}</p>}
            </div>
            
            <div>
              <Label className="text-gray-700 font-medium">Responsável</Label>
              <Input type="text" placeholder="Responsável pelo Protocolo" className="py-3 h-12 text-base bg-white/50 focus:bg-white/80" value={responsavel} onChange={(e) => setResponsavel(e.target.value)} />
              {errors.responsavel && <p className="text-red-500 text-xs mt-1">{errors.responsavel}</p>}
            </div>

            <Button type="submit" className="w-full bg-green-400 hover:bg-green-500 text-black py-3 h-12 text-base font-semibold">
              Avançar
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Protocolo;