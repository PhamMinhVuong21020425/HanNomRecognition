/* Instruments */
import type { ReduxState } from '@/lib/redux';

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file.
export const selectIsUploadModal = (state: ReduxState) => state.event.isUploadModal;

export const selectIsOpenDescript = (state: ReduxState) => state.event.isOpenDescript;

export const selectDragStatus = (state: ReduxState) => state.event.dragStatus;

export const selectIsRotate = (state: ReduxState) => state.event.isRotate;

export const selectIsFullscreen = (state: ReduxState) => state.event.isFullScreen;
