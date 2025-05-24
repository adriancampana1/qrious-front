import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Statistic,
  Progress,
  Tag,
  Typography,
  Tabs,
  Alert,
  Button
} from 'antd';
import {
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { questionnaireAttemptService } from '../services/questionnaire-attempt.service';
import type { Questionnaire } from '../interfaces/questionnaire';
import type { QuestionnaireAttempt } from '../interfaces/questionnaire-attempt';
import { questionnaireHooks } from '../hooks/use-questionnaire';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface QuestionnaireResultsProps {
  questionnaireId: number;
}

const QuestionnaireResults = ({
  questionnaireId
}: QuestionnaireResultsProps) => {
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(
    null
  );
  const [attempts, setAttempts] = useState<QuestionnaireAttempt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { data: questionnaireData } =
    questionnaireHooks.useGetById(questionnaireId);

  useEffect(() => {
    const loadData = async () => {
      if (!questionnaireData) {
        return;
      }

      try {
        setIsLoading(true);
        setQuestionnaire(questionnaireData);

        const attemptsData = await questionnaireAttemptService.getAllAttempts(
          questionnaireId
        );
        setAttempts(attemptsData);
      } catch (error) {
        console.error('Erro ao carregar resultados:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [questionnaireId, questionnaireData]);

  const getStatistics = () => {
    const completedAttempts = attempts.filter((a) => a.status === 'completed');
    const totalAttempts = attempts.length;
    const averageScore =
      completedAttempts.length > 0
        ? completedAttempts.reduce((sum, a) => sum + (a.score || 0), 0) /
          completedAttempts.length
        : 0;
    const maxScore = questionnaire?.numQuestions || 0;
    const averagePercentage =
      maxScore > 0 ? (averageScore / maxScore) * 100 : 0;

    return {
      totalAttempts,
      completedAttempts: completedAttempts.length,
      averageScore,
      averagePercentage,
      maxScore
    };
  };

  const columns: ColumnsType<QuestionnaireAttempt> = [
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusConfig = {
          completed: {
            color: 'green',
            icon: <CheckCircleOutlined />,
            text: 'Concluído'
          },
          in_progress: {
            color: 'blue',
            icon: <ClockCircleOutlined />,
            text: 'Em Andamento'
          },
          expired: {
            color: 'red',
            icon: <CloseCircleOutlined />,
            text: 'Expirado'
          }
        };

        const config = statusConfig[status as keyof typeof statusConfig];
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.text}
          </Tag>
        );
      }
    },
    {
      title: 'Pontuação',
      dataIndex: 'score',
      key: 'score',
      render: (score, record) => {
        if (record.status !== 'completed') return '—';

        const percentage =
          record.totalQuestions > 0 ? (score / record.totalQuestions) * 100 : 0;
        return (
          <div className="flex items-center gap-2">
            <span className="font-medium">
              {score}/{record.totalQuestions}
            </span>
            <Progress
              percent={percentage}
              size="small"
              className="w-16"
              format={() => `${Math.round(percentage)}%`}
            />
          </div>
        );
      }
    },
    {
      title: 'Tempo',
      key: 'time',
      render: (_, record) => {
        if (!record.startTime) return '—';

        const startTime = new Date(record.startTime);
        const endTime = record.endTime ? new Date(record.endTime) : new Date();
        const duration = Math.floor(
          (endTime.getTime() - startTime.getTime()) / 1000 / 60
        );

        return (
          <div>
            <div className="text-sm">{duration} minutos</div>
            <div className="text-xs text-gray-500">
              {startTime.toLocaleString('pt-BR')}
            </div>
          </div>
        );
      }
    }
  ];

  const exportResults = () => {
    const csvContent = [
      [
        'Nome',
        'Email',
        'Status',
        'Pontuação',
        'Total',
        'Porcentagem',
        'Início',
        'Fim',
        'Duração (min)'
      ],
      ...attempts.map((attempt) => [
        attempt.user?.name || 'N/A',
        attempt.user?.email || 'N/A',
        attempt.status,
        attempt.score || 0,
        attempt.totalQuestions,
        attempt.totalQuestions > 0
          ? Math.round(((attempt.score || 0) / attempt.totalQuestions) * 100)
          : 0,
        attempt.startTime
          ? new Date(attempt.startTime).toLocaleString('pt-BR')
          : 'N/A',
        attempt.endTime
          ? new Date(attempt.endTime).toLocaleString('pt-BR')
          : 'N/A',
        attempt.startTime && attempt.endTime
          ? Math.floor(
              (new Date(attempt.endTime).getTime() -
                new Date(attempt.startTime).getTime()) /
                1000 /
                60
            )
          : 'N/A'
      ])
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `resultados-${questionnaire?.title || 'questionario'}.csv`
    );
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <Text>Carregando resultados...</Text>
        </div>
      </div>
    );
  }

  if (!questionnaire) {
    return (
      <Alert
        message="Erro"
        description="Não foi possível carregar o questionário"
        type="error"
        showIcon
      />
    );
  }

  const stats = getStatistics();

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <Title level={2} className="mb-2">
              {questionnaire.title}
            </Title>
            <Text className="text-gray-600">{questionnaire.description}</Text>
          </div>

          <Button
            icon={<DownloadOutlined />}
            onClick={exportResults}
            disabled={attempts.length === 0}
          >
            Exportar Resultados
          </Button>
        </div>
      </div>

      <Tabs defaultActiveKey="overview">
        <TabPane tab="Visão Geral" key="overview">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <Statistic
                title="Total de Tentativas"
                value={stats.totalAttempts}
                prefix={<UserOutlined />}
              />
            </Card>

            <Card>
              <Statistic
                title="Concluídas"
                value={stats.completedAttempts}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>

            <Card>
              <Statistic
                title="Média de Acertos"
                value={stats.averageScore.toFixed(1)}
                suffix={`/ ${stats.maxScore}`}
                prefix={<CheckCircleOutlined />}
              />
            </Card>

            <Card>
              <Statistic
                title="Aproveitamento Médio"
                value={stats.averagePercentage.toFixed(1)}
                suffix="%"
                valueStyle={{
                  color:
                    stats.averagePercentage >= 70
                      ? '#52c41a'
                      : stats.averagePercentage >= 50
                      ? '#faad14'
                      : '#f5222d'
                }}
              />
            </Card>
          </div>

          {attempts.length === 0 ? (
            <Alert
              message="Nenhuma tentativa encontrada"
              description="Este questionário ainda não foi respondido por nenhum aluno."
              type="info"
              showIcon
            />
          ) : (
            <Card title="Tentativas dos Alunos">
              <Table
                dataSource={attempts}
                columns={columns}
                rowKey="id"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} de ${total} tentativas`
                }}
              />
            </Card>
          )}
        </TabPane>

        <TabPane tab="Análise por Questão" key="questions">
          <Card title="Desempenho por Questão">
            {questionnaire.showAnswersAfterSubmission ? (
              <div className="space-y-4">
                {questionnaire.items.map((item, index) => {
                  const questionResponses = attempts
                    .filter((a) => a.status === 'completed')
                    .flatMap((a) => a.responses || [])
                    .filter((r) => r.bankQuestionId === item.bankQuestionId);

                  const correctCount = questionResponses.filter(
                    (r) => r.isCorrect
                  ).length;
                  const totalResponses = questionResponses.length;
                  const successRate =
                    totalResponses > 0
                      ? (correctCount / totalResponses) * 100
                      : 0;

                  return (
                    <Card key={item.bankQuestionId} size="small">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <Text strong>Questão {index + 1}</Text>
                          <div className="mt-2 text-gray-700">
                            {item.bankQuestion.content}
                          </div>
                        </div>

                        <div className="text-right ml-4">
                          <div className="text-2xl font-bold mb-1">
                            {Math.round(successRate)}%
                          </div>
                          <div className="text-sm text-gray-500">
                            {correctCount}/{totalResponses} acertos
                          </div>
                        </div>
                      </div>

                      <Progress
                        percent={successRate}
                        strokeColor={
                          successRate >= 70
                            ? '#52c41a'
                            : successRate >= 50
                            ? '#faad14'
                            : '#f5222d'
                        }
                      />
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Alert
                message="Análise não disponível"
                description="A análise por questão só está disponível quando a opção 'Mostrar respostas após submissão' está habilitada."
                type="warning"
                showIcon
              />
            )}
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default QuestionnaireResults;
