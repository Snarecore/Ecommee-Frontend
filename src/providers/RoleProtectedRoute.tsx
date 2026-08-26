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

    useEffect(() => {
        if (userLoaded && (!user || !allowedRoles.includes(user.role as Role))) {
            router.replace("/login");
        }
    }, [user, userLoaded, allowedRoles, router]);

    if (!userLoaded || !user || !allowedRoles.includes(user.role as Role)) {
        return null;
    }

    return children;
};

export default RoleProtectedRoute;
