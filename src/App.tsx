
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
import Protocolo from "./pages/protocol/NewProtocol";
import DataPatrocinador from "./pages/protocol/DataPatrocinador"
import DataInstituicao from "./pages/protocol/DataInstituicao"
import LocalProtocol from "./pages/protocol/LocalProtocol";
import ProdutoVeterinario from "./pages/protocol/ProdutoVeterinario";
import VisualizacaoCapaPDF from "./pages/protocol/CapaPDF";
import FormularioIntroducao from "./pages/protocol/FormularioIntroducao";
import FormularioObservacao from "./pages/protocol/FormularioObjetivo";
import FormularioJustificativa from "./pages/protocol/FormularioJustificativa";
import FormularioRequisitos from "./pages/protocol/FormularioRequisitos";
import FormularioMetodo from "./pages/protocol/FormularioMaterial";
import FormularioEstatistica from "./pages/protocol/FormularioEstatistica";
import FormularioSaude from "./pages/protocol/FormularioSaude";
import FormularioEventoAdverso from "./pages/protocol/FormularioEvento";
import FormularioConcomitante from "./pages/protocol/FormularioConcomitante";
import FormularioCronograma from "./pages/protocol/FormularioCronograma";
import VisualizacaoCompletaPDF from "./pages/protocol/ProtocolFinal";
import FormularioEutanasia from "./pages/protocol/FormularioEutanasia";
import FormularioAnexos from "./pages/protocol/FormularioAnexos";
import FormularioBibliografia from "./pages/protocol/FormularioBibliografia";

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
          <Route path="/protocolo"  element={<Protocolo />}/>
          <Route path="/patrocinador-cadastro"  element={<DataPatrocinador />}/>
          <Route path="/instituicao-cadastro"  element={<DataInstituicao />}/>
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
