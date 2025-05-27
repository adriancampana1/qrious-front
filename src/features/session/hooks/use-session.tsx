import { useQuery } from '@tanstack/react-query';
import { createEntityHooks } from '../../../shared/hooks/entity-hooks-factory';
import type { SessionWithRelations } from '../interfaces/session';
import { sessionService } from '../services/session.service';

export const sessionHooks = createEntityHooks<SessionWithRelations>('sessions');

export const useGetAllSessions = sessionHooks.useGetAll;
export const useGetSessionById = sessionHooks.useGetById;

export const useGetSessionsByUserId = () => {
  return useQuery({
    queryKey: ['sessions', 'my-sessions'],
    queryFn: () => sessionService.getSessionsByUserId()
  });
};
