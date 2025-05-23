import type { SessionAccessType } from '../interfaces/session';

export interface FindSessionByAccessDto {
  accessType: SessionAccessType;
  accessValue: string;
}
