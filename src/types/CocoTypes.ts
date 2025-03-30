export type CocoInfo = {
  year: number;
  version: string;
  description: string;
  contributor: string;
  url: string;
  date_created: Date;
};

export type CocoLicense = {
  id: number;
  name: string;
  url: string;
};

export type CocoAnnotation = {
  id: number;
  image_id: number;
  category_id: number;
  bbox: number[]; // [x_min, y_min, width, height]
  area: number;
  segmentation: number[][];
  iscrowd: number;
};

export type CocoCategory = {
  id: number;
  name: string;
  supercategory: string;
};

export type CocoImage = {
  id: number;
  width: number;
  height: number;
  file_name: string;
};

export type CocoDataset = {
  info: CocoInfo;
  licenses: CocoLicense[];
  images: CocoImage[];
  annotations: CocoAnnotation[];
  categories: CocoCategory[];
};
