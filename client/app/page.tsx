"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/stores/auth";

export default function HomePage() {
  const router = useRouter();
  const isAuthenticated = useSession((state) => !!state.user);

  useEffect(() => {
    router.push("/dashboard");
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-pulse">Carregando...</div>
    </div>
  );
}
