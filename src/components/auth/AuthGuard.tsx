"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { UserType, hasAccess } from "@/lib/utils/auth-utils";
import AccessDenied from "./access-denied";

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRoles?: UserType[];
  requiredGroups?: string[];
  fallbackComponent?: React.ReactNode;
}

export default function AuthGuard({
  children,
  requiredRoles = [],
  requiredGroups = [],
  fallbackComponent = <AccessDenied />,
}: AuthGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user) {
      router.push("/auth/login");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="flex h-screen w-full items-center justify-center p-8">
        <div className="w-full max-w-4xl space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const userRoles = session.user.roles;
  const userGroups = session.user.groups;

  if (!hasAccess(userRoles, userGroups, requiredRoles, requiredGroups)) {
    return <>{fallbackComponent}</>;
  }

  return <>{children}</>;
}
