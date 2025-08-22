"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mail, Copy, Check, Link as LinkIcon, Users, Clock, X as CloseIcon } from "lucide-react"
import { toast } from "sonner"
import { useAPI } from "@/hooks/useAPI"
import { isSuccessResponse } from "@/lib/response"
import { Role } from "server"

interface InviteUserModalProps {
  onClose: () => void
  onCreated?: (invite: { id: number; code: string }) => void
}

interface InviteForm {
  email: string
  userType: "student" | "teacher" | ""
  usageLimit: string
  expiresIn: "3h" | "6h" | "24h" | "7d" | "31d"
}

export function InviteUserModal({ onClose, onCreated }: InviteUserModalProps) {
  const { client } = useAPI()
  const [form, setForm] = useState<InviteForm>({
    email: "",
    userType: "",
    usageLimit: "1",
    expiresIn: "7d",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [generatedLink, setGeneratedLink] = useState<string | null>(null)
  const [linkCopied, setLinkCopied] = useState(false)
  const [emails, setEmails] = useState<string[]>([])

  // Função para atualizar campos do formulário
  const updateForm = (field: keyof InviteForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const isValidEmail = (value: string) => {
    const emailRegex = /[^\s@]+@[^\s@]+\.[^\s@]+/
    return emailRegex.test(value)
  }

  const addEmailsFromString = (value: string) => {
    const candidates = value
      .split(/\s+/)
      .map((e) => e.trim())
      .filter((e) => e.length > 0)

    if (candidates.length === 0) return

    const valid = candidates.filter(isValidEmail)
    const invalid = candidates.filter((e) => !isValidEmail(e))

    if (invalid.length > 0) {
      toast.error(`Email(s) inválido(s): ${invalid.join(", ")}`)
    }

    if (valid.length > 0) {
      setEmails((prev) => Array.from(new Set([...prev, ...valid])))
    }
  }

  const handleEmailKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === ' ' || e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      if (form.email.trim().length > 0) {
        addEmailsFromString(form.email)
        updateForm("email", "")
      }
    }
  }

  const handleEmailBlur: React.FocusEventHandler<HTMLInputElement> = () => {
    if (form.email.trim().length > 0) {
      addEmailsFromString(form.email)
      updateForm("email", "")
    }
  }

  const handleEmailPaste: React.ClipboardEventHandler<HTMLInputElement> = (e) => {
    const text = e.clipboardData.getData('text')
    if (text && /\s/.test(text)) {
      e.preventDefault()
      addEmailsFromString(text)
    }
  }

  const removeEmail = (value: string) => {
    setEmails((prev) => prev.filter((e) => e !== value))
  }

  // Sincroniza automaticamente o limite de usos com a quantidade de e-mails adicionados
  useEffect(() => {
    setForm(prev => {
      if (emails.length > 0) {
        if (prev.usageLimit !== String(emails.length)) {
          return { ...prev, usageLimit: String(emails.length) }
        }
        return prev
      }
      // Sem e-mails, restaura para 1
      if (prev.usageLimit !== "1") {
        return { ...prev, usageLimit: "1" }
      }
      return prev
    })
  }, [emails])

  // Função para gerar link de convite (via API)
  const generateInviteLink = async () => {
    if (!form.userType) {
      toast.error("Tipo de usuário é obrigatório")
      return
    }

    setIsLoading(true)

    try {
      const role: Role.Teacher | Role.Student = form.userType === "teacher" ? Role.Teacher : Role.Student
      const inputEmails = form.email
        .split(/\s+/)
        .map((e) => e.trim())
        .filter((e) => e.length > 0 && isValidEmail(e))
      const allEmails = Array.from(new Set([...(emails || []), ...inputEmails]))
      const baseUses = form.usageLimit ? Math.max(1, parseInt(form.usageLimit, 10) || 1) : 1
      const uses = allEmails.length > 0 ? allEmails.length : baseUses
      const payload: {
        emails?: string[]
        uses: number
        role: Role.Teacher | Role.Student
        expiresIn: string
      } = {
        uses,
        role,
        expiresIn: form.expiresIn,
      }
      if (allEmails.length > 0) payload.emails = allEmails

      const response = await client.query('/invite/create', 'post', payload)
      if (!isSuccessResponse(response)) {
        toast.error(response.message)
        return
      }

      const created = response.data as { id: number; code: string }
      const params = new URLSearchParams({
        invite: created.code,
        ...(form.email && { email: form.email }),
      })

      const link = `${window.location.origin}/auth/register?${params.toString()}`
      setGeneratedLink(link)

      try {
        await navigator.clipboard.writeText(link)
        setLinkCopied(true)
      } catch {}

      toast.success("Convite criado com sucesso!")
      if (onCreated) onCreated(created)

      // Reset do estado de "copiado" após 3 segundos
      setTimeout(() => setLinkCopied(false), 3000)

    } catch (error) {
      toast.error("Erro ao gerar link de convite")
      console.error("Erro ao gerar convite:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Função para copiar link novamente
  const copyLink = async () => {
    if (!generatedLink) return

    try {
      await navigator.clipboard.writeText(generatedLink)
      setLinkCopied(true)
      toast.success("Link copiado para a área de transferência!")
      
      setTimeout(() => setLinkCopied(false), 3000)
    } catch (error) {
      toast.error("Erro ao copiar link")
    }
  }

  // Função para enviar convite por email (se email foi fornecido)
  const sendEmailInvite = async () => {
    const inputEmails = form.email
      .split(/\s+/)
      .map((e) => e.trim())
      .filter((e) => e.length > 0 && isValidEmail(e))
    const allEmails = Array.from(new Set([...(emails || []), ...inputEmails]))
    if ((allEmails.length === 0) || !generatedLink) return

    setIsLoading(true)

    try {
      // Simular envio de email
      await new Promise(resolve => setTimeout(resolve, 1500))
      const toDisplay = allEmails.length === 1 ? allEmails[0] : `${allEmails.length} destinatários`
      toast.success(`Convite enviado para ${toDisplay}!`)
    } catch (error) {
      toast.error("Erro ao enviar convite por email")
    } finally {
      setIsLoading(false)
    }
  }

  // Função para resetar formulário
  const resetForm = () => {
    setForm({ email: "", userType: "", usageLimit: "1", expiresIn: "7d" })
    setGeneratedLink(null)
    setLinkCopied(false)
    setEmails([])
  }

  return (
    <div className="space-y-6">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Convidar Usuário
        </DialogTitle>
        <DialogDescription>
          Gere um link de convite para permitir que novos usuários se registrem no sistema.
          O tipo de usuário é obrigatório, enquanto email e limite de usos são opcionais.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        {/* Campo de Email (Opcional) */}
        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email do Convidado
            <Badge variant="secondary" className="text-xs">Opcional</Badge>
          </Label>
          <Input
            id="email"
            type="text"
            placeholder="exemplo@email.com"
            value={form.email}
            onChange={(e) => updateForm("email", e.target.value)}
            onKeyDown={handleEmailKeyDown}
            onBlur={handleEmailBlur}
            onPaste={handleEmailPaste}
          />
          {emails.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {emails.map((em) => (
                <span key={em} className="inline-flex items-center gap-1 rounded border px-2 py-0.5 text-xs">
                  <span>{em}</span>
                  <button
                    type="button"
                    aria-label={`Remover ${em}`}
                    onClick={() => removeEmail(em)}
                    className="opacity-60 hover:opacity-100"
                  >
                    <CloseIcon className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Digite um email e pressione espaço para adicioná-lo. Você pode colar vários (separados por espaço ou quebra de linha).
          </p>
        </div>

        {/* Campo de Tipo de Usuário (Obrigatório) */}
        <div className="space-y-2">
          <Label htmlFor="userType" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Tipo de Usuário
            <Badge variant="destructive" className="text-xs">Obrigatório</Badge>
          </Label>
          <Select value={form.userType} onValueChange={(value) => updateForm("userType", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo de usuário" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="student">Aluno</SelectItem>
              <SelectItem value="teacher">Professor</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Define as permissões que o usuário terá no sistema
          </p>
        </div>

        {/* Campo de Limite de Usos (Opcional) */}
        <div className="space-y-2">
          <Label htmlFor="usageLimit" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Limite de Usos
            <Badge variant="secondary" className="text-xs">Número de usos</Badge>
          </Label>
          <Input
            id="usageLimit"
            type="number"
            placeholder="Ex: 5"
            value={form.usageLimit}
            onChange={(e) => updateForm("usageLimit", e.target.value)}
            min="1"
            disabled={emails.length > 0}
          />
          <p className="text-xs text-muted-foreground">
            Valor padrão é 1. Ao adicionar e-mails, este campo é bloqueado e o limite passa a ser a quantidade de e-mails adicionados (cada e-mail consome 1 uso).
          </p>
        </div>

        {/* Expiração */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Expira em
          </Label>
          <Select value={form.expiresIn} onValueChange={(v) => updateForm("expiresIn", v as InviteForm["expiresIn"]) }>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a expiração" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3h">3 horas</SelectItem>
              <SelectItem value="6h">6 horas</SelectItem>
              <SelectItem value="24h">24 horas</SelectItem>
              <SelectItem value="7d">7 dias</SelectItem>
              <SelectItem value="31d">31 dias</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Link Gerado */}
        {generatedLink && (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <LinkIcon className="h-4 w-4" />
                  Link de Convite Gerado
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={generatedLink}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyLink}
                    className={linkCopied ? "bg-green-50 border-green-200" : ""}
                  >
                    {linkCopied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span>Tipo: {form.userType === "student" ? "Aluno" : "Professor"}</span>
                  {form.usageLimit && <span>• Limite: {form.usageLimit} usos</span>}
                  {(emails.length > 0) && <span>• Emails: {emails.join(', ')}</span>}
                  {(emails.length === 0 && form.email) && <span>• Email: {form.email}</span>}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <DialogFooter className="flex flex-col sm:flex-row gap-2">
        {generatedLink ? (
          <>
            <Button variant="outline" onClick={resetForm}>
              Gerar Novo Convite
            </Button>
            {(emails.length > 0 || form.email) && (
              <Button onClick={sendEmailInvite} disabled={isLoading}>
                {isLoading ? "Enviando..." : "Enviar por Email"}
              </Button>
            )}
            <Button onClick={onClose}>
              Concluir
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              onClick={generateInviteLink} 
              disabled={isLoading || !form.userType}
            >
              {isLoading ? "Gerando..." : "Gerar Link de Convite"}
            </Button>
          </>
        )}
      </DialogFooter>
    </div>
  )
}