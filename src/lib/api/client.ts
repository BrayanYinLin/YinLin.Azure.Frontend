import { getApiUrl } from '../config';

const TIMEOUT_MS = 5000;

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiGet<T>(path: string): Promise<T> {
  const url = `${getApiUrl()}${path}`;
  let res: Response;
  try {
    res = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch {
    throw new ApiError(`No se pudo conectar con la API (${path})`, undefined);
  }
  if (!res.ok) {
    throw new ApiError(`La API respondió ${res.status} en ${path}`, res.status);
  }
  return (await res.json()) as T;
}
