import { atom } from "jotai";
import { deleteCookie } from "../utils/cookie-utils";

export interface User {
    id?: string;
    _id?: string;
    name?: string;
    fullName?: string;
    firstName?: string;
    lastName?: string;
    username?: string;
    email?: string;
    role?: string;
    token?: string;
    [key: string]: any;
}

export const getUserDisplayName = (user: User | null): string => {
    if (!user) return "";
    if (user.name) return user.name;
    if (user.fullName) return user.fullName;
    if (user.firstName) return `${user.firstName} ${user.lastName || ''}`.trim();
    if (user.username) return user.username;
    if (user.email) return user.email.split('@')[0];
    return "User";
};

export const userAtom = atom<User | null>(null);
export const userLoadedAtom = atom(false);

//@ts-ignore
export const logoutUserAtom = atom(null, (get :any, set: any, navigate: () => void) => {
    deleteCookie("user");
    sessionStorage.removeItem("user");
    set(userAtom, null);
    set(userLoadedAtom, true);
    navigate();
});
