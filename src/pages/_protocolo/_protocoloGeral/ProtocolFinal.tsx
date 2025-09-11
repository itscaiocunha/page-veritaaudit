import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Home } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useNavigate, BrowserRouter as Router, Routes, Route } from "react-router-dom";

// --- HELPERS ---
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

// --- COMPONENTES DE PÁGINA ---

const Capa = ({ data }: { data: any }) => (
    <PageWrapper innerRef={null} codigoEstudo={data?.protocolo?.codigoEstudo}>
        <div className="text-center flex-grow flex flex-col justify-center items-center">
            <h1 className="text-2xl font-bold my-4 uppercase">Protocolo de Estudo</h1>
            <div className="border-b-2 border-black mt-6 w-full text-center py-1">
                <span className="text-black font-semibold text-lg">{data?.protocolo?.titulo || 'Título do Estudo'}</span>
            </div>
        </div>
        <div className="text-base space-y-3">
             <div className="flex"><p className="font-bold w-64 shrink-0">ESTUDO CLÍNICO</p><div className="border-b border-black flex-grow"><span className="pl-2">{data?.protocolo?.tipoEstudo || ''}</span></div></div>
             <div className="flex"><p className="font-bold w-64 shrink-0">PATROCINADOR</p><div className="border-b border-black flex-grow"><span className="pl-2">{data?.patrocinador?.patrocinador?.nome || ''}</span></div></div>              <div className="flex"><p className="font-bold w-64 shrink-0">ESPÉCIE ALVO</p><div className="border-b border-black flex-grow"><span className="pl-2">{data?.protocolo?.especie || 'Não informado'}</span></div></div>
             <div className="flex"><p className="font-bold w-64 shrink-0">CLASSE TERAPÊUTICA</p><div className="border-b border-black flex-grow"><span className="pl-2">{data?.protocolo?.tipoProduto || 'Não informado'}</span></div></div>
             <div className="flex"><p className="font-bold w-64 shrink-0">CÓDIGO DO ESTUDO</p><div className="border-b border-black flex-grow"><span className="pl-2">{data?.protocolo?.codigoEstudo || ''}</span></div></div>
             <div className="flex"><p className="font-bold w-64 shrink-0">VERSÃO E DATA</p><div className="border-b border-black flex-grow"><span className="pl-2">{data?.protocolo?.versaoData || ''}</span></div></div>
        </div>
    </PageWrapper>
);

