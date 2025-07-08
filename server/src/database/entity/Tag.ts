import { BaseEntity, Column, CreateDateColumn, Entity, ManyToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

@Entity({ name: 'tags' })
export class Tag extends BaseEntity {
  @PrimaryGeneratedColumn()
    id!: number

  @Column({ type: 'varchar', unique: true })
    name!: string

  @Column({ type: 'varchar' })
    normalizedName!: string

  @ManyToMany('Product', 'tags')
    products!: any[]

  @UpdateDateColumn()
    updatedAt!: Date
  @CreateDateColumn()
    createdAt!: Date
} 