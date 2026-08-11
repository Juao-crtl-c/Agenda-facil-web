import { getToken } from "./auth";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333/api";

export class ApiError extends Error {
  code: string;
  status: number;
  details?: unknown;

  constructor(message: string, code: string, status: number, details?: unknown) {
    super(message);
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

type ApiFetchOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  auth?: boolean;
};

// Wrapper fino sobre fetch: monta a URL a partir de NEXT_PUBLIC_API_URL,
// serializa o body como JSON, injeta o Bearer token (quando auth !== false
// e existe token salvo) e converte o envelope de erro padrão da API
// ({ error: { message, code, details } }, ver errorHandler.ts na API) numa
// ApiError, pra quem chama poder mostrar `err.message` direto.
export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { body, auth = true, headers, ...rest } = options;

  const finalHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(headers as Record<string, string>),
  };

  if (auth) {
    const token = getToken();
    if (token) finalHeaders.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers: finalHeaders,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (res.status === 204) return undefined as T;

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json() : undefined;

  if (!res.ok) {
    const message = data?.error?.message ?? "Erro inesperado. Tente novamente.";
    const code = data?.error?.code ?? "UNKNOWN_ERROR";
    throw new ApiError(message, code, res.status, data?.error?.details);
  }

  return data as T;
}
