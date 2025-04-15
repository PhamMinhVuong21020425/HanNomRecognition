import { NextFunction, Response, Request } from 'express';
import asyncHandler from 'express-async-handler';
import {
  createNotification,
  getNotificationsByUserId,
  deleteNotificationsByUserId,
} from '../services/notification.services';

export const notificationsOfUserGet = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const notis = await getNotificationsByUserId(req.params.userId);
    res.json(notis);
  }
);

export const createNotificationPost = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const noti = await createNotification(req.body);
    res.json(noti);
  }
);

export const deleteNotificationsOfUserPost = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const success = await deleteNotificationsByUserId(req.body.userId);
    res.json({ success });
  }
);
