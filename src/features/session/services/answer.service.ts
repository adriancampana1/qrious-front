import { apiClient } from '../../../shared/services/api.service';
import type { CreateAnswerDto } from '../dto/create-answer.dto';
import type { Answer } from '../interfaces/answer';

export class AnswerService {
  private readonly baseEndpoint = 'questions';

  async getAllAnswersByQuestionId(questionId: number): Promise<Answer[]> {
    return apiClient.get<Answer[]>(
      `${this.baseEndpoint}/${questionId}/answers/all`
    );
  }

  async getAnswerById(answerId: number): Promise<Answer> {
    return apiClient.get<Answer>(`${this.baseEndpoint}/answers/${answerId}`);
  }

  async createAnswer(id: number, data: CreateAnswerDto): Promise<Answer> {
    return apiClient.post<Answer>(`${this.baseEndpoint}/${id}/answers`, data);
  }

  async updateAnswer(
    id: number,
    answerId: number,
    data: Partial<CreateAnswerDto>
  ): Promise<Answer> {
    return apiClient.put<Answer>(
      `${this.baseEndpoint}/${id}/answers/${answerId}`,
      data
    );
  }

  async deleteAnswer(id: number, answerId: number): Promise<void> {
    return apiClient.delete<void>(
      `${this.baseEndpoint}/${id}/answers/${answerId}`
    );
  }
}

export const answerService = new AnswerService();
