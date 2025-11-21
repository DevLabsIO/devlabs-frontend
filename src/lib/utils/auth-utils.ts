import { UserType } from "@/types/auth/auth-helpers.types";

export function hasRequiredRole(userRole: string | undefined, requiredRoles: UserType[]): boolean {
    if (!userRole || requiredRoles.length === 0) return false;
    return requiredRoles.includes(userRole as UserType);
}

export function belongsToRequiredGroup(
    userGroups: string[] | undefined,
    requiredGroups: string[]
): boolean {
    if (!userGroups || requiredGroups.length === 0) return false;
    return requiredGroups.some((group) => userGroups.includes(group));
}

export function hasAccess(
    userRoles: string[] | undefined,
    userGroups: string[] | undefined,
    requiredRoles: UserType[] = [],
    requiredGroups: string[] = []
): boolean {
    const hasRole =
        requiredRoles.length === 0 ||
        (userRoles?.some((role) => hasRequiredRole(role, requiredRoles)) ?? false);
    const hasGroup =
        requiredGroups.length === 0 || belongsToRequiredGroup(userGroups, requiredGroups);

    return hasRole && hasGroup;
}

export { UserType };
