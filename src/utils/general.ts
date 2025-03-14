import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { XMLBuilder, XMLParser } from 'fast-xml-parser';
import { pointsX } from '@/app/components/SVGWrapper';

import {
  COCO_FOLDER_NAME,
  YOLO_FOLDER_NAME,
  PASCAL_VOC_FOLDER_NAME,
  DEFAULT_SAVE_FOLDER,
} from '../constants';

import type { Coordinate, Shape, ImageSize } from '../lib/redux';

export const getImage = (imageUrl: string, fileName = 'image.jpg') =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;
    img.onload = function onload() {
      const { width, height } = this as HTMLImageElement;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = width;
      canvas.height = height;
      ctx?.drawImage(this as HTMLImageElement, 0, 0);
      canvas.toBlob(
        blob => {
          if (blob) {
            resolve({
              file: new File([blob], fileName, { type: blob.type }),
              size: { width, height },
            });
          } else {
            reject(new Error('Failed to create image blob'));
          }
        },
        'image/jpeg',
        1.0
      );
    };
    img.onerror = function onerror() {
      reject(new Error('load image error'));
    };
  });

export const getImageSizeFromUrl = (
  imageUrl: string
): Promise<{ width: number; height: number }> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = err => reject(err);
  });

// fetch file from object url
export const fetchFileFromObjectUrl = async (
  url: string,
  fileName: string
): Promise<File> => {
  const response = await fetch(url);
  const blob = await response.blob();
  return new File([blob], fileName, { type: blob.type });
};

export const getURLExtension = (url: string) => url.trim().split('.')[1];

export const drawStyleFactory = (value: number) => ({
  shapeStyle: {
    cursor: 'pointer',
    fill: '#1890ff',
    fillOpacity: 0.2,
    stroke: '#1890ff',
    strokeWidth: Math.round(value * 0.001),
  },
  selShapeStyle: {
    cursor: 'pointer',
    fill: '#ffff00',
    fillOpacity: 0.2,
    stroke: '#ffff00',
    strokeWidth: Math.round(value * 0.001),
  },
  drawingShapePathStyle: {
    fill: '#ffff00',
    fillOpacity: 0.2,
    stroke: '#ffff00',
    strokeWidth: Math.round(value * 0.001),
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    strokeDasharray: `${Math.round(value * 0.008)}, ${Math.round(value * 0.008)}`,
  },
  drawingShapePointStyle: {
    fill: '#ffff00',
    fillOpacity: 1,
    stroke: 'transparent',
    strokeWidth: Math.round(value * 0.005),
  },
  labelStyle: {
    fill: '#000000d9',
    fontSize: Math.round(value * 0.02),
    fontWeight: 'bold',
  },
});

export const getSVGPathD = (paths: Coordinate[], isFinish: boolean) => {
  let d = paths.reduce((accumulator, currentValue, currentIndex) => {
    if (currentIndex === 0)
      return `${accumulator}M${currentValue.x},${currentValue.y} `;
    return `${accumulator}L${currentValue.x},${currentValue.y} `;
  }, '');
  if (isFinish) d += 'Z';
  return d;
};

// convert date object to string (format: YYYYMMDDhhmmss)
export const convertDateToString = (dateObj: Date) => {
  const year = dateObj.getFullYear();
  const month = (dateObj.getMonth() + 1).toString();
  const fMonth = month.length === 1 ? `0${month}` : month;
  const date = dateObj.getDate().toString();
  const fDate = date.length === 1 ? `0${date}` : date;
  const hour = dateObj.getHours().toString();
  const fHour = hour.length === 1 ? `0${hour}` : hour;
  const minute = dateObj.getMinutes().toString();
  const fMinute = minute.length === 1 ? `0${minute}` : minute;
  const second = dateObj.getSeconds().toString();
  const fSecond = second.length === 1 ? `0${second}` : second;
  return `${year}${fMonth}${fDate}${fHour}${fMinute}${fSecond}`;
};

export function getShapeXYMaxMin(paths: Coordinate[]) {
  return {
    array: pointsX,
    xmin: paths.reduce(
      (acc, cur) => (acc < cur.x ? acc : cur.x),
      Number.MAX_SAFE_INTEGER
    ),
    ymin: paths.reduce(
      (acc, cur) => (acc < cur.y ? acc : cur.y),
      Number.MAX_SAFE_INTEGER
    ),
    xmax: paths.reduce(
      (acc, cur) => (acc > cur.x ? acc : cur.x),
      -Number.MAX_SAFE_INTEGER
    ),
    ymax: paths.reduce(
      (acc, cur) => (acc > cur.y ? acc : cur.y),
      -Number.MAX_SAFE_INTEGER
    ),
  };
}

