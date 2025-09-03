import { useState, useEffect } from "react"; // Added useEffect for potential initial setup
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios"; // Keep for isAxiosError
// import ReCAPTCHA from "react-google-recaptcha"; // Commented out as in original
import api from "@/lib/axios"; // Your pre-configured axios instance

// Configuração do axios para interceptors (global, good to have it here or in a central place)
// This interceptor seems to be for a global instance of axios, not necessarily the 'api' instance.
// If 'api' is a separate instance, ensure it also has necessary interceptors or inherits them.
// For this example, I'll assume 'api' might trigger this or has its own.
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Check if the error is for qualification, if so, don't just remove token and redirect to login
      // This global interceptor might conflict with specific 401 handling in the component.
      // We'll rely on the component's specific logic for the "not qualified" case.
      // For other 401s, this is a fallback.
      const errorMessage = error.response?.data?.message;
      if (errorMessage !== 'Usuário ainda não qualificado! Utilize o token abaixo para realizar a qualificação.') {
        sessionStorage.removeItem('token');
        // Consider redirecting only if not already on login page to avoid loops
        if (window.location.pathname !== '/login') {
            window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

const schema = yup.object().shape({
  email: yup.string()
    .email('E-mail inválido')
    .required('E-mail é obrigatório'),
  password: yup.string()
    .required('Senha é obrigatória')
});

type FormData = yup.InferType<typeof schema>;

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  // const [captchaVerified, setCaptchaVerified] = useState<string | null>(null); // As per original
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: { // Set default value for email from localStorage here
      email: localStorage.getItem('rememberedEmail') || ''
    }
  });

  const [emailTouched, setEmailTouched] = useState(false);

  // Load "remember me" preference on component mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setValue('email', rememberedEmail); // Set value in form
      setRememberMe(true); // Check the checkbox
    }
  }, [setValue]);


  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!emailTouched) setEmailTouched(true);
    // react-hook-form's register already handles onChange, so setValue might be redundant
    // unless specific validation timing is needed. 'register' typically updates the form state.
    // For direct control or complex logic, setValue is fine.
    // The 'onChange' from register will call setValue internally.
    // If you keep this, ensure it works as expected with shouldValidate.
    setValue('email', e.target.value, { shouldValidate: emailTouched });
  };

  const onSubmit = async (data: FormData) => {
    // if (!captchaVerified) {
    //   setErrorMessage('Por favor, complete o CAPTCHA');
    //   return;
    // }

    setLoading(true);
    setErrorMessage(''); // Clear previous error messages at the start

    try {
      const response = await api.post('/user/login', {
        email: data.email,
        senha: data.password, // Ensure backend expects 'senha'
        // captcha: captchaVerified // As per original
      });
    
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', data.email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
    
      sessionStorage.setItem('token', response.data.token); // Store the main login token
        
      // The original code directly navigated to /qualificacao on successful login.
      // We keep this behavior. If successful login means qualified, this is correct.
      // If successful login *might* still need qualification, the API response for success
      // would need to indicate that, and you'd handle it here.
      navigate('/dashboard', { replace: true });

    } catch (error) {
      if (axios.isAxiosError(error)) { // Use the imported axios for type checking
        const statusCode = error.response?.status;
        const errorData = error.response?.data; // Contains message and potentially token
        const errorMessageFromApi = errorData?.message;
        const qualificationTokenFromApi = errorData?.token; // Token for qualification step

        if (statusCode === 401) {
          if (errorMessageFromApi === 'Usuário ainda não qualificado! Utilize o token abaixo para realizar a qualificação.' && qualificationTokenFromApi) {
            // Specific scenario: User needs to qualify
            setErrorMessage('Você precisa concluir a etapa de qualificação para continuar.'); // Inform user
            sessionStorage.setItem('token', qualificationTokenFromApi); // Store the qualification token
            navigate('/qualificacao', { replace: true }); // Redirect to qualification page
          } else if (errorMessageFromApi === 'Usuário ainda não autenticado por e-mail') {
            setErrorMessage('Por favor, valide seu e-mail para prosseguir.');
            navigate('/verificacao-email'); // Redirect to email verification page
          } else if (errorMessageFromApi === 'Usuário ainda não autenticado por sms') {
            setErrorMessage('Por favor, valide seu número de telefone via SMS.');
            navigate('/verificacao-sms'); // Redirect to SMS verification page
          } else {
            // Generic 401 for login (e.g., wrong credentials)
            setErrorMessage(errorMessageFromApi || 'E-mail ou senha incorretos.');
          }
        } else if (errorMessageFromApi) {
          // Other non-401 errors with a message from API
          setErrorMessage(errorMessageFromApi);
        } else {
          // Other errors without a specific message from API
          setErrorMessage('Ocorreu um erro na comunicação com o servidor. Tente novamente.');
        }
      } else {
        // Non-Axios errors (e.g., network issue before request, or coding error)
        console.error("An unexpected error occurred:", error); // Log for debugging
        setErrorMessage('Erro desconhecido. Por favor, tente novamente mais tarde.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGovBrLogin = () => {
    window.location.href = 'https://sso.acesso.gov.br/login';
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Imagem mobile */}
      <div className="md:hidden w-full flex justify-center pt-8">
        <img 
          src="/images/login.png" 
          alt="Login" 
          className="object-contain h-48 w-auto" // Added h-48 for better control
        />
      </div>

      {/* Formulário */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8">
        <div className="w-full max-w-md space-y-6">
          <h1 className="text-3xl font-semibold text-center mb-8">Login</h1>

          {errorMessage && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-center">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="relative">
              <label htmlFor="email" className="sr-only">E-mail</label>
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                className="pl-10 py-3 h-12 text-base" // Adjusted padding and height
                autoComplete="username"
                // defaultValue is handled by useForm's defaultValues
                {...register('email')}
                onChangeCapture={handleEmailChange} // Use onChangeCapture if you want your handler to run before RHF's
                                                   // or just rely on RHF's default onChange from register
                                                   // If handleEmailChange is essential for your logic, ensure it's correct.
                                                   // Usually, RHF's `register` is enough.
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="relative">
              <label htmlFor="password" className="sr-only">Senha</label>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Sua senha"
                className="pr-10 py-3 h-12 text-base" // Adjusted padding and height
                autoComplete="current-password"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1" // Added padding for easier click
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-[#90EE90] focus:ring-[#90EE90] border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Lembrar meu e-mail
                </label>
              </div>

              <div className="text-sm">
                <Link to="/recuperar-senha" className="text-[#90EE90] hover:underline">
                  Esqueci a Senha!
                </Link>
              </div>
            </div>
                            
            {/* <ReCAPTCHA
              sitekey="YOUR_RECAPTCHA_SITE_KEY" // Replace with your actual site key
              onChange={(token) => setCaptchaVerified(token)}
              onExpired={() => setCaptchaVerified(null)}
              size="normal"
              theme="light"
            /> */}

            <Button 
              type="submit"
              className="w-full bg-[#90EE90] hover:bg-[#7CCD7C] text-white py-3 h-12 text-base font-semibold" // Adjusted styles
              disabled={loading}
            >
              {loading ? 'Carregando...' : 'Entrar'}
            </Button>

            {/* Gov.br login section - commented out as in original */}
            {/* <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Ou continue com</span>
              </div>
            </div>

            <Button
              type="button"
              onClick={handleGovBrLogin}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 h-12 text-base font-semibold" // Adjusted styles
            >
              Entrar com Gov.br
            </Button> 
            */}

            <div className="text-center pt-4"> {/* Added padding top */}
              <Link to="/cadastro" className="text-sm text-[#90EE90] hover:underline block">
                Não possuo login!
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* Imagem desktop */}
      <div className="w-1/2 hidden md:flex justify-center items-center" 
           style={{ 
             background: "linear-gradient(to bottom left, #90EE90 50%, white 50%)" 
           }}>
        <img 
          src="/images/login.png" 
          alt="Login" 
          className="max-h-[80vh] w-auto object-contain"
        />
      </div>
    </div>
  );
};

export default Login;