import { message } from 'antd';

export class ApiError extends Error {
  public statusCode: number;
  public data?: Record<string, unknown> | string | null;

  constructor(
    message: string,
    statusCode: number,
    data?: Record<string, unknown> | string | null
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.data = data || null;
  }
}

export interface RequestOptions {
  requiresAuth?: boolean;
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl =
      baseUrl ||
      import.meta.env.VITE_API_URL ||
      'https://qrious-api.onrender.com';
  }

  private getAuthToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  private createHeaders(options?: RequestOptions): Headers {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');

    if (options?.headers) {
      Object.entries(options.headers).forEach(([key, value]) => {
        headers.append(key, value);
      });
    }

    if (options?.requiresAuth !== false) {
      const token = this.getAuthToken();
      if (token) {
        headers.append('Authorization', `Bearer ${token}`);
      }
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    let data: Record<string, unknown> | string | null = null;

    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const errorMessage =
        typeof data === 'object' && data !== null && 'message' in data
          ? ((data as Record<string, unknown>).message as string)
          : response.statusText || 'Unknown error occurred';
      throw new ApiError(errorMessage, response.status, data);
    }

    return data as T;
  }

  private async request<TResponse, TData = unknown>(
    method: string,
    endpoint: string,
    data?: TData,
    options?: RequestOptions
  ): Promise<TResponse> {
    try {
      let url = `${this.baseUrl}/${endpoint.replace(/^\//, '')}`;

      if (options?.params && Object.keys(options.params).length > 0) {
        const queryParams = new URLSearchParams();
        Object.entries(options.params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, String(value));
          }
        });
        url += `?${queryParams.toString()}`;
      }

      const isFormData = data instanceof FormData;

      const headers = this.createHeaders(options);

      if (isFormData) {
        headers.delete('Content-Type');
      }

      const config: RequestInit = {
        method,
        headers,
        credentials: 'include'
      };

      if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
        config.body = isFormData
          ? (data as unknown as FormData)
          : JSON.stringify(data);
      }

      const response = await fetch(url, config);
      return this.handleResponse<TResponse>(response);
    } catch (error) {
      if (error instanceof ApiError) {
        console.error(`API Error (${error.statusCode}):`, error.message);
        message.error(error.message);
        throw error;
      } else {
        const errorMessage =
          error instanceof Error ? error.message : 'Network error occurred';
        console.error('Request failed:', errorMessage);
        message.error('Failed to connect to the server');
        throw new ApiError(errorMessage, 0);
      }
    }
  }

  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>('GET', endpoint, undefined, options);
  }

  async post<TResponse, TData = unknown>(
    endpoint: string,
    data?: TData,
    options?: RequestOptions
  ): Promise<TResponse> {
    return this.request<TResponse>('POST', endpoint, data, options);
  }

  async put<TResponse, TData = unknown>(
    endpoint: string,
    data?: TData,
    options?: RequestOptions
  ): Promise<TResponse> {
    return this.request<TResponse>('PUT', endpoint, data, options);
  }

  async patch<TResponse, TData = unknown>(
    endpoint: string,
    data?: TData,
    options?: RequestOptions
  ): Promise<TResponse> {
    return this.request<TResponse>('PATCH', endpoint, data, options);
  }

  async delete<TResponse>(
    endpoint: string,
    options?: RequestOptions
  ): Promise<TResponse> {
    return this.request<TResponse>('DELETE', endpoint, undefined, options);
  }
}

export const apiClient = new ApiClient();
