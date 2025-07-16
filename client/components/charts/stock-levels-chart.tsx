"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { stockLevelsData } from "@/lib/chart-data"

export function StockLevelsChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Níveis de Estoque</CardTitle>
        <CardDescription>Estoque atual vs níveis mínimos e máximos</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={stockLevelsData} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis type="number" className="text-sm" />
            <YAxis dataKey="item" type="category" width={100} className="text-sm" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
              }}
            />
            <Bar dataKey="maximo" fill="#e5e7eb" name="Máximo" />
            <Bar dataKey="atual" fill="#3b82f6" name="Atual" />
            <ReferenceLine x={0} stroke="#ef4444" strokeDasharray="5 5" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
