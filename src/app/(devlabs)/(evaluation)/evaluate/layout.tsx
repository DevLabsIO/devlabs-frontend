"use client";

import AuthGuard from "@/components/auth/AuthGuard";
import { GROUPS } from "@/types/auth/roles";

export default function EvaluateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard requiredGroups={[GROUPS.ADMIN, GROUPS.FACULTY, GROUPS.MANAGER]}>
      {children}
    </AuthGuard>
  );
}
