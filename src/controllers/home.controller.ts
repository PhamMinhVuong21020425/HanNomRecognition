import fs from 'fs';
import path from 'path';
import mime from 'mime-types';
import asyncHandler from 'express-async-handler';
import { Request, Response, NextFunction } from 'express';
import { saveAnnotationDataset } from '../services/dataset.services';
import { ImageType } from '@/types/ImageType';

export const getFileServer = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { filePath } = req.body;

    const allowedBasePath = path.resolve(__dirname, '../../uploads');
    const absolutePath = path.resolve(filePath);

    if (!absolutePath.startsWith(allowedBasePath)) {
      console.error(`Access denied to path: ${absolutePath}`);
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    if (!fs.existsSync(absolutePath)) {
      console.error(`File not found: ${absolutePath}`);
      res.status(404).json({ error: 'File not found' });
      return;
    }

    const fileData = fs.readFileSync(absolutePath);

    const contentType = mime.lookup(absolutePath) || 'application/octet-stream';

    // Set the Content-Type header based on the file type
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', fileData.length);

    // Set header to support file download when needed
    const filename = path.basename(filePath);
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);

    res.send(fileData);
  }
);

export const downloadFileServer = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { filePath } = req.body;

    if (!filePath || !fs.existsSync(filePath)) {
      res.status(404).json({ error: 'File not found' });
      return;
    }

    try {
      const filename = path.basename(filePath);
      const fileData = fs.readFileSync(filePath);

      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${filename}"`
      );
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Length', fileData.length);

      res.send(fileData);
    } catch (error) {
      console.error(
        `Error downloading file: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      res.status(500).json({ error: 'Failed to download file' });
    }
  }
);

export const saveAnnotationDataToDatabase = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const datasetId = req.body.datasetId as string;
    const allImages = JSON.parse(req.body.allImages) as ImageType[];
    const images = JSON.parse(req.body.images) as ImageType[];
    const labels = JSON.parse(req.body.labels) as (string | undefined)[];
    const isLabels = JSON.parse(req.body.isLabels) as boolean[];
    const files = req.files as Express.Multer.File[];

    try {
      await saveAnnotationDataset(
        datasetId,
        allImages,
        images,
        files,
        labels,
        isLabels
      );
      res.status(200).json({ message: 'Data saved successfully' });
    } catch (error) {
      console.error(
        `Error saving annotation data: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      res.status(200).json({ error: 'Failed to save annotation data' });
    }
  }
);
