import axiosInstance from "@/lib/axios/axios-client";
import { VerifyUserParams, VerifyUserResult } from "@/types/auth";
import { isNetworkError } from "./auth-helpers";

function determineUserRole(roles: string[], groups: string[] = []): string {
  // Combine roles and groups for checking
  const allRolesAndGroups = [...roles, ...groups];

  // Priority order: ADMIN > FACULTY > MANAGER > STUDENT
  if (
    allRolesAndGroups.includes("admin") ||
    allRolesAndGroups.includes("ADMIN")
  )
    return "ADMIN";
  if (
    allRolesAndGroups.includes("faculty") ||
    allRolesAndGroups.includes("FACULTY")
  )
    return "FACULTY";
  if (
    allRolesAndGroups.includes("manager") ||
    allRolesAndGroups.includes("MANAGER")
  )
    return "MANAGER";
  if (
    allRolesAndGroups.includes("faculty") ||
    allRolesAndGroups.includes("FACULTY")
  )
    return "FACULTY";
  return "STUDENT";
}

export async function verifyAndCreateUser(
  params: VerifyUserParams,
): Promise<VerifyUserResult> {
  const { email } = params;

  try {
    const checkResponse = await axiosInstance.get(
      `/api/user/check-exists?email=${encodeURIComponent(email)}`,
    );
    const { exists } = checkResponse.data;

    return { exists, user: null };
  } catch (error) {
    console.error("Error verifying user:", error);
    // Use the network error detection utility
    if (isNetworkError(error)) {
      throw new Error("BACKEND_UNAVAILABLE");
    }
    return { exists: false, user: null };
  }
}

export { determineUserRole };
