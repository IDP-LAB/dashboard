import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, type Relation } from 'typeorm'
import { Role } from '../enums'
import { User } from './User'

@Entity({ name: 'invites' })
export class Invite extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
    id!: number
  
  @Column('simple-array', { nullable: true })
    emails?: string[]
  @Column({ type: 'varchar', default: Role.Student })
    role!: Role
  @Column({ type: 'int', default: 1 })
    uses!: number
  @Column({ type: 'varchar', unique: true })
    code!: string
    
  @OneToMany(() => User, (user) => user.invite)
    users!: Relation<User[]>
  @ManyToOne(() => User, (user) => user.ownerInvites)
    createdBy!: Relation<User>
    
  @CreateDateColumn()
    createdAt!: Date
  @Column({ type: 'datetime', nullable: true })
    expiresAt?: Date
}