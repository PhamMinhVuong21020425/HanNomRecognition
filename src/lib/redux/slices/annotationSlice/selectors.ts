/* Instruments */
import type { ReduxState } from '@/lib/redux';

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file.
export const selectImageFiles = (state: ReduxState) =>
  state.annotation.imageFiles;

export const selectSelDrawImageIndex = (state: ReduxState) =>
  state.annotation.selDrawImageIndex;

export const selectSelImageIndexes = (state: ReduxState) =>
  state.annotation.selImageIndexes;

export const selectImageSizes = (state: ReduxState) =>
  state.annotation.imageSizes;

export const selectDrawStatus = (state: ReduxState) =>
  state.annotation.drawStatus;

export const selectShapes = (state: ReduxState) => state.annotation.shapes;

export const selectSelShapeIndex = (state: ReduxState) =>
  state.annotation.selShapeIndex;

export const selectDrawStyle = (state: ReduxState) =>
  state.annotation.drawStyle;

export const selectCurrentShape = (state: ReduxState) =>
  state.annotation.currentShape;

export const selectSelShapeType = (state: ReduxState) =>
  state.annotation.selShapeType;

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

export const selectClosePointRegion = (state: ReduxState) =>
  state.annotation.closePointRegion;

export const selectDragStatus = (state: ReduxState) =>
  state.annotation.dragStatus;

export const selectFullScreen = (state: ReduxState) =>
  state.annotation.fullScreen;

export const selectIsShowUpload = (state: ReduxState) =>
  state.annotation.isShowUpload;

export const selectSelDrawTxtIndex = (state: ReduxState) =>
  state.annotation.selDrawTxtIndex;

export const selectSelTxtIndexes = (state: ReduxState) =>
  state.annotation.selTxtIndexes;

export const selectTxtFiles = (state: ReduxState) => state.annotation.txtFiles;

export const selectDrawingShapePathStyle = (state: ReduxState) =>
  state.annotation.drawStyle.drawingShapePathStyle;

export const selectDrawingShapePointStyle = (state: ReduxState) =>
  state.annotation.drawStyle.drawingShapePointStyle;

export const selectLabelStyle = (state: ReduxState) =>
  state.annotation.drawStyle.labelStyle;

export const selectShapeStyle = (state: ReduxState) =>
  state.annotation.drawStyle.shapeStyle;

export const selectSelShapeStyle = (state: ReduxState) =>
  state.annotation.drawStyle.selShapeStyle;
