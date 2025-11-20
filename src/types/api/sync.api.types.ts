/**
 * Sync API Request/Response Types
 * Used for Keycloak user synchronization
 */

export interface SyncStatsResponse {
  keycloakUserCount: number;
  dbUserCount: number;
  unsyncedUserCount: number;
  unsyncedUsers: UnsyncedUser[];
}

export interface UnsyncedUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  enabled: boolean;
  roles: string[];
  groups: string[];
  profileId: string | null;
  phoneNumber: string | null;
}

export interface SyncRequest {
  userIds?: string[];
}

export interface SyncResponse {
  success: boolean;
  syncedCount: number;
  message: string;
}
