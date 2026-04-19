"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthResponse } from "./types";

interface UserInfo {
  name?: string;
  email?: string;
  roles: string[];
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  expiry: number | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  user: UserInfo | null;
  allowedPages: string[];
  allowedPagesLoaded: boolean;
  login: (authResponse: AuthResponse) => void;
  logout: () => void;
  setHydrated: () => void;
  setAllowedPages: (pages: string[]) => void;
}

export function decodeBase64Utf8(base64: string): string {
  // atob() decodes to Latin-1, not UTF-8. For Vietnamese/Unicode characters,
  // we need to properly decode the UTF-8 byte sequence.
  const binStr = atob(base64.replace(/-/g, "+").replace(/_/g, "/"));
  const bytes = Uint8Array.from(binStr, (c) => c.charCodeAt(0));
  return new TextDecoder("utf-8").decode(bytes);
}

function parseUserFromToken(token: string): UserInfo {
  try {
    const payload = JSON.parse(decodeBase64Utf8(token.split(".")[1]));
    return {
      name: payload.name || payload.preferred_username || "",
      email: payload.email || "",
      roles: payload.realm_access?.roles || [],
    };
  } catch {
    return { name: "", email: "", roles: [] };
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      expiry: null,
      isAuthenticated: false,
      isHydrated: false,
      user: null,
      allowedPages: [],
      allowedPagesLoaded: false,

      login: (authResponse: AuthResponse) => {
        const user = parseUserFromToken(authResponse.access_token);
        const expiry = Date.now() + authResponse.expires_in * 1000;
        document.cookie = `auth_token=${authResponse.access_token}; path=/; max-age=${authResponse.expires_in}`;
        set({
          token: authResponse.access_token,
          refreshToken: authResponse.refresh_token,
          expiry,
          isAuthenticated: true,
          user,
          allowedPages: [],
          allowedPagesLoaded: false,
        });
      },

      logout: () => {
        document.cookie = "auth_token=; path=/; max-age=0";
        set({
          token: null,
          refreshToken: null,
          expiry: null,
          isAuthenticated: false,
          user: null,
          allowedPages: [],
          allowedPagesLoaded: false,
        });
      },

      setHydrated: () => set({ isHydrated: true }),

      setAllowedPages: (pages: string[]) =>
        set({ allowedPages: pages, allowedPagesLoaded: true }),
    }),
    {
      name: "auth-storage",
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
        if (state?.token && state?.expiry) {
          if (Date.now() > state.expiry) {
            state.logout();
          } else if (state.user?.roles && state.user.roles.length > 0) {
            fetchAllowedPages(state.user.roles).then((pages) => {
              state.setAllowedPages(pages);
            });
          }
        }
      },
    }
  )
);

export async function loginWithCredentials(
  username: string,
  password: string
): Promise<AuthResponse> {
  const res = await fetch("/api/auth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || "Đăng nhập thất bại");
  }
  const json = await res.json();
  // Identity Service trả về { status, code, message, data: { accessToken, refreshToken, expiresIn, tokenType } }
  const tokenData = json.data || json;
  return {
    access_token: tokenData.accessToken || tokenData.access_token,
    refresh_token: tokenData.refreshToken || tokenData.refresh_token,
    expires_in: tokenData.expiresIn || tokenData.expires_in,
    token_type: tokenData.tokenType || tokenData.token_type,
  };
}

export async function fetchAllowedPages(roles: string[]): Promise<string[]> {
  try {
    const res = await fetch("/api/auth/allowed-pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roles }),
    });
    if (!res.ok) return [];
    const json = await res.json();
    // Identity Service: { data: { allowedPages: [...] } }
    const data = json.data || json;
    return data.allowedPages || [];
  } catch {
    return [];
  }
}
