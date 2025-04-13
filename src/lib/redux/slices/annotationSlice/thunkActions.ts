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

export const saveAnnotationData = createAppAsyncThunk(
  'annotation/saveData',
  async (_, { getState }) => {
    const state = getState() as ReduxState;
    const { imageFiles, shapes } = state.annotation;
    const dataset = state.dataset.selDataset;
    if (!dataset) {
      throw new Error('No dataset selected');
    }

    const files: File[] = [];
    const labels: (string | undefined)[] = [];
    const isLabels: boolean[] = [];
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
      isLabels.push(isLabel);
      labels.push(label);
      files.push(file);
    }

    const formData = new FormData();
    formData.append('datasetId', dataset.id);
    formData.append('imageFiles', JSON.stringify(imageFiles));
    formData.append('labels', JSON.stringify(labels));
    formData.append('isLabels', JSON.stringify(isLabels));
    files.forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await axios.post('/be/annotations/save', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Failed to save annotation data:', error);
      throw error;
    }
  }
);