export const shapeFactory = (coordinate: Coordinate) => {
  const paths = [coordinate];
  const d = getSVGPathD(paths, false);
  return {
    label: '',
    visible: true,
    isSelect: false,
    exactPathCount: 1,
    paths,
    d,
  };
};

export const createPathFromPoints = (points: Coordinate[]) => {
  let path = '';
  points.forEach((point, index) => {
    const command = index === 0 ? 'M' : 'L';
    path += `${command} ${point.x} ${point.y} `;
  });

  // Đóng path
  path += 'Z';

  return path;
};

export const shapeFactoryTest = (paths: Coordinate[], label = '') => {
  const d = getSVGPathD(paths, true);
  return {
    label,
    visible: true,
    isSelect: false,
    exactPathCount: 1,
    paths,
    d,
  };
};

export const imageSizeFactory = ({ width = 0, height = 0, depth = 3 }) => ({
  width,
  height,
  depth,
});

export const annotationFactory = (file: File) => ({
  folder: DEFAULT_SAVE_FOLDER,
  filename: file.name,
  path: `./${DEFAULT_SAVE_FOLDER}/${file.name}`,
  source: {
    database: 'Unknown',
  },
  size: {
    width: 0,
    height: 0,
    depth: 3,
  },
  segmented: 0,
  object: [] as any[],
});

export const annotationCocoTxt = (label_in: string, paths: Coordinate[]) => {
  const x_min = paths.reduce(
    (acc, cur) => (acc < cur.x ? acc : cur.x),
    Number.MAX_SAFE_INTEGER
  );
  const y_min = paths.reduce(
    (acc, cur) => (acc < cur.y ? acc : cur.y),
    Number.MAX_SAFE_INTEGER
  );
  const x_max = paths.reduce(
    (acc, cur) => (acc > cur.x ? acc : cur.x),
    -Number.MAX_SAFE_INTEGER
  );
  const y_max = paths.reduce(
    (acc, cur) => (acc > cur.y ? acc : cur.y),
    -Number.MAX_SAFE_INTEGER
  );
  return {
    label: label_in,
    x_min: x_min,
    y_min: y_min,
    width: x_max - x_min,
    height: y_max - y_min,
  };
};

export const annotationYoloTxt = (
  label_in: string,
  paths: Coordinate[],
  size: { width: number; height: number }
) => {
  const x_min = paths.reduce(
    (acc, cur) => (acc < cur.x ? acc : cur.x),
    Number.MAX_SAFE_INTEGER
  );
  const y_min = paths.reduce(
    (acc, cur) => (acc < cur.y ? acc : cur.y),
    Number.MAX_SAFE_INTEGER
  );
  const x_max = paths.reduce(
    (acc, cur) => (acc > cur.x ? acc : cur.x),
    -Number.MAX_SAFE_INTEGER
  );
  const y_max = paths.reduce(
    (acc, cur) => (acc > cur.y ? acc : cur.y),
    -Number.MAX_SAFE_INTEGER
  );
  return {
    label: label_in,
    x_center: (x_min + x_max) / 2 / size.width,
    y_center: (y_min + y_max) / 2 / size.height,
    width: (x_max - x_min) / size.width,
    height: (y_max - y_min) / size.height,
  };
};

export const annotationPascalVocTxt = (
  label_in: string,
  paths: Coordinate[]
) => {
  const x_min = paths.reduce(
    (acc, cur) => (acc < cur.x ? acc : cur.x),
    Number.MAX_SAFE_INTEGER
  );
  const y_min = paths.reduce(
    (acc, cur) => (acc < cur.y ? acc : cur.y),
    Number.MAX_SAFE_INTEGER
  );
  const x_max = paths.reduce(
    (acc, cur) => (acc > cur.x ? acc : cur.x),
    -Number.MAX_SAFE_INTEGER
  );
  const y_max = paths.reduce(
    (acc, cur) => (acc > cur.y ? acc : cur.y),
    -Number.MAX_SAFE_INTEGER
  );
  return {
    label: label_in,
    x_min,
    y_min,
    x_max,
    y_max,
  };
};

