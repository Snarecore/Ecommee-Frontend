import Image from "next/image";
import { FiPhone, FiUser } from "react-icons/fi";
import { LuMail } from "react-icons/lu";
import { BiSolidHide, BiSolidShow } from "react-icons/bi";
import companyLogo from "../../../../assets/BazaarBound Logo.svg";
import { useNavigate } from "react-router-dom";
import Link from "next/link";;
import { ChangeEvent, useState } from "react";
import { useAPI } from "../../../../hooks/useApi";
import apiConfig from "../../../../config/api.json";
import { vendorRegistrationQueryKey } from "../../../../config/query-key";
import { showSuccessToast } from "../../../../utils/toast-utils";
import { Role } from "../../../../enum/role.enum";
import ImageUpload from "../../../../component/image/ImageUpload";

const initialFieldValues = {
	name: "",
	phone: "",
	email: "",
	password: "",
	confirmPassword: "",
	shopName: "",
	shopImage: "" as string | File,
	role: Role.VENDOR
};

const requiredFields = [
	{ key: "name", value: "name", label: "text" },
	{ key: "phone", value: "phone", label: "text" },
	{ key: "email", value: "email", label: "text" },
	{ key: "password", value: "password", label: "text" },
	{ key: "confirmPassword", value: "confirm password", label: "text" },
	{ key: "shopName", value: "shop name", label: "text" },
	{ key: "shopImage", value: "shop image", label: "image" },
];

