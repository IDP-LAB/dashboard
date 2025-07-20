"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { equipmentUsageData } from "@/lib/chart-data"

export function EquipmentUsageChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Uso de Equipamentos</CardTitle>
        <CardDescription>Horas de uso por categoria nos últimos 6 meses</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={equipmentUsageData}>
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
            <Line
              type="monotone"
              dataKey="impressora3D"
              stroke="#8884d8"
              strokeWidth={2}
              name="Impressora 3D"
              dot={{ fill: "#8884d8" }}
            />
            <Line
              type="monotone"
              dataKey="fresadoraCNC"
              stroke="#82ca9d"
              strokeWidth={2}
              name="Fresadora CNC"
              dot={{ fill: "#82ca9d" }}
            />
            <Line
              type="monotone"
              dataKey="arduino"
              stroke="#ffc658"
              strokeWidth={2}
              name="Arduino"
              dot={{ fill: "#ffc658" }}
            />
            <Line
              type="monotone"
              dataKey="ferramentas"
              stroke="#ff7c7c"
              strokeWidth={2}
              name="Ferramentas"
              dot={{ fill: "#ff7c7c" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
