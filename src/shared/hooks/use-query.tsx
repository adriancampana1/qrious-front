import { useCallback, useEffect, useState } from 'react';
import { useLayoutLoading } from './use-layout';

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pageCount: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export type ApiResponse<T> =
  | T
  | PaginatedResponse<T extends Array<infer U> ? U : never>;

export function isPaginatedResponse<T>(
  response: unknown
): response is PaginatedResponse<T> {
  return (
    response !== null &&
    typeof response === 'object' &&
    'data' in response &&
    Array.isArray((response as PaginatedResponse<T>).data) &&
    'meta' in response &&
    typeof (response as PaginatedResponse<T>).meta === 'object'
  );
}

export interface QueryOptions<TParams = void, TData = unknown> {
  enabled?: boolean;
  onSuccess?: (data: TData) => void;
  onError?: (error: Error) => void;
  params?: TParams;
  dependencies?: unknown[];
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  pageCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface QueryResult<TData> {
  data: TData | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  pagination?: PaginationMeta;
}

export function useQuery<TData, TParams = void>(
  queryFn: (params?: TParams) => Promise<ApiResponse<TData>>,
  options: QueryOptions<TParams> = {}
): QueryResult<TData> {
  const {
    enabled = true,
    onSuccess,
    onError,
    params,
    dependencies = []
  } = options;

  const [data, setData] = useState<TData | null>(null);
  const [pagination, setPagination] = useState<PaginationMeta | undefined>(
    undefined
  );
  const { isLoading, setLoading } = useLayoutLoading();
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await queryFn(params);

      if (
        isPaginatedResponse<TData extends Array<infer U> ? U : never>(response)
      ) {
        const typedData = response.data as unknown as TData;
        setData(typedData);
        setPagination(response.meta);
        if (onSuccess) {
          onSuccess(typedData);
        }
        return response.data;
      } else {
        setData(response as TData);
        setPagination(undefined);
        if (onSuccess) {
          onSuccess(response as TData);
        }
        return response;
      }
    } catch (error) {
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      setError(errorObj);
      if (onError) {
        onError(errorObj);
      }
      throw errorObj;
    } finally {
      setLoading(false);
    }
  }, [queryFn, params, onSuccess, onError, setLoading]);

  const refetch = useCallback(async () => {
    if (enabled) {
      await fetchData();
    }
  }, [enabled, fetchData]);

  useEffect(() => {
    if (enabled) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ...dependencies]);

  return {
    data,
    isLoading,
    error,
    refetch,
    pagination
  };
}
