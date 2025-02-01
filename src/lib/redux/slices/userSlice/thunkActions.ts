import axios from '@/lib/axios';

/* Instruments */
import { createAppAsyncThunk } from '@/lib/redux/createAppAsyncThunk';
import { UserData } from '@/types/UserData';

const fetchUserData = async (): Promise<{
  data: { user: UserData | null };
}> => {
  const response = await axios.get('/be/auth');

  return response;
};

export const fetchUserDataAsync = createAppAsyncThunk(
  'user/fetchUserData',
  async () => {
    const response = await fetchUserData();

    // The value we return becomes the `fulfilled` action payload
    return response.data.user;
  }
);
