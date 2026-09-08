import { useEffect } from "react";
import { useSetAtom } from "jotai";
import { userAtom, User, userLoadedAtom, authStatusAtom } from "../store/user-store";
import { getCookie, setCookie, deleteCookie } from "../utils/cookie-utils";
import { getFirebaseAuth } from "../config/firebase";
import { onAuthStateChanged } from "firebase/auth";

const AppInitializer = () => {
    const setUser = useSetAtom(userAtom);
    const setUserLoaded = useSetAtom(userLoadedAtom);
    const setAuthStatus = useSetAtom(authStatusAtom);

    useEffect(() => {
        let isUnmounted = false;

        const fetchSession = async () => {
            setAuthStatus("loading");
            let parsedUser: any = null;

            try {
                const storedUser = getCookie("user");
                const rawStored = storedUser || (typeof window !== "undefined" && (localStorage.getItem("user") || sessionStorage.getItem("user")));
                
                try {
                    if (rawStored) parsedUser = typeof rawStored === "string" ? JSON.parse(rawStored) : rawStored;
                } catch {
                    // ignore JSON parse error
                }

                // 1. Immediately hydrate local user from cookie/storage so UI doesn't flicker
                if (parsedUser && typeof parsedUser === "object") {
                    setUser(parsedUser as User);
                    setAuthStatus("authenticated");
                }

                if (!rawStored) {
                    // If no stored user session, check if Firebase Auth has an active Google session
                    const fbInstance = getFirebaseAuth();
                    if (fbInstance?.auth?.currentUser) {
                        const fbUser = fbInstance.auth.currentUser;
                        const clientUser: User = {
                            id: fbUser.uid,
                            _id: fbUser.uid,
                            name: fbUser.displayName || fbUser.email?.split("@")[0] || "User",
                            email: fbUser.email || "",
                            photoURL: fbUser.photoURL || "",
                            role: "customer",
                            provider: "google"
                        };
                        setUser(clientUser);
                        setAuthStatus("authenticated");
                        setCookie("user", JSON.stringify(clientUser), 7);
                    } else {
                        setUser(null);
                        setAuthStatus("unauthenticated");
                    }
                    setUserLoaded(true);
                    return;
                }

                const currentToken = parsedUser?.token || "";
                const headers: Record<string, string> = {};
                if (currentToken) {
                    headers["Authorization"] = `Bearer ${currentToken}`;
                }

                const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1/";
                const res = await fetch(`${baseUrl.replace(/\/$/, "")}/auth/customer/me`, {
                    method: "GET",
                    headers,
                    credentials: "include"
                });

                if (isUnmounted) return;

                if (res.ok) {
                    const data = await res.json();
                    const userData = data?.data || data?.user;
                    if (userData) {
                        const fullUserData = {
                            ...(parsedUser || {}),
                            ...userData,
                            role: userData.role || parsedUser?.role || "customer",
                            token: userData.token || currentToken
                        };
                        setCookie("user", JSON.stringify(fullUserData), 7);
                        if (typeof window !== "undefined") {
                            try {
                                const str = JSON.stringify(fullUserData);
                                localStorage.setItem("user", str);
                                sessionStorage.setItem("user", str);
                            } catch {}
                        }
                        setUser(fullUserData as User);
                        setAuthStatus("authenticated");
                    } else if (parsedUser) {
                        setUser(parsedUser as User);
                        setAuthStatus("authenticated");
                    } else {
                        deleteCookie("user");
                        setUser(null);
                        setAuthStatus("unauthenticated");
                    }
                } else {
                    // Server status non-OK (401/404/500/offline): keep client session if valid parsedUser present!
                    if (parsedUser && typeof parsedUser === "object" && (parsedUser.id || parsedUser._id || parsedUser.email)) {
                        setUser(parsedUser as User);
                        setAuthStatus("authenticated");
                    } else {
                        deleteCookie("user");
                        if (typeof window !== "undefined") {
                            localStorage.removeItem("user");
                            sessionStorage.removeItem("user");
                        }
                        setUser(null);
                        setAuthStatus("unauthenticated");
                    }
                }
            } catch {
                if (isUnmounted) return;
                if (parsedUser && typeof parsedUser === "object" && (parsedUser.id || parsedUser._id || parsedUser.email)) {
                    setUser(parsedUser as User);
                    setAuthStatus("authenticated");
                } else {
                    deleteCookie("user");
                    if (typeof window !== "undefined") {
                        try {
                            localStorage.removeItem("user");
                            sessionStorage.removeItem("user");
                        } catch {}
                    }
                    setUser(null);
                    setAuthStatus("unauthenticated");
                }
            } finally {
                if (!isUnmounted) {
                    setUserLoaded(true);
                }
            }
        };

        fetchSession();

        // 2. Attach Firebase Auth state observer for Google OAuth sessions
        let unsubscribeFirebase: (() => void) | null = null;
        try {
            const fbInstance = getFirebaseAuth();
            if (fbInstance?.auth) {
                unsubscribeFirebase = onAuthStateChanged(fbInstance.auth, (fbUser) => {
                    if (fbUser && !isUnmounted) {
                        const storedUser = getCookie("user");
                        if (!storedUser) {
                            const clientUser: User = {
                                id: fbUser.uid,
                                _id: fbUser.uid,
                                name: fbUser.displayName || fbUser.email?.split("@")[0] || "User",
                                email: fbUser.email || "",
                                photoURL: fbUser.photoURL || "",
                                role: "customer",
                                provider: "google"
                            };
                            setUser(clientUser);
                            setAuthStatus("authenticated");
                            setCookie("user", JSON.stringify(clientUser), 7);
                        }
                    }
                });
            }
        } catch {
            // ignore Firebase observer error
        }

        return () => {
            isUnmounted = true;
            if (unsubscribeFirebase) unsubscribeFirebase();
        };
    }, [setUser, setUserLoaded, setAuthStatus]);

    return null;
};

export default AppInitializer;
