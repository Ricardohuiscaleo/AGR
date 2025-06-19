import React, { useState, useEffect } from 'react';
import {
  signInWithEmail,
  signInWithGoogle,
  getCurrentUser,
  supabaseBrowserClient,
} from '../../lib/supabase';
import { DataValidator } from '../../lib/n8nClient';

interface LoginFormProps {
  onLogin?: (userData: { email: string; password: string }) => void;
  onForgotPassword?: () => void;
  onSignUp?: () => void;
}

// Variable para verificar si estamos en el navegador, segura para SSR
const isBrowser = typeof window !== 'undefined';

export function Login({ onLogin, onForgotPassword, onSignUp }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState<any>(null);

  // Verificar si ya hay una sesión activa al cargar el componente
  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log('Login: Verificando si ya existe una sesión...');

        // Primero verificamos si hay una sesión
        const { data: sessionData } = await supabaseBrowserClient.auth.getSession();

        if (sessionData?.session) {
          console.log('Login: Sesión existente encontrada, redirigiendo...');
          // Si hay una sesión, redirigir al dashboard
          window.location.href = '/dashboard';
          return;
        }

        // Si no hay sesión, verificamos si hay un usuario
        const { user } = await getCurrentUser();
        if (user) {
          console.log(
            'Login: Usuario autenticado sin sesión activa, intentando establecer sesión...'
          );

          // Intentar refrescar la sesión
          const { data: refreshData, error: refreshError } =
            await supabaseBrowserClient.auth.refreshSession();

          if (refreshData?.session) {
            console.log('Login: Sesión refrescada correctamente, redirigiendo...');
            window.location.href = '/dashboard';
          } else if (refreshError) {
            console.warn('Login: Error al refrescar sesión:', refreshError.message);
            // No mostramos el error al usuario, solo continuamos con el formulario de login
          }
        } else {
          console.log('Login: No hay usuario autenticado, mostrando formulario');
        }

        // Verificar disponibilidad de almacenamiento
        checkStorageAvailability();
      } catch (err) {
        console.error('Login: Error verificando sesión:', err);
      }
    };

    // Solo ejecutar en el navegador
    if (isBrowser) {
      checkSession();
    }
  }, []);

  // Función para verificar disponibilidad de almacenamiento
  const checkStorageAvailability = () => {
    if (!isBrowser) return false;

    try {
      const testKey = 'test_storage';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      console.error('Login: No se puede acceder a localStorage:', e);
      setDebugInfo((prev) => ({ ...prev, localStorageAvailable: false, error: e.message }));
      setError(
        'Advertencia: El almacenamiento local no está disponible. La autenticación puede fallar.'
      );
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Validar formato de email
      if (!DataValidator.validateEmail(email)) {
        setError('Por favor ingresa un correo electrónico válido');
        setIsLoading(false);
        return;
      }

      // Validar seguridad de contraseña
      if (password.length < 8) {
        setError('La contraseña debe tener al menos 8 caracteres');
        setIsLoading(false);
        return;
      }

      console.log('Login: Iniciando proceso de autenticación con email...');

      // Autenticación con Supabase
      const { data, error: loginError } = await signInWithEmail(email, password);

      if (loginError) {
        console.error('Login: Error de autenticación:', loginError.message);

        // Mensajes de error más específicos pero seguros
        if (loginError.message.includes('credentials')) {
          setError('Credenciales incorrectas. Por favor verifica tu email y contraseña.');
        } else if (loginError.message.includes('rate limit')) {
          setError('Demasiados intentos fallidos. Intenta nuevamente después de unos minutos.');
        } else {
          setError('Error de autenticación: ' + loginError.message);
        }

        setIsLoading(false);
        return;
      }

      // Verificar si tenemos una sesión después del login
      if (data?.session) {
        console.log('Login: Autenticación exitosa, redirigiendo...');

        // Almacenar un indicador de que el login se completó correctamente
        if (isBrowser) {
          localStorage.setItem('auth_completed', 'true');
        }

        if (onLogin) {
          onLogin({ email, password });
        }

        // Corto retraso para asegurar que el token se guarde correctamente
        setTimeout(() => {
          // Redirección al dashboard con un parámetro para indicar que venimos de autenticación
          if (isBrowser) {
            window.location.href = '/dashboard?auth=success';
          }
        }, 500);
      } else {
        console.error('Login: Autenticación completada pero no se recibió sesión');
        setError('Error al establecer la sesión. Por favor intenta nuevamente.');
        setIsLoading(false);
      }
    } catch (err) {
      // Log error interno pero mostrar mensaje genérico al usuario
      console.error('Login: Error inesperado:', err);
      setError('Error en el servicio de autenticación. Intenta nuevamente más tarde.');
      setIsLoading(false);
    }
  };

  // Función mejorada para manejar login con Google
  const handleGoogleLogin = async () => {
    setError('');
    setIsLoading(true);

    try {
      // Primero verificamos el localStorage para asegurar que funcionará
      if (!isBrowser || !checkStorageAvailability()) {
        setError('No se puede acceder al almacenamiento local necesario para la autenticación.');
        setIsLoading(false);
        return;
      }

      console.log('Login: Iniciando autenticación con Google...');

      // Guardar un indicador en sessionStorage para verificar si el proceso se completa
      sessionStorage.setItem('auth_processing', 'google');

      const { data, error } = await signInWithGoogle();

      if (error) {
        console.error('Login: Error en autenticación con Google:', error);
        setError('Error al conectar con Google: ' + error.message);
        sessionStorage.removeItem('auth_processing');
        setIsLoading(false);
        return;
      }

      // signInWithGoogle realiza la redirección automáticamente
      console.log('Login: Redirigiendo a Google OAuth...');

      // No establecemos isLoading a false porque la página se redirigirá
    } catch (err) {
      console.error('Login: Error inesperado en Google auth:', err);
      setError(
        'Error al conectar con el servicio de autenticación: ' +
          (err instanceof Error ? err.message : String(err))
      );
      if (isBrowser) {
        sessionStorage.removeItem('auth_processing');
      }
      setIsLoading(false);
    }
  };

  // Mostrar información de depuración para diagnosticar problemas (solo visible durante desarrollo)
  const isDevelopment = isBrowser && window.location.hostname === 'localhost';

  return (
    <div className="login-form-container w-full max-w-md mx-auto bg-black/40 backdrop-blur-md rounded-xl border border-violet-500/20 p-8 shadow-lg shadow-violet-500/10">
      <div className="mb-6 text-center">
        <img
          src="/compressed/logo-oscuro-optimizado.png"
          alt="Logo AR"
          className="h-12 mx-auto mb-4"
        />
        <h2 className="text-2xl font-bold text-white mb-2">Iniciar Sesión</h2>
        <p className="text-violet-200 text-sm">Accede a tu cuenta para administrar tu Agente RAG</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm">
          {error}
        </div>
      )}

      <button
        onClick={handleGoogleLogin}
        disabled={isLoading}
        className="w-full py-3 px-4 mb-6 rounded-lg bg-white text-gray-800 font-medium flex items-center justify-center gap-3 hover:bg-gray-100 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.24 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        {isLoading ? 'Conectando...' : 'Continuar con Google'}
      </button>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-violet-500/20"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-black/20 text-violet-300">O con tu correo</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-violet-200">
            Correo Electrónico
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 bg-black/50 border border-violet-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-white placeholder-violet-300/50"
            placeholder="tu@email.com"
            required
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium text-violet-200">
              Contraseña
            </label>
            <button
              type="button"
              onClick={onForgotPassword}
              disabled={isLoading}
              className="text-xs text-violet-300 hover:text-violet-100 transition-colors disabled:opacity-70"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 bg-black/50 border border-violet-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-white placeholder-violet-300/50"
            placeholder="••••••••"
            required
            disabled={isLoading}
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-4 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium transition-all ${
              isLoading
                ? 'opacity-70 cursor-not-allowed'
                : 'hover:from-violet-500 hover:to-indigo-500 hover:shadow-lg hover:shadow-violet-500/20'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Procesando...
              </span>
            ) : (
              'Iniciar Sesión'
            )}
          </button>
        </div>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-violet-200">
          ¿No tienes una cuenta?{' '}
          <button
            onClick={onSignUp}
            disabled={isLoading}
            className="text-violet-400 hover:text-white font-medium transition-colors disabled:opacity-70"
          >
            Registrate ahora
          </button>
        </p>
      </div>

      {/* Panel de debug solo visible en desarrollo */}
      {isBrowser && isDevelopment && debugInfo && (
        <div className="mt-8 pt-4 border-t border-violet-500/20">
          <details className="text-xs text-violet-300">
            <summary className="cursor-pointer hover:text-violet-100">
              Información de depuración
            </summary>
            <pre className="mt-2 p-2 bg-black/50 rounded-lg overflow-x-auto text-violet-200">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}

export default Login;
