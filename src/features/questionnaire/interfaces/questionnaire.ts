import type { BankQuestion } from '../../bank-question/interfaces/bank-question';

export type QuestionnaireVisibility = 'private' | 'public' | 'session';

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
  visibility: QuestionnaireVisibility;
  sessionId?: number | null;
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
