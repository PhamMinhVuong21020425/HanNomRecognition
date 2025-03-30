import { NextFunction, Response, Request } from 'express';
import asyncHandler from 'express-async-handler';
import sendToQueue from '../config/rabbit-mq';
import { getIO } from '../config/socket-io';

export const trainModelDetect = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const task = {
      id: Date.now(),
      model: req.body.model,
      parameters: req.body.parameters,
    };

    await sendToQueue(task);
    res.json({ message: 'Task added to queue', taskId: task.id });
  }
);

export const trainModelDetectResult = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    console.log(`[✔] Training result received:`, req.body);

    // Send event to all connected clients
    const io = getIO();
    io.emit('trainingResult', req.body);
    res.json({ message: 'Result received' });
  }
);

export const trainModelClassify = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {}
);

export const trainActiveLearning = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {}
);
