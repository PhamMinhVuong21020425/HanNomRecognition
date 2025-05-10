import { ImageType } from '@/types/ImageType';

export type Coordinate = {
  x: number;
  y: number;
};

export type BoundingBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type ImageSize = {
  width: number;
  height: number;
  depth: number;
};

export type Shape = {
  label: string;
  visible: boolean;
  isSelect: boolean;
  exactPathCount: number;
  paths: Coordinate[];
  d: string;
};

export type ShapeStyle = {
  cursor: string;
  fill: string;
  fillOpacity: number;
  stroke: string;
  strokeWidth: number;
};

export type DrawingShapePathStyle = ShapeStyle & {
  strokeLinecap: 'butt' | 'round' | 'square';
  strokeLinejoin: 'butt' | 'round' | 'square';
  strokeDasharray: string;
};

export type DrawingShapePointStyle = {
  fill: string;
  fillOpacity: number;
  stroke: string;
  strokeWidth: number;
};

export type LabelStyle = {
  fill: string;
  fontSize: number;
  fontWeight: string;
};

export type DrawStyle = {
  shapeStyle: ShapeStyle;
  selShapeStyle: ShapeStyle;
  drawingShapePathStyle: DrawingShapePathStyle;
  drawingShapePointStyle: DrawingShapePointStyle;
  labelStyle: LabelStyle;
};

export type AnnotationState = {
  imageFiles: ImageType[];
  selDrawImageIndex: number;
  selImageIndexes: number[];
  imageSizes: ImageSize[];
  drawStyle: DrawStyle;
  drawStatus: string;
  selShapeType: string;
  currentShape: Shape | null;
  shapes: Shape[][];
  selShapeIndex: number;
  labelTypes: string[];
  selLabelType: string;
  labelBoxStatus: string;
  labelBoxVisible: boolean;
  selPreviewIndex: number;
  xmlPreviewBoxVisible: boolean;
  urlBoxVisible: boolean;
  textCopyBoxVisible: boolean;
  isSaveAnnotation: boolean;
};
