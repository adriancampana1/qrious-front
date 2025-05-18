import type React from 'react';
import { Card, Typography, Button, Tooltip } from 'antd';
import { HelpCircle, Clock, Edit, Eye, Calendar, User } from 'lucide-react';
import dayjs from 'dayjs';

const { Text } = Typography;

export interface Questionnaire {
  id: number;
  title: string;
  theme: string;
  description: string;
  numQuestions: number;
  showAnswersAfterSubmission: boolean;
  timeLimitMinutes: number | null;
  createdAt: Date;
  createdById: number;
  createdBy: {
    id: number;
    name: string;
    email: string;
  };
  items: {
    questionnaireId: number;
    bankQuestionId: number;
    bankQuestion: BankQuestion[];
    position: number;
  }[];
  status?: 'active' | 'ended' | 'draft';
  completionRate?: number;
}

interface BankQuestion {
  id: number;
  content: string;
}

interface QuestionnaireCardProps {
  questionnaire: Questionnaire;
  onView?: (id: number) => void;
  onEdit?: (id: number) => void;
}

const QuestionnaireCard: React.FC<QuestionnaireCardProps> = ({
  questionnaire,
  onView,
  onEdit
}) => {
  const {
    id,
    title,
    theme,
    description,
    numQuestions,
    timeLimitMinutes,
    createdAt,
    createdBy,
    items
  } = questionnaire;

  const questionCount = numQuestions || items?.length || 0;

  const formattedTimeLimit = timeLimitMinutes
    ? timeLimitMinutes === 60
      ? '1 hora'
      : timeLimitMinutes < 60
      ? `${timeLimitMinutes} minutos`
      : `${Math.floor(timeLimitMinutes / 60)} hora${
          Math.floor(timeLimitMinutes / 60) > 1 ? 's' : ''
        } e ${timeLimitMinutes % 60} minuto${
          timeLimitMinutes % 60 !== 1 ? 's' : ''
        }`
    : null;

  const formattedCreatedAt = dayjs(createdAt).format('DD/MM/YYYY');

  const handleView = () => {
    if (onView) onView(id);
  };

  const handleEdit = () => {
    if (onEdit) onEdit(id);
  };

  return (
    <Card
      hoverable
      className="h-full border-0 overflow-hidden transition-all duration-300 hover:shadow bg-white shadow-sm p-4"
    >
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-start mb-3">
          <Tooltip title={`Criado ${formattedCreatedAt}`}>
            <div className="flex items-center text-xs text-gray-500">
              <Calendar className="w-3.5 h-3.5 mr-1" />
              {formattedCreatedAt}
            </div>
          </Tooltip>
        </div>

        <h3 className="text-base font-medium mb-2 text-gray-800 line-clamp-2">
          {title}
        </h3>

        <div className="flex flex-col mb-3">
          <Text type="secondary" className="text-xs mb-1 text-gray-500">
            {theme}
          </Text>

          {description && (
            <Text className="text-xs text-gray-600 line-clamp-2 mb-2">
              {description}
            </Text>
          )}
        </div>

        <div className="flex items-center gap-6 mb-3">
          <div className="flex items-center">
            <HelpCircle className="w-4 h-4 mr-2 text-gray-500" />
            <Text className="text-xs text-gray-600">
              {questionCount} questões
            </Text>
          </div>

          {formattedTimeLimit && (
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2 text-gray-500" />
              <Text className="text-xs text-gray-600">
                Limite: {formattedTimeLimit}
              </Text>
            </div>
          )}
        </div>

        {createdBy && (
          <div className="flex items-center mb-3">
            <User className="w-4 h-4 mr-2 text-gray-500" />
            <Text className="text-xs text-gray-600">
              Criado por: {createdBy.name}
            </Text>
          </div>
        )}

        <div className="flex justify-end gap-2 mt-auto pt-2">
          <Button
            type="text"
            size="small"
            className="text-xs px-3 py-1 flex items-center text-gray-600 hover:text-gray-900"
            icon={<Eye className="w-3.5 h-3.5 mr-1.5" />}
            onClick={handleView}
          >
            Ver
          </Button>
          <Button
            type="text"
            size="small"
            className="text-xs px-3 py-1 flex items-center text-gray-600 hover:text-gray-900"
            icon={<Edit className="w-3.5 h-3.5 mr-1.5" />}
            onClick={handleEdit}
          >
            Editar
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default QuestionnaireCard;
