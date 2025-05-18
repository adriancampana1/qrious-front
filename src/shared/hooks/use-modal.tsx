import { useCallback, useState } from 'react';

export const useModal = () => {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  const open = useCallback(() => setIsVisible(true), []);
  const close = useCallback(() => setIsVisible(false), []);
  const toggle = useCallback(() => setIsVisible((prev) => !prev), []);

  return { isVisible, open, close, toggle };
};
