import { Spin } from 'antd';

export default function LoadingFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <Spin size="large" />
    </div>
  );
}
