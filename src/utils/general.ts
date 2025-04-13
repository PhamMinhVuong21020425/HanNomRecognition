import axios from '../lib/axios';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { XMLBuilder, XMLParser } from 'fast-xml-parser';

import {
  COCO_FOLDER_NAME,
  YOLO_FOLDER_NAME,
  PASCAL_VOC_FOLDER_NAME,
  DEFAULT_SAVE_FOLDER,
} from '../constants';

import type { Coordinate, Shape, ImageSize } from '../lib/redux';
import type {
  CocoAnnotation,
  CocoCategory,
  CocoImage,
  CocoDataset,
} from '../types/CocoTypes';

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

export const getImageSizeFromUrl = (imageUrl: string): Promise<ImageSize> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.src = imageUrl;
    img.onload = () =>
      resolve({ width: img.width, height: img.height, depth: 3 });
    img.onerror = err => reject(err);
  });

export const normalizeFileName = (fileName: string) => {
  return fileName
    .toLowerCase()
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/[^a-z0-9-_\.]/g, '') // Remove non-alphanumeric characters
    .replace(/\.+$/, ''); // Remove trailing dots
};

// fetch file from server
export const getObjectUrlFromPath = async (filePath: string) => {
  const response = await axios.post(
    '/be/files/view',
    {
      filePath,
    },
    {
      responseType: 'blob',
    }
  );
  const objectUrl = URL.createObjectURL(response.data);
  return objectUrl;
};

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

export const formatDateToString = (date: Date) => {
  if (!(date instanceof Date)) {
    date = new Date(date);
  }

  const pad = (num: number) => String(num).padStart(2, '0');

  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1); // 0-11
  const year = date.getFullYear();
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
};

