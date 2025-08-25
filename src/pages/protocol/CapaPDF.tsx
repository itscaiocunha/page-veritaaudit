import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PageWrapper = ({ children, innerRef, protocoloCodigo }: { children: React.ReactNode, innerRef?: React.Ref<HTMLDivElement>, protocoloCodigo?: string }) => (
    <div 
        ref={innerRef} 
        className="page-wrapper-pdf bg-white shadow-lg p-12 font-serif" 
        style={{ 
            width: '210mm', 
            height: '297mm',
            position: 'relative', 
            display: 'flex', 
            flexDirection: 'column' 
        }}
    >
        <header className="flex justify-between items-start text-sm mb-10">
            <div className="w-48 h-24 flex items-center justify-center text-center p-1 font-bold text-gray-700 border border-black">LOGO DA CRO/UNIVERSIDADE</div>
            <div className="text-center mt-4">
                <p className="font-semibold">Protocolo</p>
                <p className="text-xs">{protocoloCodigo || 'código do estudo (ex. 001/24)'}</p>
            </div>
            <div className="w-48 h-24 flex items-center justify-center text-center p-1 font-bold text-gray-700 border border-black">LOGO DO PATROCINADOR</div>
        </header>
        <main className="flex-grow flex flex-col">
            {children}
        </main>
        <footer className="text-xs mt-auto pt-8 space-y-2 text-justify">
            <p>Este documento contém informações confidenciais e sigilosas. Qualquer reprodução, compartilhamento ou uso impróprio deste conteúdo fora do ambiente das empresas envolvidas, sem prévio consentimento por escrito, é expressamente proibido.</p>
        </footer>
    </div>
);


const Capa = ({ data }: { data: any }) => {
    const getCurrentVersionAndDate = () => {
        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const year = today.getFullYear();
        return `01-${day}/${month}/${year}`;
    };
    const versaoDataAutomatica = getCurrentVersionAndDate();

    return (
        <PageWrapper protocoloCodigo={data?.protocolo?.codigoEstudo}>
            <div className="text-center flex-grow flex flex-col justify-center items-center">
                <h1 className="text-2xl font-bold my-4 uppercase">Protocolo de Estudo</h1>
                <div className="border-b-2 border-black mt-6 w-full text-center py-1">
                    <span className="text-black font-semibold text-lg">{data?.protocolo?.titulo || 'Título do Estudo'}</span>
                </div>
            </div>
            <div className="text-base space-y-3">
                <div className="flex"><p className="font-bold w-64 shrink-0">ESTUDO CLÍNICO</p><div className="border-b border-black flex-grow"><span className="pl-2">{data?.protocolo?.tipoEstudo || ''}</span></div></div>
                <div className="flex"><p className="font-bold w-64 shrink-0">PATROCINADOR</p><div className="border-b border-black flex-grow"><span className="pl-2">{data?.patrocinador?.patrocinador?.nome || ''}</span></div></div>
                <div className="flex"><p className="font-bold w-64 shrink-0">RESPONSÁVEL PELO ESTUDO</p><div className="border-b border-black flex-grow"><span className="pl-2">{data?.instituicao?.investigador?.nome || ''}</span></div></div>
                <div className="flex"><p className="font-bold w-64 shrink-0">ESPÉCIE ALVO</p><div className="border-b border-black flex-grow"><span className="pl-2">{data?.protocolo?.especie || 'Não informado'}</span></div></div>
                <div className="flex"><p className="font-bold w-64 shrink-0">CLASSE TERAPÊUTICA</p><div className="border-b border-black flex-grow"><span className="pl-2">{data?.protocolo?.tipoProduto || 'Não informado'}</span></div></div>
                <div className="flex"><p className="font-bold w-64 shrink-0">CÓDIGO DO ESTUDO</p><div className="border-b border-black flex-grow"><span className="pl-2">{data?.protocolo?.codigoEstudo || ''}</span></div></div>
                <div className="flex"><p className="font-bold w-64 shrink-0">VERSÃO E DATA</p><div className="border-b border-black flex-grow"><span className="pl-2">{versaoDataAutomatica}</span></div></div>
            </div>
        </PageWrapper>
    )
};

