import type {
  BankQuestionDifficulty,
  BankQuestionType
} from '../types/bank-question.types';

export interface BankQuestion {
  id: number;
  content: string;
  type: BankQuestionType;
  difficulty: BankQuestionDifficulty;
  theme: string;
  createdAt: Date;
  createdById: number;
  createdBy: {
    id: number;
    name: string;
    email: string;
  };
  options?: BankOption[];
  _count: {
    options: number;
    items: number;
  };
}

export interface BankOption {
  id: number;
  content: string;
  isCorrect: boolean;
  bankQuestionId: number;
  bankQuestion: BankQuestion;
}
