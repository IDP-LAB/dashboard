import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn, type Relation } from 'typeorm'
import { ProjectStatus } from '../enums'
import { Product } from './Product'
import { ProjectMembership } from './ProjectMembership'

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

  @OneToMany(() => ProjectMembership, (membership) => membership.project)
    memberships!: Relation<ProjectMembership[]>
  @OneToMany(() => Product, (product) => product.project)
    products!: Relation<Product[]>
}