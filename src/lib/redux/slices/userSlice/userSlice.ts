/* Core */
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

/* Instruments */
import { fetchUserDataAsync, updateUserDataAsync } from './thunkActions';
import { UserData } from '@/types/UserData';

/* Types */
export interface UserState {
  userData: UserData | null;
  status: 'idle' | 'loading' | 'failed';
}

const initialState: UserState = {
  userData: null,
  status: 'idle',
} satisfies UserState as UserState;

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserData>) => {
      state.userData = action.payload;
    },
    clearUser: state => {
      state.userData = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchUserDataAsync.pending, state => {
        state.status = 'loading';
      })
      .addCase(fetchUserDataAsync.fulfilled, (state, action) => {
        state.status = 'idle';
        state.userData = action.payload;
      })
      .addCase(updateUserDataAsync.pending, state => {
        state.status = 'loading';
      })
      .addCase(updateUserDataAsync.fulfilled, (state, action) => {
        state.status = 'idle';
        state.userData = action.payload;
      });
  },
});

export const { setUser, clearUser } = userSlice.actions;

export const userReducer = userSlice.reducer;
