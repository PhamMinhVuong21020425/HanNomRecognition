import { Router } from 'express';
import upload from '../config/multer-config';
import * as datasetController from '../controllers/dataset.controller';

const router: Router = Router();

router.post(
  '/create',
  upload.array('imgs'),
  datasetController.createDatasetPost
);

router.post('/update', datasetController.updateDatasetPost);

router.post('/delete', datasetController.deleteDatasetPost);

router.get('/:userId', datasetController.datasetOfUserGet);

router.get('/', datasetController.allDatasetGet);

export default router;
