import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Home } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

// --- HELPERS ---

const formatAddress = (addr: any) => {
    if (!addr) return 'Endereço não informado';
    return `${addr.logradouro}, ${addr.numero}${addr.complemento ? ` - ${addr.complemento}` : ''} - ${addr.bairro}, ${addr.cidade}/${addr.uf} - CEP: ${addr.cep}`;
};

const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
};

// Componente de Texto Padrão ABNT
const AbntText = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <div className={`text-[12pt] leading-[1.5] text-justify font-serif text-black ${className}`}>
        {children}
    </div>
);

// --- WRAPPERS (LAYOUT ANTIGO + ABNT) ---

const PageWrapper = ({ children, innerRef, codigoEstudo }: { children: React.ReactNode, innerRef?: React.Ref<HTMLDivElement>, codigoEstudo?: string }) => (
    <div 
        ref={innerRef}
        className="page-wrapper-pdf bg-white shadow-lg font-serif" 
        style={{ 
            width: '210mm', 
            minHeight: '297mm',
            height: 'auto',
            position: 'relative', 
            display: 'flex', 
            flexDirection: 'column',
            pageBreakAfter: 'always',
            // ABNT: Sup/Esq 3cm, Inf/Dir 2cm
            padding: '3cm 2cm 2cm 3cm', 
            boxSizing: 'border-box'
        }}
    >
        {/* HEADER DO LAYOUT ORIGINAL */}
        <header className="flex justify-between items-start text-sm mb-10">
            <div className="w-48 h-24 flex items-center justify-center text-center p-1 font-bold text-gray-700 border border-black text-xs uppercase">
                LOGO DA CRO/UNIVERSIDADE
            </div>
            <div className="text-center mt-4">
                <p className="font-semibold text-lg">Protocolo</p>
                <p className="text-sm font-bold">{codigoEstudo || 'CÓDIGO'}</p>
            </div>
            <div className="w-48 h-24 flex items-center justify-center text-center p-1 font-bold text-gray-700 border border-black text-xs uppercase">
                LOGO DO PATROCINADOR
            </div>
        </header>

        <main className="flex-grow flex flex-col text-justify">
            {children}
        </main>

        {/* FOOTER DO LAYOUT ORIGINAL */}
        <footer className="text-[10pt] mt-auto pt-8 text-justify">
            <p>Este documento contém informações confidenciais do Patrocinador. Seu uso é restrito às atividades do estudo clínico veterinário, sendo proibida a reprodução, divulgação ou utilização para outros fins, salvo quando exigido por lei. Qualquer suspeita ou quebra de confidencialidade deve ser comunicada imediatamente ao Patrocinador.</p>
        </footer>
    </div>
);

const SectionTitle = ({ number, title }: { number: string, title: string }) => (
    <h2 className="text-[12pt] font-bold mb-6 uppercase text-black">{`${number} ${title}`}</h2>
);

const SubSectionTitle = ({ title }: { title: string }) => (
    <h3 className="text-[12pt] font-bold mb-2 text-black">{title}</h3>
);

// --- COMPONENTES DE PÁGINA ---

