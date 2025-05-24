import { Alert, Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import TakeQuestionnaire from '../components/take-questionnaire';
import { useGlobalMessage } from '../../../shared/hooks/use-message';
import { useNavigate, useParams } from 'react-router';
import { useAuth } from '../../auth/hooks/use-auth';

const QuestionnaireTakePage = () => {
  const params = useParams();
  const navigate = useNavigate();
  const messageApi = useGlobalMessage();
  const { user } = useAuth();

  const questionnaireId = Number(params.id);

  const handleBack = () => {
    navigate(
      user?.role === 'admin' || user?.role === 'teacher'
        ? '/questionarios/gerenciar'
        : '/questionarios/meus'
    );
  };

  if (!questionnaireId || isNaN(questionnaireId)) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert
          message="Erro"
          description="ID do questionário inválido"
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4">
        <Button icon={<ArrowLeftOutlined />} onClick={handleBack} type="text">
          Voltar
        </Button>
      </div>

      <TakeQuestionnaire
        questionnaireId={questionnaireId}
        onComplete={handleBack}
        messageApi={messageApi}
      />
    </div>
  );
};

export default QuestionnaireTakePage;
