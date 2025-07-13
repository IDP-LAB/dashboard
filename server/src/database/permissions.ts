export const PERMISSIONS = {
  NONE: 0,        // 0000
  READ: 1 << 0,   // 1  (0001)
  CREATE: 1 << 1, // 2  (0010)
  UPDATE: 1 << 2, // 4  (0100)
  DELETE: 1 << 3, // 8  (1000)
  
  VIEWER: 1, // READ
  EDITOR: 1 | 2 | 4, // READ | CREATE | UPDATE (7)
  ADMIN: 1 | 2 | 4 | 8, // READ | CREATE | UPDATE | DELETE (15)
} as const // 'as const' para tipagem mais estrita

export type PermissionValue = typeof PERMISSIONS[keyof typeof PERMISSIONS];