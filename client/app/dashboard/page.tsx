"use client";

import { FullCalendar } from "@/components/calendar/full-calendar";
import { useSession } from "@/stores/auth";

export default function DashboardPage() {
  const user = useSession((state) => state.user)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Bem-vindo, {user?.username}!
        </h1>
        <p className="text-muted-foreground">
          Gerencie seus compromissos e atividades
        </p>
      </div>

      <div className="h-[calc(100vh-200px)]">
        <FullCalendar />
      </div>
    </div>
  );
}
