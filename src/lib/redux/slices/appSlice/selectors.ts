/* Instruments */
import type { ReduxState } from '@/lib/redux';

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file.
export const selectLanguage = (state: ReduxState) => state.app.lang;

export const selectError = (state: ReduxState) => state.app.error;
