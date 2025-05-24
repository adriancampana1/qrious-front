import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Button,
  Radio,
  Checkbox,
  Input,
  Progress,
  Alert,
  Typography,
  Space,
  Modal
} from 'antd';
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';
import { questionnaireAttemptService } from '../services/questionnaire-attempt.service';
import type { Questionnaire } from '../interfaces/questionnaire';
import type {
  QuestionnaireAttempt,
  QuestionnaireItem
} from '../interfaces/questionnaire-attempt';
import type { SubmitQuestionnaireResponsesDto } from '../dto/submit-questionnaire.dto';
import { BankQuestionType } from '../../bank-question/types/bank-question.types';
import type { MessageInstance } from 'antd/es/message/interface';
import { questionnaireHooks } from '../hooks/use-questionnaire';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface TakeQuestionnaireProps {
  questionnaireId: number;
  onComplete: () => void;
  messageApi: MessageInstance;
}

interface UserResponse {
  questionId: number;
  selectedOptionIds?: number[];
  essayResponse?: string;
}

const TakeQuestionnaire = ({
  questionnaireId,
  onComplete,
  messageApi
}: TakeQuestionnaireProps) => {
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(
    null
  );
  const [attempt, setAttempt] = useState<QuestionnaireAttempt | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<UserResponse[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { data } = questionnaireHooks.useGetById(questionnaireId);

  useEffect(() => {
    const initializeQuestionnaire = async () => {
      if (!data) {
        return;
      }

      try {
        setIsLoading(true);

        setQuestionnaire(data);

        const existingAttempts =
          await questionnaireAttemptService.getAttemptsByUser(questionnaireId);
        const inProgressAttempt = existingAttempts.find(
          (a) => a.status === 'in_progress'
        );

        if (inProgressAttempt) {
          setAttempt(inProgressAttempt);
          if (inProgressAttempt.responses) {
            const userResponses = inProgressAttempt.responses.map((r) => ({
              questionId: r.bankQuestionId,
              selectedOptionIds: r.selectedOptions,
              essayResponse: r.essayResponse || undefined
            }));
            setResponses(userResponses);
          }
        } else {
          const newAttempt = await questionnaireAttemptService.createAttempt(
            questionnaireId,
            {}
          );
          setAttempt(newAttempt);
        }

        if (data.timeLimitMinutes) {
          const startTime =
            inProgressAttempt?.startTime || new Date().toISOString();
          const endTime = new Date(
            new Date(startTime).getTime() + data.timeLimitMinutes * 60000
          );
          const remaining = Math.max(
            0,
            endTime.getTime() - new Date().getTime()
          );
          setTimeRemaining(Math.floor(remaining / 1000));
        }
      } catch (error) {
        console.error('Erro ao inicializar questionário:', error);

        let errorMessage = 'Erro desconhecido';
        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (typeof error === 'string') {
          errorMessage = error;
        }

        messageApi.error(`Erro ao carregar questionário: ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
    };

    initializeQuestionnaire();
  }, [questionnaireId, messageApi, data]);

  const handleSubmit = useCallback(
    async (autoSubmit = false) => {
      if (!attempt || !questionnaire) return;

      try {
        setIsSubmitting(true);

        const submitData: SubmitQuestionnaireResponsesDto[] = responses.map(
          (response) => ({
            questionId: response.questionId,
            selectedOptionIds: response.selectedOptionIds,
            essayResponse: response.essayResponse
          })
        );

        await questionnaireAttemptService.submitResponses(
          questionnaireId,
          attempt.id,
          {
            responses: submitData
          }
        );

        if (autoSubmit) {
          messageApi.warning(
            'Tempo esgotado! Questionário submetido automaticamente.'
          );
        } else {
          messageApi.success('Questionário submetido com sucesso!');
        }

        onComplete();
      } catch (error) {
        console.error('Erro ao submeter questionário:', error);
        messageApi.error('Erro ao submeter questionário');
      } finally {
        setIsSubmitting(false);
        setShowSubmitModal(false);
      }
    },
    [attempt, messageApi, questionnaireId, responses, onComplete, questionnaire]
  );

  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, handleSubmit]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs
        .toString()
        .padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentQuestion = (): QuestionnaireItem | null => {
    if (
      !questionnaire?.items ||
      currentQuestionIndex >= questionnaire.items.length
    ) {
      return null;
    }
    return questionnaire.items[currentQuestionIndex];
  };

  const getCurrentResponse = (): UserResponse | undefined => {
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return undefined;

    return responses.find(
      (r) => r.questionId === currentQuestion.bankQuestionId
    );
  };

  const updateResponse = (
    questionId: number,
    update: Partial<UserResponse>
  ) => {
    setResponses((prev) => {
      const existing = prev.find((r) => r.questionId === questionId);
      if (existing) {
        return prev.map((r) =>
          r.questionId === questionId ? { ...r, ...update } : r
        );
      } else {
        return [...prev, { questionId, ...update }];
      }
    });
  };

  const handleOptionChange = (
    questionId: number,
    optionIds: number[],
    isMultiple: boolean
  ) => {
    if (isMultiple) {
      updateResponse(questionId, { selectedOptionIds: optionIds });
    } else {
      updateResponse(questionId, { selectedOptionIds: optionIds });
    }
  };

  const handleEssayChange = (questionId: number, text: string) => {
    updateResponse(questionId, { essayResponse: text });
  };

  const getAnsweredCount = () => {
    if (!questionnaire) return 0;
    return questionnaire.items.filter((item) =>
      responses.some((r) => r.questionId === item.bankQuestionId)
    ).length;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <Text>Carregando questionário...</Text>
        </div>
      </div>
    );
  }

  if (!questionnaire || !attempt) {
    return (
      <Alert
        message="Erro"
        description="Não foi possível carregar o questionário"
        type="error"
        showIcon
      />
    );
  }

  const currentQuestion = getCurrentQuestion();
  const currentResponse = getCurrentResponse();
  const totalQuestions = questionnaire.items.length;
  const answeredCount = getAnsweredCount();

  if (!currentQuestion) {
    return (
      <Alert
        message="Questionário vazio"
        description="Este questionário não possui questões"
        type="warning"
        showIcon
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header com informações do questionário */}
      <Card className="mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <Title level={3} className="mb-2">
              {questionnaire.title}
            </Title>
            <Text className="text-gray-600">{questionnaire.description}</Text>
          </div>

          {timeRemaining !== null && (
            <div className="text-right">
              <div className="flex items-center gap-2 mb-2">
                <ClockCircleOutlined
                  className={
                    timeRemaining < 300 ? 'text-red-500' : 'text-blue-500'
                  }
                />
                <Text
                  className={
                    timeRemaining < 300
                      ? 'text-red-500 font-bold'
                      : 'text-blue-500'
                  }
                >
                  {formatTime(timeRemaining)}
                </Text>
              </div>
              <Text className="text-gray-500 text-sm">Tempo restante</Text>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center">
          <Text>
            Questão {currentQuestionIndex + 1} de {totalQuestions} •
            <span className="ml-2 text-green-600">
              {answeredCount} respondidas
            </span>
          </Text>

          <Progress
            percent={Math.round((answeredCount / totalQuestions) * 100)}
            size="small"
            className="w-32"
          />
        </div>
      </Card>

      {/* Questão atual */}
      <Card className="mb-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              Questão {currentQuestionIndex + 1}
            </span>
            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
              {currentQuestion.bankQuestion.type === BankQuestionType.SINGLE &&
                'Resposta Única'}
              {currentQuestion.bankQuestion.type ===
                BankQuestionType.MULTIPLE && 'Múltipla Escolha'}
              {currentQuestion.bankQuestion.type === BankQuestionType.ESSAY &&
                'Dissertativa'}
            </span>
          </div>

          <Paragraph className="text-lg mb-6">
            {currentQuestion.bankQuestion.content}
          </Paragraph>

          {/* Opções para questões objetivas */}
          {currentQuestion.bankQuestion.type !== BankQuestionType.ESSAY && (
            <div className="space-y-3">
              {currentQuestion.bankQuestion.type === BankQuestionType.SINGLE ? (
                <Radio.Group
                  value={currentResponse?.selectedOptionIds?.[0]}
                  onChange={(e) =>
                    handleOptionChange(
                      currentQuestion.bankQuestionId,
                      [e.target.value],
                      false
                    )
                  }
                  className="w-full"
                >
                  <Space direction="vertical" className="w-full">
                    {currentQuestion.bankQuestion.options?.map((option) => (
                      <Radio
                        key={option.id}
                        value={option.id}
                        className="w-full"
                      >
                        <div className="p-3 border rounded-lg hover:bg-gray-50 w-full">
                          {option.content}
                        </div>
                      </Radio>
                    ))}
                  </Space>
                </Radio.Group>
              ) : (
                <Checkbox.Group
                  value={currentResponse?.selectedOptionIds || []}
                  onChange={(values) =>
                    handleOptionChange(
                      currentQuestion.bankQuestionId,
                      values as number[],
                      true
                    )
                  }
                  className="w-full"
                >
                  <Space direction="vertical" className="w-full">
                    {currentQuestion.bankQuestion.options?.map((option) => (
                      <Checkbox
                        key={option.id}
                        value={option.id}
                        className="w-full"
                      >
                        <div className="p-3 border rounded-lg hover:bg-gray-50 w-full">
                          {option.content}
                        </div>
                      </Checkbox>
                    ))}
                  </Space>
                </Checkbox.Group>
              )}
            </div>
          )}

          {/* Campo para questões dissertativas */}
          {currentQuestion.bankQuestion.type === BankQuestionType.ESSAY && (
            <TextArea
              rows={8}
              placeholder="Digite sua resposta aqui..."
              value={currentResponse?.essayResponse || ''}
              onChange={(e) =>
                handleEssayChange(
                  currentQuestion.bankQuestionId,
                  e.target.value
                )
              }
              className="w-full"
            />
          )}
        </div>
      </Card>

      {/* Navegação */}
      <Card>
        <div className="flex justify-between items-center">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() =>
              setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))
            }
            disabled={currentQuestionIndex === 0}
          >
            Anterior
          </Button>

          <div className="flex gap-2">
            {questionnaire.items.map((_, index) => (
              <Button
                key={index}
                size="small"
                type={index === currentQuestionIndex ? 'primary' : 'default'}
                className={
                  responses.some(
                    (r) =>
                      r.questionId === questionnaire.items[index].bankQuestionId
                  )
                    ? 'border-green-500 text-green-600'
                    : ''
                }
                onClick={() => setCurrentQuestionIndex(index)}
              >
                {index + 1}
              </Button>
            ))}
          </div>

          <div className="flex gap-2">
            {currentQuestionIndex < totalQuestions - 1 ? (
              <Button
                type="primary"
                icon={<ArrowRightOutlined />}
                onClick={() =>
                  setCurrentQuestionIndex((prev) =>
                    Math.min(totalQuestions - 1, prev + 1)
                  )
                }
              >
                Próxima
              </Button>
            ) : (
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => setShowSubmitModal(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                Finalizar
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Modal de confirmação */}
      <Modal
        title="Finalizar Questionário"
        open={showSubmitModal}
        onOk={() => handleSubmit()}
        onCancel={() => setShowSubmitModal(false)}
        confirmLoading={isSubmitting}
        okText="Confirmar Submissão"
        cancelText="Cancelar"
      >
        <div className="py-4">
          <Alert
            message="Atenção!"
            description={
              <div>
                <p>Você está prestes a finalizar o questionário.</p>
                <p className="mt-2">
                  <strong>Questões respondidas:</strong> {answeredCount} de{' '}
                  {totalQuestions}
                </p>
                {answeredCount < totalQuestions && (
                  <p className="text-orange-600 mt-2">
                    Você ainda tem {totalQuestions - answeredCount} questões não
                    respondidas.
                  </p>
                )}
                <p className="mt-2">Esta ação não pode ser desfeita.</p>
              </div>
            }
            type="warning"
            showIcon
          />
        </div>
      </Modal>
    </div>
  );
};

export default TakeQuestionnaire;