const VendorRegistration = () => {
	const navigate = useNavigate();
	const { postFormMutation, handleApiMutation } = useAPI();
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [fieldValues, setFieldValues] = useState(initialFieldValues);

	const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
		const { name, value } = event.target;
		setFieldValues((prev) => ({
			...prev,
			[name]: value
		}));
	};

	const handleImageUpload = (file: File | null) => {
		if (file) {
			setFieldValues((prevState) => ({ ...prevState, shopImage: file }));
		}
	};

	const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (fieldValues.password !== fieldValues.confirmPassword) {
			showSuccessToast("Passwords do not match");
			return;
		}

		const result = await handleApiMutation({
			// @ts-ignore
			mutation: postFormMutation,
			url: apiConfig.auth.vendorRegistrationUrl,
			body: fieldValues,
			invalidateQueryKey: [vendorRegistrationQueryKey],
			showSuccessMessage: true,
			showErrorMessage: true,
			requiredFields
		});

		if (result?.success) {
			navigate("/login");
		}
	};

	return (
		<div className="px-4 md:px-0 mt-18 mb-12 flex h-screen w-full items-center justify-center">
			<div className="max-w-2xl w-full mx-auto space-y-8">
				<div className="">
					<Link href={"/"}>
						<Image src={companyLogo} alt="company logo" className="mx-auto mb-4" />
					</Link>
					<h1 className="text-3xl text-center font-bold text-[var(--color-black-primary)] mb-2">Registration</h1>
					<p className="text-[15px] text-center text-[var(--color-black-primary)]">
						Create New Account
					</p>
				</div>
				<form className="space-y-5" onSubmit={handleRegister}>
					<div className="space-y-4">
						<div>
							<label className="block mb-1.5">
								<span className="text-[14px] font-bold text-[var(--color-green-primary)]">
									Name
								</span>
								<span className="text-red-500 ml-1">*</span>
							</label>
							<div className="relative group">
								<input
									type="text"
									name="name"
									value={fieldValues.name}
									onChange={handleChange}
									className="w-full bg-white text-[#212b36] px-4 py-2 border border-[#e6eaed] rounded-lg focus:outline-none focus:border-[var(--color-primary)] transition-all duration-200"
									required
								/>
								<div className="absolute inset-y-0 right-3 flex items-center pointer-events-none transition-colors duration-200">
									<FiUser className="h-5 w-5" />
								</div>
							</div>
						</div>
						<div>
							<label className="block mb-1.5">
								<span className="text-[14px] font-bold text-[var(--color-green-primary)]">
									Phone
								</span>
								<span className="text-red-500 ml-1">*</span>
							</label>
							<div className="relative group">
								<input
									type="text"
									name="phone"
									value={fieldValues.phone}
									onChange={handleChange}
									className="w-full bg-white text-[#212b36] px-4 py-2 border border-[#e6eaed] rounded-lg focus:outline-none focus:border-[var(--color-primary)] transition-all duration-200"
									required
								/>
								<div className="absolute inset-y-0 right-3 flex items-center pointer-events-none transition-colors duration-200">
									<FiPhone className="h-5 w-5" />
								</div>
							</div>
						</div>
						<div>
							<label className="block mb-1.5">
								<span className="text-[14px] font-bold text-[var(--color-green-primary)]">
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
									className="w-full bg-white text-[#212b36] px-4 py-2 border border-[#e6eaed] rounded-lg focus:outline-none focus:border-[var(--color-primary)] transition-all duration-200"
									required
								/>
								<div className="absolute inset-y-0 right-3 flex items-center pointer-events-none transition-colors duration-200">
									<LuMail className="h-5 w-5" />
								</div>
							</div>
						</div>
						<div>
							<label className="block mb-1.5">
								<span className="text-[14px] font-bold text-[var(--color-green-primary)]">
									Password
								</span>
								<span className="text-red-500 ml-1">*</span>
							</label>
							<div className="relative group">
								<input
									name="password"
									value={fieldValues.password}
									onChange={handleChange}
									type={showPassword ? "text" : "password"}
									className="w-full bg-white text-[#212b36] px-4 py-2 border border-[#e6eaed] rounded-lg focus:outline-none focus:border-[#064490] transition-all duration-200"
									required
								/>
								<div
									className="absolute inset-y-0 right-3 flex items-center cursor-pointer  transition-colors duration-200 border-l pl-2 border-gray-200"
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
						<div>
							<label className="block mb-1.5">
								<span className="text-[14px] font-bold text-[var(--color-green-primary)]">
									Confirm Password
								</span>
								<span className="text-red-500 ml-1">*</span>
							</label>
							<div className="relative group">
								<input
									name="confirmPassword"
									value={fieldValues.confirmPassword}
									onChange={handleChange}
									type={showConfirmPassword ? "text" : "password"}
									className="w-full bg-white text-[#212b36] px-4 py-2 border border-[#e6eaed] rounded-lg focus:outline-none focus:border-[#064490] transition-all duration-200"
									required
								/>
								<div
									className="absolute inset-y-0 right-3 flex items-center cursor-pointer  transition-colors duration-200 border-l pl-2 border-gray-200"
									onClick={() => setShowConfirmPassword(!showConfirmPassword)}
								>
									{showConfirmPassword ? (
										<BiSolidShow className="h-5 w-5  hover:text-gray-700" />
									) : (
										<BiSolidHide className="h-5 w-5  hover:text-gray-700" />
									)}
								</div>
							</div>
						</div>

						<div>
							<label className="block mb-1.5">
								<span className="text-[14px] font-bold text-[var(--color-green-primary)]">
									Shop Name
								</span>
								<span className="text-red-500 ml-1">*</span>
							</label>
							<div className="relative group">
								<input
									type="text"
									name="shopName"
									value={fieldValues.shopName}
									onChange={handleChange}
									className="w-full bg-white text-[#212b36] px-4 py-2 border border-[#e6eaed] rounded-lg focus:outline-none focus:border-[var(--color-primary)] transition-all duration-200"
									required
								/>
								<div className="absolute inset-y-0 right-3 flex items-center pointer-events-none transition-colors duration-200">
									<FiUser className="h-5 w-5" />
								</div>
							</div>
						</div>

						<div>
							<label className="block mb-1.5">
								<span className="text-[14px] font-bold text-[var(--color-green-primary)]">
									Shop Image
								</span>
								<span className="text-red-500 ml-1">*</span>
							</label>
							<ImageUpload
								value={fieldValues.shopImage ?
									(typeof fieldValues.shopImage === "string"
										? fieldValues.shopImage
										: URL.createObjectURL(fieldValues.shopImage))
									: ''
								}
								onChange={handleImageUpload}
							/>
						</div>
					</div>
					<button type="submit" className="w-full bg-[var(--color-green-secondary)] py-2 rounded-lg font-bold cursor-pointer">
						Sign Up
					</button>
					<p className="text-center text-[15px] text-[var(--color-green-primary)]">
						Already have an account?{" "}
						<Link href={"/login"} className="font-semibold hover:text-[var(--color-green-primary)] hover:border-b-2 border-[var(--color-green-primary)] transition-colors duration-200">
							Sign In
						</Link>
					</p>
				</form>
			</div>
		</div>
	);
};

export default VendorRegistration;
