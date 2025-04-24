/* Core */
import { debounce } from 'lodash';
import { createLogger } from 'redux-logger';
import { Middleware } from '@reduxjs/toolkit';

/* Instruments */
import { ReduxDispatch } from './store';
import { saveAnnotationData } from './slices/annotationSlice/thunkActions';

export const loggerMiddleware = [
  createLogger({
    duration: true,
    timestamp: false,
    collapsed: true,
    colors: {
      title: () => '#139BFE',
      prevState: () => '#1C5FAF',
      action: () => '#149945',
      nextState: () => '#A47104',
      error: () => '#ff0005',
    },
    predicate: () => typeof window !== 'undefined',
  }),
];

const ACTIONS_TO_WATCH = [
  'annotation/setImageFiles',
  'annotation/setLabelImageFile',
  'annotation/setShapes',
  'annotation/deleteSelShape',
  'annotation/deleteAllShapes',
];

const debouncedSave = debounce(
  (dispatch: ReduxDispatch, actionType: string) => {
    dispatch(saveAnnotationData(actionType));
  },
  2000
);

export const saveAnnotationMiddleware: Middleware =
  ({ dispatch }) =>
  next =>
  (action: any) => {
    const result = next(action);

    if (ACTIONS_TO_WATCH.includes(action.type)) {
      debouncedSave(dispatch, action.type);
    }

    return result;
  };
