import { createEntityHooks } from '../../../shared/hooks/entity-hooks-factory';
import type { BankQuestion } from '../interfaces/bank-question';

export const bankQuestionHooks =
  createEntityHooks<BankQuestion>('bank-questions');

export const useGetAllBankQuestions = bankQuestionHooks.useGetAll;
export const useGetByIdBankQuestion = bankQuestionHooks.useGetById;
