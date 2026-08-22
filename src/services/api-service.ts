import { GetDataProps, PostDataProps, PatchDataProps, DeleteDataProps, FormDataProps } from "../models/api-models";
import apiConfig from "../config/api.json";

const getApiBaseUrl = (): string => {
    const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (envUrl && envUrl !== "undefined") return envUrl;
    if ((apiConfig as any)?.baseUrl) return (apiConfig as any).baseUrl;
    return "http://localhost:5000/api/v1/";
};

async function apiRequest<T>(url: string, options: RequestInit): Promise<T | { error: boolean; message: string }> {
    try {
        const baseUrl = getApiBaseUrl();
        const fullUrl = url.startsWith("http://") || url.startsWith("https://")
            ? url
            : `${baseUrl.replace(/\/$/, "")}/${url.replace(/^\//, "")}`;

        const response = await fetch(fullUrl, {
            ...options,
            cache: "no-store",
            headers: {
                "Pragma": "no-cache",
                "Cache-Control": "no-cache, no-store, must-revalidate",
                ...options.headers,
            },
            // @ts-ignore
            next: { revalidate: 0 }
        }).catch((err) => {
            console.warn("API fetch error caught safely:", err?.message || err);
            return null;
        });

        if (!response) {
            return { error: true, message: "Backend API is currently offline or unreachable." };
        }

        if (!response.ok) {
            console.error(`API Error: ${response.status} - ${response.statusText}`);
            return { error: true, message: `Failed: ${response.statusText}` };
        }

        return await response.json().catch(() => ({ error: true, message: "Invalid JSON response" }));
    } catch (error) {
        console.warn("Fetch exception handled: ", error);
        return { error: true, message: "An error occurred while making the request." };
    }
}

export async function getData<T>({ url, token }: GetDataProps): Promise<T | { error: boolean; message: string }> {
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    return apiRequest<T>(url, { headers, method: "GET" });
}

export async function postData<T>({ url, token, body }: PostDataProps): Promise<T | { error: boolean; message: string }> {
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    return apiRequest<T>(url, { headers, method: "POST", body: JSON.stringify(body) });
}

export async function patchData<T>({ url, token, body }: PatchDataProps): Promise<T | { error: boolean; message: string }> {
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
