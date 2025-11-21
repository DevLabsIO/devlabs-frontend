import axios from "axios";
import { getSession, signOut } from "next-auth/react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || "http://localhost:8090/api";

let sessionCache: {
    data: { access_token?: string; error?: string | null } | null;
    expiresAt: number;
} | null = null;

const SESSION_CACHE_DURATION = 4 * 60 * 1000;

async function getCachedSession() {
    if (typeof window === "undefined") return null;

    const now = Date.now();

    if (sessionCache && sessionCache.expiresAt > now) {
        return sessionCache.data;
    }

    const session = await getSession();

    sessionCache = {
        data: session as { access_token?: string; error?: string | null } | null,
        expiresAt: now + SESSION_CACHE_DURATION,
    };

    return session;
}

export function clearSessionCache() {
    sessionCache = null;
}

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

axiosInstance.interceptors.request.use(
    async (config) => {
        if (typeof window !== "undefined") {
            const session = await getCachedSession();

            if (session?.access_token) {
                config.headers.Authorization = `Bearer ${session.access_token}`;
            }
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            clearSessionCache();

            const session = await getSession();
            if (
                !session ||
                !session.access_token ||
                session.error?.includes("RefreshAccessTokenError") ||
                session.error === "RefreshTokenExpired"
            ) {
                if (typeof window !== "undefined") {
                    console.log("Authentication failed, forcing logout...");
                    await signOut({
                        callbackUrl: "/login",
                        redirect: true,
                    });
                }
                return Promise.reject(error);
            }

            if (session.access_token) {
                originalRequest.headers.Authorization = `Bearer ${session.access_token}`;
                return axiosInstance(originalRequest);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
