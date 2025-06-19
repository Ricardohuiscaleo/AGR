// Middleware simplificado para modo estático - solo pasa todo sin procesar
import type { APIContext, MiddlewareNext } from 'astro';

export const onRequest = async (context: APIContext, next: MiddlewareNext) => {
  // En modo estático, simplemente pasamos todas las requests sin procesamiento
  return next();
};
