import { encryptionService } from './encryption';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5126';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

class ApiService {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    bypassEncryption: boolean = false
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    if (bypassEncryption) {
      headers['X-Bypass-Encryption'] = 'true';
    }

    // Encrypt request body (unless bypassing)
    if (options.body && typeof options.body === 'string' && !bypassEncryption) {
      options.body = encryptionService.encrypt(options.body);
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });
      if (!response.ok) {
        let errorText = `HTTP ${response.status}`;
        try {
          const errorData = await response.text();
          errorText = errorData || errorText;
        } catch (e) {
          // Ignore parsing errors
        }
        return {
          success: false,
          error: errorText,
        };
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const responseText = await response.text();
        let result;
        
        if (bypassEncryption) {
          result = JSON.parse(responseText || '{}');
        } else {
          const decryptedText = encryptionService.decrypt(responseText);
          result = JSON.parse(decryptedText || '{}');
        }
        
        return {
          success: result.success || true,
          data: result.data || result,
          error: result.error
        };
      } else {
        // Handle non-JSON responses (like file downloads)
        const data = await response.blob();
        return {
          success: true,
          data,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const result =  this.request<{ token: string; user: any }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    console.log("[LOGIN RESPONSE]", result);
    return result;
  }

  async register(userData: any) {
    return this.request<{ token: string; user: any }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Parent endpoints
  async getParents() {
    return this.request<any[]>('/api/parents/list', {
      method: 'POST',
    });
  }

  async createParent(parentData: any) {
    return this.request<any>('/api/parents', {
      method: 'POST',
      body: JSON.stringify(parentData),
    });
  }

  async getParentQrCode(parentId: string) {
    return this.request<Blob>('/api/parents/qr', {
      method: 'POST',
      body: JSON.stringify({ id: parentId }),
    });
  }

  // Child endpoints
  async getChildren() {
    return this.request<any[]>('/api/children/list', {
      method: 'POST',
    });
  }

  async createChild(parentId: string, childData: any) {
    return this.request<any>(`/api/parents/${parentId}/children`, {
      method: 'POST',
      body: JSON.stringify(childData),
    });
  }

  // Attendance endpoints
  async checkIn(childId: string, notes?: string) {
    return this.request<any>('/api/attendance/checkin', {
      method: 'POST',
      body: JSON.stringify({ childId, notes }),
    });
  }

  async checkOut(recordId: string, notes?: string) {
    return this.request<any>('/api/attendance/checkout', {
      method: 'POST',
      body: JSON.stringify({ recordId, notes }),
    });
  }

  async getAttendanceRecords() {
    return this.request<any[]>('/api/attendance/list', {
      method: 'POST',
    });
  }

  async markAttendance(childIds: string[], action: 'CheckIn' | 'CheckOut') {
    return this.request<any>('/api/attendance/mark', {
      method: 'POST',
      body: JSON.stringify({ childIds, action }),
    });
  }

  async getSessionReport(date: string) {
    return this.request<any[]>('/api/attendance/reports/session', {
      method: 'POST',
      body: JSON.stringify({ date }),
    });
  }

  // QR Code scanning
  async scanQrCode(qrData: string) {
    return this.request<any>('/api/scan', {
      method: 'POST',
      body: JSON.stringify({ qrData }),
    });
  }

  // Logout
  async logout() {
    const result = await this.request<any>('/api/auth/logout', {
      method: 'POST',
    });
    if (result.success) {
      this.clearToken();
    }
    return result;
  }

  // Health check (bypass encryption)
  async healthCheck() {
    return this.request<any>('/health', { method: 'GET' }, true);
  }


}

export const apiService = new ApiService();
export default apiService;