import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { Product } from "../interface/product.interface";

export const wishlistAtom = atomWithStorage<Product[]>("wishlist", []);
export const wishlistCounterAtom = atom((get) => get(wishlistAtom).length);
