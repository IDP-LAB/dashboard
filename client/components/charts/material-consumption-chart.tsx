"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { materialConsumptionData } from "@/lib/chart-data"

export function MaterialConsumptionChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Consumo de Materiais</CardTitle>
        <CardDescription>Quantidade consumida por tipo nos últimos 6 meses</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={materialConsumptionData}>
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
            <Bar dataKey="filamentoPLA" fill="#8884d8" name="Filamento PLA (kg)" />
            <Bar dataKey="filamentoABS" fill="#82ca9d" name="Filamento ABS (kg)" />
            <Bar dataKey="placasPCB" fill="#ffc658" name="Placas PCB (un)" />
            <Bar dataKey="parafusos" fill="#ff7c7c" name="Parafusos (un)" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
