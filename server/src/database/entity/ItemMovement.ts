import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, type Relation } from 'typeorm'
import { MovementType } from '../enums.js'
import { Item } from './Item.js'
import { Project } from './Project.js'
import { User } from './User.js'

@Entity({ name: 'item_movements' })
export class ItemMovement extends BaseEntity {
  @PrimaryGeneratedColumn()
    id!: number

  @Column({ type: 'varchar' })
    type!: MovementType
  @Column({ type: 'int', default: 1 })
    quantity!: number
  @Column({ type: 'text', nullable: true })
    notes?: string

  @ManyToOne(() => Item, (item) => item.movements)
    item!: Relation<Item>
  @ManyToOne(() => Project, (project) => project.movements)
    project!: Relation<Project>
  @ManyToOne(() => User, (user) => user.movements)
    user!: Relation<User>

  @CreateDateColumn()
    createdAt!: Date
}