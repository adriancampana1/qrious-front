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
import type { BankQuestionDifficulty } from '../../bank-question/types/bank-question.types';

type GenerateQuestionnaireModalPropsType = {
  visible: boolean;
  readonly onClose: () => void;
  messageApi?: MessageInstance;
  onSuccess?: () => void;
};

type GenerateQuestionnaireFormValuesType = {
  title: string;
  theme: string;
  description: string;
  difficulty: BankQuestionDifficulty;
  numQuestions: number;
  timeLimitMinutes?: number;
  showAnswersAfterSubmission: boolean;
};

const difficultyOptions = [
  { label: 'Fácil', value: 'easy' },
  { label: 'Médio', value: 'medium' },
  { label: 'Difícil', value: 'hard' }
];

const GenerateQuestionnaireModal = ({
  visible,
  onClose,
  messageApi,
  onSuccess
}: GenerateQuestionnaireModalPropsType) => {
  const { isLoading, setLoading } = useLayoutLoading();
  const [form] = Form.useForm<GenerateQuestionnaireFormValuesType>();

  const handleSubmit = useCallback(
    async (values: GenerateQuestionnaireFormValuesType) => {
      try {
        await form.validateFields();
        setLoading(true);

        const questionnaireResponse =
          await questionnaireService.generateQuestionnaire({
            title: values.title,
            theme: values.theme,
            description: values.description,
            difficulty: values.difficulty,
            numQuestions: values.numQuestions,
            timeLimitMinutes: values.timeLimitMinutes,
            showAnswersAfterSubmission: values.showAnswersAfterSubmission
          });

        if (questionnaireResponse) {
          form.resetFields();
          onClose();
          onSuccess?.();
          messageApi?.success('Questionário gerado com sucesso!');
        }
      } catch (error) {
        let errorMsg = 'Erro ao gerar questionário';
        if (error instanceof Error) {
          errorMsg = error.message;
        }
        setTimeout(() => {
          messageApi?.error(`Erro ao gerar questionário: ${errorMsg}`);
        }, 100);
        console.error('Falha ao gerar questionário:', error);
      } finally {
        setLoading(false);
      }
    },
    [form, onClose, setLoading, messageApi, onSuccess]
  );

  return (
    <Modal
      centered
      onCancel={onClose}
      open={visible}
      title="Gerar questionário automático"
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
          onClick={form.submit}
          disabled={isLoading}
          loading={isLoading}
          type="primary"
        >
          Gerar
        </Button>
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        name="generate-questionnaire"
        initialValues={{
          showAnswersAfterSubmission: false,
          difficulty: 'medium',
          numQuestions: 5
        }}
        autoComplete="off"
        onFinish={handleSubmit}
      >
        <Form.Item
          label="Título"
          name="title"
          vertical
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
          vertical
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
          vertical
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

        <Form.Item
          label="Dificuldade"
          name="difficulty"
          vertical
          required
          rules={[
            {
              required: true,
              message: 'Por favor, selecione a dificuldade!'
            }
          ]}
        >
          <Select
            className="h-12"
            placeholder="Selecione a dificuldade"
            options={difficultyOptions}
          />
        </Form.Item>

        <Form.Item
          label="Número de questões"
          name="numQuestions"
          vertical
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

        <Form.Item
          label="Tempo limite (minutos)"
          name="timeLimitMinutes"
          vertical
        >
          <InputNumber
            className="h-12 w-full!"
            placeholder="Tempo limite em minutos (opcional)"
            min={1}
          />
        </Form.Item>

        <Form.Item name="showAnswersAfterSubmission" valuePropName="checked">
          <Checkbox>Mostrar respostas após submissão</Checkbox>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default GenerateQuestionnaireModal;
