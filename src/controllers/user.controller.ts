import { NextFunction, Response, Request } from 'express';
import asyncHandler from 'express-async-handler';
import * as userServices from '../services/user.services';

export const getUserList = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const users = await userServices.getAllUsers();
    res.json(users);
  }
);

export const userUpdatePost = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const updatedUser = await userServices.updateUser(req.params.id, req.body);
    res.json(updatedUser);
  }
);
