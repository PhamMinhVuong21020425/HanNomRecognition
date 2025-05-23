/* Core */
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

/* Instruments */
import {
  DRAW_STATUS_TYPES,
  SHAPE_TYPES,
  LABEL_STATUS_TYPES,
} from '@/constants';

import { drawStyleFactory } from '@/utils/general';

/* Types */
import type { AnnotationState, Shape, ImageSize, DrawStyle } from './types';
import type { ImageType } from '@/types/ImageType';

type SetImageFilesPayload = {
  imageFiles: ImageType[];
  selDrawImageIndex: number;
  imageSizes: ImageSize[];
  drawStatus: string;
  shapes: Shape[][];
  selShapeIndex: number;
};

type SetLabelBoxStatusPayload = {
  selLabelType: string;
  labelBoxVisible: boolean;
  labelBoxStatus: string;
};

type SetXmlPreviewBoxStatusPayload = {
  selPreviewIndex: number;
  xmlPreviewBoxVisible: boolean;
};

/* Initial State */
const initialState: AnnotationState = {
  imageFiles: [],
  selDrawImageIndex: -1,
  selImageIndexes: [],
  imageSizes: [],
  drawStyle: drawStyleFactory(0) as DrawStyle,
  drawStatus: DRAW_STATUS_TYPES.IDLE,
  selShapeType: SHAPE_TYPES.POINTER,
  currentShape: null,
  shapes: [],
  selShapeIndex: -1,
  labelTypes: [],
  selLabelType: '',
  labelBoxStatus: LABEL_STATUS_TYPES.IDLE,
  labelBoxVisible: false,
  selPreviewIndex: -1,
  xmlPreviewBoxVisible: false,
  urlBoxVisible: false,
  textCopyBoxVisible: false,
  isSaveAnnotation: true,
} satisfies AnnotationState as AnnotationState;

