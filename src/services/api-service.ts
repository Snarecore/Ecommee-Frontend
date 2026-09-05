import { GetDataProps, PostDataProps, PatchDataProps, DeleteDataProps, FormDataProps } from "../models/api-models";
import apiConfig from "../config/api.json";

const getApiBaseUrl = (): string => {
    const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (envUrl && envUrl !== "undefined") return envUrl;
    if ((apiConfig as any)?.baseUrl) return (apiConfig as any).baseUrl;
    return "http://localhost:5000/api/v1/";
};

export type ApiErrorResponse = { error: boolean; status?: number; message: string };

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
    if (isRefreshing && refreshPromise) {
        return refreshPromise;
    }
    isRefreshing = true;
    refreshPromise = (async () => {
        try {
            const baseUrl = getApiBaseUrl();
            let storedToken = "";
            let storageType: "session" | "local" | null = null;
            if (typeof window !== "undefined") {
                const sessionStr = sessionStorage.getItem("user");
                const localStr = localStorage.getItem("user");
                if (sessionStr) {
                    storageType = "session";
                    try { storedToken = JSON.parse(sessionStr)?.token || ""; } catch {}
                } else if (localStr) {
                    storageType = "local";
                    try { storedToken = JSON.parse(localStr)?.token || ""; } catch {}
                }
            }

            const headers: Record<string, string> = { "Content-Type": "application/json" };
            if (storedToken) {
                headers["Authorization"] = `Bearer ${storedToken}`;
            }

            const response = await fetch(`${baseUrl.replace(/\/$/, "")}/auth/refresh-token`, {
                method: "POST",
                credentials: "include",
                headers
            });
            if (response.ok) {
                const resData = await response.json();
                const newToken = resData?.accessToken || resData?.data?.accessToken || "refreshed";
                if (newToken && typeof window !== "undefined") {
                    try {
                        if (storageType === "session" || sessionStorage.getItem("user")) {
                            const userObj = JSON.parse(sessionStorage.getItem("user") || "{}");
                            userObj.token = newToken;
                            sessionStorage.setItem("user", JSON.stringify(userObj));
                        }
                        if (storageType === "local" || localStorage.getItem("user")) {
                            const userObj = JSON.parse(localStorage.getItem("user") || "{}");
                            userObj.token = newToken;
                            localStorage.setItem("user", JSON.stringify(userObj));
                        }
                    } catch {}
                }
                return newToken;
            }

            // Organization Standard: If refresh-token fails (401/expired), remove dead token to prevent refresh loops
            if (typeof window !== "undefined") {
                try {
                    const sessionStr = sessionStorage.getItem("user");
                    const localStr = localStorage.getItem("user");
                    if (sessionStr) {
                        const u = JSON.parse(sessionStr);
                        delete u.token;
                        sessionStorage.setItem("user", JSON.stringify(u));
                    }
                    if (localStr) {
                        const u = JSON.parse(localStr);
                        delete u.token;
                        localStorage.setItem("user", JSON.stringify(u));
                    }
                } catch {}
                window.dispatchEvent(new Event("auth_token_expired"));
            }
            return null;
        } catch {
            return null;
        } finally {
            isRefreshing = false;
            refreshPromise = null;
        }
    })();
    return refreshPromise;
}

async function apiRequest<T>(
    url: string,
    options: RequestInit,
    isRetry = false,
    cacheStrategy: RequestCache = "default"
): Promise<T | ApiErrorResponse> {
    try {
        const baseUrl = getApiBaseUrl();
        const fullUrl = url.startsWith("http://") || url.startsWith("https://")
            ? url
            : `${baseUrl.replace(/\/$/, "")}/${url.replace(/^\//, "")}`;

        const response = await fetch(fullUrl, {
            ...options,
            credentials: "include",
            cache: cacheStrategy,
            headers: { ...options.headers },
        } as RequestInit).catch((err) => {
            // console.warn("API fetch error caught safely:", err?.message || err);
            return null;
        });

        if (!response) {
            return { error: true, message: "Backend API is currently offline or unreachable." };
        }

        if (response.status === 401 && !isRetry && !url.includes("auth/login") && !url.includes("auth/refresh-token")) {
            const hasTokenOrSession = typeof window !== "undefined" && (
                sessionStorage.getItem("user") || localStorage.getItem("user") || document.cookie.includes("user")
            );
            if (hasTokenOrSession) {
                const newToken = await refreshAccessToken();
                if (newToken) {
                    const newHeaders = new Headers(options.headers || {});
                    newHeaders.set("Authorization", `Bearer ${newToken}`);
                    return apiRequest<T>(url, { ...options, headers: newHeaders }, true, cacheStrategy);
                }
            }
        }

        if (!response.ok) {
            // console.warn(`API HTTP ${response.status}: ${response.statusText} for ${url}`);
            const errData = await response.json().catch(() => null);
            return {
                error: true,
                status: response.status,
                message: errData?.message || `Failed (${response.status}): ${response.statusText}`
            };
        }

        return await response.json().catch(() => ({ error: true, message: "Invalid JSON response" }));
    } catch (error) {
        // console.warn("Fetch exception handled: ", error);
        return { error: true, message: "An error occurred while making the request." };
    }
}

// Public APIs (products, categories, homepage) → cached by default
// User-specific APIs (profile, orders, cart) → pass noCache: true
export async function getData<T>({ url, token, noCache }: GetDataProps): Promise<T | ApiErrorResponse> {
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    return apiRequest<T>(url, { headers, method: "GET" }, false, noCache ? "no-store" : "default");
}

export async function postData<T>({ url, token, body }: PostDataProps): Promise<T | ApiErrorResponse> {
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    return apiRequest<T>(url, { headers, method: "POST", body: JSON.stringify(body) });
}

export async function patchData<T>({ url, token, body }: PatchDataProps): Promise<T | ApiErrorResponse> {
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    return apiRequest<T>(url, { headers, method: "PATCH", body: JSON.stringify(body) });
}

export async function deleteData<T>({ url, token }: DeleteDataProps): Promise<T | { error: boolean; message: string }> {
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    return apiRequest<T>(url, { headers, method: "DELETE" });
}

export async function postFormData<T>({ url, token, body }: FormDataProps): Promise<T | { error: boolean; message: string }> {
    const headers: HeadersInit = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    return apiRequest<T>(url, { headers, method: "POST", body });
}

export async function patchFormData<T>({ url, token, body }: FormDataProps): Promise<T | { error: boolean; message: string }> {
    const headers: HeadersInit = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    return apiRequest<T>(url, { headers, method: "PATCH", body });
}
