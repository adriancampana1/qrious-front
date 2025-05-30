import type React from 'react';
import { useState, type MouseEvent } from 'react';
import {
  Typography,
  Button,
  Input,
  Table,
  Card,
  Dropdown,
  Empty,
  Pagination,
  type TableProps,
  message
} from 'antd';
import {
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Users,
  Calendar,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import { useGetSessionsByUserId } from '../hooks/use-session';
import type { Session } from '../interfaces/session';
import CreateSessionModal from '../modal/create-session.modal';
import { useNavigate } from 'react-router';
import { sessionService } from '../services/session.service';
import { useModal } from '../../../shared/hooks/use-modal';
import PageLayout from '../../../shared/components/page-layout';
import ConfirmationModal from '../../../shared/modal/delete-confirmation.modal';
import EditSessionModal from '../modal/edit-session.modal';

const { Title, Text } = Typography;

const SessionsPage: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sessionToDelete, setSessionToDelete] = useState<number | null>(null);
  const [sessionToEdit, setSessionToEdit] = useState<Session | null>(null);

  const sessionModal = useModal();
  const editSessionModal = useModal();
  const deleteModal = useModal();

  const {
    data: sessions,
    isLoading: sessionloading,
    refetch
  } = useGetSessionsByUserId();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  const filteredSessions =
    sessions?.filter((session) =>
      session.title.toLowerCase().includes(searchText.toLowerCase())
    ) || [];

  const paginatedSessions = filteredSessions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleDeleteSession = async () => {
    if (!sessionToDelete) return;

    await sessionService.deleteSession(sessionToDelete);
  };

  const openDeleteModal = (sessionId: number) => {
    setSessionToDelete(sessionId);
    deleteModal.open();
  };

  const openEditModal = (session: Session) => {
    setSessionToEdit(session);
    editSessionModal.open();
  };

  const handleRowClick = (record: Session) => {
    return {
      onClick: (event: MouseEvent) => {
        if (
          event.target instanceof Element &&
          (event.target.closest('button') ||
            event.target.closest('.ant-dropdown-trigger') ||
            event.target.closest('a'))
        ) {
          return;
        }

        navigate(`/sessoes/sessao/${record.id}`);
      },
      className: 'cursor-pointer hover:bg-gray-50'
    };
  };

  const columns: TableProps<Session>['columns'] = [
    {
      title: 'Título',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-800">{text}</span>
          {record.description && (
            <Text className="text-xs text-gray-500 line-clamp-1">
              {record.description}
            </Text>
          )}
        </div>
      )
    },
    {
      title: 'Participantes',
      dataIndex: 'sessionUsers',
      key: 'participants',
      render: (sessionUsers, record) => (
        <div
          className="flex items-center cursor-pointer hover:text-blue-600 transition-colors"
          onClick={() => navigate(`/sessoes/sessao/${record.id}/participantes`)}
        >
          <Users className="w-4 h-4 mr-2 text-gray-500" />
          <span className="hover:underline">{sessionUsers?.length || 0}</span>
        </div>
      )
    },
    {
      title: 'Perguntas',
      dataIndex: 'questions',
      key: 'questions',
      render: (questions) => (
        <div className="flex items-center">
          <HelpCircle className="w-4 h-4 mr-2 text-gray-500" />
          <span>{questions?.length || 0}</span>
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
          <span>{new Date(date).toLocaleDateString('pt-BR')}</span>
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
                onClick: () => navigate(`/sessoes/sessao/${record.id}`)
              },
              {
                key: 'participants',
                label: 'Participantes',
                icon: <Users className="w-4 h-4" />,
                onClick: () =>
                  navigate(`/sessoes/sessao/${record.id}/participantes`)
              },
              {
                key: 'edit',
                label: 'Editar',
                icon: <Edit className="w-4 h-4" />,
                onClick: () => openEditModal(record)
              },
              {
                key: 'delete',
                label: 'Excluir',
                icon: <Trash2 className="w-4 h-4" />,
                danger: true,
                onClick: () => openDeleteModal(record.id)
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
      {contextHolder}
      <div className="mb-6">
        <Title level={3} className="mb-1 font-medium text-gray-800">
          Sessões
        </Title>
        <Text className="text-gray-500">
          Gerencie todas as sessões do sistema
        </Text>
      </div>

      <Card className="mb-6 border border-gray-100 rounded-lg shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
          <Input
            placeholder="Buscar sessões..."
            prefix={<Search className="w-4 h-4 text-gray-400" />}
            className="w-full sm:max-w-md"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <div className="flex flex-wrap gap-2 sm:gap-3 justify-end">
            <Button
              type="default"
              icon={<Plus className="w-4 h-4" />}
              onClick={sessionModal.open}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 border-0 shadow-sm hover:opacity-90"
            >
              <span className="hidden sm:inline">Nova Sessão</span>
              <span className="sm:hidden">Nova</span>
            </Button>
            <Button
              type="primary"
              icon={<ArrowRight className="w-4 h-4" />}
              onClick={() => navigate('/sessoes/entrar')}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 border-0 shadow-sm hover:opacity-90"
            >
              <span className="hidden sm:inline">Entrar em uma sessão</span>
              <span className="sm:hidden">Entrar</span>
            </Button>
          </div>
        </div>
      </Card>

      <Card className="border border-gray-100 rounded-lg shadow-sm">
        {filteredSessions.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <Table
                dataSource={paginatedSessions}
                columns={columns}
                rowKey="id"
                loading={sessionloading}
                pagination={false}
                className="mb-4"
                scroll={{ x: 'max-content' }}
                size="middle"
                onRow={handleRowClick}
              />
            </div>
            <div className="flex justify-end mt-4">
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={filteredSessions.length}
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
                ? 'Nenhuma sessão encontrada para esta busca'
                : 'Nenhuma sessão cadastrada'
            }
            className="my-8"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
      </Card>

      <CreateSessionModal
        visible={sessionModal.isVisible}
        onClose={sessionModal.close}
        messageApi={messageApi}
        refetch={refetch}
      />

      <EditSessionModal
        visible={editSessionModal.isVisible}
        onClose={editSessionModal.close}
        session={sessionToEdit}
        messageApi={messageApi}
        refetch={refetch}
      />

      <ConfirmationModal
        visible={deleteModal.isVisible}
        onClose={deleteModal.close}
        title="Excluir Sessão"
        description="Tem certeza que deseja excluir esta sessão? Esta ação não pode ser desfeita e todas as perguntas e respostas associadas serão removidas."
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={handleDeleteSession}
        messageApi={messageApi}
        successMessage="Sessão excluída com sucesso!"
        errorMessage="Erro ao excluir sessão. Tente novamente."
        refetch={refetch}
        danger={true}
      />
    </PageLayout>
  );
};

export default SessionsPage;
