import { PUBLIC_API_URL } from 'astro:env/client';

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

async function request(path: string, init: RequestInit): Promise<Response> {
  const url = `${PUBLIC_API_URL.replace(/\/+$/, '')}${path}`;
  let res: Response;
  try {
    res = await fetch(url, { ...init, signal: AbortSignal.timeout(TIMEOUT_MS) });
  } catch {
    throw new ApiError(`No se pudo conectar con la API (${path})`, undefined);
  }
  if (!res.ok) {
    throw new ApiError(`La API respondió ${res.status} en ${path}`, res.status);
  }
  return res;
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await request(path, { headers: { Accept: 'application/json' } });
  return (await res.json()) as T;
}

/** POST con cuerpo JSON. No lee la respuesta: basta con que el servidor devuelva 2xx. */
export async function apiPost(path: string, body: unknown): Promise<void> {
  await request(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}
