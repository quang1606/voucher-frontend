"use client";

import { useAuthStore } from "@/lib/auth";

export function useRoles() {
  const user = useAuthStore((state) => state.user);
  const allowedPages = useAuthStore((state) => state.allowedPages);
  const allowedPagesLoaded = useAuthStore((state) => state.allowedPagesLoaded);
  const roles = user?.roles || [];

  const isAdmin = roles.includes("ADMIN");
  const isPartner = roles.includes("PARTNER");

  const hasPageAccess = (pageKey: string) => {
    if (!allowedPagesLoaded) return true;
    if (allowedPages.includes("page-all")) return true;
    if (allowedPages.length === 0) return true;
    return allowedPages.includes(pageKey);
  };

  return { roles, isAdmin, isPartner, allowedPages, allowedPagesLoaded, hasPageAccess };
}
