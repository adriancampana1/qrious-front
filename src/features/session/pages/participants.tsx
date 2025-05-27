import type React from 'react';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import {
  Typography,
  Button,
  Input,
  Table,
  Card,
  Tag,
  Empty,
  Pagination,
  type TableProps,
  message,
  Modal
} from 'antd';
import {
  Search,
  Filter,
  Users,
  ArrowLeft,
  Trash2,
  Shield,
  UserCircle
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { sessionService } from '../services/session.service';
import PageLayout from '../../../shared/components/page-layout';
import type { SessionUser, SessionWithRelations } from '../interfaces/session';

const { Title, Text } = Typography;
const { confirm } = Modal;

const ParticipantsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const sessionId = Number(id);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [participants, setParticipants] = useState<SessionUser[]>([]);
  const [session, setSession] = useState<SessionWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const fetchSessionDetails = async () => {
      try {
        const sessionData = await sessionService.getSessionById(sessionId);
        setSession(sessionData);
      } catch (error) {
        messageApi.error('Erro ao carregar detalhes da sessão.');
        console.error('Erro ao carregar detalhes da sessão:', error);
      }
    };

    fetchSessionDetails();
  }, [sessionId, messageApi]);

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        setLoading(true);
        const participantsData = await sessionService.getParticipants(
          sessionId
        );
        setParticipants(participantsData.filter((p) => !p.removedAt));
      } catch (error) {
        messageApi.error('Erro ao carregar participantes.');
        console.error('Erro ao carregar participantes:', error);
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) {
      fetchParticipants();
    }
  }, [sessionId, messageApi]);

  const filteredParticipants = participants.filter(
    (participant) =>
      participant.user.name.toLowerCase().includes(searchText.toLowerCase()) ||
      participant.user.email.toLowerCase().includes(searchText.toLowerCase()) ||
      participant.role.toLowerCase().includes(searchText.toLowerCase())
  );

  const paginatedParticipants = filteredParticipants.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleRemoveParticipant = async (userId: number, userName: string) => {
    const isCreator = session?.createdBy?.id === userId;
    const isTeacher = participants.find(
      (p) => p.userId === userId && p.role === 'teacher'
    );

    if (isCreator || isTeacher) {
      messageApi.error(
        'Não é possível remover o professor ou criador da sessão.'
      );
      return;
    }

    confirm({
      title: 'Remover participante',
      content: `Tem certeza que deseja remover ${userName} da sessão? Esta ação não pode ser desfeita.`,
      okText: 'Sim, remover',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          await sessionService.removeParticipant(sessionId, userId);

          setParticipants((prevParticipants) =>
            prevParticipants.filter((p) => p.userId !== userId)
          );

          messageApi.success('Participante removido com sucesso!');
        } catch (error) {
          messageApi.error('Erro ao remover participante.');
          console.error('Erro ao remover participante:', error);
        }
      }
    });
  };

  const columns: TableProps<SessionUser>['columns'] = [
    {
      title: 'Participante',
      dataIndex: 'user',
      key: 'user',
      render: (user) => (
        <div className="flex flex-col">
          <div className="flex items-center">
            <UserCircle className="w-5 h-5 mr-2 text-gray-500" />
            <span className="font-medium text-gray-800 break-words">
              {user.name}
            </span>
          </div>
          <Text className="text-xs text-gray-500 ml-7 hidden sm:block">
            {user.email}
          </Text>
          <Text className="text-xs text-gray-500 ml-7 block sm:hidden truncate max-w-[150px]">
            {user.email}
          </Text>
        </div>
      ),
      responsive: ['xs', 'sm', 'md', 'lg', 'xl']
    },
    {
      title: 'Função',
      dataIndex: 'role',
      key: 'role',
      render: (role, record) => {
        let color = 'default';
        let icon = null;

        if (role === 'teacher') {
          color = 'blue';
          icon = <Shield className="w-3 h-3 mr-1" />;
        } else if (role === 'moderator') {
          color = 'purple';
          icon = <Shield className="w-3 h-3 mr-1" />;
        }

        const isCreator = session?.createdBy?.id === record.userId;

        return (
          <div className="flex flex-wrap gap-1">
            <Tag
              color={color}
              className="flex! items-center text-xs sm:text-sm"
            >
              {icon}
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </Tag>
            {isCreator && (
              <Tag color="gold" className="flex! text-xs sm:text-sm">
                Criador
              </Tag>
            )}
          </div>
        );
      },
      responsive: ['xs', 'sm', 'md', 'lg', 'xl']
    },
    {
      title: 'Data de Entrada',
      dataIndex: 'joinedAt',
      key: 'joinedAt',
      render: (date) => (
        <span className="text-xs sm:text-sm">
          {new Date(date).toLocaleString('pt-BR')}
        </span>
      ),
      responsive: ['sm', 'md', 'lg', 'xl']
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (_, record) => {
        const isCreator = session?.createdBy?.id === record.userId;
        const isTeacher = record.role === 'teacher';
        const disabled = isCreator || isTeacher;

        return (
          <Button
            type="text"
            danger
            icon={<Trash2 className="w-4 h-4" />}
            onClick={() =>
              handleRemoveParticipant(record.userId, record.user.name)
            }
            disabled={disabled}
            title={
              disabled
                ? 'Não é possível remover o professor ou criador'
                : 'Remover participante'
            }
          />
        );
      },
      responsive: ['xs', 'sm', 'md', 'lg', 'xl']
    }
  ];

  return (
    <PageLayout>
      {contextHolder}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Button
            icon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate(`/sessoes/sessao/${sessionId}`)}
          >
            Voltar para a sessão
          </Button>
        </div>
        <Title level={3} className="mb-1 font-medium text-gray-800">
          Participantes da Sessão {session?.title ? `- ${session.title}` : ''}
        </Title>
        <Text className="text-gray-500">
          Gerencie os participantes desta sessão
        </Text>
      </div>

      <Card className="mb-6 border border-gray-100 rounded-lg shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <Input
            placeholder="Buscar participantes..."
            prefix={<Search className="w-4 h-4 text-gray-400" />}
            className="max-w-md"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <div className="flex gap-3">
            <Button
              icon={<Filter className="w-4 h-4" />}
              className="border-gray-200 hover:border-gray-300 hover:text-gray-700"
              type="dashed"
            >
              Filtros
            </Button>
            <Button
              type="default"
              icon={<Users className="w-4 h-4" />}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 border-0 text-white shadow-sm hover:opacity-90"
            >
              {filteredParticipants.length} Participantes
            </Button>
          </div>
        </div>
      </Card>

      <Card className="border border-gray-100 rounded-lg shadow-sm">
        {filteredParticipants.length > 0 ? (
          <>
            <Table
              dataSource={paginatedParticipants}
              columns={columns}
              rowKey={(record) => record.userId.toString()}
              loading={loading}
              pagination={false}
              className="mb-4"
              scroll={{ x: 'max-content' }}
              size="small"
            />
            <div className="flex justify-end">
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={filteredParticipants.length}
                onChange={(page) => setCurrentPage(page)}
                onShowSizeChange={(_, size) => {
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
                ? 'Nenhum participante encontrado para esta busca'
                : loading
                ? 'Carregando participantes...'
                : 'Nenhum participante nesta sessão'
            }
            className="my-8"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
      </Card>
    </PageLayout>
  );
};

export default ParticipantsPage;