const PaginaAssinaturas = ({ dadosPatrocinador, dadosInstituicao, codigoEstudo }: { dadosPatrocinador: any, dadosInstituicao: any, codigoEstudo?: string }) => {
    const nomeRepresentante = dadosPatrocinador?.representante?.nome || " ";
    const nomePatrocinador = dadosPatrocinador?.patrocinador?.nome || " ";
    const nomeInvestigador = dadosInstituicao?.investigador?.nome || " ";
    const nomeInstituicao = dadosInstituicao?.instituicao?.nome || " ";

    return (
        <PageWrapper protocoloCodigo={codigoEstudo}>
            <h2 className="text-xl font-bold text-center mb-8">PÁGINA DE ASSINATURAS</h2>
            <p className="text-sm mb-16">Li e concordo que a pesquisa clínica será conduzida conforme estipulado neste protocolo.</p>
            <div className="space-y-20">
                <div className="flex flex-col items-center">
                    <div className="border-b border-black w-3/4"></div>
                    <p className="text-center mt-2 text-sm font-semibold">{nomeRepresentante}</p>
                    <p className="text-center text-xs">Representante do Patrocinador</p>
                    <p className="text-center text-xs font-bold">{nomePatrocinador}</p>
                </div>
                <div className="flex flex-col items-center">
                    <div className="border-b border-black w-3/4"></div>
                    <p className="text-center mt-2 text-sm font-semibold">{nomeInvestigador}</p>
                    <p className="text-center text-xs">Investigador</p>
                    <p className="text-center text-xs font-bold">{nomeInstituicao}</p>
                </div>
            </div>
            <div className="mt-24">
                <h3 className="font-bold text-center mb-4">DECLARAÇÃO DE CUMPRIMENTO DOS REQUISITOS</h3>
                <p className="text-xs text-justify">
                    Declaro que este Estudo clínico será realizado em conformidade com os princípios das Boas Práticas Clínicas (GL9 VICH) e os requisitos regulamentares aplicáveis, dispostos no tópico 6. E será conduzido de acordo com as informações dispostas neste Protocolo e conforme os Procedimentos Operacionais Padrões (POPS) aplicáveis, disponibilizados no anexo I, vale destacar que havendo divergências entre as propostas, irá prevalecer os procedimentos descritos neste protocolo.
                </p>
                <div className="flex flex-col items-center mt-16">
                    <div className="border-b border-black w-3/4"></div>
                    <p className="text-center mt-2 text-sm font-semibold">{nomeInvestigador}</p>
                    <p className="text-center text-xs">{nomeInstituicao}</p>
                </div>
            </div>
        </PageWrapper>
    );
};

