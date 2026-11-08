import { useAtom } from "jotai";
import { Product } from "../interface/product.interface";
import { cartAtom, cartCounterAtom, CartItem } from "../store/cart-store";
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

	const restoreCart = (
		incomingItems: CartItem[],
		mode: 'merge' | 'replace' = 'merge'
	): { addedCount: number; droppedCount: number; adjustedCount: number } => {
		// 1. Sanitize and aggregate incoming items by stable variant identity
		const aggregatedIncoming = new Map<string, CartItem>();
		let droppedCount = 0;
		let adjustedCount = 0;

		for (const item of incomingItems) {
			const liveStock = Number.isInteger(item.availableStock) && (item.availableStock ?? 0) > 0 ? item.availableStock! : 0;
			if (liveStock <= 0) {
				droppedCount++;
				continue; // Skip out-of-stock incoming items
			}

			const variantKey = item.variantId || `${item.id}:${item.selectedSize || ''}:${item.selectedColor || ''}`;
			const safeQty = Number.isInteger(item.quantity) && item.quantity >= 1 ? item.quantity : 1;

			if (aggregatedIncoming.has(variantKey)) {
				const existing = aggregatedIncoming.get(variantKey)!;
				const newCombined = existing.quantity + safeQty;
				if (newCombined > liveStock) {
					adjustedCount++;
					existing.quantity = liveStock;
				} else {
					existing.quantity = newCombined;
				}
			} else {
				const finalQty = Math.min(safeQty, liveStock);
				if (finalQty < safeQty) adjustedCount++;
				aggregatedIncoming.set(variantKey, {
					...item,
					quantity: finalQty,
					availableStock: liveStock
				});
			}
		}

		const validatedIncomingList = Array.from(aggregatedIncoming.values());

		if (mode === 'replace') {
			setCartItems(validatedIncomingList);
			return { addedCount: validatedIncomingList.length, droppedCount, adjustedCount };
		}

		// 2. Smart Merge into current cart:
		const merged = [...cartItems];

		for (const incoming of validatedIncomingList) {
			const incomingKey = incoming.variantId || `${incoming.id}:${incoming.selectedSize || ''}:${incoming.selectedColor || ''}`;
			const existingIndex = merged.findIndex(
				(item) => (item.variantId || `${item.id}:${item.selectedSize || ''}:${item.selectedColor || ''}`) === incomingKey
			);

			const maxStock = incoming.availableStock!;

			if (existingIndex > -1) {
				const currentItem = merged[existingIndex];
				const currentQty = Number.isInteger(currentItem.quantity) && currentItem.quantity >= 1 ? currentItem.quantity : 1;
				// Real Stock Cap
				const combinedQty = currentQty + incoming.quantity;
				const finalQty = Math.min(combinedQty, maxStock);
				if (finalQty < combinedQty) adjustedCount++;

				merged[existingIndex] = {
					...currentItem,
					price: incoming.price, // Re-sync live catalog price
					quantity: Math.max(1, finalQty),
					availableStock: maxStock
				};
			} else {
				merged.push(incoming);
			}
		}

		// 3. Final normalization of existing cart items: remove any items with stock <= 0
		const finalCartList = merged.filter((item) => {
			if (item.availableStock !== undefined && item.availableStock <= 0) {
				droppedCount++;
				return false;
			}
			return true;
		});

		setCartItems(finalCartList);
		return { addedCount: validatedIncomingList.length, droppedCount, adjustedCount };
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
		clearCart,
		restoreCart
	};
};

export { useCart };
export default useCart;
