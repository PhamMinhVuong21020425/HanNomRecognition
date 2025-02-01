import passport from 'passport';
import { Router } from 'express';
import * as authController from '../controllers/auth.controller';

const router: Router = Router();

router.get('/', authController.getAuthInfo);

router.post('/register', authController.registerPost);

router.get('/verify/:email', authController.verifyGet);
router.post('/verify', authController.verifyPost);

router.post('/login', authController.loginPost);

router.get('/logout', authController.logout);

router.post('/forgot-pass', authController.forgotPassPost);

// Định tuyến để bắt đầu quy trình xác thực Google
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);

// Định tuyến để xử lý callback từ Google
router.get(
  '/google/callback',
  passport.authenticate('google', {
    accessType: 'offline',
    scope: ['email', 'profile'],
    failureRedirect: '/',
  }),
  authController.googleCallback
);

export default router;
