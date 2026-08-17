import { wishlistAtom, wishlistCounterAtom } from "../store/wishlist-store";
import { useAtom } from "jotai";
import { showSuccessToast, showErrorToast } from "../utils/toast-utils";
import { Product } from "../interface/product.interface";

const useWishlist = () => {
	const [wishlist, setWishlist] = useAtom(wishlistAtom);
	const [wishlistCounter] = useAtom(wishlistCounterAtom || 0);

	const addToWishlist = (product: Product): void => {
		const wishlistItem = [...wishlist, product];
		setWishlist(wishlistItem);
		showSuccessToast("Item added to wishlist.");
	};

	const removeFromWishlist = (product: Product): void => {
		const wishlistItem = wishlist.filter((item) => item.id !== product.id);
		setWishlist(wishlistItem);
		showErrorToast("Item removed from wishlist.");
	};

	const isInWishlist = (product: Product): boolean => {
		return wishlist.some((item) => item.id === product.id);
	};

	return {
		wishlist,
		wishlistCounter,
		isInWishlist,
		addToWishlist,
		removeFromWishlist
	};
};

export default useWishlist;
