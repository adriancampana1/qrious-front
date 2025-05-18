import { Row, Col, Card, Button, Typography, Tabs, Empty } from 'antd';
import {
  Users,
  HelpCircle,
  FileText,
  User,
  Plus,
  TrendingUp
} from 'lucide-react';

import StatsCard from '../components/stats-card';
import SessionCard from '../../session/components/session-card';
import QuestionnaireCard from '../../questionnaire/components/questionnaire-card';
import PageLayout from '../../../shared/components/page-layout';
import CreateSessionModal from '../../session/modal/create-session.modal';
import CreateQuestionnaireModal from '../../questionnaire/modal/create-questionnaire.modal';
import CreateBankQuestionModal from '../../bank-question/modal/create-bank-question.dto';
import { useModal } from '../../../shared/hooks/use-modal';
import { useGlobalMessage } from '../../../shared/hooks/use-message';
import { useGetAllSessions } from '../../session/hooks/use-session';
import { useGetAllQuestionnaires } from '../../questionnaire/hooks/use-questionnaire';
import { bankQuestionHooks } from '../../bank-question/hooks/use-bank-question';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const mockData = {
  stats: {
    totalUsers: 1250,
    totalSessions: 87,
    totalQuestions: 543,
    totalQuestionnaires: 32,
    activeQuestionnaires: 8
  },
  recentSessions: [
    {
      id: 1,
      title: 'Introdução à Programação',
      theme: 'Programação',
      participants: 45,
      questions: 23,
      status: 'active',
      timeRemaining: '1h 30min',
      progress: 65
    },
    {
      id: 2,
      title: 'Matemática Discreta',
      theme: 'Matemática',
      participants: 32,
      questions: 15,
      status: 'active',
      timeRemaining: '45min',
      progress: 80
    },
    {
      id: 3,
      title: 'Banco de Dados',
      theme: 'Computação',
      participants: 28,
      questions: 19,
      status: 'ended'
    },
    {
      id: 4,
      title: 'Algoritmos Avançados',
      theme: 'Programação',
      participants: 22,
      questions: 12,
      status: 'ended'
    }
  ],
  questionnaires: [
    {
      id: 1,
      title: 'Fundamentos de Programação',
      theme: 'Programação',
      questions: 20,
      status: 'active',
      timeLimit: '1 hora',
      completionRate: 75
    },
    {
      id: 2,
      title: 'Álgebra Linear',
      theme: 'Matemática',
      questions: 15,
      status: 'draft'
    },
    {
      id: 3,
      title: 'Estruturas de Dados',
      theme: 'Computação',
      questions: 18,
      status: 'ended',
      completionRate: 100
    }
  ],
  topQuestions: [
    {
      id: 1,
      title: 'Como implementar recursão?',
      votes: 45,
      session: 'Introdução à Programação',
      answered: true
    },
    {
      id: 2,
      title: 'Diferença entre SQL e NoSQL?',
      votes: 38,
      session: 'Banco de Dados',
      answered: true
    },
    {
      id: 3,
      title: 'Como resolver equações diferenciais?',
      votes: 32,
      session: 'Matemática Discreta',
      answered: false
    },
    {
      id: 4,
      title: 'O que é complexidade de algoritmo?',
      votes: 29,
      session: 'Algoritmos Avançados',
      answered: false
    }
  ],
  userActivity: [
    {
      id: 1,
      name: 'João Silva',
      action: 'criou uma pergunta',
      time: '5 minutos atrás',
      avatar: 'https://xsgames.co/randomusers/avatar.php?g=male'
    },
    {
      id: 2,
      name: 'Maria Oliveira',
      action: 'respondeu um questionário',
      time: '15 minutos atrás',
      avatar: 'https://xsgames.co/randomusers/avatar.php?g=female'
    },
    {
      id: 3,
      name: 'Pedro Santos',
      action: 'entrou em uma sessão',
      time: '30 minutos atrás',
      avatar: 'https://xsgames.co/randomusers/avatar.php?g=male'
    },
    {
      id: 4,
      name: 'Ana Costa',
      action: 'criou um questionário',
      time: '1 hora atrás',
      avatar: 'https://xsgames.co/randomusers/avatar.php?g=female'
    }
  ]
};

