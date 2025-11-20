import NextAuth from "next-auth";
import Keycloak from "next-auth/providers/keycloak";
import { decode, JwtPayload } from "jsonwebtoken";
import {
  verifyAndCreateUser,
  determineUserRole,
} from "./utils/user-verification";
import { KeycloakToken, DecodedJWT } from "@/types/auth";

function processDecodedToken(decoded: string | JwtPayload | null): {
  roles: string[];
  groups: string[];
  userId?: string;
} {
  let roles: string[] = [];
  let groups: string[] = [];
  let userId: string | undefined;

  if (decoded && typeof decoded === "object" && !Array.isArray(decoded)) {
    const decodedJWT = decoded as DecodedJWT;
    roles = decodedJWT.realm_access?.roles || [];
    groups = (decodedJWT.groups || []).map((group: string) =>
      group.replace(/^\//, ""),
    );
    userId = decodedJWT.sub; // Extract user ID from token's 'sub' claim
  }
  return { roles, groups, userId };
}

async function refreshKeycloakAccessToken(
  token: KeycloakToken,
): Promise<KeycloakToken | null> {
  try {
    console.log("Attempting to refresh Keycloak access token...");

    const response = await fetch(
      `${process.env.AUTH_KEYCLOAK_ISSUER!}/protocol/openid-connect/token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: token.refresh_token!,
          client_id: process.env.AUTH_KEYCLOAK_ID!,
          client_secret: process.env.AUTH_KEYCLOAK_SECRET!,
        }),
      },
    );

    const refreshedTokens = await response.json();
    if (!response.ok) {
      // If session is not active, return null to invalidate the session gracefully
      if (
        refreshedTokens.error === "invalid_grant" &&
        refreshedTokens.error_description === "Session not active"
      ) {
        console.log("Session has expired, invalidating session");
        return null;
      }

      console.error("Failed to refresh access token:", {
        status: response.status,
        statusText: response.statusText,
        error: refreshedTokens,
      });
      throw new Error(
        `Token refresh failed: ${
          refreshedTokens.error_description ||
          refreshedTokens.error ||
          "Unknown error"
        }`,
      );
    }
    const decoded = decode(refreshedTokens.access_token);
    const { roles, groups, userId } = processDecodedToken(decoded);

    console.log("Successfully refreshed access token");
    return {
      ...token,
      access_token: refreshedTokens.access_token,
      refresh_token: refreshedTokens.refresh_token ?? token.refresh_token,
      expires_at: Math.floor(Date.now() / 1000) + refreshedTokens.expires_in,
      roles: roles,
      groups: groups,
      id: userId || token.id, // Use decoded userId or fallback to existing id
      id_token: refreshedTokens.id_token ?? token.id_token,
      error: undefined,
    };
  } catch (error: unknown) {
    console.error("Error refreshing access token:", error);

    let errorMessage = "RefreshAccessTokenError";
    if (error instanceof Error) {
      errorMessage = `RefreshAccessTokenError: ${error.message}`;
    }

    return {
      ...token,
      error: errorMessage,
    };
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Keycloak({
      clientId: process.env.AUTH_KEYCLOAK_ID,
      clientSecret: process.env.AUTH_KEYCLOAK_SECRET,
      issuer: process.env.AUTH_KEYCLOAK_ISSUER,
      authorization: {
        params: {
          prompt: "login",
          max_age: "0",
        },
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
  },
  session: {
    strategy: "jwt",
  },
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, account, user, trigger, session }) {
      // Handle session update trigger (e.g., from update() call)
      if (trigger === "update" && session) {
        // If the session update explicitly sets needsRegistration to false, override it
        if (session.needsRegistration === false) {
          return {
            ...token,
            needsRegistration: false,
          };
        }
      } // Initial sign-in
      if (account && user) {
        const decoded = decode(account.access_token!);
        const { roles, groups, userId } = processDecodedToken(decoded);

        // Calculate session expiry based on Keycloak's refresh token expiry
        const refreshExpiresIn =
          typeof account.refresh_expires_in === "number"
            ? account.refresh_expires_in
            : 600;
        const sessionExpiresAt =
          Math.floor(Date.now() / 1000) + refreshExpiresIn;
        // Verify/create user in backend database
        if (user.email && user.name && userId) {
          try {
            const primaryRole = determineUserRole(roles, groups);
            const { exists } = await verifyAndCreateUser({
              email: user.email,
              name: user.name,
              keycloakId: userId, // Use decoded token's user ID
              role: primaryRole,
            });

            // If user doesn't exist, mark for registration
            if (!exists) {
              return {
                ...token,
                access_token: account.access_token,
                refresh_token: account.refresh_token,
                id_token: account.id_token,
                expires_at: account.expires_at,
                session_expires_at: sessionExpiresAt,
                roles: roles,
                groups: groups,
                id: userId, // Use decoded token's user ID
                needsRegistration: true,
              };
            }
          } catch (error) {
            console.error("Failed to verify user in backend:", error);

            // If backend is unavailable, allow session creation without registration check
            // This prevents infinite loops when backend comes back online
            if (
              error instanceof Error &&
              error.message === "BACKEND_UNAVAILABLE"
            ) {
              console.warn(
                "Backend unavailable during user verification. Creating session without registration check.",
              );
              // Continue to create session without needsRegistration flag
            } else {
              // For other errors, prevent session creation
              console.error(
                "Unexpected error during user verification:",
                error,
              );
              return null;
            }
          }
        }

        return {
          ...token,
          access_token: account.access_token,
          refresh_token: account.refresh_token,
          id_token: account.id_token,
          expires_at: account.expires_at,
          session_expires_at: sessionExpiresAt,
          roles: roles,
          groups: groups,
          id: userId, // Use decoded token's user ID
        };
      }
      if (
        token.session_expires_at &&
        typeof token.session_expires_at === "number" &&
        Date.now() > token.session_expires_at * 1000
      ) {
        console.log(
          "Session has expired based on Keycloak refresh token expiry",
        );
        return null;
      }

      // Token still valid
      if (
        token.expires_at &&
        Date.now() < token.expires_at * 1000 - 15 * 1000
      ) {
        return token;
      } // Try to refresh
      if (token.refresh_token) {
        const refreshedToken = await refreshKeycloakAccessToken(
          token as KeycloakToken,
        );
        // If refresh returns null (session expired), invalidate the session
        if (!refreshedToken) {
          return null;
        }
        return refreshedToken;
      }

      // No refresh token or refresh failed — invalidate session
      return null;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.roles = token.roles as string[];
        session.user.groups = token.groups as string[];
        session.access_token = token.access_token as string;
        if (token.error) {
          session.error = token.error as string;
        }
      }
      return session;
    },
  },
  events: {
    async signOut(message) {
      if ("token" in message && message.token?.id_token) {
        try {
          const issuerUrl = process.env.AUTH_KEYCLOAK_ISSUER;
          const logoutUrl = new URL(
            `${issuerUrl}/protocol/openid-connect/logout`,
          );
          logoutUrl.searchParams.set(
            "id_token_hint",
            message.token.id_token as string,
          );
          logoutUrl.searchParams.set(
            "client_id",
            process.env.AUTH_KEYCLOAK_ID!,
          );
          await fetch(logoutUrl, { method: "GET" });
        } catch (error) {
          console.error("Error terminating Keycloak session:", error);
        }
      }
    },
  },
});
