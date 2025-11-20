"use client";

import AuthGuard from "@/components/auth/AuthGuard";
import { GROUPS } from "@/types/auth/roles";

export default function ArchivesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard requiredGroups={[GROUPS.FACULTY, GROUPS.STUDENT]}>
      {children}
    </AuthGuard>
  );
}
