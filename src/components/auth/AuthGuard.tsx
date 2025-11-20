"use client";

import { useSessionContext } from "@/lib/session-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { UserType } from "@/types/auth";
import { hasAccess } from "@/lib/utils/auth-utils";
import AccessDenied from "./access-denied";
import { useUserExistence } from "@/hooks/useUserExistence";

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRoles?: UserType[];
  requiredGroups?: string[];
  fallbackComponent?: React.ReactNode;
  allowPublicAccess?: boolean;
}

export default function AuthGuard({
  children,
  requiredRoles = [],
  requiredGroups = [],
  fallbackComponent = <AccessDenied />,
  allowPublicAccess = false,
}: AuthGuardProps) {
  const { session, status, update } = useSessionContext();
  const router = useRouter();
  const { data: userExistsData, isLoading: checkingUserExists } =
    useUserExistence();

  useEffect(() => {
    // Only redirect if we're certain about auth state (not loading)
    if (status === "loading") return;

    // Allow public access if specified
    if (allowPublicAccess) return;

    if (!session?.user) {
      router.push("/login");
      return;
    }

    // If user is marked for registration but actually exists, update session
    if (session?.needsRegistration && userExistsData?.exists) {
      update({ needsRegistration: false });
      return;
    }

    // Only redirect to register if we're SURE user doesn't exist (not still loading)
    if (
      session?.needsRegistration &&
      !checkingUserExists &&
      !userExistsData?.exists
    ) {
      router.push("/register");
      return;
    }
  }, [
    session,
    status,
    router,
    allowPublicAccess,
    userExistsData,
    checkingUserExists,
    update,
  ]);

  // ✅ OPTIMISTIC RENDERING: Render content immediately, redirect only if needed
  // This eliminates the "blank screen" or loading screen on every navigation

  // Allow public access if specified
  if (allowPublicAccess) {
    return <>{children}</>;
  }

  // Only show loading for the FIRST load (when session is truly unknown)
  // After that, render content optimistically
  if (status === "loading") {
    // For initial load, show nothing (will redirect quickly anyway)
    return null;
  }

  // Don't render anything if not authenticated (will redirect)
  if (!session?.user) {
    return null;
  }

  // If checking user existence, render children immediately with skeleton
  // Let the useEffect handle redirect if needed
  if (session?.needsRegistration && checkingUserExists) {
    // Render children immediately - let pages show their own skeletons
    return <>{children}</>;
  }

  if (session?.needsRegistration && !userExistsData?.exists) {
    return null;
  }

  // Check if user has required access
  const userRoles = session.user.roles;
  const userGroups = session.user.groups;

  if (!hasAccess(userRoles, userGroups, requiredRoles, requiredGroups)) {
    return <>{fallbackComponent}</>;
  }

  return <>{children}</>;
}

// Registration Guard for the registration page
export function RegistrationGuard({
  children,
  fallbackComponent = <AccessDenied />,
}: {
  children: React.ReactNode;
  fallbackComponent?: React.ReactNode;
}) {
  const { session, status, update } = useSessionContext();
  const router = useRouter();
  const { data: userExistsData, isLoading: checkingUserExists } =
    useUserExistence();

  useEffect(() => {
    if (status === "loading") return;

    // Redirect to login if not authenticated
    if (!session?.user) {
      router.push("/login");
      return;
    }

    // If user exists but is marked for registration, update session and redirect to dashboard
    if (
      !checkingUserExists &&
      userExistsData?.exists &&
      session?.needsRegistration
    ) {
      update({ needsRegistration: false });
      router.push("/dashboard");
      return;
    }

    // Redirect to dashboard if user doesn't need registration
    if (session && !session.needsRegistration) {
      router.push("/dashboard");
      return;
    }
  }, [session, status, router, userExistsData, checkingUserExists, update]);

  // Optimistic rendering - show content immediately
  if (status === "loading") {
    return null;
  }

  if (!session?.user) {
    return null;
  }

  if (session && !session.needsRegistration) {
    return null;
  }

  // Show access denied if no session or no needsRegistration flag
  if (!session || !session.needsRegistration) {
    return <>{fallbackComponent}</>;
  }

  return <>{children}</>;
}
