import { useState, useEffect } from "react";
import { FiCreditCard, FiMail, FiSave, FiEdit2 } from "react-icons/fi";
import { useAPI } from "../../../hooks/useApi";
import apiConfig from "../../../config/api.json";
import { BsFillBuildingFill } from "react-icons/bs";
import { vendorProfileQueryKey } from "../../../config/query-key";

interface BankInfo {
    accountHolderName: string;
    country: string;
    bankName: string;
    branchName: string;
    accountNumber: string;
    iban: string;
    swiftCode: string;
    paypalEmail: string;
    payoutMethod: 'bank' | 'paypal';
}

const initialBankInfo: BankInfo = {
    accountHolderName: "",
    country: "",
    bankName: "",
    branchName: "",
    accountNumber: "",
    iban: "",
    swiftCode: "",
    paypalEmail: "",
    payoutMethod: 'bank'
};

// IBAN-enabled countries
const ibanCountries = [
    'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 
    'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 
    'SE', 'GB', 'CH', 'NO', 'TR', 'AE', 'SA', 'QA', 'KW', 'BH', 'OM', 'JO', 'LB', 
    'TN', 'DZ', 'MA', 'EG', 'ZA', 'NG', 'GH', 'KE', 'UG', 'TZ', 'ZM', 'ZW'
];

// Non-IBAN countries (require account number)
const nonIbanCountries = ['US', 'CA', 'AU', 'NZ', 'JP', 'KR', 'SG', 'MY', 'TH', 'VN', 'PH', 'ID', 'IN', 'BR', 'MX', 'AR', 'CL', 'CO', 'PE', 'VE'];

const countries = [
    { code: 'US', name: 'United States' },
    { code: 'CA', name: 'Canada' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'IT', name: 'Italy' },
    { code: 'ES', name: 'Spain' },
    { code: 'NL', name: 'Netherlands' },
    { code: 'BE', name: 'Belgium' },
    { code: 'AT', name: 'Austria' },
    { code: 'CH', name: 'Switzerland' },
    { code: 'SE', name: 'Sweden' },
    { code: 'NO', name: 'Norway' },
    { code: 'DK', name: 'Denmark' },
    { code: 'FI', name: 'Finland' },
    { code: 'AU', name: 'Australia' },
    { code: 'NZ', name: 'New Zealand' },
    { code: 'JP', name: 'Japan' },
    { code: 'KR', name: 'South Korea' },
    { code: 'SG', name: 'Singapore' },
    { code: 'MY', name: 'Malaysia' },
    { code: 'TH', name: 'Thailand' },
    { code: 'VN', name: 'Vietnam' },
    { code: 'PH', name: 'Philippines' },
    { code: 'ID', name: 'Indonesia' },
    { code: 'IN', name: 'India' },
    { code: 'BR', name: 'Brazil' },
    { code: 'MX', name: 'Mexico' },
    { code: 'AR', name: 'Argentina' },
    { code: 'CL', name: 'Chile' },
    { code: 'CO', name: 'Colombia' },
    { code: 'PE', name: 'Peru' },
    { code: 'VE', name: 'Venezuela' },
    { code: 'AE', name: 'United Arab Emirates' },
    { code: 'SA', name: 'Saudi Arabia' },
    { code: 'QA', name: 'Qatar' },
    { code: 'KW', name: 'Kuwait' },
    { code: 'BH', name: 'Bahrain' },
    { code: 'OM', name: 'Oman' },
    { code: 'JO', name: 'Jordan' },
    { code: 'LB', name: 'Lebanon' },
    { code: 'TN', name: 'Tunisia' },
    { code: 'DZ', name: 'Algeria' },
    { code: 'MA', name: 'Morocco' },
    { code: 'EG', name: 'Egypt' },
    { code: 'ZA', name: 'South Africa' },
    { code: 'NG', name: 'Nigeria' },
    { code: 'GH', name: 'Ghana' },
    { code: 'KE', name: 'Kenya' },
    { code: 'UG', name: 'Uganda' },
    { code: 'TZ', name: 'Tanzania' },
    { code: 'ZM', name: 'Zambia' },
    { code: 'ZW', name: 'Zimbabwe' }
];

