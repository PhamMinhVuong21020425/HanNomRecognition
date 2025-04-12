import { NextFunction, Response, Request } from 'express';
import asyncHandler from 'express-async-handler';
import {
  getAllDatasets,
  getDatasetsByUserId,
  createDataset,
  updateDataset,
  deleteDatasetById,
  createImage,
} from '../services/dataset.services';
import { User } from '../entities/user.entity';
import { decodeUTF8 } from '../utils/utf8';

export const allDatasetGet = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.userId as string;
    const datasets = await getAllDatasets(userId);
    res.json(datasets);
  }
);

export const datasetOfUserGet = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const datasets = await getDatasetsByUserId(req.params.userId);
    res.json(datasets);
  }
);

export const createDatasetPost = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, description, isPublic, type, userId } = req.body;
    const dataset = await createDataset({
      name,
      description,
      is_public: isPublic === 'true',
      type,
      user: { id: userId } as User,
    });

    const images = req.files as Express.Multer.File[];
    for (const img of images) {
      const path = img.path.replace(/\\/g, '/');
      const name = decodeUTF8(img.originalname);
      await createImage({ name, path, dataset });
    }

    res.json(dataset);
  }
);

export const updateDatasetPost = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.body.id;
    const dataset = {
      name: req.body.name,
      description: req.body.description,
      type: req.body.type,
      is_public: req.body.isPublic,
    };
    const updatedDataset = await updateDataset(id, dataset);
    res.json(updatedDataset);
  }
);

export const deleteDatasetPost = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const success = await deleteDatasetById(req.body.id);
    res.json({ success });
  }
);
