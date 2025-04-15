import axios from '@/lib/axios';

/* Instruments */
import { createAppAsyncThunk } from '@/lib/redux/createAppAsyncThunk';

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
