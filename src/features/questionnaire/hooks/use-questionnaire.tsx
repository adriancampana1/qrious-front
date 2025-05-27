import { createEntityHooks } from '../../../shared/hooks/entity-hooks-factory';
import type { Questionnaire } from '../interfaces/questionnaire';
import { useQuery as useReactQuery } from '@tanstack/react-query';
import { questionnaireService } from '../services/questionnaire.service';

export const questionnaireHooks =
  createEntityHooks<Questionnaire>('questionnaires');

export const useGetAllQuestionnaires = questionnaireHooks.useGetAll;
export const useGetQuestionnaireById = questionnaireHooks.useGetById;

export const useGetAvailableQuestionnaires = () => {
  return useReactQuery({
    queryKey: ['questionnaires', 'available'],
    queryFn: () => questionnaireService.getAvailableQuestionnaires()
  });
};
