import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { TrainingJob } from './training_job.entity';
import { ProblemType } from '../enums/ProblemType';
import { ModelStatus } from '../enums/ModelStatus';

@Entity('models')
export class Model {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.models)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'float', nullable: true })
  accuracy: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn({ nullable: true })
  updated_at: Date;

  @Column({ nullable: true })
  path: string;

  @Column({
    type: 'enum',
    enum: ProblemType,
  })
  type: ProblemType;

  @Column({
    type: 'enum',
    enum: ModelStatus,
    default: ModelStatus.PENDING,
  })
  status: ModelStatus;

  @Column({ nullable: true })
  num_classes: number;

  @Column({ default: false })
  is_public: boolean;

  @OneToMany(() => TrainingJob, trainingJob => trainingJob.model)
  trainingJobs: TrainingJob[];
}
