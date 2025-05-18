import { Button, Form, Input, Modal, Select } from 'antd';
import { useCallback } from 'react';
import {
  BankQuestionType,
  BankQuestionDifficulty
} from '../types/bank-question.types';
import { useLayoutLoading } from '../../../shared/hooks/use-layout';
import { bankQuestionService } from '../services/bank-question.service';
import type { MessageInstance } from 'antd/es/message/interface';

type CreateBankQuestionModalPropsType = {
  visible: boolean;
  readonly onClose: () => void;
  messageApi: MessageInstance;
};

type CreateBankQuestionFormValuesType = {
  type: BankQuestionType;
  content: string;
  difficulty: BankQuestionDifficulty;
  theme: string;
};

const CreateBankQuestionModal = ({
  visible,
  onClose,
  messageApi
}: CreateBankQuestionModalPropsType) => {
  const { isLoading, setLoading } = useLayoutLoading();
  const [form] = Form.useForm<CreateBankQuestionFormValuesType>();

  const handleSubmit = useCallback(
    async (values: CreateBankQuestionFormValuesType) => {
      try {
        await form.validateFields();
        setLoading(true);

        const questionResponse = await bankQuestionService.createBankQuestion({
          question: {
            content: values.content,
            type: values.type,
            difficulty: values.difficulty,
            theme: values.theme
          },
          options: []
        });

        if (questionResponse) {
          form.resetFields();
          onClose();
          messageApi.success('Questão criada com sucesso!');
        }
      } catch (error) {
        let errorMsg = 'Erro ao criar questão';
        if (error instanceof Error) {
          errorMsg = error.message;
        }
        setTimeout(() => {
          messageApi.error(`Erro ao criar questão: ${errorMsg}`);
        }, 100);
        console.error('Falha ao criar a questão: ', error);
      } finally {
        setLoading(false);
      }
    },
    [form, onClose, setLoading, messageApi]
  );

  return (
    <>
      <Modal
        centered
        onCancel={onClose}
        getContainer={false}
        open={visible}
        title="Nova questão no banco de questões"
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
            Confirmar
          </Button>
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          name="create-bank-question"
          initialValues={{
            type: BankQuestionType.SINGLE,
            difficulty: BankQuestionDifficulty.MEDIUM
          }}
          autoComplete="off"
          onFinish={handleSubmit}
        >
          <Form.Item
            label="Tipo de questão"
            name="type"
            vertical
            required
            rules={[
              {
                required: true,
                message: 'Por favor, selecione o tipo de questão!'
              }
            ]}
          >
            <Select className="h-12">
              <Select.Option value={BankQuestionType.SINGLE}>
                Resposta Única
              </Select.Option>
              <Select.Option value={BankQuestionType.MULTIPLE}>
                Múltipla Escolha
              </Select.Option>
              <Select.Option value={BankQuestionType.ESSAY}>
                Dissertativa
              </Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Conteúdo da questão"
            name="content"
            vertical
            required
            rules={[
              {
                required: true,
                message: 'Por favor, insira o conteúdo da questão!'
              }
            ]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Insira o conteúdo/enunciado da questão"
            />
          </Form.Item>

          <Form.Item
            label="Nível de dificuldade"
            name="difficulty"
            vertical
            required
            rules={[
              {
                required: true,
                message: 'Por favor, selecione o nível de dificuldade!'
              }
            ]}
          >
            <Select className="h-12">
              <Select.Option value={BankQuestionDifficulty.EASY}>
                Fácil
              </Select.Option>
              <Select.Option value={BankQuestionDifficulty.MEDIUM}>
                Médio
              </Select.Option>
              <Select.Option value={BankQuestionDifficulty.HARD}>
                Difícil
              </Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Tema"
            name="theme"
            vertical
            required
            rules={[
              {
                required: true,
                message: 'Por favor, insira o tema da questão!'
              }
            ]}
          >
            <Input className="h-12" placeholder="Insira o tema da questão" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default CreateBankQuestionModal;
