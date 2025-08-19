import type { EventName, LogEvents } from '@/types/logs'
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation
} from 'typeorm'
import { User } from './User.js'

@Entity({ name: 'logs' })
export class Log<Event extends EventName = EventName> extends BaseEntity {
  @PrimaryGeneratedColumn()
    id!: number

  @Column('varchar')
    code!: Event
  @Column('simple-json')
    data!: LogEvents[Event]
  @ManyToOne(() => User, (user) => user.logs)
    user!: Relation<User>

  @CreateDateColumn()
    createdAt!: Date
}