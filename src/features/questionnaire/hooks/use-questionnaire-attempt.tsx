import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { questionnaireAttemptService } from '../services/questionnaire-attempt.service';
import type { CreateQuestionnaireAttemptDto } from '../dto/create-questionnaire-attempt.dto';
import type { SubmitQuestionnaireDto } from '../dto/submit-questionnaire.dto';

export const useCreateAttempt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      questionnaireId,
      data
    }: {
      questionnaireId: number;
      data: CreateQuestionnaireAttemptDto;
    }) => questionnaireAttemptService.createAttempt(questionnaireId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questionnaire-attempts'] });
    }
  });
};

export const useSubmitResponses = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      questionnaireId,
      attemptId,
      data
    }: {
      questionnaireId: number;
      attemptId: number;
      data: SubmitQuestionnaireDto;
    }) =>
      questionnaireAttemptService.submitResponses(
        questionnaireId,
        attemptId,
        data
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questionnaire-attempts'] });
    }
  });
};

export const useGetAttemptsByUser = (questionnaireId: number) => {
  return useQuery({
    queryKey: ['questionnaire-attempts', 'user', questionnaireId],
    queryFn: () =>
      questionnaireAttemptService.getAttemptsByUser(questionnaireId),
    enabled: !!questionnaireId
  });
};

export const useGetAllAttempts = (questionnaireId: number) => {
  return useQuery({
    queryKey: ['questionnaire-attempts', 'all', questionnaireId],
    queryFn: () => questionnaireAttemptService.getAllAttempts(questionnaireId),
    enabled: !!questionnaireId
  });
};

export const useGetAttemptById = (
  questionnaireId: number,
  attemptId: number
) => {
  return useQuery({
    queryKey: ['questionnaire-attempts', questionnaireId, attemptId],
    queryFn: () =>
      questionnaireAttemptService.getAttemptById(questionnaireId, attemptId),
    enabled: !!questionnaireId && !!attemptId
  });
};
