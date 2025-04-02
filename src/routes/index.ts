import { Router } from 'express';
import homeController from '../controllers/home.controller';
import authRouter from './auth.routes';
import trainRouter from './train.routes';
import userRouter from './user.routes';
import jobRouter from './job.routes';
import notiRouter from './notification.routes';

const router: Router = Router();

router.use('/auth', authRouter);
router.use('/train', trainRouter);
router.use('/users', userRouter);
router.use('/jobs', jobRouter);
router.use('/notis', notiRouter);
router.get('/', homeController);

export default router;
