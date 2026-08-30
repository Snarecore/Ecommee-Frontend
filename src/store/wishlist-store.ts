import { atom } from "jotai";
import { atomWithStorage, createJSONStorage } from "jotai/utils";
import { Product } from "../interface/product.interface";

export const wishlistAtom = atomWithStorage<Product[]>("wishlist", [], createJSONStorage(), { getOnInit: false });
export const wishlistCounterAtom = atom((get) => get(wishlistAtom).length);
