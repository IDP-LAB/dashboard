
export type LogEvents = {
  'item:created': GenericPayload,
  'item:updated': GenericPayload
  'item:deleted': ItemPayloadDeleted,
  'project:created': GenericPayload,
  'project:updated': GenericPayload
  'project:deleted': ProjectPayloadDeleted,
  'invite:created': InviteCreatedPayload,
  'invite:claimed': InviteClaimedPayload,
  'group:deleted': GroupDeletedPayload,
}

export type EventName = keyof LogEvents

interface GenericPayload {
  id: number
  ownerId: number
  // Campos opcionais para enriquecer logs sem quebrar compatibilidade
  name?: string
  groupId?: string
  projectId?: number
}

interface ProjectPayloadDeleted {
  name: string
  ownerId: number
  id?: number
}

interface ItemPayloadDeleted {
  name: string
  group: string
  ownerId: number
  id?: number
}

interface InviteCreatedPayload {
  id: number
  code: string
  role: string
  ownerId: number
}

interface InviteClaimedPayload {
  userId: number
  inviteCode: string
}

interface GroupDeletedPayload {
  id: string
  ownerId: number
  deletedItems: number
  deletedFiles: number
  name?: string
}