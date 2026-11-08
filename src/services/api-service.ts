import { GetDataProps, PostDataProps, PatchDataProps, DeleteDataProps, FormDataProps } from "../models/api-models";
import apiConfig from "../config/api.json";
import { getCookie, setCookie } from "../utils/cookie-utils";
import { getApiBaseUrl } from "@/config/env";

export type ApiErrorResponse = { error: boolean; status?: number; message: string };

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<boolean> {
    if (isRefreshing && refreshPromise) {
        return refreshPromise.then(res => !!res);
    }
    isRefreshing = true;
    let resolveRefresh: (val: boolean) => void = () => {};
    const currentPromise = new Promise<boolean>((resolve) => {
        resolveRefresh = resolve;
    });

    (async () => {
        try {
            const baseUrl = getApiBaseUrl();
            const response = await fetch(`${baseUrl.replace(/\/$/, "")}/auth/refresh-token`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" }
            });

            if (response.ok) {
                resolveRefresh(true);
                return;
            }

            // If refresh fails on server, clear dead session
            if (typeof window !== "undefined") {
                window.dispatchEvent(new Event("auth_token_expired"));
            }
            resolveRefresh(false);
        } catch {
            resolveRefresh(false);
        } finally {
            isRefreshing = false;
            refreshPromise = null;
        }
    })();

    return currentPromise;
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
            return null;
        });

        if (!response) {
            return { error: true, message: "Backend API is currently offline or unreachable." };
        }

        if (response.status === 401 && !isRetry && !url.includes("auth/login") && !url.includes("auth/refresh-token") && !url.includes("auth/firebase-login")) {
            // Attempt automatic cookie-based token rotation
            const refreshed = await refreshAccessToken();
            if (refreshed) {
                return apiRequest<T>(url, { ...options }, true, cacheStrategy);
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
export async function getData<T>({ url, token, noCache, headers: customHeaders }: GetDataProps): Promise<T | ApiErrorResponse> {
    const headers: Record<string, string> = { "Content-Type": "application/json", ...(customHeaders || {}) };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    return apiRequest<T>(url, { headers, method: "GET" }, false, noCache ? "no-store" : "default");
}

export async function postData<T>({ url, token, body, headers: customHeaders }: PostDataProps): Promise<T | ApiErrorResponse> {
    const headers: Record<string, string> = { "Content-Type": "application/json", ...(customHeaders || {}) };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    return apiRequest<T>(url, { headers, method: "POST", body: JSON.stringify(body) });
}

export async function patchData<T>({ url, token, body, headers: customHeaders }: PatchDataProps): Promise<T | ApiErrorResponse> {
    const headers: Record<string, string> = { "Content-Type": "application/json", ...(customHeaders || {}) };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    return apiRequest<T>(url, { headers, method: "PATCH", body: JSON.stringify(body) });
}

export async function deleteData<T>({ url, token, headers: customHeaders }: DeleteDataProps): Promise<T | { error: boolean; message: string }> {
    const headers: Record<string, string> = { "Content-Type": "application/json", ...(customHeaders || {}) };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    return apiRequest<T>(url, { headers, method: "DELETE" });
}

export async function postFormData<T>({ url, token, body, headers: customHeaders }: FormDataProps): Promise<T | { error: boolean; message: string }> {
    const headers: Record<string, string> = { ...(customHeaders || {}) };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    return apiRequest<T>(url, { headers, method: "POST", body });
}

export async function patchFormData<T>({ url, token, body, headers: customHeaders }: FormDataProps): Promise<T | { error: boolean; message: string }> {
    const headers: Record<string, string> = { ...(customHeaders || {}) };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    return apiRequest<T>(url, { headers, method: "PATCH", body });
}
