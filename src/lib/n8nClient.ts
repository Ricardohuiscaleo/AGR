import { supabase } from './supabase';

// Configuración para la API de n8n
const N8N_API_URL = import.meta.env.PUBLIC_N8N_API_URL || 'http://localhost:5678';
const N8N_API_KEY = import.meta.env.N8N_API_KEY; // Esta variable debe ser privada en el servidor

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  requireAuth?: boolean;
  webhook?: boolean;
}

/**
 * Cliente para comunicación segura con n8n
 * Maneja autenticación, errores y validación
 */
export const n8nClient = {
  /**
   * Realiza una petición a n8n con el token de autenticación
   */
  async request<T = any>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const { method = 'GET', body, requireAuth = true, webhook = false } = options;

    // Construir la URL según el tipo de endpoint
    const url = webhook
      ? `${N8N_API_URL}/webhook/${endpoint}`
      : `${N8N_API_URL}/api/v1/${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    // Si requiere autenticación, obtener la sesión actual y añadir el token
    if (requireAuth) {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;

      if (!token) {
        throw new Error('No autorizado: Se requiere iniciar sesión');
      }

      headers['Authorization'] = `Bearer ${token}`;
    }

    // Si es una petición a la API interna de n8n, usar la API key
    if (!webhook && N8N_API_KEY) {
      headers['X-N8N-API-KEY'] = N8N_API_KEY;
    }

    // Configuración de la petición
    const config: RequestInit = {
      method,
      headers,
      credentials: 'include',
    };

    // Añadir body si es necesario
    if (body && (method === 'POST' || method === 'PUT')) {
      config.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, config);

      // Manejar errores HTTP
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Error ${response.status}: ${response.statusText}`);
      }

      // Para respuestas sin contenido
      if (response.status === 204) {
        return {} as T;
      }

      // Parsear la respuesta como JSON
      return await response.json();
    } catch (error) {
      console.error('Error en comunicación con n8n:', error);
      throw error;
    }
  },

  /**
   * Métodos para diferentes tipos de peticiones
   */
  get<T = any>(endpoint: string, options: Omit<ApiOptions, 'method' | 'body'> = {}): Promise<T> {
    return this.request(endpoint, { ...options, method: 'GET' }) as Promise<T>;
  },

  post<T = any>(endpoint: string, body: any, options: Omit<ApiOptions, 'method'> = {}): Promise<T> {
    return this.request(endpoint, { ...options, method: 'POST', body }) as Promise<T>;
  },

  put<T = any>(endpoint: string, body: any, options: Omit<ApiOptions, 'method'> = {}): Promise<T> {
    return this.request(endpoint, { ...options, method: 'PUT', body }) as Promise<T>;
  },

  delete<T = any>(endpoint: string, options: Omit<ApiOptions, 'method'> = {}): Promise<T> {
    return this.request(endpoint, { ...options, method: 'DELETE' }) as Promise<T>;
  },

  /**
   * Envía una petición al webhook de n8n
   */
  webhook<T = any>(webhookPath: string, data: any): Promise<T> {
    return this.post(webhookPath, data, { webhook: true }) as Promise<T>;
  },
};

/**
 * Validador avanzado de emails con múltiples verificaciones
 */
export class EmailValidator {
  // Lista de dominios de emails desechables/temporales más comunes
  private static disposableEmailDomains = [
    '10minutemail.com',
    'guerrillamail.com',
    'mailinator.com',
    'tempmail.org',
    'yopmail.com',
    'throwaway.email',
    'maildrop.cc',
    '33mail.com',
    'emailondeck.com',
    'getnada.com',
    'temp-mail.org',
    'mohmal.com',
    'sharklasers.com',
    'grr.la',
    'guerrillamailblock.com',
    'pokemail.net',
    'spam4.me',
    'bccto.me',
    'chacuo.net',
    'deadaddress.com',
  ];

