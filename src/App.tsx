import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages - Geral
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import ProjetoPage from "./pages/Projeto";

// Pages - Auth
import Login from "./pages/auth/Login";
import Cadastro from "./pages/auth/Cadastro";
import ValidarEmail from "./pages/auth/VerificacaoEmail";
import ValidarSMS from "./pages/auth/VerificacaoSMS";
import Qualificacao from "./pages/auth/Qualificacao";
import RecuperarSenha from "./pages/auth/Recuperar";
import NovaSenha from "./pages/auth/NovaSenha";

// Protocolo - Capa
import Protocolo from "./pages/_protocolo/_protocoloGeral/_capa/NewProtocol";
import DataPatrocinador from "./pages/_protocolo/_protocoloGeral/_capa/DataPatrocinador";
import DataInstituicao from "./pages/_protocolo/_protocoloGeral/_capa/DataInstituicao";
import LocalProtocol from "./pages/_protocolo/_protocoloGeral/_capa/LocalProtocol";

// Protocolo - Conteúdo
import FormularioIntroducao from "./pages/_protocolo/_protocoloGeral/_conteudo/FormularioIntroducao";
import FormularioObservacao from "./pages/_protocolo/_protocoloGeral/_conteudo/FormularioObjetivo";
import FormularioJustificativa from "./pages/_protocolo/_protocoloGeral/_conteudo/FormularioJustificativa";
import FormularioRequisitos from "./pages/_protocolo/_protocoloGeral/_conteudo/FormularioRequisitos";
import FormularioMetodo from "./pages/_protocolo/_protocoloGeral/_conteudo/FormularioMaterial";
import FormularioEstatistica from "./pages/_protocolo/_protocoloGeral/_conteudo/FormularioEstatistica";
import FormularioSaude from "./pages/_protocolo/_protocoloGeral/_conteudo/FormularioSaude";
import FormularioEventoAdverso from "./pages/_protocolo/_protocoloGeral/_conteudo/FormularioEvento";
import FormularioConcomitante from "./pages/_protocolo/_protocoloGeral/_conteudo/FormularioConcomitante";
import FormularioCronograma from "./pages/_protocolo/_protocoloGeral/_conteudo/FormularioCronograma";
import FormularioEutanasia from "./pages/_protocolo/_protocoloGeral/_conteudo/FormularioEutanasia";
import FormularioAnexos from "./pages/_protocolo/_protocoloGeral/_conteudo/FormularioAnexos";
import FormularioBibliografia from "./pages/_protocolo/_protocoloGeral/_conteudo/FormularioBibliografia";
import VisualizacaoCompletaPDF from "./pages/_protocolo/_protocoloGeral/ProtocolFinal";

// Formulários Específicos
import EquipeExecutora from "./pages/_formulario/DataEquipeExecutora";
import LocalEtapaClinica from "./pages/_formulario/LocalEtapaClinica";
import InventarioPVI from "./pages/_formulario/DataInventarioPVI";
import PesagemAnimais from "./pages/_formulario/Pesagem";
import DataExameFisicoLaboratorial from "./pages/_formulario/ExameFisicoLaboratorial";
import DataIdentificacaoAnimais from "./pages/_formulario/IdentificacaoAnimais";
import DataSelecaoAnimais from "./pages/_formulario/SelecaoAnimais";
import Randomizacao from "./pages/_formulario/Randomizacao";
import Tratamento from "./pages/_formulario/Tratamento";
import DataObservacaoSaude from "./pages/_formulario/ObservacaoGerais";
import EventoAdverso from "./pages/_formulario/EventoAdverso";
import FinalizacaoParticipacao from "./pages/_formulario/ParticipacaoPesquisa";
import Necropsia from "./pages/_formulario/Necropsia";
import DestinoCarcaca from "./pages/_formulario/DestinoCarcaça";
import ColheitaSangue from "./pages/_formulario/ColheitaSangue";
import ColheitaSangueSeriada from "./pages/_formulario/SangueSeriado";
import ColheitaMatriz from "./pages/_formulario/ColheiraMatriz"; 
import ColheitaAmostraLeite from "./pages/_formulario/ColheitaAmostraLeite";
import EscoreCondicaoCorporal from "./pages/_formulario/CondicaoCorporal";
import NotasAoEstudo from "./pages/_formulario/NotasEstudo";
import EnvioProduto from "./pages/_formulario/EnvioProduto";
import RastreamentoDocumentos from "./pages/_formulario/RastreamentoDocumento";
import TriagemBovino from "./pages/_formulario/DataBovino";
import FormularioRecebimentoCustodia from "./pages/_formulario/RecebimentoCustodia";
import DestinacaoPVI from "./pages/_formulario/DestinacaoPVI";

