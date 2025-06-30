import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn, type Relation } from 'typeorm'
import { Product } from './Product'

@Entity({ name: 'product_types' })
export class ProductType extends BaseEntity {
  @PrimaryGeneratedColumn()
    id!: number

  @Column({ type: 'varchar' })
    name!: string

  @OneToMany(() => Product, (product) => product.type)
    products!: Relation<Product[]>
}