/**
 * Types Barrel Export
 * Central export point for all organized types
 *
 * Usage examples:
 * - import { User, Team, Project } from "@/types"
 * - import { KeycloakToken, SessionContextType } from "@/types"
 * - import { KanbanBoard, EvaluationCriteria } from "@/types"
 * - import { DataTableResponse, GridItemProps } from "@/types"
 */

// ===== ENTITIES =====
// Re-export all entity types
export * from "./entities";

// ===== AUTH =====
// Re-export all auth types
export * from "./auth";

// ===== FEATURES =====
// Re-export all feature types
export * from "./features";

// ===== UI =====
// Re-export all UI types
export * from "./ui";

// ===== HOOKS =====
// Re-export all hook types
export * from "./hooks";

// ===== API =====
// Re-export all API request/response types
export * from "./api";
