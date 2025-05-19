import type React from 'react';
import { Card, Statistic, type StatisticProps } from 'antd';

interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  valueStyle?: StatisticProps['valueStyle'];
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  valueStyle
}) => {
  return (
    <Card className="h-full border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 bg-white">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-600">{title}</span>
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-50">
          {icon}
        </div>
      </div>

      <Statistic
        value={value}
        valueStyle={{
          fontSize: '28px',
          fontWeight: 600,
          ...valueStyle
        }}
      />
    </Card>
  );
};

export default StatsCard;
