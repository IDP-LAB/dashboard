import { Toaster } from "@/components/ui/toaster";
import { APIProvider } from "@/providers/api";
import { QueryProvider } from "@/providers/query";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dashboard - Sistema de Gestão",
  description: "Sistema de gerenciamento de estoque e projetos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <QueryProvider>
          <APIProvider>
            {children}
            <Toaster />
          </APIProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
