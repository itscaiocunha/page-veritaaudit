
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/auth/Login";
import Cadastro from "./pages/auth/Cadastro";
import ValidarEmail from "./pages/auth/VerificacaoEmail";
import ValidarSMS from "./pages/auth/VerificacaoSMS";
import Qualificacao from "./pages/auth/Qualificacao";
import RecuperarSenha from "./pages/auth/Recuperar";
import NovaSenha from "./pages/auth/NovaSenha";
import Validacao from "./pages/auth/Validacao";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Protocolo from "./pages/protocol/_capa/NewProtocol";
import DataPatrocinador from "./pages/protocol/_capa/DataPatrocinador"
import DataInstituicao from "./pages/protocol/_capa/DataInstituicao"
import LocalProtocol from "./pages/protocol/_capa/LocalProtocol";
import ProdutoVeterinario from "./pages/protocol/_capa/ProdutoVeterinario";
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
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
