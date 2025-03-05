export type AnnotationFile = {
  text: string;
  name: string;
};

export type YoloFormat = {
  label: string;
  x_center: number;
  y_center: number;
  width: number;
  height: number;
};

export type CocoFormat = {
  label: string;
  x_min: number;
  y_min: number;
  width: number;
  height: number;
};

export type PascalVocFormat = {
  label: string;
  x_min: number;
  y_min: number;
  x_max: number;
  y_max: number;
};