const Dashboard = () => {
  const sessionModal = useModal();
  const questionnaireModal = useModal();
  const bankQuestionModal = useModal();
  const messageApi = useGlobalMessage();
  const { data: sessions } = useGetAllSessions();
  const { data: questionnaires, refetch } = useGetAllQuestionnaires();
  const { data: bankQuestions } = bankQuestionHooks.usePaginated({
    params: {
      page: 1,
      limit: 20
    }
  });

  const actionButtons = [
    {
      title: 'Nova Sessão',
      icon: <Plus className="w-4 h-4" />,
      onClick: sessionModal.open,
      primary: true
    },
    {
      title: 'Novo Questionário',
      icon: <Plus className="w-4 h-4" />,
      onClick: questionnaireModal.open
    },
    {
      title: 'Adicionar Questão',
      icon: <Plus className="w-4 h-4" />,
      onClick: bankQuestionModal.open
    },
    {
      title: 'Gerenciar Usuários',
      icon: <User className="w-4 h-4" />,
      onClick: () => {}
    }
  ];

  return (
    <PageLayout>
      <div className="mb-8">
        <Title level={3} className="mb-1 font-medium text-gray-800">
          Painel de Administração
        </Title>
        <Text className="text-gray-500">
          Visão geral do sistema e estatísticas
        </Text>
      </div>

      <Row gutter={[24, 24]} className="mb-8">
        <Col span={24}>
          <Card
            className="border-0 shadow-sm bg-gradient-to-r from-gray-50 to-white"
            style={{ padding: '20px' }}
          >
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div>
                <Title level={5} className="mb-1 font-medium text-gray-700">
                  Ações Rápidas
                </Title>
                <Text className="text-gray-500 text-sm">
                  Acesse as principais funcionalidades do sistema
                </Text>
              </div>
              <div className="flex flex-wrap gap-3 justify-end">
                {actionButtons.map((button, index) => (
                  <Button
                    key={index}
                    type={button.primary ? 'primary' : 'default'}
                    icon={button.icon}
                    onClick={button.onClick}
                    className={`flex items-center gap-2 h-9 px-4 ${
                      button.primary
                        ? 'bg-gradient-to-r from-teal-500 to-cyan-500 border-0 shadow-sm hover:opacity-90'
                        : 'border-gray-200 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    {button.title}
                  </Button>
                ))}
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} className="mb-8">
        <Col xs={24} sm={12} md={6}>
          <StatsCard
            title="Usuários"
            value={mockData.stats.totalUsers}
            icon={<User className="w-5 h-5 text-teal-500" />}
            valueStyle={{ color: '#111827' }}
            trend={{
              value: '12% a mais que o mês passado',
              isPositive: true
            }}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatsCard
            title="Sessões Criadas"
            value={mockData.stats.totalSessions}
            icon={<Users className="w-5 h-5 text-cyan-500" />}
            valueStyle={{ color: '#111827' }}
            trend={{
              value: '8% a mais que o mês passado',
              isPositive: true
            }}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatsCard
            title="Banco de Questões"
            value={mockData.stats.totalQuestions}
            icon={<HelpCircle className="w-5 h-5 text-emerald-500" />}
            valueStyle={{ color: '#111827' }}
            trend={{
              value: '15% a mais que o mês passado',
              isPositive: true
            }}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatsCard
            title="Questionários"
            value={mockData.stats.totalQuestionnaires}
            icon={<FileText className="w-5 h-5 text-sky-500" />}
            valueStyle={{ color: '#111827' }}
            trend={{
              value: `${mockData.stats.activeQuestionnaires} ativos`,
              isPositive: true
            }}
          />
        </Col>
      </Row>

      <Tabs
        defaultActiveKey="1"
        className="mb-8"
        tabBarStyle={{ marginBottom: 24 }}
      >
        <TabPane tab="Visão Geral" key="1">
          <Row gutter={[24, 24]}>
            <Col span={24}>
              <div className="flex items-center justify-between">
                <Title level={5} className="mb-0 font-medium text-gray-700">
                  Sessões Recentes
                </Title>
                <Button
                  type="link"
                  size="small"
                  className="text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1"
                  icon={<TrendingUp size={14} />}
                >
                  Ver todas
                </Button>
              </div>
            </Col>

            {sessions && sessions.length > 0 ? (
              sessions.slice(0, 4).map((session) => (
                <Col xs={24} sm={12} md={8} lg={6} key={session.id}>
                  <SessionCard
                    title={session.title}
                    participants={session.sessionUsers?.length ?? 0}
                    questions={session.questions?.length ?? 0}
                  />
                </Col>
              ))
            ) : (
              <Col span={24}>
                <Empty
                  description="Nenhuma sessão encontrada"
                  className="my-8"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              </Col>
            )}

            <Col span={24} className="mt-8">
              <div className="flex items-center justify-between">
                <Title level={5} className="mb-0 font-medium text-gray-700">
                  Questionários Recentes
                </Title>
                <Button
                  type="link"
                  size="small"
                  className="text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1"
                  icon={<TrendingUp size={14} />}
                >
                  Ver todos
                </Button>
              </div>
            </Col>

            {questionnaires ? (
              questionnaires.map((questionnaire) => (
                <Col xs={24} sm={12} md={8} key={questionnaire.id}>
                  <QuestionnaireCard questionnaire={questionnaire} />
                </Col>
              ))
            ) : (
              <Col span={24}>
                <Empty
                  description="Nenhum questionário encontrado"
                  className="my-8"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              </Col>
            )}
          </Row>
        </TabPane>
      </Tabs>

      <CreateSessionModal
        visible={sessionModal.isVisible}
        onClose={sessionModal.close}
      />
      <CreateQuestionnaireModal
        visible={questionnaireModal.isVisible}
        onClose={questionnaireModal.close}
        onSuccess={refetch}
        bankQuestions={bankQuestions ?? []}
      />
      <CreateBankQuestionModal
        visible={bankQuestionModal.isVisible}
        onClose={bankQuestionModal.close}
        messageApi={messageApi}
      />
    </PageLayout>
  );
};

export default Dashboard;
