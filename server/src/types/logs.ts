
export type LogEvents = {
  'item:created': GenericPayload,
  'item:updated': GenericPayload
  'item:deleted': ItemPayloadDeleted,
  'project:created': GenericPayload,
  'project:updated': GenericPayload
  'project:deleted': ProjectPayloadDeleted,
}

export type EventName = keyof LogEvents

interface GenericPayload {
  id: number
}

interface ProjectPayloadDeleted {
  name: string
  ownerId: number
}

interface ItemPayloadDeleted {
  name: string
  group: string
  ownerId: number
}