import { BaseEntity, Column, Entity, ManyToMany, PrimaryGeneratedColumn, type Relation } from 'typeorm'
import { Item } from './Item.js'

@Entity({ name: 'item_tags' })
export class ItemTag extends BaseEntity {
  @PrimaryGeneratedColumn()
    id!: number

  @Column({ type: 'varchar' })
    name!: string // cores, marca de fabricante

  @ManyToMany(() => Item, (item) => item.tags)
    products!: Relation<Item[]>
}