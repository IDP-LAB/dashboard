import { AfterInsert, AfterRemove, AfterUpdate, BaseEntity, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, type Relation } from 'typeorm'
import { ProjectStatus } from '../enums.js'
import { Item } from './Item.js'
import { ProjectMembership } from './ProjectMembership.js'
import { User } from './User.js'
import { ItemMovement } from './ItemMovement.js'
import { Log } from './Log.js'

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

  @AfterInsert()
  async logOnCreate() {
    const log = new Log<'project:created'>()

    log.code = 'project:created'
    log.data = { id: this.id }
    log.user = this.owner
  
    await log.save()
  }

  @AfterUpdate()
  async logOnUpdate() {
    const log = new Log<'project:updated'>()

    log.code = 'project:updated'
    log.data = { id: this.id }
    log.user = this.owner

    await log.save()
  }

  @AfterRemove()
  async logOnDelete() {
    const log = new Log<'project:deleted'>()

    log.code = 'project:deleted'
    log.data = {
      name: this.name,
      ownerId: this.owner.id
    }
    log.user = this.owner

    await log.save()
  }
}