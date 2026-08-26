'use client';
import Image, { StaticImageData } from "next/image";
import { useState, ChangeEvent } from "react";
import { IoCloseSharp, IoCloudUploadOutline } from "react-icons/io5";
import { MdClose } from "react-icons/md";
import defaultImage from "../../../../assets/profile.png"
import { useAPI } from "../../../../hooks/useApi";
import { Role } from "../../../../enum/role.enum";
import { customerProfileQueryKey } from "../../../../config/query-key";
import apiConfig from "../../../../config/api.json";
import { FiEdit2, FiMail, FiPhone, FiUser } from "react-icons/fi";

interface UserData {
	name: string;
	email: string;
	phone: string;
	profile?: {
		profileImage?: string;
	};
}

interface ProfileDataProps {
	userData: UserData;
	fetchUserData: ()=> void;
}

const initialFieldValues = {
	name: "",
	phone: "",
	profileImage: "" as string | File,
	role: Role.CUSTOMER
};

const requiredFields = [
	{ key: "name", value: "name", label: "text" },
	{ key: "phone", value: "phone", label: "text" },
	// { key: "profileImage", value: "profile image", label: "image" },
];

const Profile = ({ userData, fetchUserData }: ProfileDataProps) => {
	const [fieldValues, setFieldValues] = useState(initialFieldValues);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [preview, setPreview] = useState<string | StaticImageData | null>(defaultImage || null);
	const { patchFormMutation, handleApiMutation } = useAPI();

	const onSelectFile = (e: ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setFieldValues({ ...fieldValues, profileImage: file });
			setPreview(URL.createObjectURL(file));
		}
	};

	const removeImage = () => {
		setPreview(null);
	};

	const handleOpenModal = () => {
		setFieldValues({
			name: userData.name,
			phone: userData.phone,
			profileImage: userData.profile?.profileImage || "",
			role: Role.CUSTOMER
		});
		setPreview(userData.profile?.profileImage || defaultImage);
		setIsModalOpen(true);
	};

	const handleSave = async () => {
		const result = await handleApiMutation({
			//@ts-ignore
			mutation: patchFormMutation,
			url: apiConfig.people.customerProfile,
			body: fieldValues,
			invalidateQueryKey: [customerProfileQueryKey],
			showSuccessMessage: true,
			showErrorMessage: true,
			requiredFields,
		});

		if (result?.success) {
			setIsModalOpen(false);
			fetchUserData();
		}
	};

	return (
		<div className="max-w-7xl">
			<div className="flex items-center justify-between mb-6">
				<div>
					<p className="font-bold text-xl text-[var(--color-green-primary)]">Profile Information</p>
					<p className="text-[var(--color-green-primary)] text-sm mt-1">
						Manage your personal information and password
					</p>
				</div>
			</div>

			<div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="bg-[var(--color-green-primary)] px-8 py-6">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                            <div className="flex-shrink-0">
                                {userData.profile?.profileImage ? (
                                    <Image src={userData.profile.profileImage || "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"} alt={userData?.name || "Profile Image"} className="rounded-full w-24 h-24 sm:w-32 sm:h-32 object-cover border-4 border-[var(--color-green-secondary)] shadow-lg" width={96} height={96} />
                                ) : (
                                    <div className="rounded-full w-24 h-24 sm:w-32 sm:h-32 bg-white/20 flex items-center justify-center border-4 border-white shadow-lg">
                                        <FiUser className="w-12 h-12 text-white" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-grow text-white">
                                <h1 className="text-2xl sm:text-3xl font-bold mb-2">{userData?.name}</h1>
                                <p className="text-white/90 flex items-center gap-2">
                                    <FiMail className="w-4 h-4" />
                                    {userData?.email}
                                </p>
                            </div>
                            <button
                                onClick={handleOpenModal}
                                className="bg-[var(--color-green-secondary)] backdrop-blur-sm text-black font-semibold px-6 py-3 rounded-xl text-sm cursor-pointer transition-all duration-300 flex items-center gap-2 hover:bg-white/30 border border-white/30"
                            >
                                <FiEdit2 />
                                <span>Edit Profile</span>
                            </button>
                        </div>
                    </div>

                    <div className="p-8">
                        <div className="grid gap-8">
                            <div className="space-y-6">
                                <p className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <FiUser className="w-5 h-5 text-[var(--color-green-primary)]" />
                                    Contact Information
                                </p>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-3 mb-2">
                                            <FiPhone className="w-5 h-5 text-[var(--color-green-primary)]" />
                                            <p className="text-sm font-medium text-gray-600">Phone Number</p>
                                        </div>
                                        <p className="font-semibold text-lg text-gray-800">{userData?.phone || "Not provided"}</p>
                                    </div>

                                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-3 mb-2">
                                            <FiMail className="w-5 h-5 text-[var(--color-green-primary)]" />
                                            <p className="text-sm font-medium text-gray-600">Email Address</p>
                                        </div>
                                        <p className="font-semibold text-lg text-gray-800">{userData?.email}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

			{isModalOpen && (
				<div className="fixed inset-0 flex items-center justify-center bg-opacity-50 bg-[#000000b6] z-50 p-2">
					<div className="bg-white p-8 rounded-md shadow-md w-full max-w-lg relative">
						<button
							onClick={() => setIsModalOpen(false)}
							className="absolute top-3 right-3 text-gray-500 hover:text-red-500 cursor-pointer"
						>
							<MdClose size={20} />
						</button>

						<h2 className="text-lg font-bold mb-4">Edit Profile Info</h2>

						<div className="space-y-4">
							<div>
								<label className="block mb-1 text-sm font-medium text-gray-700">Profile Image</label>
								<div className="flex items-start space-x-4">
									<label
										htmlFor="profile-file-upload"
										className="w-[120px] h-[120px] flex items-center justify-center flex-col gap-2 border border-dashed border-[#e6eaed] text-sm rounded-md cursor-pointer hover:border-blue-500 transition-all ease-in-out duration-300 mt-2"
									>
										<IoCloudUploadOutline size={20} />
										<p className="font-semibold">Upload Image</p>
									</label>

									<input
										id="profile-file-upload"
										type="file"
										className="hidden"
										onChange={onSelectFile}
										accept="image/png, image/jpeg, image/jpg"
									/>

									{preview && (
										<div className="relative w-[120px] h-[120px] mt-2">
											<Image src={typeof preview === "string" ? preview : defaultImage} alt="Uploaded File" className="w-full h-full object-cover rounded-md border border-gray-300" width={500} height={500} onError={() => setPreview(defaultImage)} />
											<button
												onClick={removeImage}
												className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-all duration-300"
											>
												<IoCloseSharp size={14} />
											</button>
										</div>
									)}
								</div>
							</div>

							<div>
								<label className="block mb-1 text-sm font-medium text-gray-700">Name</label>
								<input
									type="text"
									name="name"
									className="w-full border border-gray-300 p-2 rounded"
									value={fieldValues.name}
									onChange={(e) => setFieldValues({ ...fieldValues, name: e.target.value })}
									required
								/>
							</div>

							<div>
								<label className="block mb-1 text-sm font-medium text-gray-700">Email</label>
								<input
									type="text"
									name="email"
									className="w-full border border-gray-300 p-2 rounded"
									value={userData.email}
									disabled
								/>
							</div>

							<div>
								<label className="block mb-1 text-sm font-medium text-gray-700">Phone</label>
								<input
									type="text"
									name="phone"
									className="w-full border border-gray-300 p-2 rounded"
									value={fieldValues.phone}
									onChange={(e) => setFieldValues({ ...fieldValues, phone: e.target.value })}
									required
								/>
							</div>
						</div>

						<div className="flex justify-end gap-4 mt-6">
							<button
								onClick={() => setIsModalOpen(false)}
								className="border border-[var(--color-green-primary)] text-[var(--color-green-primary)] px-4 py-2 rounded-md cursor-pointer"
							>
								Cancel
							</button>
							<button onClick={handleSave} type="submit" className="bg-[var(--color-green-primary)] text-white px-4 py-2 rounded-md cursor-pointer">
								Save Changes
							</button>
						</div>
					</div>
				</div>
			)}

		</div>
	);
};

export default Profile;
