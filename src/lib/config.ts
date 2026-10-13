// Se lee en tiempo de ejecución (SSR); no usar el prefijo PUBLIC_, que se fija al compilar.
export function getApiUrl(): string {
  const url = process.env.API_URL ?? import.meta.env.API_URL;
  if (!url) {
    throw new Error('Falta la variable de entorno API_URL (ver .env.example).');
  }
  return url.replace(/\/+$/, '');
}
