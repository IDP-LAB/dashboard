import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn, type Relation } from 'typeorm'
import { ProductType } from './ProductType'
import { Project } from './Project'

@Entity({ name: 'products' })
export class Product extends BaseEntity {
  @PrimaryGeneratedColumn()
    id!: number

  @ManyToOne(() => ProductType, (type) => type.products)
    type!: Relation<ProductType>

  @Column({ type: 'varchar' })
    name!: string
  @Column({ type: 'varchar' })
    description!: string
  @Column({ type: 'varchar' })
    location!: string
  @Column({ type: 'int' })
    quantity!: number

  @ManyToOne(() => Project, (project) => project.products)
    project!: Relation<Project> 

  @UpdateDateColumn()
    updateAt!: string
  @CreateDateColumn()
    createAt!: string
}