
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
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Protocolo from "./pages/_protocolo/_protocoloGeral/_capa/NewProtocol";
import DataPatrocinador from "./pages/_protocolo/_protocoloGeral/_capa/DataPatrocinador"
import DataInstituicao from "./pages/_protocolo/_protocoloGeral/_capa/DataInstituicao"
import LocalProtocol from "./pages/_protocolo/_protocoloGeral/_capa/LocalProtocol";
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
import VisualizacaoCompletaPDF from "./pages/_protocolo/_protocoloGeral/ProtocolFinal";
import FormularioEutanasia from "./pages/_protocolo/_protocoloGeral/_conteudo/FormularioEutanasia";
import FormularioAnexos from "./pages/_protocolo/_protocoloGeral/_conteudo/FormularioAnexos";
import FormularioBibliografia from "./pages/_protocolo/_protocoloGeral/_conteudo/FormularioBibliografia";
import EquipeExecutora from "./pages/_formulario/_protocoloEquipe/DataEquipeExecutora";
import TriagemBovino from "./pages/_formulario/_triagem/DataBovino";
import InventarioPVI from "./pages/_formulario/_inventarioPVI/DataInventarioPVI";
import PesagemAnimais from "./pages/_formulario/Pesagem";
import Randomizacao from "./pages/_formulario/Randomizacao";
import DataSelecaoAnimais from "./pages/_formulario/SelecaoAnimais";
import DataIdentificacaoAnimais from "./pages/_formulario/IdentificacaoAnimais";
import DataExameFisicoLaboratorial from "./pages/_formulario/ExameFisicoLaboratorial";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />

          // Auth
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/verificacao/email" element={<ValidarEmail />} />
          <Route path="/verificacao/sms" element={<ValidarSMS />} />
          <Route path="/qualificacao" element={<Qualificacao />} />
          <Route path="/recuperar-senha" element={<RecuperarSenha />} />
          <Route path="/nova-senha" element={<NovaSenha />} />
          <Route path="*" element={<NotFound />} />

          // Home
          <Route path="/dashboard" element={<Dashboard formData={{ name: "Caio" }} />} />

          // Protocolo Geral
          <Route path="/protocolo/criar"  element={<Protocolo />}/>
          <Route path="/protocolo/patrocinador"  element={<DataPatrocinador />}/>
          <Route path="/protocolo/instituicao"  element={<DataInstituicao />}/>
          <Route path="/protocolo/local"  element={<LocalProtocol />}/>
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

          // Formulários
          <Route path="/formulario/equipe-executora" element={<EquipeExecutora/>}/>
          <Route path="/formulario/triagem/bovino" element={<TriagemBovino/>}/>
          <Route path="/formulario/inventario/produto-veterinario" element={<InventarioPVI/>}/>
          <Route path="/formulario/pesagem" element={<PesagemAnimais/>}/>
          <Route path="/formulario/randomizacao" element={<Randomizacao/>}/>
          <Route path="/formulario/selecao-animais" element={<DataSelecaoAnimais/>}/>
          <Route path="/formulario/identificacao-animais" element={<DataIdentificacaoAnimais/>}/>
          <Route path="/formulario/exames/clinico-laboratorial" element={<DataExameFisicoLaboratorial/>}/>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
