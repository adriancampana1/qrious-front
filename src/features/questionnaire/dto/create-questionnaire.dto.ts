import type { QuestionnaireVisibility } from '../interfaces/questionnaire';

export interface CreateQuestionnaireDto {
  title: string;
  theme: string;
  description: string;
  numQuestions: number;
  timeLimitMinutes?: number;
  showAnswersAfterSubmission: boolean;
  bankQuestionIds: number[];
  visibility: QuestionnaireVisibility;
  sessionId?: number;
}
