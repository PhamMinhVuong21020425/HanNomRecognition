import axios from '@/lib/axios';
import { createAppAsyncThunk } from '@/lib/redux/createAppAsyncThunk';
import type { ReduxState } from '@/lib/redux';
import {
  fetchFileFromObjectUrl,
  generateCoco,
  getImageSizeFromUrl,
  imageSizeFactory,
} from '@/utils/general';
import { ProblemType } from '@/enums/ProblemType';
import { encodeUTF8 } from '@/utils/utf8';
import { ImageType } from '@/types/ImageType';
import { MAX_CHUNK_SIZE } from '@/constants';

type ChunkType = {
  files: File[];
  images: ImageType[];
  labels: (string | undefined)[];
  isLabels: boolean[];
};

export const saveAnnotationData = createAppAsyncThunk(
  'annotation/saveData',
  async (actionType: string, { getState }) => {
    const state = getState() as ReduxState;
    const { imageFiles, shapes } = state.annotation;
    const dataset = state.dataset.selDataset;
    if (!dataset) {
      throw new Error('No dataset selected');
    }

    const chunks: ChunkType[] = [];
    let currentChunkSize = 0;

    let chunkFiles: File[] = [];
    let chunkImages: ImageType[] = [];
    let chunkLabels: (string | undefined)[] = [];
    let chunkIsLabels: boolean[] = [];
    for (let idx = 0; idx < imageFiles.length; idx++) {
      const img = imageFiles[idx];
      const file = await fetchFileFromObjectUrl(
        img.obj_url,
        encodeUTF8(img.name)
      );
      const size = await getImageSizeFromUrl(img.obj_url);
      const label =
        dataset.type === ProblemType.DETECT
          ? generateCoco(file, imageSizeFactory(size), shapes[idx])
          : img.label;
      let isLabel = img.label !== undefined;
      if (dataset.type === ProblemType.DETECT) {
        isLabel = shapes[idx].length > 0;
      }
      const fileSize = file.size;
      const labelSize = label ? JSON.stringify(label).length : 0;
      const estimateSize = fileSize + labelSize + 200; // 200 bytes for overhead

      if (
        currentChunkSize + estimateSize > MAX_CHUNK_SIZE &&
        currentChunkSize > 0
      ) {
        // Start a new chunk
        chunks.push({
          files: chunkFiles,
          images: chunkImages,
          labels: chunkLabels,
          isLabels: chunkIsLabels,
        });
        currentChunkSize = 0;
        chunkFiles = [];
        chunkImages = [];
        chunkLabels = [];
        chunkIsLabels = [];
      }

      chunkFiles.push(file);
      chunkImages.push(img);
      chunkLabels.push(label);
      chunkIsLabels.push(isLabel);
      currentChunkSize += estimateSize;

      // If it's the last image, push the remaining chunk
      if (idx === imageFiles.length - 1) {
        chunks.push({
          files: chunkFiles,
          images: chunkImages,
          labels: chunkLabels,
          isLabels: chunkIsLabels,
        });
      }
    }

    const totalChunks = chunks.length;
    const results = [];
    console.log('---> chunks', chunks);

    const sendRequestToServer = async (
      allImages: ImageType[],
      images: ImageType[],
      files: File[],
      labels: (string | undefined)[],
      isLabels: boolean[]
    ) => {
      const formData = new FormData();
      formData.append('datasetId', dataset.id);
      formData.append('allImages', JSON.stringify(allImages));
      formData.append('images', JSON.stringify(images));
      formData.append('labels', JSON.stringify(labels));
      formData.append('isLabels', JSON.stringify(isLabels));

      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await axios.post('/be/annotations/save', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    };

    // Process each chunk
    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const { files, images, labels, isLabels } = chunks[chunkIndex];
      try {
        const result = await sendRequestToServer(
          imageFiles,
          images,
          files,
          labels,
          isLabels
        );
        results.push(result);
      } catch (error) {
        console.error(
          `Error sending chunk ${chunkIndex + 1} of ${totalChunks}:`,
          error
        );
      }
    }

    if (totalChunks === 0) {
      const result = await sendRequestToServer(imageFiles, [], [], [], []);
      results.push(result);
    }

    return {
      success: true,
      results,
    };
  }
);
