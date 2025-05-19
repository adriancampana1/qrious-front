import type React from 'react';
import { Modal, Form, Input, Button, Checkbox, message } from 'antd';
import { Send } from 'lucide-react';
import { useLayoutLoading } from '../../../shared/hooks/use-layout';
import { questionService } from '../services/question.service';
import type { CreateQuestionDto } from '../dto/create-question.dto';
import type { MessageInstance } from 'antd/es/message/interface';

interface CreateQuestionModalProps {
  visible: boolean;
  onClose: () => void;
  sessionId: number;
  messageApi?: MessageInstance;
  refetch?: () => void;
}

interface QuestionFormValues {
  title: string;
  description: string;
  anonymous: boolean;
}

const CreateQuestionModal: React.FC<CreateQuestionModalProps> = ({
  visible,
  onClose,
  sessionId,
  messageApi,
  refetch
}) => {
  const [form] = Form.useForm<QuestionFormValues>();
  const { isLoading, setLoading } = useLayoutLoading();

  const handleSubmit = async (values: QuestionFormValues) => {
    try {
      await form.validateFields();
      setLoading(true);

      try {
        const questionData: CreateQuestionDto = {
          title: values.title,
          description: values.description,
          anonymous: values.anonymous
        };

        const questionResponse = await questionService.createQuestion(
          sessionId,
          questionData
        );

        if (questionResponse) {
          onClose();
          messageApi?.success('Pergunta criada com sucesso!');
          refetch?.();
        }
      } catch (error) {
        console.error('Erro ao criar pergunta: ', error);
        messageApi?.error('Erro ao criar pergunta');
      } finally {
        setLoading(false);
      }

      message.success('Pergunta enviada com sucesso');
      form.resetFields();
      onClose();
    } catch (error) {
      if (error instanceof Error) {
        message.error(`Erro ao enviar pergunta: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Nova Pergunta"
      open={visible}
      onCancel={onClose}
      footer={null}
      maskClosable={false}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ anonymous: false }}
        onFinish={handleSubmit}
        className="mt-4"
      >
        <Form.Item
          name="title"
          label="Título da pergunta"
          rules={[
            {
              required: true,
              message: 'Por favor, digite o título da pergunta'
            }
          ]}
        >
          <Input placeholder="Digite um título claro e objetivo" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Descrição"
          rules={[
            {
              required: true,
              message: 'Por favor, insira a descrição da pergunta'
            }
          ]}
        >
          <Input.TextArea
            placeholder="Forneça mais detalhes sobre sua pergunta"
            rows={4}
            className="resize-none"
          />
        </Form.Item>

        <Form.Item name="anonymous" valuePropName="checked">
          <Checkbox>Enviar como anônimo</Checkbox>
        </Form.Item>

        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={onClose} disabled={isLoading} loading={isLoading}>
            Cancelar
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            icon={<Send className="w-4 h-4" />}
            className="bg-gradient-to-r from-teal-500 to-cyan-500 border-0 shadow-sm hover:opacity-90"
            disabled={isLoading}
            loading={isLoading}
          >
            Enviar Pergunta
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateQuestionModal;
