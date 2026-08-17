import { useAtomValue } from "jotai";
import { Navigate } from "react-router-dom";
import { userAtom, userLoadedAtom } from "../store/user-store";
import { Role } from "../enum/role.enum";

interface RoleProtectedRouteProps {
    children: React.ReactElement;
    allowedRoles: Role[];
}

const RoleProtectedRoute = ({ children, allowedRoles }: RoleProtectedRouteProps) => {
    const user = useAtomValue(userAtom);
    const userLoaded = useAtomValue(userLoadedAtom);

    if (!userLoaded) return null;

    // if (!user) {
    //     return <Navigate to="/login" replace />;
    // }

    if (!allowedRoles.includes(user?.role as Role)) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default RoleProtectedRoute;
