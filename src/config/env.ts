
const stripTrailingSlash = (url: string): string => url.replace(/\/+$/, "");

const isAbsoluteUrl = (url: string): boolean => /^https?:\/\//i.test(url);

export const getApiBaseUrl = (): string => {
    const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (envUrl && envUrl.trim() && envUrl !== "undefined") {
        const url = stripTrailingSlash(envUrl.trim());
        // A relative URL (e.g. "/api/v1") goes through the Next.js proxy in next.config.ts,
        // which keeps the httpOnly auth cookies first-party. Server-side code cannot fetch a
        // relative URL, so it calls the backend directly.
        if (isAbsoluteUrl(url) || typeof window !== "undefined") {
            return url;
        }
        const backendUrl = process.env.BACKEND_API_URL;
        if (backendUrl && backendUrl.trim()) {
            return stripTrailingSlash(backendUrl.trim());
        }
    }

    if (process.env.NODE_ENV === "production") {
        if (typeof window !== "undefined") {
            console.warn("[Env Warning] NEXT_PUBLIC_API_BASE_URL is missing in production. Falling back to origin API.");
            return `${stripTrailingSlash(window.location.origin)}/api/v1`;
        }
    }

    return "http://localhost:5000/api/v1";
};

export const getApiBaseUrlWithTrailingSlash = (): string => {
    return `${getApiBaseUrl()}/`;
};

export const getBackendOrigin = (): string => {
    const socketEnv = process.env.NEXT_PUBLIC_SOCKET_URL;
    if (socketEnv && socketEnv.trim() && socketEnv !== "undefined") {
        return stripTrailingSlash(socketEnv.trim());
    }

    try {
        const parsed = new URL(getApiBaseUrl());
        return parsed.origin;
    } catch {
        return typeof window !== "undefined" ? window.location.origin : "http://localhost:5000";
    }
};

export const getSocketUrl = (): string => {
    return getBackendOrigin();
};
