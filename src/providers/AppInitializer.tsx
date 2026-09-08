import { useEffect } from "react";
import { useSetAtom } from "jotai";
import { userAtom, User, userLoadedAtom, authStatusAtom } from "../store/user-store";
import { getCookie, setCookie, deleteCookie } from "../utils/cookie-utils";
import { getFirebaseAuth } from "../config/firebase";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";

const syncFirebaseWithBackend = async (fbUser: FirebaseUser): Promise<User | null> => {
    try {
        const idToken = await fbUser.getIdToken(true);
        const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1/").replace(/\/$/, "");
        const res = await fetch(`${baseUrl}/auth/firebase-login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                idToken,
                email: fbUser.email || "",
                name: fbUser.displayName || fbUser.email?.split("@")[0] || "User",
                photoURL: fbUser.photoURL || "",
                firebaseUid: fbUser.uid
            }),
            credentials: "include"
        });

        if (res.ok) {
            const data = await res.json();
            const serverUser = data?.data?.user || data?.data;
            const serverToken = data?.data?.accessToken || data?.accessToken;
            const serverRefreshToken = data?.data?.refreshToken || data?.refreshToken;

            if (serverUser && typeof serverUser === "object") {
                const fullUser: User = {
                    role: "customer",
                    ...serverUser,
                    photoURL: fbUser.photoURL || serverUser.photoURL || "",
                    token: serverToken || idToken,
                    refreshToken: serverRefreshToken,
                    provider: "google"
                };
                setCookie("user", JSON.stringify(fullUser), 7);
                if (typeof window !== "undefined") {
                    localStorage.setItem("user", JSON.stringify(fullUser));
                    sessionStorage.setItem("user", JSON.stringify(fullUser));
                }
                return fullUser;
            }
        }
    } catch (e) {
        // console.warn("Firebase token sync error:", e);
    }
    return null;
};

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

                const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1/").replace(/\/$/, "");
                const currentToken = parsedUser?.token || parsedUser?.accessToken || "";

                if (currentToken) {
                    const headers: Record<string, string> = {
                        "Authorization": `Bearer ${currentToken}`
                    };

                    const res = await fetch(`${baseUrl}/auth/customer/me`, {
                        method: "GET",
                        headers,
                        credentials: "include"
                    });

                    if (isUnmounted) return;

                    if (res.ok) {
                        const data = await res.json();
                        const userData = data?.data || data?.user;
                        if (userData) {
                            const fullUserData: User = {
                                ...(parsedUser || {}),
                                ...userData,
                                role: userData.role || parsedUser?.role || "customer",
                                token: currentToken,
                                refreshToken: parsedUser?.refreshToken
                            };
                            setCookie("user", JSON.stringify(fullUserData), 7);
                            if (typeof window !== "undefined") {
                                localStorage.setItem("user", JSON.stringify(fullUserData));
                                sessionStorage.setItem("user", JSON.stringify(fullUserData));
                            }
                            setUser(fullUserData);
                            setAuthStatus("authenticated");
                            return;
                        }
                    } else if (res.status === 401) {
                        // Check if Google/Firebase session can be refreshed
                        const fbInstance = getFirebaseAuth();
                        if (fbInstance?.auth?.currentUser) {
                            const syncedUser = await syncFirebaseWithBackend(fbInstance.auth.currentUser);
                            if (syncedUser && !isUnmounted) {
                                setUser(syncedUser);
                                setAuthStatus("authenticated");
                                return;
                            }
                        }

                        // Try local refresh-token
                        const refreshToken = parsedUser?.refreshToken || currentToken;
                        if (refreshToken) {
                            try {
                                const refreshRes = await fetch(`${baseUrl}/auth/refresh-token`, {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json",
                                        "Authorization": `Bearer ${refreshToken}`
                                    },
                                    body: JSON.stringify({ refreshToken }),
                                    credentials: "include"
                                });
                                if (refreshRes.ok) {
                                    const refData = await refreshRes.json();
                                    const newToken = refData?.accessToken || refData?.data?.accessToken;
                                    const newRefreshToken = refData?.refreshToken || refData?.data?.refreshToken;
                                    const refUser = refData?.user || refData?.data?.user;
                                    if (newToken) {
                                        const fullUserData: User = {
                                            ...(parsedUser || {}),
                                            ...(refUser || {}),
                                            token: newToken,
                                            refreshToken: newRefreshToken || parsedUser?.refreshToken
                                        };
                                        setCookie("user", JSON.stringify(fullUserData), 7);
                                        if (typeof window !== "undefined") {
                                            localStorage.setItem("user", JSON.stringify(fullUserData));
                                            sessionStorage.setItem("user", JSON.stringify(fullUserData));
                                        }
                                        setUser(fullUserData);
                                        setAuthStatus("authenticated");
                                        return;
                                    }
                                }
                            } catch {}
                        }
                    }
                }

                // If no currentToken or token was invalid, check active Firebase session
                const fbInstance = getFirebaseAuth();
                if (fbInstance?.auth?.currentUser) {
                    const syncedUser = await syncFirebaseWithBackend(fbInstance.auth.currentUser);
                    if (syncedUser && !isUnmounted) {
                        setUser(syncedUser);
                        setAuthStatus("authenticated");
                        return;
                    }
                }

                if (!parsedUser) {
                    setUser(null);
                    setAuthStatus("unauthenticated");
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
                unsubscribeFirebase = onAuthStateChanged(fbInstance.auth, async (fbUser) => {
                    if (fbUser && !isUnmounted) {
                        await syncFirebaseWithBackend(fbUser).then((synced) => {
                            if (synced && !isUnmounted) {
                                setUser(synced);
                                setAuthStatus("authenticated");
                            }
                        });
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
