"use client"

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { projectsTimelineData } from "@/lib/chart-data"

export function ProjectsTimelineChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Timeline de Projetos</CardTitle>
        <CardDescription>Projetos ativos, concluídos e planejados ao longo do tempo</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={projectsTimelineData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="month" className="text-sm" />
            <YAxis className="text-sm" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
              }}
            />
            <Legend />
            <Area type="monotone" dataKey="concluidos" stackId="1" stroke="#22c55e" fill="#22c55e" name="Concluídos" />
            <Area type="monotone" dataKey="ativos" stackId="1" stroke="#3b82f6" fill="#3b82f6" name="Ativos" />
            <Area type="monotone" dataKey="planejados" stackId="1" stroke="#f59e0b" fill="#f59e0b" name="Planejados" />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
