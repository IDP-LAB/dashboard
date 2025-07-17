import { useState } from 'react'

// Tipos para as APIs de autenticação
export type SignupData = {
  name: string;
  username?: string;
  email: string;
  language?: string;
  password: string;
}

export type LoginData = {
  email: string;
  password: string;
}

export type AuthResponse = {
  message: string;
  data: {
    id?: number;
    name?: string;
    username?: string;
    email?: string;
    accessToken?: {
      token: string;
      expireDate: string;
      expireSeconds: number;
    };
    refreshToken?: {
      token: string;
      expireDate: string;
      expireSeconds: number;
    };
  };
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3500'

export function useAuth() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Função para criar conta
  const signup = async (signupData: SignupData): Promise<AuthResponse | null> => {
    setLoading(true)
    setError(null)

    try {
      // Adicionar username baseado no email se não fornecido
      const dataToSend = {
        ...signupData,
        username: signupData.username || signupData.email.split('@')[0],
        language: signupData.language || 'pt-BR'
      }

      const response = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(dataToSend)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erro ao criar conta')
      }

      const result = await response.json()
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }

  // Função para fazer login
  const login = async (loginData: LoginData): Promise<AuthResponse | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(loginData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erro ao fazer login')
      }

      const result = await response.json()
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }

  // Função para logout
  const logout = async (): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erro ao fazer logout')
      }

      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    signup,
    login,
    logout,
    clearError: () => setError(null)
  }
} 