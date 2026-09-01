'use client';

import React, { ChangeEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSetAtom } from "jotai";
import { FcGoogle } from "react-icons/fc";
import { LuMail, LuLock, LuShieldCheck, LuArrowRight } from "react-icons/lu";
import { BiSolidHide, BiSolidShow } from "react-icons/bi";

import companyLogo from "../../../assets/BazaarBound Logo.svg";
import { userAtom, User } from "../../../store/user-store";
import { setCookie } from "../../../utils/cookie-utils";
import { useAPI } from "../../../hooks/useApi";
import apiConfig from "../../../config/api.json";
import { loginQueryKey } from "../../../config/query-key";
import { showErrorToast, showSuccessToast } from "../../../utils/toast-utils";
import { loginWithGoogle } from "../../../services/firebase-auth.service";

const initialFieldValues = {
    email: "",
    password: ""
};

const requiredFields: any = [
    { key: "email", value: "email", label: "text" },
    { key: "password", value: "password", label: "text" }
];

const Login = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const rawFrom = searchParams?.get("from") || "/";
    const targetFrom = (rawFrom.startsWith("/") && !rawFrom.startsWith("//")) ? rawFrom : "/";

    const setUser = useSetAtom(userAtom);
    const { postMutation, handleApiMutation } = useAPI();

    const [fieldValues, setFieldValues] = useState(initialFieldValues);
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Load remembered email from localStorage
    useEffect(() => {
        try {
            const savedEmail = localStorage.getItem("fashiontime_remembered_email");
            if (savedEmail) {
                setFieldValues(prev => ({ ...prev, email: savedEmail }));
                setRememberMe(true);
            }
        } catch {
            // ignore
        }
    }, []);

    const emailValid = useMemo(() => {
        if (!fieldValues.email) return true;
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fieldValues.email);
    }, [fieldValues.email]);

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setErrorMessage(null);
        setFieldValues(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    // -------------------------------------------------------------
    // Email / Password Login
    // -------------------------------------------------------------
    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isSubmitting || isGoogleSubmitting) return;

        if (!emailValid) {
            setErrorMessage("Please enter a valid email address.");
            return;
        }

        setIsSubmitting(true);
        setErrorMessage(null);

        // Save or remove remembered email
        try {
            if (rememberMe && fieldValues.email) {
                localStorage.setItem("fashiontime_remembered_email", fieldValues.email);
            } else {
                localStorage.removeItem("fashiontime_remembered_email");
            }
        } catch {
            // ignore
        }

        try {
            const mutation = postMutation;
            const url = apiConfig.auth.loginUrl;

            const result = await handleApiMutation({
                // @ts-ignore
                mutation,
                url,
                body: fieldValues,
                invalidateQueryKey: [loginQueryKey],
                showSuccessMessage: false,
                showErrorMessage: true,
                requiredFields
            });

            if (result?.success && result.data) {
                const resData: any = result.data;
                const unpackedUser = resData?.data?.user || resData?.data?.data?.user || resData?.user || resData?.data;
                const token = resData?.data?.accessToken || resData?.accessToken || resData?.data?.token || resData?.token;

                if (unpackedUser && typeof unpackedUser === 'object') {
                    const fullUserData: User = {
                        ...unpackedUser,
                        token: token || unpackedUser.token
                    };
                    setCookie("user", JSON.stringify(fullUserData), 7);
                    setUser(fullUserData);
                    showSuccessToast("Welcome back! Signed in successfully.");
                    router.push(targetFrom);
                    return;
                }
            } else if (result && !result.success) {
                const err = (result as any)?.error;
                setErrorMessage(err?.response?.data?.message || err?.message || "Login failed. Please check your credentials.");
            }
        } catch (error: any) {
            // console.error("Login error:", error);
            setErrorMessage(error?.message || "An unexpected error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // -------------------------------------------------------------
    // Firebase Google Sign-In
    // -------------------------------------------------------------
    const handleGoogleSignIn = async () => {
        if (isGoogleSubmitting || isSubmitting) return;
        setIsGoogleSubmitting(true);
        setErrorMessage(null);

        try {
            const result = await loginWithGoogle();

            if (result.success && result.user) {
                setUser(result.user);
                showSuccessToast(`Welcome back, ${result.user.name || "User"}! Signed in with Google.`);
                router.push(targetFrom);
            } else if (result.error) {
                showErrorToast(result.error);
                setErrorMessage(result.error);
            }
        } catch (error: any) {
            // console.error("Google Sign-In Error:", error);
            showErrorToast("An unexpected error occurred during Google sign in.");
        } finally {
            setIsGoogleSubmitting(false);
        }
    };

    return (
        <div className="w-full max-w-[480px] mx-auto">
            {/* Clean Centered Auth Card */}
            <div className="bg-white dark:bg-slate-800/95 border border-gray-200/80 dark:border-slate-700/80 shadow-xl shadow-gray-200/40 dark:shadow-none rounded-2xl p-6 sm:p-9 transition-all">
                {/* Brand Logo & Title */}
                <div className="text-center mb-6">
                    <Link href="/" className="inline-block transition-transform hover:scale-105 duration-200">
                        <Image
                            src={companyLogo || "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"}
                            alt="Fashion Time"
                            width={190}
                            height={45}
                            priority
                            className="h-9 sm:h-11 w-auto mx-auto mb-4 object-contain"
                        />
                    </Link>
                    <h1 className="text-2xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                        Sign In to Your Account
                    </h1>
                    <p className="mt-1.5 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        Welcome back! Please enter your details.
                    </p>
                </div>

                {/* Google Sign-In Button */}
                <div className="mb-5">
                    <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={isGoogleSubmitting || isSubmitting}
                        className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white dark:bg-slate-700/80 text-gray-700 dark:text-gray-200 font-semibold text-sm rounded-xl border border-gray-300 dark:border-slate-600 shadow-sm hover:shadow hover:bg-gray-50 dark:hover:bg-slate-700 active:scale-[0.99] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {isGoogleSubmitting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                                <span>Connecting with Google...</span>
                            </>
                        ) : (
                            <>
                                <FcGoogle className="w-5 h-5 flex-shrink-0" />
                                <span>Sign in with Google</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Divider */}
                <div className="relative my-5">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200 dark:border-slate-700"></div>
                    </div>
                    <div className="relative flex justify-center text-[11px] uppercase">
                        <span className="bg-white dark:bg-slate-800 px-3 text-gray-400 dark:text-gray-500 font-medium tracking-wider">
                            Or continue with email
                        </span>
                    </div>
                </div>

                {/* Error Banner */}
                {errorMessage && (
                    <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 text-xs sm:text-sm flex items-start gap-2 animate-in fade-in duration-200">
                        <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0"></div>
                        <span className="flex-1 font-medium">{errorMessage}</span>
                    </div>
                )}

                {/* Login Form */}
                <form className="space-y-4" onSubmit={handleLogin} noValidate>
                    {/* Email Input */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                            Email Address <span className="text-red-500">*</span>
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[var(--color-green-primary)] transition-colors">
                                <LuMail className="w-4 h-4" />
                            </div>
                            <input
                                type="email"
                                name="email"
                                value={fieldValues.email}
                                onChange={handleChange}
                                placeholder="name@example.com"
                                className={`w-full bg-white dark:bg-slate-900/60 text-gray-900 dark:text-gray-100 pl-10 pr-4 py-2.5 text-sm border rounded-xl focus:outline-none transition-all duration-200 ${
                                    !emailValid
                                        ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-950"
                                        : "border-gray-300 dark:border-slate-600 focus:border-[var(--color-green-primary)] focus:ring-2 focus:ring-emerald-500/10"
                                }`}
                                required
                            />
                        </div>
                        {!emailValid && fieldValues.email.length > 0 && (
                            <p className="text-xs text-red-500 mt-1 font-medium">Please enter a valid email address.</p>
                        )}
                    </div>

                    {/* Password Input */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                Password <span className="text-red-500">*</span>
                            </label>
                            <Link
                                href="/forgot-password"
                                className="text-xs font-semibold text-[var(--color-green-primary)] dark:text-emerald-400 hover:underline transition-colors"
                            >
                                Forgot Password?
                            </Link>
                        </div>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[var(--color-green-primary)] transition-colors">
                                <LuLock className="w-4 h-4" />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={fieldValues.password}
                                onChange={handleChange}
                                placeholder="••••••••••••"
                                className="w-full bg-white dark:bg-slate-900/60 text-gray-900 dark:text-gray-100 pl-10 pr-11 py-2.5 text-sm border border-gray-300 dark:border-slate-600 rounded-xl focus:outline-none focus:border-[var(--color-green-primary)] focus:ring-2 focus:ring-emerald-500/10 transition-all duration-200"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none transition-colors cursor-pointer"
                                tabIndex={-1}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? (
                                    <BiSolidShow className="w-5 h-5" />
                                ) : (
                                    <BiSolidHide className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Remember Me */}
                    <div className="flex items-center pt-0.5">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="w-4 h-4 rounded text-[var(--color-green-primary)] accent-[var(--color-green-primary)] border-gray-300 dark:border-slate-600 cursor-pointer"
                            />
                            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                Remember me
                            </span>
                        </label>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting || isGoogleSubmitting}
                        className="w-full mt-1 py-2.5 px-4 bg-[var(--color-green-primary)] hover:bg-[var(--color-green-secondary)] text-white font-semibold text-sm rounded-xl shadow-md shadow-emerald-900/10 hover:shadow-lg active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Signing In...</span>
                            </>
                        ) : (
                            <>
                                <span>Sign In</span>
                                <LuArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </form>

                {/* Account Switcher */}
                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-700/80 text-center">
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        Don't have an account?{" "}
                        <Link
                            href="/signup"
                            className="font-bold text-[var(--color-green-primary)] dark:text-emerald-400 hover:underline transition-colors"
                        >
                            Sign Up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
