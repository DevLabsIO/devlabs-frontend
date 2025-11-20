/**
 * Navigation UI Types
 * Types for navigation and breadcrumb components
 */

export interface BreadcrumbSegment {
  label: string;
  href: string;
  isCurrentPage?: boolean;
  isDynamicSegment?: boolean;
}

export interface NavigationConfig {
  [key: string]: {
    label: string;
    parent?: string;
    dynamicSegments?: {
      [key: string]: string;
    };
  };
}

export interface NavItem {
  title: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  isActive?: boolean;
  items?: NavItem[];
}

export interface NavGroup {
  title?: string;
  items: NavItem[];
}
