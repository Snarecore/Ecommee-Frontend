import { atom } from "jotai";
import { atomWithStorage, createJSONStorage } from "jotai/utils";
import { Product } from "../interface/product.interface";

export interface CartItem extends Product {
	quantity: number;
	selectedSize?: string;
}

export const cartAtom = atomWithStorage<CartItem[]>("cart", [], createJSONStorage(), { getOnInit: false });
export const cartCounterAtom = atom((get) => get(cartAtom).length);