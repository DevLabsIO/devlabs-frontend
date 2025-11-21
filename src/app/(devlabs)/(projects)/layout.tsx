"use client";

import AuthGuard from "@/components/auth/AuthGuard";
import { GROUPS } from "@/types/auth/roles";

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthGuard requiredGroups={[GROUPS.ADMIN, GROUPS.FACULTY, GROUPS.STUDENT, GROUPS.MANAGER]}>
            {children}
        </AuthGuard>
    );
}
