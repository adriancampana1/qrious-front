'use client';

import type React from 'react';
import { useState } from 'react';
import {
  Typography,
  Button,
  Input,
  Table,
  Card,
  Dropdown,
  Empty,
  Pagination,
  type TableProps
} from 'antd';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Calendar,
  User
} from 'lucide-react';
import { useModal } from '../../../shared/hooks/use-modal';
import { useGlobalMessage } from '../../../shared/hooks/use-message';
import { questionnaireHooks } from '../hooks/use-questionnaire';
import { bankQuestionHooks } from '../../bank-question/hooks/use-bank-question';
import type { Questionnaire } from '../interfaces/questionnaire';
import PageLayout from '../../../shared/components/page-layout';
import CreateQuestionnaireModal from '../modal/create-questionnaire.modal';
import EditQuestionnaireModal from '../modal/edit-questionnaire.modal';
import { questionnaireService } from '../services/questionnaire.service';
import ConfirmationModal from '../../../shared/modal/delete-confirmation.modal';

const { Title, Text } = Typography;

const QuestionnairesPage: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedQuestionnaire, setSelectedQuestionnaire] =
    useState<Questionnaire | null>(null);
  const createQuestionnaireModal = useModal();
  const editQuestionnaireModal = useModal();
  const deleteModal = useModal();
  const messageApi = useGlobalMessage();

  const {
    data: questionnaires,
    isLoading,
    refetch
  } = questionnaireHooks.useGetAll();

  const { data: bankQuestions } = bankQuestionHooks.usePaginated({
    params: {
      page: 1,
      limit: 100
    }
  });

  const handleEditQuestionnaire = (questionnaire: Questionnaire) => {
    setSelectedQuestionnaire(questionnaire);
    editQuestionnaireModal.open();
  };

  const handleDeleteModal = (questionnaire: Questionnaire) => {
    setSelectedQuestionnaire(questionnaire);
    deleteModal.open();
  };

  const handleDeleteQuestionnaire = async () => {
    if (!selectedQuestionnaire) return;

    await questionnaireService.deleteQuestionnaire(
      Number(selectedQuestionnaire.id)
    );
  };

  const filteredQuestionnaires =
    questionnaires?.filter(
      (questionnaire) =>
        questionnaire.title.toLowerCase().includes(searchText.toLowerCase()) ||
        questionnaire.theme.toLowerCase().includes(searchText.toLowerCase()) ||
        questionnaire.description
          .toLowerCase()
          .includes(searchText.toLowerCase())
    ) || [];

  const paginatedQuestionnaires = filteredQuestionnaires.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const columns: TableProps<Questionnaire>['columns'] = [
    {
      title: 'Título',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <div className="max-w-xl">
          <div className="flex items-center gap-2 mb-1">
            <Text className="text-gray-800 font-medium">{text}</Text>
          </div>
          <Text className="text-gray-600 text-sm line-clamp-2">
            {record.description}
          </Text>
          <div className="mt-2 flex gap-2">
            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
              {record.theme}
            </span>
            <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">
              {record.numQuestions} questões
            </span>
            {record.timeLimitMinutes && (
              <span className="text-xs px-2 py-0.5 bg-yellow-50 text-yellow-600 rounded-full">
                {record.timeLimitMinutes} minutos
              </span>
            )}
          </div>
        </div>
      )
    },
    {
      title: 'Criado por',
      dataIndex: 'createdBy',
      key: 'createdBy',
      render: (createdBy) => (
        <div className="flex items-center">
          <User className="w-4 h-4 mr-2 text-gray-500" />
          <span>{createdBy?.name || '—'}</span>
        </div>
      )
    },
    {
      title: 'Data de Criação',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => (
        <div className="flex items-center">
          <Calendar className="w-4 h-4 mr-2 text-gray-500" />
          <span>{date ? new Date(date).toLocaleDateString('pt-BR') : '—'}</span>
        </div>
      )
    },
    {
      title: 'Configurações',
      key: 'settings',
      render: (_, record) => (
        <div className="flex flex-col items-start gap-1">
          <div className="flex items-center">
            <span className="text-xs text-gray-500 mr-2">
              Mostrar respostas:
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                record.showAnswersAfterSubmission
                  ? 'bg-green-50 text-green-600'
                  : 'bg-red-50 text-red-600'
              }`}
            >
              {record.showAnswersAfterSubmission ? 'Sim' : 'Não'}
            </span>
          </div>
          {record.timeLimitMinutes && (
            <div className="flex items-center">
              <span className="text-xs text-gray-500 mr-2">Tempo limite:</span>
              <span className="text-xs px-2 py-0.5 bg-yellow-50 text-yellow-600 rounded-full">
                {record.timeLimitMinutes} min
              </span>
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'view',
                label: 'Visualizar',
                icon: <Eye className="w-4 h-4" />,
                onClick: () => console.log('View questionnaire', record.id)
              },
              {
                key: 'edit',
                label: 'Editar',
                icon: <Edit className="w-4 h-4" />,
                onClick: () => handleEditQuestionnaire(record)
              },
              {
                key: 'delete',
                label: 'Excluir',
                icon: <Trash2 className="w-4 h-4" />,
                danger: true,
                onClick: () => handleDeleteModal(record)
              }
            ]
          }}
          trigger={['click']}
          placement="bottomRight"
        >
          <Button
            type="text"
            icon={<MoreHorizontal className="w-4 h-4" />}
            className="flex items-center justify-center"
          />
        </Dropdown>
      )
    }
  ];

  return (
    <PageLayout>
      <div className="mb-6">
        <Title level={3} className="mb-1 font-medium text-gray-800">
          Questionários
        </Title>
        <Text className="text-gray-500">
          Gerencie todos os questionários disponíveis no sistema
        </Text>
      </div>

      <Card className="mb-6 border border-gray-100 rounded-lg shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <Input
            placeholder="Buscar questionários..."
            prefix={<Search className="w-4 h-4 text-gray-400" />}
            className="max-w-md"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <div className="flex gap-3">
            <Button
              icon={<Filter className="w-4 h-4" />}
              className="border-gray-200 hover:border-gray-300 hover:text-gray-700"
            >
              Filtros
            </Button>
            <Button
              type="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={createQuestionnaireModal.open}
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
            <Table
              dataSource={paginatedQuestionnaires}
              columns={columns}
              rowKey="id"
              loading={isLoading}
              pagination={false}
              className="mb-4"
            />
            <div className="flex justify-end">
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
        visible={createQuestionnaireModal.isVisible}
        onClose={createQuestionnaireModal.close}
        messageApi={messageApi}
        onSuccess={refetch}
        bankQuestions={bankQuestions}
      />

      <EditQuestionnaireModal
        visible={editQuestionnaireModal.isVisible}
        onClose={editQuestionnaireModal.close}
        messageApi={messageApi}
        onSuccess={refetch}
        bankQuestions={bankQuestions}
        questionnaire={selectedQuestionnaire}
      />

      <ConfirmationModal
        visible={deleteModal.isVisible}
        onClose={deleteModal.close}
        title="Excluir Sessão"
        description="Tem certeza que deseja excluir este questionário? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={handleDeleteQuestionnaire}
        messageApi={messageApi}
        successMessage="Questionário excluído com sucesso!"
        errorMessage="Erro ao excluir questionário. Tente novamente."
        refetch={refetch}
        danger={true}
      />
    </PageLayout>
  );
};

export default QuestionnairesPage;
