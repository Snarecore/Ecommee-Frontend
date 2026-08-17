import { useState, ChangeEvent } from "react";
import { useAPI } from "../../../../hooks/useApi";
import apiConfig from "../../../../config/api.json";
import Modal from "../../../../component/modals/CommonModal";
import Button from "../../../../component/buttons/ButtonStyleOne";
import InputField from "../../../../component/inputs/InputField";

interface SubscriptionData {
    amount: string;
}

interface SubscriptionFormProps {
    isOpen: boolean;
    onClose: () => void;
    fetchWalletData: () => void;
    availabeBalance: number;
}

const initialFieldValues: SubscriptionData = {
    amount: "",
};

const requiredFields: { key: keyof SubscriptionData; value: string; label: string }[] = [
    { key: "amount", value: "amount", label: "amount" },
];

const WalletForm = ({ isOpen, onClose, fetchWalletData, availabeBalance }: SubscriptionFormProps) => {
    const { postMutation, handleApiMutation } = useAPI();
    const [fieldValues, setFieldValues] = useState<SubscriptionData>(initialFieldValues);
    const [amountError, setAmountError] = useState<string | null>(null);
    const apiUrl = apiConfig.dashboard.vendorPaymentRequestUrl;

    const resetForm = () => {
        setFieldValues(initialFieldValues);
        setAmountError(null);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        const numericValue = parseFloat(value);

        if (name === "amount") {
            if (numericValue > availabeBalance) {
                setAmountError("Amount cannot exceed available balance.");
            } else {
                setAmountError(null);
            }
        }

        setFieldValues((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmitForm = async () => {
        if (parseFloat(fieldValues.amount) > availabeBalance) {
            setAmountError("Amount cannot exceed available balance.");
            return;
        }

        const result = await handleApiMutation({
            mutation: postMutation,
            url: apiUrl,
            body: { ...fieldValues },
            invalidateQueryKey: [],
            showSuccessMessage: true,
            showErrorMessage: true,
            requiredFields,
        });

        if (result?.success) {
            handleClose();
            fetchWalletData();
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={"Request For Money"}
            footerButtons={
                <>
                    <Button
                        label="Cancel"
                        onClick={handleClose}
                        color="var(--color-secondary)"
                        hoverColor="var(--color-secondary-hover)"
                    />
                    <Button
                        label="Save"
                        onClick={handleSubmitForm}
                        color="var(--color-primary)"
                        hoverColor="var(--color-primary-hover)"
                        disabled={!!amountError || !fieldValues.amount}
                    />
                </>
            }
        >
            <div className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <div className="">
                        <div className="grid grid-cols-1">
                            <InputField
                                label="Amount"
                                type="number"
                                name="amount"
                                value={fieldValues.amount}
                                required
                                onChange={handleChange}
                            />
                            {amountError && (
                                <p className="text-red-500 text-[12px] ml-2">{amountError}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default WalletForm;
