import { AppDataSource } from '../config/data-source';
import { User } from '../entities/user.entity';

const userRepository = AppDataSource.getRepository(User);

export const findUserByEmail = async (email: string) => {
  const user = await userRepository.findOneBy({ email });
  return user;
};

export const saveUser = async (user: User) => {
  return await userRepository.save(user);
};

export const authenticateUser = async (email: string, password: string) => {
  const user = await userRepository.findOneBy({ email });

  if (user && (await user.comparePassword(password))) {
    return user;
  }

  return null;
};
