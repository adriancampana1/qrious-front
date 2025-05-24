import { apiClient } from '../../../shared/services/api.service';
import type { CreateQuestionnaireAttemptDto } from '../dto/create-questionnaire-attempt.dto';
import type { SubmitQuestionnaireDto } from '../dto/submit-questionnaire.dto';
import type { QuestionnaireAttempt } from '../interfaces/questionnaire-attempt';

export class QuestionnaireAttemptService {
  private readonly baseEndpoint = 'questionnaires';

  async createAttempt(
    questionnaireId: number,
    data: CreateQuestionnaireAttemptDto
  ): Promise<QuestionnaireAttempt> {
    return apiClient.post<QuestionnaireAttempt>(
      `${this.baseEndpoint}/${questionnaireId}/attempts`,
      data
    );
  }

  async submitResponses(
    questionnaireId: number,
    attemptId: number,
    data: SubmitQuestionnaireDto
  ): Promise<void> {
    return apiClient.post<void>(
      `${this.baseEndpoint}/${questionnaireId}/attempts/${attemptId}/responses/submit`,
      data
    );
  }

  async getAttemptsByUser(
    questionnaireId: number
  ): Promise<QuestionnaireAttempt[]> {
    return apiClient.get<QuestionnaireAttempt[]>(
      `${this.baseEndpoint}/${questionnaireId}/attempts`
    );
  }

  async getAttemptById(
    questionnaireId: number,
    attemptId: number
  ): Promise<QuestionnaireAttempt> {
    return apiClient.get<QuestionnaireAttempt>(
      `${this.baseEndpoint}/${questionnaireId}/attempts/${attemptId}`
    );
  }

  async getAllAttempts(
    questionnaireId: number
  ): Promise<QuestionnaireAttempt[]> {
    return apiClient.get<QuestionnaireAttempt[]>(
      `${this.baseEndpoint}/${questionnaireId}/attempts/responses`
    );
  }
}

export const questionnaireAttemptService = new QuestionnaireAttemptService();
