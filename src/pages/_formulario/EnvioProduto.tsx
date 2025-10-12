// src/pages/_formulario/EnvioProduto.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import jsPDF from "jspdf";
import autoTable, { RowInput } from "jspdf-autotable";

type Linha = { item: string; lote: string; quantidade: string };

export default function EnvioProduto() {
  // Cabeçalho
  const numeroDocumento = "FOR-EC-28";
  const versao = "0";

  // Dados de origem
  const [origemNome, setOrigemNome] = useState("");
  const [origemCnpj, setOrigemCnpj] = useState("");
  const [origemEndereco, setOrigemEndereco] = useState("");
  const [origemBairro, setOrigemBairro] = useState("");
  const [origemCep, setOrigemCep] = useState("");
  const [origemCidade, setOrigemCidade] = useState("");
  const [origemUf, setOrigemUf] = useState("");

  // Dados de destino
  const [destinoLocal, setDestinoLocal] = useState("");
  const [destinoEndereco, setDestinoEndereco] = useState("");

  // Tabela de conteúdo
  const [linhas, setLinhas] = useState<Linha[]>([
    { item: "", lote: "", quantidade: "" },
  ]);
  const addLinha = () => setLinhas((p) => [...p, { item: "", lote: "", quantidade: "" }]);
  const removeLinha = (idx: number) => setLinhas((p) => p.filter((_, i) => i !== idx));

  // Envio
  const [respEnvio, setRespEnvio] = useState("");
  const [dataEnvio, setDataEnvio] = useState("");
  const [condicoesEnvio, setCondicoesEnvio] = useState("");

  // Recebimento
  const [respReceb, setRespReceb] = useState("");
  const [dataReceb, setDataReceb] = useState("");
  const [condicoesReceb, setCondicoesReceb] = useState("");

  // ===== utilitários de layout =====
  const LM = 15, RM = 15, TM = 12, BM = 15; // margens
  const CARD_PADX = 5, CARD_PADY = 6;

  const drawHeader = (doc: jsPDF, page: number, total: number) => {
    const W = doc.internal.pageSize.getWidth();
    const innerW = W - LM - RM;
    const headerY = TM;
    const headerH = 18;
    const leftW = 65;
    const rightW = 62;
    const centerW = innerW - leftW - rightW;

    doc.setLineWidth(0.5);
    doc.rect(LM, headerY, innerW, headerH);
    doc.rect(LM, headerY, leftW, headerH);
    doc.rect(LM + innerW - rightW, headerY, rightW, headerH);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("LOGO", LM + 10, headerY + headerH / 2 + 3);

    const title = "28.0 – ENVIO DE PRODUTO";
    doc.setFontSize(12);
    doc.text(title, LM + leftW + centerW / 2, headerY + headerH / 2 + 3, {
      align: "center",
    });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const pageBoxX = LM + innerW - rightW;
    const top = headerY + 6;
    doc.text("Página", pageBoxX + 8, top);
    doc.text(String(page), pageBoxX + 35, top);
    doc.text("de", pageBoxX + 44, top);
    doc.text(String(total), pageBoxX + 55, top);

    const metaY = headerY + headerH + 5;
    doc.text("Área: Estudos clínicos", LM + 5, metaY);
    doc.text(`N° DOC.: ${numeroDocumento}`, LM + leftW + centerW / 2, metaY, { align: "center" });
    doc.text(`Versão: ${versao}`, W - RM - 5, metaY, { align: "right" });
    return metaY + 6;
  };

  /** Garante espaço antes de desenhar um bloco */
  const ensureSpace = (doc: jsPDF, currentY: number, heightNeeded: number) => {
    const H = doc.internal.pageSize.getHeight();
    if (currentY + heightNeeded <= H - BM) return currentY;
    const totalBefore = doc.getNumberOfPages();
    doc.addPage();
    const yStart = drawHeader(doc, totalBefore + 1, totalBefore + 1); // numeramos de novo no final
    return yStart;
  };

  /** Desenha a moldura do card e retorna o Y de início do conteúdo */
  const drawCard = (doc: jsPDF, title: string, x: number, y: number, w: number, h: number) => {
    doc.setLineWidth(0.35);
    doc.rect(x, y, w, h);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(title, x + CARD_PADX, y + CARD_PADY);
    return { contentX: x + CARD_PADX, contentY: y + CARD_PADY + 4, innerW: w - CARD_PADX * 2, innerH: h - (CARD_PADY + 4) - CARD_PADY };
  };

  /** Linha rotulada dentro da caixa, sem ultrapassar a borda direita */
  const labelLineInBox = (
    doc: jsPDF,
    label: string,
    value: string,
    bx: number,
    by: number,
    bw: number,
    y: number
  ) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    const lx = bx + CARD_PADX;
    const labelW = doc.getTextWidth(label);
    const rxMax = bx + bw - CARD_PADX; // limite à direita
    const startValueX = lx + labelW + 2;
    doc.text(label, lx, y);

    doc.setFont("helvetica", "normal");
    const placeholder = value && value.trim() !== "" ? value : "";
    const avail = Math.max(10, rxMax - startValueX);
    const shown = placeholder ? doc.splitTextToSize(placeholder, avail)[0] : "";
    if (shown) doc.text(shown as string, startValueX, y);
    // desenha linha apenas até o limite interno
    const lineEnd = rxMax;
    doc.setLineWidth(0.2);
    doc.line(startValueX, y + 1.5, lineEnd, y + 1.5);
  };

  /** Parágrafo dentro do card (quebra controlada). Retorna o Y final. */
  const paragraphInBox = (
    doc: jsPDF,
    text: string,
    bx: number,
    by: number,
    bw: number,
    y: number
  ) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const maxW = bw - CARD_PADX * 2;
    const lines = doc.splitTextToSize(text || " ", maxW);
    let yy = y;
    lines.forEach((ln) => {
      doc.text(ln, bx + CARD_PADX, yy);
      yy += 5;
    });
    return yy;
  };

  // ===== EXPORTAÇÃO =====
  const handleExportarPDF = () => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    doc.setFont("helvetica", "normal");

    const W = doc.internal.pageSize.getWidth();
    const innerW = W - LM - RM;

    // Página inicial
    let y = drawHeader(doc, 1, 1);

    // ---------- DADOS DE ORIGEM ----------
    const origemCardH = 48; // Aumentado para 5 linhas de conteúdo
    y = ensureSpace(doc, y, origemCardH);
    let card = drawCard(doc, "DADOS DE ORIGEM:", LM, y, innerW, origemCardH);
    let cy = card.contentY;

    labelLineInBox(doc, "RAZÃO SOCIAL/NOME:", origemNome, LM, y, innerW, cy);
    cy += 8;
    labelLineInBox(doc, "CNPJ/CPF:", origemCnpj, LM, y, innerW, cy);
    cy += 8;
    labelLineInBox(doc, "ENDEREÇO:", origemEndereco, LM, y, innerW, cy);
    cy += 8;

    // Linha dupla: Bairro e CEP
    const halfPointX = LM + innerW / 2;
    doc.setFont("helvetica", "bold");
    doc.text("BAIRRO:", LM + CARD_PADX, cy);
    const bairroValueX = LM + CARD_PADX + doc.getTextWidth("BAIRRO:") + 2;
    doc.setFont("helvetica", "normal");
    doc.text(doc.splitTextToSize(origemBairro, halfPointX - bairroValueX - 10)[0], bairroValueX, cy);
    doc.setLineWidth(0.2);
    doc.line(bairroValueX, cy + 1.5, halfPointX - 5, cy + 1.5);

    doc.setFont("helvetica", "bold");
    doc.text("CEP:", halfPointX + 5, cy);
    const cepValueX = halfPointX + 5 + doc.getTextWidth("CEP:") + 2;
    doc.setFont("helvetica", "normal");
    doc.text(doc.splitTextToSize(origemCep, LM + innerW - CARD_PADX - cepValueX)[0], cepValueX, cy);
    doc.line(cepValueX, cy + 1.5, LM + innerW - CARD_PADX, cy + 1.5);
    cy += 8;

    // Linha dupla: Cidade e UF
    doc.setFont("helvetica", "bold");
    doc.text("CIDADE:", LM + CARD_PADX, cy);
    const cidadeValueX = LM + CARD_PADX + doc.getTextWidth("CIDADE:") + 2;
    doc.setFont("helvetica", "normal");
    doc.text(doc.splitTextToSize(origemCidade, halfPointX - cidadeValueX - 10)[0], cidadeValueX, cy);
    doc.line(cidadeValueX, cy + 1.5, halfPointX - 5, cy + 1.5);

    doc.setFont("helvetica", "bold");
    doc.text("UF:", halfPointX + 5, cy);
    const ufValueX = halfPointX + 5 + doc.getTextWidth("UF:") + 2;
    doc.setFont("helvetica", "normal");
    doc.text(doc.splitTextToSize(origemUf, LM + innerW - CARD_PADX - ufValueX)[0], ufValueX, cy);
    doc.line(ufValueX, cy + 1.5, LM + innerW - CARD_PADX, cy + 1.5);

    y += origemCardH + 6;

    // ---------- DADOS DO DESTINO ----------
    const destinoCardH = 24;
    y = ensureSpace(doc, y, destinoCardH);
    card = drawCard(doc, "DADOS DO DESTINO:", LM, y, innerW, destinoCardH);
    cy = card.contentY;
    labelLineInBox(doc, "LOCAL:", destinoLocal, LM, y, innerW, cy);
    cy += 8;
    labelLineInBox(doc, "ENDEREÇO:", destinoEndereco, LM, y, innerW, cy);
    y += destinoCardH + 6;

    // ---------- DESCRIÇÃO DO CONTEÚDO ----------
    const conteudoCardH = 45; // Altura fixa para 3 linhas de dados + cabeçalho
    y = ensureSpace(doc, y, conteudoCardH);
    card = drawCard(doc, "DESCRIÇÃO DO CONTEÚDO:", LM, y, innerW, conteudoCardH);

    const head = [["Item", "Lote", "Quantidade"]];
    const body: RowInput[] = linhas
      .filter((l) => l.item || l.lote || l.quantidade)
      .map((l) => [l.item, l.lote, l.quantidade]);
    while (body.length < 3) body.push(["", "", ""]); // Garante 3 linhas como no modelo

    autoTable(doc, {
      head,
      body,
      startY: card.contentY + 2,
      theme: "grid",
      margin: { left: LM + CARD_PADX, right: RM + CARD_PADX },
      styles: { font: "helvetica", fontSize: 10, cellPadding: 2, halign: "left", valign: "middle" },
      headStyles: { fillColor: [255, 255, 255], textColor: 0, fontStyle: "bold", halign: "center" },
      columnStyles: { 0: { cellWidth: 90 }, 1: { cellWidth: 40 }, 2: { cellWidth: 40, halign: "center" } },
      tableWidth: innerW - CARD_PADX * 2,
      didDrawPage: () => {
        /* evita reimprimir cabeçalho do autotable aqui */
      },
    });
    y += conteudoCardH + 6;

    // ---------- RESPONSÁVEL PELO ENVIO ----------
    const envioCardH = 40;
    y = ensureSpace(doc, y, envioCardH);
    card = drawCard(doc, "RESPONSÁVEL PELO ENVIO:", LM, y, innerW, envioCardH);
    cy = card.contentY;

    const nomeEnd = LM + innerW * 0.62;
    const dataLblX = nomeEnd + 5;
    // Nome
    doc.setFont("helvetica", "bold");
    doc.text("Nome:", LM + CARD_PADX, cy);
    const nomeValueX = LM + CARD_PADX + doc.getTextWidth("Nome:") + 2;
    doc.setFont("helvetica", "normal");
    doc.text(doc.splitTextToSize(respEnvio, nomeEnd - nomeValueX)[0], nomeValueX, cy);
    doc.setLineWidth(0.2);
    doc.line(nomeValueX, cy + 1.5, nomeEnd, cy + 1.5);
    // Data
    doc.setFont("helvetica", "bold");
    doc.text("Data do Envio:", dataLblX, cy);
    const dataValueX = dataLblX + doc.getTextWidth("Data do Envio:") + 2;
    doc.setFont("helvetica", "normal");
    doc.text(doc.splitTextToSize(dataEnvio, LM + innerW - CARD_PADX - dataValueX)[0], dataValueX, cy);
    doc.line(dataValueX, cy + 1.5, LM + innerW - CARD_PADX, cy + 1.5);
    cy += 10;
    // Condições de Envio
    doc.setFont("helvetica", "bold");
    doc.text("Condições de Envio:", LM + CARD_PADX, cy);
    doc.setFont("helvetica", "normal");
    const condicoesLines = doc.splitTextToSize(condicoesEnvio || " ", innerW - CARD_PADX * 2);
    let condicoesY = cy + 5;
    condicoesLines.forEach((line: string) => {
      if (condicoesY < y + envioCardH - CARD_PADY) {
        doc.text(line, LM + CARD_PADX, condicoesY);
        condicoesY += 5;
      }
    });
    y += envioCardH + 6;

    // ---------- RESPONSÁVEL PELO RECEBIMENTO ----------
    const recebCardH = 40;
    y = ensureSpace(doc, y, recebCardH);
    card = drawCard(doc, "RESPONSÁVEL PELO RECEBIMENTO:", LM, y, innerW, recebCardH);
    cy = card.contentY;

    const rNomeEnd = LM + innerW * 0.62;
    const dataRecLblX = rNomeEnd + 5;
    // Nome
    doc.setFont("helvetica", "bold");
    doc.text("Nome:", LM + CARD_PADX, cy);
    const rNomeValueX = LM + CARD_PADX + doc.getTextWidth("Nome:") + 2;
    doc.setFont("helvetica", "normal");
    doc.text(doc.splitTextToSize(respReceb, rNomeEnd - rNomeValueX)[0], rNomeValueX, cy);
    doc.setLineWidth(0.2);
    doc.line(rNomeValueX, cy + 1.5, rNomeEnd, cy + 1.5);
    // Data
    doc.setFont("helvetica", "bold");
    doc.text("Data Recebimento:", dataRecLblX, cy);
    const rDataValueX = dataRecLblX + doc.getTextWidth("Data Recebimento:") + 2;
    doc.setFont("helvetica", "normal");
    doc.text(doc.splitTextToSize(dataReceb, LM + innerW - CARD_PADX - rDataValueX)[0], rDataValueX, cy);
    doc.line(rDataValueX, cy + 1.5, LM + innerW - CARD_PADX, cy + 1.5);
    cy += 10;
    // Condições de Recebimento
    doc.setFont("helvetica", "bold");
    doc.text("Condições de Recebimento:", LM + CARD_PADX, cy);
    doc.setFont("helvetica", "normal");
    const rCondicoesLines = doc.splitTextToSize(condicoesReceb || " ", innerW - CARD_PADX * 2);
    let rCondicoesY = cy + 5;
    rCondicoesLines.forEach((line: string) => {
      if (rCondicoesY < y + recebCardH - CARD_PADY) {
        doc.text(line, LM + CARD_PADX, rCondicoesY);
        rCondicoesY += 5;
      }
    });

    // numeração final correta
    const total = doc.getNumberOfPages();
    for (let p = 1; p <= total; p++) {
      doc.setPage(p);
      drawHeader(doc, p, total);
    }
    doc.save("FOR-EC-28.0-Envio-de-Produto.pdf");
  };

  // ====== UI ======
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-lg p-6 space-y-6">
        <h1 className="text-2xl font-semibold text-center">28.0 – Envio de Produto</h1>

        {/* Origem */}
        <div className="border rounded-lg p-4 space-y-3">
          <h2 className="font-semibold">Dados de Origem</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Razão Social/Nome</Label>
              <Input value={origemNome} onChange={(e) => setOrigemNome(e.target.value)} />
            </div>
            <div>
              <Label>CNPJ/CPF</Label>
              <Input value={origemCnpj} onChange={(e) => setOrigemCnpj(e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <Label>Endereço</Label>
              <Input value={origemEndereco} onChange={(e) => setOrigemEndereco(e.target.value)} />
            </div>
            <div>
              <Label>Bairro</Label>
              <Input value={origemBairro} onChange={(e) => setOrigemBairro(e.target.value)} />
            </div>
            <div>
              <Label>CEP</Label>
              <Input value={origemCep} onChange={(e) => setOrigemCep(e.target.value)} />
            </div>
            <div>
              <Label>Cidade</Label>
              <Input value={origemCidade} onChange={(e) => setOrigemCidade(e.target.value)} />
            </div>
            <div>
              <Label>UF</Label>
              <Input value={origemUf} onChange={(e) => setOrigemUf(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Destino */}
        <div className="border rounded-lg p-4 space-y-3">
          <h2 className="font-semibold">Dados do Destino</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Local</Label>
              <Input value={destinoLocal} onChange={(e) => setDestinoLocal(e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <Label>Endereço</Label>
              <Input value={destinoEndereco} onChange={(e) => setDestinoEndereco(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="border rounded-lg p-4 space-y-3">
          <h2 className="font-semibold">Descrição do Conteúdo</h2>
          <div className="grid grid-cols-12 gap-3 font-semibold text-sm">
            <div className="col-span-6">Item</div>
            <div className="col-span-3">Lote</div>
            <div className="col-span-3">Quantidade</div>
          </div>
          {linhas.map((l, i) => (
            <div key={i} className="grid grid-cols-12 gap-3 items-center">
              <Input
                className="col-span-6"
                value={l.item}
                onChange={(e) =>
                  setLinhas((prev) => prev.map((r, idx) => (idx === i ? { ...r, item: e.target.value } : r)))
                }
              />
              <Input
                className="col-span-3"
                value={l.lote}
                onChange={(e) =>
                  setLinhas((prev) => prev.map((r, idx) => (idx === i ? { ...r, lote: e.target.value } : r)))
                }
              />
              <div className="col-span-3 flex gap-2">
                <Input
                  value={l.quantidade}
                  onChange={(e) =>
                    setLinhas((prev) => prev.map((r, idx) => (idx === i ? { ...r, quantidade: e.target.value } : r)))
                  }
                />
                {linhas.length > 1 && (
                  <Button variant="ghost" onClick={() => removeLinha(i)}>
                    Remover
                  </Button>
                )}
              </div>
            </div>
          ))}
          <Button variant="secondary" onClick={addLinha}>
            Adicionar linha
          </Button>
        </div>

        {/* Envio */}
        <div className="border rounded-lg p-4 space-y-3">
          <h2 className="font-semibold">Responsável pelo Envio</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Label>Nome</Label>
              <Input value={respEnvio} onChange={(e) => setRespEnvio(e.target.value)} />
            </div>
            <div>
              <Label>Data do Envio</Label>
              <Input value={dataEnvio} onChange={(e) => setDataEnvio(e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Condições de Envio</Label>
            <textarea
              className="w-full border rounded-md p-2 min-h-[90px]"
              value={condicoesEnvio}
              onChange={(e) => setCondicoesEnvio(e.target.value)}
            />
          </div>
        </div>

        {/* Recebimento */}
        <div className="border rounded-lg p-4 space-y-3">
          <h2 className="font-semibold">Responsável pelo Recebimento</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Label>Nome</Label>
              <Input value={respReceb} onChange={(e) => setRespReceb(e.target.value)} />
            </div>
            <div>
              <Label>Data do Recebimento</Label>
              <Input value={dataReceb} onChange={(e) => setDataReceb(e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Condições de Recebimento</Label>
            <textarea
              className="w-full border rounded-md p-2 min-h-[90px]"
              value={condicoesReceb}
              onChange={(e) => setCondicoesReceb(e.target.value)}
            />
          </div>
        </div>

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
