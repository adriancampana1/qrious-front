import type React from 'react';
import { Card, Typography, Button } from 'antd';
import { Users, HelpCircle, ArrowRight } from 'lucide-react';

const { Text } = Typography;

interface SessionCardProps {
  title: string;
  participants: number;
  questions: number;
}

const SessionCard: React.FC<SessionCardProps> = ({
  title,
  participants,
  questions
}) => {
  return (
    <Card
      hoverable
      className="h-full border-0 overflow-hidden transition-all duration-300 hover:shadow bg-white shadow-sm p-4"
    >
      <div className="flex flex-col h-full">
        <h3 className="text-base font-medium mb-3 text-gray-800 line-clamp-2">
          {title}
        </h3>

        <div className="flex items-center gap-6 mb-4">
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-2 text-gray-500" />
            <Text className="text-xs text-gray-600">{participants}</Text>
          </div>
          <div className="flex items-center">
            <HelpCircle className="w-4 h-4 mr-2 text-gray-500" />
            <Text className="text-xs text-gray-600">{questions}</Text>
          </div>
        </div>

        <div className="flex justify-end mt-auto pt-2">
          <Button
            type="text"
            size="small"
            className="text-xs px-3 py-1 flex items-center text-gray-600 hover:text-gray-900"
          >
            Ver detalhes
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default SessionCard;
