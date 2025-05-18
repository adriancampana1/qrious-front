import { createContext, useContext, useState, type ReactNode } from 'react';

interface LayoutContextType {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

export const LayoutContext = createContext<LayoutContextType>({
  isLoading: false,
  setLoading: () => {}
});

export const LayoutProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setLoading] = useState(false);

  return (
    <LayoutContext.Provider value={{ isLoading, setLoading }}>
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayoutLoading = () => useContext(LayoutContext);
