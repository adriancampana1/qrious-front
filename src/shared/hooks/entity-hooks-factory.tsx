import { apiClient } from '../services/api.service';
import {
  useQuery,
  type QueryOptions,
  type QueryResult,
  type PaginatedResponse,
  type PaginationMeta
} from './use-query';

export interface PaginationParams {
  page?: number;
  limit?: number;
  [key: string]: unknown;
}

export interface EntityHooks<T> {
  useGetAll: (options?: QueryOptions<PaginationParams>) => QueryResult<T[]>;
  useGetById: (id: number, options?: QueryOptions) => QueryResult<T>;
  usePaginated: (
    options?: QueryOptions<PaginationParams>
  ) => QueryResult<T[]> & { pagination: PaginationMeta | undefined };
}

export function createEntityHooks<TEntity>(
  endpoint: string
): EntityHooks<TEntity> {
  const useGetAll = (options?: QueryOptions<PaginationParams>) => {
    return useQuery<TEntity[], PaginationParams>( // Add the second type parameter
      (params) =>
        apiClient.get<TEntity[] | PaginatedResponse<TEntity>>(endpoint, {
          params: params
        }),
      options
    );
  };

  const useGetById = (id: number, options?: QueryOptions) => {
    return useQuery<TEntity>(
      () => apiClient.get<TEntity>(`${endpoint}/${id}`),
      {
        ...options,
        dependencies: [id, ...(options?.dependencies || [])]
      }
    );
  };

  // Hook específico para endpoints paginados
  const usePaginated = (options?: QueryOptions<PaginationParams>) => {
    const result = useQuery<TEntity[], PaginationParams>(
      (params) =>
        apiClient.get<PaginatedResponse<TEntity>>(endpoint, {
          params: params
        }),
      options
    );

    return {
      ...result,
      pagination: result.pagination
    };
  };

  return {
    useGetAll,
    useGetById,
    usePaginated
  };
}
