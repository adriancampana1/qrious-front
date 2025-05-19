import type { Question } from '../interfaces/question';
import { questionService } from '../services/question.service';
import {
  useQuery,
  type QueryOptions,
  type QueryResult
} from '../../../shared/hooks/use-query';

export function useGetAllQuestionsBySessionId(
  sessionId: number,
  options?: QueryOptions
): QueryResult<Question[]> {
  return useQuery<Question[]>(
    () => questionService.getAllQuestionsBySessionId(sessionId),
    {
      ...options,
      dependencies: [sessionId, ...(options?.dependencies || [])]
    }
  );
}

export function useRankedQuestions(
  sessionId: number,
  options?: QueryOptions
): QueryResult<Question[]> {
  return useQuery<Question[]>(
    () => questionService.getRankedQuestionsBySessionId(sessionId),
    {
      ...options,
      dependencies: [sessionId, ...(options?.dependencies || [])]
    }
  );
}

export function useGetQuestionById(
  sessionId: number,
  id: number,
  options?: QueryOptions
): QueryResult<Question> {
  return useQuery<Question>(
    () => questionService.getQuestionById(sessionId, id),
    {
      ...options,
      dependencies: [sessionId, id, ...(options?.dependencies || [])]
    }
  );
}
