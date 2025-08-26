import { formatUptime } from '@/utils/timer'
import { Method } from '@asterflow/router'
import { uptime } from 'process'

export default new Method({
  name: 'API Root',
  description: 'Main API endpoint for system health check and basic information',
  method: 'get',
  handler: ({ response }) => {
    const uptimeValue = uptime()

    return response.code(200).send({
      message: 'API is running',
      data: {
        uptime: {
          timestamp: uptimeValue,
          label: formatUptime(uptimeValue)
        }
      }
    })
  }
})