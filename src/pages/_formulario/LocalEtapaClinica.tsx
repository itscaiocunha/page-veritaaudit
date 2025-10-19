import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function LocalEtapaClinica() {
    // --- Estados para todos os campos do formulário ---
    const [propriedade, setPropriedade] = useState("");
    const [endereco, setEndereco] = useState("");
    const [telefone, setTelefone] = useState("");
    const [email, setEmail] = useState("");

    const [tipo, setTipo] = useState({ centroPesquisa: false, particular: false });
    const [propriedadeTipo, setPropriedadeTipo] = useState({ fazenda: false, hospital: false, outro: "" });
    const [propositoProducao, setPropositoProducao] = useState({ corte: false, leite: false, misto: false });
    const [fasesProducaoCorte, setFasesProducaoCorte] = useState({ cria: false, recria: false, engorda: false });
    const [fasesProducaoLeite, setFasesProducaoLeite] = useState({ bezerras: false, novilhas: false, femeasLactacao: false, femeasSecas: false });
    const [caracteristicasProducao, setCaracteristicasProducao] = useState({ extensivo: false, intensivo: false, confinamento: false, semiIntensivo: false });
    const [tipoEstrutura, setTipoEstrutura] = useState({ piquetes: false, pasto: false, curral: false, confinamento: false, freeStall: false, tieStall: false, compostBarn: false, outro: "", taxaLotacao: "" });
    const [pisoAlojamento, setPisoAlojamento] = useState({ cimento: false, terra: false, madeira: false, areia: false, capim: false, outro: "" });
    const [contencao, setContencao] = useState({ naoHa: false, cercaMadeira: false, cercaEletrica: false, arameFarpado: false, arameLiso: false, alvenaria: false, outro: "" });
    const [paredeAlojamento, setParedeAlojamento] = useState({ naoHa: false, semAcabamento: false, comAcabamento: false, azulejo: false, madeira: false, outro: "" });
    const [tipoPorta, setTipoPorta] = useState({ naoHa: false, madeira: false, ferro: false, vazado: false, naoVazado: false, outro: "" });
    const [dispositivos, setDispositivos] = useState({ naoSeAplica: false, telas: false, cortinas: false, lonas: false, grades: false, controleTemp: false, controleUmidade: false, ventilacao: false, outro: "" });
    const [tipoComedouro, setTipoComedouro] = useState({ individual: false, coletivo: false, madeira: false, metal: false, alvenaria: false, plastico: false, outro: "" });
    const [origemAgua, setOrigemAgua] = useState({ poco: false, rioLago: false, redePublica: false, nascente: false, filtro: false, outro: "" });
    const [tipoBebedouro, setTipoBebedouro] = useState({ individual: false, coletivo: false, calha: false, cocho: false, rioLago: false, plastico: false, aluminio: false, madeira: false, outro: "" });

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
            doc.rect(margin, 10, innerWidth, 16);
            doc.rect(margin, 10, 50, 16);
            doc.rect(pageWidth - margin - 40, 10, 40, 16);
            doc.setFont("helvetica", "bold"); doc.setFontSize(10);
            doc.text("LOGO", margin + 25, 18, { align: 'center' });
            doc.setFontSize(12); doc.text("2.0 - LOCAL DA ETAPA CLÍNICA", pageWidth / 2, 18, { align: 'center' });
            doc.setFont("helvetica", "normal"); doc.setFontSize(9);
            doc.text(`Página ${page} de ${total}`, pageWidth - margin - 20, 18, { align: 'center' });
            doc.rect(margin, 26, innerWidth, 8);
            doc.text("Área: Estudos clínicos", margin + 2, 31);
            doc.text("N° DOC.: FOR-EC-2", pageWidth / 2, 31, { align: 'center' });
            doc.text("Versão: 0", pageWidth - margin - 15, 31, { align: 'center' });
        };

        // --- PÁGINA 1 ---
        drawHeader(1, 2);
        autoTable(doc, {
            startY: 36,
            theme: 'grid',
            body: [
                [`Código do estudo: 00-0001-25`],
                [`Propriedade: ${propriedade}`],
                [`Endereço completo*: ${endereco}`],
                [`Telefone/Celular: ${telefone}`],
                [`E-mail: ${email}`]
            ],
            styles: { fontSize: 10, cellPadding: 1.5, lineWidth: 0.1 },
        });

        autoTable(doc, { startY: (doc as any).lastAutoTable.finalY + 1, head: [['ESPECIFICAÇÕES DA PROPRIEDADE']], headStyles: { halign: 'center', fontStyle: 'bold', fillColor: [255, 255, 255], textColor: 0, lineWidth: 0.1 }, theme: 'grid' });

        let y = (doc as any).lastAutoTable.finalY;

        const drawSection = (title: string, subTitle: string, items: string[][]) => {
            const titleWidth = 50;
            const contentWidth = innerWidth - titleWidth;
            const numCols = items.length;
            const colWidth = contentWidth / numCols;
            const itemHeight = 5;
            const padding = 2;

            const maxRows = items.reduce((max, col) => Math.max(max, col.length), 0);
            const sectionHeight = maxRows * itemHeight + (padding * 2);

            doc.setLineWidth(0.1);
            doc.rect(margin, y, innerWidth, sectionHeight);
            doc.rect(margin, y, titleWidth, sectionHeight);

            doc.setFont('helvetica', 'bold'); doc.setFontSize(10);
            const titleY = subTitle ? y + sectionHeight / 2 - 2 : y + sectionHeight / 2;
            doc.text(title, margin + 25, titleY, { align: 'center', baseline: 'middle' });
            if (subTitle) {
                doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
                doc.text(subTitle, margin + 25, titleY + 4, { align: 'center', maxWidth: titleWidth - 4 });
            }

            doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
            items.forEach((col, colIndex) => {
                const colX = margin + titleWidth + (colIndex * colWidth);
                if (colIndex > 0) {
                    doc.line(colX, y, colX, y + sectionHeight);
                }
                col.forEach((item, rowIndex) => {
                    const itemY = y + padding + (rowIndex * itemHeight) + (itemHeight / 2);
                    if (rowIndex > 0) {
                        doc.setLineDashPattern([0.5, 0.5]);
                        doc.line(colX, y + padding + (rowIndex * itemHeight), colX + colWidth, y + padding + (rowIndex * itemHeight));
                        doc.setLineDashPattern([]);
                    }
                    const wrappedText = doc.splitTextToSize(item, colWidth - (padding * 2));
                    doc.text(wrappedText, colX + padding, itemY, { baseline: 'middle' });
                });
            });
            y += sectionHeight;
        };
        
        drawSection('TIPO', '', [[`${box(tipo.centroPesquisa)} Centro de Pesquisa`, `${box(tipo.particular)} Propriedade Particular`]]);
        drawSection('PROPRIEDADE', 'Onde os animais estão.', [[`${box(propriedadeTipo.fazenda)} Fazenda/Sítio`, `${box(propriedadeTipo.hospital)} Hospital`], [`Outro: ${propriedadeTipo.outro}`]]);
        drawSection('PROPÓSITO DA PRODUÇÃO', '', [[`${box(propositoProducao.corte)} Corte`, `${box(propositoProducao.leite)} Leite`, `${box(propositoProducao.misto)} Misto`]]);
        drawSection('FASES DA PRODUÇÃO', '', [ [`Corte:`, `${box(fasesProducaoCorte.cria)} Cria`, `${box(fasesProducaoCorte.recria)} Recria`, `${box(fasesProducaoCorte.engorda)} Engorda`], [`Leite:`, `${box(fasesProducaoLeite.bezerras)} Bezerras`, `${box(fasesProducaoLeite.novilhas)} Novilhas`, `${box(fasesProducaoLeite.femeasLactacao)} Fêmeas em Lactação`, `${box(fasesProducaoLeite.femeasSecas)} Fêmeas Secas`] ]);
        drawSection('CARACTERÍSTICAS DE PRODUÇÃO', '', [[`${box(caracteristicasProducao.extensivo)} Extensivo`, `${box(caracteristicasProducao.intensivo)} Intensivo`], [`${box(caracteristicasProducao.confinamento)} Confinamento`, `${box(caracteristicasProducao.semiIntensivo)} Semi-intensivo`]]);
        drawSection('TIPO DE ESTRUTURA', 'Local onde os animais ficarão até o término do estudo.', [ [`${box(tipoEstrutura.piquetes)} Piquetes`, `${box(tipoEstrutura.pasto)} Pasto`, `${box(tipoEstrutura.curral)} Curral`], [`${box(tipoEstrutura.confinamento)} Confinamento`, `${box(tipoEstrutura.freeStall)} Free Stall`, `${box(tipoEstrutura.tieStall)} Tie Stall`], [`${box(tipoEstrutura.compostBarn)} Compost Barn`, `Outro, especificar: ${tipoEstrutura.outro}`, `Taxa de lotação: ${tipoEstrutura.taxaLotacao}`] ]);
        drawSection('PISO DO ALOJAMENTO', '', [[`${box(pisoAlojamento.cimento)} Cimento`, `${box(pisoAlojamento.terra)} Terra`, `${box(pisoAlojamento.madeira)} Madeira`], [`${box(pisoAlojamento.areia)} Areia`, `${box(pisoAlojamento.capim)} Capim`, `Outro, especificar: ${pisoAlojamento.outro}`]]);
        
        doc.addPage();
        drawHeader(2, 2);
        y = 40;

        drawSection('CONTENÇÃO', '', [[`${box(contencao.naoHa)} Não há contenção`, `${box(contencao.cercaMadeira)} Cerca de Madeira`, `${box(contencao.cercaEletrica)} Cerca Elétrica`], [`${box(contencao.arameFarpado)} Arame farpado`, `${box(contencao.arameLiso)} Arame liso`, `${box(contencao.alvenaria)} Alvenaria (Parede)`], [`Outro, especificar: ${contencao.outro}`]]);
        drawSection('PAREDE DO ALOJAMENTO', 'ACABAMENTO', [[`${box(paredeAlojamento.naoHa)} Não há parede`, `${box(paredeAlojamento.semAcabamento)} Sem acabamento`, `${box(paredeAlojamento.comAcabamento)} Com acabamento`], [`${box(paredeAlojamento.azulejo)} Azulejo`, `${box(paredeAlojamento.madeira)} Madeira`, `Outro, especificar: ${paredeAlojamento.outro}`]]);
        drawSection('TIPO DE PORTA/ PORTÃO', '', [[`${box(tipoPorta.naoHa)} Não há portão`, `${box(tipoPorta.madeira)} Madeira`, `${box(tipoPorta.ferro)} Ferro`], [`${box(tipoPorta.vazado)} Vazado`, `${box(tipoPorta.naoVazado)} Não Vazado`, `Outro, especificar: ${tipoPorta.outro}`]]);
        drawSection('DISPOSITIVOS', '', [[`${box(dispositivos.naoSeAplica)} Não se aplica`, `${box(dispositivos.telas)} Telas`, `${box(dispositivos.cortinas)} Cortinas`], [`${box(dispositivos.lonas)} Lonas`, `${box(dispositivos.grades)} Grades`, `${box(dispositivos.controleTemp)} Controle de T°C`], [`${box(dispositivos.controleUmidade)} Controle de Umidade`, `${box(dispositivos.ventilacao)} Ventilação`, `Outro: ${dispositivos.outro}`]]);
        drawSection('TIPO DE COMEDOURO', '', [[`${box(tipoComedouro.individual)} Individual`, `${box(tipoComedouro.coletivo)} Coletivo`], [`${box(tipoComedouro.madeira)} Madeira`, `${box(tipoComedouro.metal)} Metal`], [`${box(tipoComedouro.alvenaria)} Alvenaria`, `${box(tipoComedouro.plastico)} Plástico`], [`Outro, especificar: ${tipoComedouro.outro}`]]);
        drawSection('ORIGEM DA ÁGUA', '', [[`${box(origemAgua.poco)} Poço Artesiano`, `${box(origemAgua.rioLago)} Rio, Lago`, `${box(origemAgua.redePublica)} Rede Pública`], [`${box(origemAgua.nascente)} Nascente`, `${box(origemAgua.filtro)} Filtro`, `Outro, especificar: ${origemAgua.outro}`]]);
        drawSection('TIPO DE BEBEDOURO', '', [[`${box(tipoBebedouro.individual)} Individual`, `${box(tipoBebedouro.coletivo)} Coletivo`], [`${box(tipoBebedouro.calha)} Calha no chão`, `${box(tipoBebedouro.cocho)} Cocho de Alvenaria`], [`${box(tipoBebedouro.rioLago)} Rio, Lago`, `${box(tipoBebedouro.plastico)} Plástico`], [`${box(tipoBebedouro.aluminio)} Alumínio`, `${box(tipoBebedouro.madeira)} Madeira`], [`Outro, especificar: ${tipoBebedouro.outro}`]]);
        
        doc.text("Investigador (iniciais): ________________________________________  Data: ________________", margin, y + 20);
        
        doc.save("FOR-EC-2.0-LocalEtapaClinica.pdf");
    };

    const CheckboxGroup = ({ title, subTitle, state, setState, items, otherKey = 'outro' }: { title: string, subTitle?: string, state: any, setState: Function, items: {key: string, label: string}[], otherKey?: string }) => (
        <div className="border rounded-lg p-4">
            <h3 className="font-semibold">{title}</h3>
            {subTitle && <p className="text-sm text-gray-500 mb-2">{subTitle}</p>}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2">
                {items.map(({ key, label }) => (
                    <div className="flex items-center gap-2" key={key}>
                        <Checkbox id={key} checked={state[key]} onCheckedChange={handleCheckboxChange(setState, state, key)} />
                        <Label htmlFor={key}>{label}</Label>
                    </div>
                ))}
                 {state.hasOwnProperty(otherKey) && (
                    <div className="flex items-center gap-2 col-span-full mt-2">
                        <Label htmlFor={`${title}-outro`}>Outro, especificar:</Label>
                        <Input id={`${title}-outro`} value={state[otherKey]} onChange={(e) => setState({...state, [otherKey]: e.target.value})} className="h-8 flex-1" />
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg p-8 space-y-6">
                <h1 className="text-2xl font-bold text-center text-gray-800">2.0 - Local da Etapa Clínica</h1>
                <div className="space-y-4">
                    <div><Label>Propriedade</Label><Input value={propriedade} onChange={(e) => setPropriedade(e.target.value)} /></div>
                    <div><Label>Endereço completo (*Rodovia, estrada, fazenda, Zona Rural / Cidade / Estado / CEP)</Label><Textarea value={endereco} onChange={(e) => setEndereco(e.target.value)} /></div>
                    <div><Label>Telefone/Celular</Label><Input value={telefone} onChange={(e) => setTelefone(e.target.value)} /></div>
                    <div><Label>E-mail</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
                </div>

                <h2 className="text-xl font-semibold text-center pt-4 border-t">Especificações da Propriedade</h2>
                
                <div className="space-y-6">
                    <CheckboxGroup title="TIPO" state={tipo} setState={setTipo} items={[{key: 'centroPesquisa', label: 'Centro de Pesquisa'}, {key: 'particular', label: 'Propriedade Particular'}]} otherKey="" />
                    <CheckboxGroup title="PROPRIEDADE" subTitle="Onde os animais estão." state={propriedadeTipo} setState={setPropriedadeTipo} items={[{key: 'fazenda', label: 'Fazenda/Sítio'}, {key: 'hospital', label: 'Hospital'}]} />
                    <CheckboxGroup title="PROPÓSITO DA PRODUÇÃO" state={propositoProducao} setState={setPropositoProducao} items={[{key: 'corte', label: 'Corte'}, {key: 'leite', label: 'Leite'}, {key: 'misto', label: 'Misto'}]} otherKey=""/>
                    <div className="border rounded-lg p-4">
                        <h3 className="font-semibold mb-2">FASES DA PRODUÇÃO</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h4 className="font-medium mb-1">Corte:</h4>
                                <div className="flex flex-col gap-1"><div className="flex items-center gap-2"><Checkbox id="cria" checked={fasesProducaoCorte.cria} onCheckedChange={handleCheckboxChange(setFasesProducaoCorte, fasesProducaoCorte, 'cria')}/><Label htmlFor="cria">Cria</Label></div><div className="flex items-center gap-2"><Checkbox id="recria" checked={fasesProducaoCorte.recria} onCheckedChange={handleCheckboxChange(setFasesProducaoCorte, fasesProducaoCorte, 'recria')}/><Label htmlFor="recria">Recria</Label></div><div className="flex items-center gap-2"><Checkbox id="engorda" checked={fasesProducaoCorte.engorda} onCheckedChange={handleCheckboxChange(setFasesProducaoCorte, fasesProducaoCorte, 'engorda')}/><Label htmlFor="engorda">Engorda</Label></div></div>
                            </div>
                             <div>
                                <h4 className="font-medium mb-1">Leite:</h4>
                                <div className="flex flex-col gap-1"><div className="flex items-center gap-2"><Checkbox id="bezerras" checked={fasesProducaoLeite.bezerras} onCheckedChange={handleCheckboxChange(setFasesProducaoLeite, fasesProducaoLeite, 'bezerras')}/><Label htmlFor="bezerras">Bezerras</Label></div><div className="flex items-center gap-2"><Checkbox id="novilhas" checked={fasesProducaoLeite.novilhas} onCheckedChange={handleCheckboxChange(setFasesProducaoLeite, fasesProducaoLeite, 'novilhas')}/><Label htmlFor="novilhas">Novilhas</Label></div><div className="flex items-center gap-2"><Checkbox id="femeasLactacao" checked={fasesProducaoLeite.femeasLactacao} onCheckedChange={handleCheckboxChange(setFasesProducaoLeite, fasesProducaoLeite, 'femeasLactacao')}/><Label htmlFor="femeasLactacao">Fêmeas em Lactação</Label></div><div className="flex items-center gap-2"><Checkbox id="femeasSecas" checked={fasesProducaoLeite.femeasSecas} onCheckedChange={handleCheckboxChange(setFasesProducaoLeite, fasesProducaoLeite, 'femeasSecas')}/><Label htmlFor="femeasSecas">Fêmeas Secas</Label></div></div>
                            </div>
                        </div>
                    </div>
                    <CheckboxGroup title="CARACTERÍSTICAS DE PRODUÇÃO" state={caracteristicasProducao} setState={setCaracteristicasProducao} items={[{key: 'extensivo', label: 'Extensivo'}, {key: 'intensivo', label: 'Intensivo'}, {key: 'confinamento', label: 'Confinamento'}, {key: 'semiIntensivo', label: 'Semi-intensivo'}]} otherKey=""/>
                    <div className="border rounded-lg p-4">
                        <CheckboxGroup title="TIPO DE ESTRUTURA" subTitle="Local onde os animais ficarão até o término do estudo." state={tipoEstrutura} setState={setTipoEstrutura} items={[{key: 'piquetes', label: 'Piquetes'}, {key: 'pasto', label: 'Pasto'}, {key: 'curral', label: 'Curral'}, {key: 'confinamento', label: 'Confinamento'}, {key: 'freeStall', label: 'Free Stall'}, {key: 'tieStall', label: 'Tie Stall'}, {key: 'compostBarn', label: 'Compost Barn'}]} />
                        <div className="flex items-center gap-2 mt-2"><Label htmlFor="taxaLotacao">Taxa de lotação:</Label><Input id="taxaLotacao" value={tipoEstrutura.taxaLotacao} onChange={(e) => setTipoEstrutura({...tipoEstrutura, taxaLotacao: e.target.value})} className="h-8 flex-1"/></div>
                    </div>
                    <CheckboxGroup title="PISO DO ALOJAMENTO" state={pisoAlojamento} setState={setPisoAlojamento} items={[{key: 'cimento', label: 'Cimento'}, {key: 'terra', label: 'Terra'}, {key: 'madeira', label: 'Madeira'}, {key: 'areia', label: 'Areia'}, {key: 'capim', label: 'Capim'}]} />
                    <CheckboxGroup title="CONTENÇÃO (Parede)" state={contencao} setState={setContencao} items={[{key: 'naoHa', label: 'Não há contenção'}, {key: 'cercaMadeira', label: 'Cerca de Madeira'}, {key: 'cercaEletrica', label: 'Cerca Elétrica'}, {key: 'arameFarpado', label: 'Arame farpado'}, {key: 'arameLiso', label: 'Arame liso'}, {key: 'alvenaria', label: 'Alvenaria'}]} />
                    <CheckboxGroup title="PAREDE DO ALOJAMENTO / ACABAMENTO" state={paredeAlojamento} setState={setParedeAlojamento} items={[{key: 'naoHa', label: 'Não há parede'}, {key: 'semAcabamento', label: 'Sem acabamento'}, {key: 'comAcabamento', label: 'Com acabamento'}, {key: 'azulejo', label: 'Azulejo'}, {key: 'madeira', label: 'Madeira'}]} />
                    <CheckboxGroup title="TIPO DE PORTA/ PORTÃO" state={tipoPorta} setState={setTipoPorta} items={[{key: 'naoHa', label: 'Não há portão'}, {key: 'madeira', label: 'Madeira'}, {key: 'ferro', label: 'Ferro'}, {key: 'vazado', label: 'Vazado'}, {key: 'naoVazado', label: 'Não Vazado'}]} />
                    <CheckboxGroup title="DISPOSITIVOS" state={dispositivos} setState={setDispositivos} items={[{key: 'naoSeAplica', label: 'Não se aplica'}, {key: 'telas', label: 'Telas'}, {key: 'cortinas', label: 'Cortinas'}, {key: 'lonas', label: 'Lonas'}, {key: 'grades', label: 'Grades'}, {key: 'controleTemp', label: 'Controle de T°C'}, {key: 'controleUmidade', label: 'Controle de Umidade'}, {key: 'ventilacao', label: 'Ventilação'}]} />
                    <CheckboxGroup title="TIPO DE COMEDOURO" state={tipoComedouro} setState={setTipoComedouro} items={[{key: 'individual', label: 'Individual'}, {key: 'coletivo', label: 'Coletivo'}, {key: 'madeira', label: 'Madeira'}, {key: 'metal', label: 'Metal'}, {key: 'alvenaria', label: 'Alvenaria'}, {key: 'plastico', label: 'Plástico'}]} />
                    <CheckboxGroup title="ORIGEM DA ÁGUA" state={origemAgua} setState={setOrigemAgua} items={[{key: 'poco', label: 'Poço Artesiano'}, {key: 'rioLago', label: 'Rio, Lago'}, {key: 'redePublica', label: 'Rede Pública'}, {key: 'nascente', label: 'Nascente'}, {key: 'filtro', label: 'Filtro'}]} />
                    <CheckboxGroup title="TIPO DE BEBEDOURO" state={tipoBebedouro} setState={setTipoBebedouro} items={[{key: 'individual', label: 'Individual'}, {key: 'coletivo', label: 'Coletivo'}, {key: 'calha', label: 'Calha no chão'}, {key: 'cocho', label: 'Cocho de Alvenaria'}, {key: 'rioLago', label: 'Rio, Lago'}, {key: 'plastico', label: 'Plástico'}, {key: 'aluminio', label: 'Alumínio'}, {key: 'madeira', label: 'Madeira'}]} />
                </div>

                <Button onClick={handleExportarPDF} className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 mt-6">
                    Exportar PDF
                </Button>
            </div>
        </div>
    );
}