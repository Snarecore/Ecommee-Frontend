import { useState } from "react";
import { Role } from "../../../../enum/role.enum";
import { useAPI } from "../../../../hooks/useApi";
import apiConfig from "../../../../config/api.json";
import { vendorPasswordUpdateQueryKey } from "../../../../config/query-key";
import { FiLock, FiEye, FiEyeOff } from "react-icons/fi";

const passwordUpdateInitialFieldValues = {
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    role: Role.CUSTOMER
};

const ChangePassword  = () => {
    const { handleApiMutation, patchMutation } = useAPI();
    const [passwordUpdateFieldValues, setPasswordUpdateFieldValues] = useState(passwordUpdateInitialFieldValues);
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    const handlePasswordUpdate = async () => {
        if (passwordUpdateFieldValues.newPassword !== passwordUpdateFieldValues.confirmPassword) {
            alert("New Password and Confirm Password do not match!");
            return;
        }

        if (passwordUpdateFieldValues.newPassword.length < 6) {
            alert("Password must be at least 6 characters long!");
            return;
        }

        const result = await handleApiMutation({
            //@ts-ignore
            mutation: patchMutation,
            url: apiConfig.people.customerPasswordUpdate,
            body: {
                currentPassword: passwordUpdateFieldValues.currentPassword,
                newPassword: passwordUpdateFieldValues.newPassword,
                confirmPassword: passwordUpdateFieldValues.confirmPassword
            },
            invalidateQueryKey: [vendorPasswordUpdateQueryKey],
            showSuccessMessage: true,
            showErrorMessage: true,
        });

        if (result?.success) {
            setPasswordUpdateFieldValues({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
                role: Role.CUSTOMER
            });
        }
    };

    const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    return (
        <div className="px-4">
            <div className="max-w-md mx-auto">
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-green-100">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FiLock className="w-8 h-8 text-[var(--color-green-primary)]" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">Change Password</h1>
                        <p className="text-gray-600 text-sm">Update your account password to keep it secure</p>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">
                                Current Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPasswords.current ? "text" : "password"}
                                    className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-green-primary)] focus:border-transparent transition-all duration-200"
                                    placeholder="Enter current password"
                                    value={passwordUpdateFieldValues.currentPassword}
                                    onChange={(e) => setPasswordUpdateFieldValues({ ...passwordUpdateFieldValues, currentPassword: e.target.value })}
                                />
                                <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility('current')}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                                >
                                    {showPasswords.current ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">
                                New Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPasswords.new ? "text" : "password"}
                                    className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-green-primary)] focus:border-transparent transition-all duration-200"
                                    placeholder="Enter new password"
                                    value={passwordUpdateFieldValues.newPassword}
                                    onChange={(e) => setPasswordUpdateFieldValues({ ...passwordUpdateFieldValues, newPassword: e.target.value })}
                                />
                                <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility('new')}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                                >
                                    {showPasswords.new ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                                </button>
                            </div>
                            <p className="text-xs text-gray-500">Password must be at least 6 characters long</p>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">
                                Confirm New Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPasswords.confirm ? "text" : "password"}
                                    className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-green-primary)] focus:border-transparent transition-all duration-200"
                                    placeholder="Confirm new password"
                                    value={passwordUpdateFieldValues.confirmPassword}
                                    onChange={(e) => setPasswordUpdateFieldValues({ ...passwordUpdateFieldValues, confirmPassword: e.target.value })}
                                />
                                <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility('confirm')}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                                >
                                    {showPasswords.confirm ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                                </button>
                            </div>
                        </div>


                        <button 
                            type="submit" 
                            onClick={handlePasswordUpdate} 
                            className="w-full bg-gradient-to-r from-[var(--color-green-primary)] to-emerald-600 text-white font-semibold py-3 px-6 rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-green-primary)] focus:ring-offset-2 cursor-pointer"
                        >
                            Update Password
                        </button>
                    </div>

                    {/* <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <p className="text-xs text-blue-700 text-center">
                            🔒 Your password will be securely updated. Make sure to use a strong, unique password.
                        </p>
                    </div> */}
                </div>
            </div>
        </div>
    )
}

export default ChangePassword