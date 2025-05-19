import { createEntityHooks } from '../../../shared/hooks/entity-hooks-factory';
import type { User } from '../types/auth.types';

const userHooks = createEntityHooks<User>('users');

export const useGetAllUsers = userHooks.useGetAll;
