export enum Role {
  Administrator = 'administrator',
  User = 'user'
}

export enum ProjectStatus {
  OnHold = 'on_hold',
  Completed = 'completed',
  InProgress = 'in_progress'
}

export enum ItemStatus {
  Available = 'available',
  Maintenance = 'maintenance',
  InUse = 'in_use',
  Consumed = 'consumed'
}

export enum ItemType {
  Consumable = 'consumable',
  Equipment = 'equipment'
}

export enum MovementType {
  Transfer_Out = 'transfer_out', // Saída para um projeto
  Transfer_In = 'transfer_in',   // Entrada/Devolução para o armazém
  Consumed = 'consumed'          // Item consumido no projeto
}