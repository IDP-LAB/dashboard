"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/stores/auth";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, Package } from "lucide-react";
import { useState } from "react";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const logout = useSession((state) => state.logout);
  const user = useSession((state) => state.user);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: "📊" },
    { name: "Itens", href: "/dashboard/items", icon: "📦" },
    { name: "Projetos", href: "/dashboard/projects", icon: "📁" },
    { name: "Usuários", href: "/dashboard/users", icon: "👥" },
    { name: "Relatórios", href: "/dashboard/reports", icon: "📈" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white">
        <div className="flex h-16 items-center px-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex items-center space-x-2 px-4">
            <Package className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold">Dashboard</h1>
          </div>

          <div className="ml-auto flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Olá, {user?.name || user?.username}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              title="Sair"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } fixed inset-y-0 left-0 z-40 w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out lg:static lg:translate-x-0`}
        >
          <nav className="mt-16 space-y-1 px-2 lg:mt-0">
            {menuItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="flex items-center space-x-3 rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100"
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.name}</span>
              </a>
            ))}
          </nav>
        </aside>

        {/* Overlay para mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
