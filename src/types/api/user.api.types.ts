/**
 * User API Request/Response Types
 * Used in src/repo/user-queries/
 */

export interface CreateUserRequest {
  name: string;
  email: string;
  phoneNumber: string;
  role: string;
  password: string;
  isActive: boolean;
}

export interface UpdateUserRequest extends Omit<CreateUserRequest, "password"> {
  id: string;
}

export interface CreateKeycloakUserRequest {
  email: string;
  name: string;
  role: string;
  phoneNumber: string;
}