const VendorBankInformation = () => {
    const [bankInfo, setBankInfo] = useState<BankInfo>(initialBankInfo);
    const [isEditing, setIsEditing] = useState(false);
    const [errors, setErrors] = useState<Partial<BankInfo>>({});
    const { handleApiMutation, patchFormMutation, fetchData } = useAPI();

    useEffect(() => {
        fetchBankInfo();
    }, []);

    const fetchBankInfo = async () => {
        try {
            const result = await fetchData({ 
                apiUrl: apiConfig.people.vendor
            });
            if (result && result.profile) {
                setBankInfo({
                    accountHolderName: result.profile.accountHolderName || "",
                    country: result.profile.country || "",
                    bankName: result.profile.bankName || "",
                    branchName: result.profile.branchName || "",
                    accountNumber: result.profile.accountNumber || "",
                    iban: result.profile.IBAN || "",
                    swiftCode: result.profile.swiftCode || "",
                    paypalEmail: result.profile.paypalEmailAddress || "",
                    payoutMethod: result.profile.paypalEmailAddress ? 'paypal' : 'bank'
                });
            }
        } catch (error) {
            console.error('No existing bank info found');
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Partial<BankInfo> = {};

        if (bankInfo.payoutMethod === 'bank') {
            if (!bankInfo.accountHolderName.trim()) {
                newErrors.accountHolderName = 'Full name is required';
            }
            if (!bankInfo.country) {
                newErrors.country = 'Country is required';
            }
            if (!bankInfo.bankName.trim()) {
                newErrors.bankName = 'Bank name is required';
            }
            if (!bankInfo.swiftCode.trim()) {
                newErrors.swiftCode = 'SWIFT/BIC code is required';
            }

            // Validate based on country type
            if (ibanCountries.includes(bankInfo.country)) {
                if (!bankInfo.iban.trim()) {
                    newErrors.iban = 'IBAN is required for this country';
                }
            } else if (nonIbanCountries.includes(bankInfo.country)) {
                if (!bankInfo.accountNumber.trim()) {
                    newErrors.accountNumber = 'Account number is required for this country';
                }
            }
        } else if (bankInfo.payoutMethod === 'paypal') {
            if (!bankInfo.paypalEmail.trim()) {
                newErrors.paypalEmail = 'PayPal email is required';
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bankInfo.paypalEmail)) {
                newErrors.paypalEmail = 'Please enter a valid email address';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        const apiData = {
                accountHolderName: bankInfo.accountHolderName,
                country: bankInfo.country,
                bankName: bankInfo.bankName,
                branchName: bankInfo.branchName,
                accountNumber: bankInfo.accountNumber,
                IBAN: bankInfo.iban,
                swiftCode: bankInfo.swiftCode,
                paypalEmailAddress: bankInfo.payoutMethod === 'paypal' ? bankInfo.paypalEmail : null 
        };

        const result = await handleApiMutation({
            //@ts-ignore
            mutation: patchFormMutation,
            url: apiConfig.people.vendorProfile,
            body: apiData,
            invalidateQueryKey: [vendorProfileQueryKey],
            showSuccessMessage: true,
            showErrorMessage: true,
        });

        if (result?.success) {
            setIsEditing(false);
            fetchBankInfo();
        }
    };

    const handleInputChange = (field: keyof BankInfo, value: string) => {
        setBankInfo(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const isIbanCountry = ibanCountries.includes(bankInfo.country);
    const isNonIbanCountry = nonIbanCountries.includes(bankInfo.country);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Payout Information</h1>
                    <p className="text-gray-600">Configure your payout method to receive payments</p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="bg-[var(--color-green-primary)] px-8 py-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                    <FiCreditCard className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Payout Settings</h2>
                                    <p className="text-white/90 text-sm">Manage your payment preferences</p>
                                </div>
                            </div>
                            {!isEditing && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="bg-[var(--color-green-secondary)] text-black font-semibold px-6 py-3 rounded-xl text-sm cursor-pointer transition-all duration-300 flex items-center gap-2 hover:bg-white/30"
                                >
                                    <FiEdit2 />
                                    <span>Edit Information</span>
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="p-8">
                        <div className="mb-8">
                            <p className="text-lg font-semibold text-gray-800 mb-4">Payout Method</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button
                                    onClick={() => handleInputChange('payoutMethod', 'bank')}
                                    className={`p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                                        bankInfo.payoutMethod === 'bank'
                                            ? 'border-[var(--color-green-primary)] bg-green-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <BsFillBuildingFill className={`w-6 h-6 ${
                                            bankInfo.payoutMethod === 'bank' 
                                                ? 'text-[var(--color-green-primary)]' 
                                                : 'text-gray-400'
                                        }`} />
                                        <div className="text-left">
                                            <p className="font-semibold text-gray-800">Bank Transfer</p>
                                            <p className="text-sm text-gray-600">Direct bank deposit</p>
                                        </div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => handleInputChange('payoutMethod', 'paypal')}
                                    className={`p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                                        bankInfo.payoutMethod === 'paypal'
                                            ? 'border-[var(--color-green-primary)] bg-green-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <FiMail className={`w-6 h-6 ${
                                            bankInfo.payoutMethod === 'paypal' 
                                                ? 'text-[var(--color-green-primary)]' 
                                                : 'text-gray-400'
                                        }`} />
                                        <div className="text-left">
                                            <p className="font-semibold text-gray-800">PayPal</p>
                                            <p className="text-sm text-gray-600">PayPal email transfer</p>
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Bank Transfer Form */}
                        {bankInfo.payoutMethod === 'bank' && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <BsFillBuildingFill className="w-5 h-5 text-[var(--color-green-primary)]" />
                                    Bank Transfer Details
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Full Name */}
                                    <div>
                                        <label className="block mb-2 text-sm font-semibold text-gray-700">
                                            Full Name (Account Holder) *
                                        </label>
                                        <input
                                            type="text"
                                            value={bankInfo.accountHolderName}
                                            onChange={(e) => handleInputChange('accountHolderName', e.target.value)}
                                            disabled={!isEditing}
                                            className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 ${
                                                errors.accountHolderName 
                                                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                                                    : 'border-gray-300 focus:border-[var(--color-green-primary)] focus:ring-green-200'
                                            } ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
                                            placeholder="Enter account holder name"
                                        />
                                        {errors.accountHolderName && (
                                            <p className="text-red-500 text-sm mt-1">{errors.accountHolderName}</p>
                                        )}
                                    </div>

                                    {/* Country */}
                                    <div>
                                        <label className="block mb-2 text-sm font-semibold text-gray-700">
                                            Country *
                                        </label>
                                        <select
                                            value={bankInfo.country}
                                            onChange={(e) => handleInputChange('country', e.target.value)}
                                            disabled={!isEditing}
                                            className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 ${
                                                errors.country 
                                                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                                                    : 'border-gray-300 focus:border-[var(--color-green-primary)] focus:ring-green-200'
                                            } ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
                                        >
                                            <option value="">Select Country</option>
                                            {countries.map(country => (
                                                <option key={country.code} value={country.code}>
                                                    {country.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.country && (
                                            <p className="text-red-500 text-sm mt-1">{errors.country}</p>
                                        )}
                                    </div>

                                    {/* Bank Name */}
                                    <div>
                                        <label className="block mb-2 text-sm font-semibold text-gray-700">
                                            Bank Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={bankInfo.bankName}
                                            onChange={(e) => handleInputChange('bankName', e.target.value)}
                                            disabled={!isEditing}
                                            className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 ${
                                                errors.bankName 
                                                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                                                    : 'border-gray-300 focus:border-[var(--color-green-primary)] focus:ring-green-200'
                                            } ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
                                            placeholder="e.g., HSBC, Citi Bank"
                                        />
                                        {errors.bankName && (
                                            <p className="text-red-500 text-sm mt-1">{errors.bankName}</p>
                                        )}
                                    </div>

                                    {/* Branch Name */}
                                    <div>
                                        <label className="block mb-2 text-sm font-semibold text-gray-700">
                                            Branch Name (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            value={bankInfo.branchName}
                                            onChange={(e) => handleInputChange('branchName', e.target.value)}
                                            disabled={!isEditing}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-green-primary)] focus:border-transparent transition-all duration-200 bg-white"
                                            placeholder="Enter branch name if needed"
                                        />
                                    </div>

                                    {/* Account Number (for non-IBAN countries) */}
                                    {isNonIbanCountry && (
                                        <div>
                                            <label className="block mb-2 text-sm font-semibold text-gray-700">
                                                Account Number *
                                            </label>
                                            <input
                                                type="text"
                                                value={bankInfo.accountNumber}
                                                onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                                                disabled={!isEditing}
                                                className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 ${
                                                    errors.accountNumber 
                                                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                                                        : 'border-gray-300 focus:border-[var(--color-green-primary)] focus:ring-green-200'
                                                } ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
                                                placeholder="Enter account number"
                                            />
                                            {errors.accountNumber && (
                                                <p className="text-red-500 text-sm mt-1">{errors.accountNumber}</p>
                                            )}
                                        </div>
                                    )}

                                    {/* IBAN (for IBAN countries) */}
                                    {isIbanCountry && (
                                        <div>
                                            <label className="block mb-2 text-sm font-semibold text-gray-700">
                                                IBAN *
                                            </label>
                                            <input
                                                type="text"
                                                value={bankInfo.iban}
                                                onChange={(e) => handleInputChange('iban', e.target.value)}
                                                disabled={!isEditing}
                                                className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 ${
                                                    errors.iban 
                                                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                                                        : 'border-gray-300 focus:border-[var(--color-green-primary)] focus:ring-green-200'
                                                } ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
                                                placeholder="Enter IBAN"
                                            />
                                            {errors.iban && (
                                                <p className="text-red-500 text-sm mt-1">{errors.iban}</p>
                                            )}
                                        </div>
                                    )}

                                    {/* SWIFT/BIC Code */}
                                    <div>
                                        <label className="block mb-2 text-sm font-semibold text-gray-700">
                                            SWIFT/BIC Code *
                                        </label>
                                        <input
                                            type="text"
                                            value={bankInfo.swiftCode}
                                            onChange={(e) => handleInputChange('swiftCode', e.target.value)}
                                            disabled={!isEditing}
                                            className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 ${
                                                errors.swiftCode 
                                                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                                                    : 'border-gray-300 focus:border-[var(--color-green-primary)] focus:ring-green-200'
                                            } ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
                                            placeholder="Enter SWIFT/BIC code"
                                        />
                                        {errors.swiftCode && (
                                            <p className="text-red-500 text-sm mt-1">{errors.swiftCode}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Country-specific info */}
                                {bankInfo.country && (
                                    <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                                        <p className="text-sm text-blue-700">
                                            {isIbanCountry 
                                                ? `📋 ${countries.find(c => c.code === bankInfo.country)?.name} requires IBAN for international transfers.`
                                                : isNonIbanCountry
                                                ? `📋 ${countries.find(c => c.code === bankInfo.country)?.name} requires account number for transfers.`
                                                : `📋 Please ensure all required fields are completed for ${countries.find(c => c.code === bankInfo.country)?.name}.`
                                            }
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* PayPal Form */}
                        {bankInfo.payoutMethod === 'paypal' && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <FiMail className="w-5 h-5 text-[var(--color-green-primary)]" />
                                    PayPal Payout Details
                                </h3>

                                <div>
                                    <label className="block mb-2 text-sm font-semibold text-gray-700">
                                        PayPal Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        value={(bankInfo.paypalEmail == "null" || bankInfo.paypalEmail == null) ? "" : bankInfo.paypalEmail }
                                        onChange={(e) => handleInputChange('paypalEmail', e.target.value)}
                                        disabled={!isEditing}
                                        className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 ${
                                            errors.paypalEmail 
                                                ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                                                : 'border-gray-300 focus:border-[var(--color-green-primary)] focus:ring-green-200'
                                        } ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
                                        placeholder="Enter email address"
                                    />
                                    {errors.paypalEmail && (
                                        <p className="text-red-500 text-sm mt-1">{errors.paypalEmail}</p>
                                    )}
                                </div>

                                <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                                    <p className="text-sm text-yellow-700">
                                        💡 Make sure your PayPal email is verified and can receive payments.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        {isEditing && (
                            <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
                                <button
                                    onClick={() => {
                                        setIsEditing(false);
                                        setErrors({});
                                        fetchBankInfo();
                                    }}
                                    className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="bg-gradient-to-r from-[var(--color-green-primary)] to-emerald-600 text-white font-semibold px-6 py-3 rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex items-center gap-2"
                                >
                                    <FiSave />
                                    Save Information
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorBankInformation;