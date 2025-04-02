import { AppDataSource } from '../config/data-source';
import { Dataset } from '../entities/dataset.entity';
import { Image } from '../entities/image.entity';

const datasetRepository = AppDataSource.getRepository(Dataset);
const imageRepository = AppDataSource.getRepository(Image);

export const getDatasetById = async (id: string) => {
  const dataset = await datasetRepository.findOneBy({ id });
  return dataset;
};

export const getAllDatasets = async () => {
  const datasets = await datasetRepository.find({
    where: { is_public: true },
  });
  return datasets;
};

export const getDatasetsByUserId = async (userId: string) => {
  const datasets = await datasetRepository.find({
    where: { user: { id: userId } },
  });
  return datasets;
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
