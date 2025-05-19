import type React from 'react';
import { useState } from 'react';
import {
  Typography,
  Card,
  Button,
  Input,
  Avatar,
  Tag,
  Empty,
  Spin,
  message
} from 'antd';
import {
  ArrowLeft,
  ThumbsUp,
  MessageCircle,
  User,
  Calendar,
  Send
} from 'lucide-react';
import { questionService } from '../services/question.service';
import { answerService } from '../services/answer.service';
import { useNavigate, useParams } from 'react-router';
import { useGetAllAnswersByQuestionId } from '../hooks/use-answer';
import { useAuth } from '../../auth/hooks/use-auth';
import PageLayout from '../../../shared/components/page-layout';
import { useGetQuestionById } from '../hooks/use-question';
import { useLayoutLoading } from '../../../shared/hooks/use-layout';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const QuestionDetailPage: React.FC = () => {
  const { sessionId, questionId } = useParams<{
    sessionId: string;
    questionId: string;
  }>();
  const navigate = useNavigate();
  const [newAnswer, setNewAnswer] = useState('');
  const { isLoading, setLoading } = useLayoutLoading();
  const [isVoting, setIsVoting] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const [localVoteCount, setLocalVoteCount] = useState<number | null>(null);
  const [localHasVoted, setLocalHasVoted] = useState<boolean | null>(null);

  const { user } = useAuth();

  const { data: question, isLoading: isLoadingQuestion } = useGetQuestionById(
    Number(sessionId),
    Number(questionId)
  );
  const {
    data: answers,
    isLoading: isLoadingAnswers,
    refetch: refetchAnswers
  } = useGetAllAnswersByQuestionId(Number(questionId));

  if (question && localVoteCount === null) {
    setLocalVoteCount(question.voteCount || 0);
  }

  if (question && localHasVoted === null && user !== null) {
    setLocalHasVoted(
      question.votes?.some((vote) => vote.userId === user.id) || false
    );
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleVote = async () => {
    if (isVoting) return;

    setIsVoting(true);

    try {
      const response = await questionService.voteQuestion(
        Number(sessionId),
        Number(questionId)
      );

      if (response) {
        messageApi.success(
          `Voto ${localHasVoted ? 'removido' : 'registrado'} com sucesso`
        );

        if (localHasVoted) {
          setLocalVoteCount((prev) => (prev !== null ? prev - 1 : 0));
        } else {
          setLocalVoteCount((prev) => (prev !== null ? prev + 1 : 1));
        }

        setLocalHasVoted(!localHasVoted);
      }
    } catch (error) {
      console.error('Erro ao votar:', error);
      messageApi.error('Erro ao votar. Tente novamente.');
    } finally {
      setIsVoting(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!newAnswer.trim()) {
      messageApi.error('Por favor, digite uma resposta');
      return;
    }

    setLoading(true);

    try {
      const answerData = { content: newAnswer };
      const response = await answerService.createAnswer(
        Number(questionId),
        answerData
      );

      if (response) {
        messageApi.success('Resposta enviada com sucesso');
        setNewAnswer('');
        refetchAnswers();
      }
    } catch (error) {
      console.error('Erro ao enviar resposta:', error);
      messageApi.error('Erro ao enviar resposta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(`/sessoes/sessao/${sessionId}`);
  };

  if (isLoadingQuestion) {
    return (
      <PageLayout>
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      </PageLayout>
    );
  }

  if (!question) {
    return (
      <PageLayout>
        <Empty
          description="Pergunta não encontrada"
          className="my-16"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      {contextHolder}
      <Button
        icon={<ArrowLeft className="w-4 h-4" />}
        onClick={handleBack}
        className="mb-6 border-gray-200 hover:border-gray-300 hover:text-gray-700"
      >
        Voltar para a sessão
      </Button>

      <Card className="border border-gray-100 rounded-lg shadow-sm mb-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between">
            <div>
              <Title level={4} className="mb-1 font-medium text-gray-800">
                {question.title}
              </Title>

              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(question.createdAt)}
                </div>

                <div className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  {question.anonymous
                    ? 'Anônimo'
                    : question.user?.name || 'Usuário'}
                </div>
              </div>
            </div>

            <Button
              type={localHasVoted ? 'primary' : 'default'}
              icon={
                <ThumbsUp
                  className={`w-4 h-4 ${localHasVoted ? 'text-white' : ''}`}
                />
              }
              onClick={handleVote}
              loading={isVoting}
              className={`flex items-center gap-2 ${
                localHasVoted
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 border-0 shadow-sm hover:opacity-90'
                  : 'border-gray-200 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              {localVoteCount !== null
                ? localVoteCount
                : question.voteCount || 0}
            </Button>
          </div>

          {question.description && (
            <Paragraph className="text-gray-700 whitespace-pre-line">
              {question.description}
            </Paragraph>
          )}

          <div className="flex items-center gap-2">
            <Tag color={question.status === 'open' ? 'success' : 'default'}>
              {question.status === 'open' ? 'Aberta' : 'Fechada'}
            </Tag>

            {question.anonymous && <Tag color="blue">Anônima</Tag>}
          </div>
        </div>
      </Card>

      <div className="my-6">
        <Title
          level={5}
          className="font-medium text-gray-700 mb-4! flex items-center gap-2"
        >
          <MessageCircle className="w-5 h-5" />
          Respostas ({answers?.length || 0})
        </Title>

        {isLoadingAnswers ? (
          <div className="flex justify-center items-center h-32">
            <Spin />
          </div>
        ) : answers && answers.length > 0 ? (
          <div className="flex flex-col gap-4">
            {answers.map((answer) => (
              <Card
                key={answer.id}
                className="border border-gray-100 rounded-lg shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <Avatar className="bg-gradient-to-r from-teal-500 to-cyan-500">
                    {answer.user?.name?.charAt(0) || 'U'}
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <Text className="font-medium">
                        {answer.user?.name || 'Usuário'}
                      </Text>
                      <Text className="text-xs text-gray-500">
                        {formatDate(answer.createdAt)}
                      </Text>
                    </div>

                    <Paragraph className="text-gray-700 whitespace-pre-line mb-0">
                      {answer.content}
                    </Paragraph>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Empty
            description="Nenhuma resposta para esta pergunta ainda"
            className="my-8"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
      </div>

      <Card className="border border-gray-100 rounded-lg shadow-sm">
        <Title level={5} className="font-medium text-gray-700 mb-4">
          Sua resposta
        </Title>

        <div className="flex flex-col gap-4">
          <TextArea
            rows={4}
            placeholder="Digite sua resposta..."
            value={newAnswer}
            onChange={(e) => setNewAnswer(e.target.value)}
            className="resize-none"
          />

          <div className="flex justify-end">
            <Button
              type="primary"
              icon={<Send className="w-4 h-4" />}
              onClick={handleSubmitAnswer}
              loading={isLoading}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 border-0 shadow-sm hover:opacity-90"
            >
              Enviar Resposta
            </Button>
          </div>
        </div>
      </Card>
    </PageLayout>
  );
};

export default QuestionDetailPage;
