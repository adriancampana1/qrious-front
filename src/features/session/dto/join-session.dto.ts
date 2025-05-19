import type { SessionAccessType } from '../interfaces/session';

export interface JoinSessionDto {
  sessionId: number;
  sessionAccess: {
    type: SessionAccessType;
    value: string;
  };
}
