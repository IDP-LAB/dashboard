import type { EmailJobData, EmailJobResult, EmailQueueOptions } from "@/types/email"
import { EmailQueue } from "./queue"
import { EmailService } from "./service"
import { EmailWorker } from "./worker"

export class EmailManager {
  private emailService: EmailService
  private emailQueue: EmailQueue
  private emailWorker: EmailWorker
  private isInitialized = false

  constructor() {
    this.emailService = new EmailService()
    this.emailQueue = new EmailQueue()
    this.emailWorker = new EmailWorker()
  }

  /**
   * Inicializa o serviço de e-mails
   */
  async initialize(): Promise<void> {
    try {
      console.log('🚀 Inicializando serviço de e-mails...')
      
      // Verificar conexão SMTP
      const smtpConnected = await this.emailService.verifyConnection()
      if (!smtpConnected) {
        console.warn('⚠️ Conexão SMTP não pôde ser verificada inicialmente')
      }

      // Aguardar worker estar pronto com retentativas
      let attempts = 0
      const maxAttempts = 60 // Aumentado para 60 tentativas (1 minuto)
      
      while (!this.emailWorker.isRunning && attempts < maxAttempts) {
        console.log(`⏳ Aguardando worker inicializar... (${attempts + 1}/${maxAttempts})`)
        await new Promise(resolve => setTimeout(resolve, 1000))
        attempts++
        
        // Tentar reconectar se demorar muito
        if (attempts === 30) {
          console.log('🔄 Tentando reconectar ao worker...')
          try {
            await this.reconnectWorker()
          } catch (reconnectError) {
            console.warn('⚠️ Falha na reconexão do worker:', reconnectError)
          }
        }
      }

      if (this.emailWorker.isRunning) {
        this.isInitialized = true
        console.log('✅ Serviço de e-mails inicializado com sucesso')
      } else {
        throw new Error('Worker não iniciou dentro do tempo limite')
      }
      
    } catch (error) {
      console.error('❌ Erro ao inicializar serviço de e-mails:', error)
      throw error
    }
  }

  /**
   * Reconecta ao worker em caso de falha
   */
  private async reconnectWorker(): Promise<void> {
    try {
      console.log('🔄 Reconectando ao worker...')
      await this.emailWorker.close()
      
      // Aguardar um pouco antes de tentar novamente
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // O worker será recriado automaticamente no construtor
      console.log('✅ Worker reconectado')
    } catch (error) {
      console.error('❌ Erro ao reconectar ao worker:', error)
      throw error
    }
  }

  /**
   * Envia um e-mail imediatamente (síncrono)
   */
  async sendEmailImmediate(emailData: EmailJobData): Promise<EmailJobResult> {
    if (!this.isInitialized) throw new Error('Serviço de e-mails não foi inicializado')

    try {
      console.log('📧 Enviando e-mail imediatamente...')
      return await this.emailService.sendEmail(emailData)
    } catch (error) {
      console.error('❌ Erro no envio imediato:', error)
      throw error
    }
  }

  /**
   * Adiciona um e-mail à fila para processamento assíncrono
   */
  async queueEmail(emailData: EmailJobData, options: EmailQueueOptions = {}): Promise<string> {
    if (!this.isInitialized) throw new Error('Serviço de e-mails não foi inicializado')

    try {
      const job = await this.emailQueue.addEmailToQueue(emailData, options)
      return job.id as string
    } catch (error) {
      console.error('❌ Erro ao adicionar e-mail à fila:', error)
      throw error
    }
  }

  /**
   * Adiciona múltiplos e-mails à fila
   */
  async queueBulkEmails(emailsData: EmailJobData[], options: EmailQueueOptions = {}): Promise<string[]> {
    if (!this.isInitialized) throw new Error('Serviço de e-mails não foi inicializado')

    try {
      const jobs = await this.emailQueue.addBulkEmailsToQueue(emailsData, options)
      return jobs.map(job => job.id as string)
    } catch (error) {
      console.error('❌ Erro ao adicionar e-mails em lote à fila:', error)
      throw error
    }
  }

  /**
   * Obtém estatísticas do sistema de e-mails
   */
  async getStats() {
    if (!this.isInitialized) throw new Error('Serviço de e-mails não foi inicializado')

    try {
      const [queueStats, workerStats] = await Promise.all([
        this.emailQueue.getQueueStats(),
        this.emailWorker.getWorkerStats(),
      ])

      return {
        queue: queueStats,
        worker: workerStats,
        isInitialized: this.isInitialized,
        timestamp: new Date(),
      }
    } catch (error) {
      console.error('❌ Erro ao obter estatísticas:', error)
      throw error
    }
  }

  /**
   * Pausa o processamento de e-mails
   */
  async pauseEmailProcessing(): Promise<void> {
    if (!this.isInitialized) throw new Error('Serviço de e-mails não foi inicializado')

    try {
      await Promise.all([
        this.emailQueue.pauseQueue(),
        this.emailWorker.pauseWorker(),
      ])
      console.log('⏸️ Processamento de e-mails pausado')
    } catch (error) {
      console.error('❌ Erro ao pausar processamento:', error)
      throw error
    }
  }

  /**
   * Resume o processamento de e-mails
   */
  async resumeEmailProcessing(): Promise<void> {
    if (!this.isInitialized) throw new Error('Serviço de e-mails não foi inicializado')

    try {
      await Promise.all([
        this.emailQueue.resumeQueue(),
        this.emailWorker.resumeWorker(),
      ])
      console.log('▶️ Processamento de e-mails resumido')
    } catch (error) {
      console.error('❌ Erro ao resumir processamento:', error)
      throw error
    }
  }

  /**
   * Limpa a fila de e-mails
   */
  async clearEmailQueue(): Promise<void> {
    if (!this.isInitialized) throw new Error('Serviço de e-mails não foi inicializado')

    try {
      await this.emailQueue.clearQueue()
      console.log('🧹 Fila de e-mails limpa')
    } catch (error) {
      console.error('❌ Erro ao limpar fila:', error)
      throw error
    }
  }

  /**
   * Verifica a saúde do sistema de e-mails
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: Record<string, unknown>;
  }> {
    try {
      const smtpConnected = await this.emailService.verifyConnection()
      const workerRunning = this.emailWorker.isRunning
      const stats = await this.getStats()

      const isHealthy = smtpConnected && workerRunning && stats.queue.failed === 0
      const isDegraded = smtpConnected && workerRunning && stats.queue.failed > 0

      return {
        status: isHealthy ? 'healthy' : isDegraded ? 'degraded' : 'unhealthy',
        details: {
          smtpConnected,
          workerRunning,
          queueStats: stats.queue,
          workerStats: stats.worker,
          timestamp: new Date(),
        },
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date(),
        },
      }
    }
  }

  /**
   * Fecha o serviço de e-mails
   */
  async shutdown(): Promise<void> {
    try {
      console.log('🔄 Encerrando serviço de e-mails...')
      
      await Promise.all([
        this.emailService.close(),
        this.emailQueue.close(),
        this.emailWorker.close(),
      ])
      
      this.isInitialized = false
      console.log('✅ Serviço de e-mails encerrado com sucesso')
    } catch (error) {
      console.error('❌ Erro ao encerrar serviço de e-mails:', error)
    }
  }
}
