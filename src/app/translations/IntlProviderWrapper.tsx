import { ReactNode } from 'react';
import { IntlProvider } from 'react-intl';
import Vietnamese from './vi.json';
import English from './en.json';

import { useAppSelector, selectLanguage } from '@/lib/redux';

function IntlProviderWrapper({ children }: { children: ReactNode }) {
  let locale = useAppSelector(selectLanguage);
  let language = English;
  if (locale === 'vi') language = Vietnamese;

  return (
    <IntlProvider locale={locale} messages={language}>
      {children}
    </IntlProvider>
  );
}

export default IntlProviderWrapper;
