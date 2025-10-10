import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import jsPDF from "jspdf";

/**
 * FOR-EC-14.0 – NECROPSIA (A4 portrait)
 * - Fonte: Helvetica (Arial)
 * - Margens: 15 mm
 * - Cabeçalho: LOGO | Título | Página X de Y
 * - Faixa "Código do estudo"
 * - Página 1: dados do animal, marcações, achados, exames, material enviado
 * - Página 2: provável causa mortis + assinaturas
 */

export default function Necropsia() {
  // Metadados
  const codigoEstudo = "00-0001-25";
  const numeroDocumento = "FOR-EC-14";
  const versao = "0";

  // Campos do formulário (página 1)
  const [animal, setAnimal] = useState("");
  const [dataAnimal, setDataAnimal] = useState("");
  const [isEutanasia, setIsEutanasia] = useState(false);
  const [isObitoOutras, setIsObitoOutras] = useState(false);
  const [descricaoCausa, setDescricaoCausa] = useState("");

  const [dataMorte, setDataMorte] = useState("");
  const [dataNecropsia, setDataNecropsia] = useState("");
  const [horaNecropsia, setHoraNecropsia] = useState("");

  const [achadosMacros, setAchadosMacros] = useState("");
  const [examesCompl, setExamesCompl] = useState("");

  const [materialEnviado, setMaterialEnviado] = useState<"SIM" | "NAO" | "">("");
  const [materialInfo, setMaterialInfo] = useState("");

  // Página 2
  const [causaMortis, setCausaMortis] = useState("");
  const [realizadoPor, setRealizadoPor] = useState("");
  const [realizadoData, setRealizadoData] = useState("");
  const [registradoPor, setRegistradoPor] = useState("");
  const [registradoData, setRegistradoData] = useState("");

  // ==== Cabeçalho padrão (portrait) ====
  const drawHeader = (doc: jsPDF, page: number, total: number) => {
    const W = doc.internal.pageSize.getWidth(); // 210
    const innerW = W - 30; // 180
    const headerY = 10;
    const headerH = 18;

    const leftW = 65; // LOGO
    const rightW = 62; // Página X de Y
    const centerW = innerW - leftW - rightW;

    doc.setLineWidth(0.5);
    doc.rect(15, headerY, innerW, headerH);
    doc.rect(15, headerY, leftW, headerH);
    doc.rect(15 + innerW - rightW, headerY, rightW, headerH);

    // LOGO
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("LOGO", 15 + 10, headerY + headerH / 2 + 3);

    // Título com auto ajuste
    const title = "14.0 – NECROPSIA";
    const centerX = 15 + leftW + centerW / 2;
    let titleFont = 12;
    doc.setFontSize(titleFont);
    const maxCenterWidth = centerW - 12;
    const w = doc.getTextWidth(title);
    if (w > maxCenterWidth) {
      const scale = maxCenterWidth / w;
      titleFont = Math.max(9, Math.floor(12 * scale * 10) / 10);
      doc.setFontSize(titleFont);
    }
    doc.text(title, centerX, headerY + headerH / 2 + 3, { align: "center" });

    // Página X de Y
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const pageBoxX = 15 + innerW - rightW;
    const baseY = headerY + 6;
    doc.text("Página", pageBoxX + 8, baseY);
    doc.text(String(page), pageBoxX + 35, baseY);
    doc.text("de", pageBoxX + 44, baseY);
    doc.text(String(total), pageBoxX + 55, baseY);

    // Linha meta
    const metaY = headerY + headerH + 5;
    doc.text("Área: Estudos clínicos", 20, metaY);
    doc.text(`N° DOC.: ${numeroDocumento}`, 15 + leftW + centerW / 2, metaY, { align: "center" });
    doc.text(`Versão: ${versao}`, W - 20, metaY, { align: "right" });

    // Faixa “Código do estudo”
    const bandY = metaY + 6;
    doc.rect(15, bandY, innerW, 10);
    doc.setFont("helvetica", "bold");
    doc.text("Código do estudo:", 20, bandY + 7);
    doc.setFont("helvetica", "normal");
    doc.text(codigoEstudo, 63, bandY + 7);

    return bandY + 16; // y inicial para conteúdo
  };

  // === utilitário de bloco com label e valor (linha única) ===
  const drawLabeledLine = (
    doc: jsPDF,
    label: string,
    value: string,
    x: number,
    y: number,
    labelW = 28,
    lineW = 65
  ) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(label, x, y);
    doc.setFont("helvetica", "normal");
    doc.text(value || "", x + labelW, y);
    if (lineW > 0) {
      // opcional: sublinhado visual
    }
  };

  const drawCheckboxLine = (
    doc: jsPDF,
    items: { checked: boolean; text: string }[],
    x: number,
    y: number,
    maxWidth: number
  ) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    const selectedItems = items.filter((it) => it.checked);

    if (selectedItems.length === 0) {
      return 0;
    }

    // CORREÇÃO 1: Troca o caractere especial '☒' por '[X]' para evitar o '&'
    const joined = selectedItems
      .map((it) => `[X] ${it.text}`)
      .join("    ");

    const lines = doc.splitTextToSize(joined, maxWidth);
    let ly = y;
    lines.forEach((ln) => {
      doc.text(ln, x, ly);
      ly += 5;
    });

    return ly - y;
  };

  const drawMultilineBox = (
    doc: jsPDF,
    label: string,
    text: string,
    x: number,
    y: number,
    w: number,
    h: number
  ) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(label, x, y - 2);
    doc.rect(x, y, w, h);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const maxWidth = w - 6;
    const lines = doc.splitTextToSize(text || " ", maxWidth);
    let ly = y + 6;
    lines.forEach((ln) => {
      if (ly > y + h - 3) return;
      doc.text(ln, x + 3, ly);
      ly += 5;
    });
  };

  const handleExportarPDF = () => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    doc.setFont("helvetica", "normal");
    doc.setLineWidth(0.35);

    // ==== Página 1 ====
    let y = drawHeader(doc, 1, 2);

    // Linha: Animal / Data
    drawLabeledLine(doc, "Animal:", animal, 20, y);
    drawLabeledLine(doc, "Data:", dataAnimal, 120, y);
    y += 8;

    // Checkboxes: eutanásia / óbito por outra(s) causa(s)
    let checkboxHeight = drawCheckboxLine(
      doc,
      [
        { checked: isEutanasia, text: "Animal submetido à eutanásia." },
        { checked: isObitoOutras, text: "Óbito por outra(s) causa(s)." },
      ],
      20,
      y,
      175
    );
    y += checkboxHeight > 0 ? checkboxHeight + 4 : 8; // Adiciona espaço extra só se houver checkbox

    // Descrever (causa)
    drawMultilineBox(doc, "Descrever:", descricaoCausa, 20, y, 175, 35);
    y += 35 + 10;

    // CORREÇÃO 2: Adiciona os placeholders de volta para aparecerem quando os campos estiverem vazios
    drawLabeledLine(doc, "Data da morte", dataMorte || "____/____/____", 20, y, 32);
    drawLabeledLine(doc, "Data da necropsia", dataNecropsia || "____/____/____", 75, y, 40);
    drawLabeledLine(doc, "Hora da necropsia", horaNecropsia || "____:____", 140, y, 35);
    y += 10;

    // Achados macroscópicos
    drawMultilineBox(doc, "Achados macroscópicos:", achadosMacros, 20, y, 175, 40);
    y += 40 + 8;

    // Exames complementares
    drawMultilineBox(doc, "Exames complementares:", examesCompl, 20, y, 175, 32);
    y += 32 + 8;

    // Material enviado
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Material enviado para laboratório?", 20, y);
    doc.setFont("helvetica", "normal");
    drawCheckboxLine(
      doc,
      [
        { checked: materialEnviado === "NAO", text: "Não" },
        { checked: materialEnviado === "SIM", text: "Sim" },
      ],
      95,
      y,
      100
    );
    y += 6;
    drawMultilineBox(
      doc,
      "(informar material e laboratório)",
      materialInfo,
      20,
      y,
      175,
      22
    );

    // ==== Página 2 ====
    doc.addPage("a4", "portrait");
    drawHeader(doc, 2, 2);
    let y2 = 56; // após a faixa de código

    // Provável causa mortis
    drawMultilineBox(doc, "Provável causa mortis:", causaMortis, 20, y2, 175, 50);
    y2 += 50 + 20;

    // Assinaturas
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(
      `Realizado por (iniciais): ${realizadoPor || "______________________________________"}   Data: ${realizadoData || "___________"}`,
      20,
      y2
    );
    y2 += 12;
    doc.text(
      `Registrado por (iniciais): ${registradoPor || "_____________________________________"}   Data: ${registradoData || "___________"}`,
      20,
      y2
    );

    // Numeração definitiva (2 páginas)
    const total = doc.getNumberOfPages();
    for (let p = 1; p <= total; p++) {
      doc.setPage(p);
      drawHeader(doc, p, total);
    }

    doc.save("FOR-EC-14.0-Necropsia.pdf");
  };

  // ===== UI =====
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-lg p-6 space-y-6">
        <h1 className="text-2xl font-semibold text-center text-gray-800">
          14.0 – Necropsia
        </h1>

        {/* Código do estudo / Animal / Data */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <Label>Código do Estudo</Label>
            <Input value={codigoEstudo} readOnly disabled />
          </div>
          <div>
            <Label>Animal</Label>
            <Input value={animal} onChange={(e) => setAnimal(e.target.value)} />
          </div>
          <div>
            <Label>Data</Label>
            <Input
              placeholder="DD/MM/AAAA"
              value={dataAnimal}
              onChange={(e) => setDataAnimal(e.target.value)}
            />
          </div>
        </div>

        {/* Marcação de causa */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isEutanasia}
              onChange={() => setIsEutanasia(!isEutanasia)}
            />
            Animal submetido à eutanásia.
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isObitoOutras}
              onChange={() => setIsObitoOutras(!isObitoOutras)}
            />
            Óbito por outra(s) causa(s).
          </label>
        </div>

        <div>
          <Label>Descrever</Label>
          <textarea
            className="w-full border rounded-md p-2 min-h-[100px]"
            value={descricaoCausa}
            onChange={(e) => setDescricaoCausa(e.target.value)}
          />
        </div>

        {/* Datas / Hora */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Data da morte</Label>
            <Input
              placeholder="DD/MM/AAAA"
              value={dataMorte}
              onChange={(e) => setDataMorte(e.target.value)}
            />
          </div>
          <div>
            <Label>Data da necropsia</Label>
            <Input
              placeholder="DD/MM/AAAA"
              value={dataNecropsia}
              onChange={(e) => setDataNecropsia(e.target.value)}
            />
          </div>
          <div>
            <Label>Hora da necropsia</Label>
            <Input
              placeholder="HH:MM (24h)"
              value={horaNecropsia}
              onChange={(e) => setHoraNecropsia(e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label>Achados macroscópicos</Label>
          <textarea
            className="w-full border rounded-md p-2 min-h-[120px]"
            value={achadosMacros}
            onChange={(e) => setAchadosMacros(e.target.value)}
          />
        </div>

        <div>
          <Label>Exames complementares</Label>
          <textarea
            className="w-full border rounded-md p-2 min-h-[100px]"
            value={examesCompl}
            onChange={(e) => setExamesCompl(e.target.value)}
          />
        </div>

        {/* Material enviado */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
          <div className="md:col-span-2">
            <Label>Material enviado para laboratório?</Label>
            <div className="flex gap-6 mt-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={materialEnviado === "NAO"}
                  onChange={() =>
                    setMaterialEnviado(materialEnviado === "NAO" ? "" : "NAO")
                  }
                />
                Não
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={materialEnviado === "SIM"}
                  onChange={() =>
                    setMaterialEnviado(materialEnviado === "SIM" ? "" : "SIM")
                  }
                />
                Sim
              </label>
            </div>
          </div>
          <div className="md:col-span-4">
            <Label>(informar material e laboratório)</Label>
            <Input
              value={materialInfo}
              onChange={(e) => setMaterialInfo(e.target.value)}
              placeholder="Descrição do material e laboratório"
            />
          </div>
        </div>

        {/* Página 2 (UI para preencher) */}
        <div>
          <Label>Provável causa mortis</Label>
          <textarea
            className="w-full border rounded-md p-2 min-h-[100px]"
            value={causaMortis}
            onChange={(e) => setCausaMortis(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Realizado por (iniciais)</Label>
              <Input
                value={realizadoPor}
                onChange={(e) => setRealizadoPor(e.target.value)}
              />
            </div>
            <div>
              <Label>Data</Label>
              <Input
                value={realizadoData}
                onChange={(e) => setRealizadoData(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Registrado por (iniciais)</Label>
              <Input
                value={registradoPor}
                onChange={(e) => setRegistradoPor(e.target.value)}
              />
            </div>
            <div>
              <Label>Data</Label>
              <Input
                value={registradoData}
                onChange={(e) => setRegistradoData(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Exportação */}
        <Button
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold"
          onClick={handleExportarPDF}
        >
          Exportar PDF
        </Button>
      </div>
    </div>
  );
}