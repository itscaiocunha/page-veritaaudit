import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Home } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useNavigate, useParams } from "react-router-dom";

// --- HELPERS & WRAPPERS ---
const PageWrapper = ({ children, innerRef, codigoEstudo }: { children: React.ReactNode, innerRef?: React.Ref<HTMLDivElement>, codigoEstudo?: string }) => (
    <div 
        ref={innerRef}
        className="page-wrapper-pdf bg-white shadow-lg p-12 font-serif" 
        style={{ 
            width: '210mm', 
            minHeight: '297mm',
            height: 'auto',
            position: 'relative', 
            display: 'flex', 
            flexDirection: 'column',
            pageBreakAfter: 'always'
        }}
    >
        <header className="flex justify-between items-start text-sm mb-10">
            <div className="w-48 h-24 flex items-center justify-center text-center p-1 font-bold text-gray-700 border border-black">LOGO DA CRO/UNIVERSIDADE</div>
            <div className="text-center mt-4">
                <p className="font-semibold">Protocolo</p>
                <p className="text-xs">{codigoEstudo || 'código do estudo'}</p>
            </div>
            <div className="w-48 h-24 flex items-center justify-center text-center p-1 font-bold text-gray-700 border border-black">LOGO DO PATROCINADOR</div>
        </header>
        <main className="flex-grow flex flex-col text-justify">
            {children}
        </main>
        <footer className="text-xs mt-auto pt-8 text-justify">
            <p>Este documento contém informações confidenciais do Patrocinador. Seu uso é restrito às atividades do estudo clínico veterinário, sendo proibida a reprodução, divulgação ou utilização para outros fins, salvo quando exigido por lei. Qualquer suspeita ou quebra de confidencialidade deve ser comunicada imediatamente ao Patrocinador</p>
        </footer>
    </div>
);

const SectionTitle = ({ number, title }: { number: string, title: string }) => (
    <h2 className="text-xl font-bold mb-6">{`${number} ${title}`}</h2>
);

// --- PAGE COMPONENTS ---

const Capa = ({ data, codigoEstudo, versaoData }: { data: any, codigoEstudo: string, versaoData: string }) => (
    <PageWrapper codigoEstudo={codigoEstudo}>
        <div className="text-center flex-grow flex flex-col justify-center items-center">
            <h1 className="text-2xl font-bold my-4 uppercase">Protocolo de Estudo</h1>
            <div className="border-b-2 border-black mt-6 w-full text-center py-1">
                <span className="text-black font-semibold text-lg">{data?.nome || 'Título do Estudo'}</span>
            </div>
        </div>
        <div className="text-base space-y-3">
            <div className="flex"><p className="font-bold w-64 shrink-0">ESTUDO CLÍNICO</p><div className="border-b border-black flex-grow"><span className="pl-2">{data?.tipoEstudo || ''}</span></div></div>
            <div className="flex"><p className="font-bold w-64 shrink-0">PATROCINADOR</p><div className="border-b border-black flex-grow"><span className="pl-2">{data?.patrocinador?.nome || ''}</span></div></div>
            <div className="flex"><p className="font-bold w-64 shrink-0">ESPÉCIE ALVO</p><div className="border-b border-black flex-grow"><span className="pl-2">{data?.especieAnimal || 'Não informado'}</span></div></div>
            <div className="flex"><p className="font-bold w-64 shrink-0">CLASSE TERAPÊUTICA</p><div className="border-b border-black flex-grow"><span className="pl-2">{data?.classeTerapeutica || 'Não informado'}</span></div></div>
            <div className="flex"><p className="font-bold w-64 shrink-0">CÓDIGO DO ESTUDO</p><div className="border-b border-black flex-grow"><span className="pl-2">{codigoEstudo}</span></div></div>
            <div className="flex"><p className="font-bold w-64 shrink-0">VERSÃO E DATA</p><div className="border-b border-black flex-grow"><span className="pl-2">{versaoData}</span></div></div>
        </div>
    </PageWrapper>
);