  // Regex más estricta basada en RFC 5322
  private static emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  /**
   * Validación completa de email
   */
  static validateEmail(email: string): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!email || email.trim().length === 0) {
      errors.push('El email es requerido');
      return { isValid: false, errors, warnings };
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Validación de formato básico
    if (!this.emailRegex.test(trimmedEmail)) {
      errors.push('El formato del email no es válido');
    }

    // Validación de longitud
    if (trimmedEmail.length > 254) {
      errors.push('El email es demasiado largo (máximo 254 caracteres)');
    }

    // Verificar parte local (antes del @)
    const [localPart, domain] = trimmedEmail.split('@');

    if (localPart && localPart.length > 64) {
      errors.push('La parte local del email es demasiado larga');
    }

    // Verificar dominio
    if (domain) {
      if (this.disposableEmailDomains.includes(domain)) {
        warnings.push('Los emails temporales no son recomendados para reservas');
      }

      // Verificar dominios sospechosos
      if (domain.includes('..') || domain.startsWith('.') || domain.endsWith('.')) {
        errors.push('El dominio del email contiene caracteres inválidos');
      }

      // Verificar TLD mínimo
      const parts = domain.split('.');
      if (parts.length < 2 || parts[parts.length - 1].length < 2) {
        errors.push('El dominio debe tener una extensión válida');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validación rápida (solo formato)
   */
  static isValidFormat(email: string): boolean {
    return this.emailRegex.test(email.trim().toLowerCase());
  }

  /**
   * Normalizar email (lowercase, trim)
   */
  static normalize(email: string): string {
    return email.trim().toLowerCase();
  }

  /**
   * Extraer dominio del email
   */
  static getDomain(email: string): string {
    const [, domain] = email.split('@');
    return domain || '';
  }

  /**
   * Verificar si es un dominio popular/confiable
   */
  static isPopularDomain(email: string): boolean {
    const domain = this.getDomain(email.toLowerCase());
    const popularDomains = [
      'gmail.com',
      'outlook.com',
      'hotmail.com',
      'yahoo.com',
      'icloud.com',
      'live.com',
      'msn.com',
      'aol.com',
      'empresa.cl',
      'uc.cl',
      'usach.cl',
      'udp.cl',
      'uai.cl',
    ];
    return popularDomains.includes(domain);
  }
}

// Definición de esquema para validación
interface ValidationRule {
  type: string;
  required?: boolean;
  validate?: (value: any) => boolean;
}

/**
 * Clase para validar datos de entrada
 * Previene inyecciones y asegura la integridad de los datos
 */
export class DataValidator {
  static validateEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  static sanitizeHTML(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  static validateObject<T extends object>(
    data: any,
    schema: Record<keyof T, ValidationRule>
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Verificar que sea un objeto
    if (!data || typeof data !== 'object') {
      return { valid: false, errors: ['Se esperaba un objeto'] };
    }

    // Validar cada campo según el schema
    Object.entries(schema).forEach(([key, rule]) => {
      const rules = rule as ValidationRule;
      const value = data[key];

      // Verificar si es requerido
      if (rules.required && (value === undefined || value === null)) {
        errors.push(`El campo "${key}" es requerido`);
        return;
      }

      // Si tiene valor, validar el tipo
      if (value !== undefined && value !== null) {
        // Verificar tipo
        if (typeof value !== rules.type) {
          errors.push(`El campo "${key}" debe ser de tipo ${rules.type}`);
        }

        // Ejecutar validación personalizada si existe
        if (rules.validate && !rules.validate(value)) {
          errors.push(`El campo "${key}" no cumple con los requisitos de validación`);
        }
      }
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

/**
 * Validador avanzado de números de teléfono por país
 */
export class PhoneValidator {
  // Patrones de validación por país
  private static phonePatterns = {
    CL: {
      // Chile
      pattern: /^9[0-9]{8}$/,
      minLength: 9,
      maxLength: 9,
      description: '9 seguido de 8 dígitos (ej: 987654321)',
      example: '987654321',
    },
    AR: {
      // Argentina
      pattern: /^[0-9]{10,11}$/,
      minLength: 10,
      maxLength: 11,
      description: '10-11 dígitos (ej: 1123456789)',
      example: '1123456789',
    },
    BR: {
      // Brasil
      pattern: /^[0-9]{10,11}$/,
      minLength: 10,
      maxLength: 11,
      description: '10-11 dígitos (ej: 11987654321)',
      example: '11987654321',
    },
    CO: {
      // Colombia
      pattern: /^3[0-9]{9}$/,
      minLength: 10,
      maxLength: 10,
      description: '3 seguido de 9 dígitos (ej: 3123456789)',
      example: '3123456789',
    },
    PE: {
      // Perú
      pattern: /^9[0-9]{8}$/,
      minLength: 9,
      maxLength: 9,
      description: '9 seguido de 8 dígitos (ej: 987654321)',
      example: '987654321',
    },
    UY: {
      // Uruguay
      pattern: /^9[0-9]{7}$/,
      minLength: 8,
      maxLength: 8,
      description: '9 seguido de 7 dígitos (ej: 98765432)',
      example: '98765432',
    },
    PY: {
      // Paraguay
      pattern: /^9[0-9]{8}$/,
      minLength: 9,
      maxLength: 9,
      description: '9 seguido de 8 dígitos (ej: 987654321)',
      example: '987654321',
    },
    EC: {
      // Ecuador
      pattern: /^[0-9]{9}$/,
      minLength: 9,
      maxLength: 9,
      description: '9 dígitos (ej: 987654321)',
      example: '987654321',
    },
    BO: {
      // Bolivia
      pattern: /^[67][0-9]{7}$/,
      minLength: 8,
      maxLength: 8,
      description: '6 o 7 seguido de 7 dígitos (ej: 71234567)',
      example: '71234567',
    },
    VE: {
      // Venezuela
      pattern: /^4[0-9]{9}$/,
      minLength: 10,
      maxLength: 10,
      description: '4 seguido de 9 dígitos (ej: 4123456789)',
      example: '4123456789',
    },
    US: {
      // Estados Unidos
      pattern: /^[0-9]{10}$/,
      minLength: 10,
      maxLength: 10,
      description: '10 dígitos (ej: 2025551234)',
      example: '2025551234',
    },
    ES: {
      // España
      pattern: /^[67][0-9]{8}$/,
      minLength: 9,
      maxLength: 9,
      description: '6 o 7 seguido de 8 dígitos (ej: 612345678)',
      example: '612345678',
    },
    MX: {
      // México
      pattern: /^[0-9]{10}$/,
      minLength: 10,
      maxLength: 10,
      description: '10 dígitos (ej: 5512345678)',
      example: '5512345678',
    },
  };

  /**
   * Validar número de teléfono según el país
   */
  static validatePhone(
    phone: string,
    countryCode: string
  ): {
    isValid: boolean;
    errors: string[];
    suggestions: string[];
  } {
    const errors: string[] = [];
    const suggestions: string[] = [];

    if (!phone || phone.trim().length === 0) {
      errors.push('El número de teléfono es requerido');
      return { isValid: false, errors, suggestions };
    }

    // Limpiar el número (solo dígitos)
    const cleanPhone = phone.replace(/[^0-9]/g, '');

    if (cleanPhone.length === 0) {
      errors.push('Ingresa solo números en el teléfono');
      return { isValid: false, errors, suggestions };
    }

    const pattern = this.phonePatterns[countryCode];
    if (!pattern) {
      // País no soportado, validación básica
      if (cleanPhone.length < 7 || cleanPhone.length > 15) {
        errors.push('El número debe tener entre 7 y 15 dígitos');
      }
      return { isValid: errors.length === 0, errors, suggestions };
    }

    // Validación específica por país
    if (cleanPhone.length < pattern.minLength) {
      errors.push(`El número es muy corto. Debe tener ${pattern.minLength} dígitos`);
      suggestions.push(`Ejemplo para ${this.getCountryName(countryCode)}: ${pattern.example}`);
    } else if (cleanPhone.length > pattern.maxLength) {
      errors.push(`El número es muy largo. Debe tener ${pattern.maxLength} dígitos`);
      suggestions.push(`Ejemplo para ${this.getCountryName(countryCode)}: ${pattern.example}`);
    } else if (!pattern.pattern.test(cleanPhone)) {
      errors.push(`Formato inválido para ${this.getCountryName(countryCode)}`);
      suggestions.push(`Debe ser: ${pattern.description}`);
      suggestions.push(`Ejemplo: ${pattern.example}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      suggestions,
    };
  }

  /**
   * Obtener el nombre del país
   */
  private static getCountryName(countryCode: string): string {
    const countryNames = {
      CL: 'Chile',
      AR: 'Argentina',
      BR: 'Brasil',
      CO: 'Colombia',
      PE: 'Perú',
      UY: 'Uruguay',
      PY: 'Paraguay',
      EC: 'Ecuador',
      BO: 'Bolivia',
      VE: 'Venezuela',
      US: 'Estados Unidos',
      ES: 'España',
      MX: 'México',
    };
    return countryNames[countryCode] || 'Este país';
  }

  /**
   * Limpiar número de teléfono (solo dígitos)
   */
  static cleanPhone(phone: string): string {
    return phone.replace(/[^0-9]/g, '');
  }

  /**
   * Formatear número de teléfono para mostrar
   */
  static formatPhone(phone: string, countryCode: string): string {
    const clean = this.cleanPhone(phone);

    // Formateo específico por país
    switch (countryCode) {
      case 'CL':
      case 'PE':
      case 'PY':
        if (clean.length === 9) {
          return `${clean.substring(0, 1)} ${clean.substring(1, 5)} ${clean.substring(5)}`;
        }
        break;
      case 'US':
        if (clean.length === 10) {
          return `(${clean.substring(0, 3)}) ${clean.substring(3, 6)}-${clean.substring(6)}`;
        }
        break;
    }

    return clean;
  }

  /**
   * Obtener información del patrón para un país
   */
  static getPatternInfo(countryCode: string): {
    description: string;
    example: string;
  } | null {
    const pattern = this.phonePatterns[countryCode];
    return pattern
      ? {
          description: pattern.description,
          example: pattern.example,
        }
      : null;
  }
}
