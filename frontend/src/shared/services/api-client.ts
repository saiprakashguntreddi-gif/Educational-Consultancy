export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string | Record<string, any>;
  timestamp: string;
}

class ApiClient {
  private getAuthToken(): string | null {
    return localStorage.getItem('superc_token');
  }

  public async request<T = any>(
    url: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data: ApiResponse<T> = await response.json();

      if (!response.ok) {
        throw new Error(
          (typeof data.error === 'string' ? data.error : data.message) ||
          `Request failed with status ${response.status}`
        );
      }

      return data;
    } catch (err: any) {
      throw new Error(err.message || 'Network error');
    }
  }

  public get<T = any>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...options, method: 'GET' });
  }

  public post<T = any>(url: string, body?: any, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public put<T = any>(url: string, body?: any, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public patch<T = any>(url: string, body?: any, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public delete<T = any>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
