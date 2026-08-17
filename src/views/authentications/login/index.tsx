import Image from "next/image";
import { LuMail } from "react-icons/lu";
import { BiSolidHide, BiSolidShow } from "react-icons/bi";
import companyLogo from "../../../assets/BazaarBound Logo.svg";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ChangeEvent, useState } from "react";
import { useSetAtom } from "jotai";
import { userAtom } from "../../../store/user-store";
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
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/";
    const setUser = useSetAtom(userAtom);
    const { postMutation, handleApiMutation } = useAPI();
    const [showPassword, setShowPassword] = useState(false);
    const [fieldValues, setFieldValues] = useState(initialFieldValues);

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFieldValues((prevState) => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

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

        // @ts-ignore
        if (result?.success && result.data?.data?.user) {
            // @ts-ignore
            const { user } = result.data.data;
            sessionStorage.setItem("user", JSON.stringify(user));
            setUser(user);
            JSON.parse(sessionStorage.getItem("user") || "{}");
            if (user.role === "vendor") {
                navigate("/vendor-dashboard");
            } else if (user.role === "customer") {
                navigate(from);
            } else {
                navigate("/");
            }
        }
    };

    return (
        <div className="p-8 lg:p-12 flex h-screen w-screen items-center justify-center">
            <div className="w-2xl mx-auto space-y-8">
                <div className="">
                    <Link to={"/"}>
                        <Image src={companyLogo} alt="company logo" className="w-72 mx-auto mb-4" />
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
                                <Link to={"/forgot-password"}
                                    className="text-[var(--color-black-primary)] font-semibold text-[15px]"
                                >
                                    Forgot Password?
                                </Link>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-[var(--color-green-secondary)] py-2 rounded-lg font-bold cursor-pointer"
                    >
                        Sign In
                    </button>

                    <p className="text-center text-[15px] text-[#092C4C]">
                        Don't have an account? <span className="text-[var(--color-green-primary)] font-semibold">Sign Up</span>
                    </p>
                    <div className="flex items-center justify-center gap-4">
                        <Link to={"/vendor-signup"}
                            className="bg-white text-[var(--color-green-primary)] font-bold px-4 py-2 rounded-md border"
                        >
                            Vendor Registration
                        </Link>

                        <Link to={"/signup"}
                            className="bg-[var(--color-green-secondary)] font-bold px-4 py-2 rounded-md"
                        >
                            Customer Registration
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
