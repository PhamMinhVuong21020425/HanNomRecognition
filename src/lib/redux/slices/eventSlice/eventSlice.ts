/* Core */
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

/* Types */
export interface EventState {
  isUploadModal: boolean;
  isOpenDescript: boolean;
}

const initialState: EventState = {
  isUploadModal: false,
  isOpenDescript: false,
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
  },
});

export const { setIsUploadModal, setIsOpenDescript } = eventSlice.actions;

export const eventReducer = eventSlice.reducer;