const PaginaAssinaturas = ({ data, codigoEstudo }: { data: any, codigoEstudo?: string }) => (
    <PageWrapper codigoEstudo={codigoEstudo}>
        <h2 className="text-xl font-bold text-center mb-8">PÁGINA DE ASSINATURAS</h2>
        <p className="text-sm mb-16">Li este protocolo e concordo que ele seja conduzido em conformidade com o estipulado.</p>
        <div className="space-y-20">
            <div className="flex flex-col items-center">
                <div className="border-b border-black w-3/4"></div>
                <p className="text-center mt-2 text-sm font-semibold">{data?.representante?.nome || " "}</p>
                <p className="text-center text-xs">Representante do Patrocinador</p>
                <p className="text-center text-xs font-bold">{data?.patrocinador?.nome || " "}</p>
            </div>
            <div className="flex flex-col items-center">
                <div className="border-b border-black w-3/4"></div>
                <p className="text-center mt-2 text-sm font-semibold">{data?.investigador?.nome || " "}</p>
                <p className="text-center text-xs">Investigador</p>
                <p className="text-center text-xs font-bold">{data?.instituicao?.nome || " "}</p>
            </div>
        </div>
    </PageWrapper>
);

const PaginaInformacoesGerais = ({ data, codigoEstudo }: { data: any, codigoEstudo?: string }) => {
    const renderAddress = (addr: any) => addr ? `${addr.logradouro}, ${addr.numero}, ${addr.complemento || ''} - ${addr.bairro}, ${addr.cidade}/${addr.uf} - CEP: ${addr.cep}` : 'Não informado';
    
    const renderPessoa = (p: any, title: string) => (
        p ? <div className="pl-4 mt-2">
            {title && <h4 className="font-bold">{title}</h4>}
            <div className="pl-2">
                <p><strong>Nome:</strong> {p.nome}</p>
                <p><strong>Formação:</strong> {p.formacao}</p>
                {(p.registro || p.numeroRegistro) && <p><strong>Registro:</strong> {p.registro || p.numeroRegistro}</p>}
                {p.cargo && <p><strong>Cargo:</strong> {p.cargo}</p>}
                <p><strong>E-mail:</strong> {p.email}</p>
                <p><strong>Telefone:</strong> {p.telefone}</p>
                <p><strong>Endereço:</strong> {renderAddress(p.endereco)}</p>
            </div>
        </div> : <p className="pl-4 text-gray-500">{title} não informado.</p>
    );

    return (
        <PageWrapper codigoEstudo={codigoEstudo}>
            <SectionTitle number="1." title="INFORMAÇÕES GERAIS" />
            <div className="space-y-4 text-sm">
                <section>
                    <h3 className="font-bold">1.1 Patrocinador</h3>
                    <div className="pl-4">
                        <p><strong>Nome:</strong> {data.patrocinador?.nome}</p>
                        <p><strong>Endereço:</strong> {renderAddress(data.patrocinador?.endereco)}</p>
                        <p><strong>Telefone:</strong> {data.patrocinador?.telefone}</p>
                    </div>
                    {renderPessoa(data.representante, '1.1.1 Representante do Patrocinador')}
                    <div className="pl-4 mt-2">
                        <h4 className="font-bold">1.1.2 Monitor(es) do Estudo</h4>
                        {data.monitores?.map((m: any, i: number) => <div key={i} className="mb-2">{renderPessoa(m, '')}</div>)}
                    </div>
                     <div className="pl-4 mt-2">
                        <h4 className="font-bold">1.1.3 Equipe do Patrocinador</h4>
                        {data.tecnicosPatrocinador?.map((m: any, i: number) => <div key={i} className="mb-2">{renderPessoa(m, '')}</div>)}
                    </div>
                </section>
                <section className="mt-4">
                     <h3 className="font-bold">1.2 Instituição Responsável</h3>
                     <div className="pl-4">
                        <p><strong>Nome:</strong> {data.instituicao?.nome}</p>
                        <p><strong>Endereço:</strong> {renderAddress(data.instituicao?.endereco)}</p>
                     </div>
                     {renderPessoa(data.investigador, '1.2.1 Investigador')}
                     <div className="pl-4 mt-2">
                        <h4 className="font-bold">1.2.2 Equipe Técnica</h4>
                        {data.tecnicosInstituicao?.map((m: any, i: number) => <div key={i} className="mb-2">{renderPessoa(m, '')}</div>)}
                     </div>
                </section>
            </div>
        </PageWrapper>
    )
};

const PaginaConteudoSimples = ({ numero, titulo, data, fieldName, codigoEstudo }: { numero: string, titulo: string, data: any, fieldName: string, codigoEstudo?: string }) => (
    <PageWrapper codigoEstudo={codigoEstudo}>
        <SectionTitle number={`${numero}.`} title={titulo} />
        <p className="whitespace-pre-wrap">{data?.[fieldName] || 'Conteúdo não informado.'}</p>
    </PageWrapper>
);

