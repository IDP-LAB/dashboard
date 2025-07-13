import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn, type Relation } from 'typeorm'
import { Item } from './Item.js'

@Entity({ name: 'item_category' })
export class ItemCategory extends BaseEntity {
  @PrimaryGeneratedColumn()
    id!: number

  @Column({ type: 'varchar', unique: true })
    name!: string // filamento, impressora

  @OneToMany(() => Item, (item) => item.category)
    products!: Relation<Item[]>
}