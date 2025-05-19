import type React from 'react';
import { useState } from 'react';
import { Card, Button, Tag } from 'antd';
import { ThumbsUp, MessageCircle, User, Calendar } from 'lucide-react';
import type { Question } from '../interfaces/question';

interface QuestionCardProps {
  question: Question;
  currentUserId: number;
  onVote: (questionId: number) => Promise<boolean>;
  onClick: () => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  currentUserId,
  onVote,
  onClick
}) => {
  const [localVoteCount, setLocalVoteCount] = useState(question.voteCount || 0);
  const [localHasVoted, setLocalHasVoted] = useState(
    question.votes?.some((vote) => vote.userId === currentUserId)
  );
  const [isVoting, setIsVoting] = useState(false);

  const {
    id,
    title,
    description,
    anonymous,
    status,
    createdAt,
    user,
    answers
  } = question;

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit'
    });
  };

  const handleVoteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isVoting) return;

    setIsVoting(true);

    try {
      const success = await onVote(id);

      if (success) {
        if (localHasVoted) {
          setLocalVoteCount((prev) => prev - 1);
        } else {
          setLocalVoteCount((prev) => prev + 1);
        }

        setLocalHasVoted(!localHasVoted);
      }
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <Card
      className="border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-base font-medium mb-1 text-gray-800">
              {title}
            </h3>

            {description && (
              <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                {description}
              </p>
            )}

            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(createdAt)}
              </div>

              <div className="flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                {anonymous ? 'Anônimo' : user?.name || 'Usuário'}
              </div>

              <div className="flex items-center gap-1">
                <MessageCircle className="w-3.5 h-3.5" />
                {answers?.length || 0} respostas
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
            onClick={handleVoteClick}
            loading={isVoting}
            className={`flex items-center gap-2 ${
              localHasVoted
                ? 'bg-gradient-to-r from-teal-500 to-cyan-500 border-0 shadow-sm hover:opacity-90'
                : 'border-gray-200 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            {localVoteCount}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Tag color={status === 'open' ? 'success' : 'default'}>
            {status === 'open' ? 'Aberta' : 'Fechada'}
          </Tag>

          {anonymous && <Tag color="blue">Anônima</Tag>}
        </div>
      </div>
    </Card>
  );
};

export default QuestionCard;
