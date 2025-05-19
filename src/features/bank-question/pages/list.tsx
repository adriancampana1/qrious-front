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
import { bankQuestionHooks } from '../hooks/use-bank-question';
import type { BankQuestion } from '../interfaces/bank-question';
import PageLayout from '../../../shared/components/page-layout';
import CreateBankQuestionModal from '../modal/create-bank-question.dto';

const { Title, Text } = Typography;

const BankQuestionsPage: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const bankQuestionModal = useModal();
  const messageApi = useGlobalMessage();

  const { data: bankQuestions, isLoading } = bankQuestionHooks.usePaginated({
    params: {
      page: 1,
      limit: 100
    }
  });

  const filteredQuestions =
    bankQuestions?.filter((question) =>
      question.content.toLowerCase().includes(searchText.toLowerCase())
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
      render: (text) => (
        <div className="max-w-xl">
          <Text className="text-gray-800 line-clamp-2">{text}</Text>
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
                onClick: () => console.log('View question', record.id)
              },
              {
                key: 'edit',
                label: 'Editar',
                icon: <Edit className="w-4 h-4" />,
                onClick: () => console.log('Edit question', record.id)
              },
              {
                key: 'delete',
                label: 'Excluir',
                icon: <Trash2 className="w-4 h-4" />,
                danger: true,
                onClick: () => console.log('Delete question', record.id)
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
              onClick={bankQuestionModal.open}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 border-0 shadow-sm hover:opacity-90"
            >
              Nova Questão
            </Button>
          </div>
        </div>
      </Card>

      <Card className="border border-gray-100 rounded-lg shadow-sm">
        {filteredQuestions.length > 0 ? (
          <>
            <Table
              dataSource={paginatedQuestions}
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
                total={filteredQuestions.length}
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
      />
    </PageLayout>
  );
};

export default BankQuestionsPage;
