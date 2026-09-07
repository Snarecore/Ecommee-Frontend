"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAtomValue } from "jotai";
import { userAtom, userLoadedAtom } from "../store/user-store";
import { Role } from "../enum/role.enum";

interface RoleProtectedRouteProps {
    children: React.ReactElement;
    allowedRoles: Role[];
}

const RoleProtectedRoute = ({ children, allowedRoles }: RoleProtectedRouteProps) => {
    const user = useAtomValue(userAtom);
    const userLoaded = useAtomValue(userLoadedAtom);
    const router = useRouter();

    const userRole = (user?.role || 'customer').toLowerCase();
    const isAllowed = allowedRoles.some(
        r => r.toLowerCase() === userRole || 
             (r.toLowerCase() === 'customer' && (userRole === 'customer' || userRole === 'user'))
    );

    useEffect(() => {
        if (userLoaded && (!user || !isAllowed)) {
            router.replace("/login");
        }
    }, [user, userLoaded, isAllowed, router]);

    if (!userLoaded || !user || !isAllowed) {
        return null;
    }

    return children;
};

export default RoleProtectedRoute;
