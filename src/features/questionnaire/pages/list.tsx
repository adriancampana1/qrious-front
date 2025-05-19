import type React from 'react';
import { useState } from 'react';
import {
  Typography,
  Button,
  Input,
  Row,
  Col,
  Card,
  Empty,
  Pagination,
  Select,
  Segmented
} from 'antd';
import { Plus, Search, Filter, Grid, List } from 'lucide-react';
import { useModal } from '../../../shared/hooks/use-modal';
import { useGetAllQuestionnaires } from '../hooks/use-questionnaire';
import { bankQuestionHooks } from '../../bank-question/hooks/use-bank-question';
import PageLayout from '../../../shared/components/page-layout';
import QuestionnaireCard from '../components/questionnaire-card';
import CreateQuestionnaireModal from '../modal/create-questionnaire.modal';

const { Title, Text } = Typography;
const { Option } = Select;

const QuestionnairesPage: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [viewMode, setViewMode] = useState<string | number>('grid');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const questionnaireModal = useModal();
  const { data: questionnaires, refetch } = useGetAllQuestionnaires();
  const { data: bankQuestions } = bankQuestionHooks.usePaginated({
    params: {
      page: 1,
      limit: 100
    }
  });

  const filteredQuestionnaires =
    questionnaires?.filter((questionnaire) => {
      const matchesSearch =
        questionnaire.title.toLowerCase().includes(searchText.toLowerCase()) ||
        questionnaire.theme.toLowerCase().includes(searchText.toLowerCase()) ||
        (questionnaire.description &&
          questionnaire.description
            .toLowerCase()
            .includes(searchText.toLowerCase()));

      return matchesSearch;
    }) || [];

  const paginatedQuestionnaires = filteredQuestionnaires.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleViewQuestionnaire = (id: number) => {
    console.log('View questionnaire', id);
  };

  const handleEditQuestionnaire = (id: number) => {
    console.log('Edit questionnaire', id);
  };

  return (
    <PageLayout>
      <div className="mb-6">
        <Title level={3} className="mb-1 font-medium text-gray-800">
          Questionários
        </Title>
        <Text className="text-gray-500">
          Gerencie todos os questionários do sistema
        </Text>
      </div>

      <Card className="mb-6 border border-gray-100 rounded-lg shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <Input
              placeholder="Buscar questionários..."
              prefix={<Search className="w-4 h-4 text-gray-400" />}
              className="max-w-md"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <Select
              placeholder="Status"
              className="min-w-[150px]"
              value={statusFilter}
              onChange={setStatusFilter}
            >
              <Option value="all">Todos</Option>
              <Option value="active">Ativos</Option>
              <Option value="ended">Finalizados</Option>
              <Option value="draft">Rascunhos</Option>
            </Select>
          </div>
          <div className="flex gap-3 items-center">
            <Segmented
              options={[
                {
                  value: 'grid',
                  icon: <Grid className="w-4 h-4" />
                },
                {
                  value: 'list',
                  icon: <List className="w-4 h-4" />
                }
              ]}
              value={viewMode}
              onChange={setViewMode}
            />
            <Button
              icon={<Filter className="w-4 h-4" />}
              className="border-gray-200 hover:border-gray-300 hover:text-gray-700"
            >
              Filtros
            </Button>
            <Button
              type="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={questionnaireModal.open}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 border-0 shadow-sm hover:opacity-90"
            >
              Novo Questionário
            </Button>
          </div>
        </div>
      </Card>

      <Card className="border border-gray-100 rounded-lg shadow-sm">
        {filteredQuestionnaires.length > 0 ? (
          <>
            {viewMode === 'grid' ? (
              <Row gutter={[24, 24]}>
                {paginatedQuestionnaires.map((questionnaire) => (
                  <Col xs={24} sm={12} md={8} lg={6} key={questionnaire.id}>
                    <QuestionnaireCard
                      questionnaire={questionnaire}
                      onView={handleViewQuestionnaire}
                      onEdit={handleEditQuestionnaire}
                    />
                  </Col>
                ))}
              </Row>
            ) : (
              <div className="flex flex-col gap-4">
                {paginatedQuestionnaires.map((questionnaire) => (
                  <Card
                    key={questionnaire.id}
                    className="border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <Title level={5} className="mb-1">
                          {questionnaire.title}
                        </Title>
                        <Text className="text-gray-500 block mb-2">
                          {questionnaire.theme}
                        </Text>
                        {questionnaire.description && (
                          <Text className="text-gray-600 text-sm line-clamp-2">
                            {questionnaire.description}
                          </Text>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col items-end">
                          <Text className="text-gray-500 text-sm">
                            {questionnaire.numQuestions ||
                              questionnaire.items?.length ||
                              0}{' '}
                            questões
                          </Text>
                          <Text className="text-gray-500 text-sm">
                            Criado em{' '}
                            {new Date(
                              questionnaire.createdAt
                            ).toLocaleDateString('pt-BR')}
                          </Text>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="default"
                            onClick={() =>
                              handleViewQuestionnaire(questionnaire.id)
                            }
                          >
                            Ver
                          </Button>
                          <Button
                            type="primary"
                            onClick={() =>
                              handleEditQuestionnaire(questionnaire.id)
                            }
                            className="bg-gradient-to-r from-teal-500 to-cyan-500 border-0"
                          >
                            Editar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
            <div className="flex justify-end mt-6">
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={filteredQuestionnaires.length}
                onChange={(page) => setCurrentPage(page)}
                onShowSizeChange={(current, size) => {
                  setCurrentPage(1);
                  setPageSize(size);
                }}
                showSizeChanger
                showQuickJumper
              />
            </div>
          </>
        ) : (
          <Empty
            description={
              searchText
                ? 'Nenhum questionário encontrado para esta busca'
                : 'Nenhum questionário cadastrado'
            }
            className="my-8"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
      </Card>

      <CreateQuestionnaireModal
        visible={questionnaireModal.isVisible}
        onClose={questionnaireModal.close}
        onSuccess={refetch}
        bankQuestions={bankQuestions ?? []}
      />
    </PageLayout>
  );
};

export default QuestionnairesPage;
