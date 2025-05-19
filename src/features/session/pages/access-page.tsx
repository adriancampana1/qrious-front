import type React from 'react';
import { useState } from 'react';
import {
  Typography,
  Card,
  Input,
  Button,
  Tabs,
  QRCode,
  Divider,
  message
} from 'antd';
import { KeyRound, QrCode, ArrowRight } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import PageLayout from '../../../shared/components/page-layout';
import { sessionService } from '../services/session.service';
import type { JoinSessionDto } from '../dto/join-session.dto';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const SessionAccessPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [accessCode, setAccessCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const navigate = useNavigate();

  const handleAccessSession = async () => {
    if (!accessCode.trim()) {
      message.error('Por favor, insira um código de acesso válido');
      return;
    }

    setLoading(true);

    try {
      const sessionAccess: JoinSessionDto = {
        sessionId: Number(id),
        sessionAccess: {
          type: 'code',
          value: accessCode
        }
      };

      const sessionAccessResponse = await sessionService.joinSession(
        Number(id),
        sessionAccess
      );

      if (sessionAccessResponse) {
        messageApi.success('Sessão acessada com sucesso!');
        navigate(`/sessoes/123`);
      }
    } catch (error) {
      messageApi.error(
        'Erro ao acessar a sessão. Verifique o código e tente novamente.'
      );
      console.error('Error accessing session:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout>
      {contextHolder}
      <div className="flex flex-col items-center justify-center max-w-md mx-auto py-8">
        <Title level={2} className="text-center mb-2">
          Acessar Sessão
        </Title>
        <Paragraph className="text-center text-gray-500 mb-8">
          Entre em uma sessão utilizando o código de acesso ou escaneando o QR
          code
        </Paragraph>

        <Card className="w-full border border-gray-100 rounded-lg shadow-sm">
          <Tabs defaultActiveKey="code" centered className="mb-4">
            <TabPane
              tab={
                <span className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4" />
                  Código de Acesso
                </span>
              }
              key="code"
            >
              <div className="flex flex-col items-center gap-4 py-4">
                <Input
                  placeholder="Digite o código de acesso"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  size="large"
                  className="text-center text-lg font-medium tracking-wider max-w-xs"
                  maxLength={8}
                  onPressEnter={handleAccessSession}
                />
                <Button
                  type="primary"
                  size="large"
                  icon={<ArrowRight className="w-4 h-4" />}
                  onClick={handleAccessSession}
                  loading={loading}
                  className="bg-gradient-to-r from-teal-500 to-cyan-500 border-0 shadow-sm hover:opacity-90"
                >
                  Acessar Sessão
                </Button>
              </div>
            </TabPane>
            <TabPane
              tab={
                <span className="flex items-center gap-2">
                  <QrCode className="w-4 h-4" />
                  QR Code
                </span>
              }
              key="qrcode"
            >
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="bg-white p-4 rounded-lg">
                  <QRCode
                    value="https://example.com/session/123"
                    size={200}
                    bordered={false}
                    className="mx-auto"
                  />
                </div>
                <Text className="text-gray-500 text-center">
                  Escaneie o QR code com a câmera do seu dispositivo para
                  acessar a sessão
                </Text>
              </div>
            </TabPane>
          </Tabs>

          <Divider className="my-6" />

          <div className="text-center">
            <Text className="text-gray-500">
              Precisa de ajuda? Entre em contato com o administrador da sessão
            </Text>
          </div>
        </Card>
      </div>
    </PageLayout>
  );
};

export default SessionAccessPage;
