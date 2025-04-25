import axios from '@/lib/axios';

/* Instruments */
import { createAppAsyncThunk } from '@/lib/redux/createAppAsyncThunk';
import { Dataset } from '@/entities/dataset.entity';

export const getAllDatasetsAsync = createAppAsyncThunk(
  'dataset/getAllDatasetsAsync',
  async (userId: string) => {
    const response = await axios.get(`/be/datasets/all/${userId}`);

    return response.data;
  }
);

export const getDatasetsOfUserAsync = createAppAsyncThunk(
  'dataset/getDatasetsOfUserAsync',
  async (userId: string) => {
    const response = await axios.get(`/be/datasets/${userId}`);

    return response.data;
  }
);

export const updateDatasetAsync = createAppAsyncThunk(
  'dataset/updateDatasetAsync',
  async (data: Partial<Dataset>) => {
    const response = await axios.post('/be/datasets/update', data);

    return response.data;
  }
);
