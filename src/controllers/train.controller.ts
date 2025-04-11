import { NextFunction, Response, Request } from 'express';
import asyncHandler from 'express-async-handler';
import sendToQueue from '../config/rabbit-mq';
import { sendSystemMessage } from '../config/socket-io';
import { createModel, updateModel } from '../services/model.services';
import { createJob, updateJob } from '../services/job.services';
import { ProblemType } from '../enums/ProblemType';
import { ModelStatus } from '../enums/ModelStatus';
import { User } from '../entities/user.entity';
import { TrainingJobStatus } from '../enums/TrainingJobStatus';

export const trainModelDetect = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No image uploaded' });
      return;
    }

    const newModel = await createModel({
      name: req.body.modelName,
      description: req.body.description,
      type: ProblemType.DETECT,
      created_at: new Date(),
      user: { id: req.body.userId } as User,
    });
    console.log(`[✔] Model created:`, newModel);

    const newJob = await createJob({
      epochs: req.body.epochs,
      batch_size: req.body.batchSize,
      model: newModel,
      user: { id: req.body.userId } as User,
    });

    const task = {
      id: Date.now(),
      ...req.body,
      dataset: req.file.path,
      modelId: newModel.id,
      jobId: newJob.id,
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
    const data = req.body;
    console.log(`[✔] Training detection result received:`, data);

    // Update model with the result
    await updateModel(data.modelId, {
      accuracy: data.result.metrics['mAP@50-95'],
      path: data.result.best_model_path,
      status: ModelStatus.COMPLETED,
    });

    // Update job with the result
    await updateJob(data.jobId, {
      status: TrainingJobStatus.COMPLETED,
      completed_at: new Date(),
      result_path: data.result.best_model_path,
    });

    // Send event to all connected clients
    await sendSystemMessage(data.userId, data);

    res.json({ message: 'Result received' });
  }
);

export const trainModelClassify = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No image uploaded' });
      return;
    }

    const newModel = await createModel({
      name: req.body.modelName,
      description: req.body.description,
      type: ProblemType.CLASSIFY,
      created_at: new Date(),
      user: { id: req.body.userId } as User,
    });
    console.log(`[✔] Model created:`, newModel);

    const newJob = await createJob({
      epochs: req.body.epochs,
      batch_size: req.body.batchSize,
      model: newModel,
      user: { id: req.body.userId } as User,
    });

    const task = {
      id: Date.now(),
      ...req.body,
      dataset: req.file.path,
      modelId: newModel.id,
      jobId: newJob.id,
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
    const data = req.body;
    console.log(`[✔] Training classification result received:`, data);

    // Update model with the result
    await updateModel(data.modelId, {
      accuracy: data.result.best_val_acc,
      path: data.result.model_weights,
      num_classes: data.result.num_classes,
      status: ModelStatus.COMPLETED,
    });

    // Update job with the result
    await updateJob(data.jobId, {
      status: TrainingJobStatus.COMPLETED,
      completed_at: new Date(),
      result_path: data.result.model_weights,
    });

    // Send event to all connected clients
    await sendSystemMessage(data.userId, data);

    res.json({ message: 'Classify result received!!' });
  }
);

export const trainActiveLearning = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No image uploaded' });
      return;
    }

    const newJob = await createJob({
      n_samples: req.body.n_samples,
      strategy: req.body.strategy,
      user: { id: req.body.userId } as User,
    });
    console.log(`[✔] Job created:`, newJob);

    const task = {
      id: Date.now(),
      ...req.body,
      pool: req.file.path,
      jobId: newJob.id,
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

    // Update job with the result
    await updateJob(req.body.jobId, {
      status: TrainingJobStatus.COMPLETED,
      completed_at: new Date(),
      result_path: req.body.result.labeled_images_path,
    });

    // Send event to all connected clients
    await sendSystemMessage(req.body.userId, req.body);

    res.json({ message: 'AL result received!!' });
  }
);
