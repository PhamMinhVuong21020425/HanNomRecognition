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
    if (req.file) {
      req.body.avatar_url = req.file.path;
    }
    const updatedUser = await userServices.updateUser(req.params.id, req.body);
    res.json(updatedUser);
  }
);

export const userChangePassPost = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await userServices.changePassword(
      req.params.id,
      req.body.currentPassword,
      req.body.newPassword
    );
    res.json(result);
  }
);
