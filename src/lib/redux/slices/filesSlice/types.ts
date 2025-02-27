type Coordinate = {
  x: number;
  y: number;
};

type Box = {
  class: string;
  confidence: number;
  coordinates: Coordinate[];
  name: string;
};

export type DetectionType = {
  objects_detection: Box[];
  url_image: string;
  image_name: string;
};
