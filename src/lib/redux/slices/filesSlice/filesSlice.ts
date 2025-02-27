/* Core */
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

/* Types */
import type { DetectionType } from './types';
import type { ImageType } from '@/types/ImageType';

export interface FilesState {
  images: ImageType[];
  detections: DetectionType[];
}

const initialState: FilesState = {
  images: [],
  detections: [],
} satisfies FilesState as FilesState;

export const filesSlice = createSlice({
  name: 'files',
  initialState,
  reducers: {
    setImagesRedux: (state, action: PayloadAction<ImageType[]>) => {
      state.images = action.payload;
    },
    setDetections: (state, action: PayloadAction<DetectionType[]>) => {
      state.detections = action.payload;
    },
  },
});

export const { setImagesRedux, setDetections } = filesSlice.actions;

export const filesReducer = filesSlice.reducer;