const Capa = ({ data, codigoEstudo, versaoData }: { data: any, codigoEstudo: string, versaoData: string }) => (
    <PageWrapper codigoEstudo={codigoEstudo}>
        <div className="text-center flex-grow flex flex-col justify-center items-center">
            <h1 className="text-[14pt] font-bold my-4 uppercase">Protocolo de Estudo</h1>
            {/* Linha grossa do layout original */}
            <div className="border-b-2 border-black mt-6 w-full text-center py-2 mb-12">
                <span className="text-black font-bold text-[16pt] uppercase">{data?.nome || 'Título do Estudo'}</span>
            </div>
        </div>
        
        {/* Lista estilo formulário do layout original */}
        <div className="text-[12pt] space-y-4 w-full">
            <div className="flex items-end">
                <p className="font-bold w-64 shrink-0 uppercase">ESTUDO CLÍNICO</p>
                <div className="border-b border-black flex-grow"><span className="pl-2">{data?.tipoEstudo || ''}</span></div>
            </div>
            <div className="flex items-end">
                <p className="font-bold w-64 shrink-0 uppercase">PATROCINADOR</p>
                <div className="border-b border-black flex-grow"><span className="pl-2">{data?.patrocinador?.nome || ''}</span></div>
            </div>
            <div className="flex items-end">
                <p className="font-bold w-64 shrink-0 uppercase">ESPÉCIE ALVO</p>
                <div className="border-b border-black flex-grow"><span className="pl-2">{data?.especieAnimal || 'Não informado'}</span></div>
            </div>
            <div className="flex items-end">
                <p className="font-bold w-64 shrink-0 uppercase">CLASSE TERAPÊUTICA</p>
                <div className="border-b border-black flex-grow"><span className="pl-2">{data?.classeTerapeutica || 'Não informado'}</span></div>
            </div>
            <div className="flex items-end">
                <p className="font-bold w-64 shrink-0 uppercase">CÓDIGO DO ESTUDO</p>
                <div className="border-b border-black flex-grow"><span className="pl-2">{codigoEstudo}</span></div>
            </div>
            <div className="flex items-end">
                <p className="font-bold w-64 shrink-0 uppercase">VERSÃO E DATA</p>
                <div className="border-b border-black flex-grow"><span className="pl-2">{versaoData}</span></div>
            </div>
        </div>
        <div className="mb-20"></div> {/* Espaço extra antes do footer na capa */}
    </PageWrapper>
);

const PaginaAssinaturas = ({ data, codigoEstudo }: { data: any, codigoEstudo?: string }) => (
    <PageWrapper codigoEstudo={codigoEstudo}>
        <h2 className="text-[14pt] font-bold text-center mb-8 uppercase">PÁGINA DE ASSINATURAS</h2>
        <AbntText className="mb-16">
            Li este protocolo e concordo que ele seja conduzido em conformidade com o estipulado, seguindo as normas de Boas Práticas Clínicas.
        </AbntText>
        
        <div className="space-y-24 mt-10">
            {data?.representante && (
                <div className="flex flex-col items-center">
                    <div className="border-b border-black w-3/4"></div>
                    <p className="text-center mt-2 text-[12pt] font-bold uppercase">{data.representante.nome}</p>
                    <p className="text-center text-[10pt]">Representante do Patrocinador</p>
                    <p className="text-center text-[10pt] font-bold">{data.patrocinador?.nome}</p>
                    <p className="text-center text-[10pt] text-gray-500">{formatDate(new Date().toISOString())}</p>
                </div>
            )}
            
            {data?.investigador && (
                <div className="flex flex-col items-center">
                    <div className="border-b border-black w-3/4"></div>
                    <p className="text-center mt-2 text-[12pt] font-bold uppercase">{data.investigador.nome}</p>
                    <p className="text-center text-[10pt]">Investigador Principal</p>
                    <p className="text-center text-[10pt] font-bold">{data.instituicao?.nome}</p>
                    <p className="text-center text-[10pt] text-gray-500">{formatDate(new Date().toISOString())}</p>
                </div>
            )}
        </div>
    </PageWrapper>
);

const RenderPessoa = ({ p, title, role }: { p: any, title?: string, role?: string }) => {
    if (!p) return null;
    return (
        <div className="mb-4 break-inside-avoid">
            {title && <h4 className="font-bold text-[12pt] mb-1">{title}</h4>}
            <div className="pl-4 text-[12pt] leading-snug">
                <p><strong>Nome:</strong> {p.nome}</p>
                {role && <p><strong>Função:</strong> {role}</p>}
                <p><strong>Formação:</strong> {p.formacao}</p>
                {(p.registro || p.numeroRegistro) && <p><strong>Registro:</strong> {p.registro || p.numeroRegistro}</p>}
                {p.email && <p><strong>E-mail:</strong> {p.email}</p>}
                {p.telefone && <p><strong>Telefone:</strong> {p.telefone}</p>}
                {p.endereco && <p><strong>Endereço:</strong> {formatAddress(p.endereco)}</p>}
            </div>
        </div>
    );
};

