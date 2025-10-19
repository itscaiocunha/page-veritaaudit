import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import jsPDF from "jspdf";

export default function EventoAdverso() {
    // --- Estados para os campos do formulário ---

    // Cabeçalho e identificação
    const [codigoEstudo, setCodigoEstudo] = useState("");
    const [data, setData] = useState("");
    const [animal, setAnimal] = useState("");
    const [grupo, setGrupo] = useState("");

    // Reações no animal
    const [tempoDecorrido, setTempoDecorrido] = useState("");
    const [duracaoEvento, setDuracaoEvento] = useState("");
    const [descricaoEvento, setDescricaoEvento] = useState("");
    const [tratamentoReacao, setTratamentoReacao] = useState("");

    // Causalidade
    const [causalidade, setCausalidade] = useState({
        provavel: false,
        possivel: false,
        naoClassificado: false,
        inacabado: false,
        improvavel: false,
    });

    const [outrasInformacoes, setOutrasInformacoes] = useState("");

    // Reações em pessoas
    const [reacoesPessoas, setReacoesPessoas] = useState({
        contatoAnimal: false,
        ingestaoOral: false,
        exposicaoTopica: false,
        exposicaoOcular: false,
        exposicaoInjecao: false,
        outro: "",
    });
    const [doseRecebida, setDoseRecebida] = useState("");
    const [localExposicao, setLocalExposicao] = useState({
        dedo: false,
        mao: false,
        articulacao: false,
        outro: "",
    });

    // Assinaturas
    const [realizadoPor, setRealizadoPor] = useState("");
    const [dataRealizado, setDataRealizado] = useState("");
    const [registradoPor, setRegistradoPor] = useState("");
    const [dataRegistrado, setDataRegistrado] = useState("");

    const handleCheckboxChange = (setFn: Function, state: any, key: string) => (checked: boolean) => {
        setFn({ ...state, [key]: !!checked });
    };

    const handleExportarPDF = () => {
        const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 15;
        const innerWidth = pageWidth - margin * 2;
        const box = (checked: boolean) => (checked ? "[X]" : "[ ]");

        const drawHeader = (page: number, total: number) => {
            doc.setLineWidth(0.3);
            doc.rect(margin, 10, innerWidth, 16); // Borda externa
            doc.rect(margin, 10, 50, 16); // Caixa LOGO
            doc.rect(pageWidth - margin - 40, 10, 40, 16); // Caixa Página

            doc.setFont("helvetica", "bold");
            doc.setFontSize(10);
            doc.text("LOGO", margin + 25, 18, { align: 'center' });
            
            doc.setFontSize(12);
            doc.text("12.0 - EVENTO ADVERSO", pageWidth / 2, 18, { align: 'center' });
            
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            doc.text(`Página ${page} de ${total}`, pageWidth - margin - 20, 18, { align: 'center' });
            
            doc.rect(margin, 26, innerWidth, 8); // Borda da segunda linha
            doc.text("Área: Estudos clínicos", margin + 2, 31);
            doc.text("N° DOC.: FOR-EC-12", pageWidth / 2, 31, { align: 'center' });
            doc.text("Versão: 0", pageWidth - margin - 15, 31, { align: 'center' });
        };
        
        // --- PÁGINA 1 ---
        drawHeader(1, 2);
        let y = 36;

        // Seção de Identificação
        doc.rect(margin, y, innerWidth, 8);
        doc.setFont("helvetica", "normal").setFontSize(9);
        doc.text(`Código do estudo: ${codigoEstudo}`, margin + 2, y + 5);
        y += 8;

        doc.rect(margin, y, innerWidth, 8);
        doc.text(`Data: ${data}`, margin + 2, y + 5);
        doc.text(`Animal: ${animal}`, margin + 60, y + 5);
        doc.text(`Grupo: ${grupo}`, margin + 120, y + 5);
        y += 10;

        // Seção Reações no Animal
        doc.rect(margin, y, innerWidth, 6);
        doc.setFont("helvetica", "bold").setFontSize(10).text("REAÇÕES NO ANIMAL", pageWidth / 2, y + 4, { align: 'center' });
        y += 6;
        
        const col1Width = innerWidth / 2;
        doc.rect(margin, y, innerWidth, 15);
        doc.rect(margin, y, col1Width, 15);
        doc.setFont("helvetica", "normal").setFontSize(9);
        doc.text("Tempo decorrido entre a administração do produto\ne o suposto evento adverso\n(em minutos, horas ou dias)", margin + 2, y + 4);
        doc.text(tempoDecorrido, margin + 2, y + 14);
        doc.text("Duração do evento adverso\n(em minutos, horas ou dias)", margin + col1Width + 2, y + 4);
        doc.text(duracaoEvento, margin + col1Width + 2, y + 14);
        y += 15;

        // Descrição do evento
        doc.rect(margin, y, innerWidth, 70);
        doc.setFont("helvetica", "bold").setFontSize(9);
        const descTitle = doc.splitTextToSize("DESCRIÇÃO DO EVENTO ADVERSO (Questões de segurança em animais ou humanos / Suspeita de falta de eficácia esperada / Problemas de tempo de retirada / Problemas ambientais)", innerWidth - 4);
        doc.text(descTitle, margin + 2, y + 4);
        doc.line(margin, y + 12, pageWidth - margin, y + 12);
        doc.setFont("helvetica", "normal");
        const descLines = doc.splitTextToSize(`Descreva e inclua TODOS os sinais clínicos: ${descricaoEvento}\n\nIndique também se a reação foi tratada: Como, com o que e qual foi o resultado? ${tratamentoReacao}`, innerWidth - 4);
        doc.text(descLines, margin + 2, y + 16);
        y += 70;
        
        // Causalidade e Outras infos
        doc.rect(margin, y, innerWidth, 80);
        doc.setFont("helvetica", "bold").text("AVALIAÇÃO DE CAUSALIDADE", margin + 2, y + 5);
        doc.setFont("helvetica", "normal");
        doc.text(`${box(causalidade.provavel)} 1. Provável`, margin + 5, y + 12);
        doc.text(`${box(causalidade.possivel)} 2. Possível`, margin + 50, y + 12);
        doc.text(`${box(causalidade.naoClassificado)} 3. Não classificado`, margin + 95, y + 12);
        doc.text(`${box(causalidade.inacabado)} 4. Inacabado`, margin + 5, y + 18);
        doc.text(`${box(causalidade.improvavel)} 5. Improvável`, margin + 50, y + 18);

        doc.line(margin, y + 25, pageWidth - margin, y + 25);
        doc.setFont("helvetica", "bold");
        const outrasInfoTitle = doc.splitTextToSize("OUTRAS INFORMAÇÕES RELEVANTES (anexar a documentação, por exemplo, estudos realizados ou em andamento, laudos médicos veterinários, laudos de necropsia)", innerWidth - 4);
        doc.text(outrasInfoTitle, margin + 2, y + 29);
        doc.setFont("helvetica", "normal");
        const outrasInfoLines = doc.splitTextToSize(outrasInformacoes, innerWidth - 4);
        doc.text(outrasInfoLines, margin + 2, y + 42);
        
        doc.text("Página 1 de 2", pageWidth - margin - 10, 285, { align: "right" });

        // --- PÁGINA 2 ---
        doc.addPage();
        drawHeader(2, 2);
        y = 36;
        
        doc.rect(margin, y, innerWidth, 6);
        doc.setFont("helvetica", "bold").text("REAÇÕES EM PESSOAS (Se o caso se referir a pessoas, preencha as informações abaixo)", pageWidth / 2, y + 4, { align: 'center' });
        y += 6;

        doc.rect(margin, y, innerWidth, 80);
        doc.setFont("helvetica", "normal");
        doc.text(`${box(reacoesPessoas.contatoAnimal)} Contato com o animal tratado`, margin + 5, y + 8);
        doc.text(`${box(reacoesPessoas.ingestaoOral)} Ingestão oral`, margin + 95, y + 8);
        doc.text(`${box(reacoesPessoas.exposicaoTopica)} Exposição tópica`, margin + 5, y + 14);
        doc.text(`${box(reacoesPessoas.exposicaoOcular)} Exposição ocular`, margin + 95, y + 14);
        doc.text(`${box(reacoesPessoas.exposicaoInjecao)} Exposição por injeção`, margin + 5, y + 20);
        doc.text(`${box(!!reacoesPessoas.outro)} Outro, ${reacoesPessoas.outro}`, margin + 95, y + 20);
        
        doc.line(margin, y + 25, pageWidth-margin, y+25);
        doc.text(`Dose recebida: ${doseRecebida}`, margin + 5, y + 32);

        doc.line(margin, y + 37, pageWidth-margin, y+37);
        doc.text("Local da exposição:", margin + 5, y + 44);
        doc.text(`${box(localExposicao.dedo)} dedo`, margin + 10, y + 50);
        doc.text(`${box(localExposicao.mao)} mão`, margin + 50, y + 50);
        doc.text(`${box(localExposicao.articulacao)} articulação`, margin + 90, y + 50);
        doc.text(`${box(!!localExposicao.outro)} outro: ${localExposicao.outro}`, margin + 10, y + 56);
        
        const signatureY = y + 90;
        doc.text(`Realizado por (iniciais): ${realizadoPor}`, margin, signatureY);
        doc.text(`Data: ${dataRealizado}`, margin + 125, signatureY);
        
        doc.text(`Registrado por (iniciais): ${registradoPor}`, margin, signatureY + 10);
        doc.text(`Data: ${dataRegistrado}`, margin + 125, signatureY + 10);
        
        doc.text("Página 2 de 2", pageWidth - margin - 10, 285, { align: "right" });

        doc.save("FOR-EC-12.0-Evento-Adverso.pdf");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg p-8 space-y-6">
                <h1 className="text-2xl font-bold text-center text-gray-800">12.0 - Evento Adverso</h1>
                
                <div className="grid grid-cols-2 gap-4">
                    <div><Label>Código do estudo</Label><Input value={codigoEstudo} onChange={e => setCodigoEstudo(e.target.value)} /></div>
                    <div><Label>Data</Label><Input type="date" value={data} onChange={e => setData(e.target.value)} /></div>
                    <div><Label>Animal</Label><Input value={animal} onChange={e => setAnimal(e.target.value)} /></div>
                    <div><Label>Grupo</Label><Input value={grupo} onChange={e => setGrupo(e.target.value)} /></div>
                </div>

                <div className="border rounded-lg p-4 space-y-4">
                    <h3 className="font-semibold text-center p-2 rounded">REAÇÕES NO ANIMAL</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div><Label>Tempo decorrido (min/h/dias)</Label><Input value={tempoDecorrido} onChange={e => setTempoDecorrido(e.target.value)} /></div>
                        <div><Label>Duração do evento (min/h/dias)</Label><Input value={duracaoEvento} onChange={e => setDuracaoEvento(e.target.value)} /></div>
                    </div>
                    <div><Label>Descrição do Evento Adverso (sinais clínicos)</Label><Textarea value={descricaoEvento} onChange={e => setDescricaoEvento(e.target.value)} className="min-h-[100px]" /></div>
                    <div><Label>Tratamento da Reação (Como, com o que e resultado)</Label><Textarea value={tratamentoReacao} onChange={e => setTratamentoReacao(e.target.value)} className="min-h-[80px]" /></div>
                </div>

                 <div className="border rounded-lg p-4 space-y-4">
                    <h3 className="font-semibold">AVALIAÇÃO DE CAUSALIDADE</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        <div className="flex items-center gap-2"><Checkbox id="provavel" checked={causalidade.provavel} onCheckedChange={handleCheckboxChange(setCausalidade, causalidade, 'provavel')} /><Label htmlFor="provavel">1. Provável</Label></div>
                        <div className="flex items-center gap-2"><Checkbox id="possivel" checked={causalidade.possivel} onCheckedChange={handleCheckboxChange(setCausalidade, causalidade, 'possivel')} /><Label htmlFor="possivel">2. Possível</Label></div>
                        <div className="flex items-center gap-2"><Checkbox id="naoClassificado" checked={causalidade.naoClassificado} onCheckedChange={handleCheckboxChange(setCausalidade, causalidade, 'naoClassificado')} /><Label htmlFor="naoClassificado">3. Não classificado</Label></div>
                        <div className="flex items-center gap-2"><Checkbox id="inacabado" checked={causalidade.inacabado} onCheckedChange={handleCheckboxChange(setCausalidade, causalidade, 'inacabado')} /><Label htmlFor="inacabado">4. Inacabado</Label></div>
                        <div className="flex items-center gap-2"><Checkbox id="improvavel" checked={causalidade.improvavel} onCheckedChange={handleCheckboxChange(setCausalidade, causalidade, 'improvavel')} /><Label htmlFor="improvavel">5. Improvável</Label></div>
                    </div>
                    <div className="border-t pt-4"><Label>OUTRAS INFORMAÇÕES RELEVANTES</Label><Textarea value={outrasInformacoes} onChange={e => setOutrasInformacoes(e.target.value)} className="min-h-[100px] mt-2" /></div>
                </div>

                <div className="border rounded-lg p-4 space-y-4">
                    <h3 className="font-semibold text-center p-2 rounded">REAÇÕES EM PESSOAS</h3>
                    <div className="grid grid-cols-2 gap-2">
                        {Object.keys(reacoesPessoas).filter(k => k !== 'outro').map(key => (
                            <div className="flex items-center gap-2" key={key}><Checkbox id={`reac-${key}`} checked={reacoesPessoas[key]} onCheckedChange={handleCheckboxChange(setReacoesPessoas, reacoesPessoas, key)} /><Label htmlFor={`reac-${key}`} className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</Label></div>
                        ))}
                        <div className="flex items-center gap-2"><Label htmlFor="reac-outro">Outro:</Label><Input id="reac-outro" value={reacoesPessoas.outro} onChange={e => setReacoesPessoas({...reacoesPessoas, outro: e.target.value})} /></div>
                    </div>
                     <div className="border-t pt-4"><Label>Dose recebida</Label><Input value={doseRecebida} onChange={e => setDoseRecebida(e.target.value)} /></div>
                    <div className="border-t pt-4">
                        <h4 className="font-semibold mb-2">Local da exposição</h4>
                        <div className="grid grid-cols-2 gap-2">
                           {Object.keys(localExposicao).filter(k => k !== 'outro').map(key => (
                                <div className="flex items-center gap-2" key={key}><Checkbox id={`local-${key}`} checked={localExposicao[key]} onCheckedChange={handleCheckboxChange(setLocalExposicao, localExposicao, key)} /><Label htmlFor={`local-${key}`} className="capitalize">{key}</Label></div>
                           ))}
                           <div className="flex items-center gap-2"><Label htmlFor="local-outro">Outro:</Label><Input id="local-outro" value={localExposicao.outro} onChange={e => setLocalExposicao({...localExposicao, outro: e.target.value})} /></div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                     <div><Label>Realizado por (iniciais)</Label><Input value={realizadoPor} onChange={e => setRealizadoPor(e.target.value)} /></div>
                     <div><Label>Data</Label><Input type="date" value={dataRealizado} onChange={e => setDataRealizado(e.target.value)} /></div>
                     <div><Label>Registrado por (iniciais)</Label><Input value={registradoPor} onChange={e => setRegistradoPor(e.target.value)} /></div>
                     <div><Label>Data</Label><Input type="date" value={dataRegistrado} onChange={e => setDataRegistrado(e.target.value)} /></div>
                </div>

                <Button onClick={handleExportarPDF} className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 mt-6">
                    Exportar PDF
                </Button>
            </div>
        </div>
    );
}