import { useDispatch, useSelector, useStore } from 'react-redux';
import type { ReduxState, ReduxDispatch, ReduxStore } from './store';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = useDispatch.withTypes<ReduxDispatch>();
export const useAppSelector = useSelector.withTypes<ReduxState>();
export const useAppStore = useStore.withTypes<ReduxStore>();
