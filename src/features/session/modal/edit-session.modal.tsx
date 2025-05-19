'use client';

import { Button, DatePicker, Form, Input, InputNumber, Modal } from 'antd';
import { useCallback, useEffect } from 'react';
import { sessionService } from '../services/session.service';
import type { MessageInstance } from 'antd/es/message/interface';
import type { Session } from '../interfaces/session';
import dayjs from 'dayjs';
import { useLayoutLoading } from '../../../shared/hooks/use-layout';

type EditSessionModalPropsType = {
  visible: boolean;
  readonly onClose: () => void;
  session: Session | null;
  messageApi?: MessageInstance;
  refetch?: () => void;
};

type EditSessionFormValuesType = {
  title: string;
  description: string;
  userLimit: number;
  activePeriod: [dayjs.Dayjs, dayjs.Dayjs];
};

const EditSessionModal = ({
  visible,
  onClose,
  session,
  messageApi,
  refetch
}: EditSessionModalPropsType) => {
  const { isLoading, setLoading } = useLayoutLoading();
  const [form] = Form.useForm<EditSessionFormValuesType>();

  useEffect(() => {
    if (visible && session) {
      form.setFieldsValue({
        title: session.title,
        description: session.description || '',
        userLimit: session.userLimit || undefined,
        activePeriod: [dayjs(session.activeFrom), dayjs(session.activeTo)]
      });
    }
  }, [visible, session, form]);

  const handleSubmit = useCallback(
    async (values: EditSessionFormValuesType) => {
      if (!session) return;

      form.validateFields();

      setLoading(true);
      try {
        const sessionResponse = await sessionService.updateSession(session.id, {
          title: values.title,
          description: values.description,
          userLimit: values.userLimit,
          activeFrom: values.activePeriod[0].toISOString(),
          activeTo: values.activePeriod[1].toISOString()
        });

        if (sessionResponse) {
          onClose();
          messageApi?.success('Sessão atualizada com sucesso!');
          refetch?.();
        }
      } catch (error) {
        console.error('Falha ao atualizar a sessão: ', error);
        messageApi?.error('Erro ao atualizar sessão. Tente novamente.');
      } finally {
        setLoading(false);
      }
    },
    [messageApi, onClose, setLoading, form, session]
  );

  const handleButtonSubmit = useCallback(() => {
    form.submit();
  }, [form]);

  return (
    <Modal
      centered
      onClose={onClose}
      onCancel={onClose}
      open={visible}
      title="Editar sessão"
      width={800}
      footer={[
        <Button
          key="back"
          onClick={onClose}
          disabled={isLoading}
          loading={isLoading}
        >
          Cancelar
        </Button>,
        <Button
          key="confirm"
          onClick={handleButtonSubmit}
          disabled={isLoading}
          loading={isLoading}
          type="primary"
          className="bg-gradient-to-r from-teal-500 to-cyan-500 border-0"
        >
          Salvar alterações
        </Button>
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        name="edit-session"
        autoComplete="off"
        onFinish={handleSubmit}
      >
        <Form.Item
          label="Título da sessão"
          name="title"
          required
          rules={[
            {
              required: true,
              message: 'Por favor, insira o título da sessão!'
            }
          ]}
        >
          <Input className="h-12" placeholder="Insira o título da sessão" />
        </Form.Item>
        <Form.Item
          label="Descrição"
          name="description"
          required
          rules={[
            {
              required: true,
              message: 'Por favor, insira a descrição da sessão!'
            }
          ]}
        >
          <Input className="h-12" placeholder="Insira a descrição da sessão" />
        </Form.Item>
        <Form.Item
          label="Limite de usuários"
          name="userLimit"
          rules={[
            {
              min: 1,
              type: 'number',
              message: 'Insira um valor válido para o limite de usuários!'
            }
          ]}
        >
          <InputNumber
            className="h-12 w-full!"
            placeholder="Número máximo de participantes na sessão"
          />
        </Form.Item>
        <Form.Item
          label="Período de validade da sessão"
          name="activePeriod"
          required
          rules={[
            {
              required: true,
              message: 'Por favor, selecione o período de validade da sessão!'
            }
          ]}
        >
          <DatePicker.RangePicker
            className="h-12 w-full"
            showTime={{ format: 'HH:mm' }}
            format="DD/MM/YYYY HH:mm"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditSessionModal;
