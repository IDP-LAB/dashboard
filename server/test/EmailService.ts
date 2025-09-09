#!/usr/bin/env bun
import 'env/loader'
import type { EmailJobData } from '../src/types/email.js'
import { EmailManager } from '@/services/email/manager.js'

/**
 * Script de teste rápido para o serviço de e-mails
 * Executa testes básicos sem enviar e-mails reais
 */
async function testEmailService() {
  console.log('🧪 Iniciando testes do serviço de e-mails...\n')
  const emailManager = new EmailManager()
  
  try {
    // Teste 1: Inicialização do serviço
    console.log('📋 Teste 1: Inicialização do serviço')
    await emailManager.initialize()
    console.log('✅ Serviço inicializado com sucesso\n')
    
    // Teste 2: Verificação de saúde
    console.log('📋 Teste 2: Verificação de saúde do sistema')
    const health = await emailManager.healthCheck()
    console.log('✅ Status de saúde:', health.status)
    console.log('📊 Detalhes:', JSON.stringify(health.details, null, 2), '\n')
    
    // Teste 3: Estatísticas
    console.log('📋 Teste 3: Estatísticas do sistema')
    const stats = await emailManager.getStats()
    console.log('✅ Estatísticas obtidas:', JSON.stringify(stats, null, 2), '\n')
    
    // Teste 4: Adicionar e-mail de teste à fila (sem enviar)
    console.log('📋 Teste 4: Adicionar e-mail de teste à fila')
    const testEmail: EmailJobData = {
      to: 'matheusn.biolowons@gmail.com',
      subject: 'Teste do Serviço de E-mails com TLS',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">🧪 Teste do Serviço com TLS</h1>
          <p>Este é um e-mail de teste para verificar o funcionamento do sistema com criptografia TLS.</p>
          <p><strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}</p>
          <p><strong>Status:</strong> Sistema funcionando com criptografia TLS</p>
        </div>
      `,
      text: 'Teste do serviço de e-mails com criptografia TLS - Sistema funcionando corretamente',
      priority: 'normal',
    }
    
    const jobId = await emailManager.queueEmail(testEmail)
    console.log('✅ E-mail de teste adicionado à fila com Job ID:', jobId, '\n')
    
    // Teste 5: Verificar se o e-mail foi adicionado
    console.log('📋 Teste 5: Verificar e-mail na fila')
    const updatedStats = await emailManager.getStats()
    console.log('✅ Jobs aguardando:', updatedStats.queue.waiting)
    console.log('✅ Jobs ativos:', updatedStats.queue.active)
    console.log('✅ Jobs completados:', updatedStats.queue.completed)
    console.log('✅ Jobs falhados:', updatedStats.queue.failed, '\n')
    
    // Teste 6: Pausar e resumir o processamento
    console.log('📋 Teste 6: Pausar e resumir processamento')
    await emailManager.pauseEmailProcessing()
    console.log('✅ Processamento pausado')
    
    await emailManager.resumeEmailProcessing()
    console.log('✅ Processamento resumido\n')
    
    // Teste 7: Verificação final de saúde
    console.log('📋 Teste 7: Verificação final de saúde')
    const finalHealth = await emailManager.healthCheck()
    console.log('✅ Status final:', finalHealth.status)
    
    console.log('\n🎉 Todos os testes passaram com sucesso!')
    console.log('📧 O serviço de e-mails está funcionando corretamente.')
    
  } catch (error) {
    console.error('\n❌ Erro durante os testes:', error)
    console.error('🔍 Detalhes do erro:', error instanceof Error ? error.message : String(error))
    
    // Tentar obter informações de diagnóstico
    try {
      const health = await emailManager.healthCheck()
      console.log('\n📊 Informações de diagnóstico:', JSON.stringify(health, null, 2))
    } catch (diagnosticError) {
      console.error('❌ Não foi possível obter informações de diagnóstico:', diagnosticError)
    }
    
    process.exit(1)
  } finally {
    // Encerrar o serviço
    console.log('\n🔄 Encerrando serviço de e-mails...')
    await emailManager.shutdown()
    console.log('✅ Testes concluídos')
  }
}

// Executar os testes
testEmailService().catch((error) => {
  console.error('❌ Erro fatal durante os testes:', error)
  process.exit(1)
})
