
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/protocol/auth/Login";
import Cadastro from "./pages/protocol/auth/Cadastro";
import ValidarEmail from "./pages/protocol/auth/VerificacaoEmail";
import ValidarSMS from "./pages/protocol/auth/VerificacaoSMS";
import Qualificacao from "./pages/protocol/auth/Qualificacao";
import RecuperarSenha from "./pages/protocol/auth/Recuperar";
import NovaSenha from "./pages/protocol/auth/NovaSenha";
import Validacao from "./pages/protocol/auth/Validacao";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Protocolo from "./pages/protocol/_protocoloGeral/NewProtocol";
import DataPatrocinador from "./pages/protocol/_protocoloGeral/DataPatrocinador"
import DataInstituicao from "./pages/protocol/_protocoloGeral/DataInstituicao"
import LocalProtocol from "./pages/protocol/_protocoloGeral/LocalProtocol";
import ProdutoVeterinario from "./pages/protocol/_protocoloGeral/ProdutoVeterinario";
import VisualizacaoCapaPDF from "./pages/protocol/CapaPDF";
import FormularioIntroducao from "./pages/protocol/_conteudo/FormularioIntroducao";
import FormularioObservacao from "./pages/protocol/_conteudo/FormularioObjetivo";
import FormularioJustificativa from "./pages/protocol/_conteudo/FormularioJustificativa";
import FormularioRequisitos from "./pages/protocol/_conteudo/FormularioRequisitos";
import FormularioMetodo from "./pages/protocol/_conteudo/FormularioMaterial";
import FormularioEstatistica from "./pages/protocol/_conteudo/FormularioEstatistica";
import FormularioSaude from "./pages/protocol/_conteudo/FormularioSaude";
import FormularioEventoAdverso from "./pages/protocol/_conteudo/FormularioEvento";
import FormularioConcomitante from "./pages/protocol/_conteudo/FormularioConcomitante";
import FormularioCronograma from "./pages/protocol/_conteudo/FormularioCronograma";
import VisualizacaoCompletaPDF from "./pages/protocol/ProtocolFinal";
import FormularioEutanasia from "./pages/protocol/_conteudo/FormularioEutanasia";
import FormularioAnexos from "./pages/protocol/_conteudo/FormularioAnexos";
import FormularioBibliografia from "./pages/protocol/_conteudo/FormularioBibliografia";
import EquipeExecutora from "./pages/_protocoloEquipe/DataEquipeExecutora";
import TriagemBovino from "./pages/_protocolo/_triagem/DataBovino";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/verificacao-email" element={<ValidarEmail />} />
          <Route path="/verificacao-sms" element={<ValidarSMS />} />
          <Route path="/qualificacao" element={<Qualificacao />} />
          <Route path="/recuperar-senha" element={<RecuperarSenha />} />
          <Route path="/nova-senha" element={<NovaSenha />} />
          <Route path="/validacao" element={<Validacao />} />
          <Route path="*" element={<NotFound />} />

          <Route path="/dashboard" element={<Dashboard formData={{ name: "Caio" }} />} />
          <Route path="/protocolo/criar"  element={<Protocolo />}/>
          <Route path="/protocolo/patrocinador"  element={<DataPatrocinador />}/>
          <Route path="/protocolo/instituicao"  element={<DataInstituicao />}/>
          <Route path="/local-protocol"  element={<LocalProtocol />}/>
          <Route path="/produto-veterinario"  element={<ProdutoVeterinario />}/>
          <Route path="/capa/:codigoEstudo" element={<VisualizacaoCapaPDF/>}/>
          <Route path="/introducao" element={<FormularioIntroducao/>}/>
          <Route path="/objetivo" element={<FormularioObservacao/>}/>
          <Route path="/justificativa" element={<FormularioJustificativa/>}/>
          <Route path="/requisitos" element={<FormularioRequisitos/>}/>
          <Route path="/material-metodo" element={<FormularioMetodo/>}/>
          <Route path="/estatistica" element={<FormularioEstatistica/>}/>
          <Route path="/saude" element={<FormularioSaude/>}/>
          <Route path="/evento" element={<FormularioEventoAdverso/>}/>
          <Route path="/medicacao-concomitante" element={<FormularioConcomitante/>}/>
          <Route path="/eutanasia" element={<FormularioEutanasia/>}/>
          <Route path="/cronograma" element={<FormularioCronograma/>}/>
          <Route path="/anexos" element={<FormularioAnexos/>}/>
          <Route path="/bibliografia" element={<FormularioBibliografia/>}/>
          <Route path="/protocolo-final" element={<VisualizacaoCompletaPDF/>}/>

          <Route path="/protocolo/equipe-executora" element={<EquipeExecutora/>}/>

          <Route path="/protocolo/triagem/bovino" element={<TriagemBovino/>}/>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
