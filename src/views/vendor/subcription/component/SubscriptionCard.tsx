import { useState } from "react";
import VendorPaymentCheckout from "../../../../component/payment/VendorPaymentCheckout";
import Modal from "../../../../component/modals/CommonModal";
import { useNavigate } from "react-router-dom";

interface SubscriptionCardProps {
	id: string | number;
	name: string;
	commissionRate: string;
	duration: string;
	price: string;
	activeSubscription: boolean;
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({ id, name, commissionRate, duration, price, activeSubscription }) => {
	const navigate = useNavigate();
	const [showPaymentForm, setShowPaymentForm] = useState(false);

	return (
		<div
			className={`bg-[#F9FAFB] flex flex-col border rounded-md p-4 transition duration-200 cursor-pointer ${activeSubscription ? "border-[#DD2590] shadow-md" : "border-gray-300"}`}
		>
			<p className="text-[14px] font-bold">{name}</p>
			<div>
				<span className="text-[18px] text-black font-bold">${price} </span>
				<span className="text-[14px] text-[#646B72]">/ {duration} Months</span>
			</div>
			<div className="text-[14px] text-[#646B72] my-4">
				<span className="font-medium">Commission Rate: </span>
				<span className="font-semibold">{commissionRate}%</span>
			</div>

			<button
				onClick={() => {
					setShowPaymentForm(true);
				}}
				disabled={activeSubscription}
				className={`mt-auto px-4 py-1.5 rounded-lg font-semibold ${
					activeSubscription
						? "bg-gray-300 text-gray-600 cursor-not-allowed"
						: "bg-[#092c4c] text-white border border-[#092C4C] cursor-pointer"
				}`}
			>
				{activeSubscription ? "Current Plan" : "Choose Plan"}
			</button>

			<Modal isOpen={showPaymentForm} onClose={() => setShowPaymentForm(false)} title="Complete Your Payment">
				<VendorPaymentCheckout
					tierId={String(id)}
					onSuccess={(subscriptionData) => {
						setShowPaymentForm(false);
						navigate(`/vendor-invoice/${subscriptionData.id}`);
					}}
					
				/>
			</Modal>
		</div>
	);
};

export default SubscriptionCard;