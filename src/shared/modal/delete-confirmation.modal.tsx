'use client';

import type React from 'react';
import { Modal, Typography, Button } from 'antd';
import { AlertTriangle } from 'lucide-react';
import type { MessageInstance } from 'antd/es/message/interface';
import { useLayoutLoading } from '../hooks/use-layout';

const { Paragraph } = Typography;

interface ConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => Promise<void>;
  messageApi?: MessageInstance;
  successMessage?: string;
  errorMessage?: string;
  refetch?: () => void;
  danger?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  onClose,
  title,
  description = 'Esta ação não pode ser desfeita.',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  messageApi,
  successMessage = 'Operação realizada com sucesso!',
  errorMessage = 'Erro ao realizar operação. Tente novamente.',
  refetch,
  danger = true
}) => {
  const { isLoading, setLoading } = useLayoutLoading();

  const handleConfirm = async () => {
    setLoading(true);

    try {
      await onConfirm();
      messageApi?.success(successMessage);
      onClose();
      refetch?.();
    } catch (error) {
      console.error('Erro na operação:', error);
      messageApi?.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          {danger && <AlertTriangle className="w-5 h-5 text-red-500" />}
          <span>{title}</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      maskClosable={false}
      centered
    >
      <div className="py-4">
        <Paragraph className="text-gray-600 mb-6">{description}</Paragraph>

        <div className="flex justify-end gap-3">
          <Button onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            type="primary"
            onClick={handleConfirm}
            loading={isLoading}
            danger={danger}
            className={
              danger
                ? 'bg-red-500 hover:bg-red-600 border-red-500'
                : 'bg-gradient-to-r from-teal-500 to-cyan-500 border-0 shadow-sm hover:opacity-90'
            }
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;
