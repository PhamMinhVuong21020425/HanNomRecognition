import { User } from '../entities/user.entity';

export type UserData = Pick<
  User,
  | 'id'
  | 'name'
  | 'email'
  | 'role'
  | 'gender'
  | 'phone'
  | 'about'
  | 'birthday'
  | 'avatar_url'
>;
