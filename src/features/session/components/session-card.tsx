import type React from 'react';
import { Card, Typography, Button } from 'antd';
import { Users, HelpCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router';

const { Text } = Typography;

interface SessionCardProps {
  id: number;
  title: string;
  participants: number;
  questions: number;
  onClick?: () => void;
}

const SessionCard: React.FC<SessionCardProps> = ({
  id,
  title,
  participants,
  questions,
  onClick
}) => {
  const navigate = useNavigate();

  return (
    <Card
      className="h-full border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 bg-white cursor-pointer"
      onClick={() => navigate(`/sessoes/sessao/${id}`)}
    >
      <div className="flex flex-col h-full">
        <h3 className="text-base font-medium mb-4 text-gray-800 line-clamp-2">
          {title}
        </h3>

        <div className="flex items-center gap-6 mb-4">
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-2 text-gray-500" />
            <Text className="text-xs text-gray-600">
              {participants} participantes
            </Text>
          </div>
          <div className="flex items-center">
            <HelpCircle className="w-4 h-4 mr-2 text-gray-500" />
            <Text className="text-xs text-gray-600">{questions} questões</Text>
          </div>
        </div>

        <div className="flex justify-end mt-auto pt-3">
          <Button
            type="text"
            size="small"
            className="text-xs px-3 py-1 flex items-center text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            onClick={onClick}
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
