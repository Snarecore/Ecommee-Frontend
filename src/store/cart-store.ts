import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { Product } from "../interface/product.interface";

export interface CartItem extends Product {
	quantity: number;
}

export const cartAtom = atomWithStorage<CartItem[]>("cart", []);
export const cartCounterAtom = atom((get) => get(cartAtom).length);