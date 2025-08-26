import { Auth } from '@/database/entity/Auth.js'
import { Log, repository } from '@/database/index.js'
import { getCookieOptions } from '@/utils/cookie'
import { timer } from '@/utils/timer.js'
import { Method } from '@asterflow/router'
import jwt from 'jsonwebtoken'
import moment from 'moment'
import { z } from 'zod'

export default new Method({
  name: 'User Authentication',
  description: 'Authenticate user credentials and issue JWT tokens for secure access',
  schema: z.object({
    email: z.string().email(),
    password: z.string().min(8)
  }),
  method: 'post',
  handler: async ({ response, schema }) => {
    const user = await repository.user
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email: schema.email })
      .getOne()
    if (!user) return response.code(403).send({ message: 'Invalid email or password' })

    const valid = await user.validatePassword(schema.password)
    if (!valid) return response.code(403).send({ message: 'Invalid email or password' })

    const expiresTokenInSeconds = timer.number(process.env.JWT_EXPIRE ?? '7d') as number
    const expiresRefreshInSeconds = timer.number(process.env.REFRESH_EXPIRE ?? '7d') as number

    const expirationTokenDate = new Date(Date.now() + expiresTokenInSeconds)
    const expirationRefreshDate = new Date(Date.now() + expiresRefreshInSeconds)

    const data = {
      id: user.id,
      username: user.username,
      email: user.email
    }

    const accessToken = jwt.sign(data, process.env.JWT_TOKEN as string, {
      expiresIn: expiresTokenInSeconds,
      algorithm: 'HS512'
    })

    const refreshToken = jwt.sign(data, process.env.REFRESH_TOKEN as string, {
      expiresIn: expiresRefreshInSeconds,
      algorithm: 'HS512'
    })

    await Auth.create({
      accessToken,
      refreshToken,
      user,
      expireAt: moment(expirationRefreshDate.toISOString()).format('YYYY-MM-DD HH:mm:ss.SSS')
    }).save()


    response.setCookie('Bearer', accessToken, getCookieOptions(expirationTokenDate))
    response.setCookie('Refresh', refreshToken, getCookieOptions(expirationRefreshDate))

    // Log: user login
    await Log.create({
      code: 'user:login',
      data: { id: user.id, ownerId: user.id, username: user.username, email: user.email },
      user: { id: user.id }
    }).save()

    return response.code(200).send({
      message: 'Login successful',
      data: {
        accessToken: {
          token: accessToken,
          expireDate: expirationTokenDate,
          expireSeconds: expiresTokenInSeconds
        },
        refreshToken: {
          token: refreshToken,
          expireDate: expirationRefreshDate,
          expireSeconds: expiresRefreshInSeconds
        },
      }
    })
  },
})