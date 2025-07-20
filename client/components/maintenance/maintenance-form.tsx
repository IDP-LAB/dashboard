"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { mockItems, mockUsers } from "@/lib/data"
import type { Maintenance, MaintenanceType, MaintenanceStatus } from "@/lib/types"
import { useToast } from "@/components/ui/use-toast"
import { CalendarIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface MaintenanceFormProps {
  maintenance?: Maintenance
  onClose: () => void
}

export function MaintenanceForm({ maintenance, onClose }: MaintenanceFormProps) {
  const { toast } = useToast()
  const [equipmentId, setEquipmentId] = useState(maintenance?.equipmentId || "")
  const [type, setType] = useState<MaintenanceType>(maintenance?.type || "preventive")
  const [status, setStatus] = useState<MaintenanceStatus>(maintenance?.status || "scheduled")
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(
    maintenance?.scheduledDate ? new Date(maintenance.scheduledDate) : undefined,
  )
  const [completedDate, setCompletedDate] = useState<Date | undefined>(
    maintenance?.completedDate ? new Date(maintenance.completedDate) : undefined,
  )
  const [nextMaintenanceDate, setNextMaintenanceDate] = useState<Date | undefined>(
    maintenance?.nextMaintenanceDate ? new Date(maintenance.nextMaintenanceDate) : undefined,
  )
  const [description, setDescription] = useState(maintenance?.description || "")
  const [cost, setCost] = useState<number | string>(maintenance?.cost || "")
  const [technician, setTechnician] = useState(maintenance?.technician || "")
  const [notes, setNotes] = useState(maintenance?.notes || "")

  const equipmentItems = mockItems.filter((item) => item.type === "equipment")
  const technicians = mockUsers.filter((user) => user.role === "technician" || user.role === "admin")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implementar lógica de salvamento
    console.log({
      equipmentId,
      type,
      status,
      scheduledDate: scheduledDate ? format(scheduledDate, "yyyy-MM-dd") : undefined,
      completedDate: completedDate ? format(completedDate, "yyyy-MM-dd") : undefined,
      nextMaintenanceDate: nextMaintenanceDate ? format(nextMaintenanceDate, "yyyy-MM-dd") : undefined,
      description,
      cost: Number(cost),
      technician,
      notes,
    })

    toast({
      title: maintenance ? "Manutenção Atualizada!" : "Manutenção Agendada!",
      description: `A manutenção foi ${maintenance ? "atualizada" : "agendada"} com sucesso.`,
    })

    onClose()
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>{maintenance ? "Editar Manutenção" : "Agendar Manutenção"}</CardTitle>
        <CardDescription>Preencha os detalhes da manutenção</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="equipment">Equipamento</Label>
              <Select value={equipmentId} onValueChange={setEquipmentId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o equipamento" />
                </SelectTrigger>
                <SelectContent>
                  {equipmentItems.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name} - {item.location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select value={type} onValueChange={(value) => setType(value as MaintenanceType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="preventive">Preventiva</SelectItem>
                  <SelectItem value="corrective">Corretiva</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as MaintenanceStatus)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Agendada</SelectItem>
                  <SelectItem value="in_progress">Em Andamento</SelectItem>
                  <SelectItem value="completed">Concluída</SelectItem>
                  <SelectItem value="cancelled">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="technician">Técnico Responsável</Label>
              <Select value={technician} onValueChange={setTechnician}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o técnico" />
                </SelectTrigger>
                <SelectContent>
                  {technicians.map((user) => (
                    <SelectItem key={user.id} value={user.name}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o que será feito na manutenção..."
              required
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Data Agendada</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start text-left font-normal ${!scheduledDate && "text-muted-foreground"}`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {scheduledDate ? format(scheduledDate, "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={scheduledDate}
                    onSelect={setScheduledDate}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {status === "completed" && (
              <div className="space-y-2">
                <Label>Data Conclusão</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal ${!completedDate && "text-muted-foreground"}`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {completedDate ? format(completedDate, "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={completedDate}
                      onSelect={setCompletedDate}
                      initialFocus
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}

            {type === "preventive" && (
              <div className="space-y-2">
                <Label>Próxima Manutenção</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal ${!nextMaintenanceDate && "text-muted-foreground"}`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {nextMaintenanceDate ? (
                        format(nextMaintenanceDate, "PPP", { locale: ptBR })
                      ) : (
                        <span>Escolha uma data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={nextMaintenanceDate}
                      onSelect={setNextMaintenanceDate}
                      initialFocus
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cost">Custo (R$)</Label>
            <Input
              id="cost"
              type="number"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              placeholder="0.00"
              step="0.01"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observações adicionais..."
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              {maintenance ? "Salvar Alterações" : "Agendar Manutenção"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
