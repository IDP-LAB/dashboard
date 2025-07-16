"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/stores/auth";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Users, FolderOpen, BarChart3 } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();
  const user = useSession((state) => state.user);
  const isAuthenticated = !!user;

  useEffect(() => {
    // if (!isAuthenticated) {
    //   router.push("/login");
    // }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  const dashboardCards = [
    {
      title: "Itens",
      description: "Gerenciar itens do estoque",
      icon: Package,
      href: "/dashboard/items",
      color: "text-blue-600",
    },
    {
      title: "Projetos",
      description: "Gerenciar projetos ativos",
      icon: FolderOpen,
      href: "/dashboard/projects",
      color: "text-green-600",
    },
    {
      title: "Usuários",
      description: "Gerenciar usuários do sistema",
      icon: Users,
      href: "/dashboard/users",
      color: "text-purple-600",
    },
    {
      title: "Relatórios",
      description: "Visualizar relatórios e estatísticas",
      icon: BarChart3,
      href: "/dashboard/reports",
      color: "text-orange-600",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Bem-vindo, {user?.name || user?.username}!
          </h1>
          <p className="text-muted-foreground">
            Selecione uma opção abaixo para começar
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {dashboardCards.map((card) => (
            <Link key={card.href} href={card.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-lg bg-gray-50 ${card.color}`}>
                      <card.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{card.title}</CardTitle>
                      <CardDescription className="text-sm">
                        {card.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
            <CardDescription>Últimas movimentações no sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Nenhuma atividade recente para exibir.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
