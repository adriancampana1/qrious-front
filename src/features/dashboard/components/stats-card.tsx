import type React from 'react';
import { Card, Statistic, type StatisticProps } from 'antd';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  valueStyle?: StatisticProps['valueStyle'];
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  trend,
  valueStyle
}) => {
  return (
    <Card
      className="h-full overflow-hidden border-0 shadow-sm hover:shadow transition-all duration-300 bg-white"
      bordered={false}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-600">{title}</span>
        <div className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-50">
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

      {trend && (
        <div className="flex items-center mt-2 text-xs font-medium">
          {trend.isPositive ? (
            <TrendingUp className="w-3.5 h-3.5 mr-1.5 text-emerald-500" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5 mr-1.5 text-rose-500" />
          )}
          <span
            className={trend.isPositive ? 'text-emerald-500' : 'text-rose-500'}
          >
            {trend.value}
          </span>
        </div>
      )}
    </Card>
  );
};

export default StatsCard;
