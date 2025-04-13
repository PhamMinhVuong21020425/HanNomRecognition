import * as bcrypt from 'bcrypt';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Model } from './model.entity';
import { Dataset } from './dataset.entity';
import { Notification } from './notification.entity';
import { TrainingJob } from './training_job.entity';
import { UserRole } from '../enums/UserRole';
import { AuthType } from '../enums/AuthType';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  googleId: string;

  @Column({ unique: true })
  email: string;

  @Column()
  hash_password: string;

  @Column({
    type: 'enum',
    enum: AuthType,
    default: AuthType.LOCAL,
  })
  auth_type: AuthType;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column()
  name: string;

  @Column({ nullable: true })
  gender: 'Male' | 'Female';

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  about: string;

  @Column({ type: 'date', nullable: true })
  birthday: Date;

  @Column('text', { nullable: true })
  avatar_url: string;

  @Column({ nullable: true })
  authCode: string;

  @Column({ type: 'datetime', nullable: true })
  authCodeExpires: Date;

  @Column({ nullable: true })
  isVerify: boolean;

  @Column({ nullable: false, default: true })
  isActivate: boolean;

  @OneToMany(() => Model, model => model.user)
  models: Model[];

  @OneToMany(() => Dataset, dataset => dataset.user)
  datasets: Dataset[];

  @OneToMany(() => Notification, notification => notification.user)
  notifications: Notification[];

  @OneToMany(() => TrainingJob, trainingJob => trainingJob.user)
  trainingJobs: TrainingJob[];

  constructor(partial?: Partial<User>) {
    Object.assign(this, partial);
  }

  generateAuthCode() {
    const code = Math.floor(100000 + Math.random() * 900000);
    return code.toString().padStart(6, '0');
  }

  async hashPassword(password: string, auth_type: AuthType): Promise<string> {
    if (auth_type === AuthType.GOOGLE && password === '') {
      password = process.env.GOOGLE_PASSWORD!;
    }
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  async comparePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.hash_password);
  }
}
