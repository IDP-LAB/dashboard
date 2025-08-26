import { User } from '@/database/entity/User'
import { Method } from '@asterflow/router'

export default new Method({
  name: 'Get User Profile',
  description: 'Get current user profile with all related data',
  method: 'get',
  // authenticate: true,
  handler: async ({ response, request }) => {
    const user = await User.findOne({
      where: { id: request.user.id }
    })
  
    if (!user) return response.status(404).send({
      message: 'User not found'
    })
  
    return response.code(200).send({
      message: 'Profile retrieved successfully',
      data: user
    })
  }
}) 