export const BankQuestionType = {
  SINGLE: 'single',
  MULTIPLE: 'multiple',
  ESSAY: 'essay'
} as const;

export type BankQuestionType =
  (typeof BankQuestionType)[keyof typeof BankQuestionType];

export const BankQuestionDifficulty = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard'
} as const;

export type BankQuestionDifficulty =
  (typeof BankQuestionDifficulty)[keyof typeof BankQuestionDifficulty];
