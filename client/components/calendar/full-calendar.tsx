"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// Tipos para eventos do calendário
interface CalendarEvent {
  id: string
  title: string
  time: string
  type: 'meeting' | 'task' | 'reminder' | 'deadline'
  color: string
}

interface CalendarCategory {
  id: string
  name: string
  color: string
  visible: boolean
}

// Dados mock para demonstração
const mockEvents: Record<string, CalendarEvent[]> = {
  '2025-01-07': [
    { id: '1', title: 'Tarde Rápida', time: '09:40', type: 'meeting', color: 'bg-blue-500' }
  ],
  '2025-01-13': [
    { id: '2', title: 'Ing Histo...', time: '09:15', type: 'task', color: 'bg-green-500' }
  ],
  '2025-01-14': [
    { id: '3', title: 'Your first...', time: '09:15', type: 'reminder', color: 'bg-purple-500' }
  ],
  '2025-01-15': [
    { id: '4', title: 'Tipos gri...', time: '08:15', type: 'deadline', color: 'bg-orange-500' }
  ],
  '2025-01-21': [
    { id: '5', title: 'Tarde Rápida', time: '09:40', type: 'meeting', color: 'bg-blue-500' }
  ],
  '2025-01-22': [
    { id: '6', title: 'Your first...', time: '09:15', type: 'reminder', color: 'bg-purple-500' }
  ],
  '2025-01-27': [
    { id: '7', title: 'Thinking', time: '09:15', type: 'task', color: 'bg-green-500' }
  ],
  '2025-01-29': [
    { id: '8', title: 'Estrutura', time: '09:15', type: 'deadline', color: 'bg-orange-500' }
  ]
}

const calendarCategories: CalendarCategory[] = [
  { id: '1', name: 'GUILHERME AUGUSTO MONTALVÃO', color: 'bg-blue-500', visible: true },
  { id: '2', name: 'BANCOS DE DADOS - MATUTINO', color: 'bg-green-500', visible: true },
  { id: '3', name: 'OFICINA EM SOLUÇÕES WEB - MATUTINO', color: 'bg-purple-500', visible: true },
  { id: '4', name: 'PROCESSO DE SOFTWARE - MATUTINO', color: 'bg-orange-500', visible: true },
  { id: '5', name: 'PROGRAMAÇÃO ORIENTADA A OBJETOS - MATUTINO', color: 'bg-red-500', visible: true },
  { id: '6', name: 'TÉCNICA DE PROGRAMAÇÃO', color: 'bg-yellow-500', visible: true }
]

const monthNames = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
]

const dayNames = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB']

export function FullCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 0, 1)) // Janeiro 2025
  const [categories, setCategories] = useState(calendarCategories)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // Navegar para o mês anterior
  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  // Navegar para o próximo mês
  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  // Gerar dias do calendário
  const generateCalendarDays = () => {
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    const days = []
    const today = new Date()
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      
      const dateString = date.toISOString().split('T')[0]
      const events = mockEvents[dateString] || []
      const isCurrentMonth = date.getMonth() === month
      const isToday = date.toDateString() === today.toDateString()
      
      days.push({
        date,
        dateString,
        day: date.getDate(),
        isCurrentMonth,
        isToday,
        events
      })
    }
    
    return days
  }

  const calendarDays = generateCalendarDays()

  // Toggle visibilidade da categoria
  const toggleCategory = (categoryId: string) => {
    setCategories(prev => 
      prev.map(cat => 
        cat.id === categoryId ? { ...cat, visible: !cat.visible } : cat
      )
    )
  }

  return (
    <div className="flex gap-6 h-full">
      {/* Calendário Principal */}
      <div className="flex-1">
        <Card className="h-full">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <CalendarIcon className="h-6 w-6 text-primary" />
                <div>
                  <CardTitle className="text-2xl font-bold">
                    {monthNames[month]} {year}
                  </CardTitle>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={previousMonth}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={nextMonth}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Cabeçalho dos dias da semana */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map((day) => (
                <div
                  key={day}
                  className="p-2 text-center text-sm font-medium text-muted-foreground"
                >
                  {day}
                </div>
              ))}
            </div>
            
            {/* Grid do calendário */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => (
                <div
                  key={index}
                  className={cn(
                    "min-h-[100px] p-2 border border-border rounded-md transition-colors hover:bg-accent/50",
                    !day.isCurrentMonth && "text-muted-foreground bg-muted/30",
                    day.isToday && "bg-primary/10 border-primary"
                  )}
                >
                  <div className={cn(
                    "text-sm font-medium mb-1",
                    day.isToday && "text-primary font-bold"
                  )}>
                    {day.day}
                  </div>
                  
                  {/* Eventos do dia */}
                  <div className="space-y-1">
                    {day.events.map((event) => (
                      <div
                        key={event.id}
                        className={cn(
                          "text-xs p-1 rounded text-white truncate cursor-pointer hover:opacity-80 transition-opacity",
                          event.color
                        )}
                        title={`${event.time} - ${event.title}`}
                      >
                        <div className="font-medium">{event.time}</div>
                        <div className="truncate">{event.title}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar de Calendários */}
      <div className="w-80">
        <Card className="h-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">CALENDÁRIOS</CardTitle>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-start gap-3 cursor-pointer hover:bg-accent/50 p-2 rounded-md transition-colors"
                onClick={() => toggleCategory(category.id)}
              >
                <div className="flex items-center gap-2 flex-1">
                  <div
                    className={cn(
                      "w-3 h-3 rounded-full",
                      category.color,
                      !category.visible && "opacity-30"
                    )}
                  />
                  <span className={cn(
                    "text-sm font-medium",
                    !category.visible && "text-muted-foreground"
                  )}>
                    {category.name}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {category.visible ? '✓' : ''}
                </div>
              </div>
            ))}
            
            {/* Seção SEM DATA */}
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">SEM DATA</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Feed do calendário
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}