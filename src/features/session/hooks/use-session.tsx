import { createEntityHooks } from '../../../shared/hooks/entity-hooks-factory';
import type { SessionWithRelations } from '../interfaces/session';

export const sessionHooks = createEntityHooks<SessionWithRelations>('sessions');

export const useGetAllSessions = sessionHooks.useGetAll;
export const useGetSessionById = sessionHooks.useGetById;
