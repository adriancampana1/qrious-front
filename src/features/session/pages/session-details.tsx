import type React from 'react';
import { useState } from 'react';
import {
  Typography,
  Card,
  Button,
  Input,
  Tag,
  Switch,
  Empty,
  Spin,
  message
} from 'antd';
import {
  Clock,
  Calendar,
  User,
  Users,
  Plus,
  SearchIcon,
  SortAsc,
  SortDesc,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import { useModal } from '../../../shared/hooks/use-modal';
import { useGetSessionById } from '../hooks/use-session';
import PageLayout from '../../../shared/components/page-layout';
import CreateQuestionModal from '../modal/create-question.modal';
import QuestionCard from '../components/question-card';
import { useGetAllQuestionsBySessionId } from '../hooks/use-question';
import { questionService } from '../services/question.service';
import { useAuth } from '../../auth/hooks/use-auth';

const { Title, Text } = Typography;

const Search = SearchIcon;

const SessionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const sessionId = Number(id);

  const navigate = useNavigate();
  const createQuestionModal = useModal();

  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'votes'>('votes');
  const [showOnlyMine, setShowOnlyMine] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const { user } = useAuth();

  const { data: session, isLoading: isLoadingSession } =
    useGetSessionById(sessionId);
  const {
    data: questions,
    isLoading: isLoadingQuestions,
    refetch
  } = useGetAllQuestionsBySessionId(sessionId);

  const filteredQuestions = questions
    ? questions
        .filter((q) => {
          const matchesSearch =
            !searchText ||
            q.title.toLowerCase().includes(searchText.toLowerCase()) ||
            (q.description &&
              q.description.toLowerCase().includes(searchText.toLowerCase()));

          const matchesMine = !showOnlyMine || q.userId === user!.id;

          return matchesSearch && matchesMine;
        })
        .sort((a, b) => {
          if (sortBy === 'votes') {
            return b.voteCount - a.voteCount;
          } else {
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          }
        })
    : [];

  const isSessionActive = session
    ? new Date(session.activeFrom) <= new Date() &&
      new Date(session.activeTo) >= new Date()
    : false;

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleQuestionClick = (questionId: number) => {
    navigate(`/sessoes/sessao/${sessionId}/perguntas/${questionId}`);
  };

  const handleVote = async (questionId: number): Promise<boolean> => {
    try {
      const voteQuestionResponse = await questionService.voteQuestion(
        Number(sessionId),
        Number(questionId)
      );

      if (voteQuestionResponse) {
        messageApi.success('Voto registrado com sucesso');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Erro ao votar:', error);
      messageApi.error('Erro ao votar. Tente novamente.');
      return false;
    }
  };

  if (isLoadingSession) {
    return (
      <PageLayout>
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      </PageLayout>
    );
  }

  if (!session) {
    return (
      <PageLayout>
        <Empty
          description="Sessão não encontrada"
          className="my-16"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </PageLayout>
    );
  }

  const handleBack = () => {
    navigate(`/sessoes/lista`);
  };

  return (
    <PageLayout>
      {contextHolder}
      <Button
        icon={<ArrowLeft className="w-4 h-4" />}
        onClick={handleBack}
        className="mb-6 border-gray-200 hover:border-gray-300 hover:text-gray-700"
      >
        Voltar para sessões
      </Button>
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <Title level={3} className="mb-1 font-medium text-gray-800">
              {session.title}
            </Title>
            <Text className="text-gray-500">{session.description}</Text>
          </div>

          <Tag
            color={isSessionActive ? 'success' : 'default'}
            className="flex! justify-center items-center gap-1 px-3! py-2! text-sm"
          >
            <Clock className="w-3.5 h-3.5" />
            {isSessionActive ? 'Sessão ativa' : 'Sessão inativa'}
          </Tag>
        </div>

        <Card className="border border-gray-100 rounded-lg shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-500" />
              <div>
                <Text className="text-gray-500 text-sm block">Período</Text>
                <Text className="font-medium">
                  {formatDate(session.activeFrom)} -{' '}
                  {formatDate(session.activeTo)}
                </Text>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-500" />
              <div>
                <Text className="text-gray-500 text-sm block">Criado por</Text>
                <Text className="font-medium">
                  {session.createdBy?.name || '—'}
                </Text>
              </div>
            </div>

            <div
              className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
              onClick={() =>
                navigate(`/sessoes/sessao/${sessionId}/participantes`)
              }
            >
              <Users className="w-5 h-5 text-gray-500" />
              <div>
                <Text className="text-gray-500 text-sm block">
                  Participantes
                </Text>
                <div className="flex items-center gap-2">
                  <Text className="font-medium text-blue-600">
                    {session.sessionUsers?.length || 0}
                  </Text>
                  <ArrowRight className="w-3 h-3 text-blue-600" />
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="border border-gray-100 rounded-lg shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <Input
            placeholder="Buscar perguntas..."
            allowClear
            onChange={(e) => setSearchText(e.target.value)}
            className="max-w-md"
            suffix={<Search className="w-4 h-4" />}
          />

          <div className="flex flex-wrap gap-3">
            <Button
              icon={
                sortBy === 'votes' ? (
                  <SortDesc className="w-4 h-4" />
                ) : (
                  <SortAsc className="w-4 h-4" />
                )
              }
              onClick={() => setSortBy(sortBy === 'votes' ? 'recent' : 'votes')}
              className="border-gray-200 hover:border-gray-300 hover:text-gray-700"
            >
              {sortBy === 'votes' ? 'Mais votadas' : 'Mais recentes'}
            </Button>

            <div className="flex items-center gap-2">
              <Switch
                size="small"
                checked={showOnlyMine}
                onChange={setShowOnlyMine}
              />
              <Text className="text-sm">Apenas minhas perguntas</Text>
            </div>

            <Button
              icon={<Users className="w-4 h-4" />}
              onClick={() =>
                navigate(`/sessoes/sessao/${sessionId}/participantes`)
              }
              className="border-gray-200 hover:border-gray-300 hover:text-gray-700"
            >
              Gerenciar Participantes
            </Button>

            <Button
              type="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={createQuestionModal.open}
              disabled={!isSessionActive}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 border-0 shadow-sm hover:opacity-90"
            >
              Nova Pergunta
            </Button>
          </div>
        </div>
      </Card>

      <div className="flex flex-col gap-4">
        <Title level={5} className="font-medium text-gray-700 mt-8">
          Perguntas ({filteredQuestions.length})
        </Title>

        {isLoadingQuestions ? (
          <div className="flex justify-center items-center h-64">
            <Spin size="large" />
          </div>
        ) : filteredQuestions.length > 0 ? (
          <div className="flex flex-col gap-4">
            {filteredQuestions.map((question) => (
              <QuestionCard
                key={question.id}
                question={question}
                currentUserId={user!.id}
                onVote={handleVote}
                onClick={() => handleQuestionClick(question.id)}
              />
            ))}
          </div>
        ) : (
          <Empty
            description={
              searchText
                ? 'Nenhuma pergunta encontrada para esta busca'
                : 'Nenhuma pergunta foi feita nesta sessão ainda'
            }
            className="my-8"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
      </div>

      <CreateQuestionModal
        visible={createQuestionModal.isVisible}
        onClose={createQuestionModal.close}
        sessionId={sessionId}
        messageApi={messageApi}
        refetch={refetch}
      />
    </PageLayout>
  );
};

export default SessionDetailPage;