/* Annotation Slice */
export const annotationSlice = createSlice({
  name: 'annotation',
  initialState,
  reducers: {
    setImageFiles: (state, action: PayloadAction<SetImageFilesPayload>) => {
      const {
        imageFiles,
        selDrawImageIndex,
        imageSizes,
        drawStatus,
        shapes,
        selShapeIndex,
      } = action.payload;
      state.imageFiles = imageFiles;
      state.selDrawImageIndex = selDrawImageIndex;
      state.selImageIndexes = [];
      state.imageSizes = imageSizes;
      state.drawStatus = drawStatus;
      state.currentShape = null;
      state.shapes = shapes;
      state.selShapeIndex = selShapeIndex;
    },

    setLabelImageFile: (
      state,
      action: PayloadAction<{
        imageIndex: number;
        label: string | undefined;
      }>
    ) => {
      const { imageIndex, label } = action.payload;
      state.imageFiles[imageIndex].label = label;
    },

    setSelDrawImageIndex: (
      state,
      action: PayloadAction<{ selDrawImageIndex: number }>
    ) => {
      state.selDrawImageIndex = action.payload.selDrawImageIndex;
      state.drawStatus = DRAW_STATUS_TYPES.IDLE;
      state.currentShape = null;
      state.selShapeIndex = -1;
    },

    setImageSizes: (
      state,
      action: PayloadAction<{ imageSizes: ImageSize[]; drawStyle: DrawStyle }>
    ) => {
      state.imageSizes = action.payload.imageSizes;
      state.drawStyle = action.payload.drawStyle;
    },

    setSelImageIndexes: (
      state,
      action: PayloadAction<{ selImageIndexes: number[] }>
    ) => {
      state.selImageIndexes = action.payload.selImageIndexes;
    },

    setDrawStatus: (state, action: PayloadAction<{ drawStatus: string }>) => {
      state.drawStatus = action.payload.drawStatus;
    },

    setSelShapeType: (
      state,
      action: PayloadAction<{ selShapeType: string }>
    ) => {
      state.selShapeType = action.payload.selShapeType;
    },

    setLabelBoxStatus: (
      state,
      action: PayloadAction<SetLabelBoxStatusPayload>
    ) => {
      const { selLabelType, labelBoxVisible, labelBoxStatus } = action.payload;
      state.selLabelType = selLabelType;
      state.labelBoxVisible = labelBoxVisible;
      state.labelBoxStatus = labelBoxStatus;
    },

    setXmlPreviewBoxStatus: (
      state,
      action: PayloadAction<SetXmlPreviewBoxStatusPayload>
    ) => {
      const { selPreviewIndex, xmlPreviewBoxVisible } = action.payload;
      state.selPreviewIndex = selPreviewIndex;
      state.xmlPreviewBoxVisible = xmlPreviewBoxVisible;
    },

    setCocoPreview: (
      state,
      action: PayloadAction<SetXmlPreviewBoxStatusPayload>
    ) => {
      const { selPreviewIndex, xmlPreviewBoxVisible } = action.payload;
      state.selPreviewIndex = selPreviewIndex;
      state.xmlPreviewBoxVisible = xmlPreviewBoxVisible;
    },

    setUrlBoxStatus: (
      state,
      action: PayloadAction<{ urlBoxVisible: boolean }>
    ) => {
      state.urlBoxVisible = action.payload.urlBoxVisible;
    },

    setCurrentShape: (
      state,
      action: PayloadAction<{ currentShape: Shape | null }>
    ) => {
      state.currentShape = action.payload.currentShape;
    },

    setShapes: (state, action: PayloadAction<{ shapes: Shape[][] }>) => {
      state.currentShape = null;
      state.shapes = action.payload.shapes;
    },

    setShapesImport: (state, action: PayloadAction<{ shapes: Shape[][] }>) => {
      state.currentShape = null;
      state.shapes = action.payload.shapes;
    },

    setSelShapeIndex: (
      state,
      action: PayloadAction<{ selShapeIndex: number }>
    ) => {
      const { selShapeIndex } = action.payload;
      state.drawStatus =
        selShapeIndex === -1
          ? DRAW_STATUS_TYPES.IDLE
          : DRAW_STATUS_TYPES.SELECT;

      if (state.selDrawImageIndex !== -1) {
        if (state.selShapeIndex !== -1) {
          state.shapes[state.selDrawImageIndex][state.selShapeIndex].isSelect =
            false;
        }

        if (selShapeIndex !== -1) {
          state.shapes[state.selDrawImageIndex][selShapeIndex].isSelect = true;
        }
      }

      state.selShapeIndex = selShapeIndex;
    },

    setSelShapeIndexImport: (
      state,
      action: PayloadAction<{ selShapeIndex: number }>
    ) => {
      const { selShapeIndex } = action.payload;
      state.drawStatus =
        selShapeIndex === -1
          ? DRAW_STATUS_TYPES.IDLE
          : DRAW_STATUS_TYPES.SELECT;
      state.selShapeIndex = selShapeIndex;
    },

    setLabelTypes: (state, action: PayloadAction<{ labelTypes: string[] }>) => {
      state.labelTypes = action.payload.labelTypes;
    },

    setSelLabelType: (
      state,
      action: PayloadAction<{ selLabelType: string }>
    ) => {
      state.selLabelType = action.payload.selLabelType;
    },

    deleteSelShape: state => {
      if (state.selDrawImageIndex !== -1 && state.selShapeIndex !== -1) {
        state.drawStatus = DRAW_STATUS_TYPES.IDLE;
        state.shapes = state.shapes.map((item, index) =>
          index === state.selDrawImageIndex
            ? item?.filter((_, subIndex) => subIndex !== state.selShapeIndex)
            : item
        );
        state.selShapeIndex = -1;
      }
    },

    deleteAllShapes: state => {
      if (state.selDrawImageIndex !== -1) {
        state.drawStatus = DRAW_STATUS_TYPES.IDLE;
        state.currentShape = null;
        state.shapes = state.shapes.map((item, index) =>
          index === state.selDrawImageIndex ? [] : item
        );
        state.selShapeIndex = -1;
      }
    },

    setTextCopyBoxVisible: (
      state,
      action: PayloadAction<{ textCopyBoxVisible: boolean }>
    ) => {
      state.textCopyBoxVisible = action.payload.textCopyBoxVisible;
    },

    setIsSaveAnnotation: (
      state,
      action: PayloadAction<{ isSaveAnnotation: boolean }>
    ) => {
      state.isSaveAnnotation = action.payload.isSaveAnnotation;
    },
  },
});

export const {
  setImageFiles,
  setLabelImageFile,
  setSelDrawImageIndex,
  setImageSizes,
  setSelImageIndexes,
  setDrawStatus,
  setSelShapeType,
  setLabelBoxStatus,
  setXmlPreviewBoxStatus,
  setCocoPreview,
  setUrlBoxStatus,
  setCurrentShape,
  setShapes,
  setShapesImport,
  setSelShapeIndex,
  setSelShapeIndexImport,
  setLabelTypes,
  setSelLabelType,
  deleteSelShape,
  deleteAllShapes,
  setTextCopyBoxVisible,
  setIsSaveAnnotation,
} = annotationSlice.actions;

export const annotationReducer = annotationSlice.reducer;
