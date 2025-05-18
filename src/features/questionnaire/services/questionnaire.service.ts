import { apiClient } from '../../../shared/services/api.service';
import type { CreateQuestionnaireDto } from '../dto/create-questionnaire.dto';
import type { Questionnaire } from '../interfaces/questionnaire';

export class QuestionnaireService {
  private readonly baseEndpoint = 'questionnaires';

  async createQuestionnaire(
    data: CreateQuestionnaireDto
  ): Promise<Questionnaire> {
    return apiClient.post<Questionnaire>(this.baseEndpoint, data);
  }

  async updateQuestionnaire(
    id: number,
    data: Partial<CreateQuestionnaireDto>
  ): Promise<Questionnaire> {
    return apiClient.put<Questionnaire>(`${this.baseEndpoint}/${id}`, data);
  }

  async deleteQuestionnaire(id: number): Promise<void> {
    return apiClient.delete<void>(`${this.baseEndpoint}/${id}`);
  }
}

export const questionnaireService = new QuestionnaireService();
