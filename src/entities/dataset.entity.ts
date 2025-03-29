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
import { Image } from './image.entity';
import { TrainingJob } from './training_job.entity';
import { ProblemType } from '../enums/ProblemType';

@Entity('datasets')
export class Dataset {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.datasets)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn({ nullable: true })
  updated_at: Date;

  @Column({
    type: 'enum',
    enum: ProblemType,
  })
  type: ProblemType;

  @Column({ nullable: true })
  zip_path: string;

  @Column({ default: false })
  is_public: boolean;

  @OneToMany(() => Image, image => image.dataset)
  images: Image[];

  @OneToMany(() => TrainingJob, trainingJob => trainingJob.dataset)
  trainingJobs: TrainingJob[];
}
