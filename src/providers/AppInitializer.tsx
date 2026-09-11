import { useEffect } from "react";
import { useSetAtom } from "jotai";
import { userAtom, User, userLoadedAtom, authStatusAtom } from "../store/user-store";
import { deleteCookie } from "../utils/cookie-utils";
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

            if (serverUser && typeof serverUser === "object") {
                const safeUser: User = {
                    id: serverUser.id || serverUser._id || fbUser.uid,
                    name: serverUser.name || fbUser.displayName || "User",
                    fullName: serverUser.fullName || serverUser.name || fbUser.displayName || "User",
                    email: serverUser.email || fbUser.email || "",
                    role: serverUser.role || "customer",
                    photoURL: fbUser.photoURL || serverUser.photoURL || "",
                    provider: "google"
                };
                return safeUser;
            }
        }
    } catch {
        // ignore error
    }
    return null;
};

const AppInitializer = () => {
    const setUser = useSetAtom(userAtom);
    const setUserLoaded = useSetAtom(userLoadedAtom);
    const setAuthStatus = useSetAtom(authStatusAtom);

    useEffect(() => {
        let isUnmounted = false;

        // Clean up legacy tokens from localStorage to prevent XSS exposure
        if (typeof window !== "undefined") {
            try {
                localStorage.removeItem("user");
                sessionStorage.removeItem("user");
                deleteCookie("user");
            } catch {}
        }

        const fetchSession = async () => {
            setAuthStatus("loading");
            const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1/").replace(/\/$/, "");

            try {
                // 1. Check active session via HttpOnly cookie
                const res = await fetch(`${baseUrl}/auth/customer/me`, {
                    method: "GET",
                    credentials: "include"
                });

                if (isUnmounted) return;

                if (res.ok) {
                    const data = await res.json();
                    const userData = data?.data || data?.user;
                    if (userData) {
                        const safeUser: User = {
                            id: userData.id || userData._id,
                            name: userData.name,
                            fullName: userData.fullName || userData.name,
                            email: userData.email,
                            role: userData.role || "customer",
                            photoURL: userData.photoURL || ""
                        };
                        setUser(safeUser);
                        setAuthStatus("authenticated");
                        return;
                    }
                } else if (res.status === 401) {
                    // 2. Try cookie-based refresh token rotation
                    try {
                        const refreshRes = await fetch(`${baseUrl}/auth/refresh-token`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            credentials: "include"
                        });

                        if (refreshRes.ok && !isUnmounted) {
                            const refData = await refreshRes.json();
                            const refUser = refData?.user || refData?.data?.user;
                            if (refUser) {
                                const safeUser: User = {
                                    id: refUser.id || refUser._id,
                                    name: refUser.name,
                                    fullName: refUser.fullName || refUser.name,
                                    email: refUser.email,
                                    role: refUser.role || "customer",
                                    photoURL: refUser.photoURL || ""
                                };
                                setUser(safeUser);
                                setAuthStatus("authenticated");
                                return;
                            }
                        }
                    } catch {}

                    // 3. Check if Google/Firebase session can be refreshed
                    const fbInstance = getFirebaseAuth();
                    if (fbInstance?.auth?.currentUser) {
                        const syncedUser = await syncFirebaseWithBackend(fbInstance.auth.currentUser);
                        if (syncedUser && !isUnmounted) {
                            setUser(syncedUser);
                            setAuthStatus("authenticated");
                            return;
                        }
                    }
                }

                if (!isUnmounted) {
                    setUser(null);
                    setAuthStatus("unauthenticated");
                }
            } catch {
                if (!isUnmounted) {
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

        // Attach Firebase Auth state observer for Google OAuth sessions
        let unsubscribeFirebase: (() => void) | null = null;
        try {
            const fbInstance = getFirebaseAuth();
            if (fbInstance?.auth) {
                unsubscribeFirebase = onAuthStateChanged(fbInstance.auth, async (fbUser) => {
                    if (fbUser && !isUnmounted) {
                        const synced = await syncFirebaseWithBackend(fbUser);
                        if (synced && !isUnmounted) {
                            setUser(synced);
                            setAuthStatus("authenticated");
                        }
                    }
                });
            }
        } catch {}

        return () => {
            isUnmounted = true;
            if (unsubscribeFirebase) unsubscribeFirebase();
        };
    }, [setUser, setUserLoaded, setAuthStatus]);

    return null;
};

export default AppInitializer;

