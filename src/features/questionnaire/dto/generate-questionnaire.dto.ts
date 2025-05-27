import { BankQuestionDifficulty } from '../../bank-question/types/bank-question.types';
import type { QuestionnaireVisibility } from '../interfaces/questionnaire';

export interface GenerateQuestionnaireDto {
  title: string;
  theme: string;
  description: string;
  difficulty: BankQuestionDifficulty;
  numQuestions: number;
  timeLimitMinutes?: number;
  showAnswersAfterSubmission: boolean;
  visibility: QuestionnaireVisibility;
  sessionId?: number;
}
