"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth";
import { LoadingSpinner } from "@/components/loading-spinner";

export default function Home() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  useEffect(() => {
    if (isHydrated) router.replace(isAuthenticated ? "/dashboard" : "/login");
  }, [isHydrated, isAuthenticated, router]);

  return <div className="flex h-screen items-center justify-center"><LoadingSpinner className="h-8 w-8" /></div>;
}
