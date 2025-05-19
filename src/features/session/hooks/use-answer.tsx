import {
  useQuery,
  type QueryOptions,
  type QueryResult
} from '../../../shared/hooks/use-query';
import type { Answer } from '../interfaces/answer';
import { answerService } from '../services/answer.service';

export function useGetAllAnswersByQuestionId(
  questionId: number,
  options?: QueryOptions
): QueryResult<Answer[]> {
  return useQuery<Answer[]>(
    () => answerService.getAllAnswersByQuestionId(questionId),
    {
      ...options,
      dependencies: [questionId, ...(options?.dependencies || [])]
    }
  );
}

export function useGetAnswerById(
  answerId: number,
  options?: QueryOptions
): QueryResult<Answer> {
  return useQuery<Answer>(() => answerService.getAnswerById(answerId), {
    ...options,
    dependencies: [answerId, ...(options?.dependencies || [])]
  });
}
