import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  message,
  Modal
} from 'antd';
import { useLayoutLoading } from '../../../shared/hooks/use-layout';
import type dayjs from 'dayjs';
import { useCallback } from 'react';
import { sessionService } from '../services/session.service';

type CreateSessionModalPropsType = {
  visible: boolean;
  readonly onClose: () => void;
};

type CreateSessionFormValuesType = {
  title: string;
  description: string;
  userLimit: number;
  activePeriod: [dayjs.Dayjs, dayjs.Dayjs];
};

const CreateSessionModal = ({
  visible,
  onClose
}: CreateSessionModalPropsType) => {
  const { isLoading, setLoading } = useLayoutLoading();
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm<CreateSessionFormValuesType>();

  const handleSubmit = useCallback(
    async (values: CreateSessionFormValuesType) => {
      form.validateFields();

      setLoading(true);
      try {
        const sessionResponse = await sessionService.createSession({
          title: values.title,
          description: values.description,
          userLimit: values.userLimit,
          activeFrom: values.activePeriod[0].toISOString(),
          activeTo: values.activePeriod[1].toISOString()
        });
        if (sessionResponse) {
          onClose();
          messageApi.success('Sessão criada com sucesso!');
        }
      } catch (error) {
        console.error('Falha ao criar a sessão: ', error);
      } finally {
        setLoading(false);
      }
    },
    [messageApi, onClose, setLoading, form]
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
      title="Nova sessão"
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
        >
          Confirmar
        </Button>
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        name="create-session"
        initialValues={{ remember: true }}
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
        <Form.Item label="Período de validade da sessão" name="activePeriod">
          <DatePicker.RangePicker className="h-12 w-full" />
        </Form.Item>
      </Form>
      {contextHolder}
    </Modal>
  );
};

export default CreateSessionModal;
