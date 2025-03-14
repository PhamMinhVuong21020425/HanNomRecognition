/* Core */
import { createSelector } from '@reduxjs/toolkit';

/* Instruments */
import type { ReduxState } from '@/lib/redux';

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file.
const selectAnnotation = (state: ReduxState) => state.annotation;

export const selectImagesInfo = createSelector(
  [selectAnnotation],
  annotation => ({
    imageFiles: annotation.imageFiles,
    selDrawImageIndex: annotation.selDrawImageIndex,
    imageSizes: annotation.imageSizes,
  })
);

export const selectDrawingState = createSelector(
  [selectAnnotation],
  annotation => ({
    drawStyle: annotation.drawStyle,
    drawStatus: annotation.drawStatus,
    selShapeType: annotation.selShapeType,
  })
);

export const selectShapes = createSelector(
  [selectAnnotation],
  annotation => annotation.shapes
);

export const selectSelImageIndexes = createSelector(
  [selectAnnotation],
  annotation => annotation.selImageIndexes
);

export const selectImageFiles = createSelector(
  [selectAnnotation],
  annotation => annotation.imageFiles
);

export const selectSelDrawImageIndex = (state: ReduxState) =>
  state.annotation.selDrawImageIndex;

export const selectDrawStatus = (state: ReduxState) =>
  state.annotation.drawStatus;

export const selectSelShapeIndex = (state: ReduxState) =>
  state.annotation.selShapeIndex;

export const selectSelShapeType = (state: ReduxState) =>
  state.annotation.selShapeType;

export const selectCurrentShape = (state: ReduxState) =>
  state.annotation.currentShape;

export const selectLabelTypes = (state: ReduxState) =>
  state.annotation.labelTypes;

export const selectSelLabelType = (state: ReduxState) =>
  state.annotation.selLabelType;

export const selectLabelBoxStatus = (state: ReduxState) =>
  state.annotation.labelBoxStatus;

export const selectLabelBoxVisible = (state: ReduxState) =>
  state.annotation.labelBoxVisible;

export const selectSelPreviewIndex = (state: ReduxState) =>
  state.annotation.selPreviewIndex;

export const selectXmlPreviewBoxVisible = (state: ReduxState) =>
  state.annotation.xmlPreviewBoxVisible;

export const selectUrlBoxVisible = (state: ReduxState) =>
  state.annotation.urlBoxVisible;

export const selectTextCopyBoxVisible = (state: ReduxState) =>
  state.annotation.textCopyBoxVisible;