const PaginaInfoGerais = ({ dadosPatrocinador, codigoEstudo }: { dadosPatrocinador: any, codigoEstudo?: string }) => {
    const renderAddress = (addr: any) => addr ? `${addr.logradouro}, ${addr.numero}, ${addr.complemento || ''} - ${addr.bairro}, ${addr.cidade}/${addr.uf} - CEP: ${addr.cep}` : 'Não informado';

    return (
        <PageWrapper protocoloCodigo={codigoEstudo}>
            <h2 className="text-xl font-bold mb-6">1 INFORMAÇÕES GERAIS</h2>
            <div className="space-y-4 text-sm">
                <div>
                    <h3 className="font-bold">1.1 Patrocinador</h3>
                    <p className="pl-4"><strong>Nome:</strong> {dadosPatrocinador?.patrocinador?.nome || 'Não informado'}</p>
                    <p className="pl-4"><strong>Endereço:</strong> {renderAddress(dadosPatrocinador?.patrocinador?.endereco)}</p>
                    <p className="pl-4"><strong>Telefone:</strong> {dadosPatrocinador?.patrocinador?.telefone || 'N/A'}</p>
                </div>
                <div>
                    <h4 className="font-bold">1.1.1 Representante do Patrocinador</h4>
                    <div className="pl-4">
                        <p><strong>Nome:</strong> {dadosPatrocinador?.representante?.nome || 'Não informado'}</p>
                        <p><strong>Formação:</strong> {dadosPatrocinador?.representante?.formacao}</p>
                        <p><strong>Registro:</strong> {dadosPatrocinador?.representante?.registro}</p>
                        <p><strong>E-mail:</strong> {dadosPatrocinador?.representante?.email}</p>
                        <p><strong>Telefone:</strong> {dadosPatrocinador?.representante?.telefone}</p>
                        <p><strong>Endereço:</strong> {renderAddress(dadosPatrocinador?.representante?.endereco)}</p>
                    </div>
                </div>
                <div>
                    <h4 className="font-bold">1.1.2 Monitor(es) do Estudo</h4>
                    {dadosPatrocinador?.monitores?.map((monitor: any, index: number) => (
                        <div key={index} className="pl-4 mb-2">
                            <p><strong>Nome:</strong> {monitor.nome}</p>
                            <p className="pl-2"><strong>Formação:</strong> {monitor.formacao}</p>
                            <p className="pl-2"><strong>Endereço:</strong> {renderAddress(monitor.endereco)}</p>
                            <p className="pl-2"><strong>Telefone:</strong> {monitor.telefone}</p>
                        </div>
                    )) || <p className="pl-4 text-gray-500">Nenhum monitor cadastrado.</p>}
                </div>
                <div>
                    <h4 className="font-bold">1.1.3 Equipe do Patrocinador</h4>
                    {dadosPatrocinador?.equipe?.map((membro: any, index: number) => (
                        <div key={index} className="pl-4 mb-2">
                            <p><strong>Nome:</strong> {membro.nome}</p>
                            <p className="pl-2"><strong>Formação:</strong> {membro.formacao}</p>
                            <p className="pl-2"><strong>Cargo:</strong> {membro.cargo}</p>
                            <p className="pl-2"><strong>Endereço:</strong> {renderAddress(membro.endereco)}</p>
                            <p className="pl-2"><strong>Telefone:</strong> {membro.telefone}</p>
                        </div>
                    )) || <p className="pl-4 text-gray-500">Nenhuma equipe cadastrada.</p>}
                </div>
            </div>
        </PageWrapper>
    );
};

