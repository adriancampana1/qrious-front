import { createEntityHooks } from '../../../shared/hooks/entity-hooks-factory';
import type { Questionnaire } from '../interfaces/questionnaire';

export const questionnaireHooks =
  createEntityHooks<Questionnaire>('questionnaires');

export const useGetAllQuestionnaires = questionnaireHooks.useGetAll;
export const useGetQuestionnaireById = questionnaireHooks.useGetById;
