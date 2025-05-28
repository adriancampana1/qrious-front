import React from 'react';
import { Modal, Tabs, QRCode, Typography, Button, Input, message } from 'antd';
import { Copy, QrCode, LinkIcon, Share2 } from 'lucide-react';
import type { SessionWithRelations } from '../interfaces/session';
import { SessionAccessType } from '../interfaces/session';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface ShareSessionModalProps {
  visible: boolean;
  onClose: () => void;
  session: SessionWithRelations | null;
}

const ShareSessionModal: React.FC<ShareSessionModalProps> = ({
  visible,
  onClose,
  session
}) => {
  if (!session) return null;

  const codeAccess = session.access?.find(
    (access) => access.type === SessionAccessType.CODE
  );
  const qrAccess = session.access?.find(
    (access) => access.type === SessionAccessType.QR
  );
  const linkAccess = session.access?.find(
    (access) => access.type === SessionAccessType.LINK
  );

  const baseUrl = window.location.origin;

  const generateQrValue = () => {
    if (qrAccess) return `${baseUrl}/sessoes/entrar?qr=${qrAccess.value}`;
    if (linkAccess) return `${baseUrl}/sessoes/entrar?link=${linkAccess.value}`;
    return `${baseUrl}/sessoes/entrar`;
  };

  const generateShareLink = () => {
    if (linkAccess) return `${baseUrl}/sessoes/entrar?link=${linkAccess.value}`;
    if (codeAccess) return `${baseUrl}/sessoes/entrar`;
    return `${baseUrl}/sessoes/entrar`;
  };

  const handleCopyCode = () => {
    if (codeAccess) {
      navigator.clipboard.writeText(codeAccess.value);
      message.success('Código copiado para a área de transferência');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generateShareLink());
    message.success('Link copiado para a área de transferência');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Sessão: ${session.title}`,
          text: `Participe da sessão "${session.title}"`,
          url: generateShareLink()
        });
      } catch (error) {
        console.error('Error sharing', error);
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      title="Compartilhar sessão"
      centered
      width={500}
    >
      <Tabs defaultActiveKey="code" className="mt-4">
        {codeAccess && (
          <TabPane
            tab={
              <span className="flex items-center gap-2">
                <Copy size={16} />
                Código de Acesso
              </span>
            }
            key="code"
          >
            <div className="flex flex-col items-center gap-4 py-6">
              <Title level={2} className="mb-0 font-bold tracking-wider">
                {codeAccess.value}
              </Title>
              <Text className="text-center text-gray-500">
                Compartilhe este código com os participantes para que eles
                possam acessar a sessão
              </Text>
              <Button
                type="primary"
                onClick={handleCopyCode}
                className="bg-gradient-to-r from-teal-500 to-cyan-500 border-0 shadow-sm"
              >
                Copiar código
              </Button>
            </div>
          </TabPane>
        )}

        <TabPane
          tab={
            <span className="flex items-center gap-2">
              <QrCode size={16} />
              Código QR
            </span>
          }
          key="qr"
        >
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
              <QRCode
                value={generateQrValue()}
                size={200}
                bordered={false}
                errorLevel="M"
                color="#0F172A"
              />
            </div>
            <Text className="text-center text-gray-500">
              Os participantes podem escanear este QR code para acessar a sessão
            </Text>
          </div>
        </TabPane>

        <TabPane
          tab={
            <span className="flex items-center gap-2">
              <LinkIcon size={16} />
              Link
            </span>
          }
          key="link"
        >
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="w-full">
              <Input.Group compact className="flex">
                <Input
                  style={{ width: 'calc(100% - 64px)' }}
                  value={generateShareLink()}
                  readOnly
                  className="bg-gray-50"
                />
                <Button
                  icon={<Copy size={16} />}
                  onClick={handleCopyLink}
                  className="flex items-center justify-center"
                />
              </Input.Group>
            </div>
            <Text className="text-center text-gray-500">
              Compartilhe este link para convidar participantes para a sessão
            </Text>
            <Button
              type="primary"
              icon={<Share2 size={16} />}
              onClick={handleShare}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 border-0 shadow-sm"
            >
              Compartilhar
            </Button>
          </div>
        </TabPane>
      </Tabs>
    </Modal>
  );
};

export default ShareSessionModal;
