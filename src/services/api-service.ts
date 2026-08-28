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
            const response = await fetch(`${baseUrl.replace(/\/$/, "")}/auth/refresh-token`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" }
            });
            if (response.ok) {
                const resData = await response.json();
                const newToken = resData?.accessToken || resData?.data?.accessToken || "refreshed";
                return newToken;
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

async function apiRequest<T>(url: string, options: RequestInit, isRetry = false): Promise<T | ApiErrorResponse> {
    try {
        const baseUrl = getApiBaseUrl();
        const fullUrl = url.startsWith("http://") || url.startsWith("https://")
            ? url
            : `${baseUrl.replace(/\/$/, "")}/${url.replace(/^\//, "")}`;

        const response = await fetch(fullUrl, {
            ...options,
            credentials: "include",
            cache: "no-store",
            headers: {
                "Pragma": "no-cache",
                "Cache-Control": "no-cache, no-store, must-revalidate",
                ...options.headers,
            },
            next: { revalidate: 0 }
        } as RequestInit).catch((err) => {
            console.warn("API fetch error caught safely:", err?.message || err);
            return null;
        });

        if (!response) {
            return { error: true, message: "Backend API is currently offline or unreachable." };
        }

        if (response.status === 401 && !isRetry && !url.includes("auth/login") && !url.includes("auth/refresh-token")) {
            const newToken = await refreshAccessToken();
            if (newToken) {
                const newHeaders = new Headers(options.headers || {});
                newHeaders.set("Authorization", `Bearer ${newToken}`);
                return apiRequest<T>(url, { ...options, headers: newHeaders }, true);
            }
        }

        if (!response.ok) {
            console.error(`API Error: ${response.status} - ${response.statusText}`);
            const errData = await response.json().catch(() => null);
            return {
                error: true,
                status: response.status,
                message: errData?.message || `Failed (${response.status}): ${response.statusText}`
            };
        }

        return await response.json().catch(() => ({ error: true, message: "Invalid JSON response" }));
    } catch (error) {
        console.warn("Fetch exception handled: ", error);
        return { error: true, message: "An error occurred while making the request." };
    }
}

export async function getData<T>({ url, token }: GetDataProps): Promise<T | ApiErrorResponse> {
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    return apiRequest<T>(url, { headers, method: "GET" });
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