// // ! IMPORTANTE: Crie estes componentes ou ajuste o caminho se já existirem
// import RelatorioTecnicoVeterinario from "./pages/_formulario/RelatorioTecnicoVeterinario"; 
// import ProdutividadeVacas from "./pages/_formulario/ProdutividadeVacas";
// import AvaliacaoLocalAplicacao from "./pages/_formulario/AvaliacaoLocalAplicacao";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />

          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/verificacao/email" element={<ValidarEmail />} />
          <Route path="/verificacao/sms" element={<ValidarSMS />} />
          <Route path="/qualificacao" element={<Qualificacao />} />
          <Route path="/recuperar-senha" element={<RecuperarSenha />} />
          <Route path="/nova-senha" element={<NovaSenha />} />
          <Route path="*" element={<NotFound />} />

          {/* Home */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projeto/:id" element={<ProjetoPage/>} />

          {/* Protocolo Geral */}
          <Route path="/protocolo/criar"  element={<Protocolo />}/>
          <Route path="/protocolo/patrocinador"  element={<DataPatrocinador />}/>
          <Route path="/protocolo/instituicao"  element={<DataInstituicao />}/>
          <Route path="/protocolo/local"  element={<LocalProtocol />}/>
          
          <Route path="/introducao/:id" element={<FormularioIntroducao/>}/> {/* 2 */}
          <Route path="/objetivo/:id" element={<FormularioObservacao/>}/> {/* 3 */}
          <Route path="/justificativa/:id" element={<FormularioJustificativa/>}/> {/* 4 */}
          <Route path="/requisitos/:id" element={<FormularioRequisitos/>}/> {/* 5 */}
          <Route path="/material-metodo/:id" element={<FormularioMetodo/>}/> {/* 6 */}
          <Route path="/estatistica/:id" element={<FormularioEstatistica/>}/> {/* 7 */}
          <Route path="/saude/:id" element={<FormularioSaude/>}/> {/* 8 */}
          <Route path="/evento/:id" element={<FormularioEventoAdverso/>}/> {/* 9 */}
          <Route path="/medicacao-concomitante/:id" element={<FormularioConcomitante/>}/> {/* 10 */}
          <Route path="/eutanasia/:id" element={<FormularioEutanasia/>}/> {/* 11 */}
          <Route path="/cronograma/:id" element={<FormularioCronograma/>}/> {/* 12 */}
          <Route path="/anexos/:id" element={<FormularioAnexos/>}/> {/* 13 */}
          <Route path="/bibliografia/:id" element={<FormularioBibliografia/>}/> {/* 14 */}
          <Route path="/protocolo-final/:id" element={<VisualizacaoCompletaPDF/>}/>

          {/* Formulários */}
          <Route path="/formulario/equipe-treinamento" element={<EquipeExecutora/>}/>
          <Route path="/formulario/local-etapa-clinica" element={<LocalEtapaClinica />} />
          <Route path="/formulario/inventario-produto-veterinario" element={<InventarioPVI/>}/>
          <Route path="/formulario/pesagem-animais" element={<PesagemAnimais/>}/>
          <Route path="/formulario/exame-fisico-laboratorial" element={<DataExameFisicoLaboratorial/>}/>
          <Route path="/formulario/identificacao-animais" element={<DataIdentificacaoAnimais/>}/>
          <Route path="/formulario/selecao-animais" element={<DataSelecaoAnimais/>}/>
          <Route path="/formulario/randomizacao" element={<Randomizacao/>}/>
          <Route path="/formulario/tratamento" element={<Tratamento/>}/>
          <Route path="/formulario/observacoes-saude" element={<DataObservacaoSaude/>}/>
          {/* <Route path="/formulario/relatorio-veterinario" element={<RelatorioTecnicoVeterinario/>}/> */}
          <Route path="/formulario/evento-adverso" element={<EventoAdverso />} />
          <Route path="/formulario/finalizacao-pesquisa" element={<FinalizacaoParticipacao/>}/>
          <Route path="/formulario/necropsia" element={<Necropsia/>}/>
          <Route path="/formulario/destino-carcaca" element={<DestinoCarcaca/>}/>
          <Route path="/formulario/colheita-sangue" element={<ColheitaSangue/>}/>
          <Route path="/formulario/colheita-sangue-seriada" element={<ColheitaSangueSeriada/>}/>
          <Route path="/formulario/colheita-tecido" element={<ColheitaMatriz/>}/>
          <Route path="/formulario/colheita-leite" element={<ColheitaAmostraLeite/>}/>
          {/* <Route path="/formulario/produtividade-vacas" element={<ProdutividadeVacas/>}/> */}
          <Route path="/formulario/escore-corporal" element={<EscoreCondicaoCorporal/>}/>
          <Route path="/formulario/notas-estudo" element={<NotasAoEstudo/>}/>
          <Route path="/formulario/envio-produto" element={<EnvioProduto/>}/>
          <Route path="/formulario/rastreamento-documentos" element={<RastreamentoDocumentos />} />
          {/* <Route path="/formulario/avaliacao-local-aplicacao" element={<AvaliacaoLocalAplicacao/>}/> */}
          <Route path="/formulario/triagem-bovinos" element={<TriagemBovino/>}/>
          <Route path="/formulario/recebimento-custodia" element={<FormularioRecebimentoCustodia/>}/>
          <Route path="/formulario/destinacao-desacordo-inutilizado" element={<DestinacaoPVI />} />
          {/* <Route path="/formulario/tcle" element={<TCLE />} />  */}
          {/* <Route path="/formulario/tale" element={<TALE />} /> */}

        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;