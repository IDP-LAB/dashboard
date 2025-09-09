import { createTransporter, emailConfig } from '@/config/email'
import type { EmailAttachment, EmailJobData, EmailJobResult } from '@/types/email'
import type { SendMailOptions, Transporter } from 'nodemailer'

export class EmailService {
  private transporter: Transporter
  private defaultFrom: string
  private maxRetries = 3
  private retryDelay = 2000

  constructor() {
    try {
      this.transporter = createTransporter()
      this.defaultFrom = emailConfig.auth.user
      
    } catch (error) {
      console.error('❌ Erro ao criar transporter SMTP:', error)
      throw error
    }
  }

  /**
   * Envia um e-mail usando o transporter configurado
   */
  async sendEmail(emailData: EmailJobData): Promise<EmailJobResult> {
    const startTime = Date.now()
    
    try {
      console.log(`📧 Iniciando envio de e-mail para: ${Array.isArray(emailData.to) ? emailData.to.join(', ') : emailData.to}`)
      
      // Validar dados do e-mail
      this.validateEmailData(emailData)
      
      // Preparar opções do e-mail
      const mailOptions: SendMailOptions = {
        from: emailData.from || this.defaultFrom,
        to: emailData.to,
        cc: emailData.cc,
        bcc: emailData.bcc,
        subject: emailData.subject,
        text: emailData.text,
        html: emailData.html,
        replyTo: emailData.replyTo,
        priority: emailData.priority ? this.mapPriority(emailData.priority) as any : undefined,
        attachments: emailData.attachments?.map(this.mapAttachment),
      }

      // Tentar enviar com retry automático
      const result = await this.sendWithRetry(mailOptions)
      
      const duration = Date.now() - startTime
      console.log(`✅ E-mail enviado com sucesso para ${Array.isArray(emailData.to) ? emailData.to.join(', ') : emailData.to} em ${duration}ms`)
      console.log(`📨 Message ID: ${result.messageId}`)
      console.log(`🔒 Enviado com criptografia TLS: ${emailConfig.secure ? 'Sim' : 'STARTTLS'}`)
      
      return {
        success: true,
        messageId: result.messageId,
        attempts: 1,
        timestamp: new Date(),
      }
      
    } catch (error) {
      const duration = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      console.error(`❌ Falha no envio de e-mail para ${Array.isArray(emailData.to) ? emailData.to.join(', ') : emailData.to} após ${duration}ms`)
      console.error(`🔍 Erro: ${errorMessage}`)
      
      return {
        success: false,
        error: errorMessage,
        attempts: 1,
        timestamp: new Date(),
      }
    }
  }

  /**
   * Envia e-mail com retry automático
   */
  private async sendWithRetry(mailOptions: SendMailOptions, attempt = 1): Promise<any> {
    try {
      return await this.transporter.sendMail(mailOptions)
    } catch (error) {
      if (attempt < this.maxRetries && this.isRetryableError(error)) {
        console.log(`🔄 Tentativa ${attempt} falhou, tentando novamente em ${this.retryDelay}ms...`)
        await new Promise(resolve => setTimeout(resolve, this.retryDelay))
        
        // Tentar reconectar se for erro de conexão
        if (this.isConnectionError(error)) {
          await this.reconnect()
        }
        
        return this.sendWithRetry(mailOptions, attempt + 1)
      }
      throw error
    }
  }

  /**
   * Verifica se o erro é retryable
   */
  private isRetryableError(error: any): boolean {
    if (!error) return false
    
    const retryableErrors = [
      'ECONNRESET',
      'ETIMEDOUT',
      'ECONNREFUSED',
      'ENOTFOUND',
      'getaddrinfo ENOTFOUND',
      'timeout',
      'Connection timeout'
    ]
    
    return retryableErrors.some(retryableError => 
      error.message?.includes(retryableError) || 
      error.code === retryableError
    )
  }

  /**
   * Verifica se o erro é de conexão
   */
  private isConnectionError(error: any): boolean {
    if (!error) return false
    
    const connectionErrors = [
      'ECONNRESET',
      'ECONNREFUSED',
      'ENOTFOUND',
      'getaddrinfo ENOTFOUND'
    ]
    
    return connectionErrors.some(connError => 
      error.message?.includes(connError) || 
      error.code === connError
    )
  }

  /**
   * Valida dados do e-mail antes do envio
   */
  private validateEmailData(emailData: EmailJobData): void {
    if (!emailData.to || (Array.isArray(emailData.to) && emailData.to.length === 0)) {
      throw new Error('Destinatário é obrigatório')
    }
    
    if (!emailData.subject || emailData.subject.trim() === '') {
      throw new Error('Assunto é obrigatório')
    }
    
    if (!emailData.text && !emailData.html) {
      throw new Error('Conteúdo do e-mail é obrigatório (text ou html)')
    }
    
    // Validar formato dos e-mails
    const emails = Array.isArray(emailData.to) ? emailData.to : [emailData.to]
    for (const email of emails) {
      if (!this.isValidEmail(email)) throw new Error(`E-mail inválido: ${email}`)
    }
  }

  /**
   * Valida formato de e-mail
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * Verifica se a conexão SMTP está funcionando
   */
  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify()
      console.log('✅ Conexão SMTP verificada com sucesso')
      return true
    } catch (error) {
      console.error('❌ Falha na verificação da conexão SMTP:', error)
      return false
    }
  }

  /**
   * Reconecta ao servidor SMTP em caso de falha
   */
  async reconnect(): Promise<void> {
    try {
      console.log('🔄 Reconectando ao servidor SMTP...')
      this.transporter = createTransporter()
      await this.verifyConnection()
      console.log('🔄 Reconectado ao servidor SMTP com sucesso')
    } catch (error) {
      console.error('❌ Falha na reconexão ao servidor SMTP:', error)
      throw error
    }
  }

  /**
   * Mapeia a prioridade do e-mail para o formato do Nodemailer
   */
  private mapPriority(priority?: 'high' | 'normal' | 'low' | string): string | undefined {
    switch (priority) {
    case 'high':
      return 'urgent'
    case 'low':
      return 'non-urgent'
    case 'normal':
      return 'normal'
    default:
      // Para outros valores de string, usar como está
      return priority
    }
  }

  /**
   * Mapeia anexos para o formato do Nodemailer
   */
  private mapAttachment(attachment: EmailAttachment): Record<string, unknown> {
    return {
      filename: attachment.filename,
      content: attachment.content,
      contentType: attachment.contentType,
      cid: attachment.cid,
    }
  }

  /**
   * Fecha a conexão com o servidor SMTP
   */
  async close(): Promise<void> {
    try {
      await this.transporter.close()
      console.log('🔌 Conexão SMTP fechada com sucesso')
    } catch (error) {
      console.error('❌ Erro ao fechar conexão SMTP:', error)
    }
  }
}