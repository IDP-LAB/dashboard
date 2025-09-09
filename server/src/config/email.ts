import nodemailer from 'nodemailer'

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  tls?: {
    rejectUnauthorized: boolean;
  };
  connectionTimeout?: number;
  greetingTimeout?: number;
  socketTimeout?: number;
}

export const emailConfig: EmailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(String(process.env.SMTP_PORT || '465'), 10),
  secure: process.env.SMTP_SECURE,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  connectionTimeout: parseInt(String(process.env.SMTP_CONNECTION_TIMEOUT || '30000'), 10),
  greetingTimeout: parseInt(String(process.env.SMTP_GREETING_TIMEOUT || '30000'), 10),
  socketTimeout: parseInt(String(process.env.SMTP_SOCKET_TIMEOUT || '30000'), 10),
}


export const createTransporter = () => {
  if (!emailConfig.host || !emailConfig.auth.user || !emailConfig.auth.pass) {
    throw new Error('Configuração SMTP incompleta. Verifique SMTP_HOST, SMTP_USER e SMTP_PASS')
  }

  if (!isValidHost(emailConfig.host)) throw new Error(`Host SMTP inválido: ${emailConfig.host}`)
  return nodemailer.createTransport(emailConfig)
}

function isValidHost(host: string): boolean {
  // Verificar se é um IP válido
  const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
  if (ipRegex.test(host)) return true
  
  // Verificar se é um hostname válido
  const hostnameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
  return hostnameRegex.test(host)
}