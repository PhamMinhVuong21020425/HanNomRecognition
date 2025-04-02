import { AppDataSource } from '../config/data-source';
import { Notification } from '../entities/notification.entity';

const notiRepository = AppDataSource.getRepository(Notification);

export const getNotificationsByUserId = async (userId: string) => {
  const notis = await notiRepository.find({
    where: { user: { id: userId } },
    order: { created_at: 'DESC' },
  });
  return notis;
};

export const createNotification = async (noti: Partial<Notification>) => {
  const newNoti = notiRepository.create(noti);
  return notiRepository.save(newNoti);
};

export const deleteNotificationsByUserId = async (userId: string) => {
  const result = await notiRepository.delete({ user: { id: userId } });
  return result.affected ? true : false;
};
