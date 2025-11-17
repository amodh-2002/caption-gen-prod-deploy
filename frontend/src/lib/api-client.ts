/**
 * API Client for Caption Generator
 * Handles authentication and backend service communication
 */

const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:4000';
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface ApiError {
  message: string;
  status: number;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface SignupResponse extends LoginResponse {}

export interface Subscription {
  plan_name: string;
  status: string;
  captions_remaining: number;
  captions_limit: number;
}

export interface CaptionLimitCheck {
  has_remaining: boolean;
  captions_remaining: number;
  captions_limit: number;
  captions_used: number;
}

class ApiClient {
  private authToken: string | null = null;

  constructor() {
    // Initialize token from localStorage if available
    if (typeof window !== 'undefined') {
      this.authToken = localStorage.getItem('auth_token');
    }
  }

  private getAuthHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }
    return headers;
  }

  setAuthToken(token: string) {
    this.authToken = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  clearAuthToken() {
    this.authToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  getToken(): string | null {
    return this.authToken;
  }

  // Auth Service Endpoints

  async signup(email: string, password: string, fullName: string): Promise<LoginResponse> {
    const response = await fetch(`${AUTH_URL}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        full_name: fullName,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Signup failed');
    }

    const data = await response.json();
    this.setAuthToken(data.access_token);
    return data;
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${AUTH_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Login failed');
    }

    const data = await response.json();
    this.setAuthToken(data.access_token);
    return data;
  }

  async getCurrentUser(): Promise<User> {
    const response = await fetch(`${AUTH_URL}/me`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.clearAuthToken();
      }
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch user');
    }

    return response.json();
  }

  async getSubscription(): Promise<Subscription> {
    const response = await fetch(`${AUTH_URL}/subscription`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.clearAuthToken();
      }
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch subscription');
    }

    return response.json();
  }

  async checkCaptionLimit(): Promise<CaptionLimitCheck> {
    const response = await fetch(`${AUTH_URL}/caption/check-limit`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.clearAuthToken();
      }
      const error = await response.json();
      throw new Error(error.detail || 'Failed to check caption limit');
    }

    return response.json();
  }

  async validateToken(): Promise<{ valid: boolean; user: User }> {
    if (!this.authToken) {
      return { valid: false, user: { id: '', email: '', full_name: '' } };
    }

    try {
      const response = await fetch(`${AUTH_URL}/validate-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: this.authToken }),
      });

      if (!response.ok) {
        this.clearAuthToken();
        return { valid: false, user: { id: '', email: '', full_name: '' } };
      }

      return response.json();
    } catch (error) {
      this.clearAuthToken();
      return { valid: false, user: { id: '', email: '', full_name: '' } };
    }
  }

  logout() {
    this.clearAuthToken();
  }

  // Backend Service Endpoints

  async generateCaptions(
    file: File,
    fileType: 'image' | 'video',
    tone: string,
    length: string,
    hashtagCount: number
  ): Promise<{ captions: string }> {
    // Check caption limit first
    const limitCheck = await this.checkCaptionLimit();
    if (!limitCheck.has_remaining) {
      throw new Error('You have reached your caption generation limit for this period');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileType', fileType);
    formData.append('tone', tone);
    formData.append('length', length);
    formData.append('hashtagCount', hashtagCount.toString());

    const headers: HeadersInit = {};
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    const response = await fetch(`${BACKEND_URL}/generate-captions`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.clearAuthToken();
        throw new Error('Authentication required. Please login again.');
      }
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate captions');
    }

    return response.json();
  }

  async healthCheck(): Promise<{ status: string }> {
    const response = await fetch(`${BACKEND_URL}/health`);
    return response.json();
  }

  async authHealthCheck(): Promise<{ status: string; service: string }> {
    const response = await fetch(`${AUTH_URL}/health`);
    return response.json();
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export for testing or custom instances
export default ApiClient;

