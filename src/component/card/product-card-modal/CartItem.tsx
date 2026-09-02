import Image from "next/image";
import { AiOutlineClose } from "react-icons/ai";
import { FaShoppingBag } from "react-icons/fa";

interface CartItemProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
}

const CartItem: React.FC<CartItemProps> = ({ isOpen, onClose, title }) => {
    // const { cart, increaseQuantity, decreaseQuantity, removeFromCart, totalPrice } = useCartStore();
    return (
        <div
            className={`
                fixed top-0 right-0 h-screen md:w-[400px] w-full 
                bg-white border-l border-gray-200 z-50 shadow-xl 
                flex flex-col transform transition-transform duration-500 ease-in-out
                ${isOpen ? 'translate-x-0' : 'translate-x-full'}
            `}
        >
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <FaShoppingBag className="text-[#218DAE]" />
                    {title}
                </h2>
                <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-gray-100 transition-all duration-200 hover:rotate-90"
                >
                    <AiOutlineClose className="text-2xl text-gray-600 hover:text-gray-800" />
                </button>
            </div>

            {/* <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-[#218DAE]/20 scrollbar-track-gray-100 hover:scrollbar-thumb-[#218DAE]/30">
                <div className="flex items-center justify-between">
                    <p className="text-gray-800 font-semibold">
                        Your Items ({cart.length})
                    </p>
                    {cart.length > 0 && (
                        <p className="text-sm text-gray-500">
                            Scroll to see more
                        </p>
                    )}
                </div>

                {cart.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-gray-500 mt-12 space-y-4 animate-fade-in">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
                            <FaShoppingBag className="text-4xl text-gray-300" />
                        </div>
                        <p className="text-center text-gray-400 font-medium">Your shopping cart is empty!</p>
                        <button
                            onClick={onClose}
                            className="text-[#218DAE] hover:text-[#218DAE]/80 font-medium transition-colors"
                        >
                            Continue Shopping
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {cart.map((item, index) => (
                            <div
                                key={item.id}
                                className="animate-fade-in-up bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="flex items-center gap-4 p-3">
                                    <div className="relative overflow-hidden rounded-lg group">
                                        <Image src={item.featuredImage || "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"} alt={item.name} className="w-16 h-16 object-cover rounded-lg transform transition-transform duration-300 group-hover:scale-110" width={64} height={64} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-800 truncate">{item.name}</p>
                                        <p className="text-[#218DAE] font-semibold mt-0.5">
                                            ${(item.price * item.quantity).toFixed(2)}
                                        </p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <button
                                                onClick={() => decreaseQuantity(item.id)}
                                                className="w-6 h-6 flex items-center justify-center bg-gray-50 hover:bg-gray-100 rounded-md transition-colors text-sm cursor-pointer"
                                            >
                                                -
                                            </button>
                                            <span className="font-medium w-6 text-center text-sm">{item.quantity}</span>
                                            <button
                                                onClick={() => increaseQuantity(item.id)}
                                                className="w-6 h-6 flex items-center justify-center bg-gray-50 hover:bg-gray-100 rounded-md transition-colors text-sm cursor-pointer"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        className="hover:text-red-500 p-1.5 hover:bg-red-50 rounded-lg transition-all duration-200 cursor-pointer bg-red-500 text-black"
                                    >
                                        <AiOutlineClose size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div> */}

            {/* <div className="p-6 border-t border-gray-100 bg-white">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-600 font-medium">Subtotal:</span>
                    <span className="text-xl font-bold text-[#218DAE]">${totalPrice.toFixed(2)}</span>
                </div>
                <div className="space-y-2">
                    <button className="w-full bg-[#218DAE] text-white font-medium py-2.5 rounded-lg hover:bg-[#218DAE]/90 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30">
                        Checkout Now
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full bg-gray-100 text-gray-800 font-medium py-2.5 rounded-lg hover:bg-gray-200 transition-all duration-200"
                    >
                        Continue Shopping
                    </button>
                </div>
            </div> */}
        </div>
    );
};

export default CartItem;
