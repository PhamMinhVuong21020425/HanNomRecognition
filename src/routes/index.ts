import { Router } from 'express';
import homeController from '../controllers/home.controller';
import authRouter from './auth.routes';
import trainRouter from './train.routes';
import userRouter from './user.routes';

const router: Router = Router();

router.use('/auth', authRouter);
router.use('/train', trainRouter);
router.use('/users', userRouter);
router.get('/', homeController);

export default router;
