import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from "lucide-react";

// --- HELPERS ---
const PageWrapper = ({ children }: { children: React.ReactNode }) => (
    <div 
        className="page-wrapper-pdf bg-white shadow-lg p-12 font-serif" 
        style={{ 
            width: '210mm', 
            minHeight: '297mm', // Usando minHeight para permitir que o conteúdo expanda
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
        <main className="flex-grow flex flex-col text-justify">
            {children}
        </main>
        <footer className="text-xs mt-auto pt-8 space-y-2 text-justify">
            <p>Este documento contém informações confidenciais e sigilosas pertencentes ao Patrocinador. Visto que, para o bom e fiel desempenho das atividades do Responsável pelo estudo, faz-se necessário a disponibilidade de acesso às informações técnicas e outras relacionadas ao produto veterinário investigacional, assume-se assim o compromisso de manter tais informações confidenciais e em não as divulgar a terceiros (exceto se exigido por legislação aplicável), nem as utilizará para fins não autorizados. Em caso de suspeita ou quebra real desta obrigação, o Patrocinador deverá ser imediatamente notificada.</p>
            <p>Este documento contém informações confidenciais e sigilosas. Qualquer reprodução total ou parcial, compartilhamento ou uso impróprio deste conteúdo fora do ambiente das empresas Responsável pelo estudo clínico e o Patrocinador sem prévio consentimento por escrito é expressamente proibido (exceto se exigido por legislação aplicável).</p>
        </footer>
    </div>
);

const SectionTitle = ({ number, title }: { number: string, title: string }) => (
    <h2 className="text-xl font-bold mb-6">{`${number} ${title}`}</h2>
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

const PaginaAssinaturas = ({ dadosPatrocinador, dadosInstituicao }: { dadosPatrocinador: any, dadosInstituicao: any }) => (
    <PageWrapper>
        <h2 className="text-xl font-bold text-center mb-8">PÁGINA DE ASSINATURAS</h2>
        <p className="text-sm mb-16">Li e concordo que a pesquisa clínica será conduzida conforme estipulado neste protocolo.</p>
        <div className="space-y-20">
            <div className="flex flex-col items-center">
                <div className="border-b border-black w-3/4"></div>
                <p className="text-center mt-2 text-sm font-semibold">{dadosPatrocinador?.representante?.nome || " "}</p>
                <p className="text-center text-xs">Representante do Patrocinador</p>
                <p className="text-center text-xs font-bold">{dadosPatrocinador?.patrocinador?.nome || " "}</p>
            </div>
            <div className="flex flex-col items-center">
                <div className="border-b border-black w-3/4"></div>
                <p className="text-center mt-2 text-sm font-semibold">{dadosInstituicao?.investigador?.nome || " "}</p>
                <p className="text-center text-xs">Investigador</p>
                <p className="text-center text-xs font-bold">{dadosInstituicao?.instituicao?.nome || " "}</p>
            </div>
        </div>
    </PageWrapper>
);

const PaginaInfoGerais = ({ dadosPatrocinador, dadosProdutos, dadosInstituicao, dadosLocal }: { dadosPatrocinador: any, dadosProdutos: any, dadosInstituicao: any, dadosLocal: any }) => {
    const renderAddress = (addr: any) => addr ? `${addr.logradouro}, ${addr.numero}, ${addr.complemento || ''} - ${addr.bairro}, ${addr.cidade}/${addr.uf} - CEP: ${addr.cep}` : 'Não informado';
    const renderProduct = (prod: any, title: string) => (
        prod ? 
        <div className="mt-4">
            <h4 className="font-bold">{title}</h4>
            <div className="text-sm space-y-1 pl-4">
                <p><strong>Nome/Código:</strong> {prod.identificacao}</p>
                <p><strong>Princípio ativo:</strong> {prod.principioAtivo}</p>
                <p><strong>Dose:</strong> {prod.dosagem}</p>
            </div>
        </div> : null
    );
     const renderPessoa = (p: any) => (
        p ? <p className="pl-4">{p.nome} ({p.formacao})</p> : <p className="pl-4 text-gray-500">Não informado.</p>
    );

    return (
    <PageWrapper>
        <SectionTitle number="1." title="INFORMAÇÕES GERAIS" />
        <div className="space-y-3 text-sm">
            <div>
                <h3 className="font-bold">1.1 Patrocinador</h3>
                <p className="pl-4"><strong>Nome:</strong> {dadosPatrocinador?.patrocinador?.nome || 'Não informado'}</p>
                <p className="pl-4"><strong>Endereço:</strong> {renderAddress(dadosPatrocinador?.patrocinador?.endereco)}</p>
            </div>
             <div>
                <h3 className="font-bold mt-4">1.2 Equipe responsável (Patrocinador)</h3>
                <h4 className="font-bold">1.2.1 Representante do Patrocinador</h4>
                <p className="pl-4"><strong>Nome:</strong> {dadosPatrocinador?.representante?.nome || 'Não informado'}</p>
                <h4 className="font-bold mt-2">1.2.2 Monitor(es) do Estudo</h4>
                {dadosPatrocinador?.monitores?.map((monitor: any, index: number) => (
                    <div key={index} className="pl-4 mb-2"><p><strong>Nome:</strong> {monitor.nome}</p></div>
                )) || <p className="pl-4 text-gray-500">Nenhum monitor cadastrado.</p>}
            </div>
            <div>
                 <h3 className="font-bold mt-4">1.3 Equipe responsável pela condução do estudo (Instituição)</h3>
                 <h4 className="font-bold">1.3.1 Investigador</h4>
                 {renderPessoa(dadosInstituicao?.investigador)}
                 <h4 className="font-bold mt-3">1.3.2 Equipe Técnica</h4>
                 {dadosInstituicao?.equipeInstituicao?.map((membro: any, i: number) => (
                     <div key={i}>{renderPessoa(membro)}</div>
                 )) || <p className="pl-4 text-gray-500">Nenhuma equipe cadastrada.</p>}
            </div>
            <div>
                <h3 className="font-bold mt-4">1.4 Dados dos produtos</h3>
                {renderProduct(dadosProdutos?.produtoInvestigacional?.[0], '1.4.1 Produto veterinário investigacional (PVI)')}
                {renderProduct(dadosProdutos?.controleNegativo?.[0], '1.4.2 Controle Negativo')}
                {renderProduct(dadosProdutos?.controlePositivo?.[0], '1.4.3 Controle Positivo')}
            </div>
             <div>
                <h3 className="font-bold mt-4">1.5 Local de realização</h3>
                <p className="pl-4">{dadosLocal?.etapasClinicas?.[0]?.identificacao || 'Não informado'}</p>
            </div>
        </div>
    </PageWrapper>
)};

const PaginaConteudoSimples = ({ numero, titulo, data, fieldName }: { numero: string, titulo: string, data: any, fieldName: string }) => (
    <PageWrapper>
        <SectionTitle number={`${numero}.`} title={titulo} />
        <p className="whitespace-pre-wrap">{data?.[fieldName] || 'Conteúdo não informado.'}</p>
    </PageWrapper>
);
    const campos = [
        { key: "analiseEstatistica", label: "Análise Estatística" },
        { key: "parametros", label: "Parâmetros" },
        { key: "tratamento", label: "Tratamento" },
        { key: "cegamento", label: "Cegamento" },
        { key: "randomizacao", label: "Randomização" },
        { key: "selecao", label: "Seleção" },
        { key: "aclimatacao", label: "Aclimatação" },
        { key: "exameLaboratorial", label: "Exame Laboratorial" },
        { key: "exameFisico", label: "Exame Físico" },
        { key: "criteriosRemocao", label: "Critérios de Remoção" },
        { key: "criteriosExclusao", label: "Critérios de Exclusão" },
        { key: "criteriosInclusao", label: "Critérios de Inclusão" },
        { key: "alimentacaoAgua", label: "Alimentação e Água" },
        { key: "manejoAlojamento", label: "Manejo e Alojamento" },
        { key: "quarentena", label: "Quarentena" },
        { key: "prontuariosHistorico", label: "Prontuários / Histórico" },
        { key: "numeroAnimaisParticipantes", label: "Número de Animais Participantes" },
        { key: "numeroAnimaisAvaliacao", label: "Número de Animais Avaliados" },
        { key: "origemDestino", label: "Origem e Destino" },
        { key: "delinenamentoEstudo", label: "Delineamento do Estudo" }
    ];

const PaginaMaterialMetodo = ({ data }: { data: any }) => (
    <PageWrapper>
        <SectionTitle number="6." title="MATERIAL E MÉTODO" />
        <div className="space-y-4 text-sm">
            {campos.map(({ key, label }) => (
                <div key={key}>
                    <h4 className="font-bold">{label}</h4>
                    <p className="pl-4 whitespace-pre-wrap">
                        {data?.[key] ? String(data[key]) : "Não informado."}
                    </p>
                </div>
            ))}
        </div>
    </PageWrapper>
);

const PaginaEventoAdverso = ({ data }: { data: any }) => (
    <PageWrapper>
        <SectionTitle number="8." title="EVENTO ADVERSO" />
        <div className="space-y-4 text-sm">
             {data && Object.entries(data).map(([key, value]) => (
                <div key={key}>
                    <h4 className="font-bold capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</h4>
                    <p className="pl-4 whitespace-pre-wrap">{String(value)}</p>
                </div>
            ))}
            {!data && <p>Conteúdo não informado.</p>}
        </div>
    </PageWrapper>
);

// --- COMPONENTE PRINCIPAL DE VISUALIZAÇÃO ---
const VisualizacaoCompletaPDF = () => {
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
                const item = localStorage.getItem(key);
                if (!item) {
                    return null;
                }
                const data = JSON.parse(item);
                if (Array.isArray(data)) {
                    return data.length > 0 ? data[data.length - 1] : null;
                }
                return data;
            } catch (e) {
                console.error(`Erro ao processar a chave ${key} do localStorage:`, e);
                return null;
            }
        };

        const patrocinador = getLatestEntry('dadosPatrocinador');
        const instituicao = getLatestEntry('dadosInstituicao');
        const produtosData = getLatestEntry('dadosProdutoVeterinario');
        const local = getLatestEntry('dadosLocalProtocol');
        const protocolo = getLatestEntry('fullProtocolData')?.protocolo;
        
        const introducao = getLatestEntry('dadosIntroducao');
        const objetivo = getLatestEntry('dadosObjetivo');
        const justificativa = getLatestEntry('dadosJustificativa');
        const requisito = getLatestEntry('dadosRequisito');
        const materialMetodo = getLatestEntry('dadosMaterialMetodo');
        const saude = getLatestEntry('dadosSaude');
        const eventoAdverso = getLatestEntry('dadosEventoAdverso');
        const eutanasia = getLatestEntry('dadosEutanasia');
        const registro = getLatestEntry('dadosRegistro');

        const produtos = {
            produtoInvestigacional: produtosData?.produtos || [],
            controleNegativo: produtosData?.controleNegativo || [],
            controlePositivo: produtosData?.controlePositivo || []
        };

        setAllData({ 
            patrocinador, instituicao, produtos, local, protocolo,
            introducao, objetivo, justificativa, requisito, materialMetodo,
            saude, eventoAdverso, eutanasia, registro
        });
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
            const canvas = await html2canvas(page, { scale: 2, useCORS: true });
            const imgData = canvas.toDataURL('image/png');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            if (i > 0) pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        }
        pdf.save('protocolo_completo.pdf');
    };

    if (!allData) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
                <p>Carregando dados...</p>
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
                <Button onClick={handleExportPdf} className="bg-green-500 hover:bg-green-600" disabled={!scriptsLoaded}>
                    {scriptsLoaded ? <><Download className="h-4 w-4 mr-2" />Baixar PDF</> : 'A carregar...'}
                </Button>
             </div>
             <div ref={pdfRef} className="py-8 flex flex-col items-center gap-8 bg-gray-200">
                <Capa data={allData} />
                <PaginaAssinaturas dadosPatrocinador={allData.patrocinador} dadosInstituicao={allData.instituicao} />
                <PaginaInfoGerais dadosPatrocinador={allData.patrocinador} dadosProdutos={allData.produtos} dadosInstituicao={allData.instituicao} dadosLocal={allData.local} />
                <PaginaConteudoSimples numero="2" titulo="INTRODUÇÃO" data={allData.introducao} fieldName="conteudoIntroducao" />
                <PaginaConteudoSimples numero="3" titulo="OBJETIVO" data={allData.objetivo} fieldName="conteudoObjetivo" />
                <PaginaConteudoSimples numero="4" titulo="JUSTIFICATIVA" data={allData.justificativa} fieldName="conteudoJustificativa" />
                <PaginaConteudoSimples numero="5" titulo="REQUISITOS REGULAMENTARES E BOAS PRÁTICAS CLÍNICAS" data={allData.requisito} fieldName="conteudoRequisito" />
                <PaginaMaterialMetodo data={allData.materialMetodo} />
                <PaginaConteudoSimples numero="7" titulo="SAÚDE ANIMAL" data={allData.saude} fieldName="conteudoSaude" />
                <PaginaEventoAdverso data={allData.eventoAdverso} />
                <PaginaConteudoSimples numero="9" titulo="EUTANÁSIA" data={allData.eutanasia} fieldName="conteudoEutanasia" />
                <PaginaConteudoSimples numero="10" titulo="REGISTRO E ARQUIVAMENTO" data={allData.registro} fieldName="conteudoRegistro" />
             </div>
        </div>
    );
};

export default VisualizacaoCompletaPDF;