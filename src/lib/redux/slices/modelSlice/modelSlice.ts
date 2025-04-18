/* Core */
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

/* Instruments */
import { Model } from '@/entities/model.entity';
import { getAllModelsAsync, getModelsOfUserAsync } from './thunkActions';

/* Types */
export interface ModelState {
  allModels: Model[];
  userModels: Model[];
  selDetectModel: Model | null;
  selClassifyModel: Model | null;
  status: 'idle' | 'loading' | 'failed';
}

const initialState: ModelState = {
  allModels: [],
  userModels: [],
  selDetectModel: null,
  selClassifyModel: null,
  status: 'idle',
} satisfies ModelState as ModelState;

export const modelSlice = createSlice({
  name: 'model',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    setSelDetectModel: (state, action: PayloadAction<Model | null>) => {
      state.selDetectModel = action.payload;
    },
    setSelClassifyModel: (state, action: PayloadAction<Model | null>) => {
      state.selClassifyModel = action.payload;
    },
  },
  // The `extraReducers` field lets the slice handle actions defined elsewhere,
  // including actions generated by createAsyncThunk or in other slices.
  extraReducers: builder => {
    builder
      // getAllDatasetsAsync
      .addCase(getAllModelsAsync.pending, state => {
        state.status = 'loading';
      })
      .addCase(getAllModelsAsync.rejected, state => {
        state.status = 'failed';
      })
      .addCase(
        getAllModelsAsync.fulfilled,
        (state, action: PayloadAction<Model[]>) => {
          state.status = 'idle';
          state.allModels = action.payload;
        }
      )

      // getDatasetsOfUserAsync
      .addCase(getModelsOfUserAsync.pending, state => {
        state.status = 'loading';
      })
      .addCase(getModelsOfUserAsync.rejected, state => {
        state.status = 'failed';
      })
      .addCase(
        getModelsOfUserAsync.fulfilled,
        (state, action: PayloadAction<Model[]>) => {
          state.status = 'idle';
          state.userModels = action.payload;
        }
      );
  },
});

export const { setSelDetectModel, setSelClassifyModel } = modelSlice.actions;

export const modelReducer = modelSlice.reducer;
