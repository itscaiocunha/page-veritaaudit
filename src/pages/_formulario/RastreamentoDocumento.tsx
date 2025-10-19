import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function RastreamentoDocumentos() {
    // Página 1: Informações do Estudo
    const [codigoEstudo, setCodigoEstudo] = useState("");
    const [patrocinador, setPatrocinador] = useState("");
    const [cnpj, setCnpj] = useState("");
    const [responsavel, setResponsavel] = useState("");
    const [monitora, setMonitora] = useState("");
    const [telefone, setTelefone] = useState("");
    const [email, setEmail] = useState("");
    const [pesquisador, setPesquisador] = useState("");

    // Página 1: Tipo de Estudo
    const [tiposEstudo, setTiposEstudo] = useState({
        deplecaoTecido: false,
        deplecaoLeite: false,
        biodisponibilidade: false,
        seguranca: false,
        eficacia: false,
        outros: "",
    });

    // Página 1: Informações dos Documentos
    const initialDocumentosState = {
        protocolo: { digital: false, fisico: false },
        notaEstudo: { digital: false, fisico: false },
        desvioEstudo: { digital: false, fisico: false },
        emenda: { digital: false, fisico: false },
        termoConsentimento: { digital: false, fisico: false },
        certificadoCEUA: { digital: false, fisico: false },
        notaEsclarecimentoCEUA: { digital: false, fisico: false },
        relatorioParcial: { digital: false, fisico: false },
        relatorioFinal: { digital: false, fisico: false },
        formularios: { digital: false, fisico: false, descricao: "" },
        anexos: { digital: false, fisico: false, descricao: "" },
        outros: { digital: false, fisico: false, descricao: "" },
    };
    const [documentos, setDocumentos] = useState(initialDocumentosState);


    // Página 2: Envio Digital
    const [envioDigital, setEnvioDigital] = useState({
        googleDrive: false,
        weTransfer: false,
        outrosPlataforma: "",
        observacoes: "",
        responsavelConferencia: "",
        dataConferencia: "",
        responsavelEnvio: "",
        dataEnvio: "",
    });

    // Página 2: Envio Físico
    const [envioFisico, setEnvioFisico] = useState({
        rodoviario: false,
        aereo: false,
        outrosTransporte: "",
        observacoes: "",
        responsavelConferencia: "",
        dataConferencia: "",
        responsavelEnvio: "",
        dataSaida: "",
    });

    // Página 2: Recebimento
    const [recebimento, setRecebimento] = useState({
        patrocinador: "",
        responsavel: "",
        data: "",
        conforme: false,
        naoConforme: "",
        pessoaContato: "",
        telefone: "",
        email: "",
    });

    // Função genérica para lidar com a mudança de checkboxes
    const handleCheckboxChange = (setFn: Function, state: any, key: string, subkey: string | null = null) => (checked: boolean) => {
        setFn({
            ...state,
            [key]: subkey ? { ...state[key], [subkey]: !!checked } : !!checked,
        });
    };

    // --- FUNÇÃO DE EXPORTAÇÃO EXATA ---
    const handleExportarPDF = () => {
        const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 15;
        const innerWidth = pageWidth - margin * 2;

        const drawHeader = (pageNumber: number, totalPages: number) => {
            doc.rect(margin, 10, innerWidth, 16);
            doc.rect(margin, 10, 50, 16);
            doc.rect(pageWidth - margin - 40, 10, 40, 16);

            doc.setFont("helvetica", "bold");
            doc.setFontSize(10);
            doc.text("LOGO", margin + 25, 18, { align: 'center' });
            
            doc.setFontSize(12);
            doc.text("30.0 – FORMULÁRIO RASTREAMENTO DE ENVIO E", pageWidth / 2, 16, { align: 'center' });
            doc.text("RECEBIMENTO DE DOCUMENTOS", pageWidth / 2, 22, { align: 'center' });
            
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            doc.text(`Página ${pageNumber} de ${totalPages}`, pageWidth - margin - 20, 18, { align: 'center' });
            
            doc.rect(margin, 26, innerWidth, 8);
            doc.text("Área: Estudos clínicos", margin + 2, 31);
            doc.text("N° DOC.: FOR-EC-30", pageWidth / 2, 31, { align: 'center' });
            doc.text("Versão: 0", pageWidth - margin - 15, 31, { align: 'center' });
        };

        // CORREÇÃO APLICADA AQUI
        const box = (checked: boolean) => (checked ? "[X]" : "[ ]");

        // --- PÁGINA 1 ---
        drawHeader(1, 2);

        // Seção: INFORMAÇÕES DO ESTUDO
        autoTable(doc, {
            startY: 36,
            theme: 'grid',
            head: [['INFORMAÇÕES DO ESTUDO']],
            headStyles: { fillColor: [255, 255, 255], textColor: 0, halign: 'center', fontStyle: 'bold', lineWidth: 0.3, lineColor: 0 },
            body: [
                [`Código do Estudo: ${codigoEstudo}`],
                [`Patrocinador do estudo: ${patrocinador}`],
                [`CNPJ do Patrocinador: ${cnpj}`],
                [`Responsável pela empresa Patrocinadora: ${responsavel}`],
                [`Monitor(a): ${monitora}`],
                [`Telefone: ${telefone}`],
                [`E-mail: ${email}`],
                [`Pesquisador Principal (Investigador): ${pesquisador}`]
            ],
            styles: { cellPadding: 2, lineWidth: 0.3, lineColor: 0 }
        });

        // Seção: Tipo de Estudo
        const tiposEstudoBody = [
            [`${box(tiposEstudo.deplecaoTecido)} Depleção de resíduo - Tecido`, `${box(tiposEstudo.biodisponibilidade)} Biodisponibilidade`, `${box(tiposEstudo.eficacia)} Eficácia`],
            [`${box(tiposEstudo.deplecaoLeite)} Depleção de resíduo - Leite`, `${box(tiposEstudo.seguranca)} Segurança`, `Outros: ${tiposEstudo.outros}`]
        ];
        autoTable(doc, {
            startY: (doc as any).lastAutoTable.finalY + 2,
            theme: 'plain',
            body: [[{ content: `Tipo de estudo:`, styles: { fontStyle: 'bold' } }]],
            styles: { cellPadding: { top: 2, bottom: 0 } }
        });
        autoTable(doc, { startY: (doc as any).lastAutoTable.finalY, body: tiposEstudoBody, theme: 'grid', styles: { lineWidth: 0.3, lineColor: 0 } });
        
        // Seção: INFORMAÇÕES DOS DOCUMENTOS
        const docBody = Object.entries(documentos).map(([key, value]) => {
            const labelMap: { [key: string]: string } = {
                protocolo: "Protocolo de estudo assinado", notaEstudo: "Nota ao Estudo", desvioEstudo: "Desvio ao Estudo", emenda: "Emenda",
                termoConsentimento: "Termo de consentimento", certificadoCEUA: "Certificado de autorização - CEUA", notaEsclarecimentoCEUA: "Nota de esclarecimento - CEUA",
                relatorioParcial: "Relatório Parcial", relatorioFinal: "Relatório Final", formularios: "Formulários", anexos: "Anexos", outros: "Outros"
            };
            const label = labelMap[key] || key;
            const fullLabel = value.descricao ? `${label}\n${value.descricao}` : label;
            return [fullLabel, `${box(value.digital)} Digital`, `${box(value.fisico)} Físico`];
        });

        autoTable(doc, {
            startY: (doc as any).lastAutoTable.finalY + 2,
            head: [['INFORMAÇÕES DOS DOCUMENTOS', 'Formato', '']],
            headStyles: { fillColor: [255, 255, 255], textColor: 0, halign: 'center', fontStyle: 'bold', lineWidth: 0.3, lineColor: 0 },
            body: docBody,
            columnStyles: { 0: { cellWidth: 100 }, 1: { cellWidth: 35 }, 2: { cellWidth: 35 } },
            didParseCell: (data) => {
                if (data.section === 'head' && data.column.index === 1) { data.cell.colSpan = 2; }
            },
            theme: 'grid',
            styles: { lineWidth: 0.3, lineColor: 0 }
        });


        // --- PÁGINA 2 ---
        doc.addPage();
        drawHeader(2, 2);
        let y = 40;

        const drawSection = (title: string, content: () => void) => {
            doc.setDrawColor(0);
            doc.setLineWidth(0.3);
            doc.rect(margin, y, innerWidth, 8); // Desenha a borda do cabeçalho da seção
            doc.setFont('helvetica', 'bold');
            doc.text(title, pageWidth / 2, y + 5.5, { align: 'center' });
            y += 8;
            doc.setFont('helvetica', 'normal');
            content();
        };

        drawSection("ENVIO DA DOCUMENTAÇÃO DIGITAL", () => {
            const contentHeight = 50;
            doc.rect(margin, y, innerWidth, contentHeight);
            doc.text(`Plataforma: ${box(envioDigital.googleDrive)} Google Drive   ${box(envioDigital.weTransfer)} WeTransfer   ${box(!!envioDigital.outrosPlataforma)} Outros, ${envioDigital.outrosPlataforma}`, margin + 5, y + 8);
            doc.line(margin, y + 12, pageWidth - margin, y + 12);
            doc.text(`Observações: ${envioDigital.observacoes}`, margin + 5, y + 18);
            doc.line(margin, y + 28, pageWidth - margin, y + 28);
            doc.text(`Responsável pela conferência: ${envioDigital.responsavelConferencia}`, margin + 5, y + 34);
            doc.text(`Data: ${envioDigital.dataConferencia}`, margin + 120, y + 34);
            doc.line(margin, y + 42, pageWidth - margin, y + 42);
            doc.text(`Responsável pelo envio: ${envioDigital.responsavelEnvio}`, margin + 5, y + 48);
            doc.text(`Data de envio: ${envioDigital.dataEnvio}`, margin + 120, y + 48);
            y += contentHeight + 2;
        });

        drawSection("ENVIO DA DOCUMENTAÇÃO FÍSICA", () => {
            const contentHeight = 50;
            doc.rect(margin, y, innerWidth, contentHeight);
            doc.text(`Transporte: ${box(envioFisico.rodoviario)} Rodoviário   ${box(envioFisico.aereo)} Aéreo   ${box(!!envioFisico.outrosTransporte)} Outros, ${envioFisico.outrosTransporte}`, margin + 5, y + 8);
            doc.line(margin, y + 12, pageWidth - margin, y + 12);
            doc.text(`Observações: ${envioFisico.observacoes}`, margin + 5, y + 18);
            doc.line(margin, y + 28, pageWidth - margin, y + 28);
            doc.text(`Responsável pela conferência: ${envioFisico.responsavelConferencia}`, margin + 5, y + 34);
            doc.text(`Data: ${envioFisico.dataConferencia}`, margin + 120, y + 34);
            doc.line(margin, y + 42, pageWidth - margin, y + 42);
            doc.text(`Responsável pelo transporte: ${envioFisico.responsavelEnvio}`, margin + 5, y + 48);
            doc.text(`Data de saída: ${envioFisico.dataSaida}`, margin + 120, y + 48);
            y += contentHeight + 2;
        });

        drawSection("RECEBIMENTO DOS DOCUMENTAÇÕES", () => {
            const contentHeight = 40;
            doc.rect(margin, y, innerWidth, contentHeight);
            doc.text(`Patrocinador: ${recebimento.patrocinador}`, margin + 5, y + 8);
            doc.line(margin, y + 12, pageWidth - margin, y + 12);
            doc.text(`Responsável pelo recebimento: ${recebimento.responsavel}`, margin + 5, y + 18);
            doc.text(`Data: ${recebimento.data}`, margin + 140, y + 18);
            doc.line(margin, y + 22, pageWidth - margin, y + 22);
            doc.text(`Condições de Recebimento: ${box(recebimento.conforme)} Conforme   ${box(!!recebimento.naoConforme)} Não conforme, ${recebimento.naoConforme}`, margin + 5, y + 28);
            doc.line(margin, y + 32, pageWidth - margin, y + 32);
            doc.text(`Pessoa p/ contato: ${recebimento.pessoaContato}   Telefone: ${recebimento.telefone}   E-mail: ${recebimento.email}`, margin + 5, y + 38);
        });

        doc.save("FOR-EC-30.0-Rastreamento.pdf");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="w-full max-w-6xl bg-white rounded-2xl shadow-lg p-8 space-y-6">
                <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">30.0 – Rastreamento de Envio e Recebimento de Documentos</h1>

                <div className="border rounded-lg p-6 bg-gray-50">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">INFORMAÇÕES DO ESTUDO</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div><Label>Código do Estudo</Label><Input value={codigoEstudo} onChange={(e) => setCodigoEstudo(e.target.value)} /></div>
                        <div><Label>Patrocinador do estudo</Label><Input value={patrocinador} onChange={(e) => setPatrocinador(e.target.value)} /></div>
                        <div><Label>CNPJ do Patrocinador</Label><Input value={cnpj} onChange={(e) => setCnpj(e.target.value)} /></div>
                        <div><Label>Responsável pela empresa Patrocinadora</Label><Input value={responsavel} onChange={(e) => setResponsavel(e.target.value)} /></div>
                        <div><Label>Monitor(a)</Label><Input value={monitora} onChange={(e) => setMonitora(e.target.value)} /></div>
                        <div><Label>Telefone</Label><Input value={telefone} onChange={(e) => setTelefone(e.target.value)} /></div>
                        <div><Label>E-mail</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
                        <div><Label>Pesquisador Principal (Investigador)</Label><Input value={pesquisador} onChange={(e) => setPesquisador(e.target.value)} /></div>
                    </div>
                </div>

                <div className="border rounded-lg p-6 bg-gray-50">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">Tipo de estudo</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {Object.keys(tiposEstudo).filter(k => k !== 'outros').map(key => (
                            <div className="flex items-center space-x-2" key={key}>
                                <Checkbox id={key} checked={tiposEstudo[key as keyof typeof tiposEstudo]} onCheckedChange={handleCheckboxChange(setTiposEstudo, tiposEstudo, key)} />
                                <Label htmlFor={key} className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</Label>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4"><Label>Outros</Label><Input value={tiposEstudo.outros} onChange={(e) => setTiposEstudo({ ...tiposEstudo, outros: e.target.value })} /></div>
                </div>

                <div className="border rounded-lg p-6 bg-gray-50">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">INFORMAÇÕES DOS DOCUMENTOS</h2>
                    <div className="space-y-4">
                        {Object.keys(documentos).map(keyStr => {
                            const key = keyStr as keyof typeof documentos;
                            return (
                                <div key={key} className="p-3 border-b">
                                    <Label className="capitalize font-medium">{key.replace(/([A-Z])/g, ' $1')}</Label>
                                    <div className="flex items-center space-x-6 mt-2">
                                        <div className="flex items-center space-x-2"><Checkbox id={`${key}Digital`} checked={documentos[key].digital} onCheckedChange={handleCheckboxChange(setDocumentos, documentos, key, 'digital')} /><Label htmlFor={`${key}Digital`}>Digital</Label></div>
                                        <div className="flex items-center space-x-2"><Checkbox id={`${key}Fisico`} checked={documentos[key].fisico} onCheckedChange={handleCheckboxChange(setDocumentos, documentos, key, 'fisico')} /><Label htmlFor={`${key}Fisico`}>Físico</Label></div>
                                    </div>
                                    {(key === 'formularios' || key === 'anexos' || key === 'outros') && (
                                        <div className="mt-2"><Input placeholder="Descrição..." value={documentos[key].descricao} onChange={(e) => setDocumentos({ ...documentos, [key]: { ...documentos[key], descricao: e.target.value } })}/></div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="border rounded-lg p-6 bg-gray-50">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">ENVIO DA DOCUMENTAÇÃO DIGITAL</h2>
                    <div className="space-y-4">
                        <div>
                            <Label>Plataforma</Label>
                            <div className="flex items-center space-x-4 mt-2">
                                <div className="flex items-center space-x-2"><Checkbox id="googleDrive" checked={envioDigital.googleDrive} onCheckedChange={handleCheckboxChange(setEnvioDigital, envioDigital, 'googleDrive')} /><Label htmlFor="googleDrive">Google Drive</Label></div>
                                <div className="flex items-center space-x-2"><Checkbox id="weTransfer" checked={envioDigital.weTransfer} onCheckedChange={handleCheckboxChange(setEnvioDigital, envioDigital, 'weTransfer')} /><Label htmlFor="weTransfer">WeTransfer</Label></div>
                                <div className="flex items-center space-x-2"><Label htmlFor="outrosPlataforma">Outros</Label><Input id="outrosPlataforma" className="ml-2" value={envioDigital.outrosPlataforma} onChange={(e) => setEnvioDigital({...envioDigital, outrosPlataforma: e.target.value})} /></div>
                            </div>
                        </div>
                        <div><Label>Observações</Label><Textarea value={envioDigital.observacoes} onChange={(e) => setEnvioDigital({ ...envioDigital, observacoes: e.target.value })} /></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div><Label>Responsável pela conferência</Label><Input value={envioDigital.responsavelConferencia} onChange={(e) => setEnvioDigital({ ...envioDigital, responsavelConferencia: e.target.value })} /></div>
                            <div><Label>Data da conferência</Label><Input type="date" value={envioDigital.dataConferencia} onChange={(e) => setEnvioDigital({ ...envioDigital, dataConferencia: e.target.value })} /></div>
                            <div><Label>Responsável pelo envio</Label><Input value={envioDigital.responsavelEnvio} onChange={(e) => setEnvioDigital({ ...envioDigital, responsavelEnvio: e.target.value })} /></div>
                            <div><Label>Data de envio</Label><Input type="date" value={envioDigital.dataEnvio} onChange={(e) => setEnvioDigital({ ...envioDigital, dataEnvio: e.target.value })} /></div>
                        </div>
                    </div>
                </div>

                <div className="border rounded-lg p-6 bg-gray-50">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">ENVIO DA DOCUMENTAÇÃO FÍSICA</h2>
                     <div className="space-y-4">
                        <div>
                            <Label>Transporte</Label>
                            <div className="flex items-center space-x-4 mt-2">
                                <div className="flex items-center space-x-2"><Checkbox id="rodoviario" checked={envioFisico.rodoviario} onCheckedChange={handleCheckboxChange(setEnvioFisico, envioFisico, 'rodoviario')} /><Label htmlFor="rodoviario">Rodoviário</Label></div>
                                <div className="flex items-center space-x-2"><Checkbox id="aereo" checked={envioFisico.aereo} onCheckedChange={handleCheckboxChange(setEnvioFisico, envioFisico, 'aereo')} /><Label htmlFor="aereo">Aéreo</Label></div>
                                <div className="flex items-center space-x-2"><Label htmlFor="outrosTransporte">Outros</Label><Input id="outrosTransporte" className="ml-2" value={envioFisico.outrosTransporte} onChange={(e) => setEnvioFisico({...envioFisico, outrosTransporte: e.target.value})} /></div>
                            </div>
                        </div>
                        <div><Label>Observações</Label><Textarea value={envioFisico.observacoes} onChange={(e) => setEnvioFisico({ ...envioFisico, observacoes: e.target.value })} /></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div><Label>Responsável pela conferência</Label><Input value={envioFisico.responsavelConferencia} onChange={(e) => setEnvioFisico({ ...envioFisico, responsavelConferencia: e.target.value })} /></div>
                            <div><Label>Data da conferência</Label><Input type="date" value={envioFisico.dataConferencia} onChange={(e) => setEnvioFisico({ ...envioFisico, dataConferencia: e.target.value })} /></div>
                            <div><Label>Responsável pelo transporte</Label><Input value={envioFisico.responsavelEnvio} onChange={(e) => setEnvioFisico({ ...envioFisico, responsavelEnvio: e.target.value })} /></div>
                            <div><Label>Data de saída</Label><Input type="date" value={envioFisico.dataSaida} onChange={(e) => setEnvioFisico({ ...envioFisico, dataSaida: e.target.value })} /></div>
                        </div>
                    </div>
                </div>

                 <div className="border rounded-lg p-6 bg-gray-50">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">RECEBIMENTO DOS DOCUMENTAÇÕES</h2>
                     <div className="space-y-4">
                        <div><Label>Patrocinador</Label><Input value={recebimento.patrocinador} onChange={(e) => setRecebimento({...recebimento, patrocinador: e.target.value})} /></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div><Label>Responsável pelo recebimento</Label><Input value={recebimento.responsavel} onChange={(e) => setRecebimento({ ...recebimento, responsavel: e.target.value })} /></div>
                            <div><Label>Data do recebimento</Label><Input type="date" value={recebimento.data} onChange={(e) => setRecebimento({ ...recebimento, data: e.target.value })} /></div>
                        </div>
                        <div>
                            <Label>Condições de Recebimento</Label>
                            <div className="flex items-center space-x-4 mt-2">
                                <div className="flex items-center space-x-2"><Checkbox id="conforme" checked={recebimento.conforme} onCheckedChange={handleCheckboxChange(setRecebimento, recebimento, 'conforme')} /><Label htmlFor="conforme">Conforme</Label></div>
                                <div className="flex items-center space-x-2"><Label htmlFor="naoConforme">Não conforme</Label><Input id="naoConforme" className="ml-2" value={recebimento.naoConforme} onChange={(e) => setRecebimento({...recebimento, naoConforme: e.target.value})} /></div>
                            </div>
                        </div>
                        <div><Label>Pessoa para contato</Label><Input value={recebimento.pessoaContato} onChange={(e) => setRecebimento({...recebimento, pessoaContato: e.target.value})} /></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div><Label>Telefone</Label><Input value={recebimento.telefone} onChange={(e) => setRecebimento({...recebimento, telefone: e.target.value})} /></div>
                           <div><Label>E-mail</Label><Input type="email" value={recebimento.email} onChange={(e) => setRecebimento({...recebimento, email: e.target.value})} /></div>
                        </div>
                    </div>
                </div>

                <Button onClick={handleExportarPDF} className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 text-lg">
                    Exportar PDF
                </Button>
            </div>
        </div>
    );
}