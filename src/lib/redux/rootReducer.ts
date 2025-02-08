/* Core */
import { combineReducers } from '@reduxjs/toolkit';

/* Instruments */
import {
  counterReducer,
  appReducer,
  userReducer,
  eventReducer,
} from './slices';

export const rootReducer = combineReducers({
  counter: counterReducer,
  app: appReducer,
  user: userReducer,
  event: eventReducer,
});
