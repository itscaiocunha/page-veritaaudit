import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Protocolo = () => {
  const [titulo, setTitulo] = useState("");
  const [patrocinador, setPatrocinador] = useState("");
  const [tipo, setTipo] = useState("");

  const gerarCodigo = () => {
    const numPat = patrocinador.replace(/\D/g, '').padStart(2, '0').slice(0, 2);
    const sequencial = "0001";
    const ano = new Date().getFullYear().toString().slice(-2);
    return `${numPat}-${sequencial}-${ano}`;
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">

      {/* Formulário */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8">
        <div className="w-full max-w-md space-y-6">
          <h1 className="text-3xl font-semibold text-center mb-8">Novo Protocolo</h1>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="sr-only">Título do Protocolo</label>
              <Input
                type="text"
                placeholder="Título do Protocolo"
                className="py-3 h-12 text-base"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
              />
            </div>

            <div>
              <label className="sr-only">Patrocinador</label>
              <Input
                type="text"
                placeholder="Patrocinador (número)"
                className="py-3 h-12 text-base"
                value={patrocinador}
                onChange={(e) => setPatrocinador(e.target.value)}
              />
            </div>

            <div>
              <label className="sr-only">Tipo de Estudo</label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="w-full border border-gray-300 rounded-md py-3 px-4 h-12 text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="" disabled>Selecione o tipo de estudo</option>
                <option value="EC Eficácia">EC Eficácia</option>
                <option value="EC Segurança">EC Segurança</option>
                <option value="EC Resíduo">EC Resíduo</option>
              </select>
            </div>

            <Button 
              type="submit"
              className="w-full bg-[#90EE90] hover:bg-[#7CCD7C] text-white py-3 h-12 text-base font-semibold"
            >
              Criar Protocolo
            </Button>
          </form>
        </div>
      </div>

      {/* Emulador da capa do protocolo */}
      <div className="w-full md:w-1/2 flex items-center justify-center overflow-hidden">
        <div
          className="bg-white shadow-md px-12 py-16 flex flex-col justify-between"
          style={{
            width: 'calc((100vh - 40px) * 0.707)',
            height: 'calc(100vh - 40px)',
            overflow: 'hidden',
          }}
        >
          {/* Topo - Instituição */}
          <div className="text-center text-base leading-6">
            <p className="text-sm">{patrocinador || "Não informado"}</p>
            <p>Verita Audit</p>
          </div>

          {/* Centro - Título */}
          <div className="flex flex-col items-center justify-center flex-grow text-center">
            <h1 className="text-xl font-bold uppercase">{titulo || "Título do Protocolo"}</h1>
            <p className="mt-4 text-base italic">{tipo || "Tipo de Estudo"}</p>
            <p className="mt-8 text-sm">Código: {gerarCodigo()}</p>
          </div>

          {/* Rodapé - Local e ano */}
          <div className="text-center text-base">
            <p>São Paulo</p>
            <p>{new Date().getFullYear()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Protocolo;
