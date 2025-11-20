"use client";

import AuthGuard from "@/components/auth/AuthGuard";

export default function EvaluateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard requiredGroups={["admin", "faculty", "manager"]}>
      {children}
    </AuthGuard>
  );
}
