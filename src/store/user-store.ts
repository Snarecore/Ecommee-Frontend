import { atom } from "jotai";
import { deleteCookie } from "../utils/cookie-utils";
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

export const logoutUserAtom = atom(null, (get, set, action?: any) => {
    const currentUser = get(userAtom);
    const userId = currentUser?.id || currentUser?._id || currentUser?.email;

    logoutFirebaseUser().catch(() => null);
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1/"}auth/logout`, {
        method: "POST",
        credentials: "include"
    }).catch(() => null);

    deleteCookie("user");
    if (typeof window !== "undefined") {
        try {
            localStorage.removeItem("user");
            sessionStorage.removeItem("user");
            if (userId) {
                localStorage.removeItem(`shipping_notifications_${userId}`);
                localStorage.removeItem(`shipping_notifications_v1_${userId}`);
            }
        } catch {}
    }

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
