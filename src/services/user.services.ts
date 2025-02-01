import { AppDataSource } from '../config/data-source';
import { User } from '../entities/user.entity';
import { AuthType } from '../enums/AuthType';

const userRepository = AppDataSource.getRepository(User);

export const getUserById = async (id: string) => {
  return userRepository.findOne({ where: { id } });
};

export const findUserByEmail = async (email: string) => {
  return userRepository.findOne({
    where: { email },
  });
};

export const createUser = async (data: Partial<User>) => {
  const newUser = userRepository.create(data);
  newUser.hash_password = await newUser.hashPassword('', AuthType.GOOGLE);
  return userRepository.save(newUser);
};

export const updateUser = async (id: string, updateData: Partial<User>) => {
  const user = await getUserById(id);
  if (!user) {
    return null;
  }
  Object.assign(user, updateData);
  return userRepository.save(user);
};
