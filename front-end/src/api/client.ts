import createClient, { type Middleware } from "openapi-fetch";
import type { paths } from "./schema.d.ts";
import { env } from "@/env";
import { logout as clearAuthStorage, TOKEN_KEY } from "@/services/auth";
import { router } from "@/router";

const client = createClient<paths>({
  baseUrl: env.apiUrl,
});

const authMiddleware: Middleware = {
  onRequest({ request }) {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return request;
    const headers = new Headers(request.headers);
    headers.set("Authorization", `Bearer ${token}`);
    return new Request(request, { headers });
  },
};

// The backend uses MongoDB's _id field, but openapi-typescript maps it to `id`
// in the generated types. This middleware normalizes _id → id at the response
// boundary so all downstream code can safely use .id as the TypeScript types promise.
function normalizeMongoIds(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map(normalizeMongoIds);
  }
  if (obj !== null && typeof obj === "object") {
    const record = obj as Record<string, unknown>;
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(record)) {
      result[key] = normalizeMongoIds(value);
    }
    if ("_id" in record && !("id" in record)) {
      result.id = record._id;
    }
    return result;
  }
  return obj;
}

const normalizeIdsMiddleware: Middleware = {
  async onResponse({ response }) {
    if (!response.headers.get("content-type")?.includes("application/json")) {
      return response;
    }
    const body: unknown = await response.json();
    const normalized = normalizeMongoIds(body);
    return new Response(JSON.stringify(normalized), {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  },
};

// Guard against concurrent 401s (multiple in-flight requests all expiring at once).
// Must be set synchronously before any await so only the first handler proceeds.
let isHandlingUnauthorized = false;

const unauthorizedMiddleware: Middleware = {
  async onResponse({ response }) {
    if (response.status === 401) {
      if (isHandlingUnauthorized) return response;
      isHandlingUnauthorized = true;

      clearAuthStorage();
      // Dynamically import to avoid circular dependency (authStore → client → authStore)
      const { useAuthStore } = await import("@/store/authStore");
      useAuthStore.setState({ user: null, isAuthenticated: false });

      await router.navigate({ to: "/login", search: { redirect: router.state.location.pathname } });
      isHandlingUnauthorized = false;
    }
    return response;
  },
};

client.use(authMiddleware);
client.use(unauthorizedMiddleware);
client.use(normalizeIdsMiddleware);

export default client;
