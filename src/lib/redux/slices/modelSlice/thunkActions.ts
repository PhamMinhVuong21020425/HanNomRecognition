import axios from '@/lib/axios';

/* Instruments */
import { createAppAsyncThunk } from '@/lib/redux/createAppAsyncThunk';
import { Model } from '@/entities/model.entity';

export const getAllModelsAsync = createAppAsyncThunk(
  'model/getAllModelsAsync',
  async (userId: string) => {
    const response = await axios.get(`/be/models/all/${userId}`);

    return response.data;
  }
);

export const getModelsOfUserAsync = createAppAsyncThunk(
  'model/getModelsOfUserAsync',
  async (userId: string) => {
    const response = await axios.get(`/be/models/${userId}`);

    return response.data;
  }
);

export const updateModelAsync = createAppAsyncThunk(
  'model/updateModelAsync',
  async (data: Partial<Model>) => {
    const response = await axios.post('/be/models/update', data);

    return response.data;
  }
);

export const deleteModelAsync = createAppAsyncThunk(
  'model/deleteModelAsync',
  async (modelId: string) => {
    const response = await axios.post('/be/models/delete', {
      id: modelId,
    });

    if (response.data) return modelId;
    return null;
  }
);
