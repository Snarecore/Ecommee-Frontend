import { GetDataProps, PostDataProps, PatchDataProps, DeleteDataProps, FormDataProps } from "../models/api-models";
import apiConfig from "../config/api.json";
import { getCookie, setCookie } from "../utils/cookie-utils";

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
            let storedRefreshToken = "";
            let storageType: "session" | "local" | null = null;
            if (typeof window !== "undefined") {
                const cookieStr = getCookie("user");
                const sessionStr = sessionStorage.getItem("user");
                const localStr = localStorage.getItem("user");
                const activeStr = cookieStr || sessionStr || localStr;
                if (activeStr) {
                    try {
                        const parsed = JSON.parse(activeStr);
                        storedToken = parsed?.token || "";
                        storedRefreshToken = parsed?.refreshToken || "";
                    } catch {}
                }
            }

            const tokenToUse = storedRefreshToken || storedToken;
            const headers: Record<string, string> = { "Content-Type": "application/json" };
            if (tokenToUse) {
                headers["Authorization"] = `Bearer ${tokenToUse}`;
            }

            const response = await fetch(`${baseUrl.replace(/\/$/, "")}/auth/refresh-token`, {
                method: "POST",
                credentials: "include",
                headers,
                body: JSON.stringify({ refreshToken: tokenToUse })
            });
            if (response.ok) {
                const resData = await response.json();
                const newToken = resData?.accessToken || resData?.data?.accessToken || resData?.token || resData?.data?.token || resData?.data?.user?.token || resData?.user?.token;
                const newRefreshToken = resData?.refreshToken || resData?.data?.refreshToken || resData?.data?.user?.refreshToken || resData?.user?.refreshToken;
                if (newToken && typeof newToken === "string" && newToken !== "refreshed" && typeof window !== "undefined") {
                    try {
                        let userObj: any = {};
                        const cookieUser = getCookie("user");
                        const storageUser = sessionStorage.getItem("user") || localStorage.getItem("user");
                        const raw = cookieUser || storageUser;
                        if (raw) {
                            try { userObj = JSON.parse(raw); } catch {}
                        }
                        userObj.token = newToken;
                        if (newRefreshToken) userObj.refreshToken = newRefreshToken;
                        setCookie("user", JSON.stringify(userObj), 7);
                        if (sessionStorage.getItem("user")) sessionStorage.setItem("user", JSON.stringify(userObj));
                        if (localStorage.getItem("user")) localStorage.setItem("user", JSON.stringify(userObj));
                    } catch {}
                    return newToken;
                }
                return null;
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

        if (response.status === 401 && !isRetry && !url.includes("auth/login") && !url.includes("auth/refresh-token") && !url.includes("auth/firebase-login")) {
            let isGoogleSession = false;
            if (typeof window !== "undefined") {
                try {
                    const raw = sessionStorage.getItem("user") || localStorage.getItem("user") || getCookie("user");
                    if (raw) {
                        const u = typeof raw === "string" ? JSON.parse(raw) : raw;
                        if (u.provider === "google" || u.firebaseUid) isGoogleSession = true;
                    }
                } catch {}
            }

            if (isGoogleSession && typeof window !== "undefined") {
                try {
                    const { getFirebaseAuth } = await import("../config/firebase");
                    const fbInstance = getFirebaseAuth();
                    if (fbInstance?.auth?.currentUser) {
                        const idToken = await fbInstance.auth.currentUser.getIdToken(true);
                        const baseUrl = getApiBaseUrl();
                        const fbRes = await fetch(`${baseUrl.replace(/\/$/, "")}/auth/firebase-login`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                idToken,
                                email: fbInstance.auth.currentUser.email || "",
                                name: fbInstance.auth.currentUser.displayName || "",
                                firebaseUid: fbInstance.auth.currentUser.uid
                            }),
                            credentials: "include"
                        });
                        if (fbRes.ok) {
                            const data = await fbRes.json();
                            const newToken = data?.data?.accessToken || data?.accessToken;
                            const newRefreshToken = data?.data?.refreshToken || data?.refreshToken;
                            if (newToken) {
                                const raw = sessionStorage.getItem("user") || localStorage.getItem("user") || getCookie("user");
                                let userObj: any = {};
                                if (raw) {
                                    try { userObj = typeof raw === "string" ? JSON.parse(raw) : raw; } catch {}
                                }
                                userObj.token = newToken;
                                if (newRefreshToken) userObj.refreshToken = newRefreshToken;
                                setCookie("user", JSON.stringify(userObj), 7);
                                if (sessionStorage.getItem("user")) sessionStorage.setItem("user", JSON.stringify(userObj));
                                if (localStorage.getItem("user")) localStorage.setItem("user", JSON.stringify(userObj));

                                const newHeaders = new Headers(options.headers || {});
                                newHeaders.set("Authorization", `Bearer ${newToken}`);
                                return apiRequest<T>(url, { ...options, headers: newHeaders }, true, cacheStrategy);
                            }
                        }
                    }
                } catch {}
            }

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
            if (response.status === 413) {
                return {
                    error: true,
                    status: 413,
                    message: "The uploaded file(s) or payload size is too large. Please upload smaller files."
                };
            }
            const errData = await response.json().catch(() => null);
            const rawMsg = errData?.message || errData?.data?.message || `Failed (${response.status}): ${response.statusText}`;
            const formattedMsg = Array.isArray(rawMsg) ? rawMsg.join(", ") : String(rawMsg);
            return {
                error: true,
                status: response.status,
                message: formattedMsg
            };
        }

        return await response.json().catch(() => ({ error: true, message: "Invalid JSON response" }));
    } catch (error: any) {
        // console.warn("Fetch exception handled: ", error);
        return { error: true, message: error?.message || "An error occurred while making the request." };
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
