import { BaseEntity, Column, CreateDateColumn, Entity, Index, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn, type Relation } from 'typeorm'
import { ItemStatus, ItemType } from '../enums.js'
import { Group } from './Group.js'
import { ItemMovement } from './ItemMovement.js'
import { Project } from './Project.js'
import { User } from './User.js'

@Entity({ name: 'items' })
export class Item extends BaseEntity {
  @PrimaryGeneratedColumn()
    id!: number
  @Index()
  @ManyToOne(() => Group, (group) => group.items, { nullable: false, onDelete: 'CASCADE' })
    group!: Relation<Group>

  @Column({ type: 'varchar' })
    name!: string
  @Column({ type: 'varchar', nullable: true })
    description!: string
  @Column({ type: 'varchar', nullable: true })
    location!: string
  @Column({ 
    type: 'decimal', 
    precision: 10,
    scale: 2,
    nullable: true,
    transformer: {
      to: (value: number | null) => {
        // Convert NaN, Infinity, or null to SQL NULL
        if (value === null || !isFinite(value)) return null
        return value
      },
      from: (value: string | null) => {
        // If the db value is NULL, return null, otherwise parse it
        if (value === null) return null
        return parseFloat(value)
      }
    }
  })
    price!: number | null
  @Column({ type: 'varchar' })
    type!: ItemType
  @Column({ type: 'varchar', default: ItemStatus.Available })
    status!: ItemStatus

  @ManyToOne(() => Project, (project) => project.products, { nullable: true, onDelete: 'SET NULL' })
    project!: Relation<Project> | null
  @OneToMany(() => ItemMovement, (movement) => movement.item)
    movements!: Relation<ItemMovement[]>
  @ManyToOne(() => User, (user) => user.ownerItens)
    createdBy!: Relation<User>

  @Column({ type: 'datetime', nullable: true })
    acquisitionAt!: string
  @UpdateDateColumn()
    updateAt!: string
  @CreateDateColumn()
    createAt!: string

  // Logs foram movidos para as rotas para padronizar o dono (owner) via request.user
}