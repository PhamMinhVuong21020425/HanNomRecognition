import { Router } from 'express';
import * as jobController from '../controllers/job.controller';

const router: Router = Router();

router.post('/delete', jobController.deleteJobPost);

router.get('/:userId', jobController.jobsOfUserGet);

export default router;
