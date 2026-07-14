export type UserRole = 'superadmin' | 'admin' | 'agent' | 'user';

export interface User {
  id: number;
  username?: string | null;
  name: string;
  email: string;
  phone: string | null;
  region: string | null;
  role: UserRole;
  token_limit: number | null;
  tokens_used: number;
  verified?: boolean;
  active?: boolean;
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
