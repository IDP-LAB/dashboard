import { BaseEntity, Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn, type Relation } from 'typeorm'
import { Group } from './Group.js'

export enum FileType {
  Photo = 'photo',
  Document = 'document'
}

@Entity({ name: 'files' })
export class File extends BaseEntity {
  @PrimaryGeneratedColumn()
    id!: number

  @Column({ type: 'varchar', length: 255 })
    filename!: string
  @Column({ type: 'varchar', length: 255 })
    originalName!: string
  @Column({ type: 'varchar', length: 100 })
    mimeType!: string
  @Column({ type: 'bigint' })
    size!: number
  @Column({ 
    type: 'simple-enum',
    enum: FileType,
    default: FileType.Document 
  })
    type!: FileType
  @Column({ type: 'varchar', length: 500 })
    path!: string

  @Index()
  @ManyToOne(() => Group, (group) => group.files, { nullable: false, onDelete: 'CASCADE' })
    group!: Relation<Group>

  @CreateDateColumn()
    createdAt!: Date
  @UpdateDateColumn()
    updatedAt!: Date
} 