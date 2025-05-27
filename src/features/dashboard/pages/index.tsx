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
import PageLayout from '../../../shared/components/page-layout';
import CreateSessionModal from '../../session/modal/create-session.modal';
import CreateQuestionnaireModal from '../../questionnaire/modal/create-questionnaire.modal';
import CreateBankQuestionModal from '../../bank-question/modal/create-bank-question.modal';
import { useModal } from '../../../shared/hooks/use-modal';
import { useGlobalMessage } from '../../../shared/hooks/use-message';
import { useGetSessionsByUserId } from '../../session/hooks/use-session';
import { useGetAvailableQuestionnaires } from '../../questionnaire/hooks/use-questionnaire';
import { bankQuestionHooks } from '../../bank-question/hooks/use-bank-question';
import { useGetAllUsers } from '../../auth/hooks/use-users';
import { useNavigate } from 'react-router';
import { useAuth } from '../../auth/hooks/use-auth';
import QuestionnaireCard from '../../questionnaire/components/questionnaire-card';
import { useState } from 'react';
import type { Questionnaire } from '../../questionnaire/interfaces/questionnaire';
import EditQuestionnaireModal from '../../questionnaire/modal/edit-questionnaire.modal';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const Dashboard: React.FC = () => {
  const sessionModal = useModal();
  const questionnaireModal = useModal();
  const bankQuestionModal = useModal();
  const editQuestionnaireModal = useModal();
  const messageApi = useGlobalMessage();
  const navigate = useNavigate();

  const { data: sessions } = useGetSessionsByUserId();
  const { data: questionnaires, refetch } = useGetAvailableQuestionnaires();
  const { data: bankQuestions } = bankQuestionHooks.usePaginated({
    params: {
      page: 1,
      limit: 20
    }
  });
  const { data: users } = useGetAllUsers();
  const { user } = useAuth();

  const [selectedQuestionnaire, setSelectedQuestionnaire] =
    useState<Questionnaire | null>(null);

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
    }
  ];

  const validateRole = (
    role: string | undefined
  ): 'admin' | 'teacher' | 'student' => {
    if (role === 'admin' || role === 'teacher' || role === 'student') {
      return role;
    }
    return 'student';
  };

  const handleEdit = (id: number) => {
    const questionnaire = questionnaires?.find((q) => q.id === id);
    if (questionnaire) {
      setSelectedQuestionnaire(questionnaire);
      editQuestionnaireModal.open();
    }
  };

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

      {(user?.role === 'admin' || user?.role === 'teacher') && (
        <Row gutter={[24, 24]} className="mb-8">
          <Col span={24}>
            <Card className="border border-gray-100 rounded-lg shadow-sm bg-gradient-to-r from-gray-50 to-white">
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
      )}

      {user?.role === 'admin' && (
        <Row gutter={[24, 24]} className="mb-8">
          <Col xs={24} sm={12} md={6}>
            <StatsCard
              title="Usuários"
              value={users?.length ?? 0}
              icon={<User className="w-5 h-5 text-teal-500" />}
              valueStyle={{ color: '#111827' }}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <StatsCard
              title="Sessões Criadas"
              value={sessions?.length ?? 0}
              icon={<Users className="w-5 h-5 text-cyan-500" />}
              valueStyle={{ color: '#111827' }}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <StatsCard
              title="Banco de Questões"
              value={bankQuestions?.length ?? 0}
              icon={<HelpCircle className="w-5 h-5 text-emerald-500" />}
              valueStyle={{ color: '#111827' }}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <StatsCard
              title="Questionários"
              value={questionnaires?.length ?? 0}
              icon={<FileText className="w-5 h-5 text-sky-500" />}
              valueStyle={{ color: '#111827' }}
            />
          </Col>
        </Row>
      )}

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
                  Sessões
                </Title>
                <div className="flex items-center gap-2">
                  <Button
                    type="link"
                    size="small"
                    className="text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1"
                    icon={<TrendingUp size={14} />}
                    onClick={() => navigate('/sessoes/lista')}
                  >
                    Ver todas
                  </Button>
                  <Button
                    icon={<Plus size={14} />}
                    type="primary"
                    onClick={() => navigate('/sessoes/entrar')}
                  >
                    Entrar em uma sessão
                  </Button>
                </div>
              </div>
            </Col>

            {sessions && sessions.length > 0 ? (
              sessions.slice(0, 4).map((session) => (
                <Col xs={24} sm={12} md={8} lg={6} key={session.id}>
                  <SessionCard
                    id={session.id}
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

            <Col span={24} className="mt-4">
              <div className="flex items-center justify-between">
                <Title level={5} className="mb-0 font-medium text-gray-700">
                  Questionários
                </Title>
                <Button
                  type="link"
                  size="small"
                  className="text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1"
                  icon={<TrendingUp size={14} />}
                  onClick={() =>
                    navigate(
                      user?.role === 'admin' || user?.role === 'teacher'
                        ? '/questionarios/gerenciar'
                        : '/questionarios/meus'
                    )
                  }
                >
                  Ver todos
                </Button>
              </div>
            </Col>

            {questionnaires && questionnaires.length > 0 ? (
              questionnaires.map((questionnaire) => (
                <Col xs={24} sm={12} md={8} key={questionnaire.id}>
                  <QuestionnaireCard
                    questionnaire={questionnaire}
                    userRole={validateRole(user?.role)}
                    messageApi={messageApi}
                    refetch={refetch}
                    onEdit={handleEdit}
                  />
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
        messageApi={messageApi}
      />
      <CreateQuestionnaireModal
        visible={questionnaireModal.isVisible}
        onClose={questionnaireModal.close}
        messageApi={messageApi}
        onSuccess={refetch}
        bankQuestions={bankQuestions ?? []}
        sessions={sessions ?? []}
      />
      <CreateBankQuestionModal
        visible={bankQuestionModal.isVisible}
        onClose={bankQuestionModal.close}
        messageApi={messageApi}
      />
      <EditQuestionnaireModal
        visible={editQuestionnaireModal.isVisible}
        onClose={editQuestionnaireModal.close}
        messageApi={messageApi}
        onSuccess={refetch}
        bankQuestions={bankQuestions}
        questionnaire={selectedQuestionnaire}
      />
    </PageLayout>
  );
};

export default Dashboard;
