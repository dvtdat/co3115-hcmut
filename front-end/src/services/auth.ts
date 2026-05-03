export const TOKEN_KEY = "access_token";
export const REFRESH_TOKEN_KEY = "refresh_token";
const USER_KEY = "auth_user";

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  fullName: string;
  phone?: string;
  deliveryAccess?: string;
}

// ── Access token ──────────────────────────────────────────────────────────────

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// ── Refresh token ─────────────────────────────────────────────────────────────

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setRefreshToken(token: string): void {
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
}

export function clearRefreshToken(): void {
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

// ── User ──────────────────────────────────────────────────────────────────────

export function getUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function setUser(user: AuthUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearUser(): void {
  localStorage.removeItem(USER_KEY);
}

export function getRole(): string | null {
  return getUser()?.role ?? null;
}

// ── Logout ────────────────────────────────────────────────────────────────────

/** Clears all auth data from localStorage. Call store.logout() for full sign-out including UI reset. */
export function logout(): void {
  clearToken();
  clearRefreshToken();
  clearUser();
}
