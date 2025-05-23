'use client';

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
import { useCallback, useEffect } from 'react';
import { useLayoutLoading } from '../../../shared/hooks/use-layout';
import { questionnaireService } from '../services/questionnaire.service';
import type { BankQuestion } from '../../bank-question/interfaces/bank-question';
import type { Questionnaire } from '../interfaces/questionnaire';

type EditQuestionnaireModalPropsType = {
  visible: boolean;
  readonly onClose: () => void;
  messageApi?: MessageInstance;
  onSuccess?: () => void;
  bankQuestions: BankQuestion[] | null;
  questionnaire: Questionnaire | null;
};

type EditQuestionnaireFormValuesType = {
  title: string;
  theme: string;
  description: string;
  numQuestions: number;
  timeLimitMinutes?: number;
  showAnswersAfterSubmission: boolean;
  bankQuestionIds: number[];
};

const EditQuestionnaireModal = ({
  visible,
  onClose,
  messageApi,
  onSuccess,
  bankQuestions,
  questionnaire
}: EditQuestionnaireModalPropsType) => {
  const { isLoading, setLoading } = useLayoutLoading();
  const [form] = Form.useForm<EditQuestionnaireFormValuesType>();

  useEffect(() => {
    if (questionnaire && visible) {
      form.setFieldsValue({
        title: questionnaire.title,
        theme: questionnaire.theme,
        description: questionnaire.description,
        numQuestions: questionnaire.numQuestions,
        timeLimitMinutes: questionnaire.timeLimitMinutes ?? undefined,
        showAnswersAfterSubmission: questionnaire.showAnswersAfterSubmission,
        bankQuestionIds:
          questionnaire.items?.map((item) => item.bankQuestionId) || []
      });
    }
  }, [questionnaire, form, visible]);

  const handleSubmit = useCallback(
    async (values: EditQuestionnaireFormValuesType) => {
      if (!questionnaire) return;

      try {
        await form.validateFields();
        setLoading(true);

        const questionnaireResponse =
          await questionnaireService.updateQuestionnaire(questionnaire.id, {
            title: values.title,
            theme: values.theme,
            description: values.description,
            numQuestions: values.numQuestions,
            timeLimitMinutes: values.timeLimitMinutes,
            showAnswersAfterSubmission: values.showAnswersAfterSubmission,
            bankQuestionIds: values.bankQuestionIds
          });

        if (questionnaireResponse) {
          onClose();
          onSuccess?.();
          messageApi?.success('Questionário atualizado com sucesso!');
        }
      } catch (error) {
        let errorMsg = 'Erro ao atualizar questionário';
        if (error instanceof Error) {
          errorMsg = error.message;
        }
        setTimeout(() => {
          messageApi?.error(`Erro ao atualizar questionário: ${errorMsg}`);
        }, 100);
        console.error('Falha ao atualizar questionário:', error);
      } finally {
        setLoading(false);
      }
    },
    [form, onClose, setLoading, messageApi, onSuccess, questionnaire]
  );

  return (
    <Modal
      centered
      onCancel={onClose}
      open={visible}
      title="Editar questionário"
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
          Salvar alterações
        </Button>
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        name="edit-questionnaire"
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

        <Form.Item
          label="Selecione as perguntas do questionário"
          name="bankQuestionIds"
          vertical
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
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditQuestionnaireModal;
