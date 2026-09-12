import { atom } from "jotai";
import { deleteCookie, setCookie, getCookie } from "../utils/cookie-utils";
import { logoutFirebaseUser } from "../services/firebase-auth.service";

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
    token?: string;
    [key: string]: any;
}

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
    if (user) {
        try {
            const userJson = JSON.stringify(user);
            setCookie("user", userJson, 30);
            try {
                localStorage.setItem("user", userJson);
                sessionStorage.setItem("user", userJson);
            } catch {}

            const token = user.token || (user as any).accessToken;
            if (token) {
                setCookie("accessToken", token, 30);
                setCookie("cloth_customer_access", token, 30);
                const role = String(user.role || "").toLowerCase();
                if (role === "admin" || role === "superadmin" || role === "super_admin") {
                    setCookie("cloth_admin_access", token, 30);
                }
            }
        } catch {}
    } else {
        deleteCookie("user");
        deleteCookie("accessToken");
        deleteCookie("cloth_customer_access");
        deleteCookie("cloth_admin_access");
        try {
            localStorage.removeItem("user");
            sessionStorage.removeItem("user");
        } catch {}
    }
};

export const logoutUserAtom = atom(null, (get, set, action?: any) => {
    logoutFirebaseUser().catch(() => null);
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1/"}auth/logout`, {
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
