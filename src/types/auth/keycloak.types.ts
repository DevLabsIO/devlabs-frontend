/**
 * Keycloak Authentication Types
 * Types for Keycloak token handling
 */

export interface KeycloakToken {
  access_token: string;
  refresh_token?: string;
  expires_at: number;
  session_expires_at?: number;
  groups: string[];
  roles?: string[];
  id_token?: string;
  error?: string;
  id?: string;
  [key: string]: unknown;
}

export interface DecodedJWT {
  realm_access?: {
    roles?: string[];
  };
  groups?: string[];
  sub?: string; // Subject - typically the user ID
  preferred_username?: string;
  [key: string]: unknown;
}
