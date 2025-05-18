export interface CreateQuestionnaireDto {
  title: string;
  theme: string;
  description: string;
  numQuestions: number;
  showAnswersAfterSubmission: boolean;
  timeLimitMinutes?: number;
  bankQuestionIds: number[];
}
