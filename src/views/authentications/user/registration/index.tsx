'use client';
import Image from "next/image";
import { FiPhone, FiUser } from "react-icons/fi";
import { LuMail, LuLock, LuShieldCheck, LuArrowRight } from "react-icons/lu";
import { BiSolidHide, BiSolidShow } from "react-icons/bi";
import companyLogo from "../../../../assets/logo.svg";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChangeEvent, useState } from "react";
import { useAPI } from "../../../../hooks/useApi";
import apiConfig from "../../../../config/api.json";
import { userRegistrationQueryKey } from "../../../../config/query-key";
import { showSuccessToast } from "../../../../utils/toast-utils";
import { Role } from "../../../../enum/role.enum";

const initialFieldValues = {
	name: "",
	email: "",
	phone: "",
	password: "",
	confirmPassword: "",
	role: Role.CUSTOMER
};

const requiredFields = [
	{ key: "name", value: "name", label: "text" },
	{ key: "email", value: "email", label: "text" },
	{ key: "phone", value: "phone", label: "text" },
	{ key: "password", value: "password", label: "text" },
	{ key: "confirmPassword", value: "confirmPassword", label: "text" }
];

const UserRegistration = () => {
	const router = useRouter();
	const { postMutation, handleApiMutation } = useAPI();
	const [fieldValues, setFieldValues] = useState(initialFieldValues);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFieldValues(prev => ({ ...prev, [name]: value }));
	};

	const handleSubmitForm = async (e: React.FormEvent) => {
		e.preventDefault();
		if (isSubmitting) return;

		if (fieldValues.password !== fieldValues.confirmPassword) {
			alert("Passwords do not match!");
			return;
		}

		setIsSubmitting(true);
		try {
			const success = await handleApiMutation({
				mutation: postMutation,
				url: apiConfig.auth.registrationUrl,
				body: fieldValues,
				requiredFields,
				invalidateQueryKey: [userRegistrationQueryKey],
			});

			if (success) {
				showSuccessToast("Account created successfully! Please sign in.");
				setFieldValues(initialFieldValues);
				router.push("/login");
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="w-full max-w-[500px] mx-auto">
			<div className="bg-white dark:bg-slate-800/95 border border-gray-200/80 dark:border-slate-700/80 shadow-xl shadow-gray-200/40 dark:shadow-none rounded-2xl p-6 sm:p-9 transition-all">
				{/* Brand Title */}
				<div className="text-center mb-6">
					<h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Create an Account</h1>
					<p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
						Join Fashion Time to explore thousands of products
					</p>
				</div>

				<form className="space-y-4" onSubmit={handleSubmitForm} noValidate>
					{/* Name */}
					<div>
						<label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
							Full Name <span className="text-red-500">*</span>
						</label>
						<div className="relative group">
							<div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[var(--color-green-primary)] transition-colors">
								<FiUser className="w-4 h-4" />
							</div>
							<input
								type="text"
								name="name"
								value={fieldValues.name}
								onChange={handleChange}
								placeholder="John Doe"
								className="w-full bg-white dark:bg-slate-900/60 text-gray-900 dark:text-gray-100 pl-10 pr-4 py-2.5 text-sm border border-gray-300 dark:border-slate-600 rounded-xl focus:outline-none focus:border-[var(--color-green-primary)] focus:ring-2 focus:ring-emerald-500/10 transition-all duration-200"
								required
							/>
						</div>
					</div>

					{/* Phone */}
					<div>
						<label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
							Phone Number <span className="text-red-500">*</span>
						</label>
						<div className="relative group">
							<div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[var(--color-green-primary)] transition-colors">
								<FiPhone className="w-4 h-4" />
							</div>
							<input
								type="text"
								name="phone"
								value={fieldValues.phone}
								onChange={handleChange}
								placeholder="+8801XXXXXXXXX"
								className="w-full bg-white dark:bg-slate-900/60 text-gray-900 dark:text-gray-100 pl-10 pr-4 py-2.5 text-sm border border-gray-300 dark:border-slate-600 rounded-xl focus:outline-none focus:border-[var(--color-green-primary)] focus:ring-2 focus:ring-emerald-500/10 transition-all duration-200"
								required
							/>
						</div>
					</div>

					{/* Email */}
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
								className="w-full bg-white dark:bg-slate-900/60 text-gray-900 dark:text-gray-100 pl-10 pr-4 py-2.5 text-sm border border-gray-300 dark:border-slate-600 rounded-xl focus:outline-none focus:border-[var(--color-green-primary)] focus:ring-2 focus:ring-emerald-500/10 transition-all duration-200"
								required
							/>
						</div>
					</div>

					{/* Password */}
					<div>
						<label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
							Password <span className="text-red-500">*</span>
						</label>
						<div className="relative group">
							<div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[var(--color-green-primary)] transition-colors">
								<LuLock className="w-4 h-4" />
							</div>
							<input
								name="password"
								value={fieldValues.password}
								onChange={handleChange}
								type={showPassword ? "text" : "password"}
								placeholder="••••••••••••"
								className="w-full bg-white dark:bg-slate-900/60 text-gray-900 dark:text-gray-100 pl-10 pr-11 py-2.5 text-sm border border-gray-300 dark:border-slate-600 rounded-xl focus:outline-none focus:border-[var(--color-green-primary)] focus:ring-2 focus:ring-emerald-500/10 transition-all duration-200"
								required
							/>
							<button
								type="button"
								className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none transition-colors cursor-pointer"
								onClick={() => setShowPassword(!showPassword)}
								tabIndex={-1}
							>
								{showPassword ? (
									<BiSolidShow className="w-5 h-5" />
								) : (
									<BiSolidHide className="w-5 h-5" />
								)}
							</button>
						</div>
					</div>

					{/* Confirm Password */}
					<div>
						<label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
							Confirm Password <span className="text-red-500">*</span>
						</label>
						<div className="relative group">
							<div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[var(--color-green-primary)] transition-colors">
								<LuLock className="w-4 h-4" />
							</div>
							<input
								name="confirmPassword"
								value={fieldValues.confirmPassword}
								onChange={handleChange}
								type={showConfirmPassword ? "text" : "password"}
								placeholder="••••••••••••"
								className="w-full bg-white dark:bg-slate-900/60 text-gray-900 dark:text-gray-100 pl-10 pr-11 py-2.5 text-sm border border-gray-300 dark:border-slate-600 rounded-xl focus:outline-none focus:border-[var(--color-green-primary)] focus:ring-2 focus:ring-emerald-500/10 transition-all duration-200"
								required
							/>
							<button
								type="button"
								className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none transition-colors cursor-pointer"
								onClick={() => setShowConfirmPassword(!showConfirmPassword)}
								tabIndex={-1}
							>
								{showConfirmPassword ? (
									<BiSolidShow className="w-5 h-5" />
								) : (
									<BiSolidHide className="w-5 h-5" />
								)}
							</button>
						</div>
					</div>

					<button
						type="submit"
						disabled={isSubmitting}
						className="w-full mt-2 py-2.5 px-4 bg-[var(--color-green-primary)] hover:bg-[var(--color-green-secondary)] text-white font-semibold text-sm rounded-xl shadow-md shadow-emerald-900/10 hover:shadow-lg active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
					>
						{isSubmitting ? (
							<>
								<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
								<span>Creating Account...</span>
							</>
						) : (
							<>
								<span>Create Account</span>
								<LuArrowRight className="w-4 h-4" />
							</>
						)}
					</button>

					<p className="text-center text-xs sm:text-sm text-gray-600 dark:text-gray-400 pt-2">
						Already have an account?{" "}
						<Link href={"/login"} className="font-bold text-[var(--color-green-primary)] dark:text-emerald-400 hover:underline">
							Sign In
						</Link>
					</p>
				</form>
			</div>
		</div>
	);
};

export default UserRegistration;
