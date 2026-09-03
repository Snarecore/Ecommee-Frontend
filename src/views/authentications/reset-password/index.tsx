'use client';
import Image from "next/image";
import { useState, ChangeEvent } from "react";
import { useAPI } from "../../../hooks/useApi";
import apiConfig from "../../../config/api.json";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { LuLock, LuShieldCheck, LuArrowRight } from "react-icons/lu";
import companyLogo from "../../../assets/logo.svg";

type FieldValues = { password: string; confirm: string };

const requiredFields: any = [
    { key: "email", value: "email", label: "text" },
    { key: "token", value: "token", label: "text" },
    { key: "newPassword", value: "newPassword", label: "text" },
    { key: "confirmPassword", value: "confirmPassword", label: "text" },
];

const ResetPassword = () => {
    const router = useRouter();
    const { postMutation, handleApiMutation } = useAPI();
    const apiUrl = apiConfig.auth.resetPasswordUrl;

    const searchParams = useSearchParams();

    const email = (searchParams?.get("email") ?? "").trim();
    const token = (searchParams?.get("token") ?? "").trim();

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
                router.push("/login");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-[460px] mx-auto">
            <div className="bg-white dark:bg-slate-800/95 border border-gray-200/80 dark:border-slate-700/80 shadow-xl shadow-gray-200/40 dark:shadow-none rounded-2xl p-6 sm:p-9 transition-all">
                <div className="text-center mb-6">
                    <Link href={`/`} className="inline-block transition-transform hover:scale-105 duration-200">
                        <Image
                            src={companyLogo || "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"}
                            alt="Fashion Time"
                            width={190}
                            height={45}
                            priority
                            className="h-9 sm:h-11 w-auto mx-auto mb-4 object-contain"
                        />
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                        Reset Password
                    </h1>
                    <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        Enter your new password to secure your account.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                            New Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[var(--color-green-primary)] transition-colors">
                                <LuLock className="w-4 h-4" />
                            </div>
                            <input
                                type="password"
                                name="password"
                                value={fields.password}
                                onChange={handleChange}
                                placeholder="••••••••••••"
                                className="w-full bg-white dark:bg-slate-900/60 text-gray-900 dark:text-gray-100 pl-10 pr-4 py-2.5 text-sm border border-gray-300 dark:border-slate-600 rounded-xl focus:outline-none focus:border-[var(--color-green-primary)] focus:ring-2 focus:ring-emerald-500/10 transition-all duration-200"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                            Confirm New Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[var(--color-green-primary)] transition-colors">
                                <LuLock className="w-4 h-4" />
                            </div>
                            <input
                                type="password"
                                name="confirm"
                                value={fields.confirm}
                                onChange={handleChange}
                                placeholder="••••••••••••"
                                className="w-full bg-white dark:bg-slate-900/60 text-gray-900 dark:text-gray-100 pl-10 pr-4 py-2.5 text-sm border border-gray-300 dark:border-slate-600 rounded-xl focus:outline-none focus:border-[var(--color-green-primary)] focus:ring-2 focus:ring-emerald-500/10 transition-all duration-200"
                                required
                            />
                        </div>
                        {fields.confirm && fields.password !== fields.confirm && (
                            <p className="text-xs text-red-600 mt-1 font-medium">Passwords do not match</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full mt-2 py-2.5 px-4 bg-[var(--color-green-primary)] hover:bg-[var(--color-green-secondary)] text-white font-semibold text-sm rounded-xl shadow-md shadow-emerald-900/10 hover:shadow-lg active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Updating Password...</span>
                            </>
                        ) : (
                            <>
                                <span>Save New Password</span>
                                <LuArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
