"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useAPI } from "@/hooks/useAPI"
import { useMutation, useQuery } from "@tanstack/react-query"
import { isSuccessResponse } from "@/lib/response"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { AtSign, User, Lock, Eye, EyeOff, Loader2, Mail } from "lucide-react"

type InviteInfo = {
  role: string
  used: number
  remaining: number
  expiresAt: string | null
}

export default function RegisterPage() {
  const { client } = useAPI()
  const search = useSearchParams()
  const router = useRouter()

  const code = search.get("invite") || ""
  const prefillEmail = search.get("email") || ""

  const [form, setForm] = useState({
    name: "",
    username: "",
    email: prefillEmail,
    password: "",
    confirmPassword: "",
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [debugOpen, setDebugOpen] = useState(false)

  useEffect(() => {
    // Mantém email sincronizado com query em hard refresh
    if (prefillEmail) setForm((p) => ({ ...p, email: prefillEmail }))
  }, [prefillEmail])

  const canSubmit = useMemo(() => {
    return (
      code.length > 0 &&
      form.name.trim().length >= 4 &&
      form.username.trim().length >= 4 &&
      /[^\s@]+@[^\s@]+\.[^\s@]+/.test(form.email) &&
      form.password.length >= 8 &&
      form.password === form.confirmPassword
    )
  }, [code, form])

  const { data: inviteData, isLoading: isLoadingInvite, isError: isInviteError } = useQuery({
    queryKey: ["invite", code],
    enabled: code.length > 0,
    queryFn: async () => {
      const response = await client.query("/invite/:code", "get", { code })
      if (!isSuccessResponse(response)) throw new Error(response.message)
      return response.data as InviteInfo
    }
  })

  const { mutateAsync: register, isPending: isRegistering } = useMutation({
    mutationFn: async () => {
      const { name, username, email, password } = form
      const response = await client.query("/invite/:code", "post", { code }, { name, username, email, password, language: "pt-BR" })
      if (!isSuccessResponse(response)) throw new Error(response.message)
      return response.data
    },
    onSuccess: () => {
      toast.success("Conta criada com sucesso!")
      router.push("/auth/login")
    },
    onError: (err: any) => {
      toast.error(err?.message || "Erro ao criar conta")
    }
  })

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Criar conta</span>
            {inviteData && !isInviteError && (
              <Badge variant="secondary" className="ml-2">Convite válido</Badge>
            )}
          </CardTitle>
          <CardDescription>
            Use seu convite para concluir o cadastro e começar a usar a plataforma.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {code.length === 0 && (
            <Alert variant="destructive">
              <AlertDescription>
                Código de convite não fornecido. Acesse o link de convite novamente.
              </AlertDescription>
            </Alert>
          )}

          {code.length > 0 && isInviteError && (
            <Alert variant="destructive">
              <AlertDescription>
                Convite inválido ou expirado. Solicite um novo convite ao administrador.
              </AlertDescription>
            </Alert>
          )}

          {isLoadingInvite && (
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Validando convite...
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Nome completo</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Seu nome"
                className="pl-9"
                disabled={isRegistering || isLoadingInvite || isInviteError}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Nome de usuário</Label>
            <div className="relative">
              <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="username"
                value={form.username}
                onChange={(e) => handleChange("username", e.target.value)}
                placeholder="usuario"
                className="pl-9"
                disabled={isRegistering || isLoadingInvite || isInviteError}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="email@exemplo.com"
                className="pl-9"
                disabled={isRegistering || isLoadingInvite || isInviteError}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => handleChange("password", e.target.value)}
                placeholder="Mínimo 8 caracteres"
                className="pl-9 pr-10"
                disabled={isRegistering || isLoadingInvite || isInviteError}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 w-8"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                disabled={isRegistering}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={form.confirmPassword}
                onChange={(e) => handleChange("confirmPassword", e.target.value)}
                placeholder="Repita a senha"
                className="pl-9 pr-10"
                disabled={isRegistering || isLoadingInvite || isInviteError}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 w-8"
                onClick={() => setShowConfirmPassword((v) => !v)}
                aria-label={showConfirmPassword ? "Ocultar confirmação" : "Mostrar confirmação"}
                disabled={isRegistering}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {form.confirmPassword.length > 0 && form.password !== form.confirmPassword && (
              <p className="text-xs text-destructive">As senhas não coincidem.</p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button
            className="w-full"
            onClick={() => register()}
            disabled={!canSubmit || isRegistering || isLoadingInvite || isInviteError}
          >
            {isRegistering && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isRegistering ? "Criando..." : "Criar conta"}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            Já tem conta? {" "}
            <Link href="/auth/login" className="underline underline-offset-4 hover:text-foreground">
              Entrar
            </Link>
          </div>

          {(code.length > 0 || inviteData || isInviteError) && (
            <Collapsible open={debugOpen} onOpenChange={setDebugOpen}>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Detalhes técnicos</span>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                    {debugOpen ? "Ocultar" : "Ver"}
                  </Button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent>
                <div className="mt-2 rounded-md border bg-muted/30 p-3 text-xs space-y-1">
                  {code && (
                    <div>
                      <span className="text-muted-foreground">Código:&nbsp;</span>
                      <span className="font-mono break-all">{code}</span>
                    </div>
                  )}
                  {inviteData && (
                    <>
                      <div>
                        <span className="text-muted-foreground">Função:&nbsp;</span>
                        <span className="font-medium">{inviteData.role}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Usados/Restantes:&nbsp;</span>
                        <span>{inviteData.used}/{inviteData.remaining}</span>
                      </div>
                      {inviteData.expiresAt && (
                        <div>
                          <span className="text-muted-foreground">Expira em:&nbsp;</span>
                          <span>{new Date(inviteData.expiresAt).toLocaleString()}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}


