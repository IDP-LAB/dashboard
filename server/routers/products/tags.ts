import { Router } from '@/controllers/router'
import { repository } from '@/database/index'
import { z } from 'zod'

// Função para normalizar strings (remover acentos e converter para minúsculas)
const normalizeString = (str: string) => {
  return str.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

export default new Router({
  name: 'Get Tags',
  path: '/products/tags',
  description: 'Get tags for autocomplete with search functionality',
  authenticate: true,
  query: {
    get: z.object({
      search: z.string().optional(),
      limit: z.string().optional()
    })
  },
  methods: {
    async get({ reply, query }) {
      try {
        const limit = Math.min(Number(query.limit) || 10, 50) // Máximo 50 tags
        const searchTerm = query.search?.trim()

        let tags
        
        if (searchTerm && searchTerm.length >= 2) {
          // Buscar tags que contenham o termo normalizado
          const normalizedSearch = normalizeString(searchTerm)
          
          tags = await repository.tag
            .createQueryBuilder('tag')
            .where('tag.normalizedName LIKE :search', { 
              search: `%${normalizedSearch}%` 
            })
            .orderBy('tag.name', 'ASC')
            .limit(limit)
            .getMany()
        } else {
          // Retornar tags mais populares/recentes
          tags = await repository.tag
            .createQueryBuilder('tag')
            .leftJoin('tag.products', 'product')
            .groupBy('tag.id')
            .orderBy('COUNT(product.id)', 'DESC')
            .addOrderBy('tag.name', 'ASC')
            .limit(limit)
            .getMany()
        }

        return reply.code(200).send({
          message: 'Tags recuperadas com sucesso',
          data: tags.map(tag => ({
            id: tag.id,
            name: tag.name
          }))
        })
        
      } catch (error) {
        console.error('Erro ao buscar tags:', error)
        
        return reply.status(500).send({
          message: 'Erro interno do servidor ao buscar tags',
          error: process.env.NODE_ENV === 'development' ? error : undefined
        })
      }
    }
  }
}) 