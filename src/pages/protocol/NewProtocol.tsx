import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import * as yup from "yup";

const Protocolo = () => {
  // --- ESTADOS DO FORMULÁRIO ---
  const [titulo, setTitulo] = useState("");
  const [patrocinador, setPatrocinador] = useState("");
  const [objetivo, setObjetivo] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [codigoEstudo, setCodigoEstudo] = useState("");
  const [produto, setProduto] = useState("");
  const [versaoData, setVersaoData] = useState("");
  const [duracao, setDuracao] = useState("");
  const [tipo, setTipo] = useState("");
  const [tipoProduto, setTipoProduto] = useState("");
  const [especie, setEspecie] = useState("");

  // --- ESTADO PARA ERROS DE VALIDAÇÃO (COM TIPAGEM) ---
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const navigate = useNavigate();

  // --- ESQUEMA DE VALIDAÇÃO YUP ---
  const schema = yup.object().shape({
    titulo: yup.string().required("O título é obrigatório"),
    patrocinador: yup.string().required("O patrocinador é obrigatório"),
    objetivo: yup.string().required("O objetivo é obrigatório"),
    responsavel: yup.string().required("O responsável é obrigatório"),
    produto: yup.string().required("O produto é obrigatório"),
    versaoData: yup.string().required("A versão e data são obrigatórias"),
    duracao: yup.string().required("A duração do estudo é obrigatória"),
    tipo: yup.string().required("O tipo de estudo é obrigatório"),
    tipoProduto: yup.string().required("A classe terapêutica é obrigatória"),
    especie: yup.string().required("A espécie é obrigatória"),
  });

  // --- LÓGICA ---
  const gerarCodigo = (pat: string) => {
    const numPat = pat.replace(/\D/g, "").padStart(2, '0').slice(0, 2);
    const sequencial = "0001"; // Lógica sequencial pode ser aprimorada
    const ano = new Date().getFullYear().toString().slice(-2);
    return `${numPat}-${sequencial}-${ano}`;
  };

  useEffect(() => {
    if (patrocinador) {
      setCodigoEstudo(gerarCodigo(patrocinador));
    } else {
      setCodigoEstudo("");
    }
  }, [patrocinador]);

  // --- LÓGICA DE SUBMISSÃO COM VALIDAÇÃO YUP (COM TIPAGEM DE EVENTO) ---
  const handleCriar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setErrors({});
      const dadosFormulario = {
        titulo, patrocinador, objetivo, responsavel, produto,
        versaoData, duracao, tipo, tipoProduto, especie,
      };

      await schema.validate(dadosFormulario, { abortEarly: false });

      console.log("Validação bem-sucedida!");
      // Salva os dados no localStorage antes de navegar
      localStorage.setItem('protocoloFormData', JSON.stringify(dadosFormulario));
      navigate('/patrocinador-cadastro');

    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const newErrors: { [key: string]: string } = {};
        err.inner.forEach(error => {
          if (error.path) {
            newErrors[error.path] = error.message;
          }
        });
        setErrors(newErrors);
        console.log("Erros de validação:", newErrors);
      }
    }
  };

  // --- LÓGICA DE LOCAL STORAGE ---
  useEffect(() => {
    const dadosSalvos = localStorage.getItem('protocoloFormData');
    if (dadosSalvos) {
      const dadosParseados = JSON.parse(dadosSalvos);
      setTitulo(dadosParseados.titulo || "");
      setPatrocinador(dadosParseados.patrocinador || "");
      setTipo(dadosParseados.tipo || "");
      setResponsavel(dadosParseados.responsavel || "");
      setObjetivo(dadosParseados.objetivo || "");
      setProduto(dadosParseados.produto || "");
      setVersaoData(dadosParseados.versaoData || "");
      setDuracao(dadosParseados.duracao || "");
      setTipoProduto(dadosParseados.tipoProduto || "");
      setEspecie(dadosParseados.especie || "");
    }
  }, []);

  // --- RENDERIZAÇÃO ---
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">

      {/* Formulário à esquerda */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8">
        <div className="w-full max-w-md space-y-4">
          <h1 className="text-3xl font-semibold text-center mb-6">Novo Protocolo</h1>

          <form className="space-y-3" onSubmit={handleCriar}>
            <div>
              <Input type="text" placeholder="Título do Protocolo" className="py-3 h-12 text-base" value={titulo} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitulo(e.target.value)} />
              {errors.titulo && <p className="text-red-500 text-xs mt-1">{errors.titulo}</p>}
            </div>
            <div>
              <Input type="text" placeholder="Patrocinador" className="py-3 h-12 text-base" value={patrocinador} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPatrocinador(e.target.value)} />
              {errors.patrocinador && <p className="text-red-500 text-xs mt-1">{errors.patrocinador}</p>}
            </div>
            
            <div>
              <select value={tipo} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTipo(e.target.value)} className="w-full border border-gray-300 rounded-md py-3 px-4 h-12 text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="" disabled>Selecione o tipo de estudo</option>
                <option value="EC Eficácia">EC Eficácia</option>
                <option value="EC Segurança">EC Segurança</option>
                <option value="EC Resíduo">EC Resíduo</option>
              </select>
              {errors.tipo && <p className="text-red-500 text-xs mt-1">{errors.tipo}</p>}
            </div>
            
            <div>
              <select value={tipoProduto} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTipoProduto(e.target.value)} className="w-full border border-gray-300 rounded-md py-3 px-4 h-12 text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
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
              {errors.tipoProduto && <p className="text-red-500 text-xs mt-1">{errors.tipoProduto}</p>}
            </div>

            <div>
              <select value={especie} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setEspecie(e.target.value)} className="w-full border border-gray-300 rounded-md py-3 px-4 h-12 text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="" disabled>Selecione a espécie animal</option>
                <option value="Anfíbio">Anfíbio</option>
                <option value="Ave">Ave</option>
                <option value="Abelhas">Abelhas</option>
                <option value="Bovino">Bovino</option>
                <option value="Bubalino">Bubalino</option>
                <option value="Cão">Cão</option>
                <option value="Camundongo Heterogênico">Camundongo Heterogênico</option>
                <option value="Camundongo Isogênico">Camundongo Isogênico</option>
                <option value="Camundongo Knockout">Camundongo Knockout</option>
                <option value="Camundongo transgênico">Camundongo transgênico</option>
                <option value="Caprino">Caprino</option>
                <option value="Chinchila">Chinchila</option>
                <option value="Cobaia">Cobaia</option>
                <option value="Coelhos">Coelhos</option>
                <option value="Equídeo">Equídeo</option>
                <option value="Espécie silvestre brasileira">Espécie silvestre brasileira</option>
                <option value="Espécie silvestre não-brasileira">Espécie silvestre não-brasileira</option>
                <option value="Gato">Gato</option>
                <option value="Gerbil">Gerbil</option>
                <option value="Hamster">Hamster</option>
                <option value="Muares">Muares</option>
                <option value="Ovino">Ovino</option>
                <option value="Peixe">Peixe</option>
                <option value="Primata não-humano">Primata não-humano</option>
                <option value="Rato heterogênico">Rato heterogênico</option>
                <option value="Rato isogênico">Rato isogênico</option>
                <option value="Rato Knockout">Rato Knockout</option>
                <option value="Rato transgênico">Rato transgênico</option>
                <option value="Réptil">Réptil</option>
                <option value="Suíno">Suíno</option>
                <option value="Outra">Outra</option>
              </select>
              {errors.especie && <p className="text-red-500 text-xs mt-1">{errors.especie}</p>}
            </div>

            <div>
              <Input type="text" placeholder="Objetivo" className="py-3 h-12 text-base" value={objetivo} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setObjetivo(e.target.value)} />
              {errors.objetivo && <p className="text-red-500 text-xs mt-1">{errors.objetivo}</p>}
            </div>
            
            <div>
              <Input type="text" placeholder="Responsável pelo Estudo" className="py-3 h-12 text-base" value={responsavel} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setResponsavel(e.target.value)} />
              {errors.responsavel && <p className="text-red-500 text-xs mt-1">{errors.responsavel}</p>}
            </div>

            <div>
              <Input type="text" placeholder="Produto Veterinário Investigacional" className="py-3 h-12 text-base" value={produto} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProduto(e.target.value)} />
              {errors.produto && <p className="text-red-500 text-xs mt-1">{errors.produto}</p>}
            </div>

            <div>
              <Input type="text" placeholder="Versão e Data" className="py-3 h-12 text-base" value={versaoData} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVersaoData(e.target.value)} />
              {errors.versaoData && <p className="text-red-500 text-xs mt-1">{errors.versaoData}</p>}
            </div>
            
            <div>
              <Input type="text" placeholder="Duração do Estudo Clínico" className="py-3 h-12 text-base" value={duracao} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDuracao(e.target.value)} />
              {errors.duracao && <p className="text-red-500 text-xs mt-1">{errors.duracao}</p>}
            </div>

            <Button type="submit" className="w-full bg-green-400 hover:bg-green-500 text-black py-3 h-12 text-base font-semibold">
              Criar Protocolo
            </Button>
          </form>
        </div>
      </div>

      {/* Emulador da capa do protocolo à direita */}
      <div className="w-full md:w-1/2 flex items-center justify-center overflow-hidden p-4">
        <div className="bg-white shadow-lg p-8 flex flex-col font-serif" style={{ width: 'calc((90vh) * 0.707)', height: 'calc(90vh)', overflow: 'hidden' }}>
          {/* Cabeçalho */}
          <div className="flex justify-between items-start text-[10px]">
            <div className="border border-black w-44 h-20 flex items-center justify-center text-center p-1"><p className="font-bold">LOGO DA CRO/UNIVERSIDADE</p></div>
            <div className="border border-black w-44 h-20 flex items-center justify-center text-center p-1"><p className="font-bold">LOGO DO PATROCINADOR</p></div>
          </div>

          {/* Título Principal */}
          <div className="text-center my-4">
            <p className="text-sm">Protocolo</p>
            <p className="text-xs">código do estudo ({codigoEstudo})</p>
            <h1 className="text-lg font-bold my-3 uppercase">Protocolo de Estudo</h1>
            <p className="text-sm font-semibold uppercase">
              {tipo || "TIPO DE ESTUDO"}
            </p>
            <p className="text-sm">de uma formulação veterinária</p>
            <div className="border-black mt-2 mx-4 h-4 text-center">
              <span className="text-black/80 font-semibold">{titulo || ''}</span>
            </div>
          </div>

          {/* Corpo do Formulário */}
          <div className="flex-grow text-sm">
            <div className="flex items-center mt-2"><p className="font-bold w-60 shrink-0">OBJETIVO</p><div className="border-black w-full h-4"><span className="text-black/80 pl-2">{objetivo || ''}</span></div></div>
            <div className="flex items-center mt-2"><p className="font-bold w-60 shrink-0">PATROCINADOR</p><div className="border-black w-full h-4"><span className="text-black/80 pl-2">{patrocinador || ''}</span></div></div>
            <div className="flex items-center mt-2"><p className="font-bold w-60 shrink-0">RESPONSÁVEL PELO ESTUDO</p><div className="border-black w-full h-4"><span className="text-black/80 pl-2">{responsavel || ''}</span></div></div>
            <div className="flex items-center mt-2"><p className="font-bold w-60 shrink-0">CÓDIGO DO ESTUDO</p><div className="border-black w-full h-4"><span className="text-black/80 pl-2">{codigoEstudo || ''}</span></div></div>
            <div className="flex items-center mt-2"><p className="font-bold w-60 shrink-0 leading-tight">PRODUTO VETERINÁRIO<br />INVESTIGACIONAL</p><div className="border-black w-full h-4"><span className="text-black/80 pl-2">{produto || ''}</span></div></div>
            
            <div className="flex items-center mt-2"><p className="font-bold w-60 shrink-0">CLASSE TERAPÊUTICA</p><div className="border-black w-full h-4"><span className="text-black/80 pl-2">{tipoProduto || ''}</span></div></div>
            <div className="flex items-center mt-2"><p className="font-bold w-60 shrink-0">ESPÉCIE(S) ALVO</p><div className="border-black w-full h-4"><span className="text-black/80 pl-2">{especie || ''}</span></div></div>

            <div className="flex items-center mt-2"><p className="font-bold w-60 shrink-0">VERSÃO E DATA</p><div className="border-black w-full h-4"><span className="text-black/80 pl-2">{versaoData || ''}</span></div></div>
            <div className="flex items-start mt-2"><p className="font-bold w-60 shrink-0">CONFORMIDADE ÉTICA:</p><p className="text-xs ml-2">Este protocolo será submetido a uma comissão de ética no uso de animais e só será iniciado após aprovação.</p></div>
            <div className="flex items-center mt-2"><p className="font-bold w-60 shrink-0">DURAÇÃO DO ESTUDO CLÍNICO:</p><div className="border-black w-full h-4"><span className="text-black/80 pl-2">{duracao || ''}</span></div></div>
          </div>
          
          {/* Rodapé */}
          <div className="mt-auto">
            <p className="text-[9px] text-justify my-3 leading-tight">Este documento contém informações confidenciais e sigilosas pertencentes ao Patrocinador. Visto que, para o bom e fiel desempenho das atividades do Responsável pelo estudo, faz-se necessário a disponibilidade de acesso às informações técnicas e outras relacionadas ao produto veterinário investigacional, assume-se assim o compromisso de manter tais informações confidenciais e em não as divulgar a terceiros (exceto se exigido por legislação aplicável), nem as utilizará para fins não autorizados. Em caso de suspeita ou quebra real desta obrigação, o Patrocinador deverá ser imediatamente notificada.</p>
            <div className="text-center">
              <p className="font-bold text-sm">PÁGINA DE ASSINATURAS</p>
              <p className="text-[8px] text-justify leading-tight">Este documento contém informações confidenciais e não pode ser objeto de publicação, cópia ou de compartilhamento ou uso impróprio desse conteúdo fora do ambiente das empresas Responsável pelo estudo (CRO) e o Patrocinador sem prévio consentimento por escrito e expressamente proibido (exceto se exigido por legislação aplicável).</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Protocolo;