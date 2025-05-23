import {
  Button,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Checkbox,
  Radio,
  Tooltip,
  Spin
} from 'antd';
import { useCallback, useState, useEffect } from 'react';
import {
  BankQuestionType,
  BankQuestionDifficulty
} from '../types/bank-question.types';
import { useLayoutLoading } from '../../../shared/hooks/use-layout';
import { bankQuestionService } from '../services/bank-question.service';
import type { MessageInstance } from 'antd/es/message/interface';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { BankQuestion, BankOption } from '../interfaces/bank-question';

type EditBankQuestionModalPropsType = {
  visible: boolean;
  questionId: number | null;
  readonly onClose: () => void;
  messageApi: MessageInstance;
  refetch?: () => void;
};

type EditBankQuestionFormValuesType = {
  type: BankQuestionType;
  content: string;
  difficulty: BankQuestionDifficulty;
  theme: string;
};

const EditBankQuestionModal = ({
  visible,
  questionId,
  onClose,
  messageApi,
  refetch
}: EditBankQuestionModalPropsType) => {
  const { isLoading, setLoading } = useLayoutLoading();
  const [form] = Form.useForm<EditBankQuestionFormValuesType>();
  const [questionType, setQuestionType] = useState<BankQuestionType>(
    BankQuestionType.SINGLE
  );
  const [options, setOptions] = useState<
    Array<{ id?: number; content: string; isCorrect: boolean }>
  >([]);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<BankQuestion | null>(
    null
  );

  // Carregar dados da questão quando o modal é aberto
  useEffect(() => {
    const fetchQuestionData = async () => {
      if (visible && questionId) {
        setIsLoadingQuestion(true);
        try {
          const question = await bankQuestionService.getBankQuestionById(
            questionId
          );
          setCurrentQuestion(question);

          // Preencher o formulário com os dados da questão
          form.setFieldsValue({
            type: question.type,
            content: question.content,
            difficulty: question.difficulty,
            theme: question.theme
          });

          setQuestionType(question.type);

          // Carregar as alternativas se existirem
          if (question.options && question.options.length > 0) {
            setOptions(
              question.options.map((opt: BankOption) => ({
                id: opt.id,
                content: opt.content,
                isCorrect: opt.isCorrect
              }))
            );
          } else if (
            question.type !== BankQuestionType.ESSAY &&
            (!question.options || question.options.length === 0)
          ) {
            // Se for questão de escolha mas não tem alternativas, criar duas vazias
            setOptions([
              { content: '', isCorrect: false },
              { content: '', isCorrect: false }
            ]);
          }
        } catch (error) {
          console.error('Erro ao carregar dados da questão:', error);
          messageApi.error('Erro ao carregar dados da questão');
        } finally {
          setIsLoadingQuestion(false);
        }
      }
    };

    fetchQuestionData();
  }, [visible, questionId, form, messageApi]);

  // Resetar o formulário quando o modal é fechado
  useEffect(() => {
    if (!visible) {
      form.resetFields();
      setOptions([]);
      setCurrentQuestion(null);
    }
  }, [visible, form]);

  // Atualizar opções quando o tipo de questão muda
  useEffect(() => {
    if (questionType === BankQuestionType.ESSAY) {
      setOptions([]);
    } else if (options.length === 0 && !isLoadingQuestion) {
      // Adicionar duas opções vazias se não houver nenhuma
      setOptions([
        { content: '', isCorrect: false },
        { content: '', isCorrect: false }
      ]);
    }
  }, [questionType, options.length, isLoadingQuestion]);

  const handleQuestionTypeChange = (value: BankQuestionType) => {
    setQuestionType(value);

    // Resetar opções corretas ao mudar de múltipla para única
    if (
      value === BankQuestionType.SINGLE &&
      options.filter((opt) => opt.isCorrect).length > 1
    ) {
      const newOptions = [...options];
      newOptions.forEach((opt, index) => {
        opt.isCorrect = index === 0 ? true : false;
      });
      setOptions(newOptions);
    }
  };

  const addOption = () => {
    setOptions([...options, { content: '', isCorrect: false }]);
  };

  const removeOption = (index: number) => {
    const newOptions = [...options];
    newOptions.splice(index, 1);

    // Se for questão de resposta única e removemos a opção correta,
    // marcar a primeira como correta
    if (
      questionType === BankQuestionType.SINGLE &&
      options[index].isCorrect &&
      newOptions.length > 0
    ) {
      newOptions[0].isCorrect = true;
    }

    setOptions(newOptions);
  };

  const handleOptionContentChange = (index: number, content: string) => {
    const newOptions = [...options];
    newOptions[index].content = content;
    setOptions(newOptions);
  };

  const handleOptionCorrectChange = (index: number, isCorrect: boolean) => {
    const newOptions = [...options];

    if (questionType === BankQuestionType.SINGLE) {
      // Para questão de resposta única, desmarcar todas as outras
      newOptions.forEach((opt, i) => {
        opt.isCorrect = i === index ? isCorrect : false;
      });
    } else {
      // Para múltipla escolha, apenas alternar a opção atual
      newOptions[index].isCorrect = isCorrect;
    }

    setOptions(newOptions);
  };

  const validateOptions = () => {
    if (questionType === BankQuestionType.ESSAY) {
      return true;
    }

    // Verificar se há pelo menos 2 alternativas
    if (options.length < 2) {
      messageApi.error('É necessário adicionar pelo menos 2 alternativas');
      return false;
    }

    // Verificar se todas as alternativas têm conteúdo
    const emptyOptions = options.some((opt) => !opt.content.trim());
    if (emptyOptions) {
      messageApi.error('Todas as alternativas devem ter conteúdo');
      return false;
    }

    // Verificar se pelo menos uma alternativa está marcada como correta
    const hasCorrectOption = options.some((opt) => opt.isCorrect);
    if (!hasCorrectOption) {
      messageApi.error(
        'Pelo menos uma alternativa deve ser marcada como correta'
      );
      return false;
    }

    return true;
  };

  const handleSubmit = useCallback(
    async (values: EditBankQuestionFormValuesType) => {
      if (!questionId || !currentQuestion) {
        messageApi.error('Questão não encontrada');
        return;
      }

      try {
        await form.validateFields();

        if (!validateOptions()) {
          return;
        }

        setLoading(true);

        const questionResponse = await bankQuestionService.updateBankQuestion(
          questionId,
          {
            question: {
              content: values.content,
              type: values.type,
              difficulty: values.difficulty,
              theme: values.theme
            },
            options: values.type === BankQuestionType.ESSAY ? [] : options
          }
        );

        if (questionResponse) {
          form.resetFields();
          setOptions([]);
          onClose();
          refetch?.();
          messageApi.success('Questão atualizada com sucesso!');
        }
      } catch (error) {
        let errorMsg = 'Erro ao atualizar questão';
        if (error instanceof Error) {
          errorMsg = error.message;
        }
        setTimeout(() => {
          messageApi.error(`Erro ao atualizar questão: ${errorMsg}`);
        }, 100);
        console.error('Falha ao atualizar a questão: ', error);
      } finally {
        setLoading(false);
      }
    },
    [
      form,
      onClose,
      setLoading,
      messageApi,
      options,
      questionType,
      refetch,
      questionId,
      currentQuestion
    ]
  );

  return (
    <>
      <Modal
        centered
        onCancel={onClose}
        getContainer={false}
        open={visible}
        title="Editar questão do banco de questões"
        width={800}
        footer={[
          <Button
            key="back"
            onClick={onClose}
            disabled={isLoading || isLoadingQuestion}
            loading={isLoading}
          >
            Cancelar
          </Button>,
          <Button
            key="confirm"
            onClick={form.submit}
            disabled={isLoading || isLoadingQuestion}
            loading={isLoading}
            type="primary"
          >
            Salvar alterações
          </Button>
        ]}
      >
        {isLoadingQuestion ? (
          <div className="flex justify-center items-center py-12">
            <Spin size="large" tip="Carregando questão..." />
          </div>
        ) : (
          <Form
            form={form}
            layout="vertical"
            name="edit-bank-question"
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
              <Select className="h-12" onChange={handleQuestionTypeChange}>
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

            {/* Alternativas para questões de escolha única ou múltipla */}
            {(questionType === BankQuestionType.SINGLE ||
              questionType === BankQuestionType.MULTIPLE) && (
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="font-medium">Alternativas</label>
                  <Tooltip title="Adicionar alternativa">
                    <Button
                      type="dashed"
                      onClick={addOption}
                      icon={<PlusOutlined />}
                      className="flex items-center"
                    >
                      Adicionar
                    </Button>
                  </Tooltip>
                </div>

                <div className="bg-gray-50 p-4 rounded-md">
                  {options.length === 0 ? (
                    <div className="text-center text-gray-500 py-4">
                      Adicione alternativas para a questão
                    </div>
                  ) : (
                    <Space direction="vertical" className="w-full">
                      {options.map((option, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-2 bg-white p-3 rounded border"
                        >
                          <div className="mt-1">
                            {questionType === BankQuestionType.SINGLE ? (
                              <Radio
                                checked={option.isCorrect}
                                onChange={(e) =>
                                  handleOptionCorrectChange(
                                    index,
                                    e.target.checked
                                  )
                                }
                              />
                            ) : (
                              <Checkbox
                                checked={option.isCorrect}
                                onChange={(e) =>
                                  handleOptionCorrectChange(
                                    index,
                                    e.target.checked
                                  )
                                }
                              />
                            )}
                          </div>
                          <Input
                            className="flex-1"
                            placeholder={`Alternativa ${index + 1}`}
                            value={option.content}
                            onChange={(e) =>
                              handleOptionContentChange(index, e.target.value)
                            }
                          />
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => removeOption(index)}
                            disabled={options.length <= 2}
                            className="flex items-center justify-center"
                          />
                        </div>
                      ))}
                    </Space>
                  )}

                  {options.length > 0 && (
                    <div className="mt-2 text-gray-500 text-sm">
                      {questionType === BankQuestionType.SINGLE
                        ? 'Selecione a alternativa correta'
                        : 'Selecione uma ou mais alternativas corretas'}
                    </div>
                  )}
                </div>
              </div>
            )}

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
        )}
      </Modal>
    </>
  );
};

export default EditBankQuestionModal;
