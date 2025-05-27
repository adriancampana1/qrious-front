import { Form, Select, type FormInstance } from 'antd';
import { useEffect } from 'react';
import type { QuestionnaireVisibility } from '../interfaces/questionnaire';
import type { SessionWithRelations } from '../../session/interfaces/session';
import type { CreateQuestionnaireDto } from '../dto/create-questionnaire.dto';

interface QuestionnaireVisibilitySelectorProps {
  form: FormInstance<CreateQuestionnaireDto>;
  sessions?: SessionWithRelations[];
}

const visibilityOptions = [
  {
    value: 'private' as QuestionnaireVisibility,
    label: 'Privado',
    description: 'Apenas você pode acessar este questionário'
  },
  {
    value: 'public' as QuestionnaireVisibility,
    label: 'Público',
    description: 'Todos os usuários podem acessar este questionário'
  },
  {
    value: 'session' as QuestionnaireVisibility,
    label: 'Sessão',
    description: 'Apenas usuários de uma sessão específica podem acessar'
  }
];

export const QuestionnaireVisibilitySelector = ({
  form,
  sessions = []
}: QuestionnaireVisibilitySelectorProps) => {
  const visibility = Form.useWatch('visibility', form);

  useEffect(() => {
    if (visibility !== 'session') {
      form.setFieldValue('sessionId', undefined);
    }
  }, [visibility, form]);

  return (
    <>
      <Form.Item
        label="Visibilidade"
        name="visibility"
        required
        rules={[
          {
            required: true,
            message: 'Por favor, selecione a visibilidade do questionário!'
          }
        ]}
        tooltip="Define quem pode acessar este questionário"
      >
        <Select
          className="h-auto!"
          placeholder="Selecione a visibilidade"
          options={visibilityOptions.map((option) => ({
            value: option.value,
            label: (
              <div>
                <div className="font-medium">{option.label}</div>
                <div className="text-sm text-gray-500">
                  {option.description}
                </div>
              </div>
            )
          }))}
        />
      </Form.Item>

      {visibility === 'session' && (
        <Form.Item
          label="Sessão"
          name="sessionId"
          required
          rules={[
            {
              required: true,
              message: 'Por favor, selecione uma sessão!'
            }
          ]}
          tooltip="Selecione a sessão que terá acesso a este questionário"
        >
          <Select
            className="h-12!"
            placeholder="Selecione uma sessão"
            options={sessions.map((session) => ({
              value: session.id,
              label: session.title
            }))}
            notFoundContent="Nenhuma sessão disponível"
          />
        </Form.Item>
      )}
    </>
  );
};
