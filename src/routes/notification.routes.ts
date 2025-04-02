import { Router } from 'express';
import * as notiController from '../controllers/notification.controller';

const router: Router = Router();

router.post('/create', notiController.createNotificationPost);

router.post('/delete', notiController.deleteNotificationsOfUserPost);

router.get('/:userId', notiController.notificationsOfUserGet);

export default router;
