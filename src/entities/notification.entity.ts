import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { NotificationStatus } from '../enums/NotificationStatus';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.notifications)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  message: string;

  @Column()
  description: string;

  @CreateDateColumn()
  created_at: Date;

  @Column({
    type: 'enum',
    enum: NotificationStatus,
    default: NotificationStatus.INFO,
  })
  status: NotificationStatus;

  @Column({ default: false })
  is_read: boolean;
}
