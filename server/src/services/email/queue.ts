import { createRedisConnection } from '@/config/redis'
import type { EmailJobData, EmailQueueOptions } from '@/types/email'
import { Queue, Job } from 'bullmq'

export class EmailQueue {
  private queue: Queue
  private readonly queueName = 'email-queue'

  constructor() {
    const connection = createRedisConnection()
    
    this.queue = new Queue(this.queueName, {
      connection,
      defaultJobOptions: {
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 2000, // 2 segundos inicial
        },
        removeOnComplete: { count: 100 }, // Manter apenas os últimos 100 jobs completados
        removeOnFail: { count: 50 }, // Manter apenas os últimos 50 jobs falhados
      },
    })

    this.setupEventHandlers()
  }

  /**
   * Adiciona um e-mail à fila para processamento
   */
  async addEmailToQueue(
    emailData: EmailJobData,
    options: EmailQueueOptions = {}
  ): Promise<Job> {
    try {
      console.log(`📥 Adicionando e-mail à fila: ${emailData.subject}`)
      
      const job = await this.queue.add(
        'send-email',
        emailData,
        {
          attempts: options.attempts || 5,
          backoff: options.backoff || {
            type: 'exponential',
            delay: 2000,
          },
          delay: options.delay || 0,
          priority: options.priority || 0,
          removeOnComplete: options.removeOnComplete ?? 100,
          removeOnFail: options.removeOnFail ?? 50,
        }
      )

      console.log(`✅ E-mail adicionado à fila com sucesso. Job ID: ${job.id}`)
      return job
      
    } catch (error) {
      console.error('❌ Erro ao adicionar e-mail à fila:', error)
      throw error
    }
  }

  /**
   * Adiciona múltiplos e-mails à fila
   */
  async addBulkEmailsToQueue(
    emailsData: EmailJobData[],
    options: EmailQueueOptions = {}
  ): Promise<Job[]> {
    try {
      console.log(`📥 Adicionando ${emailsData.length} e-mails à fila em lote`)
      
      const jobs = await Promise.all(
        emailsData.map(emailData => this.addEmailToQueue(emailData, options))
      )

      console.log(`✅ ${jobs.length} e-mails adicionados à fila com sucesso`)
      return jobs
      
    } catch (error) {
      console.error('❌ Erro ao adicionar e-mails em lote à fila:', error)
      throw error
    }
  }

  /**
   * Obtém estatísticas da fila
   */
  async getQueueStats() {
    try {
      const waiting = await this.queue.getWaiting()
      const active = await this.queue.getActive()
      const completed = await this.queue.getCompleted()
      const failed = await this.queue.getFailed()
      const delayed = await this.queue.getDelayed()

      return {
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length,
        delayed: delayed.length,
        total: waiting.length + active.length + completed.length + failed.length + delayed.length,
      }
    } catch (error) {
      console.error('❌ Erro ao obter estatísticas da fila:', error)
      throw error
    }
  }

  /**
   * Limpa a fila (remove todos os jobs)
   */
  async clearQueue(): Promise<void> {
    try {
      await this.queue.obliterate({ force: true })
      console.log('🧹 Fila limpa com sucesso')
    } catch (error) {
      console.error('❌ Erro ao limpar fila:', error)
      throw error
    }
  }

  /**
   * Pausa a fila (para manutenção)
   */
  async pauseQueue(): Promise<void> {
    try {
      await this.queue.pause()
      console.log('⏸️ Fila pausada')
    } catch (error) {
      console.error('❌ Erro ao pausar fila:', error)
      throw error
    }
  }

  /**
   * Resume a fila
   */
  async resumeQueue(): Promise<void> {
    try {
      await this.queue.resume()
      console.log('▶️ Fila resumida')
    } catch (error) {
      console.error('❌ Erro ao resumir fila:', error)
      throw error
    }
  }

  /**
   * Configura handlers de eventos da fila
   */
  private setupEventHandlers(): void {
    this.queue.on('error', (error) => {
      console.error('❌ Erro na fila:', error)
      
      // Tentar reconectar em caso de erro
      if (error.message?.includes('timeout') || error.message?.includes('Connection')) {
        console.log('🔄 Tentando reconectar à fila...')
        setTimeout(() => {
          this.reconnect()
        }, 5000)
      }
    })

    this.queue.on('waiting', (job) => {
      console.log(`⏳ Job ${job.id} aguardando processamento`)
    })
  }

  /**
   * Reconecta à fila em caso de erro
   */
  private async reconnect(): Promise<void> {
    try {
      console.log('🔄 Reconectando à fila...')
      await this.queue.close()
      
      const connection = createRedisConnection()
      this.queue = new Queue(this.queueName, {
        connection,
        defaultJobOptions: {
          attempts: 5,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: { count: 100 },
          removeOnFail: { count: 50 },
        },
      })
      
      this.setupEventHandlers()
      console.log('✅ Reconectado à fila com sucesso')
    } catch (error) {
      console.error('❌ Erro ao reconectar à fila:', error)
    }
  }

  /**
   * Fecha a conexão com a fila
   */
  async close(): Promise<void> {
    try {
      await this.queue.close()
      console.log('🔌 Conexões da fila fechadas com sucesso')
    } catch (error) {
      console.error('❌ Erro ao fechar conexões da fila:', error)
    }
  }
}
