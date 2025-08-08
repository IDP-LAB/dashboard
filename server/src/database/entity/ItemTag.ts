import { BaseEntity, Column, Entity, ManyToMany, PrimaryGeneratedColumn, type Relation } from 'typeorm'
import { Group } from './Group.js'

@Entity({ name: 'item_tags' })
export class ItemTag extends BaseEntity {
  @PrimaryGeneratedColumn()
    id!: number

  @Column({ type: 'varchar' })
    name!: string // cores, marca de fabricante

  @ManyToMany(() => Group, (group) => group.tags)
    groups!: Relation<Group[]>
}