import { compare, hash } from 'bcryptjs'
import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, type Relation, UpdateDateColumn } from 'typeorm'
import { Role } from '../enums.js'
import { Hidden } from '../hooks/hidden.js'
import { Auth } from './Auth.js'
import { ItemMovement } from './ItemMovement.js'
import { Log } from './Log.js'
import { Project } from './Project.js'
import { ProjectMembership } from './ProjectMembership.js'
import { Item } from './Item.js'
import { Invite } from './Invite.js'

@Entity({ name: 'users' })
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
    id!: number

  @Column({ type: 'text'/*, length: 64*/ })
    name!: string
  @Column({ type: 'text'/*, length: 64*/ })
    username!: string
  @Column({ type: 'varchar', unique: true })
    email!: string
  @Column({ type: 'varchar'/*, length: 16*/ })
    language!: string
  @Hidden({ type: 'text' })
    password!: string
  @Column({ type: 'varchar', default: Role.Student })
    role!: Role

  @OneToMany(() => ItemMovement, (movement) => movement.user)
    movements!: Relation<ItemMovement[]>
  @OneToMany(() => ProjectMembership, (membership) => membership.user)
    projectsMembership!: Relation<ProjectMembership[]>
  @OneToOne(() => Project, (project) => project.owner)
    projects!: Relation<Project[]>
  @OneToMany(() => Auth, (auth) => auth.user)
    auths!: Relation<Auth[]>
  @OneToMany(() => Log, (log) => log.user)
    logs!: Relation<Log[]>
  @OneToMany(() => Item, (item) => item.createdBy)
    ownerItens!: Relation<Item[]>
  @ManyToOne(() => Invite, (invite) => invite.users)
    invite!: Relation<Invite>
  @OneToMany(() => Invite, (invite) => invite.createdBy)
    ownerInvites!: Relation<Invite[]>

  @UpdateDateColumn()
    updatedAt!: Date
  @CreateDateColumn()
    createdAt!: Date

  async setPassword(password: string): Promise<User> {
    this.password = await hash(password, 10)
    return this
  }
  
  async validatePassword(password: string): Promise<boolean> {
    return compare(password, this.password)
  }
}
