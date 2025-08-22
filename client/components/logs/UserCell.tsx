"use client"

import { Row } from "@tanstack/react-table"
import { User } from "lucide-react"
import { Log } from "server/src/database"

export function UserCell ({ row }: { row: Row<Log> }) {
  const user = row.original.user as { id: number, name?: string, email?: string } | undefined
  if (!user) return <div className="text-xs text-muted-foreground">-</div>

  return (
    <div className="flex items-center gap-2">
      <User className="h-4 w-4 text-muted-foreground" />
      <div>
        <div className="font-medium">{user?.name ?? `Usuário #${user.id}`}</div>
        <div className="text-xs text-muted-foreground">{user?.email ?? ''}</div>
      </div>
    </div>
  )
}