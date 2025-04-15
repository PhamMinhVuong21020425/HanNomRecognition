import { NextFunction, Response, Request } from 'express';
import asyncHandler from 'express-async-handler';
import { deleteJobById, getJobsByUserId } from '../services/job.services';

export const jobsOfUserGet = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const jobs = await getJobsByUserId(req.params.userId);
    res.json(jobs);
  }
);

export const deleteJobPost = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const success = await deleteJobById(req.body.id);
    res.json({ success });
  }
);
