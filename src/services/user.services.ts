import { AppDataSource } from '../config/data-source';
import { User } from '../entities/user.entity';
import { AuthType } from '../enums/AuthType';

const userRepository = AppDataSource.getRepository(User);

export const getAllUsers = async () => {
  return userRepository.find({
    order: {
      name: 'ASC',
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      gender: true,
      phone: true,
      about: true,
      birthday: true,
      avatar_url: true,
      isActivate: true,
      isVerify: true,
    },
  });
};

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

export const changePassword = async (
  id: string,
  currentPass: string,
  newPass: string
) => {
  const user = await getUserById(id);
  if (!user) {
    return {
      success: false,
      message: 'password.error.not_found',
    };
  }
  const isMatch = await user.comparePassword(currentPass);
  if (!isMatch) {
    return {
      success: false,
      message: 'password.error.not_match',
    };
  }
  user.hash_password = await user.hashPassword(newPass);
  await userRepository.save(user);
  return { success: true };
};
