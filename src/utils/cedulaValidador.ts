/**
 * Validador y formateador de Cédulas de Identidad de República Dominicana
 */

/**
 * Valida matemáticamente una cédula dominicana usando el Algoritmo de Luhn (Módulo 10).
 * @param cedula String de cédula con o sin guiones
 * @returns boolean true si la cédula es sintácticamente válida
 */
export function validarCedula(cedula: string): boolean {
  if (!cedula) return false;
  
  // Limpiar caracteres no numéricos
  const limpia = cedula.replace(/[^0-9]/g, '');
  
  // Debe tener exactamente 11 dígitos
  if (limpia.length !== 11) return false;
  
  // Cédulas que empiezan con 000 no son válidas
  if (limpia.startsWith('000')) return false;

  let suma = 0;
  const verificador = parseInt(limpia.charAt(10), 10);
  
  // Pesos del algoritmo para cédulas dominicanas: 1, 2, 1, 2, 1, 2, 1, 2, 1, 2
  const pesos = [1, 2, 1, 2, 1, 2, 1, 2, 1, 2];

  for (let i = 0; i < 10; i++) {
    const digito = parseInt(limpia.charAt(i), 10);
    let producto = digito * pesos[i];
    
    // Si el producto es mayor o igual a 10, sumar sus dígitos (ej: 14 -> 1 + 4 = 5)
    if (producto >= 10) {
      producto = Math.floor(producto / 10) + (producto % 10);
    }
    
    suma += producto;
  }

  const residuo = suma % 10;
  const digitoCalculado = (residuo === 0) ? 0 : 10 - residuo;

  return digitoCalculado === verificador;
}

/**
 * Formatea un string numérico con la máscara XXX-XXXXXXX-X de cédula dominicana.
 * @param cedula String de entrada
 * @returns String formateado con guiones
 */
export function formatearCedula(cedula: string): string {
  const limpia = cedula.replace(/[^0-9]/g, '');
  if (limpia.length === 0) return '';
  
  if (limpia.length <= 3) {
    return limpia;
  } else if (limpia.length <= 10) {
    return `${limpia.slice(0, 3)}-${limpia.slice(3)}`;
  } else {
    return `${limpia.slice(0, 3)}-${limpia.slice(3, 10)}-${limpia.slice(10, 11)}`;
  }
}
