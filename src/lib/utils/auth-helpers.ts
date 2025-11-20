import userQueries from "@/repo/user-queries/user-queries";
import { UserExistenceCheckResult } from "@/types/auth";

export type { UserExistenceCheckResult };

export async function checkUserExistenceWithRetry(
  email: string,
  maxRetries: number = 3,
  retryDelay: number = 1000,
): Promise<{ exists: boolean }> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await userQueries.checkUserExists(email);
      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Unknown error");

      if (attempt < maxRetries) {
        // Wait before retrying with exponential backoff
        await new Promise((resolve) =>
          setTimeout(resolve, retryDelay * attempt),
        );
      }
    }
  }

  // If all retries failed, throw the last error
  throw lastError || new Error("Failed to check user existence");
}

export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes("Network Error") ||
      error.message.includes("ECONNREFUSED") ||
      error.message.includes("Failed to fetch") ||
      error.message.includes("ERR_NETWORK")
    );
  }
  return false;
}
