'use client';
import Image from "next/image";
import { LuMail } from "react-icons/lu";
import { BiSolidHide, BiSolidShow } from "react-icons/bi";
import companyLogo from "../../../assets/BazaarBound Logo.svg";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChangeEvent, useState } from "react";
import { useSetAtom } from "jotai";
import { userAtom } from "../../../store/user-store";
import { setCookie } from "../../../utils/cookie-utils";
import { useAPI } from "../../../hooks/useApi";
import apiConfig from "../../../config/api.json";
import { loginQueryKey } from "../../../config/query-key";

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
    const [showPassword, setShowPassword] = useState(false);
    const [fieldValues, setFieldValues] = useState(initialFieldValues);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFieldValues((prevState) => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            const mutation = postMutation;
            const url = apiConfig.auth.loginUrl;

            const result = await handleApiMutation({
                // @ts-ignore
                mutation,
                url,
                body: fieldValues,
                invalidateQueryKey: [loginQueryKey],
                showSuccessMessage: true,
                showErrorMessage: true,
                requiredFields
            });

            if (result?.success && result.data) {
                const resData: any = result.data;
                const unpackedUser = resData?.data?.user || resData?.data?.data?.user || resData?.user || resData?.data;

                const token = resData?.data?.accessToken || resData?.accessToken || resData?.data?.token || resData?.token;

                if (unpackedUser && typeof unpackedUser === 'object') {
                    const fullUserData = { ...unpackedUser, token: token || unpackedUser.token };
                    setCookie("user", JSON.stringify(fullUserData), 7);
                    setUser(fullUserData);
                    router.push(targetFrom);
                    return;
                }
            }
        } catch (error) {
            console.error("Login error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-8 lg:p-12 flex h-screen w-screen items-center justify-center">
            <div className="w-2xl mx-auto space-y-8">
                <div className="">
                    <Link href={"/"}>
                        <Image src={companyLogo || "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"} alt="company logo" className="w-72 mx-auto mb-4" />
                    </Link>
                    <h1 className="text-3xl text-center font-bold text-[var(--color-black-primary)] mb-2">Log in to your account</h1>
                    <p className="text-[15px] text-center text-[var(--color-black-primary)]">
                        Welcome back! Please enter your credentials.
                    </p>
                </div>

                <form className="space-y-5" onSubmit={handleLogin}>
                    <div className="space-y-4">
                        <div>
                            <label className="block mb-1.5">
                                <span className="text-[14px] font-bold text-[var(--color-black-primary)]">
                                    Email
                                </span>
                                <span className="text-red-500 ml-1">*</span>
                            </label>
                            <div className="relative group">
                                <input
                                    type="email"
                                    name="email"
                                    value={fieldValues.email}
                                    onChange={handleChange}
                                    className="w-full bg-white text-[#212b36] px-4 py-2 border border-[var(--color-green-primary)] rounded-lg focus:outline-none focus:border-[var(--color-green-primary)] transition-all duration-200"
                                    required
                                />
                                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none transition-colors duration-200 border-l border-gray-200">
                                    <LuMail className="h-6 w-6 pl-2" />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block mb-1.5">
                                <span className="text-[14px] font-bold text-[var(--color-black-primary)]">
                                    Password
                                </span>
                                <span className="text-red-500 ml-1">*</span>
                            </label>
                            <div className="relative group">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={fieldValues.password}
                                    name="password"
                                    onChange={handleChange}
                                    className="w-full bg-white text-[#212b36] px-4 py-2 border border-[var(--color-green-primary)] rounded-lg focus:outline-none focus:border-[var(--color-green-primary)] transition-all duration-200"
                                    required
                                />
                                <div
                                    className="absolute inset-y-0 right-3 flex items-center cursor-pointer transition-colors duration-200 border-l pl-2 border-gray-200"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <BiSolidShow className="h-5 w-5  hover:text-gray-700" />
                                    ) : (
                                        <BiSolidHide className="h-5 w-5  hover:text-gray-700" />
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end items-center cursor-pointer">
                            {/* <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="terms"
                                    className="w-4 h-4 cursor-pointer focus:outline-none"
                                />
                                <label
                                    htmlFor="terms"
                                    className="text-[15px] text-[var(--color-green-primary)] font-normal cursor-pointer"
                                >
                                    Remember me
                                </label>
                            </div> */}

                            <div>
                                <Link href={"/forgot-password"}
                                    className="text-[var(--color-black-primary)] font-semibold text-[15px]"
                                >
                                    Forgot Password?
                                </Link>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-[var(--color-green-secondary)] py-2.5 rounded-lg font-bold cursor-pointer hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                <span>Signing In...</span>
                            </>
                        ) : (
                            <span>Sign In</span>
                        )}
                    </button>

                    <p className="text-center text-[15px] text-[#092C4C]">
                        Don't have an account?{" "}
                        <Link href={"/signup"} className="text-[var(--color-green-primary)] font-semibold hover:underline">
                            Sign Up
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;
