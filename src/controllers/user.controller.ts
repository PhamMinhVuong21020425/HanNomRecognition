import { NextFunction, Response, Request } from 'express';
import asyncHandler from 'express-async-handler';
import * as userServices from '../services/user.services';
import { UserRole } from '../enums/UserRole';

export const getUserList = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {}
);

export const userDetail = asyncHandler(async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const user = await userServices.getUserById(userId);
    if (!user) {
      res.json({
        status: 'error',
        error_msg: 'error.userNotFound',
      });
      return;
    }

    res.json({
      status: 'success',
      user: user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      error_msg: 'error.internalError',
    });
  }
});

export const validateUserCurrent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.session.user || !req.session.user.id) {
    return res.json({
      status: 'error',
      error_msg: 'error.authFailed',
    });
  }

  const user = await userServices.getUserById(req.session.user.id);
  if (!user) {
    res.json({
      status: 'error',
      error_msg: 'error.userNotFound',
    });
    return;
  }
};

export const userUpdateProfileGet = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await validateUserCurrent(req, res, next);

  res.json({
    status: 'success',
    user: req.session.user,
  });
};

export const userCreateGet = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    res.send('User is created with method GET');
  }
);

export const userCreatePost = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    res.send('User is created with method POST');
  }
);

export const userDeleteGet = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    res.send(`User ${req.params.id} is deleted with method GET`);
  }
);

export const userDeletePost = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    res.send(`User ${req.params.id} is deleted with method POST`);
  }
);

export const userUpdateGet = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    res.send(`User ${req.params.id} is updated with method GET`);
  }
);

export const userUpdatePost = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    res.send(`User ${req.params.id} is updated with method POST`);
  }
);
