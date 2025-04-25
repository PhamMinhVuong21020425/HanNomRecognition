import { NextFunction, Response, Request } from 'express';
import asyncHandler from 'express-async-handler';
import {
  getAllModels,
  getModelsByUserId,
  updateModel,
  deleteModelById,
} from '../services/model.services';

export const allModelsGet = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.userId as string;
    const models = await getAllModels(userId);
    res.json(models);
  }
);

export const modelsOfUserGet = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const models = await getModelsByUserId(req.params.userId);
    res.json(models);
  }
);

export const updateModelPost = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id, name, description, is_public } = req.body;
    const model = {
      name,
      description,
      is_public,
    };
    const updatedModel = await updateModel(id, model);
    res.json(updatedModel);
  }
);

export const deleteModelPost = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const success = await deleteModelById(req.body.id);
    res.json({ success });
  }
);
