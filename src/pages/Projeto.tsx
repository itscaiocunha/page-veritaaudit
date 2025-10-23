import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface ProtocoloVersao {
  id: number;
  ativo: boolean;
  dataCriacao: string;
  titulo: string;
}

const formatarData = (isoDate: string) => {
  if (!isoDate) return "Data desconhecida";
  try {
    const [ano, mes, dia] = isoDate.split("-");
    return `${dia}/${mes}/${ano}`;
  } catch (e) {
    console.error("Erro ao formatar data:", isoDate, e);
    return isoDate;
  }
};

const VersaoCard: React.FC<{ versao: ProtocoloVersao; onClick: () => void }> = ({
  versao,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow border border-gray-200 flex flex-col overflow-hidden cursor-pointer"
      role="button"
      aria-label={`Abrir versão ${versao.titulo}`}
    >
      <div className="p-4 flex-grow">
        <h3 className="font-bold text-lg text-gray-800 truncate" title={versao.titulo}>
          {versao.titulo}
        </h3>
        <p className="text-sm text-gray-600 mt-2">
          <strong>ID da Versão:</strong> {versao.id}
        </p>
        <p className="text-sm text-gray-500">
          <strong>Criação:</strong> {formatarData(versao.dataCriacao)}
        </p>
        <p className={`text-sm font-bold mt-2 ${versao.ativo ? "text-green-600" : "text-gray-500"}`}>
          {versao.ativo ? "● Ativo" : "○ Inativo"}
        </p>
      </div>
    </div>
  );
};

const ProjetoPage: React.FC = () => {
  const { id: protocoloMestreId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [versao, setVersao] = useState<ProtocoloVersao | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!protocoloMestreId) {
      setError("ID do protocolo não encontrado.");
      setIsLoading(false);
      return;
    }

    const fetchVersaoAtiva = async () => {
      setIsLoading(true);
      setError(null);

      const apiKey =
        "2NtzCUDl8Ib2arnDRck0xK8taguGeFYuZqnUzpiZ9Wp-tUZ45--/i=tKxzwTPBvtykMSx!0t?7c/Z?NllkokY=TEC2DSonmOMUu0gxdCeh70/rA2NSsm7Ohjn7VM2BeP";
      let TOKEN = sessionStorage.getItem("token");

      if (!TOKEN) {
        setError("Usuário não autenticado.");
        setIsLoading(false);
        navigate("/login");
        return;
      }
      TOKEN = TOKEN.replace(/"/g, '');

      const API_URL = `https://verita-brgchubha6ceathm.brazilsouth-01.azurewebsites.net/api/protocolo/versao/ativo/${protocoloMestreId}`;

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
          if (response.status === 401 || response.status === 403) {
            setError("Sessão expirada. Faça o login novamente.");
            navigate("/login");
          } else if (response.status === 404) {
             setError("Nenhuma versão ativa encontrada para este protocolo.");
          } else {
            const errorData = await response.text();
            throw new Error(`Erro ${response.status}: ${errorData}`);
          }
          throw new Error(`Erro ${response.status}`);
        }

        const data: ProtocoloVersao = await response.json();
        setVersao(data);

      } catch (err) {
        console.error("Erro ao carregar versão do protocolo:", err);
        if (err instanceof Error && !error) {
          setError(err.message);
        } else if (!error) {
          setError("Ocorreu um erro desconhecido.");
        }
        setVersao(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVersaoAtiva();
  }, [protocoloMestreId, navigate]);

  return (
    <div className="flex-1 h-screen overflow-y-auto p-4 lg:p-8 bg-gray-50">
      <header className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 p-2 rounded-md bg-white shadow-sm"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Voltar ao Dashboard</span>
        </button>
      </header>
      
      <main className="space-y-6">
        <h3 className="text-2xl font-bold text-gray-700">
          {isLoading 
            ? "Carregando protocolo..." 
            : versao 
            ? versao.titulo 
            : `Protocolo (ID Mestre: ${protocoloMestreId})`}
        </h3>
        

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading ? (
            <div className="col-span-full text-center text-gray-500 py-12">
              Carregando versão...
            </div>
          ) : error ? (
            <div className="col-span-full text-center text-red-500 py-12">
              {error}
            </div>
          ) : versao ? (
            <VersaoCard 
              key={versao.id} 
              versao={versao} 
              onClick={() => navigate(`/introducao/${protocoloMestreId}`)} 
            />
          ) : (
             <div className="col-span-full text-center text-gray-500 py-12">
               Nenhuma versão encontrada.
             </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProjetoPage;
