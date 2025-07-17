"use client"

import { useState, FormEvent, ChangeEvent, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Scanner } from "@yudiel/react-qr-scanner"
import { useProducts, type CreateProductData, type TagSuggestion, type ProductType } from "@/hooks/useProducts"

// Types for scanner results
interface IDetectedBarcode {
  rawValue: string;
}

// Type for tag in product display
interface ProductTag {
  id: number;
  name: string;
}

export function ProductRegister() {
  // Hooks da API
  const { error, createProduct, getTagSuggestions, clearError } = useProducts()

  // Tipagem local para o formulário
  type FormProductType = {
    name: string;
    description?: string;
    location?: string;
    quantity: number;
    category: string;
    tags: string[];
    image?: string;
    barcode?: string;
  }

  // Estado para um produto no formulário
  const [product, setProduct] = useState<FormProductType>({
    name: "",
    description: "",
    location: "",
    quantity: 0,
    category: "",
    tags: [],
    image: "",
    barcode: ""
  })

  // Estado para lista dos produtos (agora apenas para exibição local)
  const [productList, setProductList] = useState<ProductType[]>([])
  
  // Estados para o sistema de tags
  const [tagInput, setTagInput] = useState("")
  const [suggestedTags, setSuggestedTags] = useState<TagSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loadingTags, setLoadingTags] = useState(false)
  
  // Estado para preview da imagem
  const [imagePreview, setImagePreview] = useState<string>("")
  
  // Estados para o scanner de código de barras
  const [showScanner, setShowScanner] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  
  // Estados para feedback
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string>("")
  
  // Refs
  const tagInputRef = useRef<HTMLInputElement>(null)

  // Detectar se é mobile
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
    }
    
    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

  // Função para normalizar strings (remover acentos e converter para minúsculas)
  const normalizeString = (str: string) => {
    return str.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
  }

  // Função para buscar sugestões de tags da API
  const fetchTagSuggestions = useCallback(async (input: string) => {
    if (input.length < 2) {
      setSuggestedTags([])
      setShowSuggestions(false)
      return
    }
    
    setLoadingTags(true)
    try {
      const suggestions = await getTagSuggestions(input, 5)
      // Filtrar tags que já estão selecionadas
      const filteredSuggestions = suggestions.filter(suggestion => 
        !product.tags.some(existingTag => 
          normalizeString(existingTag) === normalizeString(suggestion.name)
        )
      )
      
      setSuggestedTags(filteredSuggestions)
      setShowSuggestions(filteredSuggestions.length > 0)
    } catch (err) {
      console.error('Erro ao buscar sugestões:', err)
      setSuggestedTags([])
      setShowSuggestions(false)
    } finally {
      setLoadingTags(false)
    }
  }, [product.tags, getTagSuggestions])

  // Debounce para busca de tags
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (tagInput.trim()) {
        fetchTagSuggestions(tagInput.trim())
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [tagInput, fetchTagSuggestions])

  // Função para lidar com mudanças no input de tags
  const handleTagInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setTagInput(value)
    
    if (value.length < 2) {
      setSuggestedTags([])
      setShowSuggestions(false)
    }
  }

  // Função para adicionar tag
  const addTag = (tag: string) => {
    const trimmedTag = tag.trim()
    if (!trimmedTag) return
    
    const normalizedNewTag = normalizeString(trimmedTag)
    
    // Verificar se a tag já existe (case-insensitive)
    const tagExists = product.tags.some(existingTag => 
      normalizeString(existingTag) === normalizedNewTag
    )
    
    if (!tagExists) {
      setProduct(prev => ({
        ...prev,
        tags: [...prev.tags, trimmedTag]
      }))
    }
    
    setTagInput("")
    setShowSuggestions(false)
  }

  // Função para lidar com teclas no input de tags
  const handleTagInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      addTag(tagInput)
    } else if (event.key === 'Escape') {
      setShowSuggestions(false)
    }
  }

  // Função para remover tag
  const removeTag = (indexToRemove: number) => {
    setProduct(prev => ({
      ...prev,
      tags: prev.tags.filter((_, index) => index !== indexToRemove)
    }))
  }

  // Função para lidar com mudanças nos outros inputs
  const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target
    
    setProduct(prev => ({
      ...prev,
      [name]: name === 'quantity' ? Number(value) : value
    }))
  }

  // Função para lidar com upload de imagem
  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    
    if (file) {
      // Verificar se é uma imagem
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione apenas arquivos de imagem')
        return
      }
      
      // Verificar tamanho (limite de 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('A imagem deve ter no máximo 5MB')
        return
      }
      
      // Criar URL para preview
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setImagePreview(result)
        setProduct(prev => ({
          ...prev,
          image: result
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  // Função para remover imagem
  const removeImage = () => {
    setImagePreview("")
    setProduct(prev => ({
      ...prev,
      image: ""
    }))
    
    // Limpar o input file
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    if (fileInput) {
      fileInput.value = ""
    }
  }

  // Função para lidar com código de barras escaneado
  const handleBarcodeScan = (detectedCodes: IDetectedBarcode[]) => {
    if (detectedCodes && detectedCodes[0]?.rawValue) {
      setProduct(prev => ({
        ...prev,
        barcode: detectedCodes[0].rawValue
      }))
      setShowScanner(false)
    }
  }

  // Função para lidar com erro do scanner
  const handleScanError = (error: unknown) => {
    console.error('Erro no scanner:', error)
    alert('Erro ao acessar a câmera. Verifique as permissões.')
  }

  // Função para submeter o formulário
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    
    // Validar campos obrigatórios
    if (!product.name || !product.category || product.quantity <= 0 || product.tags.length === 0) {
      alert('Por favor, preencha todos os campos obrigatórios: Nome, Categoria, Quantidade e pelo menos uma Tag')
      return
    }
    
    setIsSubmitting(true)
    clearError()
    setSuccessMessage("")
    
    try {
      // Preparar dados para envio
      const productData: CreateProductData = {
        name: product.name,
        description: product.description || undefined,
        location: product.location || undefined,
        quantity: product.quantity,
        category: product.category,
        tags: product.tags,
        image: product.image,
        barcode: product.barcode
      }
      
      // Enviar para API
      const savedProduct = await createProduct(productData)
      
      if (savedProduct) {
        // Adicionar à lista local para exibição
        setProductList(prev => [savedProduct, ...prev])
        
        // Limpar formulário
        setProduct({
          name: "",
          description: "",
          location: "",
          quantity: 0,
          category: "",
          tags: [],
          image: "",
          barcode: ""
        })
        setTagInput("")
        setShowSuggestions(false)
        setImagePreview("")
        
        setSuccessMessage(`Produto "${savedProduct.name}" cadastrado com sucesso!`)
        
        // Remover mensagem de sucesso após 5 segundos
        setTimeout(() => setSuccessMessage(""), 5000)
      }
    } catch (err) {
      console.error('Erro ao cadastrar produto:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

    return (
    <div className="container mx-auto px-3 py-2 max-w-xl min-h-screen overflow-hidden">
      <div className="mb-3">
        <h1 className="text-xl font-bold mb-1">Cadastro de Produtos</h1>
        <p className="text-sm text-gray-600">
          Preencha todos os campos obrigatórios <span className="text-red-500">(*)</span> para cadastrar o produto
        </p>
      </div>

      {/* Mensagens de feedback */}
      {error && (
        <div className="mb-3 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
          <div className="flex justify-between items-center">
            <span>{error}</span>
            <button onClick={clearError} className="text-red-700 hover:text-red-900">×</button>
          </div>
        </div>
      )}
      
      {successMessage && (
        <div className="mb-3 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md">
          <div className="flex justify-between items-center">
            <span>{successMessage}</span>
            <button onClick={() => setSuccessMessage("")} className="text-green-700 hover:text-green-900">×</button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Nome do produto - OBRIGATÓRIO */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Nome do Produto <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            name="name"
            value={product.name}
            onChange={handleInputChange}
            placeholder="Digite o nome do produto"
            required
            disabled={isSubmitting}
          />
        </div>

        {/* Descrição do produto - OPCIONAL */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Descrição
          </label>
          <textarea
            name="description"
            value={product.description}
            onChange={handleInputChange}
            placeholder="Descreva detalhadamente o produto (materiais, características, especificações técnicas...)"
            disabled={isSubmitting}
            rows={4}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 mt-1">
            Inclua informações técnicas, materiais, dimensões e características importantes
          </p>
        </div>

        {/* Localização - OPCIONAL */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Localização
          </label>
          <Input
            type="text"
            name="location"
            value={product.location}
            onChange={handleInputChange}
            placeholder="Digite onde o produto está localizado"
            disabled={isSubmitting}
          />
        </div>

        {/* Categoria - OBRIGATÓRIO */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Categoria <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            name="category"
            value={product.category}
            onChange={handleInputChange}
            placeholder="Ex: Filamento, Eletrônicos, Ferramentas, Peças..."
            required
            disabled={isSubmitting}
          />
          <p className="text-xs text-gray-500 mt-1">
            Categoria ou tipo do produto para organização
          </p>
        </div>

        {/* Quantidade - OBRIGATÓRIO */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Quantidade <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-1.5 bg-gray-50 p-1.5 rounded-lg border border-gray-200">
            {/* Botão de diminuir */}
            <button
              type="button"
              onClick={() => setProduct(prev => ({ ...prev, quantity: Math.max(0, prev.quantity - 1) }))}
              className="group bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-md w-7 h-7 flex items-center justify-center shadow-sm hover:shadow-red-500/20 transform hover:scale-102 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              disabled={product.quantity === 0 || isSubmitting}
            >
              <svg 
                className="w-3 h-3 group-hover:scale-105 transition-transform duration-200" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={3} 
                  d="M20 12H4" 
                />
              </svg>
            </button>

            {/* Display da quantidade */}
            <div className="flex-1 text-center">
              <div className="bg-white rounded-md py-1 px-1.5 border border-cyan-200 shadow-inner min-w-[60px]">
                <span className="text-base font-bold text-cyan-700">{product.quantity}</span>
                <p className="text-xs text-gray-500 leading-none">un.</p>
              </div>
            </div>

            {/* Botão de aumentar */}
            <button
              type="button"
              onClick={() => setProduct(prev => ({ ...prev, quantity: prev.quantity + 1 }))}
              className="group bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-md w-7 h-7 flex items-center justify-center shadow-sm hover:shadow-emerald-500/20 transform hover:scale-102 active:scale-95 transition-all duration-200"
              disabled={isSubmitting}
            >
              <svg 
                className="w-3 h-3 group-hover:scale-105 transition-transform duration-200" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={3} 
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6" 
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Imagem - OPCIONAL */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Imagem
          </label>
          
          {/* Preview da imagem */}
          {imagePreview && (
            <div className="mb-3 relative inline-block">
              <img 
                src={imagePreview} 
                alt="Preview"
                className="w-32 h-32 object-cover rounded-lg border"
              />
              <button
                type="button"
                onClick={removeImage}
                className="group absolute -top-2 -right-2 bg-gradient-to-br from-red-500 via-rose-500 to-pink-600 hover:from-red-600 hover:via-rose-600 hover:to-pink-700 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-2xl hover:shadow-red-500/40 transform hover:scale-125 active:scale-90 transition-all duration-300 ease-out ring-2 ring-white/20 hover:ring-white/40"
                disabled={isSubmitting}
              >
                <svg 
                  className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth={3}
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    d="M6 18L18 6M6 6l12 12" 
                  />
                </svg>
              </button>
            </div>
          )}
          
          {/* Input de arquivo */}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full p-2 border border-gray-300 rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            disabled={isSubmitting}
          />
          <p className="text-xs text-gray-500 mt-1">
            Selecione uma imagem (máx. 5MB)
          </p>
        </div>

        {/* Código de Barras - OPCIONAL */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Código de Barras
          </label>
          
          <div className="space-y-2">
            {/* Input para código de barras */}
            <div className="flex gap-2">
              <Input
                type="text"
                name="barcode"
                value={product.barcode || ""}
                onChange={handleInputChange}
                placeholder="Digite ou escaneie o código de barras"
                className="flex-1"
                disabled={isSubmitting}
              />
              
              {/* Botão para scanner (apenas no mobile) */}
              {isMobile && (
                <Button
                  type="button"
                  onClick={() => setShowScanner(true)}
                  className="group relative px-6 py-3 bg-gradient-to-br from-emerald-500 via-cyan-500 to-teal-600 hover:from-emerald-600 hover:via-cyan-600 hover:to-teal-700 text-white font-semibold rounded-xl shadow-xl hover:shadow-emerald-500/30 transform hover:scale-110 active:scale-95 transition-all duration-300 ease-out overflow-hidden"
                  disabled={isSubmitting}
                >
                  {/* Efeito de brilho */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  
                  {/* Conteúdo do botão */}
                  <div className="relative flex items-center gap-2">
                    <div className="bg-white/20 rounded-lg p-0.5">
                      <svg 
                        className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2.5} 
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" 
                        />
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2.5} 
                          d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" 
                        />
                      </svg>
                    </div>
                    <span className="font-bold">Escanear</span>
                  </div>
                </Button>
              )}
            </div>
            
            {!isMobile && (
              <p className="text-xs text-gray-500">
                🔍 Scanner disponível apenas em dispositivos móveis
              </p>
            )}
          </div>
        </div>

        {/* Sistema de Tags Inteligentes - OBRIGATÓRIO */}
        <div className="relative">
          <label className="block text-sm font-medium mb-1">
            Tags <span className="text-red-500">*</span>
          </label>
          
          {/* Tags já adicionadas */}
          {product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2 p-2 border border-gray-200 rounded-md bg-gray-50">
              {product.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(index)}
                    className="text-blue-600 hover:text-blue-800 font-bold"
                    disabled={isSubmitting}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
          
          {/* Input para adicionar tags */}
          <div className="relative">
            <Input
              ref={tagInputRef}
              type="text"
              value={tagInput}
              onChange={handleTagInputChange}
              onKeyDown={handleTagInputKeyDown}
              onFocus={() => tagInput.length >= 2 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Digite uma tag e pressione Enter"
              disabled={isSubmitting}
            />
            
            {/* Indicador de carregamento das tags */}
            {loadingTags && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>
          
          {/* Sugestões de tags */}
          {showSuggestions && suggestedTags.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
              {suggestedTags.map((suggestion) => (
                <button
                  key={suggestion.id}
                  type="button"
                  onClick={() => addTag(suggestion.name)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 first:rounded-t-md last:rounded-b-md"
                  disabled={isSubmitting}
                >
                  {suggestion.name}
                </button>
              ))}
            </div>
          )}
          
          <p className="text-xs text-gray-500 mt-1">
            Digite pelo menos 2 caracteres para ver sugestões da API
          </p>
        </div>

        {/* Botão de submit - Design ultra moderno */}
        <div className="pt-3">
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="group relative w-full bg-gradient-to-r from-cyan-500 via-cyan-600 to-blue-600 hover:from-cyan-600 hover:via-blue-600 hover:to-gray-600 text-white font-bold py-3 px-4 rounded-xl shadow-xl hover:shadow-cyan-500/25 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 ease-out overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {/* Efeito de brilho animado */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out"></div>
            
            {/* Conteúdo do botão */}
            <div className="relative flex items-center justify-center gap-3">
              <div className="bg-white/20 rounded-full p-1">
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                ) : (
                  <svg 
                    className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2.5} 
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6" 
                    />
                  </svg>
                )}
              </div>
              <span className="text-base tracking-wide">
                {isSubmitting ? 'Cadastrando...' : 'Cadastrar Produto'}
              </span>
              <div className="w-2 h-2 bg-white/40 rounded-full group-hover:bg-white/80 transition-colors duration-300"></div>
            </div>
          </Button>
        </div>
            </form>

      {/* Modal do Scanner de Código de Barras */}
      {showScanner && isMobile && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 m-4 max-w-sm w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Escanear Código de Barras</h3>
              <button
                onClick={() => setShowScanner(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="aspect-square w-full mb-4 overflow-hidden rounded-lg">
              <Scanner
                onScan={handleBarcodeScan}
                onError={handleScanError}
                constraints={{
                  facingMode: 'environment' // Câmera traseira
                }}
                formats={[
                  'code_128',
                  'code_39',
                  'code_93',
                  'ean_13',
                  'ean_8',
                  'upc_a',
                  'upc_e',
                  'qr_code'
                ]}
                paused={false}
                styles={{
                  container: { width: '100%', height: '100%' },
                  video: { width: '100%', height: '100%', objectFit: 'cover' }
                }}
              />
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-3">
                Aponte a câmera para o código de barras
              </p>
              <Button
                onClick={() => setShowScanner(false)}
                className="w-full bg-gray-500 hover:bg-gray-600"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de produtos cadastrados - DADOS COMPLETOS */}
      {productList.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            📦 Produtos Cadastrados Recentemente
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              {productList.length} {productList.length === 1 ? 'item' : 'itens'}
            </span>
          </h2>
          
          <div className="space-y-6">
            {productList.map((item) => (
              <div key={item.id} className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex gap-6">
                  {/* Imagem do produto */}
                  {item.image && (
                    <div className="flex-shrink-0">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-24 h-24 object-cover rounded-lg border-2 border-gray-300 shadow-md"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                  
                  {/* Informações principais do produto */}
                  <div className="flex-1">
                    {/* Header com nome e ID */}
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-bold text-xl text-gray-800">{item.name}</h3>
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                        ID: #{item.id}
                      </div>
                    </div>
                    
                    {/* Informações básicas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">📍</span>
                        <div>
                          <span className="text-xs text-gray-500 block">Localização</span>
                          <span className="font-medium text-gray-800">{item.location}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-lg">📦</span>
                        <div>
                          <span className="text-xs text-gray-500 block">Quantidade</span>
                          <span className="font-bold text-green-600">{item.quantity} unidades</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Código de barras */}
                    {item.barcode && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg border">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">📊</span>
                          <div>
                            <span className="text-xs text-gray-500 block">Código de Barras</span>
                            <span className="font-mono text-sm font-medium text-gray-800">{item.barcode}</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Descrição (se existir) */}
                    {item.description && (
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <span className="text-xs text-blue-600 font-medium block mb-1">📝 Descrição</span>
                        <p className="text-sm text-gray-700 leading-relaxed">{item.description}</p>
                      </div>
                    )}
                    
                    {/* Tags */}
                    {item.tags && item.tags.length > 0 && (
                      <div className="mb-4">
                        <span className="text-xs text-gray-500 block mb-2">🏷️ Tags Associadas</span>
                        <div className="flex flex-wrap gap-2">
                          {item.tags.map((tag: ProductTag) => (
                            <span 
                              key={tag.id} 
                              className="inline-flex items-center gap-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs px-3 py-1 rounded-full font-medium shadow-sm"
                            >
                              {typeof tag === 'object' ? (
                                <>
                                  <span className="text-xs opacity-75">#{tag.id}</span>
                                  {tag.name}
                                </>
                              ) : (
                                tag
                              )}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Relacionamentos - Tipo e Projeto */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                      {item.type && (
                        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                          <span className="text-xs text-green-600 font-medium block">🗂️ Tipo de Produto</span>
                          <span className="text-sm font-medium text-gray-800">
                            {item.type.name} <span className="text-xs text-gray-500">(ID: {item.type.id})</span>
                          </span>
                        </div>
                      )}
                      
                      {item.project && (
                        <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                          <span className="text-xs text-orange-600 font-medium block">🚀 Projeto</span>
                          <span className="text-sm font-medium text-gray-800">
                            {item.project.name} <span className="text-xs text-gray-500">(ID: {item.project.id})</span>
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Metadados de auditoria */}
                    <div className="border-t pt-3 mt-4">
                      <span className="text-xs text-gray-500 font-medium block mb-2">⏱️ Dados de Auditoria</span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-green-500">✨</span>
                          <div>
                            <span className="text-gray-500">Criado em:</span>
                            <br />
                            <span className="font-mono text-gray-700">
                              {new Date(item.createdAt).toLocaleString('pt-BR')}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-blue-500">🔄</span>
                          <div>
                            <span className="text-gray-500">Atualizado em:</span>
                            <br />
                            <span className="font-mono text-gray-700">
                              {new Date(item.updatedAt).toLocaleString('pt-BR')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Dados técnicos adicionais */}
                    <div className="mt-3 p-2 bg-gray-100 rounded text-xs">
                      <details className="cursor-pointer">
                        <summary className="font-medium text-gray-600 hover:text-gray-800">
                          🔍 Dados Técnicos Completos
                        </summary>
                        <pre className="mt-2 text-xs bg-gray-800 text-green-400 p-3 rounded overflow-x-auto font-mono">
{JSON.stringify(item, null, 2)}
                        </pre>
                      </details>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}