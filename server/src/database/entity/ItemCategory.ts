import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn, type Relation } from 'typeorm'
import { Group } from './Group.js'

@Entity({ name: 'item_category' })
export class ItemCategory extends BaseEntity {
  @PrimaryGeneratedColumn()
    id!: number

  @Column({ type: 'varchar', unique: true })
    name!: string // filamento, impressora

  @OneToMany(() => Group, (group) => group.category)
    groups!: Relation<Group[]>
}