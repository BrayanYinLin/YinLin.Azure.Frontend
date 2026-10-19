const digitsOf = (value: string) => value.replace(/\D/g, '');

/** "4242424242424242" -> "4242 4242 4242 4242" */
export const formatCardNumber = (value: string) =>
  digitsOf(value).slice(0, 19).replace(/(.{4})(?=.)/g, '$1 ');

/** "1228" -> "12 / 28" */
export function formatExpiry(value: string) {
  const d = digitsOf(value).slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)} / ${d.slice(2)}` : d;
}

function passesLuhn(digits: string) {
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let n = Number(digits[digits.length - 1 - i]);
    if (i % 2 === 1) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
  }
  return sum % 10 === 0;
}

// Cada validador devuelve el mensaje de error, o null si el valor es válido.
export type Validator = (value: string) => string | null;

export const validateName: Validator = (v) =>
  v.trim().length >= 2 ? null : 'Escribe el nombre como aparece en la tarjeta.';

export const validateCardNumber: Validator = (v) => {
  const d = digitsOf(v);
  return d.length >= 13 && d.length <= 19 && passesLuhn(d) ? null : 'Número de tarjeta no válido.';
};

export const validateExpiry =
  (now = new Date()): Validator =>
  (v) => {
    const d = digitsOf(v);
    if (d.length !== 4) return 'Usa el formato MM / AA.';
    const month = Number(d.slice(0, 2));
    const year = 2000 + Number(d.slice(2));
    if (month < 1 || month > 12) return 'Mes no válido.';
    const expired = year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1);
    return expired ? 'La tarjeta está vencida.' : null;
  };

export const validateCvv: Validator = (v) => (/^\d{3,4}$/.test(v) ? null : 'CVV de 3 o 4 dígitos.');

export const validateEmail: Validator = (v) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? null : 'Escribe un email válido.';
