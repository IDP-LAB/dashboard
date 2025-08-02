import { BaseEntity, Column, CreateDateColumn, Entity, Index, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn, type Relation } from 'typeorm'
import { ItemCategory } from './ItemCategory.js'
import { ItemTag } from './ItemTag.js'
import { Project } from './Project.js'
import { ItemStatus, ItemType } from '../enums.js'
import { ItemMovement } from './ItemMovement.js'
import { nanoid } from 'nanoid'

@Entity({ name: 'items' })
export class Item extends BaseEntity {
  @PrimaryGeneratedColumn()
    id!: number
  @Index()
  @Column({ type: 'varchar', length: 21, nullable: false }) 
    groupUuid!: string

  @Column({ type: 'varchar' })
    name!: string
  @Column({ type: 'varchar', nullable: true })
    description!: string
  @Column({ type: 'varchar', nullable: true })
    location!: string
  @Column({ 
    type: 'decimal', 
    precision: 10,
    scale: 2,
    nullable: true,
    transformer: {
      to: (value: number | null) => {
        // Convert NaN, Infinity, or null to SQL NULL
        if (value === null || !isFinite(value)) return null
        return value
      },
      from: (value: string | null) => {
        // If the db value is NULL, return null, otherwise parse it
        if (value === null) return null
        return parseFloat(value)
      }
    }
  })
    price!: number | null
  @Column({ type: 'varchar' })
    type!: ItemType
  @Column({ type: 'varchar', default: ItemStatus.Available })
    status!: ItemStatus

  @ManyToOne(() => ItemCategory, (category) => category.products)
    category!: Relation<ItemCategory>
  @ManyToMany(() => ItemTag, (tag) => tag.products)
  @JoinTable({ name: 'items_tags_item_tags' }) // Especificar o nome aqui é uma boa prática
    tags!: Relation<ItemTag[]>
  @ManyToOne(() => Project, (project) => project.products, { nullable: true, onDelete: 'SET NULL' })
    project!: Relation<Project> | null
  @OneToMany(() => ItemMovement, (movement) => movement.item)
    movements!: Relation<ItemMovement[]>

  @Column({ type: 'datetime', nullable: true })
    acquisitionAt!: string
  @UpdateDateColumn()
    updateAt!: string
  @CreateDateColumn()
    createAt!: string

  /**
   * Encontra um item semelhante (mesma categoria e tags) e atribui o groupUuid.
   * Se nenhum for encontrado, cria um novo groupUuid.
   * Este método deve ser chamado ANTES de salvar o item.
   */
  async findAndSetGroup(): Promise<void> {
    if (!this.category || !this.tags) {
      this.groupUuid = nanoid()
      return
    }

    const tagIds = this.tags.map(tag => tag.id).sort()

    // Query para encontrar um item existente com a mesma categoria e o mesmo conjunto exato de tags
    const qb = Item.createQueryBuilder('item')
      .innerJoin('item.category', 'category', 'category.id = :categoryId', { categoryId: this.category.id })
      .innerJoin('item.tags', 'tag')
      .where('item.id != :id', { id: this.id || 0 }) // Exclui a si mesmo caso já tenha ID
      .groupBy('item.id')
      .having('COUNT(DISTINCT tag.id) = :tagCount', { tagCount: tagIds.length })
    
    // Subquery para garantir que o número total de tags do item correspondente é o mesmo
    // CORREÇÃO: Nome da tabela e da coluna corrigidos.
    qb.andHaving('(SELECT COUNT(*) FROM items_tags_item_tags WHERE "itemsId" = item.id) = :tagCount', { tagCount: tagIds.length })

    // Adiciona a condição para as tags específicas
    if (tagIds.length > 0) {
      qb.andWhere('tag.id IN (:...tagIds)', { tagIds })
    }

    const similarItem = await qb.getOne()

    if (similarItem && similarItem.groupUuid) {
      this.groupUuid = similarItem.groupUuid
    } else {
      // É o primeiro de seu tipo ou o similar não tem grupo, então cria um novo
      this.groupUuid = nanoid()
    }
  }
}