import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Dataset } from './dataset.entity';

@Entity('images')
export class Image {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Dataset, dataset => dataset.images, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'dataset_id' })
  dataset: Dataset;

  @Column()
  name: string;

  @Column('text')
  path: string;

  @Column('mediumtext', { nullable: true })
  label: string;

  @Column({ default: false })
  is_labeled: boolean;

  @CreateDateColumn({ name: 'uploaded_at' })
  uploaded_at: Date;
}
