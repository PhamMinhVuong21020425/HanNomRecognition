import express, { Request, Response, NextFunction } from 'express';
import homeController from '../controllers/home.controller';
const router = express.Router();

/* GET home page. */
router.get('/', homeController);

export default router;
