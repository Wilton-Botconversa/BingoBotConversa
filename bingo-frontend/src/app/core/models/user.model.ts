export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  profilePhotoUrl: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  name: string;
  email: string;
  role: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
}
