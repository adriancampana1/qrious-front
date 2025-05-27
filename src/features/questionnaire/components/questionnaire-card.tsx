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
  Edit,
  Trash2
} from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import dayjs from 'dayjs';
import { questionnaireAttemptService } from '../services/questionnaire-attempt.service';
import { questionnaireService } from '../services/questionnaire.service';
import type { Questionnaire } from '../interfaces/questionnaire';
import type { QuestionnaireAttempt } from '../interfaces/questionnaire-attempt';
import { useNavigate } from 'react-router';
import type { MessageInstance } from 'antd/es/message/interface';
import ConfirmationModal from '../../../shared/modal/delete-confirmation.modal';

const { Text } = Typography;

interface QuestionnaireCardProps {
  questionnaire: Questionnaire;
  userRole?: 'student' | 'teacher' | 'admin';
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  messageApi?: MessageInstance;
  refetch?: () => void;
}

type QuestionnaireStatus =
  | 'not_started'
  | 'in_progress'
  | 'completed'
  | 'expired';

const QuestionnaireCard = ({
  questionnaire,
  userRole = 'student',
  onEdit,
  onDelete,
  messageApi,
  refetch
}: QuestionnaireCardProps) => {
  const navigate = useNavigate();
  const [userAttempts, setUserAttempts] = useState<QuestionnaireAttempt[]>([]);
  const [status, setStatus] = useState<QuestionnaireStatus>('not_started');
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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

  const handleDeleteConfirm = useCallback(async () => {
    await questionnaireService.deleteQuestionnaire(id);
    onDelete?.(id);
  }, [id, onDelete]);

  const questionCount = numQuestions || items?.length || 0;

  const formattedTimeLimit = timeLimitMinutes
    ? timeLimitMinutes === 60
      ? '1 hora'
      : timeLimitMinutes < 60
      ? `${timeLimitMinutes} min`
      : `${Math.floor(timeLimitMinutes / 60)}h ${timeLimitMinutes % 60}min`
    : null;

  const formattedCreatedAt = dayjs(createdAt).format('DD/MM/YYYY');

  const getStatusConfig = () => {
    switch (status) {
      case 'not_started':
        return {
          color: 'blue',
          icon: <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5" />,
          text: 'Não iniciado',
          action: 'Iniciar'
        };
      case 'in_progress':
        return {
          color: 'orange',
          icon: <AlertCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />,
          text: 'Em andamento',
          action: 'Continuar'
        };
      case 'completed':
        return {
          color: 'green',
          icon: <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />,
          text: 'Concluído',
          action: 'Ver Resultado'
        };
      case 'expired':
        return {
          color: 'red',
          icon: <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />,
          text: 'Expirado',
          action: 'Ver Resultado'
        };
      default:
        return {
          color: 'gray',
          icon: <HelpCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />,
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

  // Verifica se o usuário pode excluir
  const canDelete = userRole === 'teacher' || userRole === 'admin';

  return (
    <>
      <Card className="h-full border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 bg-white">
        <div className="flex flex-col h-full">
          {/* Header com data e status */}
          <div className="flex justify-between items-start mb-2 sm:mb-3">
            <Tooltip title={`Criado em ${formattedCreatedAt}`}>
              <div className="flex items-center text-xs text-gray-500">
                <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-1.5 flex-shrink-0" />
                <span className="truncate">{formattedCreatedAt}</span>
              </div>
            </Tooltip>

            {userRole === 'student' && !isLoading && (
              <Tag
                color={statusConfig.color}
                icon={statusConfig.icon}
                className="text-xs flex-shrink-0 ml-2"
              >
                <span className="hidden sm:inline">{statusConfig.text}</span>
                <span className="sm:hidden">
                  {statusConfig.text.split(' ')[0]}
                </span>
              </Tag>
            )}
          </div>

          {/* Título */}
          <h3 className="text-sm sm:text-base font-medium mb-2 text-gray-800 line-clamp-2 leading-tight">
            {title}
          </h3>

          {/* Tema e descrição */}
          <div className="flex flex-col mb-2 sm:mb-3">
            <Text className="text-xs mb-1 text-gray-500 truncate">{theme}</Text>

            {description && (
              <Text className="text-xs text-gray-600 line-clamp-2 mb-1 sm:mb-2 leading-relaxed">
                {description}
              </Text>
            )}
          </div>

          {/* Informações do questionário */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2 sm:mb-3">
            <div className="flex items-center">
              <HelpCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-gray-500 flex-shrink-0" />
              <Text className="text-xs text-gray-600">
                {questionCount} questões
              </Text>
            </div>

            {formattedTimeLimit && (
              <div className="flex items-center">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-gray-500 flex-shrink-0" />
                <Text className="text-xs text-gray-600">
                  <span className="hidden sm:inline">Limite: </span>
                  {formattedTimeLimit}
                </Text>
              </div>
            )}
          </div>

          {/* Criador */}
          {createdBy && (
            <div className="flex items-center mb-2 sm:mb-3">
              <User className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-gray-500 flex-shrink-0" />
              <Text className="text-xs text-gray-600 truncate">
                <span className="hidden sm:inline">Criado por: </span>
                {createdBy.name}
              </Text>
            </div>
          )}

          {/* Resultado da última tentativa (para estudantes) */}
          {userRole === 'student' && attemptInfo && (
            <div className="mb-2 sm:mb-3 p-2 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center mb-1">
                <Text className="text-xs text-gray-600">
                  <span className="hidden sm:inline">Última tentativa:</span>
                  <span className="sm:hidden">Resultado:</span>
                </Text>
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

          {/* Ações */}
          <div className="flex flex-col sm:flex-row justify-end gap-1 sm:gap-2 mt-auto pt-2 sm:pt-3">
            {userRole === 'teacher' || userRole === 'admin' ? (
              <>
                <Button
                  type="text"
                  size="small"
                  className="text-xs px-2 sm:px-3 py-1 flex items-center justify-center sm:justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  icon={
                    <BarChart3 className="w-3 h-3 sm:w-3.5 sm:h-3.5 sm:mr-1.5" />
                  }
                  onClick={handlePrimaryAction}
                >
                  <span className="hidden sm:inline">Resultados</span>
                  <span className="sm:hidden">Resultados</span>
                </Button>
                <Button
                  type="text"
                  size="small"
                  className="text-xs px-2 sm:px-3 py-1 flex items-center justify-center sm:justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  icon={
                    <Edit className="w-3 h-3 sm:w-3.5 sm:h-3.5 sm:mr-1.5" />
                  }
                  onClick={handleSecondaryAction}
                >
                  <span className="hidden sm:inline">Editar</span>
                  <span className="sm:hidden">Editar</span>
                </Button>
                {canDelete && (
                  <Tooltip title="Excluir questionário">
                    <Button
                      type="text"
                      size="small"
                      danger
                      className="text-xs px-2 sm:px-3 py-1 flex items-center justify-center sm:justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                      icon={
                        <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 sm:mr-1.5" />
                      }
                      onClick={() => setShowDeleteModal(true)}
                    >
                      <span className="hidden sm:inline">Excluir</span>
                      <span className="sm:hidden">Excluir</span>
                    </Button>
                  </Tooltip>
                )}
              </>
            ) : (
              <>
                <Button
                  type="text"
                  size="small"
                  className="text-xs px-2 sm:px-3 py-1 flex items-center justify-center sm:justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  icon={<Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5 sm:mr-1.5" />}
                  onClick={handleSecondaryAction}
                >
                  <span className="hidden sm:inline">Ver</span>
                  <span className="sm:hidden">Ver</span>
                </Button>
                <Button
                  type="text"
                  size="small"
                  className="text-xs px-2 sm:px-3 py-1 flex items-center justify-center sm:justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  icon={
                    status === 'completed' || status === 'expired' ? (
                      <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5 sm:mr-1.5" />
                    ) : (
                      <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 sm:mr-1.5" />
                    )
                  }
                  onClick={handlePrimaryAction}
                  loading={isLoading}
                >
                  <span className="hidden sm:inline">
                    {statusConfig.action}
                  </span>
                  <span className="sm:hidden">
                    {status === 'completed' || status === 'expired'
                      ? 'Resultado'
                      : 'Iniciar'}
                  </span>
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>

      <ConfirmationModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Excluir Questionário"
        description={`Tem certeza que deseja excluir o questionário "${title}"? Esta ação não pode ser desfeita e todas as tentativas e resultados associados também serão removidos.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={handleDeleteConfirm}
        messageApi={messageApi}
        successMessage="Questionário excluído com sucesso!"
        errorMessage="Erro ao excluir questionário. Tente novamente."
        refetch={refetch}
        danger={true}
      />
    </>
  );
};

export default QuestionnaireCard;
