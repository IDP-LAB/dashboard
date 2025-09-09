export interface EmailJobData {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: EmailAttachment[];
  from?: string;
  replyTo?: string;
  priority?: 'high' | 'normal' | 'low' | string;
  metadata?: Record<string, unknown>;
}

export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
  cid?: string;
}

export interface EmailJobResult {
  success: boolean;
  messageId?: string;
  error?: string;
  attempts: number;
  timestamp: Date;
}

export interface EmailQueueOptions {
  attempts?: number;
  backoff?: {
    type: 'exponential' | 'fixed';
    delay: number;
  };
  delay?: number;
  priority?: number;
  removeOnComplete?: boolean | number;
  removeOnFail?: boolean | number;
}

export interface EmailTemplate {
  name: string;
  subject: string;
  html: string;
  text?: string;
  variables?: string[];
}
