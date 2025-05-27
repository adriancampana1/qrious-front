import { useCallback } from 'react';
import { message } from 'antd';
import { questionnaireService } from '../services/questionnaire.service';

export const useQuestionnaireActions = () => {
  const deleteQuestionnaire = useCallback(async (id: number, title: string) => {
    try {
      await questionnaireService.deleteQuestionnaire(id);
      message.success(`Questionário "${title}" excluído com sucesso!`);
      return true;
    } catch (error) {
      console.error('Erro ao excluir questionário:', error);
      message.error('Erro ao excluir questionário. Tente novamente.');
      return false;
    }
  }, []);

  return {
    deleteQuestionnaire
  };
};
