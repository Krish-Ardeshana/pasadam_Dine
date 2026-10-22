import {
  AuthResponse,
  AuthTokens,
  Category,
  Dish,
  MediaAsset,
  MediaType,
  PaginatedResponse,
  PublicMenuResponse,
  QrCode,
  QrType,
  Restaurant,
  RestaurantApprovalStatus,
  User,
  Order,
  CreateOrderInput,
  UpdateOrderStatusInput,
  OrderStatus,
  PublicPaymentConfig,
  PaymentOrderResponse,
  VerifyPaymentInput,
} from './types';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export const BACKEND_ORIGIN =
  process.env.NEXT_PUBLIC_BACKEND_ORIGIN || 'http://localhost:4000';

class ApiClient {
  private getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('prasadam_access_token');
  }

  private getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('prasadam_refresh_token');
  }

  public setTokens(tokens: AuthTokens) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('prasadam_access_token', tokens.accessToken);
      localStorage.setItem('prasadam_refresh_token', tokens.refreshToken);
    }
  }

  public clearTokens() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('prasadam_access_token');
      localStorage.removeItem('prasadam_refresh_token');
      localStorage.removeItem('prasadam_current_restaurant');
    }
  }

  /**
   * Helper to format media URL.
   * If local storage URL starts with /api/v1/media/file/..., prepends backend origin.
   */
  public resolveMediaUrl(url?: string): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url;
    }
    if (url.startsWith('/')) {
      return `${BACKEND_ORIGIN}${url}`;
    }
    return `${BACKEND_ORIGIN}/${url}`;
  }

  private refreshPromise: Promise<AuthTokens | null> | null = null;

  private async refreshSession(): Promise<AuthTokens | null> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.clearTokens();
      return null;
    }

    this.refreshPromise = (async () => {
      try {
        const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });

        if (refreshRes.ok) {
          const newTokens: AuthTokens = await refreshRes.json();
          this.setTokens(newTokens);
          return newTokens;
        } else {
          this.clearTokens();
          return null;
        }
      } catch {
        this.clearTokens();
        return null;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryOnAuth = true,
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    const token = this.getAccessToken();
    if (token && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // If body is not FormData, ensure Content-Type is application/json
    if (options.body && !(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401 && retryOnAuth) {
      const newTokens = await this.refreshSession();
      if (newTokens) {
        headers['Authorization'] = `Bearer ${newTokens.accessToken}`;
        return this.request<T>(endpoint, { ...options, headers }, false);
      }
      this.clearTokens();
    }

    if (!response.ok) {
      let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage =
          Array.isArray(errorData.message)
            ? errorData.message.join(', ')
            : errorData.message || errorMessage;
      } catch {
        // Fallback to generic message
      }
      throw new Error(errorMessage);
    }

    // For 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // ==========================================================================
  // AUTHENTICATION
  // ==========================================================================
  auth = {
    login: async (credentials: { email: string; password: string }): Promise<AuthResponse> => {
      const res = await this.request<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      this.setTokens(res);
      return res;
    },

    register: async (payload: { name: string; email: string; password: string; role?: string }): Promise<AuthResponse> => {
      const res = await this.request<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      this.setTokens(res);
      return res;
    },

    getMe: (): Promise<User> => {
      return this.request<User>('/auth/me');
    },

    logout: async (): Promise<void> => {
      try {
        await this.request('/auth/logout', { method: 'POST' });
      } finally {
        this.clearTokens();
      }
    },
  };

  // ==========================================================================
  // RESTAURANTS
  // ==========================================================================
  restaurants = {
    list: (params?: { page?: number; limit?: number; search?: string }): Promise<PaginatedResponse<Restaurant>> => {
      const query = new URLSearchParams();
      if (params?.page) query.append('page', params.page.toString());
      if (params?.limit) query.append('limit', params.limit.toString());
      if (params?.search) query.append('search', params.search);
      return this.request<PaginatedResponse<Restaurant>>(`/restaurants?${query.toString()}`);
    },

    getById: (id: string): Promise<Restaurant> => {
      return this.request<Restaurant>(`/restaurants/${id}`);
    },

    create: (payload: Partial<Restaurant>): Promise<Restaurant> => {
      return this.request<Restaurant>('/restaurants', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    update: (id: string, payload: Partial<Restaurant>): Promise<Restaurant> => {
      return this.request<Restaurant>(`/restaurants/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
    },

    updateApproval: (
      id: string,
      payload: { approvalStatus: RestaurantApprovalStatus; isActive?: boolean },
    ): Promise<Restaurant> => {
      return this.request<Restaurant>(`/restaurants/${id}/approval`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
    },

    transferOwnership: (id: string, newOwnerId: string): Promise<Restaurant> => {
      return this.request<Restaurant>(`/restaurants/${id}/owner`, {
        method: 'PATCH',
        body: JSON.stringify({ newOwnerId }),
      });
    },
  };

  // ==========================================================================
  // CATEGORIES
  // ==========================================================================
  categories = {
    list: (restaurantId: string): Promise<Category[]> => {
      return this.request<Category[]>(`/restaurants/${restaurantId}/categories`);
    },

    create: (restaurantId: string, payload: Partial<Category>): Promise<Category> => {
      return this.request<Category>(`/restaurants/${restaurantId}/categories`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    update: (restaurantId: string, categoryId: string, payload: Partial<Category>): Promise<Category> => {
      return this.request<Category>(`/restaurants/${restaurantId}/categories/${categoryId}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
    },

    reorder: (restaurantId: string, orders: { id: string; displayOrder: number }[]): Promise<{ success: boolean }> => {
      return this.request<{ success: boolean }>(`/restaurants/${restaurantId}/categories/reorder`, {
        method: 'PUT',
        body: JSON.stringify({ orders }),
      });
    },

    remove: (restaurantId: string, categoryId: string): Promise<{ success: boolean }> => {
      return this.request<{ success: boolean }>(`/restaurants/${restaurantId}/categories/${categoryId}`, {
        method: 'DELETE',
      });
    },
  };

  // ==========================================================================
  // DISHES
  // ==========================================================================
  dishes = {
    list: (
      restaurantId: string,
      params?: { page?: number; limit?: number; search?: string; categoryId?: string; isAvailable?: boolean; isPublished?: boolean; dietary?: string },
    ): Promise<PaginatedResponse<Dish>> => {
      const query = new URLSearchParams();
      if (params?.page) query.append('page', params.page.toString());
      if (params?.limit) query.append('limit', params.limit.toString());
      if (params?.search) query.append('search', params.search);
      if (params?.categoryId) query.append('categoryId', params.categoryId);
      if (params?.isAvailable !== undefined) query.append('isAvailable', String(params.isAvailable));
      if (params?.isPublished !== undefined) query.append('isPublished', String(params.isPublished));
      if (params?.dietary) query.append('dietary', params.dietary);
      return this.request<PaginatedResponse<Dish>>(`/restaurants/${restaurantId}/dishes?${query.toString()}`);
    },

    getById: (restaurantId: string, dishId: string): Promise<Dish> => {
      return this.request<Dish>(`/restaurants/${restaurantId}/dishes/${dishId}`);
    },

    create: (restaurantId: string, payload: Partial<Dish>): Promise<Dish> => {
      return this.request<Dish>(`/restaurants/${restaurantId}/dishes`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    update: (restaurantId: string, dishId: string, payload: Partial<Dish>): Promise<Dish> => {
      return this.request<Dish>(`/restaurants/${restaurantId}/dishes/${dishId}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
    },

    updatePrice: (restaurantId: string, dishId: string, price: number): Promise<Dish> => {
      return this.request<Dish>(`/restaurants/${restaurantId}/dishes/${dishId}/price`, {
        method: 'PATCH',
        body: JSON.stringify({ price }),
      });
    },

    updateAvailability: (restaurantId: string, dishId: string, isAvailable: boolean): Promise<Dish> => {
      return this.request<Dish>(`/restaurants/${restaurantId}/dishes/${dishId}/availability`, {
        method: 'PATCH',
        body: JSON.stringify({ isAvailable }),
      });
    },

    publish: (restaurantId: string, dishId: string, isPublished: boolean): Promise<Dish> => {
      return this.request<Dish>(`/restaurants/${restaurantId}/dishes/${dishId}/publish`, {
        method: 'PATCH',
        body: JSON.stringify({ isPublished }),
      });
    },

    remove: (restaurantId: string, dishId: string): Promise<{ success: boolean }> => {
      return this.request<{ success: boolean }>(`/restaurants/${restaurantId}/dishes/${dishId}`, {
        method: 'DELETE',
      });
    },
  };

  // ==========================================================================
  // MEDIA
  // ==========================================================================
  media = {
    upload: (
      restaurantId: string,
      file: File,
      mediaType: MediaType,
      dishId?: string,
    ): Promise<MediaAsset> => {
      const formData = new FormData();
      formData.append('file', file);
      const query = new URLSearchParams({ mediaType });
      if (dishId) query.append('dishId', dishId);
      return this.request<MediaAsset>(
        `/restaurants/${restaurantId}/media/upload?${query.toString()}`,
        {
          method: 'POST',
          body: formData,
        },
      );
    },

    list: (restaurantId: string): Promise<MediaAsset[]> => {
      return this.request<MediaAsset[]>(`/restaurants/${restaurantId}/media`);
    },

    delete: (restaurantId: string, assetId: string): Promise<{ success: boolean }> => {
      return this.request<{ success: boolean }>(
        `/restaurants/${restaurantId}/media/${assetId}`,
        { method: 'DELETE' },
      );
    },
  };

  // ==========================================================================
  // QR CODES
  // ==========================================================================
  qr = {
    generate: (
      restaurantId: string,
      payload: { qrType: QrType; dishId?: string },
    ): Promise<QrCode> => {
      return this.request<QrCode>(`/restaurants/${restaurantId}/qr/generate`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    regenerate: (restaurantId: string, qrId: string): Promise<QrCode> => {
      return this.request<QrCode>(`/restaurants/${restaurantId}/qr/${qrId}/regenerate`, {
        method: 'POST',
      });
    },

    list: (restaurantId: string): Promise<QrCode[]> => {
      return this.request<QrCode[]>(`/restaurants/${restaurantId}/qr`);
    },

    getDownloadUrl: (restaurantId: string, qrId: string): string => {
      return `${API_BASE_URL}/restaurants/${restaurantId}/qr/${qrId}/download`;
    },
  };

  // ==========================================================================
  // PUBLIC MENU
  // ==========================================================================
  publicMenu = {
    getRestaurant: (slug: string): Promise<Restaurant> => {
      return this.request<Restaurant>(`/public/restaurants/${slug}`);
    },

    getFullMenu: (slug: string): Promise<PublicMenuResponse> => {
      return this.request<PublicMenuResponse>(`/public/restaurants/${slug}/menu`);
    },

    getDish: (restaurantSlug: string, dishSlug: string): Promise<{ restaurant: Restaurant; dish: Dish }> => {
      return this.request<{ restaurant: Restaurant; dish: Dish }>(
        `/public/restaurants/${restaurantSlug}/dishes/${dishSlug}`,
      );
    },
  };

  // ==========================================================================
  // USERS & STAFF
  // ==========================================================================
  users = {
    list: (params?: { page?: number; limit?: number; search?: string }): Promise<PaginatedResponse<User>> => {
      const query = new URLSearchParams();
      if (params?.page) query.append('page', params.page.toString());
      if (params?.limit) query.append('limit', params.limit.toString());
      if (params?.search) query.append('search', params.search);
      return this.request<PaginatedResponse<User>>(`/users?${query.toString()}`);
    },

    createStaff: (payload: { name: string; email: string; password: string; role: string; restaurantId: string }): Promise<User> => {
      return this.request<User>('/users/staff', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    update: (id: string, payload: Partial<User>): Promise<User> => {
      return this.request<User>(`/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
    },
  };

  // ==========================================================================
  // ORDERS & REAL-TIME KDS
  // ==========================================================================
  orders = {
    createPublicOrder: (restaurantSlug: string, input: CreateOrderInput): Promise<Order> => {
      return this.request<Order>(`/public/restaurants/${restaurantSlug}/orders`, {
        method: 'POST',
        body: JSON.stringify(input),
      });
    },

    getPublicOrderStatus: (restaurantSlug: string, orderNumber: string): Promise<{ order: Order; restaurant: { name: string; slug: string } }> => {
      return this.request<{ order: Order; restaurant: { name: string; slug: string } }>(
        `/public/restaurants/${restaurantSlug}/orders/${orderNumber}`,
      );
    },

    listRestaurantOrders: (
      restaurantId: string,
      params?: {
        page?: number;
        limit?: number;
        status?: OrderStatus;
        activeOnly?: boolean;
        search?: string;
      },
    ): Promise<{ data: Order[]; total: number; page: number; limit: number; totalPages: number }> => {
      const query = new URLSearchParams();
      if (params?.page) query.append('page', params.page.toString());
      if (params?.limit) query.append('limit', params.limit.toString());
      if (params?.status) query.append('status', params.status);
      if (params?.activeOnly) query.append('activeOnly', 'true');
      if (params?.search) query.append('search', params.search);

      return this.request<{ data: Order[]; total: number; page: number; limit: number; totalPages: number }>(
        `/restaurants/${restaurantId}/orders?${query.toString()}`,
      );
    },

    getOrderDetail: (restaurantId: string, orderId: string): Promise<Order> => {
      return this.request<Order>(`/restaurants/${restaurantId}/orders/${orderId}`);
    },

    updateOrderStatus: (
      restaurantId: string,
      orderId: string,
      input: UpdateOrderStatusInput,
    ): Promise<Order> => {
      return this.request<Order>(`/restaurants/${restaurantId}/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify(input),
      });
    },

    getOrderStreamUrl: (restaurantId: string): string => {
      return `${API_BASE_URL}/restaurants/${restaurantId}/orders/stream`;
    },
  };

  // ==========================================================================
  // PAYMENTS (RAZORPAY TEST MODE & REFUNDS)
  // ==========================================================================
  payments = {
    getPublicConfig: (restaurantSlug: string): Promise<PublicPaymentConfig> => {
      return this.request<PublicPaymentConfig>(
        `/public/restaurants/${restaurantSlug}/payments/config`,
      );
    },

    createPaymentOrder: (
      restaurantSlug: string,
      orderNumber: string,
    ): Promise<PaymentOrderResponse> => {
      return this.request<PaymentOrderResponse>(
        `/public/restaurants/${restaurantSlug}/payments/orders/${orderNumber}/create`,
        {
          method: 'POST',
        },
      );
    },

    verifyPayment: (
      restaurantSlug: string,
      orderNumber: string,
      input: VerifyPaymentInput,
    ): Promise<{ message: string; order: Order }> => {
      return this.request<{ message: string; order: Order }>(
        `/public/restaurants/${restaurantSlug}/payments/orders/${orderNumber}/verify`,
        {
          method: 'POST',
          body: JSON.stringify(input),
        },
      );
    },

    refundOrder: (
      restaurantId: string,
      orderId: string,
      input: { amount?: number; reason?: string },
    ): Promise<{ message: string; order: Order }> => {
      return this.request<{ message: string; order: Order }>(
        `/restaurants/${restaurantId}/payments/orders/${orderId}/refund`,
        {
          method: 'POST',
          body: JSON.stringify(input),
        },
      );
    },
  };
}

export const api = new ApiClient();
