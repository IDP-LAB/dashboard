import { BaseEntity, Column, CreateDateColumn, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn, type Relation } from 'typeorm'
import { Item } from './Item.js'
import { ItemCategory } from './ItemCategory.js'
import { ItemTag } from './ItemTag.js'
import { File } from './File.js'

@Entity({ name: 'groups' })
export class Group extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
    id!: string

  // Opcionalmente, um nome/descrição de exibição para o grupo
  @Column({ type: 'varchar', length: 256 })
    name!: string

  @Column({ type: 'varchar', length: 2048, nullable: true })
    description?: string

  // Categoria e tags agora associadas ao grupo (não mais no item)
  @ManyToOne(() => ItemCategory, (category) => category.groups, { nullable: true, onDelete: 'SET NULL' })
    category?: Relation<ItemCategory> | null

  @ManyToMany(() => ItemTag, (tag) => tag.groups, { cascade: false })
  @JoinTable({ name: 'groups_tags_item_tags' })
    tags?: Relation<ItemTag[]>

  // Itens pertencentes ao grupo
  @OneToMany(() => Item, (item) => item.group)
    items!: Relation<Item[]>

  // Arquivos associados ao grupo
  @OneToMany(() => File, (file) => file.group)
    files!: Relation<File[]>

  @UpdateDateColumn()
    updateAt!: Date
  @CreateDateColumn()
    createAt!: Date
}


