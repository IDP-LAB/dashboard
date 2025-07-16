"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { WifiOff, RefreshCw, Home } from "lucide-react"
import Link from "next/link"

/**
 * Página offline mostrada quando não há conexão
 */
export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <WifiOff className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle>Sem Conexão</CardTitle>
          <CardDescription>Você está offline. Algumas funcionalidades podem não estar disponíveis.</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground space-y-2">
            <p>• Dados em cache ainda estão disponíveis</p>
            <p>• Suas alterações serão sincronizadas quando voltar online</p>
            <p>• Verifique sua conexão com a internet</p>
          </div>

          <div className="flex flex-col gap-2">
            <Button onClick={() => window.location.reload()} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>

            <Link href="/dashboard">
              <Button variant="outline" className="w-full">
                <Home className="h-4 w-4 mr-2" />
                Ir para Dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