const PaginaAssinaturas = ({ dadosPatrocinador, dadosInstituicao, codigoEstudo }: { dadosPatrocinador: any, dadosInstituicao: any, codigoEstudo?: string }) => (
    <PageWrapper codigoEstudo={codigoEstudo}>
        <h2 className="text-xl font-bold text-center mb-8">PÁGINA DE ASSINATURAS</h2>
        <p className="text-sm mb-16">Li este protocolo e concordo que ele seja conduzido em conformidade com o estipulado.</p>
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

const PaginaInformacoesGerais = ({ allData, codigoEstudo }: { allData: any, codigoEstudo?: string }) => {
    const renderAddress = (addr) => addr ? `${addr.logradouro}, ${addr.numero}, ${addr.complemento || ''} - ${addr.bairro}, ${addr.cidade}/${addr.uf} - CEP: ${addr.cep}` : 'Não informado';
    const renderPessoa = (p, title) => (
        p ? <div className="pl-4 mt-2">
            {title && <h4 className="font-bold">{title}</h4>}
            <div className="pl-2">
                <p><strong>Nome:</strong> {p.nome}</p>
                <p><strong>Formação:</strong> {p.formacao}</p>
                {p.registro && <p><strong>Registro:</strong> {p.registro}</p>}
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
                        <p><strong>Nome:</strong> {allData.patrocinador?.patrocinador?.nome}</p>
                        <p><strong>Endereço:</strong> {renderAddress(allData.patrocinador?.patrocinador?.endereco)}</p>
                        <p><strong>Telefone:</strong> {allData.patrocinador?.patrocinador?.telefone}</p>
                    </div>
                    {renderPessoa(allData.patrocinador?.representante, '1.1.1 Representante do Patrocinador')}
                    <div className="pl-4 mt-2">
                        <h4 className="font-bold">1.1.2 Monitor(es) do Estudo</h4>
                        {allData.patrocinador?.monitores?.map((m, i) => <div key={i} className="mb-2">{renderPessoa(m, '')}</div>)}
                    </div>
                     <div className="pl-4 mt-2">
                        <h4 className="font-bold">1.1.3 Equipe do Patrocinador</h4>
                        {allData.patrocinador?.equipe?.map((m, i) => <div key={i} className="mb-2">{renderPessoa(m, '')}</div>)}
                    </div>
                </section>
                <section className="mt-4">
                     <h3 className="font-bold">1.2 Instituição Responsável</h3>
                     <div className="pl-4">
                        <p><strong>Nome:</strong> {allData.instituicao?.instituicao?.nome}</p>
                        <p><strong>Endereço:</strong> {renderAddress(allData.instituicao?.instituicao?.endereco)}</p>
                     </div>
                     {renderPessoa(allData.instituicao?.investigador, '1.2.1 Investigador')}
                     <div className="pl-4 mt-2">
                        <h4 className="font-bold">1.2.2 Equipe Técnica</h4>
                        {allData.instituicao?.equipeInstituicao?.map((m, i) => <div key={i} className="mb-2">{renderPessoa(m, '')}</div>)}
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

const PaginaMaterialMetodoPt1 = ({ data, codigoEstudo }: { data: any, codigoEstudo?: string }) => (
    <PageWrapper codigoEstudo={codigoEstudo}>
        <SectionTitle number="5." title="MATERIAL E MÉTODO" />
        {data ? (
            <div className="space-y-6 text-sm">
                <section>
                    <h3 className="font-bold text-base mb-2">5.1 Animais</h3>
                    <div className="pl-4 space-y-4">
                        <div>
                            <h4 className="font-semibold">5.1.1 Origem e Destino</h4>
                            <p className="pl-2">{data.animais?.origemDestino}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold">5.1.2 Características Gerais</h4>
                            <Table className="mt-2 text-xs">
                                <TableHeader><TableRow><TableHead>Espécie</TableHead><TableHead>Raça</TableHead><TableHead>Sexo</TableHead><TableHead>Idade</TableHead><TableHead>Peso</TableHead><TableHead>Identificação</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {data.animais?.caracteristicasGerais?.map((animal: any, index: number) => (
                                        <TableRow key={index}><TableCell>{animal.especie}</TableCell><TableCell>{animal.raca}</TableCell><TableCell>{animal.sexo}</TableCell><TableCell>{animal.idade}</TableCell><TableCell>{animal.peso}</TableCell><TableCell>{animal.identificacao}</TableCell></TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        <div>
                            <h4 className="font-semibold">5.1.3 Justificativa do "n" amostral</h4>
                            <p className="pl-2 whitespace-pre-wrap">{data.animais?.justificativaN}</p>
                        </div>
                    </div>
                </section>
                <section>
                    <h3 className="font-bold text-base mb-2">5.2 Manejo e Alojamento</h3>
                    <div className="pl-4 space-y-4">
                         <div><h4 className="font-semibold">5.2.1 Instalação e Manejo</h4><p className="pl-2 whitespace-pre-wrap">{data.manejoAlojamento?.instalacaoManejo}</p></div>
                         <div><h4 className="font-semibold">5.2.2 Alimentação e Água</h4><p className="pl-2 whitespace-pre-wrap">{data.manejoAlojamento?.alimentacaoAgua}</p></div>
                    </div>
                </section>
                 <section>
                    <h3 className="font-bold text-base mb-2">5.3 Critérios de Inclusão, exclusão e remoção</h3>
                    <div className="pl-4 space-y-4">
                         <div><h4 className="font-semibold">5.3.1 Critérios de Inclusão</h4><p className="pl-2 whitespace-pre-wrap">{data.criterios?.inclusao}</p></div>
                         <div><h4 className="font-semibold">5.3.2 Critérios de Exclusão</h4><p className="pl-2 whitespace-pre-wrap">{data.criterios?.exclusao}</p></div>
                         <div><h4 className="font-semibold">5.3.3 Remoção de Animais</h4><p className="pl-2 whitespace-pre-wrap">{data.criterios?.remocao}</p></div>
                    </div>
                </section>
                 <section>
                    <h3 className="font-bold text-base mb-2">5.4 Avaliação Clínica para Seleção</h3>
                    <div className="pl-4 space-y-4">
                         <div><h4 className="font-semibold">5.4.1 Exame Físico</h4><p className="pl-2 whitespace-pre-wrap">{data.avaliacaoClinica?.exameFisico}</p></div>
                         <div><h4 className="font-semibold">5.4.2 Exame Laboratorial</h4><p className="pl-2 whitespace-pre-wrap">{data.avaliacaoClinica?.exameLaboratorial}</p></div>
                         {data.avaliacaoClinica?.outrasAvaliacoes?.length > 0 && <div><h4 className="font-semibold">Outras Avaliações</h4>{data.avaliacaoClinica.outrasAvaliacoes.map((item:any, i:number) => <div key={i} className="pl-2"><p><strong>{item.nome}:</strong> {item.descricao}</p></div>)}</div>}
                    </div>
                </section>
                 <section>
                    <h3 className="font-bold text-base mb-2">5.5 Aclimatação/Quarentena</h3><p className="pl-4 whitespace-pre-wrap">{data.aclimatacao}</p>
                </section>
            </div>
        ) : <p>Conteúdo não informado.</p>}
    </PageWrapper>
);

const PaginaMaterialMetodoPt2 = ({ data, codigoEstudo }: { data: any, codigoEstudo?: string }) => (
    <PageWrapper codigoEstudo={codigoEstudo}>
        <SectionTitle number="5." title="MATERIAL E MÉTODO (continuação)" />
        {data ? (
            <div className="space-y-6 text-sm">
                 <section>
                    <h3 className="font-bold text-base mb-2">5.6 Seleção</h3><p className="pl-4 whitespace-pre-wrap">{data.selecao}</p>
                    <h3 className="font-bold text-base mb-2 mt-4">5.7 Randomização</h3><p className="pl-4 whitespace-pre-wrap">{data.randomizacao}</p>
                    <h3 className="font-bold text-base mb-2 mt-4">5.8 Cegamento</h3><p className="pl-4 whitespace-pre-wrap">{data.cegamento}</p>
                </section>
                <section>
                    <h3 className="font-bold text-base mb-2">5.9 Tratamento</h3>
                    <div className="pl-4 space-y-4">
                         <div><h4 className="font-semibold">Descrição</h4><p className="pl-2 whitespace-pre-wrap">{data.tratamento?.descricao}</p></div>
                        <div>
                            <h4 className="font-semibold">Produto Veterinário Investigacional (PVI)</h4>
                            <div className="pl-2"><p><strong>Identificação:</strong> {data.tratamento?.pvi?.identificacao}</p><p><strong>Princípio Ativo:</strong> {data.tratamento?.pvi?.principioAtivo}</p></div>
                        </div>
                    </div>
                </section>
                 <section>
                    <h3 className="font-bold text-base mb-2">5.10 Parâmetros de Avaliação</h3><p className="pl-4 whitespace-pre-wrap">{data.parametrosAvaliacao}</p>
                </section>
            </div>
        ) : <p>Conteúdo não informado.</p>}
    </PageWrapper>
);

const PaginaCronograma = ({ data, codigoEstudo }: { data: any, codigoEstudo?: string }) => (
    <PageWrapper codigoEstudo={codigoEstudo}>
        <SectionTitle number="12." title="CRONOGRAMA DO ESTUDO" />
        <p className="text-sm mb-4"><strong>Duração do Estudo:</strong> {data?.duracaoEstudo || 'N/A'} dias</p>
        <Table>
            <TableHeader><TableRow><TableHead>Dia do Estudo</TableHead><TableHead>Datas</TableHead><TableHead>Atividade</TableHead><TableHead>Fichas</TableHead></TableRow></TableHeader>
            <TableBody>
                {data?.atividades?.map((item: any, index: number) => (
                    <TableRow key={index}><TableCell>{item.diaEstudo}</TableCell><TableCell>{item.datas}</TableCell><TableCell>{item.atividade}</TableCell><TableCell>{item.fichas}</TableCell></TableRow>
                ))}
            </TableBody>
        </Table>
    </PageWrapper>
);

const PaginaAnexos = ({ data, codigoEstudo }: { data: any, codigoEstudo?: string }) => {
    const formulariosDisponiveis = [
        { id: 'consentimento', label: 'Formulário de Consentimento Livre e Esclarecido (TCLE)' },
        { id: 'fichaClinica', label: 'Ficha Clínica Individual do Animal' },
        { id: 'eventoAdverso', label: 'Formulário de Registro de Evento Adverso' },
        { id: 'administracaoTratamento', label: 'Formulário de Administração de Tratamento' },
        { id: 'coletaAmostras', label: 'Formulário de Coleta de Amostras Biológicas' },
        { id: 'avaliacaoClinica', label: 'Formulário de Avaliação de Parâmetros Clínicos' },
        { id: 'inventarioProdutos', label: 'Formulário de Inventário de Produtos Veterinários' },
        { id: 'termoAssentimento', label: 'Termo de Assentimento Livre e Esclarecido (TALE)' },
    ];

    const selecionados = formulariosDisponiveis.filter(form => data?.formularios?.[form.id]);

    return (
        <PageWrapper codigoEstudo={codigoEstudo}>
            <SectionTitle number="13." title="ANEXOS - FORMULÁRIOS DE REGISTRO" />
            <ul className="list-disc pl-5">
                {selecionados.length > 0 ? selecionados.map(form => <li key={form.id}>{form.label}</li>) : <li>Nenhum formulário selecionado.</li>}
            </ul>
        </PageWrapper>
    );
};

// --- COMPONENTE PRINCIPAL DE VISUALIZAÇÃO ---
const VisualizacaoCompletaPDF = () => {
    const [allData, setAllData] = useState<any>(null);
    const [scriptsLoaded, setScriptsLoaded] = useState(false);
    const pdfRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const handleGoBack = () => window.history.back();
    const handleGoHome = () => navigate('/dashboard');

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
                if (!item) return null;
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

        setAllData({ 
            patrocinador: getLatestEntry('dadosPatrocinador'),
            instituicao: getLatestEntry('dadosInstituicao'),
            local: getLatestEntry('dadosLocalProtocol'),
            protocolo: getLatestEntry('fullProtocolData')?.protocolo,
            introducao: getLatestEntry('dadosIntroducao'),
            objetivo: getLatestEntry('dadosObjetivo'),
            justificativa: getLatestEntry('dadosJustificativa'),
            requisito: getLatestEntry('dadosRequisito'),
            materialMetodo: getLatestEntry('dadosMaterialMetodo'),
            analiseEstatistica: getLatestEntry('dadosAnaliseEstatistica'),
            saude: getLatestEntry('dadosSaude'),
            eventoAdverso: getLatestEntry('dadosEventoAdverso'),
            eutanasia: getLatestEntry('dadosEutanasia'),
            registro: getLatestEntry('dadosRegistro'),
            cronograma: getLatestEntry('dadosCronograma'),
            anexos: getLatestEntry('dadosAnexos'),
            bibliografia: getLatestEntry('dadosBibliografia'),
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
            const canvas = await html2canvas(page, { scale: 2, useCORS: true, logging: false });
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
                <h1 className="text-xl font-bold">Visualização do Protocolo Final</h1>
                <div className="flex items-center gap-2">
                     <Button variant="outline" onClick={handleGoHome}>
                        <Home className="h-4 w-4 mr-2" />
                        Home
                    </Button>
                    <Button onClick={handleExportPdf} className="bg-green-500 hover:bg-green-600" disabled={!scriptsLoaded}>
                        {scriptsLoaded ? <><Download className="h-4 w-4 mr-2" />Baixar PDF</> : 'Carregando...'}
                    </Button>
                </div>
             </div>
             <div ref={pdfRef} className="py-8 flex flex-col items-center gap-8 bg-gray-200">
                <Capa data={allData} />
                <PaginaAssinaturas dadosPatrocinador={allData.patrocinador} dadosInstituicao={allData.instituicao} codigoEstudo={allData.protocolo?.codigoEstudo} />
                <PaginaInformacoesGerais allData={allData} codigoEstudo={allData.protocolo?.codigoEstudo} />
                <PaginaConteudoSimples numero="2" titulo="INTRODUÇÃO" data={allData.introducao} fieldName="conteudoIntroducao" codigoEstudo={allData.protocolo?.codigoEstudo} />
                <PaginaConteudoSimples numero="3" titulo="OBJETIVO" data={allData.objetivo} fieldName="conteudoObjetivo" codigoEstudo={allData.protocolo?.codigoEstudo} />
                <PaginaConteudoSimples numero="4" titulo="JUSTIFICATIVA" data={allData.justificativa} fieldName="conteudoJustificativa" codigoEstudo={allData.protocolo?.codigoEstudo} />
                <PaginaMaterialMetodoPt1 data={allData.materialMetodo} codigoEstudo={allData.protocolo?.codigoEstudo} />
                <PaginaMaterialMetodoPt2 data={allData.materialMetodo} codigoEstudo={allData.protocolo?.codigoEstudo} />
                <PaginaConteudoSimples numero="6" titulo="ANÁLISE ESTATÍSTICA" data={allData.analiseEstatistica} fieldName="conteudoAnaliseEstatistica" codigoEstudo={allData.protocolo?.codigoEstudo} />
                <PaginaConteudoSimples numero="7" titulo="OBSERVAÇÃO GERAL DE SAÚDE" data={allData.saude} fieldName="conteudoSaude" codigoEstudo={allData.protocolo?.codigoEstudo} />
                <PaginaConteudoSimples numero="8" titulo="EVENTO ADVERSO" data={allData.eventoAdverso} fieldName="conteudoEventoAdverso" codigoEstudo={allData.protocolo?.codigoEstudo} />
                <PaginaConteudoSimples numero="9" titulo="EUTANÁSIA" data={allData.eutanasia} fieldName="conteudoEutanasia" codigoEstudo={allData.protocolo?.codigoEstudo} />
                <PaginaConteudoSimples numero="10" titulo="MEDICAÇÃO CONCOMITANTE" data={allData.eutanasia} fieldName="conteudoConcomitante" codigoEstudo={allData.protocolo?.codigoEstudo} />
                <PaginaConteudoSimples numero="11" titulo="REGISTRO E ARQUIVAMENTO DE DADOS" data={allData.registro} fieldName="conteudoRegistro" codigoEstudo={allData.protocolo?.codigoEstudo} />
                {allData.cronograma && <PaginaCronograma data={allData.cronograma} codigoEstudo={allData.protocolo?.codigoEstudo} />}
                {allData.anexos && <PaginaAnexos data={allData.anexos} codigoEstudo={allData.protocolo?.codigoEstudo} />}
                <PaginaConteudoSimples numero="14" titulo="REFERÊNCIAS BIBLIOGRÁFICAS" data={allData.bibliografia} fieldName="conteudoBibliografia" codigoEstudo={allData.protocolo?.codigoEstudo} />
             </div>
        </div>
    );
};

const App = () => (
    <Routes>
        <Route path="*" element={<VisualizacaoCompletaPDF />} />
    </Routes>
);


export default App;