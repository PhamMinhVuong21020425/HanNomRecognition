import { createIntl, createIntlCache } from 'react-intl';

import Vietnamese from '../app/translations/vi.json';
import English from '../app/translations/en.json';

type Messages = {
  [key: string]: Record<string, string>;
};

const cache = createIntlCache();

export function getIntl(locale: string = 'vi') {
  const messages: Messages = {
    vi: Vietnamese,
    en: English,
  };

  return createIntl(
    {
      locale: locale,
      messages: messages[locale],
    },
    cache
  );
}
