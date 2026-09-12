"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAtom } from "jotai";
import { userAtom, userLoadedAtom } from "../store/user-store";
import { Role } from "../enum/role.enum";

export const ROLE_HIERARCHY: Record<string, number> = {
  customer: 10,
  user: 10,
  seller: 15,
  vendor: 15,
  admin: 20,
  superadmin: 30,
  super_admin: 30,
};

interface RoleProtectedRouteProps {
    children: React.ReactElement;
    allowedRoles: Role[];
}

const RoleProtectedRoute = ({ children, allowedRoles }: RoleProtectedRouteProps) => {
    const user = useAtom(userAtom)[0];
    const userLoaded = useAtom(userLoadedAtom)[0];
    const router = useRouter();

    const activeUser = user;
    const userRole = activeUser?.role ? String(activeUser.role).trim().toLowerCase() : 'customer';
    const userLevel = ROLE_HIERARCHY[userRole] ?? 0;

    const requiredLevels = allowedRoles.map((r) => {
        const roleStr = typeof r === 'string' ? r.toLowerCase().trim() : '';
        return ROLE_HIERARCHY[roleStr] ?? 999;
    });
    const minRequiredLevel = Math.min(...requiredLevels);

    // Hierarchical evaluation: User Level >= Required Level
    const isAllowed = userLevel >= minRequiredLevel;

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
