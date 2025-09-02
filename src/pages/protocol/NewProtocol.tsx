import { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import * as yup from "yup";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const Protocolo = () => {
  // --- Estados do Formulário ---
  const [titulo, setTitulo] = useState("");
  const [patrocinador, setPatrocinador] = useState("");
  const [instituicao, setInstituicao] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [codigoEstudo, setCodigoEstudo] = useState("");
  const [tipoEstudo, setTipoEstudo] = useState("");
  const [tipoProduto, setTipoProduto] = useState("");
  const [especie, setEspecie] = useState("");

  // --- Estado para Erros de Validação ---
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const navigate = useNavigate();

  // --- Referência para a div da capa para exportação em PDF ---
  const capaRef = useRef<HTMLDivElement>(null);

  // --- Esquema de Validação Yup ---
  const schema = yup.object().shape({
    titulo: yup.string().required("O título é obrigatório"),
    patrocinador: yup.string().required("O patrocinador é obrigatório"),
    instituicao: yup.string().required("A instituicao é obrigatório"),
    responsavel: yup.string().required("O responsável é obrigatório"),
    tipoEstudo: yup.string().required("O tipo de estudo é obrigatório"),
    tipoProduto: yup.string().required("A classe terapêutica é obrigatória"),
    especie: yup.string().required("A espécie é obrigatória"),
  });

  // --- Lógica para gerar o código do estudo ---
  const gerarCodigo = (pat: string) => {
    const numPat = pat.replace(/\D/g, "").padStart(2, '0').slice(0, 2);
    const sequencial = "0001";
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

  // --- Lógica de Submissão e Salvamento ---
  const handleCriar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setErrors({});
      const dadosFormulario = {
        titulo, patrocinador, instituicao, responsavel,
        tipoEstudo, tipoProduto, especie,
        codigoEstudo: gerarCodigo(patrocinador)
      };

      await schema.validate(dadosFormulario, { abortEarly: false });
      
      console.log("Validação da Etapa 1 bem-sucedida!");

      const fullProtocolData = JSON.parse(localStorage.getItem('fullProtocolData') || '{}');

      // Atualiza a seção 'protocolo' com os dados deste formulário
      fullProtocolData.protocolo = dadosFormulario;

      localStorage.setItem('fullProtocolData', JSON.stringify(fullProtocolData));

      // Navega para a próxima etapa
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

  // --- Lógica para Carregar Dados Salvos do LocalStorage ---
  useEffect(() => {
    const fullProtocolData = JSON.parse(localStorage.getItem('fullProtocolData') || '{}');
    const dadosSalvos = fullProtocolData.protocolo;

    if (dadosSalvos) {
      setTitulo(dadosSalvos.titulo || "");
      setPatrocinador(dadosSalvos.patrocinador || "");
      setInstituicao(dadosSalvos.instituicao || "");
      setTipoEstudo(dadosSalvos.TipoEstudo || "");
      setResponsavel(dadosSalvos.responsavel || "");
      setTipoProduto(dadosSalvos.tipoProduto || "");
      setEspecie(dadosSalvos.especie || "");
    }
  }, []);

  // --- Lógica para Exportar a Capa em PDF ---
  const handleExportPdf = () => {
    const input = capaRef.current;
    if (input) {
      html2canvas(input, {
        scale: 2,
        useCORS: true,
      }).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'pt',
          format: 'a4',
        });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const ratio = Math.min(pdfWidth / canvas.width, pdfHeight / canvas.height);
        const imgWidth = canvas.width * ratio;
        const imgHeight = canvas.height * ratio;
        const xPos = (pdfWidth - imgWidth) / 2;
        const yPos = (pdfHeight - imgHeight) / 2;
        pdf.addImage(imgData, 'PNG', xPos, yPos, imgWidth, imgHeight);
        pdf.save(`protocolo-capa-${codigoEstudo || 'preview'}.pdf`);
      });
    }
  };

  useEffect(() => {
    const dadosFormulario = {
      titulo,
      patrocinador,
      instituicao,
      responsavel,
      tipoEstudo,
      tipoProduto,
      especie,
      codigoEstudo: gerarCodigo(patrocinador), // Sempre recalculado
    };;

    const fullProtocolData = JSON.parse(localStorage.getItem('fullProtocolData') || '{}');
    fullProtocolData.protocolo = dadosFormulario;
    localStorage.setItem('fullProtocolData', JSON.stringify(fullProtocolData));
  }, [
    titulo,
    patrocinador,
    instituicao,
    responsavel,
    tipoEstudo,
    tipoProduto,
    especie,
  ]);

  const getCurrentVersionAndDate = () => {
        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const year = today.getFullYear();
        return `01-${day}/${month}/${year}`;
    };
  const versaoDataAutomatica = getCurrentVersionAndDate()

  // --- RENDERIZAÇÃO ---
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Formulário à esquerda */}
      <div className="w-full flex flex-col justify-center items-center p-8">
        <div className="w-full max-w-md space-y-4">
          <h1 className="text-3xl font-semibold text-center mb-6">Novo Protocolo</h1>
          <form className="space-y-3" onSubmit={handleCriar}>
            <div>
              <Input type="text" placeholder="Título do Protocolo" className="py-3 h-12 text-base" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
              {errors.titulo && <p className="text-red-500 text-xs mt-1">{errors.titulo}</p>}
            </div>
            <div>
              <Input type="text" placeholder="Patrocinador" className="py-3 h-12 text-base" value={patrocinador} onChange={(e) => setPatrocinador(e.target.value)} />
              {errors.patrocinador && <p className="text-red-500 text-xs mt-1">{errors.patrocinador}</p>}
            </div>
            <div>
              <Input type="text" placeholder="Instituição" className="py-3 h-12 text-base" value={instituicao} onChange={(e) => setInstituicao(e.target.value)} />
              {errors.instituicao && <p className="text-red-500 text-xs mt-1">{errors.instituicao}</p>}
            </div>
            <div>
              <select value={tipoEstudo} onChange={(e) => setTipoEstudo(e.target.value)} className="w-full border border-gray-300 rounded-md py-3 px-4 h-12 text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="" disabled>Selecione o tipo de estudo</option>
                <option value="EFICACIA">Eficácia</option>
                <option value="SEGURANCA">Segurança</option>
                <option value="RESIDUO">Resíduo</option>
              </select>
              {errors.tipoEstudo && <p className="text-red-500 text-xs mt-1">{errors.tipoEstudo}</p>}
            </div>
            <div>
              <select value={tipoProduto} onChange={(e) => setTipoProduto(e.target.value)} className="w-full border border-gray-300 rounded-md py-3 px-4 h-12 text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
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
              <select value={especie} onChange={(e) => setEspecie(e.target.value)} className="w-full border border-gray-300 rounded-md py-3 px-4 h-12 text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="" disabled>Selecione a espécie animal</option>
                <option value="ANFIBIO">Anfíbio</option>
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
              <Input type="text" placeholder="Responsável pelo Estudo" className="py-3 h-12 text-base" value={responsavel} onChange={(e) => setResponsavel(e.target.value)} />
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
