import { Router } from '@/controllers/router'
import { Product } from '@/database/entity/Product'
import { ProductType } from '@/database/entity/ProductType'
import { Project } from '@/database/entity/Project'
import { Tag } from '@/database/entity/Tag'
import { repository } from '@/database/index'
import { ProjectStatus } from '@/database/enums'
import { z } from 'zod'

// Função para normalizar strings (remover acentos e converter para minúsculas)
const normalizeString = (str: string) => {
  return str.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

export default new Router({
  name: 'Create Product',
  path: '/products',
  description: 'Create a new product with smart tags system and image support',
  authenticate: true,
  schema: {
    post: z.object({
      name: z.string().min(1).max(255),
      location: z.string().min(1).max(255),
      quantity: z.number().int().min(0),
      tags: z.array(z.string().min(1).max(100)).min(1),
      image: z.string().optional(),
      barcode: z.string().optional(),
      typeId: z.number().int().optional(),
      projectId: z.number().int().optional()
    })
  },
  methods: {
    async post({ reply, schema, request }) {
      try {
        // Validar e buscar ProductType (usar um padrão se não fornecido)
        let productType: ProductType | null = null
        if (schema.typeId) {
          productType = await repository.productType.findOneBy({ id: schema.typeId })
          if (!productType) {
            return reply.status(404).send({
              message: 'Tipo de produto não encontrado'
            })
          }
        } else {
          // Buscar ou criar um tipo padrão
          productType = await repository.productType.findOneBy({ name: 'Geral' })
          if (!productType) {
            const newProductType = repository.productType.create({ name: 'Geral' })
            productType = await repository.productType.save(newProductType)
          }
        }

        // Validar e buscar Project (usar um padrão se não fornecido)
        let project: Project | null = null
        if (schema.projectId) {
          project = await repository.project.findOneBy({ id: schema.projectId })
          if (!project) {
            return reply.status(404).send({
              message: 'Projeto não encontrado'
            })
          }
        } else {
          // Buscar ou criar um projeto padrão
          project = await repository.project.findOneBy({ name: 'Estoque Geral' })
          if (!project) {
            const newProject = repository.project.create({ 
              name: 'Estoque Geral',
              status: ProjectStatus.InProgress
            })
            project = await repository.project.save(newProject)
          }
        }

        // Processar tags com normalização e evitar duplicatas
        const processedTags: Tag[] = []
        
        for (const tagName of schema.tags) {
          const trimmedTagName = tagName.trim()
          if (!trimmedTagName) continue

          const normalizedTagName = normalizeString(trimmedTagName)
          
          // Verificar se a tag já existe (case-insensitive)
          let existingTag = await repository.tag.findOneBy({ 
            normalizedName: normalizedTagName 
          })
          
          if (existingTag) {
            processedTags.push(existingTag)
          } else {
            // Criar nova tag
            const newTag = repository.tag.create({
              name: trimmedTagName,
              normalizedName: normalizedTagName
            })
            const savedTag = await repository.tag.save(newTag)
            processedTags.push(savedTag)
          }
        }

        // Criar o produto
        const productData = repository.product.create({
          name: schema.name,
          location: schema.location,
          quantity: schema.quantity,
          image: schema.image,
          barcode: schema.barcode,
          type: productType,
          project: project,
          tags: processedTags
        })

        const savedProduct = await repository.product.save(productData)

        // Buscar o produto completo com relações para retorno
        const completeProduct = await repository.product.findOne({
          where: { id: savedProduct.id },
          relations: ['tags', 'type', 'project']
        })

        return reply.code(201).send({
          message: 'Produto cadastrado com sucesso!',
          data: {
            id: completeProduct!.id,
            name: completeProduct!.name,
            location: completeProduct!.location,
            quantity: completeProduct!.quantity,
            image: completeProduct!.image,
            barcode: completeProduct!.barcode,
            tags: completeProduct!.tags.map(tag => ({
              id: tag.id,
              name: tag.name
            })),
            type: {
              id: completeProduct!.type.id,
              name: completeProduct!.type.name
            },
            project: {
              id: completeProduct!.project.id,
              name: completeProduct!.project.name
            },
            createdAt: completeProduct!.createAt,
            updatedAt: completeProduct!.updateAt
          }
        })
        
      } catch (error) {
        console.error('Erro ao criar produto:', error)
        
        return reply.status(500).send({
          message: 'Erro interno do servidor ao criar produto'
        })
      }
    }
  }
}) 