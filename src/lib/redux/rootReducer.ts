/* Core */
import { combineReducers } from '@reduxjs/toolkit';

/* Instruments */
import { counterReducer, appReducer, userReducer } from './slices';

export const rootReducer = combineReducers({
  counter: counterReducer,
  app: appReducer,
  user: userReducer,
});
