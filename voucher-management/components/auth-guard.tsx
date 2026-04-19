"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth";
import { LoadingSpinner } from "@/components/loading-spinner";

interface AuthGuardProps { children: React.ReactNode; pageKey?: string }

export function AuthGuard({ children, pageKey }: AuthGuardProps) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const allowedPages = useAuthStore((s) => s.allowedPages);
  const allowedPagesLoaded = useAuthStore((s) => s.allowedPagesLoaded);

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated) { router.replace("/login"); return; }
    if (pageKey && allowedPagesLoaded) {
      const hasAllAccess = allowedPages.includes("page-all");
      if (!hasAllAccess && allowedPages.length > 0 && !allowedPages.includes(pageKey)) {
        const firstAllowed = allowedPages[0];
        router.replace(firstAllowed === "dashboard" ? "/dashboard" : `/dashboard/${firstAllowed}`);
      }
    }
  }, [isHydrated, isAuthenticated, allowedPages, allowedPagesLoaded, pageKey, router]);

  if (!isHydrated || !isAuthenticated) return <div className="flex h-screen items-center justify-center"><LoadingSpinner className="h-8 w-8" /></div>;
  if (pageKey && !allowedPagesLoaded) return <div className="flex h-screen items-center justify-center"><LoadingSpinner className="h-8 w-8" /></div>;

  return <>{children}</>;
}
