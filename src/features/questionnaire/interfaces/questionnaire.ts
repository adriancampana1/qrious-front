import type { BankQuestion } from '../../bank-question/interfaces/bank-question';

export interface Questionnaire {
  id: number;
  title: string;
  theme: string;
  description: string;
  numQuestions: number;
  showAnswersAfterSubmission: boolean;
  timeLimitMinutes: number | null;
  createdAt: Date;
  createdById: number;
  createdBy: {
    id: number;
    name: string;
    email: string;
  };
  items: {
    questionnaireId: number;
    bankQuestionId: number;
    bankQuestion: BankQuestion;
    position: number;
  }[];
}
