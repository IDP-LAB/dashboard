import { Log } from '@/database'
import { Project } from '@/database/entity/Project'
import { ProjectStatus } from '@/database/enums'
import { Method } from '@asterflow/router'
import { z } from 'zod'

export default new Method({
  name: 'CreateProject',
  path: '/project',
  description: '[CRUD] Create Project',
  method: 'post',
  // authenticate: true,
  schema: z.object({
    name: z.string().min(4).max(64),
    status: z.nativeEnum(ProjectStatus).default(ProjectStatus.InProgress),
    memberships: z.array(z.number()).min(1).optional()
  }),
  handler: async ({ schema, response, request }) => {
    const project = await Project.create({
      name: schema.name,
      status: schema.status,
      products: [],
      memberships: schema.memberships?.map((id) => ({ id })),
      owner: {
        id: request.user.id
      }
    }).save()

    // Log padronizado: projeto criado
    await Log.create({
      code: 'project:created',
      data: { id: project.id, ownerId: request.user.id, name: project.name },
      user: { id: request.user.id }
    }).save()

    return response.code(201).send({
      message: 'Projeto criado com sucesso!',
      data: project
    })
  }
})