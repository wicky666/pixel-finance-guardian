import { getApiBaseUrl } from "@/lib/api/client";

export type AuthRole = "user" | "admin" | "super_admin";

export interface AuthUser {
  id: string;
  email: string;
  role: AuthRole;
  status: "active" | "blocked";
}

interface AuthResponse {
  user: AuthUser | null;
}

function buildAuthUrl(path: string): string | null {
  const base = getApiBaseUrl();
  if (!base) return null;
  return `${base}/api/auth${path.startsWith("/") ? path : `/${path}`}`;
}

export async function fetchAuthMe(): Promise<{ ok: true; user: AuthUser | null } | { ok: false; reason: "disabled" | "error" }> {
  const url = buildAuthUrl("/me");
  if (!url) return { ok: false, reason: "disabled" };
  try {
    const res = await fetch(url, { method: "GET", credentials: "include", cache: "no-store" });
    if (!res.ok) return { ok: true, user: null };
    const data = (await res.json()) as AuthResponse;
    return { ok: true, user: data.user ?? null };
  } catch {
    return { ok: false, reason: "error" };
  }
}

export async function loginWithPassword(email: string, password: string): Promise<{ ok: true; user: AuthUser } | { ok: false; message: string }> {
  const url = buildAuthUrl("/login");
  if (!url) {
    return { ok: false, message: "当前环境未连接账户服务，仍可先本地体验。" };
  }
  try {
    const res = await fetch(url, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      return { ok: false, message: "登录后可保存你的记录，请检查邮箱或密码。" };
    }
    const data = (await res.json()) as { user?: AuthUser };
    if (!data.user) {
      return { ok: false, message: "登录后可保存你的记录，请稍后重试。" };
    }
    return { ok: true, user: data.user };
  } catch {
    return { ok: false, message: "登录服务暂时不可用，请稍后再试。" };
  }
}

export async function logoutSession(): Promise<boolean> {
  const url = buildAuthUrl("/logout");
  if (!url) return false;
  try {
    const res = await fetch(url, { method: "POST", credentials: "include" });
    return res.ok;
  } catch {
    return false;
  }
}

export function getUserDisplayName(user: AuthUser | null): string {
  if (!user) return "";
  const name = user.email.split("@")[0]?.trim();
  return name || "用户";
}
