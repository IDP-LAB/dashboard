"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UserIcon, LockIcon, EyeIcon, EyeOffIcon } from "@/components/ui/Icons"

export function SignupScreen() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Função para validar senha
  function validatePassword(password: string): string | null {
    if (password.length < 8) {
      return "A senha deve ter no mínimo 8 caracteres"
    }
    if (password.length > 16) {
      return "A senha deve ter no máximo 16 caracteres"
    }
    // Verifica se tem pelo menos um número OU um símbolo especial
    const hasNumberOrSymbol = /[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password)
    if (!hasNumberOrSymbol) {
      return "A senha deve conter pelo menos um número ou símbolo especial"
    }
    return null
  }

  function handleSubmit(event: { preventDefault: () => void }) {
    event.preventDefault()
    
    if (password !== confirmPassword) {
      alert("As senhas não coincidem!")
      return
    }

    const passwordError = validatePassword(password)
    if (passwordError) {
      alert(passwordError)
      return
    }
    
    setIsLoading(true)
    
    // Simula criação da conta e salva no localStorage
    setTimeout(() => {
      try {
        // Pega contas existentes ou cria array vazio
        const existingAccounts = JSON.parse(localStorage.getItem('tempAccounts') || '[]')
        
        // Verifica se email já existe
        const emailExists = existingAccounts.some((account: any) => account.email === email)
        if (emailExists) {
          alert("Este email já está cadastrado!")
          setIsLoading(false)
          return
        }
        
        // Cria nova conta
        const newAccount = {
          id: Date.now(), // ID simples baseado no timestamp
          name,
          email,
          password, // Em produção, isso seria criptografado
          createdAt: new Date().toISOString()
        }
        
        // Adiciona à lista e salva
        existingAccounts.push(newAccount)
        localStorage.setItem('tempAccounts', JSON.stringify(existingAccounts))
        
        console.log("Conta criada:", newAccount)
        console.log("Todas as contas:", existingAccounts)
        
        setIsLoading(false)
        alert("Conta criada com sucesso!")
        
        // Limpa formulário
        setName("")
        setEmail("")
        setPassword("")
        setConfirmPassword("")
        
      } catch (error) {
        console.error("Erro ao salvar conta:", error)
        alert("Erro ao criar conta!")
        setIsLoading(false)
      }
    }, 1500)
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
          
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">Crie uma conta</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
              <Input
                type="text"
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            
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
                  placeholder="8-16 caracteres, com número ou símbolo"
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

              {password && (
                <div className="mt-2 text-xs space-y-1">
                  <div className={`flex items-center gap-1 ${password.length >= 8 && password.length <= 16 ? 'text-green-600' : 'text-red-500'}`}>
                    <span>{password.length >= 8 && password.length <= 16 ? '✓' : '✗'}</span>
                    <span>Entre 8 e 16 caracteres</span>
                  </div>
                  <div className={`flex items-center gap-1 ${/[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password) ? 'text-green-600' : 'text-red-500'}`}>
                    <span>{/[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password) ? '✓' : '✗'}</span>
                    <span>Pelo menos um número ou símbolo especial</span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar Senha</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <LockIcon />
                </div>
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Digite a senha novamente"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-medium py-2.5"
              disabled={isLoading}
            >
              {isLoading ? "Criando conta..." : "Criar Conta"}
            </Button>
          </form>

        </div>
      </div>
    </div>
  )
}