"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { costAnalysisData } from "@/lib/chart-data"

export function CostAnalysisChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Análise de Custos</CardTitle>
        <CardDescription>Gastos realizados vs orçamento por categoria</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={costAnalysisData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="category" className="text-sm" />
            <YAxis className="text-sm" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
              }}
              formatter={(value) => [`R$ ${value.toLocaleString()}`, ""]}
            />
            <Legend />
            <Bar dataKey="orcamento" fill="#e5e7eb" name="Orçamento" />
            <Bar dataKey="valor" fill="#3b82f6" name="Gasto Real" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
