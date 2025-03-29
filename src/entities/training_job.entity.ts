import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Model } from './model.entity';
import { Dataset } from './dataset.entity';
import { TrainingJobStatus } from '../enums/TrainingJobStatus';

@Entity('training_jobs')
export class TrainingJob {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.trainingJobs)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Model, model => model.trainingJobs)
  @JoinColumn({ name: 'model_id' })
  model: Model;

  @ManyToOne(() => Dataset, dataset => dataset.trainingJobs)
  @JoinColumn({ name: 'dataset_id' })
  dataset: Dataset;

  @Column({ nullable: true })
  epochs: number;

  @Column({ nullable: true })
  batch_size: number;

  @Column({ nullable: true })
  n_samples: number;

  @Column({ nullable: true })
  strategy: string;

  @Column({
    type: 'enum',
    enum: TrainingJobStatus,
    default: TrainingJobStatus.PENDING,
  })
  status: TrainingJobStatus;

  @CreateDateColumn()
  created_at: Date;

  @Column({ type: 'datetime', nullable: true })
  started_at: Date;

  @Column({ type: 'datetime', nullable: true })
  completed_at: Date;

  @Column({ nullable: true })
  result_path: string;
}
