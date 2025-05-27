import { Typography, Card } from 'antd';
import { BookOpen } from 'lucide-react';
import { useGetAvailableQuestionnaires } from '../hooks/use-questionnaire';
import PageLayout from '../../../shared/components/page-layout';
import QuestionnaireGrid from '../components/questionnaire-grid';

const { Title, Text } = Typography;

const StudentQuestionnairesPage = () => {
  const {
    data: questionnaires,
    isLoading,
    refetch
  } = useGetAvailableQuestionnaires();

  return (
    <PageLayout>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="w-8 h-8 text-blue-600" />
          <Title level={2} className="mb-0 font-medium text-gray-800">
            Meus Questionários
          </Title>
        </div>
        <Text className="text-gray-500">
          Visualize e responda os questionários disponíveis
        </Text>
      </div>

      <Card className="border border-gray-100 rounded-lg shadow-sm">
        <QuestionnaireGrid
          questionnaires={questionnaires || []}
          userRole="student"
          isLoading={isLoading}
          onRefresh={refetch}
        />
      </Card>
    </PageLayout>
  );
};

export default StudentQuestionnairesPage;