export function getShapeXYMaxMin(paths: Coordinate[]) {
  return {
    array: [],
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

export const annotationCocoJson = (label_in: string, paths: Coordinate[]) => {
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
  size: ImageSize
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

export const parseXml = (xmlStr: string): Shape[] => {
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
// Helper function to get category ID from label name
const getCategoryId = (label: string, categories: CocoCategory[]): number => {
  const category = categories.find(cat => cat.name === label);
  if (category) return category.id;
  return -1;
};

// Convert shape to COCO annotation format
const annotationToCoco = (
  shape: Shape,
  annotationId: number,
  imageId: number,
  categories: CocoCategory[]
): CocoAnnotation => {
  // Calculate bounding box from paths
  const { x_min, y_min, width, height } = annotationCocoJson(
    shape.label,
    shape.paths
  );

  // Calculate area
  const area = width * height;

  // Get category ID
  const categoryId = getCategoryId(shape.label, categories);

  // Prepare segmentation - convert paths to a flat array
  const segmentation = [shape.paths.flatMap(p => [p.x, p.y])];

  return {
    id: annotationId,
    image_id: imageId,
    category_id: categoryId,
    bbox: [x_min, y_min, width, height],
    area: area,
    segmentation: segmentation,
    iscrowd: 0,
  };
};

// Convert to COCO JSON format
const convertToCoco = (
  file: File,
  size: ImageSize,
  shapes: Shape[]
): CocoDataset => {
  // Create unique categories from shape labels
  const uniqueLabels = [...new Set(shapes.map(shape => shape.label))];
  const categories: CocoCategory[] = uniqueLabels.map((label, index) => ({
    id: index + 1,
    name: label,
    supercategory: 'character',
  }));

  // Create image info
  const image: CocoImage = {
    id: 1, // Assuming single image
    width: size.width,
    height: size.height,
    file_name: file.name,
  };

  // Create annotations
  const annotations: CocoAnnotation[] = shapes.map((shape, index) =>
    annotationToCoco(shape, index + 1, image.id, categories)
  );

  // Construct the final COCO dataset
  return {
    info: {
      year: new Date().getFullYear(),
      version: '1.0',
      description: 'COCO Format Dataset',
      contributor: '',
      url: '',
      date_created: new Date(),
    },
    licenses: [],
    images: [image],
    annotations: annotations,
    categories: categories,
  };
};

// Export COCO JSON as a string
export const generateCoco = (
  file: File,
  size: ImageSize,
  shapes: Shape[]
): string => {
  const cocoData = convertToCoco(file, size, shapes);
  return JSON.stringify(cocoData, null, 2);
};

export const parseCoco = (jsonString: string): Shape[] => {
  try {
    const cocoData: CocoDataset = JSON.parse(jsonString);
    const shapes: Shape[] = [];

    for (const annotation of cocoData.annotations) {
      // Find category name from category ID
      const category = cocoData.categories.find(
        cat => cat.id === annotation.category_id
      );
      if (!category) continue;

      const [x_min, y_min, width, height] = annotation.bbox;

      // Create shape with rectangle corners
      shapes.push(
        shapeFactoryTest(
          [
            { x: x_min, y: y_min },
            { x: x_min + width, y: y_min },
            { x: x_min + width, y: y_min + height },
            { x: x_min, y: y_min + height },
            { x: x_min, y: y_min },
          ],
          category.name
        )
      );
    }

    return shapes;
  } catch (error) {
    console.error('Error parsing COCO JSON:', error);
    return [];
  }
};

export const generateYoloTrain = (
  file: File,
  size: ImageSize,
  shapes: Shape[]
) => {
  const text = shapes.map(shape =>
    annotationYoloTxt(shape.label, shape.paths, imageSizeFactory(size))
  );

  let txtContent = '';
  text.forEach(item => {
    const { label, x_center, y_center, width, height } = item;
    txtContent += `0 ${x_center.toFixed(8)} ${y_center.toFixed(8)} ${width.toFixed(8)} ${height.toFixed(8)}\n`;
  });

  return txtContent;
};

// yolo RECTANGLE format
export const generateYolo = (file: File, size: ImageSize, shapes: Shape[]) => {
  const text = shapes.map(shape =>
    annotationYoloTxt(shape.label, shape.paths, imageSizeFactory(size))
  );

  let txtContent = '';
  text.forEach(item => {
    const { label, x_center, y_center, width, height } = item;
    txtContent += `${label} ${x_center.toFixed(8)} ${y_center.toFixed(8)} ${width.toFixed(8)} ${height.toFixed(8)}\n`;
  });

  return txtContent;
};

export const parseYolo = (text: string, imageSize: ImageSize): Shape[] => {
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
  annotation.size = imageSizeFactory(size);
  annotation.object = shapes.map(shape => annotationObjectFactory(shape));

  let xmlStr = '';
  try {
    const builder = new XMLBuilder({ format: true });
    xmlStr = builder.build(annotation);
  } catch (error) {
    console.error(error);
  }
  return xmlStr;
};

export const parsePascalVoc = (xmlStr: string): Shape[] => {
  const parser = new XMLParser();
  const xmlDoc = parser.parse(xmlStr);

  if (!xmlDoc.object) {
    return [];
  }

  const objects = Array.isArray(xmlDoc.object)
    ? xmlDoc.object
    : [xmlDoc.object];

  return objects.map((obj: any) => {
    const label = obj.label || 0;
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
  content: string[],
  type: 'COCO' | 'YOLO' | 'PASCAL_VOC'
) => {
  let folderName = '';
  switch (type) {
    case 'COCO':
      folderName = COCO_FOLDER_NAME;
      break;
    case 'YOLO':
      folderName = YOLO_FOLDER_NAME;
      break;
    case 'PASCAL_VOC':
      folderName = PASCAL_VOC_FOLDER_NAME;
      break;
  }

  // Create the root directory
  const zip = new JSZip();
  const rootFolder = zip.folder(folderName);

  if (!rootFolder) {
    console.error('Failed to create root folder');
    return;
  }

  // Create format folder structure
  if (type === 'COCO') {
    // COCO structure: root/images/, root/annotations/
    const imagesFolder = rootFolder.folder('images');
    const annotationsFolder = rootFolder.folder('annotations');

    // Create a single annotations file containing all annotations
    const cocoDataset: CocoDataset = {
      info: {
        year: new Date().getFullYear(),
        version: '1.0',
        description: 'COCO Format Dataset',
        contributor: '',
        url: '',
        date_created: new Date(),
      },
      licenses: [],
      images: [],
      annotations: [],
      categories: [],
    };

    // Process each image and its annotation
    files.forEach((file: File, index: number) => {
      imagesFolder?.file(file.name, file);
      annotationsFolder?.file(
        `${file.name.split('.')[0]}.json`,
        content[index]
      );

      try {
        // Parse the annotation content and add to the combined dataset
        const annotation: CocoDataset = JSON.parse(content[index]);
        cocoDataset.images.push(...annotation.images);
        cocoDataset.annotations.push(...annotation.annotations);

        // Merge unique categories
        annotation.categories.forEach(category => {
          if (!cocoDataset.categories.some(c => c.id === category.id)) {
            cocoDataset.categories.push(category);
          }
        });
      } catch (error) {
        console.error(`Error parsing COCO annotation for ${file.name}:`, error);
      }
    });

    // Save the combined annotations file
    annotationsFolder?.file(
      `labels.json`,
      JSON.stringify(cocoDataset, null, 2)
    );
  } else if (type === 'YOLO') {
    // YOLO structure: root/images/, root/labels/
    const imagesFolder = rootFolder.folder('images');
    const labelsFolder = rootFolder.folder('labels');

    // Process each image and its annotation
    files.forEach((file: File, index: number) => {
      imagesFolder?.file(file.name, file);
      labelsFolder?.file(`${file.name.split('.')[0]}.txt`, content[index]);
    });
  } else if (type === 'PASCAL_VOC') {
    // PASCAL VOC structure: root/JPEGImages/, root/Annotations/
    const imagesFolder = rootFolder.folder('JPEGImages');
    const annotationsFolder = rootFolder.folder('Annotations');

    // Process each image and its annotation
    files.forEach((file: File, index: number) => {
      imagesFolder?.file(file.name, file);
      annotationsFolder?.file(`${file.name.split('.')[0]}.xml`, content[index]);
    });
  }

  // Generate the zip file and download it
  zip.generateAsync({ type: 'blob' }).then(content => {
    saveAs(content, `${folderName}.zip`);
  });
};
