import { NextFunction, Response, Request } from 'express';
import asyncHandler from 'express-async-handler';
import sendToQueue from '../config/rabbit-mq';
import { sendSystemMessage } from '../config/socket-io';

export const trainModelDetect = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No image uploaded' });
      return;
    }

    const task = {
      id: Date.now(),
      ...req.body,
      dataset: req.file.path,
      type: 'detect',
      status: 'pending',
      created_at: new Date(),
    };

    await sendToQueue(task);
    res.json({ success: true, message: 'Job added to queue' });
  }
);

export const trainModelDetectResult = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    console.log(`[✔] Training detection result received:`, req.body);

    // Send event to all connected clients
    await sendSystemMessage(req.body.userId, req.body);

    res.json({ message: 'Result received' });
  }
);

export const trainModelClassify = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No image uploaded' });
      return;
    }

    const task = {
      id: Date.now(),
      ...req.body,
      dataset: req.file.path,
      type: 'classify',
      status: 'pending',
      created_at: new Date(),
    };

    await sendToQueue(task);
    res.json({ success: true, message: 'Job added to queue' });
  }
);

export const trainModelClassifyResult = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    console.log(`[✔] Training classification result received:`, req.body);

    // Send event to all connected clients
    await sendSystemMessage(req.body.userId, req.body);

    res.json({ message: 'Classify result received!!' });
  }
);

export const trainActiveLearning = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No image uploaded' });
      return;
    }

    const task = {
      id: Date.now(),
      ...req.body,
      pool: req.file.path,
      type: 'active_learning',
      status: 'pending',
      created_at: new Date(),
    };

    await sendToQueue(task);
    res.json({ success: true, message: 'Job added to queue' });
  }
);

export const trainActiveLearningResult = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    console.log(`[✔] Active Learning result received:`, req.body);

    // Send event to all connected clients
    await sendSystemMessage(req.body.userId, req.body);

    res.json({ message: 'AL result received!!' });
  }
);
