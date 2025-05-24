import { Alert, Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import QuestionnaireResults from '../components/questionnaire-results';
import { useNavigate, useParams } from 'react-router';
import { useAuth } from '../../auth/hooks/use-auth';

const QuestionnaireResultsPage = () => {
  const params = useParams();
  const navigate = useNavigate();
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
          Voltar aos Questionários
        </Button>
      </div>

      <QuestionnaireResults questionnaireId={questionnaireId} />
    </div>
  );
};

export default QuestionnaireResultsPage;
