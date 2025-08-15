import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
// import jsPDF from 'jspdf'; // Removido
// import html2canvas from 'html2canvas'; // Removido
import { ArrowLeft, Download, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

// --- HELPERS ---
const PageWrapper = ({ children, innerRef }: { children: React.ReactNode, innerRef?: React.Ref<HTMLDivElement> }) => (
    <div 
        ref={innerRef} 
        className="page-wrapper-pdf bg-white shadow-lg p-12 font-serif" 
        style={{ 
            width: '210mm', 
            height: '297mm', // Altura fixa para rácio de aspeto correto
            position: 'relative', 
            display: 'flex', 
            flexDirection: 'column' 
        }}
    >
        <header className="flex justify-between items-start text-sm mb-10">
            <div className="w-48 h-24 flex items-center justify-center text-center p-1 font-bold text-gray-700 border border-black">LOGO DA CRO/UNIVERSIDADE</div>
            <div className="text-center mt-4">
                <p className="font-semibold">Protocolo</p>
                <p className="text-xs">código do estudo (ex. 001/24)</p>
            </div>
            <div className="w-48 h-24 flex items-center justify-center text-center p-1 font-bold text-gray-700 border border-black">LOGO DO PATROCINADOR</div>
        </header>
        <main className="flex-grow flex flex-col">
            {children}
        </main>
        <footer className="text-xs mt-auto pt-8 space-y-2 text-justify">
            <p>Este documento contém informações confidenciais e sigilosas pertencentes ao Patrocinador. Visto que, para o bom e fiel desempenho das atividades do Responsável pelo estudo, faz-se necessário a disponibilidade de acesso às informações técnicas e outras relacionadas ao produto veterinário investigacional, assume-se assim o compromisso de manter tais informações confidenciais e em não as divulgar a terceiros (exceto se exigido por legislação aplicável), nem as utilizará para fins não autorizados. Em caso de suspeita ou quebra real desta obrigação, o Patrocinador deverá ser imediatamente notificada.</p>
            <p>Este documento contém informações confidenciais e sigilosas. Qualquer reprodução total ou parcial, compartilhamento ou uso impróprio deste conteúdo fora do ambiente das empresas Responsável pelo estudo clínico e o Patrocinador sem prévio consentimento por escrito é expressamente proibido (exceto se exigido por legislação aplicável).</p>
        </footer>
    </div>
);


// --- COMPONENTES DE PÁGINA ---

const Capa = ({ data }: { data: any }) => (
    <PageWrapper>
        <div className="text-center flex-grow flex flex-col justify-center items-center">
            <h1 className="text-2xl font-bold my-4 uppercase">Protocolo de Estudo</h1>
            <p className="text-xl font-semibold uppercase">
                {data?.protocolo?.tipo || "EFICÁCIA/SEGURANÇA CLÍNICA/RESÍDUO/BIODISPONIBILIDADE"}
            </p>
            <p className="text-lg mt-2">de uma formulação veterinária</p>
            <div className="border-b-2 border-black mt-6 w-full text-center py-1">
                <span className="text-black font-semibold text-lg">{data?.protocolo?.titulo || 'Título do Estudo'}</span>
            </div>
        </div>
        <div className="text-base space-y-3">
            <div className="flex"><p className="font-bold w-64 shrink-0">OBJETIVO</p><div className="border-b border-black flex-grow"><span className="pl-2">{data?.protocolo?.objetivo || ''}</span></div></div>
            <div className="flex"><p className="font-bold w-64 shrink-0">PATROCINADOR</p><div className="border-b border-black flex-grow"><span className="pl-2">{data?.patrocinador?.patrocinador?.nome || ''}</span></div></div>
            <div className="flex"><p className="font-bold w-64 shrink-0">RESPONSÁVEL PELO ESTUDO</p><div className="border-b border-black flex-grow"><span className="pl-2">{data?.instituicao?.investigador?.nome || ''}</span></div></div>
            <div className="flex"><p className="font-bold w-64 shrink-0">CÓDIGO DO ESTUDO</p><div className="border-b border-black flex-grow"><span className="pl-2">{data?.protocolo?.codigoEstudo || ''}</span></div></div>
            <div className="flex items-center"><p className="font-bold w-64 shrink-0 leading-tight">PRODUTO VETERINÁRIO<br />INVESTIGACIONAL</p><div className="border-b border-black flex-grow self-end mb-1"><span className="pl-2">{data?.produtos?.produtoInvestigacional?.[0]?.identificacao || ''}</span></div></div>
            <div className="flex"><p className="font-bold w-64 shrink-0">VERSÃO E DATA</p><div className="border-b border-black flex-grow"><span className="pl-2">{data?.protocolo?.versaoData || ''}</span></div></div>
            <div className="flex items-start mt-2"><p className="font-bold w-64 shrink-0">CONFORMIDADE ÉTICA:</p><p className="text-sm ml-2">Este protocolo será submetido a uma comissão de ética no uso de animais e só será iniciado após aprovação.</p></div>
            <div className="flex"><p className="font-bold w-64 shrink-0">DURAÇÃO DO ESTUDO CLÍNICO:</p><div className="border-b border-black flex-grow"><span className="pl-2">{data?.protocolo?.duracao || ''}</span></div></div>
        </div>
    </PageWrapper>
);

const PaginaAssinaturas = ({ dadosPatrocinador, dadosInstituicao }: { dadosPatrocinador: any, dadosInstituicao: any }) => {
    const nomeRepresentante = dadosPatrocinador?.representante?.nome || " ";
    const nomePatrocinador = dadosPatrocinador?.patrocinador?.nome || " ";
    const nomeInvestigador = dadosInstituicao?.investigador?.nome || " ";
    const nomeInstituicao = dadosInstituicao?.instituicao?.nome || " ";

    return (
        <PageWrapper>
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

const PaginaInfoGerais = ({ dadosPatrocinador, dadosProdutos }: { dadosPatrocinador: any, dadosProdutos: any }) => {
    const renderAddress = (addr: any) => addr ? `${addr.logradouro}, ${addr.numero}, ${addr.complemento || ''} - ${addr.bairro}, ${addr.cidade}/${addr.uf} - CEP: ${addr.cep}` : 'Não informado';
    const renderProduct = (prod: any) => (
        prod ? 
        <div className="text-sm space-y-1">
            <p><strong>Nome/Código do produto:</strong> {prod.identificacao}</p>
            <p><strong>Princípio ativo:</strong> {prod.principioAtivo}</p>
            <p><strong>Dose:</strong> {prod.dosagem}</p>
            <p><strong>Via de administração:</strong> {prod.viaAdministracao}</p>
            <p><strong>Fabricante:</strong> {prod.fabricante}</p>
            <p><strong>Composição:</strong> {prod.concentracao}</p>
            <table className="w-full mt-2 text-xs border-collapse border border-black">
                <thead>
                    <tr>
                        <th className="border border-black p-1">Partida/Lote</th>
                        <th className="border border-black p-1">Apresentação</th>
                        <th className="border border-black p-1">Data de Fabricação</th>
                        <th className="border border-black p-1">Data de validade</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="border border-black p-1 text-center">{prod.lote}</td>
                        <td className="border border-black p-1 text-center">{prod.apresentacoes}</td>
                        <td className="border border-black p-1 text-center">{prod.dataFabricacao}</td>
                        <td className="border border-black p-1 text-center">{prod.dataValidade}</td>
                    </tr>
                </tbody>
            </table>
        </div> : <p className="text-sm text-gray-500">Não informado.</p>
    );

    return (
        <PageWrapper>
            <h2 className="text-xl font-bold mb-6">1 INFORMAÇÕES GERAIS</h2>
            <div className="space-y-3 text-sm">
                <div>
                    <h3 className="font-bold">1.1 Patrocinador</h3>
                    <p className="pl-4"><strong>Nome:</strong> {dadosPatrocinador?.patrocinador?.nome || 'Não informado'}</p>
                    <p className="pl-4"><strong>Endereço:</strong> {renderAddress(dadosPatrocinador?.patrocinador?.endereco)}</p>
                    <p className="pl-4"><strong>Telefone:</strong> {dadosPatrocinador?.patrocinador?.telefone || 'N/A'}</p>
                </div>
                <div>
                    <h4 className="font-bold">1.1.1 Representante do Patrocinador</h4>
                    <p className="pl-4"><strong>Nome:</strong> {dadosPatrocinador?.representante?.nome || 'Não informado'}</p>
                    <p className="pl-4"><strong>Endereço:</strong> {renderAddress(dadosPatrocinador?.representante?.endereco)}</p>
                    <p className="pl-4"><strong>Telefone:</strong> {dadosPatrocinador?.representante?.telefone || 'N/A'}</p>
                </div>
                <div>
                    <h4 className="font-bold">1.1.2 Monitor(es) do Estudo</h4>
                    {dadosPatrocinador?.monitores?.map((monitor: any, index: number) => (
                        <div key={index} className="pl-4 mb-2">
                            <p><strong>Nome:</strong> {monitor.nome}</p>
                            <p><strong>Endereço:</strong> {renderAddress(monitor.endereco)}</p>
                            <p><strong>Telefone:</strong> {monitor.telefone}</p>
                        </div>
                    )) || <p className="pl-4 text-gray-500">Nenhum monitor cadastrado.</p>}
                </div>
                <div>
                    <h3 className="font-bold mt-4">1.2 Dados dos produtos</h3>
                    <h4 className="font-bold">1.2.1 Produto veterinário investigacional (PVI)</h4>
                    <div className="pl-4">{renderProduct(dadosProdutos?.produtoInvestigacional?.[0])}</div>
                </div>
            </div>
        </PageWrapper>
    );
};

const PaginaContinuacaoInfo = ({ dadosProdutos, dadosInstituicao, dadosLocal }: { dadosProdutos: any, dadosInstituicao: any, dadosLocal: any }) => {
    const renderProduct = (prod: any) => (
         prod ? 
        <div className="text-sm space-y-1">
            <p><strong>Nome/Código do produto:</strong> {prod.identificacao}</p>
            <p><strong>Princípio ativo:</strong> {prod.principioAtivo}</p>
        </div> : <p className="text-sm text-gray-500">Não informado.</p>
    );
    const renderLocal = (local: any) => (
        local ? <p className="pl-4">{local.identificacao}</p> : <p className="pl-4 text-gray-500">Não informado.</p>
    );
    const renderPessoa = (p: any) => (
        p ? <p className="pl-4">{p.nome} ({p.formacao})</p> : <p className="pl-4 text-gray-500">Não informado.</p>
    );

    return (
        <PageWrapper>
            <div className="space-y-3 text-sm">
                <h4 className="font-bold">1.2.2 Controle Negativo</h4>
                <div className="pl-4">{renderProduct(dadosProdutos?.controleNegativo?.[0])}</div>

                <h4 className="font-bold mt-3">1.2.3 Controle Positivo</h4>
                <div className="pl-4">{renderProduct(dadosProdutos?.controlePositivo?.[0])}</div>
                
                <h3 className="font-bold mt-4">1.3 Local de realização</h3>
                <h4 className="font-bold">1.3.1 Etapa Clínica</h4>
                {renderLocal(dadosLocal?.etapasClinicas?.[0])}
                <h4 className="font-bold mt-3">1.3.2 Etapa Laboratorial</h4>
                {renderLocal(dadosLocal?.etapasLaboratoriais?.[0])}

                <h3 className="font-bold mt-4">1.4 Equipe responsável pela condução do estudo</h3>
                <h4 className="font-bold">1.4.1 Investigador</h4>
                {renderPessoa(dadosInstituicao?.investigador)}
                <h4 className="font-bold mt-3">1.4.2 Equipe Técnica</h4>
                <div className="space-y-1">
                    {dadosInstituicao?.equipeInstituicao?.map((membro: any, i: number) => (
                        <div key={i}>{renderPessoa(membro)}</div>
                    )) || <p className="pl-4 text-gray-500">Nenhuma equipe cadastrada.</p>}
                </div>

                <h3 className="font-bold mt-4">1.5 Comissão de Ética</h3>
                <p className="text-sm pl-4">A ser definido após submissão.</p>
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
        const protocolo = getLatestEntry('fullProtocolData')?.protocolo;
        
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
        
        pdf.save('protocolo_completo.pdf');
    };

    if (!allData?.patrocinador || !allData?.instituicao || !allData?.produtos) {
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
                <PaginaAssinaturas dadosPatrocinador={allData.patrocinador} dadosInstituicao={allData.instituicao} />
                <PaginaInfoGerais dadosPatrocinador={allData.patrocinador} dadosProdutos={allData.produtos} />
                <PaginaContinuacaoInfo dadosProdutos={allData.produtos} dadosInstituicao={allData.instituicao} dadosLocal={allData.local} />
            </div>
        </div>
    );
};

export default VisualizacaoCapaPDF;
