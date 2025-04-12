import axios from '@/lib/axios';

/* Instruments */
import { createAppAsyncThunk } from '@/lib/redux/createAppAsyncThunk';

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
