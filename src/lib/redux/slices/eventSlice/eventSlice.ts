/* Core */
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

/* Types */
export interface EventState {
  isUploadModal: boolean;
  isOpenDescript: boolean;
  dragStatus: string;
  isRotate: boolean;
  isFullScreen: boolean;
}

const initialState: EventState = {
  isUploadModal: false,
  isOpenDescript: false,
  dragStatus: '',
  isRotate: false,
  isFullScreen: false,
} satisfies EventState as EventState;

export const eventSlice = createSlice({
  name: 'event',
  initialState,
  reducers: {
    setIsUploadModal: (state, action: PayloadAction<boolean>) => {
      state.isUploadModal = action.payload;
    },
    setIsOpenDescript: (state, action: PayloadAction<boolean>) => {
      state.isOpenDescript = action.payload;
    },
    setDragImage: state => {
      state.dragStatus = 'DRAG_IMAGE';
    },
    setNotDragImage: state => {
      state.dragStatus = 'NOT_DRAG_IMAGE';
    },
    setIsRotate: state => {
      state.isRotate = !state.isRotate;
    },
    setIsFullScreen: state => {
      state.isFullScreen = !state.isFullScreen;
    },
  },
});

export const {
  setIsUploadModal,
  setIsOpenDescript,
  setDragImage,
  setNotDragImage,
  setIsRotate,
  setIsFullScreen,
} = eventSlice.actions;

export const eventReducer = eventSlice.reducer;
