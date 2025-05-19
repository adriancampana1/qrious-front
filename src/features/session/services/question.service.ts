import { apiClient } from '../../../shared/services/api.service';
import type { CreateQuestionDto } from '../dto/create-question.dto';
import type { Question } from '../interfaces/question';

export class QuestionService {
  private readonly baseEndpoint = 'sessions';

  async getAllQuestionsBySessionId(sessionId: number): Promise<Question[]> {
    return apiClient.get<Question[]>(
      `${this.baseEndpoint}/${sessionId}/questions`
    );
  }

  async getRankedQuestionsBySessionId(sessionId: number): Promise<Question[]> {
    return apiClient.get<Question[]>(
      `${this.baseEndpoint}/${sessionId}/questions/ranking`
    );
  }

  async getQuestionById(sessionId: number, id: number): Promise<Question> {
    return apiClient.get<Question>(
      `${this.baseEndpoint}/${sessionId}/questions/${id}`
    );
  }

  async createQuestion(
    sessionId: number,
    data: CreateQuestionDto
  ): Promise<Question> {
    return apiClient.post<Question>(
      `${this.baseEndpoint}/${sessionId}/questions`,
      data
    );
  }

  async voteQuestion(sessionId: number, id: number): Promise<Question> {
    return apiClient.post<Question>(
      `${this.baseEndpoint}/${sessionId}/questions/${id}/vote`
    );
  }

  async updateQuestion(
    sessionId: number,
    id: number,
    data: Partial<CreateQuestionDto>
  ): Promise<Question> {
    return apiClient.put<Question>(
      `${this.baseEndpoint}/${sessionId}/questions/${id}`,
      data
    );
  }

  async deleteQuestion(sessionId: number, id: number): Promise<void> {
    return apiClient.delete<void>(
      `${this.baseEndpoint}/${sessionId}/questions/${id}`
    );
  }
}

export const questionService = new QuestionService();
