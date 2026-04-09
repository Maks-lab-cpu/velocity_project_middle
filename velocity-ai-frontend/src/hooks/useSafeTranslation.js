import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';

export const useSafeTranslation = () => {
  const { t, i18n, ready } = useTranslation();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (ready) {
      setIsReady(true);
    }
  }, [ready]);

  return {
    t: isReady ? t : (key) => key, // Возвращаем ключ как текст, пока не готово
    i18n,
    ready: isReady
  };
};