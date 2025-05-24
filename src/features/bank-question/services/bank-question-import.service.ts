import { apiClient } from '../../../shared/services/api.service';
import type { ImportResultDto } from '../dto/import-result.dto';

export class BankQuestionImportService {
  private readonly baseEndpoint = 'bank-questions/import';

  async importQuestions(file: File): Promise<ImportResultDto> {
    const formData = new FormData();
    formData.append('file', file);

    return apiClient.post<ImportResultDto>(this.baseEndpoint, formData);
  }
}

export const bankQuestionImportService = new BankQuestionImportService();