const PaginaInformacoesGerais = ({ data, codigoEstudo }: { data: any, codigoEstudo?: string }) => (
    <PageWrapper codigoEstudo={codigoEstudo}>
        <SectionTitle number="1." title="INFORMAÇÕES GERAIS" />
        
        <div className="space-y-6">
            <section>
                <SubSectionTitle title="1.1 Patrocinador" />
                <div className="pl-4 mb-4 text-[12pt] leading-snug">
                    <p><strong>Nome:</strong> {data.patrocinador?.nome}</p>
                    <p><strong>Endereço:</strong> {formatAddress(data.patrocinador?.endereco)}</p>
                    <p><strong>Telefone:</strong> {data.patrocinador?.telefone}</p>
                </div>
                <RenderPessoa p={data.representante} title="1.1.1 Representante do Patrocinador" />
                
                {data.monitores?.length > 0 && (
                    <div className="mt-4">
                        <SubSectionTitle title="1.1.2 Monitor(es) do Estudo" />
                        {data.monitores.map((m: any, i: number) => <RenderPessoa key={i} p={m} />)}
                    </div>
                )}
                 {data.tecnicosPatrocinador?.length > 0 && (
                    <div className="mt-4">
                        <SubSectionTitle title="1.1.3 Equipe Técnica do Patrocinador" />
                        {data.tecnicosPatrocinador.map((m: any, i: number) => <RenderPessoa key={i} p={m} />)}
                    </div>
                )}
            </section>

            <section>
                <SubSectionTitle title="1.2 Instituição Responsável" />
                <div className="pl-4 mb-4 text-[12pt] leading-snug">
                    <p><strong>Nome:</strong> {data.instituicao?.nome}</p>
                    <p><strong>Endereço:</strong> {formatAddress(data.instituicao?.endereco)}</p>
                    <p><strong>Telefone:</strong> {data.instituicao?.telefone}</p>
                </div>
                <RenderPessoa p={data.investigador} title="1.2.1 Investigador Principal" />
                
                {data.tecnicosInstituicao?.length > 0 && (
                    <div className="mt-4">
                        <SubSectionTitle title="1.2.2 Equipe Técnica da Instituição" />
                        {data.tecnicosInstituicao.map((m: any, i: number) => <RenderPessoa key={i} p={m} />)}
                    </div>
                )}
            </section>

            {data.etapaClinica?.length > 0 && (
                <section>
                    <SubSectionTitle title="1.3 Locais da Etapa Clínica" />
                    {data.etapaClinica.map((l: any, i: number) => (
                        <div key={i} className="pl-4 mb-2 text-[12pt] leading-snug">
                             <p><strong>{l.nome}</strong> (Resp: {l.responsavel})</p>
                             <p>{formatAddress(l.endereco)}</p>
                        </div>
                    ))}
                </section>
            )}
        </div>
    </PageWrapper>
);

const PaginaConteudoSimples = ({ numero, titulo, conteudo, codigoEstudo }: { numero: string, titulo: string, conteudo: any, codigoEstudo: string }) => {
    const texto = typeof conteudo === 'object' && conteudo !== null ? conteudo.conteudo : conteudo;
    return (
        <PageWrapper codigoEstudo={codigoEstudo}>
            <SectionTitle number={`${numero}.`} title={titulo} />
            <AbntText>{texto || 'Conteúdo não informado.'}</AbntText>
        </PageWrapper>
    );
};

