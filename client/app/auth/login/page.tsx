"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAPI } from "@/hooks/useAPI";
import { isSuccessResponse } from "@/lib/response";
import { useSession } from "@/stores/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import Cookies from "js-cookie";

// Schema de validação para o formulário de login
const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "A senha é obrigatória"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const login = useSession((s) => s.login);
  const checkAuthStatus = useSession((s) => s.checkAuthStatus);
  const sessionIsLoading = useSession((s) => s.isLoading);
  const sessionUser = useSession((s) => s.user);
  const { client } = useAPI();
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Verificar sessão ao montar
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await client.query("/auth/login", "post", data);

      if (!isSuccessResponse(response)) {
        toast.error(response.message || "Email ou senha inválidos");
        return;
      }

      const accessTokenData = response.data.accessToken;
      const refreshTokenData = response.data.refreshToken;

      Cookies.set("Bearer", accessTokenData.token, {
        expires: new Date(accessTokenData.expireDate),
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
      });

      Cookies.set("Refresh", refreshTokenData.token, {
        expires: new Date(refreshTokenData.expireDate),
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
      });

      login(accessTokenData.token);

      toast.success("Login realizado com sucesso!");
      router.replace("/dashboard");
      router.refresh();
    } catch (error) {
      toast.error("Erro ao conectar com o servidor");
    } finally {
      setIsLoading(false);
    }
  };

  // Mostra loading enquanto verifica autenticação
  if (sessionIsLoading) {
    return (
      <Card className="w-full max-w-md shadow-lg">
        <CardContent className="flex items-center justify-center p-8 space-x-2">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Verificando sua sessão...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md shadow-xl rounded-2xl border border-border/50 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <CardHeader className="space-y-2">
        <div className="flex w-full justify-center">
          <Image
            src="/idealab_azul.png"
            alt="Logo"
            width={80}
            height={80}
            className="rounded-2xl"
            priority
          />
        </div>
        <CardTitle className="text-2xl font-semibold text-center tracking-tight">
          Bem-vindo de volta
        </CardTitle>
        <CardDescription className="text-center text-muted-foreground">
          Acesse sua conta para continuar
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="seu@email.com"
                className="pl-10"
                {...register("email")}
                disabled={isLoading}
                aria-invalid={!!errors.email}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={isPasswordVisible ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                className="pl-10 pr-10"
                {...register("password")}
                disabled={isLoading}
                aria-invalid={!!errors.password}
              />
              <button
                type="button"
                onClick={() => setIsPasswordVisible((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
                aria-label={isPasswordVisible ? "Ocultar senha" : "Mostrar senha"}
                title={isPasswordVisible ? "Ocultar senha" : "Mostrar senha"}
              >
                {isPasswordVisible ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-3">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Entrando...
              </>
            ) : (
              "Entrar"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
