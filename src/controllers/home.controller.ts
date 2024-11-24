import { Request, Response, NextFunction } from 'express';
import NextRenderer from '../config/next-render';
import { NextParsedUrlQuery } from 'next/dist/server/request-meta';

const homeController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.json({ title: 'Home Page', description: 'Home page description' });
};

export default homeController;
