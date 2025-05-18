import type {
  BankQuestionDifficulty,
  BankQuestionType
} from '../types/bank-question.types';

export interface CreateBankQuestionDto {
  question: {
    type: BankQuestionType;
    content: string;
    difficulty: BankQuestionDifficulty;
    theme: string;
  };
  options: {
    content: string;
    isCorrect: boolean;
  }[];
}
