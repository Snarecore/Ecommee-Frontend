import { atom } from "jotai";
import { deleteCookie } from "../utils/cookie-utils";

export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    token?: string;
}

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
