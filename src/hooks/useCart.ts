import { useAtom } from "jotai";
import { Product } from "../interface/product.interface";
import { cartAtom, cartCounterAtom } from "../store/cart-store";
import { showSuccessToast, showErrorToast } from "../utils/toast-utils";
import { isProductOutOfStock, isSizeOutOfStock } from "../utils/stock-utils";

const useCart = () => {
	const [cartItems, setCartItems] = useAtom(cartAtom);
	const [cartItemCount] = useAtom(cartCounterAtom || 0);

	const addToCart = (product: Product, quantity: number = 1, selectedSize?: string | null) => {
		if (isProductOutOfStock(product)) {
			showErrorToast("This product is currently Out of Stock!");
			return;
		}
		if (selectedSize && isSizeOutOfStock(product, selectedSize)) {
			showErrorToast(`Size ${selectedSize} is currently Out of Stock!`);
			return;
		}

		const sizeToSave = selectedSize || (product as any).selectedSize || undefined;

		const existingIndex = cartItems.findIndex(
			(item) => item.id === product.id && (sizeToSave ? item.selectedSize === sizeToSave : true)
		);

		if (existingIndex > -1) {
			const updatedItems = [...cartItems];
			updatedItems[existingIndex] = {
				...updatedItems[existingIndex],
				quantity: updatedItems[existingIndex].quantity + quantity,
				...(sizeToSave ? { selectedSize: sizeToSave } : {})
			};
			setCartItems(updatedItems);
			showSuccessToast("Item quantity increased in cart.");
		} else {
			const newItemList = [...cartItems, { ...product, quantity, ...(sizeToSave ? { selectedSize: sizeToSave } : {}) }];
			setCartItems(newItemList);
			showSuccessToast("Item added to cart.");
		}
	};	

	const removeFromCart = (product: Product, selectedSize?: string) => {
		const filteredItems = cartItems.filter(
			(item) => !(item.id === product.id &&
				(selectedSize ? item.selectedSize === selectedSize : !item.selectedSize || item.selectedSize === (product as any).selectedSize))
		);
		setCartItems(filteredItems);
		showErrorToast("Item removed from cart.");
	};

	const increaseQuantity = (productId: string) => {
		const updatedItems = cartItems.map((item) =>
			item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
		);
		setCartItems(updatedItems);
		showSuccessToast("Quantity increased.");
	};

	const decreaseQuantity = (productId: string) => {
		const product = cartItems.find((item) => item.id === productId);
		if (!product) return;

		if (product.quantity <= 1) {
			removeFromCart(product);
		} else {
			const updatedItems = cartItems.map((item) =>
				item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
			);
			setCartItems(updatedItems);
			showSuccessToast("Quantity decreased.");
		}
	};

	const isInCart = (product: Product) => {
		return cartItems.some((item) => item.id === product.id);
	};

	const calculateTotalPrice = (): number => {
		return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
	};

	const clearCart = () => {
		setCartItems([]);
	};

	return {
		cartItems,
		cartItemCount,
		isInCart,
		addToCart,
		removeFromCart,
		increaseQuantity,
		decreaseQuantity,
		calculateTotalPrice,
		clearCart
	};
};

export default useCart;
