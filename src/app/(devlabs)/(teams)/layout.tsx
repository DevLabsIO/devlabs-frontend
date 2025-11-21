"use client";

import AuthGuard from "@/components/auth/AuthGuard";
import { GROUPS } from "@/types/auth/roles";

export default function TeamsLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthGuard requiredGroups={[GROUPS.ADMIN, GROUPS.STUDENT, GROUPS.MANAGER]}>
            {children}
        </AuthGuard>
    );
}
