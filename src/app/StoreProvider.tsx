'use client';

/* Core */
import { useRef } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import IntlProviderWrapper from './translations/IntlProviderWrapper';

/* Instruments */
import { ReduxStore, reduxStore } from '@/lib/redux/store';
import { persistor } from '@/lib/redux/store';
// import { initializeState } from '@/lib/redux/slices';

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const storeRef = useRef<ReduxStore>();
  if (!storeRef.current) {
    // Create the store instance the first time this renders
    storeRef.current = reduxStore;

    // Loading initial data if needed
    // storeRef.current.dispatch(initializeState());
  }
  return (
    <Provider store={storeRef.current}>
      <PersistGate loading={null} persistor={persistor}>
        <IntlProviderWrapper>{children}</IntlProviderWrapper>
      </PersistGate>
    </Provider>
  );
}
