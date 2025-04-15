/* Core */
import { combineReducers } from '@reduxjs/toolkit';

/* Instruments */
import {
  counterReducer,
  appReducer,
  userReducer,
  eventReducer,
  annotationReducer,
  filesReducer,
  datasetReducer,
  modelReducer,
} from './slices';

export const rootReducer = combineReducers({
  counter: counterReducer,
  app: appReducer,
  user: userReducer,
  event: eventReducer,
  annotation: annotationReducer,
  files: filesReducer,
  dataset: datasetReducer,
  model: modelReducer,
});
