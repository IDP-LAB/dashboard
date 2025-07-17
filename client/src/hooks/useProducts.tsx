import { useState } from 'react'

// Tipos
export type ProductType = {
  id: number;
  name: string;
  description?: string;
  location: string;
  quantity: number;
  tags: { id: number; name: string }[];
  image?: string;
  barcode?: string;
  type: { id: number; name: string };
  project: { id: number; name: string };
  createdAt: string;
  updatedAt: string;
}

export type CreateProductData = {
  name: string;
  description?: string;
  location?: string;
  quantity: number;
  category: string;
  tags: string[];
  image?: string;
  barcode?: string;
  typeId?: number;
  projectId?: number;
}

export type TagSuggestion = {
  id: number;
  name: string;
}

export type ProductMetadata = {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3500'

export function useProducts() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Criar produto
  const createProduct = async (productData: CreateProductData): Promise<ProductType | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Adicionar Authorization header quando implementado
        },
        credentials: 'include',
        body: JSON.stringify(productData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erro ao criar produto')
      }

      const result = await response.json()
      return result.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }

  // Buscar sugestões de tags
  const getTagSuggestions = async (search: string, limit: number = 10): Promise<TagSuggestion[]> => {
    setLoading(true)
    setError(null)

    try {
      const queryParams = new URLSearchParams({
        search,
        limit: limit.toString()
      })

      const response = await fetch(`${API_BASE}/products/tags?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erro ao buscar tags')
      }

      const result = await response.json()
      return result.data || []
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      return []
    } finally {
      setLoading(false)
    }
  }

  // Listar produtos
  const getProducts = async (page: number = 1, pageSize: number = 10): Promise<{ data: ProductType[]; metadata: ProductMetadata } | null> => {
    setLoading(true)
    setError(null)

    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString()
      })

      const response = await fetch(`${API_BASE}/products?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erro ao buscar produtos')
      }

      const result = await response.json()
      return {
        data: result.data || [],
        metadata: result.metadata || { total: 0, page: 1, pageSize: 10, totalPages: 0 }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    createProduct,
    getTagSuggestions,
    getProducts,
    clearError: () => setError(null)
  }
} 