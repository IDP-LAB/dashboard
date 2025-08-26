import { authTreeRepository } from '@/database/index.js'
import { Method } from '@asterflow/router'

export default new Method({
  name: 'User Logout',
  description: 'Invalidate and remove user authentication tokens',
  method: 'post',
  // authenticate: true,
  handler: async ({ response, request }) => {
    try {
      const token = request.headers['authorization'] ?? request.cookies['Bearer']
      if (!token)  return response.code(422).send({ message: 'Token not provided' })
  
      const auth = await authTreeRepository.findOne({ where: { accessToken: token } })
      if (!auth) return response.code(404).send({ message: 'Auth not found' })
  
      const ancestors = await authTreeRepository.findAncestors(auth)
      const descendants = await authTreeRepository.findDescendants(auth)
      const nodesToRemove = Array.from([...descendants, ...ancestors])
  
      await authTreeRepository.remove(nodesToRemove)
      await auth.remove()
  
      return response.code(200).send({
        message: 'Logout successful, tokens removed.',
        data: undefined
      })
    } catch (error) {
      console.error('Logout error:', error)
      return response.code(500).send({ message: 'Internal server error' })
    }
  }
})
