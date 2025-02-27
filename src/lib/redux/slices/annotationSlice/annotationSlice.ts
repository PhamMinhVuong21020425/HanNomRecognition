/* Core */
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { cloneDeep } from 'lodash';

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

type SetTxtFilesPayload = {
  txtFiles: any[][];
  selDrawTxtIndex: number;
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
  txtFiles: [],
  selDrawTxtIndex: -1,
  selTxtIndexes: [],
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
  closePointRegion: 6,
  dragStatus: '',
  fullScreen: '',
  isShowUpload: false,
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

    setTxtFiles: (state, action: PayloadAction<SetTxtFilesPayload>) => {
      const { txtFiles, selDrawTxtIndex, drawStatus, shapes, selShapeIndex } =
        action.payload;
      state.txtFiles = txtFiles;
      state.selDrawTxtIndex = selDrawTxtIndex;
      state.selTxtIndexes = [];
      state.drawStatus = drawStatus;
      state.currentShape = null;
      state.shapes = shapes;
      state.selShapeIndex = selShapeIndex;
    },

    setSelDrawTxtIndex: (
      state,
      action: PayloadAction<{ selDrawTxtIndex: number }>
    ) => {
      state.selDrawTxtIndex = action.payload.selDrawTxtIndex;
      state.drawStatus = DRAW_STATUS_TYPES.IDLE;
      state.currentShape = null;
      state.selShapeIndex = -1;
    },

    setSelTxtIndexes: (
      state,
      action: PayloadAction<{ selTxtIndexes: number[] }>
    ) => {
      state.selTxtIndexes = action.payload.selTxtIndexes;
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
        state.shapes = state.shapes.map((item, index) => {
          if (index !== state.selDrawImageIndex) return item;
          return item.map((subItem, subIndex) => {
            const newSubItem = cloneDeep(subItem);
            newSubItem.isSelect = subIndex === selShapeIndex;
            return newSubItem;
          });
        });
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

    setDragImage: state => {
      state.dragStatus = 'DRAG_IMAGE';
    },

    setNotDragImage: state => {
      state.dragStatus = 'NOT_DRAG_IMAGE';
    },

    setFullScreen: state => {
      state.fullScreen = 'FULL_SCREEN';
    },

    setShowUploadModal: (
      state,
      action: PayloadAction<{ isShowUpload: boolean }>
    ) => {
      state.isShowUpload = action.payload.isShowUpload;
    },
  },
});

export const {
  setImageFiles,
  setSelDrawImageIndex,
  setImageSizes,
  setSelImageIndexes,
  setTxtFiles,
  setSelDrawTxtIndex,
  setSelTxtIndexes,
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
  setDragImage,
  setNotDragImage,
  setFullScreen,
  setShowUploadModal,
} = annotationSlice.actions;

export const annotationReducer = annotationSlice.reducer;
