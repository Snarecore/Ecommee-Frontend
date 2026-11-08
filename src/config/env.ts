
const stripTrailingSlash = (url: string): string => url.replace(/\/+$/, "");

export const getApiBaseUrl = (): string => {
    const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (envUrl && envUrl.trim() && envUrl !== "undefined") {
        return stripTrailingSlash(envUrl.trim());
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
