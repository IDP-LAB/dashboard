import { createRedisConnection } from '@/config/redis'
import type { EmailJobData, EmailJobResult } from '@/types/email'
import { Job, Worker } from 'bullmq'
import { EmailService } from './service'

export class EmailWorker {
  private worker: Worker
  private emailService: EmailService
  private readonly queueName = 'email-queue'
  private connectionRetries = 0
  private maxConnectionRetries = 3
  isRunning = false
  
  constructor() {
    try {
      const connection = createRedisConnection()
      this.emailService = new EmailService()
      
      this.worker = new Worker(
        this.queueName,
        async (job: Job<EmailJobData>) => {
          return await this.processEmailJob(job)
        },
        {
          connection,
          concurrency: 3, // Reduzido para 3 para evitar sobrecarga
          removeOnComplete: { count: 100 },
          removeOnFail: { count: 50 },
        }
      )

      this.setupEventHandlers()
    } catch (error) {
      console.error('❌ Erro ao inicializar EmailWorker:', error)
      throw error
    }
  }

  /**
   * Processa um job de e-mail
   */
  private async processEmailJob(job: Job<EmailJobData>): Promise<EmailJobResult> {
    const startTime = Date.now()
    const attemptNumber = job.attemptsMade + 1
    
    try {
      console.log(`📧 Processando job ${job.id} (tentativa ${attemptNumber}/${job.opts.attempts})`)
      console.log(`📨 E-mail para: ${Array.isArray(job.data.to) ? job.data.to.join(', ') : job.data.to}`)
      console.log(`📝 Assunto: ${job.data.subject}`)
      
      // Verificar conexão SMTP antes de tentar enviar
      if (attemptNumber === 1) {
        const isConnected = await this.emailService.verifyConnection()
        if (!isConnected) {
          console.warn('⚠️ Conexão SMTP não verificada, tentando reconectar...')
          await this.handleSMTPReconnection()
        }
      }

      // Tentar enviar o e-mail
      const result = await this.emailService.sendEmail(job.data)
      
      if (result.success) {
        const duration = Date.now() - startTime
        console.log(`✅ Job ${job.id} processado com sucesso em ${duration}ms`)
        
        // Resetar contador de retentativas de conexão em caso de sucesso
        this.connectionRetries = 0
        
        return {
          ...result,
          attempts: attemptNumber,
        }
      } else {
        throw new Error(result.error || 'Falha desconhecida no envio do e-mail')
      }
      
    } catch (error) {
      const duration = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      console.error(`❌ Job ${job.id} falhou na tentativa ${attemptNumber} após ${duration}ms`)
      console.error(`🔍 Erro: ${errorMessage}`)
      
      // Se for a última tentativa, logar como falha definitiva
      if (attemptNumber >= (job.opts.attempts || 5)) {
        console.error(`💀 Job ${job.id} falhou definitivamente após ${attemptNumber} tentativas`)
        console.error('📧 Dados do e-mail:', {
          to: job.data.to,
          subject: job.data.subject,
          error: errorMessage,
        })
      }
      
      throw error
    }
  }

  /**
   * Gerencia reconexão SMTP com retentativas limitadas
   */
  private async handleSMTPReconnection(): Promise<void> {
    if (this.connectionRetries >= this.maxConnectionRetries) {
      console.error(`❌ Máximo de tentativas de reconexão SMTP atingido (${this.maxConnectionRetries})`)
      throw new Error('Falha na reconexão SMTP após múltiplas tentativas')
    }

    try {
      this.connectionRetries++
      console.log(`🔄 Tentativa de reconexão SMTP ${this.connectionRetries}/${this.maxConnectionRetries}`)
      
      await this.emailService.reconnect()
      console.log('✅ Reconexão SMTP bem-sucedida')
      
      // Resetar contador após sucesso
      this.connectionRetries = 0
    } catch (error) {
      console.error(`❌ Falha na reconexão SMTP (tentativa ${this.connectionRetries}):`, error)
      
      // Aguardar antes da próxima tentativa
      const delay = Math.min(1000 * Math.pow(2, this.connectionRetries), 10000)
      console.log(`⏳ Aguardando ${delay}ms antes da próxima tentativa...`)
      await new Promise(resolve => setTimeout(resolve, delay))
      
      throw error
    }
  }

  /**
   * Configura handlers de eventos do worker
   */
  private setupEventHandlers(): void {
    this.worker.on('ready', () => {
      this.isRunning = true
      console.log('🚀 Worker de e-mails iniciado e pronto para processar jobs')
    })

    this.worker.on('active', (job) => {
      console.log(`🔄 Worker iniciando processamento do job ${job.id}`)
    })

    this.worker.on('completed', (job) => {
      console.log(`✅ Worker completou job ${job.id} com sucesso`)
    })

    this.worker.on('failed', (job, err) => {
      if (job) {
        console.error(`❌ Worker falhou no job ${job.id}:`, err.message)
        
        // Se for a última tentativa, logar detalhes adicionais
        if (job.attemptsMade >= (job.opts.attempts || 5)) {
          console.error(`💀 Job ${job.id} falhou definitivamente no worker`)
          console.error('📧 Dados do e-mail:', job.data)
          console.error('🔍 Erro completo:', err)
        }
      } else {
        console.error('❌ Worker falhou em job desconhecido:', err.message)
      }
    })

    this.worker.on('error', (error) => {
      console.error('❌ Erro no worker de e-mails:', error)
    })

    this.worker.on('stalled', (jobId) => {
      console.warn(`⚠️ Job ${jobId} travado no worker`)
    })

    this.worker.on('closed', () => {
      this.isRunning = false
      console.log('🔌 Worker de e-mails fechado')
    })
  }

  /**
   * Obtém estatísticas do worker
   */
  async getWorkerStats() {
    try {
      return {
        isRunning: this.isRunning,
        waiting: 0, // Não podemos acessar a fila diretamente do worker
        active: 0,
        completed: 0,
        failed: 0,
        concurrency: this.worker.concurrency,
      }
    } catch (error) {
      console.error('❌ Erro ao obter estatísticas do worker:', error)
      throw error
    }
  }

  /**
   * Pausa o worker
   */
  async pauseWorker(): Promise<void> {
    try {
      await this.worker.pause()
      console.log('⏸️ Worker pausado')
    } catch (error) {
      console.error('❌ Erro ao pausar worker:', error)
      throw error
    }
  }

  /**
   * Resume o worker
   */
  async resumeWorker(): Promise<void> {
    try {
      await this.worker.resume()
      console.log('▶️ Worker resumido')
    } catch (error) {
      console.error('❌ Erro ao resumir worker:', error)
      throw error
    }
  }

  /**
   * Fecha o worker
   */
  async close(): Promise<void> {
    try {
      this.isRunning = false
      await this.worker.close()
      await this.emailService.close()
      console.log('🔌 Worker de e-mails fechado com sucesso')
    } catch (error) {
      console.error('❌ Erro ao fechar worker:', error)
    }
  }
}
