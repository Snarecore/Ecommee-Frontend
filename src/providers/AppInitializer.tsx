import { useEffect } from "react";
import { useSetAtom } from "jotai";
import { userAtom, User, userLoadedAtom } from "../store/user-store";
import { getCookie, setCookie, deleteCookie } from "../utils/cookie-utils";

const AppInitializer = () => {
    const setUser = useSetAtom(userAtom);
    const setUserLoaded = useSetAtom(userLoadedAtom);

    useEffect(() => {
        const fetchSession = async () => {
            try {
                const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1/";
                const res = await fetch(`${baseUrl.replace(/\/$/, "")}/auth/customer/me`, {
                    method: "GET",
                    credentials: "include"
                });
                if (res.ok) {
                    const data = await res.json();
                    const userData = data?.data || data?.user;
                    if (userData) {
                        const currentToken = getCookie("user") ? JSON.parse(getCookie("user") || "{}")?.token : "";
                        const fullUserData = { ...userData, token: userData.token || currentToken };
                        setCookie("user", JSON.stringify(fullUserData), 7);
                        setUser(fullUserData as User);
                    } else {
                        deleteCookie("user");
                        setUser(null);
                    }
                } else {
                    deleteCookie("user");
                    setUser(null);
                }
            } catch {
                deleteCookie("user");
                setUser(null);
            } finally {
                setUserLoaded(true);
            }
        };

        fetchSession();
    }, [setUser, setUserLoaded]);

    return null;
};

export default AppInitializer;
