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

router.post('/classify/result', trainController.trainModelClassifyResult);

router.post(
  '/active-learning',
  upload.single('pool'),
  trainController.trainActiveLearning
);

router.post(
  '/active-learning/result',
  trainController.trainActiveLearningResult
);

export default router;
