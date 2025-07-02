"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UserIcon, LockIcon, EyeIcon, EyeOffIcon } from "@/components/ui/Icons"

export function LoginScreen() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Função para verificar se a senha tem pelo menos um número ou símbolo
  function hasNumberOrSymbol(password: string): boolean {
    return /[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password)
  }

  function handleSubmit(event: { preventDefault: () => void }) {
    event.preventDefault()
    
    // Verifica se a senha tem pelo menos um número ou símbolo antes de prosseguir
    if (!hasNumberOrSymbol(password)) {
      alert("A senha deve conter pelo menos um número ou símbolo especial!")
      return
    }
    
    setIsLoading(true)
    
    setTimeout(() => {
      try {
        // Pega contas salvas do localStorage
        const existingAccounts = JSON.parse(localStorage.getItem('tempAccounts') || '[]')
        
        console.log("Tentando login com:", email)
        console.log("Contas disponíveis:", existingAccounts.map((acc: any) => acc.email))
        
        // Procura conta com email e senha corretos
        const foundAccount = existingAccounts.find((account: any) => 
          account.email === email && account.password === password
        )
        
        if (foundAccount) {
          console.log("Login realizado com sucesso!", foundAccount.name)
          alert(`Bem-vindo(a), ${foundAccount.name}!`)
          
          // Limpa formulário
          setEmail("")
          setPassword("")
        } else {
          // Verifica se pelo menos o email existe
          const emailExists = existingAccounts.some((account: any) => account.email === email)
          
          if (emailExists) {
            console.log("Senha incorreta")
            alert("Senha incorreta!")
          } else {
            console.log("Email não encontrado")
            alert("Email não encontrado! Cadastre-se primeiro.")
          }
        }
        
      } catch (error) {
        console.error("Erro ao fazer login:", error)
        alert("Erro no sistema! Tente novamente.")
      }
      
      setIsLoading(false)
    }, 1500)
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
          
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">Login</h1>
            <p className="text-gray-600">Entre com suas credenciais</p>
          </div>

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
              disabled={isLoading}
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

        </div>
      </div>
    </div>
  )
} 