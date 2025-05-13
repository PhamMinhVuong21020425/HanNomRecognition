import { Router } from 'express';
import upload from '../config/multer-config';
import * as userController from '../controllers/user.controller';

const router: Router = Router();

router.post(
  '/:id/update',
  upload.single('avatar'),
  userController.userUpdatePost
);

router.get('/', userController.getUserList);

export default router;
