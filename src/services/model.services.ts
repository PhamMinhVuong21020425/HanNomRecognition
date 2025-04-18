import { AppDataSource } from '../config/data-source';
import { Model } from '../entities/model.entity';
import { ModelStatus } from '../enums/ModelStatus';

const modelRepository = AppDataSource.getRepository(Model);

export const getModelById = async (id: string) => {
  const model = await modelRepository.findOneBy({ id });
  return model;
};

export const getAllModels = async (userId: string) => {
  const models = await modelRepository.find({
    where: [
      { is_public: true, status: ModelStatus.COMPLETED },
      { user: { id: userId }, status: ModelStatus.COMPLETED },
    ],
    order: { updated_at: 'DESC' },
    relations: { user: true },
  });
  return models;
};

export const getModelsByUserId = async (userId: string) => {
  const models = await modelRepository.find({
    where: { user: { id: userId }, status: ModelStatus.COMPLETED },
    order: { updated_at: 'DESC' },
  });
  return models;
};

export const createModel = async (model: Partial<Model>) => {
  const newModel = modelRepository.create(model);
  return modelRepository.save(newModel);
};

export const updateModel = async (id: string, model: Partial<Model>) => {
  const currentModel = await getModelById(id);
  if (!currentModel) {
    return null;
  }
  Object.assign(currentModel, model);
  return modelRepository.save(currentModel);
};

export const deleteModelById = async (id: string) => {
  const result = await modelRepository.delete(id);
  return result.affected ? true : false;
};