const PaginaInstituicaoELocal = ({ dadosInstituicao, dadosLocal, codigoEstudo }: { dadosInstituicao: any, dadosLocal: any, codigoEstudo?: string }) => {
    const renderAddress = (addr: any) => addr ? `${addr.logradouro}, ${addr.numero}, ${addr.complemento || ''} - ${addr.bairro}, ${addr.cidade}/${addr.uf} - CEP: ${addr.cep}` : 'Não informado';
    
    const renderPessoa = (p: any) => (
        p ? <div className="pl-4">
            <p><strong>Nome:</strong> {p.nome}</p>
            <p className="pl-2"><strong>Formação:</strong> {p.formacao}</p>
            <p className="pl-2"><strong>Registro:</strong> {p.registro}</p>
            <p className="pl-2"><strong>E-mail:</strong> {p.email}</p>
            <p className="pl-2"><strong>Telefone:</strong> {p.telefone}</p>
            <p className="pl-2"><strong>Endereço:</strong> {renderAddress(p.endereco)}</p>
        </div> : <p className="pl-4 text-gray-500">Não informado.</p>
    );

    const renderLocalDetalhado = (local: any) => (
        local ? <div className="pl-4">
            <p><strong>Identificação:</strong> {local.identificacao}</p>
            <p className="pl-2"><strong>Responsável:</strong> {local.responsavel}</p>
            <p className="pl-2"><strong>Telefone:</strong> {local.telefone}</p>
            <p className="pl-2"><strong>E-mail:</strong> {local.email}</p>
            {local.geolocalizacao && <p className="pl-2"><strong>Geolocalização:</strong> {local.geolocalizacao}</p>}
            {local.registroCiaep && <p className="pl-2"><strong>N° Registro CIAEP:</strong> {local.registroCiaep}</p>}
            {local.credenciamento && <p className="pl-2"><strong>Credenciamento:</strong> {local.credenciamento}</p>}
            <p className="pl-2"><strong>Endereço:</strong> {renderAddress(local.endereco)}</p>
        </div> : <p className="pl-4 text-gray-500">Não informado.</p>
    );

    const localData = dadosLocal;

    return (
        <PageWrapper protocoloCodigo={codigoEstudo}>
            <div className="space-y-4 text-sm">
                <div>
                    <h3 className="font-bold">1.2 Instituição Responsável</h3>
                    <div className="pl-4">
                        <p><strong>Nome:</strong> {dadosInstituicao?.instituicao?.nome}</p>
                        <p className="pl-2"><strong>Telefone:</strong> {dadosInstituicao?.instituicao?.telefone}</p>
                        <p className="pl-2"><strong>N° Registro CIAEP:</strong> {dadosInstituicao?.instituicao?.registroCiaep}</p>
                        <p className="pl-2"><strong>Endereço:</strong> {renderAddress(dadosInstituicao?.instituicao?.endereco)}</p>
                    </div>
                </div>

                <div>
                    <h4 className="font-bold">1.2.1 Investigador</h4>
                    {renderPessoa(dadosInstituicao?.investigador)}
                </div>
                
                <div>
                    <h4 className="font-bold">1.2.2 Equipe Técnica</h4>
                    {dadosInstituicao?.equipeInstituicao?.map((membro: any, i: number) => (
                        <div key={i} className="mb-2">{renderPessoa(membro)}</div>
                    )) || <p className="pl-4 text-gray-500">Nenhuma equipe cadastrada.</p>}
                </div>

                <div>
                    <h3 className="font-bold">1.3 Local de realização</h3>
                    {localData?.etapasClinicas?.length > 0 && (
                        <>
                            <h4 className="font-bold">1.3.1 Etapa Clínica</h4>
                            {localData.etapasClinicas.map((local: any, i: number) => (
                                <div key={i} className="mb-2">{renderLocalDetalhado(local)}</div>
                            ))}
                        </>
                    )}
                    {localData?.etapasLaboratoriais?.length > 0 && (
                        <>
                            <h4 className="font-bold mt-3">1.3.2 Etapa Laboratorial</h4>
                            {localData.etapasLaboratoriais.map((local: any, i: number) => (
                                <div key={i} className="mb-2">{renderLocalDetalhado(local)}</div>
                            ))}
                        </>
                    )}
                    {localData?.etapasEstatisticas?.length > 0 && (
                         <>
                            <h4 className="font-bold mt-3">1.3.3 Etapa Estatística</h4>
                            {localData.etapasEstatisticas.map((local: any, i: number) => (
                               <div key={i} className="mb-2">{renderLocalDetalhado(local)}</div>
                            ))}
                        </>
                    )}
                </div>
            </div>
        </PageWrapper>
    );
};

