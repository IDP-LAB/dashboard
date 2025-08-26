import { Log, repository } from '@/database'
import { paginate, paginateSchema, paginateStringQuery } from '@/database/pagination'
import type { EventName } from '@/types/logs'
import { Method } from '@asterflow/router'
import { type FindOptionsWhere } from 'typeorm'
import { z } from 'zod'

const listLogsQuerySchema = paginateSchema.extend({
  code: z.string().optional(),
  userId: z.string().optional().transform((value) => value ? parseInt(value) : undefined)
})

export default new Method({
  name: 'List Logs',
  description: 'Retrieve paginated list of system logs with optional filtering by event type and user',
  method: 'get',
  // authenticate: [Role.Administrator],
  param: `?code&userId&${paginateStringQuery}`,
  handler: async ({ response, url }) => {
    const query = url.getSearchParams()
    // Validação dos parâmetros da query
    const validation = listLogsQuerySchema.safeParse(query)
    if (!validation.success) {
      return response.code(400).send({
        message: 'Parâmetros de consulta inválidos.',
        error: validation.error
      })
    }

    const { page, pageSize, interval, day, orderBy, orderDirection, code, userId } = validation.data

    try {
      // Criar condições de filtro
      const whereConditions: FindOptionsWhere<Log> = {}
        
      if (code) whereConditions.code = code as EventName
      if (userId) whereConditions.user = { id: userId }

      const paginated = await paginate({
        repository: repository.log,
        page,
        pageSize,
        interval,
        day,
        orderBy: orderBy || 'createdAt',
        orderDirection,
        relations: {
          user: {
            auths: false // Não carregar auths do usuário para performance
          }
        },
        ...whereConditions
      })

      return response.code(200).send({
        message: 'Logs recuperados com sucesso',
        ...paginated
      })
    } catch (error) {
      console.error('Erro ao buscar logs:', error)
      return response.code(500).send({ 
        message: 'Erro interno do servidor ao buscar logs' 
      })
    }
  }
})


