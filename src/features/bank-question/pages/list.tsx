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
  MoreHorizontal,
  Edit,
  Trash2,
  Calendar,
  User
} from 'lucide-react';
import { useModal } from '../../../shared/hooks/use-modal';
import { useGlobalMessage } from '../../../shared/hooks/use-message';
import { bankQuestionHooks } from '../hooks/use-bank-question';
import type { BankQuestion } from '../interfaces/bank-question';
import PageLayout from '../../../shared/components/page-layout';
import CreateBankQuestionModal from '../modal/create-bank-question.modal';
import {
  BankQuestionDifficulty,
  BankQuestionType
} from '../types/bank-question.types';
import EditBankQuestionModal from '../dto/edit-bank-question.dto';
import ConfirmationModal from '../../../shared/modal/delete-confirmation.modal';
import { bankQuestionService } from '../services/bank-question.service';
import ImportQuestionsModal from '../modal/import-question.modal';

const { Title, Text } = Typography;

const BankQuestionsPage: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const bankQuestionModal = useModal();
  const bankQuestionImportModal = useModal();
  const editBankQuestionModal = useModal();
  const deleteModal = useModal();
  const messageApi = useGlobalMessage();

  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(
    null
  );

  const {
    data: bankQuestions,
    isLoading,
    refetch
  } = bankQuestionHooks.usePaginated({
    params: {
      page: 1,
      limit: 100
    }
  });

  const filteredQuestions =
    bankQuestions?.filter(
      (question) =>
        question.content.toLowerCase().includes(searchText.toLowerCase()) ||
        question.theme.toLowerCase().includes(searchText.toLowerCase()) ||
        (question.type === BankQuestionType.ESSAY &&
          searchText.toLowerCase().includes('dissertativa')) ||
        (question.type === BankQuestionType.SINGLE &&
          searchText.toLowerCase().includes('única')) ||
        (question.type === BankQuestionType.MULTIPLE &&
          searchText.toLowerCase().includes('múltipla'))
    ) || [];

  const paginatedQuestions = filteredQuestions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const columns: TableProps<BankQuestion>['columns'] = [
    {
      title: 'Conteúdo',
      dataIndex: 'content',
      key: 'content',
      render: (text, record) => (
        <div className="max-w-xl">
          <div className="flex items-center gap-2 mb-1">
            <Text className="text-gray-800 line-clamp-2 flex-1">{text}</Text>
          </div>

          {record.type !== BankQuestionType.ESSAY &&
          record.options &&
          record.options.length > 0 ? (
            <div className="mt-2 pl-2 border-l-2 border-gray-200">
              <Text className="text-xs text-gray-500 mb-1 block">
                {record.options.length} alternativa
                {record.options.length !== 1 ? 's' : ''}
                {record.type === BankQuestionType.SINGLE
                  ? ' (resposta única)'
                  : ' (múltipla escolha)'}
              </Text>
              <div className="space-y-1 max-h-20 overflow-y-auto pr-2">
                {record.options.map((option, index) => (
                  <div key={index} className="flex items-start gap-1.5">
                    <div
                      className={`min-w-4 h-4 rounded-full flex items-center justify-center text-xs ${
                        option.isCorrect
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {record.type === BankQuestionType.SINGLE ? '○' : '□'}
                    </div>
                    <Text
                      className="text-xs text-gray-700 line-clamp-1"
                      style={{ fontWeight: option.isCorrect ? 500 : 400 }}
                    >
                      {option.content}
                    </Text>
                    {option.isCorrect && (
                      <span className="text-xs text-green-600">✓</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : record.type !== BankQuestionType.ESSAY ? (
            <Text className="text-xs text-gray-500 italic mt-1 block">
              Sem alternativas cadastradas
            </Text>
          ) : null}

          <div className="mt-2 flex gap-2">
            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
              {record.theme}
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                record.difficulty === BankQuestionDifficulty.EASY
                  ? 'bg-green-50 text-green-600'
                  : record.difficulty === BankQuestionDifficulty.MEDIUM
                  ? 'bg-yellow-50 text-yellow-600'
                  : 'bg-red-50 text-red-600'
              }`}
            >
              {record.difficulty === BankQuestionDifficulty.EASY
                ? 'Fácil'
                : record.difficulty === BankQuestionDifficulty.MEDIUM
                ? 'Médio'
                : 'Difícil'}
            </span>
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
      title: 'Tipo',
      key: 'type',
      render: (_, record) => (
        <div className="flex flex-col items-start">
          <div
            className={`px-2 py-1 rounded-md text-sm ${
              record.type === BankQuestionType.ESSAY
                ? 'bg-blue-50 text-blue-700'
                : record.type === BankQuestionType.SINGLE
                ? 'bg-green-50 text-green-700'
                : 'bg-purple-50 text-purple-700'
            }`}
          >
            {record.type === BankQuestionType.ESSAY
              ? 'Dissertativa'
              : record.type === BankQuestionType.SINGLE
              ? 'Resposta Única'
              : 'Múltipla Escolha'}
          </div>

          {record.type !== BankQuestionType.ESSAY && (
            <div className="mt-1 text-xs text-gray-500">
              {record._count?.options || 0} alternativa
              {(record._count?.options || 0) !== 1 ? 's' : ''}
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
                key: 'edit',
                label: 'Editar',
                icon: <Edit className="w-4 h-4" />,
                onClick: () => handleEditQuestion(record.id.toString())
              },
              {
                key: 'delete',
                label: 'Excluir',
                icon: <Trash2 className="w-4 h-4" />,
                danger: true,
                onClick: () => handleDeleteModal(record.id.toString())
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

  const handleEditQuestion = (questionId: string) => {
    setSelectedQuestionId(questionId);
    editBankQuestionModal.open();
  };

  const handleDeleteModal = (questionId: string) => {
    setSelectedQuestionId(questionId);
    deleteModal.open();
  };

  const handleDeleteQuestion = async () => {
    if (!selectedQuestionId) return;

    await bankQuestionService.deleteBankQuestion(Number(selectedQuestionId));
  };

  return (
    <PageLayout>
      <div className="mb-6">
        <Title level={3} className="mb-1 font-medium text-gray-800">
          Banco de Questões
        </Title>
        <Text className="text-gray-500">
          Gerencie todas as questões disponíveis no sistema
        </Text>
      </div>

      <Card className="mb-6 border border-gray-100 rounded-lg shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <Input
            placeholder="Buscar questões..."
            prefix={<Search className="w-4 h-4 text-gray-400" />}
            className="w-full sm:max-w-md"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <div className="flex flex-wrap gap-2 sm:gap-3 justify-end">
            <Button
              type="dashed"
              icon={<Plus className="w-4 h-4" />}
              onClick={bankQuestionImportModal.open}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 border-0 shadow-sm hover:opacity-90"
            >
              <span className="hidden sm:inline">Importar questões</span>
              <span className="sm:hidden">Importar</span>
            </Button>
            <Button
              type="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={bankQuestionModal.open}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 border-0 shadow-sm hover:opacity-90"
            >
              <span className="hidden sm:inline">Nova Questão</span>
              <span className="sm:hidden">Adicionar</span>
            </Button>
          </div>
        </div>
      </Card>

      <Card className="border border-gray-100 rounded-lg shadow-sm">
        {filteredQuestions.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <Table
                dataSource={paginatedQuestions}
                columns={columns}
                rowKey="id"
                loading={isLoading}
                pagination={false}
                className="mb-4"
                scroll={{ x: 'max-content' }}
                size="middle"
              />
            </div>
            <div className="flex justify-end mt-4">
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={filteredQuestions.length}
                onChange={(page) => setCurrentPage(page)}
                onShowSizeChange={(_, size) => {
                  setCurrentPage(1);
                  setPageSize(size);
                }}
                showSizeChanger
                showQuickJumper
                size="small"
                className="text-sm"
              />
            </div>
          </>
        ) : (
          <Empty
            description={
              searchText
                ? 'Nenhuma questão encontrada para esta busca'
                : 'Nenhuma questão cadastrada'
            }
            className="my-8"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
      </Card>

      <CreateBankQuestionModal
        visible={bankQuestionModal.isVisible}
        onClose={bankQuestionModal.close}
        messageApi={messageApi}
        refetch={refetch}
      />

      <ImportQuestionsModal
        visible={bankQuestionImportModal.isVisible}
        onClose={bankQuestionImportModal.close}
        messageApi={messageApi}
        refetch={refetch}
      />

      <EditBankQuestionModal
        visible={editBankQuestionModal.isVisible}
        onClose={editBankQuestionModal.close}
        messageApi={messageApi}
        refetch={refetch}
        questionId={Number(selectedQuestionId)}
      />

      <ConfirmationModal
        visible={deleteModal.isVisible}
        onClose={deleteModal.close}
        title="Excluir Sessão"
        description="Tem certeza que deseja excluir esta sessão? Esta ação não pode ser desfeita e todas as perguntas e respostas associadas serão removidas."
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={handleDeleteQuestion}
        messageApi={messageApi}
        successMessage="Sessão excluída com sucesso!"
        errorMessage="Erro ao excluir sessão. Tente novamente."
        refetch={refetch}
        danger={true}
      />
    </PageLayout>
  );
};

export default BankQuestionsPage;