// --- COMPONENTE PRINCIPAL DE VISUALIZAÇÃO ---
const VisualizacaoCapaPDF = () => {
    const navigate = useNavigate();
    const [allData, setAllData] = useState<any>(null);
    const [scriptsLoaded, setScriptsLoaded] = useState(false);
    const pdfRef = useRef<HTMLDivElement>(null);

    const handleGoBack = () => window.history.back();

    useEffect(() => {
        window.jspdf = window.jspdf;
        window.html2canvas = window.html2canvas;

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
        const getLatestEntry = (key: string) => {
            try {
                const data = JSON.parse(localStorage.getItem(key) || '[]');
                return Array.isArray(data) ? data.pop() : data;
            } catch (e) {
                console.error(`Error parsing localStorage key ${key}:`, e);
                return null;
            }
        };

        const patrocinador = getLatestEntry('dadosPatrocinador');
        const instituicao = getLatestEntry('dadosInstituicao');
        const produtosData = getLatestEntry('dadosProdutoVeterinario');
        const local = getLatestEntry('dadosLocalProtocol');
        const fullProtocolData = getLatestEntry('fullProtocolData');
        const protocolo = fullProtocolData?.protocolo;
        
        const produtos = {
            produtoInvestigacional: produtosData?.produtos || [],
            controleNegativo: produtosData?.controleNegativo || [],
            controlePositivo: produtosData?.controlePositivo || []
        };

        setAllData({ patrocinador, instituicao, produtos, local, protocolo });
    }, []);

    const handleExportPdf = async () => {
        const content = pdfRef.current;
        if (!content || !window.jspdf || !window.html2canvas) {
             console.error("Bibliotecas de geração de PDF não carregadas.");
             return;
        }
        
        const { jsPDF } = window.jspdf;
        const html2canvas = window.html2canvas;
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pages = content.querySelectorAll('.page-wrapper-pdf');
        
        for (let i = 0; i < pages.length; i++) {
            const page = pages[i] as HTMLElement;
            const canvas = await html2canvas(page, { 
                scale: 2, 
                useCORS: true,
            });
            const imgData = canvas.toDataURL('image/png');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            
            if (i > 0) {
                pdf.addPage();
            }
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        }
        
        pdf.save('capa_protocolo.pdf');
    };

    if (!allData?.protocolo) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
                <p>Carregando dados... Certifique-se de que todas as etapas do formulário foram preenchidas.</p>
                <Button onClick={handleGoBack} className="mt-4">Voltar</Button>
            </div>
        );
    }

    return (
        <div>
             <div className="p-4 bg-white shadow-md sticky top-0 z-10 flex justify-between items-center">
                <Button variant="outline" onClick={handleGoBack}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar
                </Button>
                <h1 className="text-xl font-bold">Visualização do Protocolo</h1>
                <div className="flex items-center gap-2">
                    <Button onClick={handleExportPdf} className="bg-green-500 hover:bg-green-600" disabled={!scriptsLoaded}>
                        {scriptsLoaded ? (
                            <>
                                <Download className="h-4 w-4 mr-2" />
                                Baixar PDF
                            </>
                        ) : (
                            'A carregar...'
                        )}
                    </Button>
                    <Button className="bg-green-500 hover:bg-green-600" onClick={() => navigate('/introducao')}>
                        Avançar
                        <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                </div>
            </div>
            <div ref={pdfRef} className="py-8 flex flex-col items-center gap-8">
                <Capa data={allData} />
                <PaginaAssinaturas 
                    dadosPatrocinador={allData.patrocinador} 
                    dadosInstituicao={allData.instituicao} 
                    codigoEstudo={allData.protocolo?.codigoEstudo}
                />
                <PaginaInfoGerais 
                    dadosPatrocinador={allData.patrocinador} 
                    codigoEstudo={allData.protocolo?.codigoEstudo}
                />
                <PaginaInstituicaoELocal 
                    dadosInstituicao={allData.instituicao} 
                    dadosLocal={allData.local}
                    codigoEstudo={allData.protocolo?.codigoEstudo}
                />
            </div>
        </div>
    );
};

// Adiciona a declaração global para as bibliotecas
declare global {
  interface Window {
    jspdf: any;
    html2canvas: any;
  }
}

export default VisualizacaoCapaPDF;
