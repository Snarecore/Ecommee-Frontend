import { useEffect } from "react";
import { useSetAtom } from "jotai";
import { userAtom, User, userLoadedAtom } from "../store/user-store";
import { getCookie } from "../utils/cookie-utils";

const AppInitializer = () => {
    const setUser = useSetAtom(userAtom);
     const setUserLoaded = useSetAtom(userLoadedAtom);

    useEffect(() => {
        const storedUser = getCookie("user") || sessionStorage.getItem("user");
        if (storedUser) {
            try {
                const parsed = JSON.parse(storedUser) as User;
                setUser(parsed);
            } catch {
                sessionStorage.removeItem("user");
            }
        }
        setUserLoaded(true);
    }, [setUser, setUserLoaded]);

    return null;
};

export default AppInitializer;
