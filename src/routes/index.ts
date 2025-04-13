import { Router } from 'express';
import authRouter from './auth.routes';
import trainRouter from './train.routes';
import userRouter from './user.routes';
import datasetRouter from './dataset.routes';
import jobRouter from './job.routes';
import notiRouter from './notification.routes';
import upload from '../config/multer-config';
import {
  getFileServer,
  downloadFileServer,
  saveAnnotationDataToDatabase,
} from '../controllers/home.controller';

const router: Router = Router();

router.use('/auth', authRouter);
router.use('/train', trainRouter);
router.use('/users', userRouter);
router.use('/datasets', datasetRouter);
router.use('/jobs', jobRouter);
router.use('/notis', notiRouter);
router.post('/files/view', getFileServer);
router.post('/files/download', downloadFileServer);
router.post(
  '/annotations/save',
  upload.array('files'),
  saveAnnotationDataToDatabase
);

export default router;
