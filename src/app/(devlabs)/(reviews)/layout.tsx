"use client";

import AuthGuard from "@/components/auth/AuthGuard";
import { GROUPS } from "@/types/auth/roles";

export default function ReviewsLayout({ children }: { children: React.ReactNode }) {
    return <AuthGuard requiredGroups={[GROUPS.FACULTY, GROUPS.MANAGER]}>{children}</AuthGuard>;
}