export const annotationObjectFactory = (shape: {
  label: string;
  paths: Coordinate[];
}) => ({
  label: shape.label,
  pose: 'Unspecified',
  truncated: 0,
  difficult: 0,
  bndbox: getShapeXYMaxMin(shape.paths),
});

// xml format
export const generateXML = (file: File, size: ImageSize, shapes: Shape[]) => {
  const annotation = annotationFactory(file);
  annotation.size = imageSizeFactory(size);
  annotation.object = shapes.map(shape => annotationObjectFactory(shape));
  const obj = annotation;
  let xmlStr = '';
  try {
    const builder = new XMLBuilder({ format: true });
    xmlStr = builder.build(obj);
  } catch (error) {
    console.error(error);
  }
  return xmlStr;
};

export const parseXml = async (xmlStr: string): Promise<Shape[]> => {
  const parser = new XMLParser();
  const xmlDoc = parser.parse(xmlStr);

  if (!xmlDoc.object) {
    return [];
  }

  const objects = Array.isArray(xmlDoc.object)
    ? xmlDoc.object
    : [xmlDoc.object];

  return objects.map((obj: any) => {
    const label = obj.label || '';
    const bndbox = obj.bndbox || {};
    const x_min = parseInt(bndbox.xmin) || 0;
    const y_min = parseInt(bndbox.ymin) || 0;
    const x_max = parseInt(bndbox.xmax) || 0;
    const y_max = parseInt(bndbox.ymax) || 0;

    return shapeFactoryTest(
      [
        { x: x_min, y: y_min },
        { x: x_max, y: y_min },
        { x: x_max, y: y_max },
        { x: x_min, y: y_max },
        { x: x_min, y: y_min },
      ],
      label
    );
  });
};

// coco RECTANGLE format
export const generateCoco = (file: File, size: ImageSize, shapes: Shape[]) => {
  const annotation = annotationFactory(file);
  annotation.object = shapes.map(shape => annotationObjectFactory(shape));
  const text = shapes.map(shape => annotationCocoTxt(shape.label, shape.paths));

  let txtContent = '';
  text.forEach(item => {
    const { label, x_min, y_min, width, height } = item;
    txtContent += `${label} ${x_min} ${y_min} ${width} ${height}\n`;
  });

  return txtContent;
};

export const parseCoco = async (text: string): Promise<Shape[]> => {
  const lines = text.trim().split('\n');
  const shapes: Shape[] = [];

  // Process each line
  for (const line of lines) {
    const parts = line.trim().split(/\s+/);
    if (parts.length === 5) {
      const label = parts[0];
      const [_, x_min, y_min, width, height] = parts.map(parseInt);

      shapes.push(
        shapeFactoryTest(
          [
            { x: x_min, y: y_min },
            { x: x_min + width, y: y_min },
            { x: x_min + width, y: y_min + height },
            { x: x_min, y: y_min + height },
            { x: x_min, y: y_min },
          ],
          label
        )
      );
    }
  }

  return shapes;
};

// yolo RECTANGLE format
export const generateYolo = (file: File, size: ImageSize, shapes: Shape[]) => {
  const annotation = annotationFactory(file);
  annotation.size = imageSizeFactory(size);
  annotation.object = shapes.map(shape => annotationObjectFactory(shape));

  const text = shapes.map(shape =>
    annotationYoloTxt(shape.label, shape.paths, annotation.size)
  );

  let txtContent = '';
  text.forEach(item => {
    const { label, x_center, y_center, width, height } = item;
    txtContent += `${label} ${x_center} ${y_center} ${width} ${height}\n`;
  });

  return txtContent;
};

export const parseYolo = async (
  text: string,
  imageSize: ImageSize
): Promise<Shape[]> => {
  const lines = text.trim().split('\n');
  const shapes: Shape[] = [];

  // Process each line
  for (const line of lines) {
    const parts = line.trim().split(/\s+/);
    if (parts.length === 5) {
      const label = parts[0];
      const [_, x_center, y_center, width, height] = parts.map(parseFloat);

      // Convert normalized coordinates to absolute coordinates
      const x_min = Math.round((x_center - width / 2) * imageSize.width);
      const y_min = Math.round((y_center - height / 2) * imageSize.height);
      const x_max = Math.round((x_center + width / 2) * imageSize.width);
      const y_max = Math.round((y_center + height / 2) * imageSize.height);

      shapes.push(
        shapeFactoryTest(
          [
            { x: x_min, y: y_min },
            { x: x_max, y: y_min },
            { x: x_max, y: y_max },
            { x: x_min, y: y_max },
            { x: x_min, y: y_min },
          ],
          label
        )
      );
    }
  }

  return shapes;
};

