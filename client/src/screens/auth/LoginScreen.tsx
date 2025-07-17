"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UserIcon, LockIcon, EyeIcon, EyeOffIcon } from "@/components/ui/Icons"
import { useAuth, type LoginData } from "@/hooks/useAuth"
import Link from "next/link"

export function LoginScreen() {
  const { loading, error, login, clearError } = useAuth()
  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [successMessage, setSuccessMessage] = useState<string>("")
  const [showPassword, setShowPassword] = useState(false)

  // Função para verificar se a senha tem pelo menos um número ou símbolo
  function hasNumberOrSymbol(password: string): boolean {
    return /[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password)
  }

  async function handleSubmit(event: { preventDefault: () => void }) {
    event.preventDefault()
    
    // Verifica se a senha tem pelo menos um número ou símbolo antes de prosseguir
    if (!hasNumberOrSymbol(password)) {
      alert("A senha deve conter pelo menos um número ou símbolo especial!")
      return
    }
    
    clearError()
    setSuccessMessage("")
    
    try {
      const loginData: LoginData = {
        email,
        password
      }
      
      const result = await login(loginData)
      
      if (result && result.data.accessToken) {
        setSuccessMessage(`Bem-vindo(a)! Login realizado com sucesso.`)
        
        // Limpa formulário
        setEmail("")
        setPassword("")
        
        // Remove mensagem de sucesso após 3 segundos
        setTimeout(() => setSuccessMessage(""), 3000)
      }
    } catch (error) {
      console.error("Erro ao fazer login:", error)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
          
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">Login</h1>
            <p className="text-gray-600">Entre com suas credenciais</p>
          </div>

          {/* Mensagens de feedback */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              <div className="flex justify-between items-center">
                <span>{error}</span>
                <button onClick={clearError} className="text-red-700 hover:text-red-900 font-bold">×</button>
              </div>
            </div>
          )}
          
          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
              <div className="flex justify-between items-center">
                <span>{successMessage}</span>
                <button onClick={() => setSuccessMessage("")} className="text-green-700 hover:text-green-900 font-bold">×</button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <UserIcon />
                </div>
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <LockIcon />
                </div>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-medium py-2.5"
              disabled={loading}
            >
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          {/* Links de navegação */}
          <div className="text-center space-y-3">
            <p className="text-sm text-gray-600">
              Não tem uma conta?{" "}
              <Link href="/signup" className="text-cyan-600 hover:text-cyan-700 font-medium">
                Cadastre-se aqui
              </Link>
            </p>
            
            {successMessage && (
              <Link 
                href="/productRegister" 
                className="block w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2.5 px-4 rounded-md transition-colors duration-200"
              >
                Ir para Cadastro de Produtos
              </Link>
            )}
          </div>

        </div>
      </div>
    </div>
  )
} 