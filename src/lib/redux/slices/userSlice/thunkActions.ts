import axios from '@/lib/axios';

/* Instruments */
import { createAppAsyncThunk } from '@/lib/redux/createAppAsyncThunk';
import { getObjectUrlFromPath } from '@/utils/general';
import { UserData } from '@/types/UserData';

const fetchUserData = async (): Promise<{
  data: { user: UserData | null };
}> => {
  const response = await axios.get('/be/auth');

  return response;
};

export const fetchUserDataAsync = createAppAsyncThunk(
  'user/fetchUserDataAsync',
  async () => {
    const response = await fetchUserData();

    // The value we return becomes the `fulfilled` action payload
    const user = response.data.user;
    if (user && user.avatar_url) {
      user.avatar_url = await getObjectUrlFromPath(user.avatar_url);
    }
    return user;
  }
);

export const updateUserDataAsync = createAppAsyncThunk(
  'user/updateUserDataAsync',
  async (payload: { id: string; data: UserData; avatarFile: File | null }) => {
    const { id, data, avatarFile } = payload;
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('email', data.email);
    formData.append('role', data.role);
    formData.append('phone', data.phone);
    formData.append('gender', data.gender);
    formData.append('birthday', data.birthday.toString());
    formData.append('about', data.about);

    if (avatarFile) {
      formData.append('avatar', avatarFile);
    }

    const response = await axios.post(`/be/users/${id}/update`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // The value we return becomes the `fulfilled` action payload
    const user = response.data;
    if (user && user.avatar_url) {
      user.avatar_url = await getObjectUrlFromPath(user.avatar_url);
    }
    return user;
  }
);
