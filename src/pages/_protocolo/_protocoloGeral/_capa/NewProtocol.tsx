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

      if (!baseUrl || !apiKey) {
        setApiError("Erro de configuração: A URL da API ou a Chave da API não foram encontradas. Verifique o arquivo .env e reinicie o servidor.");
        return;
      }
      
      if (!token) {
        setApiError("Token de autenticação não encontrado. Por favor, faça login novamente.");
        navigate('/login');
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

        if (!patrocinadorResponse.ok) {
          const errorText = await patrocinadorResponse.text();
          console.error("Detalhe do erro ao buscar patrocinadores:", errorText);
          throw new Error(`Falha ao buscar patrocinadores: ${patrocinadorResponse.statusText}`);
        }
        const patrocinadorData = await patrocinadorResponse.json();
        setPatrocinadores(patrocinadorData);

        if (!instituicaoResponse.ok) {
          const errorText = await instituicaoResponse.text();
          console.error("Detalhe do erro ao buscar instituições:", errorText);
          throw new Error(`Falha ao buscar instituições: ${instituicaoResponse.statusText}`);
        }
        const instituicaoData = await instituicaoResponse.json();
        setInstituicoes(instituicaoData);

      } catch (error) {
        console.error("Erro ao buscar dados da API:", error);
        setApiError("Não foi possível carregar os dados. Verifique o console do navegador para mais detalhes.");
      }
    };

    fetchData();
  }, []);

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

  // --- Lógica para Carregar Dados Salvos do LocalStorage ---
  useEffect(() => {
    if (patrocinadores.length > 0 && instituicoes.length > 0) {
        const capaProtocolData = JSON.parse(localStorage.getItem('capaProtocolData') || '{}');
        const dadosSalvos = capaProtocolData.protocolo;

        if (dadosSalvos) {
            setTitulo(dadosSalvos.titulo || "");
            setTipoEstudo(dadosSalvos.tipoEstudo || "");
            setTipoProduto(dadosSalvos.tipoProduto || "");
            setEspecie(dadosSalvos.especie || "");
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
        }
    }
  }, [patrocinadores, instituicoes]);


  // --- Lógica para salvar dados no LocalStorage ao alterar campos ---
  useEffect(() => {
    if (!titulo && !patrocinadorId && !instituicaoId && !responsavel && !tipoEstudo) {
      return;
    }

    const dadosFormulario = {
      titulo,
      patrocinadorId,
      instituicaoId,
      tipoEstudo,
      tipoProduto,
      especie,
      responsavel,
    };

    const capaProtocolData = JSON.parse(localStorage.getItem('capaProtocolData') || '{}');
    capaProtocolData.protocolo = dadosFormulario;
    localStorage.setItem('capaProtocolData', JSON.stringify(capaProtocolData));
  }, [
    titulo,
    patrocinadorId,
    instituicaoId,
    tipoEstudo,
    tipoProduto,
    especie,
    responsavel,
  ]);

  // --- Lógica de Submissão ---
  const handleCriar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setErrors({});

      const dadosFormulario = {
        titulo, patrocinadorId, instituicaoId, responsavel,
        tipoEstudo, tipoProduto, especie,
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
          if (error.path) {
            newErrors[error.path] = error.message;
          }
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


  // --- RENDERIZAÇÃO DO FORMULÁRIO ---
  return (
    <div className="min-h-screen flex flex-col bg-gray-200">
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
          <h1 className="text-2xl md:text-3xl font-semibold text-center mb-6 text-gray-800">Criar Novo Protocolo</h1>
          
          {apiError && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative mb-4" role="alert">
              <strong className="font-bold">Erro: </strong>
              <span className="block sm:inline">{apiError}</span>
          </div>}

          <form className="space-y-3" onSubmit={handleCriar}>
            <div>
              <Label className="text-gray-700 font-medium">Título do Protocolo</Label>
              <Input type="text" placeholder="Título do Protocolo" className="py-3 h-12 text-base bg-white/50 focus:bg-white/80" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
              {errors.titulo && <p className="text-red-500 text-xs mt-1">{errors.titulo}</p>}
            </div>
            
            <div className="relative" ref={patrocinadorRef}>
              <Label className="text-gray-700 font-medium">Patrocinador do Protocolo</Label>
              <Input
                type="text"
                placeholder="Digite para buscar o Patrocinador"
                className="py-3 h-12 text-base bg-white/50 focus:bg-white/80"
                value={patrocinador}
                onFocus={() => setShowPatrocinadorOptions(true)}
                onChange={(e) => {
                  setPatrocinador(e.target.value);
                  setPatrocinadorId("");
                  if (!showPatrocinadorOptions) setShowPatrocinadorOptions(true);
                }}
              />
              {showPatrocinadorOptions && (
                 <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
                    {patrocinadores
                        .filter(p => p.nome.toLowerCase().includes(patrocinador.toLowerCase()))
                        .map(p => (
                            <div 
                                key={p.id}
                                className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSelectPatrocinador(p)}
                            >
                                {p.nome}
                            </div>
                        ))
                    }
                 </div>
              )}
              {errors.patrocinadorId && <p className="text-red-500 text-xs mt-1">{errors.patrocinadorId}</p>}
            </div>

            <div className="relative" ref={instituicaoRef}>
              <Label className="text-gray-700 font-medium">Instituição ou CRO do Protocolo</Label>
              <Input
                 type="text"
                 placeholder="Digite para buscar a Instituição ou CRO"
                 className="py-3 h-12 text-base bg-white/50 focus:bg-white/80"
                 value={instituicao}
                 onFocus={() => setShowInstituicaoOptions(true)}
                 onChange={(e) => {
                    setInstituicao(e.target.value);
                    setInstituicaoId(""); 
                    if(!showInstituicaoOptions) setShowInstituicaoOptions(true);
                 }}
              />
              {showInstituicaoOptions && (
                <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
                    {instituicoes
                        .filter(i => i.nome.toLowerCase().includes(instituicao.toLowerCase()))
                        .map(i => (
                            <div
                                key={i.id}
                                className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSelectInstituicao(i)}
                            >
                                {i.nome}
                            </div>
                        ))
                    }
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
                <option value="ANABOLIZANTES">Anabolizantes</option>
                <option value="ANALGESICO">Analgésico</option>
                <option value="ANESTESICO">Anestésico</option>
                <option value="ANTIARRITMICO">Antiarrítmico</option>
                <option value="ANTICOCCIDIANO">Anticoccidiano</option>
                <option value="ANTICOLINERGICO">Anticolinérgico</option>
                <option value="ANTICONVULSIVANTE">Anticonvulsivante</option>
                <option value="ANTIEMETICOS">Antieméticos</option>
                <option value="ANTIESPASMODICO">Antiespasmódico</option>
                <option value="ANTIFISETICOS">Antifiséticos</option>
                <option value="ANTIHIPERTENSIVO">Anti-hipertensivo</option>
                <option value="ANTI-HISTAMINICOS">Anti-histamínicos</option>
                <option value="ANTI-INFLAMATORIO_ESTEROIDAL">Anti-inflamatório Esteroidal</option>
                <option value="ANTI-INFLAMATORIO_NAO_ESTEROIDAL">Anti-inflamatório Não Esteroidal</option>
                <option value="ANTIMICROBIANOS">Antimicrobianos</option>
                <option value="ANTIMICROBIANOS_ADITIVOS">Antimicrobianos Aditivos Melhoradores de Desempenho</option>
                <option value="ANTINEOPLASICOS">Antineoplásicos</option>
                <option value="ANTIPARASITARIOS">Antiparasitários</option>
                <option value="ANTIPIRETICO">Antipirético</option>
                <option value="ANTISSEPTICO">Antisséptico</option>
                <option value="ANTIVIRAL">Antiviral</option>
                <option value="BRONCODILATADOR">Broncodilatador</option>
                <option value="COLINERGICO">Colinérgico</option>
                <option value="DESINFETANTE">Desinfetante</option>
                <option value="ESPASMOLITICO">Espasmolítico</option>
                <option value="FITOTERAPICO">Fitoterápico</option>
                <option value="HIDRATACAO_SUPORTE">Hidratação e Medicação Suporte</option>
                <option value="HORMONIOS">Hormônios</option>
                <option value="IMUNOMODULADOR">Imunomodulador</option>
                <option value="MUCOLITICO">Mucolítico</option>
                <option value="NEUROLITICO">Neurolítico</option>
                <option value="OUTROS">Outros</option>
                <option value="PESTICIDA">Pesticida</option>
                <option value="PROTETOR_DE_MUCOSA">Protetor de Mucosa</option>
                <option value="RELAXANTE_MUSCULAR">Relaxante Muscular</option>
                <option value="VITAMINAS_E_MINERAIS">Vitaminas e Minerais</option>
              </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {errors.tipoProduto && <p className="text-red-500 text-xs mt-1">{errors.tipoProduto}</p>}
            </div>
            <div>
              <Label className="text-gray-700 font-medium">Espécie Animal</Label>
              <div className="relative">
                <select value={especie} onChange={(e) => setEspecie(e.target.value)} className="appearance-none w-full border border-gray-300 rounded-md py-3 pl-4 pr-10 h-12 text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 focus:bg-white/80">
                <option value="" disabled>Selecione a espécie animal</option>
                <option value="ANFIBIO">Anfíbio</option>
                <option value="AVE">Ave</option>
                <option value="ABELHAS">Abelhas</option>
                <option value="BOVINO">Bovino</option>
                <option value="BUBALINO">Bubalino</option>
                <option value="CAO">Cão</option>
                <option value="CAMUNDONGO_HETEROGENICO">Camundongo Heterogênico</option>
                <option value="CAMUNDONGO_ISOGENICO">Camundongo Isogênico</option>
                <option value="CAMUNDONGO_KNOCKOUT">Camundongo Knockout</option>
                <option value="CAMUNDONGO_TRANSGENICO">Camundongo transgênico</option>
                <option value="CAPRINO">Caprino</option>
                <option value="CHINCHILA">Chinchila</option>
                <option value="COBAIA">Cobaia</option>
                <option value="COELHOS">Coelhos</option>
                <option value="EQUIDEO">Equídeo</option>
                <option value="ESPECIE_SILVESTRE_BRASILEIRA">Espécie silvestre brasileira</option>
                <option value="ESPECIE_SILVESTRE_NAO_BRASILEIRA">Espécie silvestre não-brasileira</option>
                <option value="GATO">Gato</option>
                <option value="GERBIL">Gerbil</option>
                <option value="HAMSTER">Hamster</option>
                <option value="MUARES">Muares</option>
                <option value="OVINO">Ovino</option>
                <option value="PEIXE">Peixe</option>
                <option value="PRIMATA_NAO_HUMANO">Primata não-humano</option>
                <option value="RATO_HETEROGENICO">Rato heterogênico</option>
                <option value="RATO_ISOGENICO">Rato isogênico</option>
                <option value="RATO_KNOCKOUT">Rato Knockout</option>
                <option value="RATO_TRANSGENICO">Rato transgênico</option>
                <option value="REPTIL">Réptil</option>
                <option value="SUINO">Suíno</option>
                <option value="OUTRA">Outra</option>
              </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
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

