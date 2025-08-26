import InviteById from '../routers/invite/$id/index.js'
import InviteClaim from '../routers/invite/$code.js'

export const routers = {
  '/invite/:code': InviteClaim,
  '/invite/id/:id=number': InviteById
}
