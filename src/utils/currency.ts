/**
 * Utilidades para formatear precios según la ley de redondeo chilena
 */

/**
 * Redondea un precio según la ley de redondeo chilena
 * En Chile no existen centavos físicos, por lo que todos los precios
 * se redondean al peso entero más cercano
 */
export function redondearPesoChileno(precio: number): number {
  return Math.round(precio);
}

/**
 * Formatea un precio como peso chileno entero (sin decimales)
 */
export function formatearPesoChileno(precio: number): string {
  const precioRedondeado = redondearPesoChileno(precio);
  return new Intl.NumberFormat('es-CL').format(precioRedondeado);
}

/**
 * Formatea un precio con símbolo de peso chileno
 */
export function formatearPrecioCLP(precio: number): string {
  return `$${formatearPesoChileno(precio)}`;
}
