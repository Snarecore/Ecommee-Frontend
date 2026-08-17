import Image from "next/image";
import { ChangeEvent, useEffect, useState } from "react";
import PageHeader from "../../../component/card/PageHeader";
import { Role } from "../../../enum/role.enum";
import { useAPI } from "../../../hooks/useApi";
import apiConfig from "../../../config/api.json";
import { vendorProfileQueryKey } from "../../../config/query-key";
import { MdClose } from "react-icons/md";
import { IoCloseSharp, IoCloudUploadOutline } from "react-icons/io5";
import { FiEdit2, FiUser, FiPhone, FiMail, FiHome } from "react-icons/fi";

interface VendorData {
    name: string;
    email: string;
    phone: string;
    profile?: {
        profileImage?: string;
        shopImage?: string;
        shopName?: string;
    };
}

const initialFieldValues = {
    name: "",
    phone: "",
    profileImage: "" as string | File,
    shopImage: "" as string | File,
    shopName: "",
    role: Role.VENDOR
};

const requiredFields = [
    { key: "name", value: "name", label: "text" },
    { key: "phone", value: "phone", label: "text" },
    // { key: "profileImage", value: "profile image", label: "image" },
    { key: "shopImage", value: "shop image", label: "image" },
];

const VendorProfile = () => {
    const [fieldValues, setFieldValues] = useState(initialFieldValues);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [preview, setPreview] = useState<string | undefined>();
    const [shopPreview, setShopPreview] = useState<string | undefined>();
    const { patchFormMutation, handleApiMutation, fetchData } = useAPI();
    const apiUrl = apiConfig.people.vendorProfile;
    const vendorApiUrl = apiConfig.people.vendor;
    const [vendorData, setVendorData] = useState<VendorData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const fetchVendorData = async () => {
        setIsLoading(true);
        try {
            const result = await fetchData({ apiUrl: vendorApiUrl });
            setVendorData(result);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchVendorData();
    }, []);

    const onSelectProfileFile = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFieldValues(prev => ({ ...prev, profileImage: file }));
            setPreview(URL.createObjectURL(file));
        }
    };

    const onSelectShopFile = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFieldValues(prev => ({ ...prev, shopImage: file }));
            setShopPreview(URL.createObjectURL(file));
        }
    };

    const removeProfileImage = () => {
        setPreview(undefined);
        setFieldValues(prev => ({ ...prev, profileImage: "" }));
    };

    const removeShopImage = () => {
        setShopPreview(undefined);
        setFieldValues(prev => ({ ...prev, shopImage: "" }));
    };

    const handleOpenModal = () => {
        setFieldValues({
            name: vendorData?.name || "",
            phone: vendorData?.phone || "",
            profileImage: vendorData?.profile?.profileImage || "",
            shopImage: vendorData?.profile?.shopImage || "",
            shopName: vendorData?.profile?.shopName || "",
            role: Role.VENDOR
        });
        setPreview(vendorData?.profile?.profileImage);
        setShopPreview(vendorData?.profile?.shopImage);
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        const result = await handleApiMutation({
            //@ts-ignore
            mutation: patchFormMutation,
            url: apiUrl,
            body: fieldValues,
            invalidateQueryKey: [vendorProfileQueryKey],
            showSuccessMessage: true,
            showErrorMessage: true,
            requiredFields,
        });

        if (result?.success) {
            setIsModalOpen(false);
            fetchVendorData();
        }
    };

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-green-primary)]"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="flex items-center justify-between flex-wrap mb-8">
                    <PageHeader
                        headerTitle="Your Profile"
                        headerDescription="Manage your profile information and shop details"
                    />
                </div>

                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="bg-[var(--color-green-primary)] px-8 py-6">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                            <div className="flex-shrink-0">
                                {vendorData?.profile?.profileImage ? (
                                    <Image src={vendorData.profile.profileImage} alt={vendorData.name} className="rounded-full w-24 h-24 sm:w-32 sm:h-32 object-cover border-4 border-[var(--color-green-secondary)] shadow-lg" width={96} height={96} />
                                ) : (
                                    <div className="rounded-full w-24 h-24 sm:w-32 sm:h-32 bg-white/20 flex items-center justify-center border-4 border-white shadow-lg">
                                        <FiUser className="w-12 h-12 text-white" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-grow text-white">
                                <h1 className="text-2xl sm:text-3xl font-bold mb-2">{vendorData?.name}</h1>
                                <p className="text-white/90 flex items-center gap-2">
                                    <FiMail className="w-4 h-4" />
                                    {vendorData?.email}
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
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Contact Information */}
                            <div className="space-y-6">
                                <p className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <FiUser className="w-5 h-5 text-[var(--color-green-primary)]" />
                                    Contact Information
                                </p>
                                
                                <div className="space-y-4">
                                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-3 mb-2">
                                            <FiPhone className="w-5 h-5 text-[var(--color-green-primary)]" />
                                            <p className="text-sm font-medium text-gray-600">Phone Number</p>
                                        </div>
                                        <p className="font-semibold text-lg text-gray-800">{vendorData?.phone || "Not provided"}</p>
                                    </div>

                                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-3 mb-2">
                                            <FiMail className="w-5 h-5 text-[var(--color-green-primary)]" />
                                            <p className="text-sm font-medium text-gray-600">Email Address</p>
                                        </div>
                                        <p className="font-semibold text-lg text-gray-800">{vendorData?.email}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Shop Information */}
                            <div className="space-y-6">
                                <p className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <FiHome className="w-5 h-5 text-[var(--color-green-primary)]" />
                                    Shop Information
                                </p>
                                
                                <div className="space-y-4">
                                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-3 mb-2">
                                            <FiHome className="w-5 h-5 text-[var(--color-green-primary)]" />
                                            <p className="text-sm font-medium text-gray-600">Shop Name</p>
                                        </div>
                                        <p className="font-semibold text-lg text-gray-800">{vendorData?.profile?.shopName || "Not provided"}</p>
                                    </div>

                                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
                                        <p className="text-sm font-medium text-gray-600 mb-3">Shop Image</p>
                                        {vendorData?.profile?.shopImage ? (
                                            <Image src={vendorData.profile.shopImage} alt={vendorData.profile.shopName} className="w-32 h-32 object-cover rounded-xl border-2 border-[var(--color-green-primary)] shadow-md" width={128} height={128} />
                                        ) : (
                                            <div className="w-32 h-32 bg-gray-200 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
                                                <FiHome className="w-8 h-8 text-gray-400" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Edit Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 bg-[#000000b6] z-50 p-2">
                        <div className="bg-white p-8 rounded-md shadow-md w-full max-w-lg relative">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="absolute top-3 right-3 text-gray-500 hover:text-red-500 cursor-pointer"
                            >
                                <MdClose size={20} />
                            </button>

                            <h2 className="text-lg font-bold mb-6">Edit Profile Info</h2>

                            <div className="space-y-6">
                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-700">Profile Image</label>
                                    <div className="flex items-start space-x-4">
                                        <label
                                            htmlFor="profile-file-upload"
                                            className="w-[120px] h-[120px] flex items-center justify-center flex-col gap-2 border border-dashed border-[#e6eaed] text-sm rounded-md cursor-pointer hover:border-blue-500 transition-all ease-in-out duration-300 mt-2"
                                        >
                                            <IoCloudUploadOutline size={20} />
                                            <p className="font-semibold">Upload</p>
                                        </label>
                                        <input
                                            id="profile-file-upload"
                                            type="file"
                                            className="hidden"
                                            onChange={onSelectProfileFile}
                                            accept="image/png, image/jpeg, image/jpg"
                                        />
                                        {preview && (
                                            <div className="relative w-[120px] h-[120px] mt-2">
                                                <Image src={preview} alt="Profile Preview" className="w-full h-full object-cover rounded-md border border-gray-300" width={500} height={500} />
                                                <button
                                                    onClick={removeProfileImage}
                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-all duration-300"
                                                >
                                                    <IoCloseSharp size={14} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-700">Shop Image</label>
                                    <div className="flex items-start space-x-4">
                                        <label
                                            htmlFor="shop-file-upload"
                                            className="w-[120px] h-[120px] flex items-center justify-center flex-col gap-2 border border-dashed border-[#e6eaed] text-sm rounded-md cursor-pointer hover:border-blue-500 transition-all ease-in-out duration-300 mt-2"
                                        >
                                            <IoCloudUploadOutline size={20} />
                                            <p className="font-semibold">Upload</p>
                                        </label>
                                        <input
                                            id="shop-file-upload"
                                            type="file"
                                            className="hidden"
                                            onChange={onSelectShopFile}
                                            accept="image/png, image/jpeg, image/jpg"
                                        />
                                        {shopPreview && (
                                            <div className="relative w-[120px] h-[120px] mt-2">
                                                <Image src={shopPreview} alt="Shop Preview" className="w-full h-full object-cover rounded-md border border-gray-300" width={500} height={500} />
                                                <button
                                                    onClick={removeShopImage}
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
                                        value={vendorData?.email}
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

                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-700">Shop Name</label>
                                    <input
                                        type="text"
                                        name="shopName"
                                        className="w-full border border-gray-300 p-2 rounded"
                                        value={fieldValues.shopName}
                                        onChange={(e) => setFieldValues({ ...fieldValues, shopName: e.target.value })}
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
                                <button
                                    onClick={handleSave}
                                    type="submit"
                                    className="bg-[var(--color-green-primary)] text-white px-4 py-2 rounded-md cursor-pointer"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VendorProfile;
