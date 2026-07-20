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

/**
 * Compara dos nombres y determina si son altamente similares para alertar posible fraude o duplicidad.
 */
export function calcularSimilitud(n1: string, n2: string): boolean {
  if (!n1 || !n2) return false;
  
  // Normalizar (quitar acentos, pasar a minúsculas, recortar espacios)
  const norm1 = n1.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  const norm2 = n2.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

  if (norm1 === norm2) return true;

  // Si uno de los nombres contiene al otro y tiene al menos 4 letras
  if (norm1.length >= 4 && norm2.length >= 4) {
    if (norm1.includes(norm2) || norm2.includes(norm1)) {
      return true;
    }
  }

  // Separar en palabras para verificar coincidencias parciales
  const palabras1 = norm1.split(/\s+/);
  const palabras2 = norm2.split(/\s+/);

  // Si comparten al menos 2 palabras significativas (de longitud >= 3)
  const comunes = palabras1.filter(p => p.length >= 3 && palabras2.includes(p));
  if (comunes.length >= 2) {
    return true;
  }

  return false;
}

