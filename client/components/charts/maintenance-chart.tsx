"use client"

import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { maintenanceData } from "@/lib/chart-data"

export function MaintenanceChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Manutenções e Custos</CardTitle>
        <CardDescription>Manutenções preventivas vs corretivas e custos mensais</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart data={maintenanceData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="month" className="text-sm" />
            <YAxis yAxisId="left" className="text-sm" />
            <YAxis yAxisId="right" orientation="right" className="text-sm" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
              }}
            />
            <Legend />
            <Bar yAxisId="left" dataKey="preventiva" fill="#22c55e" name="Preventiva" />
            <Bar yAxisId="left" dataKey="corretiva" fill="#ef4444" name="Corretiva" />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="custo"
              stroke="#f59e0b"
              strokeWidth={3}
              name="Custo (R$)"
              dot={{ fill: "#f59e0b" }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
