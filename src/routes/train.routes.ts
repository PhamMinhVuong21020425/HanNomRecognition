import { Router } from 'express';
import upload from '../config/multer-config';
import * as trainController from '../controllers/train.controller';

const router: Router = Router();

router.post(
  '/detect',
  upload.single('dataset'),
  trainController.trainModelDetect
);

router.post('/detect/result', trainController.trainModelDetectResult);

router.post(
  '/classify',
  upload.single('dataset'),
  trainController.trainModelClassify
);

router.post(
  '/active-learning',
  upload.single('dataset'),
  trainController.trainActiveLearning
);

export default router;
