/* Core */
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

/* Types */
export interface AppState {
  lang: 'en' | 'vi';
  error: string | null;
}

const initialState: AppState = {
  lang: 'vi',
  error: null,
} satisfies AppState as AppState;

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    changeLanguage: (state, action: PayloadAction<'en' | 'vi'>) => {
      state.lang = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: state => {
      state.error = null;
    },
  },
});

export const { changeLanguage, setError, clearError } = appSlice.actions;

export const appReducer = appSlice.reducer;
