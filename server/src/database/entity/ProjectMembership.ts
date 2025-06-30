import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn, type Relation } from 'typeorm'
import { Project } from './Project'
import { User } from './User'

@Entity({ name: 'project_memberships' })
export class ProjectMembership extends BaseEntity {
  @PrimaryGeneratedColumn()
    id!: number

  @Column({ type: 'varchar' })
    name!: string
  @Column({ type: 'int', default: 1 })
    permission!: number

  @ManyToOne(() => User, (user) => user.projectsMembership)
    user!: Relation<User>
  @ManyToOne(() => Project, (project) => project.memberships)
    project!: Relation<Project>
}