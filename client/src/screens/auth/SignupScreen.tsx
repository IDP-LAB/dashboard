"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UserIcon, LockIcon, EyeIcon, EyeOffIcon } from "@/components/ui/Icons"
import { useAuth, type SignupData } from "@/hooks/useAuth"
import Link from "next/link"

export function SignupScreen() {
  const { loading, error, signup, clearError } = useAuth()
  
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [successMessage, setSuccessMessage] = useState<string>("")
  
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

  async function handleSubmit(event: { preventDefault: () => void }) {
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
    
    clearError()
    setSuccessMessage("")
    
    try {
      const signupData: SignupData = {
        name,
        email,
        password
      }
      
      const result = await signup(signupData)
      
      if (result) {
        setSuccessMessage(`Conta criada com sucesso! Bem-vindo(a), ${result.data.name}!`)
        
        // Limpa formulário
        setName("")
        setEmail("")
        setPassword("")
        setConfirmPassword("")
        
        // Remove mensagem de sucesso após 5 segundos
        setTimeout(() => setSuccessMessage(""), 5000)
      }
    } catch (error) {
      console.error("Erro ao criar conta:", error)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
          
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">Crie uma conta</h1>
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
              disabled={loading}
            >
              {loading ? "Criando conta..." : "Criar Conta"}
            </Button>
          </form>

          {/* Links de navegação */}
          <div className="text-center space-y-3">
            <p className="text-sm text-gray-600">
              Já tem uma conta?{" "}
              <Link href="/" className="text-cyan-600 hover:text-cyan-700 font-medium">
                Faça login aqui
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