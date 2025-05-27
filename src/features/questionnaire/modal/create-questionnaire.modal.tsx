import {
  Button,
  Checkbox,
  Form,
  Input,
  InputNumber,
  Modal,
  Select
} from 'antd';
import type { MessageInstance } from 'antd/es/message/interface';
import { useCallback } from 'react';
import { useLayoutLoading } from '../../../shared/hooks/use-layout';
import { questionnaireService } from '../services/questionnaire.service';
import type { BankQuestion } from '../../bank-question/interfaces/bank-question';
import type { CreateQuestionnaireDto } from '../dto/create-questionnaire.dto';
import { QuestionnaireVisibilitySelector } from '../components/questionnaire-visibility-selector';
import type { SessionWithRelations } from '../../session/interfaces/session';

type CreateQuestionnaireModalPropsType = {
  visible: boolean;
  readonly onClose: () => void;
  messageApi?: MessageInstance;
  onSuccess?: () => void;
  bankQuestions: BankQuestion[] | null;
  sessions: SessionWithRelations[];
};

const CreateQuestionnaireModal = ({
  visible,
  onClose,
  messageApi,
  onSuccess,
  bankQuestions,
  sessions
}: CreateQuestionnaireModalPropsType) => {
  const { isLoading, setLoading } = useLayoutLoading();
  const [form] = Form.useForm<CreateQuestionnaireDto>();

  const handleSubmit = useCallback(
    async (values: CreateQuestionnaireDto) => {
      try {
        await form.validateFields();
        setLoading(true);

        if (values.visibility === 'session' && !values.sessionId) {
          messageApi?.error(
            'Sessão é obrigatória quando a visibilidade é "Sessão"'
          );
          return;
        }

        const questionnaireData: CreateQuestionnaireDto = {
          ...values,
          ...(values.visibility !== 'session' && { sessionId: undefined })
        };

        const questionnaireResponse =
          await questionnaireService.createQuestionnaire(questionnaireData);

        if (questionnaireResponse) {
          form.resetFields();
          onClose();
          onSuccess?.();
          messageApi?.success('Questionário criado com sucesso!');
        }
      } catch (error) {
        let errorMsg = 'Erro ao criar questionário';
        if (error instanceof Error) {
          errorMsg = error.message;
        }
        setTimeout(() => {
          messageApi?.error(`Erro ao criar questionário: ${errorMsg}`);
        }, 100);
        console.error('Falha ao criar questionário:', error);
      } finally {
        setLoading(false);
      }
    },
    [form, onClose, setLoading, messageApi, onSuccess]
  );

  const handleCancel = useCallback(() => {
    form.resetFields();
    onClose();
  }, [form, onClose]);

  return (
    <Modal
      centered
      onCancel={handleCancel}
      open={visible}
      title="Novo questionário"
      width={800}
      footer={[
        <Button key="back" onClick={handleCancel} disabled={isLoading}>
          Cancelar
        </Button>,
        <Button
          key="confirm"
          onClick={form.submit}
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
        name="create-questionnaire"
        initialValues={{
          showAnswersAfterSubmission: false,
          visibility: 'private'
        }}
        autoComplete="off"
        onFinish={handleSubmit}
      >
        <Form.Item
          label="Título"
          name="title"
          required
          rules={[
            {
              required: true,
              message: 'Por favor, insira o título do questionário!'
            }
          ]}
        >
          <Input
            className="h-12"
            placeholder="Insira o título do questionário"
          />
        </Form.Item>

        <Form.Item
          label="Tema"
          name="theme"
          required
          rules={[
            {
              required: true,
              message: 'Por favor, insira o tema do questionário!'
            }
          ]}
        >
          <Input className="h-12" placeholder="Insira o tema do questionário" />
        </Form.Item>

        <Form.Item
          label="Descrição"
          name="description"
          required
          rules={[
            {
              required: true,
              message: 'Por favor, insira a descrição do questionário!'
            }
          ]}
        >
          <Input
            className="h-12"
            placeholder="Insira a descrição do questionário"
          />
        </Form.Item>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            label="Número de questões"
            name="numQuestions"
            required
            rules={[
              {
                required: true,
                type: 'number',
                message: 'Por favor, insira o número de questões!'
              }
            ]}
          >
            <InputNumber
              className="h-12 w-full!"
              placeholder="Quantidade de questões"
              min={1}
            />
          </Form.Item>

          <Form.Item label="Tempo limite (minutos)" name="timeLimitMinutes">
            <InputNumber
              className="h-12 w-full!"
              placeholder="Tempo limite (opcional)"
              min={1}
            />
          </Form.Item>
        </div>

        <QuestionnaireVisibilitySelector form={form} sessions={sessions} />

        <Form.Item name="showAnswersAfterSubmission" valuePropName="checked">
          <Checkbox>Mostrar respostas após submissão</Checkbox>
        </Form.Item>

        <Form.Item
          label="Selecione as perguntas do questionário"
          name="bankQuestionIds"
          required
          rules={[
            {
              required: true,
              message: 'Por favor, selecione pelo menos uma questão!'
            }
          ]}
        >
          <Select
            className="h-12"
            mode="multiple"
            placeholder="Selecione as questões"
            options={
              bankQuestions && bankQuestions.length > 0
                ? bankQuestions?.map((question) => ({
                    label: question.content,
                    value: question.id
                  }))
                : []
            }
            notFoundContent="Nenhuma questão disponível"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateQuestionnaireModal;
