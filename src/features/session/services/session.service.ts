import { apiClient } from '../../../shared/services/api.service';
import type { CreateSessionDto } from '../dto/create-session.dto';
import type { FindSessionByAccessDto } from '../dto/find-session-by-access.dto';
import type { JoinSessionDto } from '../dto/join-session.dto';
import type { SessionWithRelations } from '../interfaces/session';

export class SessionService {
  private readonly baseEndpoint = 'sessions';

  async getAllSessions(): Promise<SessionWithRelations[]> {
    return apiClient.get<SessionWithRelations[]>(this.baseEndpoint);
  }

  async getSessionById(id: number): Promise<SessionWithRelations> {
    return apiClient.get<SessionWithRelations>(`${this.baseEndpoint}/${id}`);
  }

  async getSessionByCode(
    findSessionByAccessDto: FindSessionByAccessDto
  ): Promise<SessionWithRelations> {
    return apiClient.post<SessionWithRelations>(
      `${this.baseEndpoint}/find`,
      findSessionByAccessDto
    );
  }

  async createSession(data: CreateSessionDto): Promise<SessionWithRelations> {
    return apiClient.post<SessionWithRelations>(this.baseEndpoint, data);
  }

  async updateSession(
    id: number,
    data: Partial<CreateSessionDto>
  ): Promise<SessionWithRelations> {
    return apiClient.put<SessionWithRelations>(
      `${this.baseEndpoint}/${id}`,
      data
    );
  }

  async deleteSession(id: number): Promise<void> {
    return apiClient.delete<void>(`${this.baseEndpoint}/${id}`);
  }

  async joinSession(
    id: number,
    joinSessionDto: JoinSessionDto
  ): Promise<{ success: boolean; message: string }> {
    return apiClient.post<{ success: boolean; message: string }>(
      `${this.baseEndpoint}/${id}/participants/join`,
      joinSessionDto
    );
  }

  async leaveSession(
    id: number
  ): Promise<{ success: boolean; message: string }> {
    return apiClient.post<{ success: boolean; message: string }>(
      `${this.baseEndpoint}/${id}/leave`
    );
  }
}

export const sessionService = new SessionService();
