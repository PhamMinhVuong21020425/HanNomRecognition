import fs from 'fs';
import { AppDataSource } from '../config/data-source';
import { Dataset } from '../entities/dataset.entity';
import { Image } from '../entities/image.entity';
import { ImageType } from '../types/ImageType';

const datasetRepository = AppDataSource.getRepository(Dataset);
const imageRepository = AppDataSource.getRepository(Image);

export const getDatasetById = async (id: string) => {
  const dataset = await datasetRepository.findOne({
    where: { id },
    relations: { images: true },
  });
  return dataset;
};

export const getAllDatasets = async (userId: string) => {
  const datasets = await datasetRepository.find({
    where: [{ is_public: true }, { user: { id: userId } }],
    order: { updated_at: 'DESC' },
  });
  return datasets;
};

export const getDatasetsByUserId = async (userId: string) => {
  const datasets = await datasetRepository.find({
    where: { user: { id: userId } },
    order: { updated_at: 'DESC' },
  });

  const enhancedDatasets = await Promise.all(
    datasets.map(async dataset => {
      if (dataset.avatar_path) {
        return dataset;
      }

      const firstImage = await datasetRepository.manager
        .createQueryBuilder(Image, 'image')
        .select('image.path')
        .where('image.dataset = :datasetId', { datasetId: dataset.id })
        .limit(1)
        .getOne();

      if (firstImage) {
        dataset.avatar_path = firstImage.path;
      }

      return dataset;
    })
  );

  return enhancedDatasets;
};

export const getImagesByDatasetId = async (datasetId: string) => {
  const images = await imageRepository.find({
    where: { dataset: { id: datasetId } },
  });
  return images;
};

export const createDataset = async (dataset: Partial<Dataset>) => {
  const newDataset = datasetRepository.create(dataset);
  return datasetRepository.save(newDataset);
};

export const updateDataset = async (id: string, dataset: Partial<Dataset>) => {
  const currentDataset = await getDatasetById(id);
  if (!currentDataset) {
    return null;
  }
  Object.assign(currentDataset, dataset);
  return datasetRepository.save(currentDataset);
};

export const deleteDatasetById = async (id: string) => {
  const result = await datasetRepository.delete(id);
  return result.affected ? true : false;
};

export const getImageByName = async (name: string) => {
  return imageRepository.findOneBy({ name });
};

export const createImage = async (image: Partial<Image>) => {
  const newImage = imageRepository.create(image);
  return imageRepository.save(newImage);
};

export const updateImage = async (id: string, image: Partial<Image>) => {
  const currentImage = await imageRepository.findOneBy({ id });
  if (!currentImage) {
    return null;
  }
  Object.assign(currentImage, image);
  return imageRepository.save(currentImage);
};

export const deleteImageById = async (id: string) => {
  const result = await imageRepository.delete(id);
  return result.affected ? true : false;
};

export const saveAnnotationDataset = async (
  datasetId: string,
  imageFiles: ImageType[],
  files: Express.Multer.File[],
  labels: (string | undefined)[],
  isLabels: boolean[]
) => {
  const dataset = await getDatasetById(datasetId);
  if (!dataset) {
    throw new Error('Dataset not found');
  }

  const deleteImages = dataset.images.filter(
    img => !imageFiles.some(item => item.name === img.name)
  );

  for (const img of deleteImages) {
    fs.unlinkSync(img.path);
    await deleteImageById(img.id);
  }

  for (let idx = 0; idx < files.length; idx++) {
    const img = imageFiles[idx];
    const file = files[idx];
    const existImage = await getImageByName(img.name);
    let label = labels[idx];
    if (existImage) {
      fs.unlinkSync(file.path);

      await updateImage(existImage.id, {
        label,
        is_labeled: isLabels[idx],
      });
    } else {
      await createImage({
        name: img.name,
        path: file.path.replace(/\\/g, '/'),
        dataset,
        label,
        is_labeled: isLabels[idx],
      });
    }
  }

  dataset.images = await getImagesByDatasetId(datasetId);
  dataset.updated_at = new Date();
  await datasetRepository.save(dataset);
};
