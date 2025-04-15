import { Router } from 'express';
import * as modelController from '../controllers/model.controller';

const router: Router = Router();

router.post('/update', modelController.updateModelPost);

router.post('/delete', modelController.deleteModelPost);

router.get('/all/:userId', modelController.allModelsGet);

router.get('/:userId', modelController.modelsOfUserGet);

export default router;
