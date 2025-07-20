"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { userActivityData } from "@/lib/chart-data"

export function UserActivityChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividade dos Usuários</CardTitle>
        <CardDescription>Horas de uso e projetos por usuário</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={userActivityData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="user" className="text-sm" angle={-45} textAnchor="end" height={80} />
            <YAxis className="text-sm" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
              }}
            />
            <Bar dataKey="horas" fill="#8884d8" name="Horas de Uso" />
            <Bar dataKey="projetos" fill="#82ca9d" name="Projetos" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
