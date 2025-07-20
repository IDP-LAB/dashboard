import { Router } from '@/controllers/router.js'
import { formatUptime } from '@/utils/timer'
import { uptime } from 'process'

export default new Router({
  name: 'API Root',
  description: 'Main API endpoint for system health check and basic information',
  methods: {
    get({ reply }) {
      const uptimeValue = uptime()

      return reply.code(200).send({
        message: 'API is running',
        data: {
          uptime: {
            timestamp: uptimeValue,
            label: formatUptime(uptimeValue)
          }
        }
      })
    }
  },
})