export const generatePascalVoc = (
  file: File,
  size: ImageSize,
  shapes: Shape[]
) => {
  const annotation = annotationFactory(file);
  annotation.object = shapes.map(shape => annotationObjectFactory(shape));
  const text = shapes.map(shape =>
    annotationPascalVocTxt(shape.label, shape.paths)
  );

  let txtContent = '';
  text.forEach(item => {
    const { label, x_min, y_min, x_max, y_max } = item;
    txtContent += `${label} ${x_min} ${y_min} ${x_max} ${y_max}\n`;
  });

  return txtContent;
};

export const parsePascalVoc = async (text: string): Promise<Shape[]> => {
  const lines = text.trim().split('\n');
  const shapes: Shape[] = [];

  // Process each line
  for (const line of lines) {
    const parts = line.trim().split(/\s+/);
    if (parts.length === 5) {
      const label = parts[0];
      const [_, x_min, y_min, x_max, y_max] = parts.map(parseInt);

      shapes.push(
        shapeFactoryTest(
          [
            { x: x_min, y: y_min },
            { x: x_max, y: y_min },
            { x: x_max, y: y_max },
            { x: x_min, y: y_max },
            { x: x_min, y: y_min },
          ],
          label
        )
      );
    }
  }

  return shapes;
};

export const exportXML = (xmlStr: string, fileName = 'label.xml') => {
  const fileType = '.xml';
  const blob = new Blob([xmlStr], { type: fileType });
  const a = document.createElement('a');
  a.download = fileName;
  a.href = window.URL.createObjectURL(blob);
  a.dataset.downloadurl = [fileType, a.download, a.href].join(':');
  a.click();
};

// figure zip file
export const exportZip = (
  files: File[],
  xmls: string[],
  type: string = 'YOLO'
) => {
  const zip = new JSZip();
  let folder: JSZip | null = null;

  if (type === 'COCO') {
    folder = zip.folder(COCO_FOLDER_NAME);
  }

  if (type === 'YOLO') {
    folder = zip.folder(YOLO_FOLDER_NAME);
  }

  if (type === 'PASCAL_VOC') {
    folder = zip.folder(PASCAL_VOC_FOLDER_NAME);
  }

  files.forEach((file: File, index: number) => {
    folder?.file(file.name, file);
    folder?.file(`${file.name.split('.')[0]}.txt`, xmls[index]);
  });

  zip.generateAsync({ type: 'blob' }).then(content => {
    saveAs(content, `${convertDateToString(new Date())}.zip`);
  });
};

export const detectAnnotationFormat = (fileContent: string) => {
  // Trim and split the file content into lines
  const lines = fileContent.trim().split('\n');

  // If no lines or empty file
  if (lines.length === 0) {
    return 'UNKNOWN';
  }

  // Take the first line as a sample
  const firstLine = lines[0].trim().split(/\s+/);

  // Check YOLO format
  const isYOLO = () => {
    if (firstLine.length !== 5) return false;

    // YOLO format: label x_center y_center width height (all normalized 0-1)
    const [_, x, y, w, h] = firstLine.map(parseFloat);

    return (
      x >= 0 && x <= 1 && y >= 0 && y <= 1 && w > 0 && w <= 1 && h > 0 && h <= 1
    );
  };

  // Check Pascal VOC format
  const isPascalVOC = () => {
    // Pascal VOC format: label, xmin, ymin, xmax, ymax
    if (firstLine.length !== 5) return false;

    const [_, xmin, ymin, xmax, ymax] = firstLine.map(parseInt);

    return xmin >= 0 && ymin >= 0 && xmin < xmax && ymin < ymax;
  };

  // Check COCO format
  const isCOCO = () => {
    // COCO format typically: label, x, y, width, height
    if (firstLine.length !== 5) return false;

    const [_, x, y, width, height] = firstLine.map(parseInt);

    return x >= 0 && y >= 0 && width > 0 && height > 0;
  };

  if (isYOLO()) {
    return 'YOLO';
  }

  if (isPascalVOC()) {
    return 'PASCAL_VOC';
  }

  if (isCOCO()) {
    return 'COCO';
  }

  return 'UNKNOWN';
};
