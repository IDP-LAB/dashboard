import { BaseEntity, Column, CreateDateColumn, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn, type Relation } from 'typeorm'
import { ProductType } from './ProductType'
import { Project } from './Project'
import { Tag } from './Tag'

@Entity({ name: 'products' })
export class Product extends BaseEntity {
  @PrimaryGeneratedColumn()
    id!: number

  @ManyToOne(() => ProductType, (type) => type.products)
    type!: Relation<ProductType>

  @Column({ type: 'varchar' })
    name!: string
  
  @Column({ type: 'varchar' })
    location!: string
  
  @Column({ type: 'int' })
    quantity!: number

  @Column({ type: 'text', nullable: true })
    image?: string

  @Column({ type: 'varchar', nullable: true })
    barcode?: string

  @ManyToMany(() => Tag, (tag) => tag.products, { cascade: true })
  @JoinTable({
    name: 'product_tags',
    joinColumn: { name: 'product_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' }
  })
    tags!: Tag[]

  @ManyToOne(() => Project, (project) => project.products)
    project!: Relation<Project> 

  @UpdateDateColumn()
    updateAt!: string
  @CreateDateColumn()
    createAt!: string
}