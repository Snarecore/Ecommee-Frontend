"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAtom } from "jotai";
import { userAtom, userLoadedAtom, User } from "../store/user-store";
import { getCookie, setCookie } from "../utils/cookie-utils";
import { Role } from "../enum/role.enum";

interface RoleProtectedRouteProps {
    children: React.ReactElement;
    allowedRoles: Role[];
}

const RoleProtectedRoute = ({ children, allowedRoles }: RoleProtectedRouteProps) => {
    const [user, setUser] = useAtom(userAtom);
    const userLoaded = useAtom(userLoadedAtom)[0];
    const router = useRouter();

    // Secondary fallback check: if atom is transiently empty, attempt immediate local restoration
    let activeUser: User | null = user;
    if (!activeUser && typeof window !== "undefined") {
        try {
            const raw = getCookie("user") || localStorage.getItem("user") || sessionStorage.getItem("user");
            if (raw) {
                const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
                if (parsed && typeof parsed === "object" && (parsed.id || parsed._id || parsed.email)) {
                    activeUser = parsed as User;
                    setUser(parsed as User);
                    setCookie("user", JSON.stringify(parsed), 7);
                }
            }
        } catch {
            // ignore
        }
    }

    const rawRole = activeUser?.role ? String(activeUser.role).trim().toLowerCase() : 'customer';
    const userRole = rawRole || 'customer';

    const isAllowed = allowedRoles.some(
        r => r.toLowerCase() === userRole || 
             (r.toLowerCase() === 'customer' && (userRole === 'customer' || userRole === 'user' || userRole === 'admin'))
    );

    useEffect(() => {
        if (userLoaded && (!activeUser || !isAllowed)) {
            router.replace("/login");
        }
    }, [activeUser, userLoaded, isAllowed, router]);

    if (!userLoaded || !activeUser || !isAllowed) {
        return null;
    }

    return children;
};

export default RoleProtectedRoute;