// --- MAIN PAGE COMPONENT ---
const ProjetoPage: React.FC = () => {
    const { id: protocoloMestreId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [protocoloData, setProtocoloData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const pdfRef = useRef<HTMLDivElement>(null);
    const [scriptsLoaded, setScriptsLoaded] = useState(false);

    useEffect(() => {
        const jspdfScript = document.createElement('script');
        jspdfScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        jspdfScript.async = true;
        const html2canvasScript = document.createElement('script');
        html2canvasScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
        html2canvasScript.async = true;
        let scriptsPending = 2;
        const onScriptLoad = () => {
            scriptsPending--;
            if (scriptsPending === 0) setScriptsLoaded(true);
        };
        jspdfScript.onload = onScriptLoad;
        html2canvasScript.onload = onScriptLoad;
        document.body.appendChild(jspdfScript);
        document.body.appendChild(html2canvasScript);
        return () => {
            if (document.body.contains(jspdfScript)) document.body.removeChild(jspdfScript);
            if (document.body.contains(html2canvasScript)) document.body.removeChild(html2canvasScript);
        };
    }, []);

    useEffect(() => {
        if (!protocoloMestreId) {
          setError("ID do protocolo não encontrado.");
          setIsLoading(false);
          return;
        }
    
        const fetchProtocoloDetalhes = async () => {
          setIsLoading(true);
          setError(null);
    
          const apiKey = "2NtzCUDl8Ib2arnDRck0xK8taguGeFYuZqnUzpiZ9Wp-tUZ45--/i=tKxzwTPBvtykMSx!0t?7c/Z?NllkokY=TEC2DSonmOMUu0gxdCeh70/rA2NSsm7Ohjn7VM2BeP";
          let TOKEN = sessionStorage.getItem("token");
    
          if (!TOKEN) {
            setError("Usuário não autenticado.");
            setIsLoading(false);
            navigate("/login");
            return;
          }
          TOKEN = TOKEN.replace(/"/g, '');
    
          const API_URL = `https://verita-brgchubha6ceathm.brazilsouth-01.azurewebsites.net/api/protocolo/versao/ativo/detalhes/${protocoloMestreId}`;
    
          try {
            const response = await fetch(API_URL, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${TOKEN}`,
                "X-API-KEY": apiKey,
              },
            });
    
            if (!response.ok) {
              if (response.status === 401 || response.status === 403) {
                setError("Sessão expirada. Faça o login novamente.");
                navigate("/login");
              } else {
                const errorData = await response.text();
                throw new Error(`Erro ${response.status}: ${errorData}`);
              }
              throw new Error(`Erro ${response.status}`);
            }
    
            const data = await response.json();
            setProtocoloData(data);
    
          } catch (err) {
            console.error("Erro ao carregar detalhes do protocolo:", err);
            if (err instanceof Error && !error) {
              setError(err.message);
            } else if (!error) {
              setError("Ocorreu um erro desconhecido.");
            }
            setProtocoloData(null);
          } finally {
            setIsLoading(false);
          }
        };
    
        fetchProtocoloDetalhes();
    }, [protocoloMestreId, navigate]);

    const handleExportPdf = async () => {
        const content = pdfRef.current;
        const windowRef = window as any;
        if (!content || !windowRef.jspdf || !windowRef.html2canvas) {
             console.error("Bibliotecas de geração de PDF não carregadas.");
             return;
        }
        const { jsPDF } = windowRef.jspdf;
        const html2canvas = windowRef.html2canvas;
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pages = content.querySelectorAll('.page-wrapper-pdf');
        for (let i = 0; i < pages.length; i++) {
            const page = pages[i] as HTMLElement;
            const canvas = await html2canvas(page, { scale: 2, useCORS: true, logging: false });
            const imgData = canvas.toDataURL('image/png');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            if (i > 0) pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        }
        pdf.save('protocolo_completo.pdf');
    };
    
    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center">Carregando dados do protocolo...</div>;
    }

    if (error) {
        return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
    }

    if (!protocoloData) {
        return <div className="min-h-screen flex items-center justify-center">Nenhum dado encontrado para este protocolo.</div>;
    }

    const codigoEstudo = `MESTRE-${protocoloData.protocoloMestreId}-ID-${protocoloData.id}`;
    const versaoData = `Versão ${protocoloData.versao} de ${new Date(protocoloData.data_criacao).toLocaleDateString('pt-BR')}`;

    return (
        <div>
            <div className="p-4 bg-white shadow-md sticky top-0 z-10 flex justify-between items-center">
                <Button variant="outline" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar
                </Button>
                <h1 className="text-xl font-bold">Visualização do Protocolo Final</h1>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => navigate('/dashboard')}>
                        <Home className="h-4 w-4 mr-2" />
                        Home
                    </Button>
                    <Button onClick={handleExportPdf} className="bg-green-500 hover:bg-green-600" disabled={!scriptsLoaded}>
                        {scriptsLoaded ? <><Download className="h-4 w-4 mr-2" />Baixar PDF</> : 'Carregando...'}
                    </Button>
                </div>
            </div>
            <div ref={pdfRef} className="py-8 flex flex-col items-center gap-8 bg-gray-200">
                <Capa data={protocoloData} codigoEstudo={codigoEstudo} versaoData={versaoData} />
                <PaginaAssinaturas data={protocoloData} codigoEstudo={codigoEstudo} />
                <PaginaInformacoesGerais data={protocoloData} codigoEstudo={codigoEstudo} />
                <PaginaConteudoSimples numero="2" titulo="INTRODUÇÃO" data={protocoloData.introducao} fieldName="conteudo" codigoEstudo={codigoEstudo} />
                <PaginaConteudoSimples numero="3" titulo="OBJETIVO" data={protocoloData.objetivo} fieldName="conteudo" codigoEstudo={codigoEstudo} />
                <PaginaConteudoSimples numero="4" titulo="JUSTIFICATIVA" data={protocoloData.justificativa} fieldName="conteudo" codigoEstudo={codigoEstudo} />
                {/* As seções abaixo serão renderizadas com "Conteúdo não informado" se não vierem da API */}
                <PaginaConteudoSimples numero="5" titulo="REQUISITOS REGULAMENTARES" data={protocoloData.requisitosRegulamentares} fieldName="conteudo" codigoEstudo={codigoEstudo} />
                {/* Adicione outras seções aqui conforme os dados estiverem disponíveis na API */}
                {/* <PaginaMaterialMetodoPt1 data={protocoloData.materialMetodo} codigoEstudo={codigoEstudo} /> */}
                {/* <PaginaMaterialMetodoPt2 data={protocoloData.materialMetodo} codigoEstudo={codigoEstudo} /> */}
                <PaginaConteudoSimples numero="6" titulo="ANÁLISE ESTATÍSTICA" data={protocoloData.analiseEstatistica} fieldName="conteudo" codigoEstudo={codigoEstudo} />
                <PaginaConteudoSimples numero="7" titulo="OBSERVAÇÃO GERAL DE SAÚDE" data={protocoloData.observacao} fieldName="conteudo" codigoEstudo={codigoEstudo} />
                <PaginaConteudoSimples numero="8" titulo="EVENTO ADVERSO" data={protocoloData.eventoAdverso} fieldName="conteudo" codigoEstudo={codigoEstudo} />
                <PaginaConteudoSimples numero="9" titulo="EUTANÁSIA" data={protocoloData.eutanasia} fieldName="conteudo" codigoEstudo={codigoEstudo} />
                <PaginaConteudoSimples numero="10" titulo="MEDICAÇÃO CONCOMITANTE" data={protocoloData.concomitante} fieldName="conteudo" codigoEstudo={codigoEstudo} />
                <PaginaConteudoSimples numero="11" titulo="REGISTRO E ARQUIVAMENTO DE DADOS" data={protocoloData.registro} fieldName="conteudo" codigoEstudo={codigoEstudo} />
                {/* {protocoloData.cronograma && <PaginaCronograma data={protocoloData.cronograma} codigoEstudo={codigoEstudo} />} */}
                {/* {protocoloData.anexos && <PaginaAnexos data={protocoloData.anexos} codigoEstudo={codigoEstudo} />} */}
                <PaginaConteudoSimples numero="14" titulo="REFERÊNCIAS BIBLIOGRÁFICAS" data={protocoloData.bibliografia} fieldName="conteudo" codigoEstudo={codigoEstudo} />
            </div>
        </div>
    );
};

export default ProjetoPage;

