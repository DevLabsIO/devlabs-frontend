/**
 * Main utilities barrel file
 *
 * This file re-exports commonly used utilities for backwards compatibility.
 * Direct imports from @/lib/utils will work, and specific imports from
 * @/lib/utils/[module] are also available for more granular control.
 */

export { cn, getInitials } from "./utils/cn";

// Re-export other commonly used utilities
export { COURSE_COLORS } from "./utils/colors";
export {
  calculateReviewStatus,
  formatStatus,
  getStatusColor,
  getStatusDescription,
  type ReviewStatus,
  type ReviewPublicationStatus,
} from "./utils/review-status";
