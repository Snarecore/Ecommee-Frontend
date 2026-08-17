import { Link } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';

const Success = () => {
	return (
		<div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
			<div className="text-center max-w-2xl">
				<FaCheckCircle className="text-[var(--color-green-primary)] text-6xl mx-auto mb-6" />
				<h1 className="text-3xl font-bold text-[var(--color-green-primary)] mb-4">Order Completed</h1>
				<p className="text-gray-600 mb-8">
					Your order has been successfully placed. Thank you for shopping with us.
				</p>
				<div className="flex flex-col sm:flex-row gap-4 justify-center">
					<Link
						to="/customer-dashboard"
						className="px-6 py-3 bg-[var(--color-green-primary)] text-white rounded-full transition-colors">
						Go to Dashboard
					</Link>
					<Link
						to="/shop"
						className="px-6 py-3 border border-[var(--color-green-primary)] text-[var(--color-green-primary)] rounded-full transition-colors">
						Continue Shopping
					</Link>
				</div>
			</div>
		</div>
	);
};

export default Success;