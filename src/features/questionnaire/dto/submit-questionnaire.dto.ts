export interface SubmitQuestionnaireResponsesDto {
  questionId: number;
  selectedOptionIds?: number[];
  essayResponse?: string;
}

export interface SubmitQuestionnaireDto {
  responses: SubmitQuestionnaireResponsesDto[];
}
