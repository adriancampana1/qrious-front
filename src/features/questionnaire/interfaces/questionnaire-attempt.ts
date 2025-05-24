import type { BankQuestion } from '../../bank-question/interfaces/bank-question';

export interface QuestionnaireAttempt {
  id: number;
  questionnaireId: number;
  userId: number;
  startTime: string;
  endTime?: string;
  status: 'in_progress' | 'completed' | 'expired';
  score?: number;
  totalQuestions: number;
  questionnaire: {
    id: number;
    title: string;
    timeLimitMinutes?: number;
    showAnswersAfterSubmission: boolean;
    items: QuestionnaireItem[];
  };
  responses?: QuestionnaireResponse[];
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface QuestionnaireItem {
  questionnaireId: number;
  bankQuestionId: number;
  position: number;
  bankQuestion: BankQuestion;
}

export interface QuestionnaireResponse {
  id: number;
  bankQuestionId: number;
  attemptId: number;
  selectedOptions: number[];
  essayResponse?: string;
  isCorrect?: boolean;
}
