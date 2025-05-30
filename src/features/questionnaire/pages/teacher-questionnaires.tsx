import { useState } from 'react';
import { Typography, Card, Button } from 'antd';
import { BookOpen, Plus, BarChart3 } from 'lucide-react';
import { questionnaireHooks } from '../hooks/use-questionnaire';
import { bankQuestionHooks } from '../../bank-question/hooks/use-bank-question';
import { useModal } from '../../../shared/hooks/use-modal';
import { useGlobalMessage } from '../../../shared/hooks/use-message';
import PageLayout from '../../../shared/components/page-layout';
import QuestionnaireGrid from '../components/questionnaire-grid';
import CreateQuestionnaireModal from '../modal/create-questionnaire.modal';
import EditQuestionnaireModal from '../modal/edit-questionnaire.modal';
import GenerateQuestionnaireModal from '../modal/generate-questionnaire.modal';
import type { Questionnaire } from '../interfaces/questionnaire';
import { useGetAllSessions } from '../../session/hooks/use-session';

const { Title, Text } = Typography;

const TeacherQuestionnairesPage = () => {
  const [selectedQuestionnaire, setSelectedQuestionnaire] =
    useState<Questionnaire | null>(null);

  const {
    data: questionnaires,
    isLoading,
    refetch
  } = questionnaireHooks.useGetAll();
  const { data: bankQuestions } = bankQuestionHooks.usePaginated({
    params: { page: 1, limit: 100 }
  });
  const { data: sessions } = useGetAllSessions();

  const createModal = useModal();
  const editModal = useModal();
  const generateModal = useModal();
  const messageApi = useGlobalMessage();

  const handleEdit = (id: number) => {
    const questionnaire = questionnaires?.find((q) => q.id === id);
    if (questionnaire) {
      setSelectedQuestionnaire(questionnaire);
      editModal.open();
    }
  };

  return (
    <PageLayout>
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="w-8 h-8 text-blue-600 shrink-0" />
              <Title
                level={2}
                className="mb-0 font-medium text-gray-800 whitespace-normal"
              >
                Gerenciar Questionários
              </Title>
            </div>
            <Text className="text-gray-500">
              Crie, edite e acompanhe o desempenho dos seus questionários
            </Text>
          </div>

          <div className="flex flex-wrap gap-3 self-start">
            <Button
              type="dashed"
              icon={<BarChart3 className="w-4 h-4" />}
              onClick={generateModal.open}
              className="whitespace-nowrap"
            >
              <span className="hidden sm:inline">Gerar por Tema</span>
              <span className="sm:hidden">Gerar</span>
            </Button>
            <Button
              type="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={createModal.open}
              className="whitespace-nowrap"
            >
              <span className="hidden sm:inline">Novo Questionário</span>
              <span className="sm:hidden">Novo</span>
            </Button>
          </div>
        </div>
      </div>

      <Card className="border border-gray-100 rounded-lg shadow-sm">
        <QuestionnaireGrid
          questionnaires={questionnaires || []}
          userRole="teacher"
          isLoading={isLoading}
          onEdit={handleEdit}
        />
      </Card>

      <CreateQuestionnaireModal
        visible={createModal.isVisible}
        onClose={createModal.close}
        messageApi={messageApi}
        onSuccess={refetch}
        bankQuestions={bankQuestions}
        sessions={sessions || []}
      />

      <EditQuestionnaireModal
        visible={editModal.isVisible}
        onClose={editModal.close}
        messageApi={messageApi}
        onSuccess={refetch}
        bankQuestions={bankQuestions}
        questionnaire={selectedQuestionnaire}
      />

      <GenerateQuestionnaireModal
        visible={generateModal.isVisible}
        onClose={generateModal.close}
        messageApi={messageApi}
        sessions={sessions || []}
        onSuccess={refetch}
      />
    </PageLayout>
  );
};

export default TeacherQuestionnairesPage;
