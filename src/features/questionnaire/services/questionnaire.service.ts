import { apiClient } from '../../../shared/services/api.service';
import type { CreateQuestionnaireDto } from '../dto/create-questionnaire.dto';
import type { Questionnaire } from '../interfaces/questionnaire';
import type { GenerateQuestionnaireDto } from '../dto/generate-questionnaire.dto';

export class QuestionnaireService {
  private readonly baseEndpoint = 'questionnaires';

  async createQuestionnaire(
    data: CreateQuestionnaireDto
  ): Promise<Questionnaire> {
    return apiClient.post<Questionnaire>(this.baseEndpoint, data);
  }

  async generateQuestionnaire(
    data: GenerateQuestionnaireDto
  ): Promise<Questionnaire> {
    return apiClient.post<Questionnaire>(`${this.baseEndpoint}/generate`, data);
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

  async getAvailableQuestionnaires(): Promise<Questionnaire[]> {
    return apiClient.get<Questionnaire[]>(`${this.baseEndpoint}/available`);
  }
}

export const questionnaireService = new QuestionnaireService();
