/**
 * Thin wrapper around fetch that shares the same baseUrl and auth-token
 * logic with the openapi-fetch client.
 *
 * Use this for calling the real backend API while keeping the existing
 * openapi-fetch client intact for future migration.
 */

import { env } from "@/env";
import { TOKEN_KEY } from "@/services/auth";

const BASE = env.apiUrl;

function authHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

interface ApiOptions {
  params?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
}

async function request<T>(method: string, path: string, opts?: ApiOptions): Promise<T> {
  // Build query string
  let url = `${BASE}${path}`;
  if (opts?.params) {
    const qs = Object.entries(opts.params)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
      .join("&");
    if (qs) url += `?${qs}`;
  }

  const res = await fetch(url, {
    method,
    headers: authHeaders(),
    body: opts?.body ? JSON.stringify(opts.body) : undefined,
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    const msg = (errBody as Record<string, unknown>)?.message ?? res.statusText;
    throw new Error(typeof msg === "string" ? msg : res.statusText);
  }

  // Handle 204 No Content
  if (res.status === 204) return {} as T;

  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string, params?: Record<string, string | number | boolean | undefined>) =>
    request<T>("GET", path, { params }),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, { body }),
  patch: <T>(path: string, body?: unknown) => request<T>("PATCH", path, { body }),
  delete: <T>(path: string) => request<T>("DELETE", path),
};
