import { atom } from "jotai";
import { deleteCookie, setCookie } from "../utils/cookie-utils";
import { logoutFirebaseUser } from "../services/firebase-auth.service";
import { getApiBaseUrlWithTrailingSlash } from "@/config/env";

export interface User {
    id?: string;
    _id?: string;
    name?: string;
    fullName?: string;
    firstName?: string;
    lastName?: string;
    username?: string;
    email?: string;
    role?: string;
    [key: string]: any;
}

// Auth tokens live only in httpOnly cookies set by the backend. Never keep them in
// JS-readable storage, so an XSS bug cannot steal the session.
const AUTH_TOKEN_KEYS = ["token", "accessToken", "refreshToken", "idToken"];
const LEGACY_TOKEN_COOKIES = ["accessToken", "cloth_customer_access", "cloth_admin_access"];

export const stripAuthTokens = <T extends User | null>(user: T): T => {
    if (!user || typeof user !== "object") return user;
    const clean: User = { ...user };
    for (const key of AUTH_TOKEN_KEYS) delete clean[key];
    if (clean.data && typeof clean.data === "object") {
        clean.data = { ...clean.data };
        for (const key of AUTH_TOKEN_KEYS) delete clean.data[key];
    }
    return clean as T;
};

export const getUserDisplayName = (user: User | null): string => {
    if (!user) return "";
    if (user.name) return user.name;
    if (user.fullName) return user.fullName;
    if (user.firstName) return `${user.firstName} ${user.lastName || ''}`.trim();
    if (user.username) return user.username;
    if (user.email) return user.email.split('@')[0];
    return "User";
};

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export const userAtom = atom<User | null>(null);
export const userLoadedAtom = atom(false);
export const authStatusAtom = atom<AuthStatus>("loading");

export const persistUserSession = (user: User | null) => {
    if (typeof window === "undefined") return;
    // Clears tokens older builds wrote from JS. Browsers ignore this for the
    // backend's httpOnly cookies of the same name, so the real session survives.
    LEGACY_TOKEN_COOKIES.forEach(deleteCookie);

    if (user) {
        try {
            const userJson = JSON.stringify(stripAuthTokens(user));
            setCookie("user", userJson, 30);
            try {
                localStorage.setItem("user", userJson);
                sessionStorage.setItem("user", userJson);
            } catch {}
        } catch {}
    } else {
        deleteCookie("user");
        try {
            localStorage.removeItem("user");
            sessionStorage.removeItem("user");
        } catch {}
    }
};

export const logoutUserAtom = atom(null, (get, set, action?: any) => {
    logoutFirebaseUser().catch(() => null);
    fetch(`${getApiBaseUrlWithTrailingSlash()}auth/logout`, {
        method: "POST",
        credentials: "include"
    }).catch(() => null);

    persistUserSession(null);

    set(userAtom, null);
    set(authStatusAtom, "unauthenticated");
    set(userLoadedAtom, true);

    if (typeof action === "function") {
        try {
            action();
        } catch {
            if (typeof window !== "undefined") window.location.href = "/login";
        }
    } else if (action && typeof action === "object" && typeof action.navigate === "function") {
        action.navigate();
    } else if (typeof window !== "undefined") {
        window.location.href = "/login";
    }
});
