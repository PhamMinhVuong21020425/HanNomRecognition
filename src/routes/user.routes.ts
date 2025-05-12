import { Router } from 'express';
import * as userController from '../controllers/user.controller';

const router: Router = Router();

router.post('/:id/update', userController.userUpdatePost);

router.get('/', userController.getUserList);

export default router;
