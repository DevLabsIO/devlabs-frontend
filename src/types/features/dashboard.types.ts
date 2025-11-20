/**
 * Dashboard Feature Types
 * Types for dashboard data and statistics
 */

import { RecentUser } from "../entities/user.types";
import {
  UpcomingReview,
  RecentlyPublishedReview,
} from "../entities/review.types";

export interface AdminDashboardData {
  userStats: {
    total: number;
    students: number;
    faculty: number;
    managers: number;
  };
  semesterStats: {
    total: number;
    active: number;
  };
  courseStats: {
    total: number;
    active: number;
  };
  batchStats: {
    total: number;
    active: number;
  };
  recentUsers: RecentUser[];
}

export interface ManagerStaffDashboardData {
  totalReviews: number;
  activeReviews: number;
  completedReviews: number;
  totalProjects: number;
  activeProjects: number;
  upcomingReviews: UpcomingReview[];
  recentlyPublishedReviews: RecentlyPublishedReview[];
}

export interface StudentDashboardData {
  totalReviews: number;
  activeReviews: number;
  completedReviews: number;
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  averageProjectScore: number;
  upcomingReviews: UpcomingReview[];
  recentlyPublishedReviews: RecentlyPublishedReview[];
}
