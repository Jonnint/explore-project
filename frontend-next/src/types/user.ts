export type UserRole = 'superadmin' | 'admin' | 'agent';

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  region: string | null;
  role: UserRole;
  token_limit: number | null;
  tokens_used: number;
  created_at?: string;
  updated_at?: string;
}

export interface UserListResponse {
  users: User[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface UserResponse {
  user: User;
}
