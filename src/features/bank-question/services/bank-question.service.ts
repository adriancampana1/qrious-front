import { apiClient } from '../../../shared/services/api.service';
import type { CreateBankQuestionDto } from '../dto/create-bank-question.dto';
import type { BankQuestion } from '../interfaces/bank-question';

export class BankQuestionService {
  private readonly baseEndpoint = 'bank-questions';

  async getAllBankQuestions(): Promise<BankQuestion[]> {
    return apiClient.get<BankQuestion[]>(this.baseEndpoint);
  }

  async getBankQuestionById(id: number): Promise<BankQuestion> {
    return apiClient.get<BankQuestion>(`${this.baseEndpoint}/${id}`);
  }

  async getBankQuestionsByTheme(theme: string): Promise<BankQuestion[]> {
    return apiClient.get<BankQuestion[]>(`${this.baseEndpoint}/theme/${theme}`);
  }

  async getBankQuestionsByDifficulty(
    difficulty: string
  ): Promise<BankQuestion[]> {
    return apiClient.get<BankQuestion[]>(
      `${this.baseEndpoint}/difficulty/${difficulty}`
    );
  }

  async createBankQuestion(
    data: CreateBankQuestionDto
  ): Promise<CreateBankQuestionDto> {
    return apiClient.post<CreateBankQuestionDto>(this.baseEndpoint, data);
  }

  async updateBankQuestion(
    id: number,
    data: Partial<CreateBankQuestionDto>
  ): Promise<CreateBankQuestionDto> {
    return apiClient.put<CreateBankQuestionDto>(
      `${this.baseEndpoint}/${id}`,
      data
    );
  }

  async deleteBankQuestion(id: number): Promise<void> {
    return apiClient.delete<void>(`${this.baseEndpoint}/${id}`);
  }
}

export const bankQuestionService = new BankQuestionService();
