import { createContext, useContext, type ReactNode } from 'react';
import { message } from 'antd';
import type { MessageInstance } from 'antd/es/message/interface';

const MessageContext = createContext<MessageInstance | null>(null);

export const MessageProvider = ({ children }: { children: ReactNode }) => {
  const [api, contextHolder] = message.useMessage();

  return (
    <MessageContext.Provider value={api}>
      {contextHolder}
      {children}
    </MessageContext.Provider>
  );
};

export function useGlobalMessage() {
  const ctx = useContext(MessageContext);
  if (!ctx) {
    throw new Error('useGlobalMessage must be used within MessageProvider');
  }
  return ctx;
}
