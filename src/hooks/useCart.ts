import { useAtom } from "jotai";
import { Product } from "../interface/product.interface";
import { cartAtom, cartCounterAtom } from "../store/cart-store";
import { showSuccessToast, showErrorToast } from "../utils/toast-utils";

const useCart = () => {
	const [cartItems, setCartItems] = useAtom(cartAtom);
	const [cartItemCount] = useAtom(cartCounterAtom || 0);

	const addToCart = (product: Product, quantity: number = 1) => {
		if (isInCart(product)) {
			const updatedItems = cartItems.map((item) =>
				item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
			);
			setCartItems(updatedItems);
			showSuccessToast("Item quantity increased in cart.");
		} else {
			const newItemList = [...cartItems, { ...product, quantity }];
			setCartItems(newItemList);
			showSuccessToast("Item added to cart.");
		}
	};	

	const removeFromCart = (product: Product) => {
		const filteredItems = cartItems.filter((item) => item.id !== product.id);
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
