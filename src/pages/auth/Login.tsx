import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import ReCAPTCHA from "react-google-recaptcha";
import { mask } from "remask";

// Configuração do axios para interceptors
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('token');
      window.location.href = '/login';
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
  const [captchaVerified, setCaptchaVerified] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<FormData>({
    resolver: yupResolver(schema)
  });

  const [emailTouched, setEmailTouched] = useState(false);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!emailTouched) setEmailTouched(true);
    setValue('email', e.target.value, { shouldValidate: emailTouched });
  };

  const onSubmit = async (data: FormData) => {
    if (!captchaVerified) {
      setErrorMessage('Por favor, complete o CAPTCHA');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/auth/login', {
        ...data,
        captcha: captchaVerified
      });

      if (rememberMe) {
        localStorage.setItem('rememberedEmail', data.email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      sessionStorage.setItem('token', response.data.token);
      
      // Redirecionar com replace para evitar voltar para login
      navigate('/dashboard', { replace: true });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(error.response?.data?.message || 'E-mail ou senha incorretos');
      } else {
        setErrorMessage('Erro desconhecido');
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
          className="object-contain"
        />
      </div>

      {/* Formulário */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8">
        <div className="w-full max-w-md space-y-6">
          <h1 className="text-3xl font-semibold text-center mb-8">Login</h1>

          {errorMessage && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="relative">
              <label htmlFor="email" className="sr-only">E-mail</label>
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                className="pl-10 py-6"
                autoComplete="username"
                defaultValue={localStorage.getItem('rememberedEmail') || ''}
                {...register('email')}
                onChange={handleEmailChange}
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
                className="pr-10 py-6"
                autoComplete="current-password"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3"
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
                        
            <ReCAPTCHA
              sitekey="6LegOy8rAAAAAN0nYjp8E_Jf1tOtxAXIoG4Bsj6C"
              onChange={(token) => setCaptchaVerified(token)}
              onExpired={() => setCaptchaVerified(null)}
              size="normal"
              theme="dark"
            />

            <Button 
              type="submit"
              className="w-full bg-[#90EE90] hover:bg-[#90EE90] text-white py-6"
              disabled={loading}
            >
              {loading ? 'Carregando...' : 'Entrar'}
            </Button>

            <div className="relative">
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
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6"
            >
              Entrar com Gov.br
            </Button>

            <div className="text-center space-y-2">
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