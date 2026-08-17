import Image from "next/image";
import { useState, ChangeEvent } from "react";
import { useAPI } from "../../../hooks/useApi";
import apiConfig from "../../../config/api.json";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import companyLogo from "../../../assets/BazaarBound Logo.svg";

type FieldValues = { password: string; confirm: string };

const requiredFields: any = [
    { key: "email", value: "email", label: "text" },
    { key: "token", value: "token", label: "text" },
    { key: "newPassword", value: "newPassword", label: "text" },
    { key: "confirmPassword", value: "confirmPassword", label: "text" },
];

const ResetPassword = () => {
    const navigate = useNavigate();
    const { postMutation, handleApiMutation } = useAPI();
    const apiUrl = apiConfig.auth.resetPasswordUrl;

    const [searchParams] = useSearchParams();
    const location = useLocation() as { state?: { email?: string; token?: string } } | any;

    const email = (searchParams.get("email") ?? location?.state?.email ?? "").trim();
    const token = (searchParams.get("token") ?? location?.state?.token ?? "").trim();

    const [fields, setFields] = useState<FieldValues>({ password: "", confirm: "" });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFields((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!email || !token) {
            toast.error("Invalid or missing reset link. Please open the link from your email!");
            return;
        }

        if (fields.password !== fields.confirm) {
            toast.error("Passwords do not match.");
            return;
        }

        setIsLoading(true);
        try {
            const result = await handleApiMutation({
                // @ts-ignore
                mutation: postMutation,
                url: apiUrl,
                body: {
                    email,
                    token,
                    newPassword: fields.password,     
                    confirmPassword: fields.confirm, 
                },
                invalidateQueryKey: [],
                showSuccessMessage: true,
                showErrorMessage: true,
                requiredFields, 
            });

            if (result?.success) {
                setFields({ password: "", confirm: "" });
                navigate("/login");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="lg:p-12 flex h-screen w-screen items-center justify-center">
            <div className="w-full lg:w-1/2 px-4 flex items-center">
                <div className="w-2xl mx-auto">
                    <div>
                        <Link to={`/`}>
                            <Image src={companyLogo} alt="company logo" className="mx-auto mb-8" />
                        </Link>
                        <p className="text-xl md:text-3xl font-bold text-[var(--color-black-primary)] mb-2">
                            Reset Password
                        </p>
                        <p className="text-sm md:text-[15px] text-[var(--color-black-primary)]">
                            Reset your BazaarBound password. Enter and confirm a new password to secure your account.
                        </p>
                    </div>


                    <form onSubmit={handleSubmit} className="space-y-4 mt-4" noValidate>
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                New Password <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={fields.password}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[var(--color-green-primary)] transition-all ease-in-out duration-300"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Confirm New Password <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="password"
                                name="confirm"
                                value={fields.confirm}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[var(--color-green-primary)] transition-all ease-in-out duration-300"
                                required
                            />
                            {fields.confirm && fields.password !== fields.confirm && (
                                <p className="text-xs text-red-600 mt-1">Passwords do not match</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[var(--color-green-primary)] text-white py-2 rounded-lg font-bold disabled:opacity-60 cursor-pointer"
                        >
                            {isLoading ? "Saving..." : "Set Password"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