const PaginaMateriaisMetodos = ({ data, codigoEstudo }: { data: any, codigoEstudo: string }) => {
    if (!data) return <PageWrapper codigoEstudo={codigoEstudo}><SectionTitle number="5." title="MATERIAIS E MÉTODOS" /><AbntText>Não informado.</AbntText></PageWrapper>;

    return (
        <PageWrapper codigoEstudo={codigoEstudo}>
            <SectionTitle number="5." title="MATERIAIS E MÉTODOS" />

            <SubSectionTitle title="5.1 Animais Experimentais" />
            <AbntText>{data.animal?.origemDestino}</AbntText>
            <AbntText>{data.animal?.quantidade}</AbntText>

            {data.animal?.caracteristicas?.length > 0 && (
                <div className="my-6">
                    <p className="text-[10pt] font-bold mb-1 text-center">Tabela 1: Características dos Animais</p>
                    <table className="w-full text-[10pt] border-collapse border border-black">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-black p-1">Espécie</th>
                                <th className="border border-black p-1">Raça</th>
                                <th className="border border-black p-1">Sexo</th>
                                <th className="border border-black p-1">Idade</th>
                                <th className="border border-black p-1">Peso</th>
                                <th className="border border-black p-1">ID</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.animal.caracteristicas.map((c: any, i: number) => (
                                <tr key={i}>
                                    <td className="border border-black p-1 text-center">{c.especie}</td>
                                    <td className="border border-black p-1 text-center">{c.raca}</td>
                                    <td className="border border-black p-1 text-center">{c.sexo}</td>
                                    <td className="border border-black p-1 text-center">{c.idade}</td>
                                    <td className="border border-black p-1 text-center">{c.peso}</td>
                                    <td className="border border-black p-1 text-center">{c.identificacao}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <SubSectionTitle title="5.2 Manejo e Alojamento" />
            <AbntText><strong>Instalações:</strong> {data.manejoAlojamento?.instalacaoManejo}</AbntText>
            <AbntText><strong>Alimentação/Água:</strong> {data.manejoAlojamento?.alimentacaoAgua}</AbntText>

            <SubSectionTitle title="5.3 Critérios de Seleção" />
            <AbntText><strong>Inclusão:</strong> {data.criterios?.inclusao}</AbntText>
            <AbntText><strong>Exclusão:</strong> {data.criterios?.exclusao}</AbntText>
            <AbntText><strong>Remoção/Retirada:</strong> {data.criterios?.remocao}</AbntText>
        </PageWrapper>
    );
};

const PaginaMateriaisMetodosPt2 = ({ data, codigoEstudo }: { data: any, codigoEstudo: string }) => {
    if (!data) return null;
    return (
        <PageWrapper codigoEstudo={codigoEstudo}>
            <SubSectionTitle title="5.4 Delineamento Experimental" />
            <AbntText><strong>Aclimatação:</strong> {data.aclimatacao}</AbntText>
            <AbntText><strong>Seleção/Randomização:</strong> {data.selecao} {data.randomizacao}</AbntText>
            <AbntText><strong>Cegamento:</strong> {data.cegamento}</AbntText>

            <SubSectionTitle title="5.5 Tratamento" />
            <AbntText>{data.tratamento}</AbntText>
            
            {data.produtoVeterinario && (
                <div className="border border-black p-4 my-4 text-[11pt]">
                    <h4 className="font-bold text-center mb-4 uppercase bg-gray-100 border-b border-gray-300 pb-1">Produto Investigacional</h4>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                        <p><strong>Princípio Ativo:</strong> {data.produtoVeterinario.principioAtivo}</p>
                        <p><strong>Concentração:</strong> {data.produtoVeterinario.concentracao}</p>
                        <p><strong>Lote:</strong> {data.produtoVeterinario.partidaLote}</p>
                        <p><strong>Validade:</strong> {formatDate(data.produtoVeterinario.dataValidade)}</p>
                        <p><strong>Fabricante:</strong> {data.produtoVeterinario.fabricante}</p>
                        <p><strong>Dosagem:</strong> {data.produtoVeterinario.dosagemIndicada}</p>
                        <div className="col-span-2"><p><strong>Apresentação:</strong> {data.produtoVeterinario.apresentacoes}</p></div>
                    </div>
                </div>
            )}

            <SubSectionTitle title="5.6 Avaliações" />
            <AbntText><strong>Exames Físicos:</strong> {data.avaliacaoClinica?.exameFisico}</AbntText>
            <AbntText><strong>Laboratorial:</strong> {data.avaliacaoClinica?.exameLaboratorial}</AbntText>
            <AbntText><strong>Parâmetros:</strong> {data.parametrosAvaliacao}</AbntText>
        </PageWrapper>
    )
}

const PaginaCronograma = ({ data, codigoEstudo }: { data: any, codigoEstudo: string }) => {
    if (!data) return <PageWrapper codigoEstudo={codigoEstudo}><SectionTitle number="12." title="CRONOGRAMA" /><AbntText>Não informado.</AbntText></PageWrapper>;
    return (
        <PageWrapper codigoEstudo={codigoEstudo}>
             <SectionTitle number="12." title="CRONOGRAMA DE ATIVIDADES" />
             <AbntText>A duração estimada do estudo é de {data.duracaoEstudo} dias.</AbntText>
             
             {data.atividade?.length > 0 && (
                 <table className="w-full text-[10pt] border-collapse border border-black mt-4">
                     <thead>
                         <tr className="bg-gray-100">
                             <th className="border border-black p-2 w-16">Dia</th>
                             <th className="border border-black p-2 w-24">Data</th>
                             <th className="border border-black p-2">Atividade</th>
                             <th className="border border-black p-2 w-24">Formulário</th>
                         </tr>
                     </thead>
                     <tbody>
                         {data.atividade.map((act: any, i: number) => (
                             <tr key={i}>
                                 <td className="border border-black p-2 text-center font-bold">{act.diaEstudo}</td>
                                 <td className="border border-black p-2 text-center">{formatDate(act.data)}</td>
                                 <td className="border border-black p-2 text-justify">{act.atividade}</td>
                                 <td className="border border-black p-2 text-center">{act.numeroFormulario}</td>
                             </tr>
                         ))}
                     </tbody>
                 </table>
             )}
        </PageWrapper>
    );
};

const PaginaAnexos = ({ data, codigoEstudo }: { data: any, codigoEstudo: string }) => {
    if (!data || data.length === 0) return null;
    return (
        <PageWrapper codigoEstudo={codigoEstudo}>
            <SectionTitle number="13." title="ANEXOS" />
            <ul className="list-disc pl-5 text-[12pt] leading-[1.5]">
                {data.map((anexo: any, i: number) => (
                    <li key={i} className="mb-2">
                        <span className="font-semibold uppercase">Anexo {anexo.identificador}:</span> {anexo.titulo}
                    </li>
                ))}
            </ul>
        </PageWrapper>
    );
};

const PaginaBibliografia = ({ data, codigoEstudo }: { data: any, codigoEstudo: string }) => {
    if (!data || !data.conteudos) return null;
    return (
         <PageWrapper codigoEstudo={codigoEstudo}>
            <SectionTitle number="14." title="REFERÊNCIAS BIBLIOGRÁFICAS" />
            <div className="space-y-4">
                {data.conteudos.map((ref: string, i: number) => (
                     <div key={i} className="text-[12pt] leading-[1.5] text-justify pl-8 -indent-8">
                        {/* Simulação de indentação francesa ABNT */}
                        {ref}
                     </div>
                ))}
            </div>
         </PageWrapper>
    );
};

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
              const errorData = await response.text();
              throw new Error(`Erro ${response.status}: ${errorData}`);
            }
    
            const data = await response.json();
            setProtocoloData(data);
    
          } catch (err) {
            console.error("Erro:", err);
            setError(err instanceof Error ? err.message : "Erro desconhecido.");
          } finally {
            setIsLoading(false);
          }
        };
    
        fetchProtocoloDetalhes();
    }, [protocoloMestreId, navigate]);

    const handleExportPdf = async () => {
        const content = pdfRef.current;
        const windowRef = window as any;
        if (!content || !windowRef.jspdf || !windowRef.html2canvas) return;
        
        const { jsPDF } = windowRef.jspdf;
        const html2canvas = windowRef.html2canvas;
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pages = content.querySelectorAll('.page-wrapper-pdf');
        
        for (let i = 0; i < pages.length; i++) {
            const page = pages[i] as HTMLElement;
            const canvas = await html2canvas(page, { 
                scale: 2, 
                useCORS: true, 
                backgroundColor: '#ffffff'
            });
            const imgData = canvas.toDataURL('image/jpeg', 1.0);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            if (i > 0) pdf.addPage();
            pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
        }
        pdf.save(`Protocolo-${protocoloData?.id}.pdf`);
    };
    
    if (isLoading) return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
    if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
    if (!protocoloData) return <div className="min-h-screen flex items-center justify-center">Dados não encontrados.</div>;

    const codigoEstudo = `MST-${protocoloData.protocoloMestreId}/PRT-${protocoloData.id}`;
    const versaoData = `V.${protocoloData.versao} - ${formatDate(protocoloData.data_criacao)}`;

    return (
        <div className="bg-gray-100 min-h-screen font-sans">
            <div className="p-4 bg-white shadow-md sticky top-0 z-50 flex justify-between items-center print:hidden">
                <Button variant="outline" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
                </Button>
                <h1 className="text-xl font-bold">Visualização do Protocolo</h1>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => navigate('/dashboard')}>
                        <Home className="h-4 w-4 mr-2" /> Home
                    </Button>
                    <Button onClick={handleExportPdf} className="bg-green-600 hover:bg-green-700 text-white" disabled={!scriptsLoaded}>
                        {scriptsLoaded ? <><Download className="h-4 w-4 mr-2" /> Baixar PDF</> : 'Carregando...'}
                    </Button>
                </div>
            </div>

            <div className="py-10 flex justify-center overflow-auto">
                <div ref={pdfRef} className="flex flex-col gap-10">
                    <Capa data={protocoloData} codigoEstudo={codigoEstudo} versaoData={versaoData} />
                    <PaginaAssinaturas data={protocoloData} codigoEstudo={codigoEstudo} />
                    <PaginaInformacoesGerais data={protocoloData} codigoEstudo={codigoEstudo} />
                    <PaginaConteudoSimples numero="2" titulo="INTRODUÇÃO" conteudo={protocoloData.introducao} codigoEstudo={codigoEstudo} />
                    <PaginaConteudoSimples numero="3" titulo="OBJETIVO" conteudo={protocoloData.objetivo} codigoEstudo={codigoEstudo} />
                    <PaginaConteudoSimples numero="4" titulo="JUSTIFICATIVA" conteudo={protocoloData.justificativa} codigoEstudo={codigoEstudo} />
                    <PaginaMateriaisMetodos data={protocoloData.materiaisMetodos} codigoEstudo={codigoEstudo} />
                    <PaginaMateriaisMetodosPt2 data={protocoloData.materiaisMetodos} codigoEstudo={codigoEstudo} />
                    <PaginaConteudoSimples numero="6" titulo="REQUISITOS REGULAMENTARES" conteudo={protocoloData.requisitosRegulamentares} codigoEstudo={codigoEstudo} />
                    <PaginaConteudoSimples numero="7" titulo="ANÁLISE ESTATÍSTICA" conteudo={protocoloData.analiseEstatistica} codigoEstudo={codigoEstudo} />
                    <PaginaConteudoSimples numero="8" titulo="OBSERVAÇÃO GERAL DE SAÚDE" conteudo={protocoloData.observacaoSaude} codigoEstudo={codigoEstudo} />
                    <PaginaConteudoSimples numero="9" titulo="EVENTOS ADVERSOS" conteudo={protocoloData.eventoAdverso} codigoEstudo={codigoEstudo} />
                    <PaginaConteudoSimples numero="10" titulo="EUTANÁSIA" conteudo={protocoloData.eutanasia} codigoEstudo={codigoEstudo} />
                    <PaginaConteudoSimples numero="11" titulo="MEDICAÇÃO CONCOMITANTE" conteudo={protocoloData.medicacao} codigoEstudo={codigoEstudo} />
                    <PaginaCronograma data={protocoloData.cronograma} codigoEstudo={codigoEstudo} />
                    {protocoloData.anexos && <PaginaAnexos data={protocoloData.anexos} codigoEstudo={codigoEstudo} />}
                    <PaginaBibliografia data={protocoloData.bibliografia} codigoEstudo={codigoEstudo} />
                </div>
            </div>
        </div>
    );
};

export default ProjetoPage;