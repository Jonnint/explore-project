export interface User {
    id: number;
    name: string;
    email: string;
    phone?: string;
}

export interface UpdateProfileRequest {
    name: string;
    email: string;
    phone?: string;
}

export interface UpdateProfileResponse {
    message: string;
    user: User;
}

export interface ChangePasswordRequest {
    current_password: string;
    password: string;
    password_confirmation: string;
}

export interface ChangePasswordResponse {
    message: string;
}

export interface ValidationError {
    message: string;
    errors: Record<string, string[]>;
}
