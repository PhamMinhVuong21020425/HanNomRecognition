import { Router } from 'express';
import * as trainController from '../controllers/train.controller';

const router: Router = Router();

router.get('/', (req, res) => {
  res.send('Train route is working');
});

router.post('/detect', trainController.trainModelDetect);

router.post('/detect/result', trainController.trainModelDetectResult);

router.post('/classify', trainController.trainModelClassify);

router.post('/active-learning', trainController.trainActiveLearning);

export default router;
