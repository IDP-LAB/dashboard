import { BaseEntity, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, type Relation } from 'typeorm'
import { ProjectStatus } from '../enums.js'
import { Item } from './Item.js'
import { ProjectMembership } from './ProjectMembership.js'
import { User } from './User.js'
import { ItemMovement } from './ItemMovement.js'

@Entity({ name: 'projects' })
export class Project extends BaseEntity {
  @PrimaryGeneratedColumn()
    id!: number

  @Column({ type: 'varchar' })
    name!: string
  @Column({
    type: 'varchar',
    default: ProjectStatus.InProgress
  })
    status!: ProjectStatus

  @ManyToOne(() => User, (user) => user.projects)
    owner!: Relation<User>
  @OneToMany(() => ProjectMembership, (membership) => membership.project)
    memberships!: Relation<ProjectMembership[]>
  @OneToMany(() => Item, (item) => item.project)
    products!: Relation<Item[]>
  @OneToMany(() => ItemMovement, (movement) => movement.project)
    movements!: Relation<ItemMovement[]>

  // Logs foram movidos para as rotas para padronizar o dono (owner) via request.user
}