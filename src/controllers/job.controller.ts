import { NextFunction, Response, Request } from 'express';
import asyncHandler from 'express-async-handler';

export const jobsOfUserGet = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {}
);

export const createJobPost = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {}
);

export const updateJobPost = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {}
);

export const deleteJobPost = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {}
);
