import QueueBull, { type QueueOptions, type Queue as QueueType } from 'bull'

export class Queue<T> extends QueueBull<T> {
  private queues: Record<string, QueueType> = {}

  constructor(queueName: string, opts?: QueueOptions) {
    super(queueName, {
      ...opts,
      defaultJobOptions: {
        attempts: 2,
      },
      redis: {
        host: process.env['REDIS_HOST'],
        port: Number(process.env['REDIS_PORT']),
        password: String(process.env['REDIS_PASSWORD']).length === 0 ? undefined : String(process.env['REDIS_PASSWORD'])
      }
    })

    this.queues[this.name] = Object.assign(this, { queues: null })
  }
}