"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mail, Copy, Check, Link as LinkIcon, Users, Clock } from "lucide-react"
import { toast } from "sonner"

interface InviteUserModalProps {
  onClose: () => void
}

interface InviteForm {
  email: string
  userType: "student" | "teacher" | ""
  usageLimit: string
}

export function InviteUserModal({ onClose }: InviteUserModalProps) {
  const [form, setForm] = useState<InviteForm>({
    email: "",
    userType: "",
    usageLimit: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [generatedLink, setGeneratedLink] = useState<string | null>(null)
  const [linkCopied, setLinkCopied] = useState(false)

  // Função para atualizar campos do formulário
  const updateForm = (field: keyof InviteForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  // Função para gerar link de convite
  const generateInviteLink = async () => {
    if (!form.userType) {
      toast.error("Tipo de usuário é obrigatório")
      return
    }

    setIsLoading(true)

    try {
      // Simular chamada para API
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Gerar um ID único para o convite
      const inviteId = Math.random().toString(36).substring(2, 15)
      
      // Construir parâmetros do link
      const params = new URLSearchParams({
        invite: inviteId,
        type: form.userType,
        ...(form.usageLimit && { limit: form.usageLimit }),
        ...(form.email && { email: form.email }),
      })

      const link = `${window.location.origin}/auth/register?${params.toString()}`
      setGeneratedLink(link)

      // Copiar automaticamente para a área de transferência
      await navigator.clipboard.writeText(link)
      setLinkCopied(true)
      
      toast.success("Link de convite gerado e copiado para a área de transferência!")

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
    if (!form.email || !generatedLink) return

    setIsLoading(true)

    try {
      // Simular envio de email
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast.success(`Convite enviado para ${form.email}!`)
    } catch (error) {
      toast.error("Erro ao enviar convite por email")
    } finally {
      setIsLoading(false)
    }
  }

  // Função para resetar formulário
  const resetForm = () => {
    setForm({ email: "", userType: "", usageLimit: "" })
    setGeneratedLink(null)
    setLinkCopied(false)
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
            type="email"
            placeholder="exemplo@email.com"
            value={form.email}
            onChange={(e) => updateForm("email", e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Se fornecido, o convite será enviado diretamente para este email
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
            <Badge variant="secondary" className="text-xs">Opcional</Badge>
          </Label>
          <Input
            id="usageLimit"
            type="number"
            placeholder="Ex: 5 (deixe vazio para uso ilimitado)"
            value={form.usageLimit}
            onChange={(e) => updateForm("usageLimit", e.target.value)}
            min="1"
          />
          <p className="text-xs text-muted-foreground">
            Quantas vezes o link pode ser usado. Deixe vazio para uso ilimitado
          </p>
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
                  {form.email && <span>• Email: {form.email}</span>}
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
            {form.email && (
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