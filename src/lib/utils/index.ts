/**
 * Utility functions and helpers
 *
 * This barrel file exports commonly used utilities from the utils folder
 * to provide convenient imports throughout the application.
 */

// Core utilities
export { cn, getInitials } from "./cn";

// UI/Styling utilities
export { COURSE_COLORS } from "./colors";

// Review utilities
export {
  calculateReviewStatus,
  formatStatus,
  getStatusColor,
  getStatusDescription,
  type ReviewStatus,
  type ReviewPublicationStatus,
} from "./review-status";

// Auth utilities
export {
  hasRequiredRole,
  belongsToRequiredGroup,
  hasAccess,
  type UserType,
} from "./auth-utils";
