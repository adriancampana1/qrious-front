import { Card, Typography, Button, Tooltip, Tag, Progress } from 'antd';
import {
  HelpCircle,
  Clock,
  Calendar,
  User,
  Play,
  BarChart3,
  CheckCircle,
  AlertCircle,
  Eye,
  Edit
} from 'lucide-react';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { questionnaireAttemptService } from '../services/questionnaire-attempt.service';
import type { Questionnaire } from '../interfaces/questionnaire';
import type { QuestionnaireAttempt } from '../interfaces/questionnaire-attempt';
import { useNavigate } from 'react-router';

const { Text } = Typography;

interface EnhancedQuestionnaireCardProps {
  questionnaire: Questionnaire;
  userRole?: 'student' | 'teacher' | 'admin';
  onEdit?: (id: number) => void;
}

type QuestionnaireStatus =
  | 'not_started'
  | 'in_progress'
  | 'completed'
  | 'expired';

const EnhancedQuestionnaireCard = ({
  questionnaire,
  userRole = 'student',
  onEdit
}: EnhancedQuestionnaireCardProps) => {
  const navigate = useNavigate();
  const [userAttempts, setUserAttempts] = useState<QuestionnaireAttempt[]>([]);
  const [status, setStatus] = useState<QuestionnaireStatus>('not_started');
  const [isLoading, setIsLoading] = useState(true);

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

  useEffect(() => {
    const loadUserAttempts = async () => {
      if (userRole === 'student') {
        try {
          const attempts = await questionnaireAttemptService.getAttemptsByUser(
            id
          );
          setUserAttempts(attempts);

          const latestAttempt = attempts[attempts.length - 1];
          if (!latestAttempt) {
            setStatus('not_started');
          } else if (latestAttempt.status === 'in_progress') {
            setStatus('in_progress');
          } else if (latestAttempt.status === 'completed') {
            setStatus('completed');
          } else if (latestAttempt.status === 'expired') {
            setStatus('expired');
          }
        } catch (error) {
          console.error('Erro ao carregar tentativas do usuário:', error);
          setStatus('not_started');
        }
      }
      setIsLoading(false);
    };

    loadUserAttempts();
  }, [id, userRole]);

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

  const getStatusConfig = () => {
    switch (status) {
      case 'not_started':
        return {
          color: 'blue',
          icon: <Play className="w-3.5 h-3.5" />,
          text: 'Não iniciado',
          action: 'Iniciar'
        };
      case 'in_progress':
        return {
          color: 'orange',
          icon: <AlertCircle className="w-3.5 h-3.5" />,
          text: 'Em andamento',
          action: 'Continuar'
        };
      case 'completed':
        return {
          color: 'green',
          icon: <CheckCircle className="w-3.5 h-3.5" />,
          text: 'Concluído',
          action: 'Ver Resultado'
        };
      case 'expired':
        return {
          color: 'red',
          icon: <Clock className="w-3.5 h-3.5" />,
          text: 'Expirado',
          action: 'Ver Resultado'
        };
      default:
        return {
          color: 'gray',
          icon: <HelpCircle className="w-3.5 h-3.5" />,
          text: 'Desconhecido',
          action: 'Visualizar'
        };
    }
  };

  const handlePrimaryAction = () => {
    if (userRole === 'teacher' || userRole === 'admin') {
      navigate(`/questionarios/${id}/tentativa/resultado`);
      return;
    }

    switch (status) {
      case 'not_started':
      case 'in_progress':
        navigate(`/questionarios/${id}/tentativa`);
        break;
      case 'completed':
      case 'expired':
        navigate(`/questionarios/${id}/tentativa/resultado`);
        break;
    }
  };

  const handleSecondaryAction = () => {
    if (userRole === 'teacher' || userRole === 'admin') {
      if (onEdit) {
        onEdit(id);
      }
    } else {
      navigate(`/questionarios/${id}`);
    }
  };

  const getLatestAttemptInfo = () => {
    if (userAttempts.length === 0) return null;

    const latest = userAttempts[userAttempts.length - 1];
    if (latest.status === 'completed' && latest.score !== undefined) {
      const percentage =
        latest.totalQuestions > 0
          ? Math.round((latest.score / latest.totalQuestions) * 100)
          : 0;

      return {
        score: latest.score,
        total: latest.totalQuestions,
        percentage
      };
    }

    return null;
  };

  const statusConfig = getStatusConfig();
  const attemptInfo = getLatestAttemptInfo();

  return (
    <Card className="h-full border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 bg-white">
      <div className="flex flex-col h-full">
        {/* Header com data e status */}
        <div className="flex justify-between items-start mb-3">
          <Tooltip title={`Criado em ${formattedCreatedAt}`}>
            <div className="flex items-center text-xs text-gray-500">
              <Calendar className="w-3.5 h-3.5 mr-1.5" />
              {formattedCreatedAt}
            </div>
          </Tooltip>

          {userRole === 'student' && !isLoading && (
            <Tag
              color={statusConfig.color}
              icon={statusConfig.icon}
              className="text-xs"
            >
              {statusConfig.text}
            </Tag>
          )}
        </div>

        {/* Título */}
        <h3 className="text-base font-medium mb-2 text-gray-800 line-clamp-2">
          {title}
        </h3>

        {/* Tema e descrição */}
        <div className="flex flex-col mb-3">
          <Text className="text-xs mb-1 text-gray-500">{theme}</Text>

          {description && (
            <Text className="text-xs text-gray-600 line-clamp-2 mb-2">
              {description}
            </Text>
          )}
        </div>

        {/* Informações do questionário */}
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

        {/* Criador */}
        {createdBy && (
          <div className="flex items-center mb-3">
            <User className="w-4 h-4 mr-2 text-gray-500" />
            <Text className="text-xs text-gray-600">
              Criado por: {createdBy.name}
            </Text>
          </div>
        )}

        {/* Resultado da última tentativa (para estudantes) */}
        {userRole === 'student' && attemptInfo && (
          <div className="mb-3 p-2 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center mb-1">
              <Text className="text-xs text-gray-600">Última tentativa:</Text>
              <Text className="text-xs font-medium">
                {attemptInfo.score}/{attemptInfo.total}
              </Text>
            </div>
            <Progress
              percent={attemptInfo.percentage}
              size="small"
              strokeColor={
                attemptInfo.percentage >= 70
                  ? '#52c41a'
                  : attemptInfo.percentage >= 50
                  ? '#faad14'
                  : '#f5222d'
              }
            />
          </div>
        )}

        {/* Estatísticas para professores */}
        {(userRole === 'teacher' || userRole === 'admin') && (
          <div className="mb-3 p-2 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <Text className="text-xs text-blue-600">
                <BarChart3 className="w-3 h-3 inline mr-1" />
                Ver estatísticas
              </Text>
            </div>
          </div>
        )}

        {/* Ações - seguindo o padrão do card original */}
        <div className="flex justify-end gap-2 mt-auto pt-3">
          {userRole === 'teacher' || userRole === 'admin' ? (
            <>
              <Button
                type="text"
                size="small"
                className="text-xs px-3 py-1 flex items-center text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                icon={<BarChart3 className="w-3.5 h-3.5 mr-1.5" />}
                onClick={handlePrimaryAction}
              >
                Resultados
              </Button>
              <Button
                type="text"
                size="small"
                className="text-xs px-3 py-1 flex items-center text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                icon={<Edit className="w-3.5 h-3.5 mr-1.5" />}
                onClick={handleSecondaryAction}
              >
                Editar
              </Button>
            </>
          ) : (
            <>
              <Button
                type="text"
                size="small"
                className="text-xs px-3 py-1 flex items-center text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                icon={<Eye className="w-3.5 h-3.5 mr-1.5" />}
                onClick={handleSecondaryAction}
              >
                Ver
              </Button>
              <Button
                type="text"
                size="small"
                className="text-xs px-3 py-1 flex items-center text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                icon={
                  status === 'completed' || status === 'expired' ? (
                    <Eye className="w-3.5 h-3.5 mr-1.5" />
                  ) : (
                    <Play className="w-3.5 h-3.5 mr-1.5" />
                  )
                }
                onClick={handlePrimaryAction}
                loading={isLoading}
              >
                {statusConfig.action}
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  );
};

export default EnhancedQuestionnaireCard;
