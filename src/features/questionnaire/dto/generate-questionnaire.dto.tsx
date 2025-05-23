import type { BankQuestionDifficulty } from '../../bank-question/types/bank-question.types';

export interface GenerateQuestionnaireDto {
  title: string;
  theme: string;
  description: string;
  difficulty: BankQuestionDifficulty;
  numQuestions: number;
  showAnswersAfterSubmission: boolean;
  timeLimitMinutes?: number;
}
