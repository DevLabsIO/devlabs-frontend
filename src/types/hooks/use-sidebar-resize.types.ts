export interface UseSidebarResizeProps {
  direction?: "left" | "right";

  currentWidth: string;

  onResize: (width: string) => void;

  onToggle?: () => void;

  isCollapsed?: boolean;

  minResizeWidth?: string;

  maxResizeWidth?: string;

  enableAutoCollapse?: boolean;

  autoCollapseThreshold?: number;

  expandThreshold?: number;

  enableDrag?: boolean;

  setIsDraggingRail?: (isDragging: boolean) => void;

  widthCookieName?: string;

  widthCookieMaxAge?: number;

  isNested?: boolean;

  enableToggle?: boolean;
}
