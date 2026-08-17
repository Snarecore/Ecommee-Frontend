import { IoLocationSharp } from "react-icons/io5";
import { MdLocalPhone } from "react-icons/md";
import { SiGmail } from "react-icons/si";
import { useAPI } from "../../hooks/useApi";
import apiConfig from "../../config/api.json";
import { ChangeEvent, useEffect, useState } from "react";
import { contactMessageQueryKey } from "../../config/query-key";
import { metaDataAtom } from "../../store/global-store";
import { useAtomValue } from "jotai";
import { Helmet } from "react-helmet-async";

const initialFieldValues = {
    name: "",
    email: "",
    phone: "",
    message: ""
};

const requiredFields: any = [
    { key: "name", value: "name", label: "name" },
    { key: "email", value: "email", label: "email" },
    { key: "phone", value: "phone", label: "phone" },
    { key: "message", value: "message", label: "message" }
];

export interface ContactPageCmsData {
    id: string;
    pageTitle: string;
    pageSubTitle: string;
    phone: string;
    email: string;
    address: string;
    formSectionTitleOne: string;
    formSectionTitleTwo: string;
    formSectionTitleThree: string;
    buttonText: string;
    createdAt: string;
    updatedAt: string;
    isDeleted: boolean;
}

const ContactUs = () => {
    const [fieldValues, setFieldValues] = useState(initialFieldValues);
    const { fetchData, postMutation, handleApiMutation } = useAPI();
    const apiUrl = apiConfig.site.contactMessageUrl;
    const metaData = useAtomValue(metaDataAtom);

    const contactMeta = metaData?.find(item => item.page?.toLowerCase().includes("contact"));

    const resetForm = () => {
        setFieldValues(initialFieldValues);
    };

    const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        setFieldValues((prevState) => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmitForm = async () => {
        const mutation = postMutation;
        const url = apiUrl;

        const result = await handleApiMutation({
            mutation,
            url,
            body: fieldValues,
            invalidateQueryKey: [contactMessageQueryKey],
            showSuccessMessage: true,
            showErrorMessage: true,
            requiredFields
        });

        if (result?.success) {
            resetForm();
        }
    };

    const [response, setResponse] = useState<ContactPageCmsData>();
    useEffect(() => {
        const fetchContactPageData = async () => {
            const result = await fetchData({ apiUrl: `${apiConfig.site.contactPageCmsUrl}` });
            setResponse(result);
        };
        fetchContactPageData();
    }, []);

    return (
        <>
            <Helmet>
                <title>
                    {contactMeta?.metaTitle
                        ?.split(" ")
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(" ")}
                </title>
                <meta name="description" content={contactMeta?.metaDescription} />
                <meta name="keywords" content={contactMeta?.metaKeywords} />
            </Helmet>
            <div className="max-w-screen-2xl mx-auto py-4 px-4">
                <div className="text-center mt-4">
                    <p className="text-center text-5xl font-bold mb-3 text-[var(--color-black-primary)]">{response?.pageTitle}</p>
                    <p className="text-[var(--color-black-primary)] text-[18px]">{response?.pageSubTitle}</p>
                    <div className="flex flex-col md:flex-row items-start flex-wrap justify-center gap-6 md:gap-20 py-8 mt-5">
                        <div className="flex items-center gap-3">
                            <SiGmail className="w-8 h-8 bg-[var(--color-black-primary)] text-white p-1 rounded-full" />
                            <p className="text-lg md:text-2xl font-medium">{response?.email}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <MdLocalPhone className="w-8 h-8 bg-[var(--color-black-primary)] text-white p-1 rounded-full" />
                            <p className="text-lg md:text-2xl font-medium">{response?.phone}</p>
                        </div>
                        <div className="flex items-center gap-3 text-center md:text-left">
                            <IoLocationSharp className="w-8 h-8 bg-[var(--color-black-primary)] text-white p-1 rounded-full" />
                            <p className="text-lg md:text-2xl font-medium">{response?.address}</p>
                        </div>
                    </div>
                    <div className="flex md:flex-row flex-col-reverse mt-8 md:space-x-15 items-center">
                        <form
                            className="p-8 space-y-6 w-full shadow-xl"
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSubmitForm();
                            }}
                        >
                            <div>
                                <label className="block text-sm font-semibold text-start mb-1 text-[var(--color-black-primary)]">Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={fieldValues.name}
                                    onChange={handleChange}
                                    className="w-full border border-gray-400 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-[var(--color-green-primary)]"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-start mb-1 text-[var(--color-black-primary)]">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={fieldValues.email}
                                        onChange={handleChange}
                                        className="w-full border lowercase border-gray-400 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-[var(--color-green-primary)]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-start mb-1 text-[var(--color-black-primary)]">Phone</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={fieldValues.phone}
                                        onChange={handleChange}
                                        className="w-full border border-gray-400 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-[var(--color-green-primary)]"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-start mb-1 text-[var(--color-black-primary)]">Message</label>
                                <textarea
                                    rows={4}
                                    name="message"
                                    value={fieldValues.message}
                                    onChange={handleChange}
                                    placeholder="Write your message here..."
                                    className="w-full border border-gray-400 rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-[var(--color-green-primary)]"
                                ></textarea>
                            </div>
                            <button type="submit" className="w-full bg-[var(--color-green-primary)] font-bold cursor-pointer text-white py-3 rounded-lg hover:shadow-xl">
                                {response?.buttonText}
                            </button>
                        </form>
                        <div className="p-4 w-full">
                            <p className="text-2xl md:text-3xl text-[var(--color-black-primary)] font-bold md:text-start mb-2">{response?.formSectionTitleOne}</p>
                            <p className="text-2xl md:text-3xl text-[var(--color-black-primary)] font-bold md:text-start mb-2">{response?.formSectionTitleTwo}</p>
                            <p className="text-2xl md:text-3xl text-[var(--color-black-primary)] font-bold md:text-start">{response?.formSectionTitleThree}</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ContactUs;