import { ChangeEvent, useState, useEffect } from "react";
import { RiArrowDropDownLine } from "react-icons/ri";
import { useLocation, useNavigate } from "react-router-dom";
import { IoMdAddCircleOutline, IoMdRemoveCircleOutline } from "react-icons/io";
import { productQueryKey, productUniqueCodeQueryKey } from "../../../../config/query-key";
import apiConfig from "../../../../config/api.json";
import ProductImage from "./ProductImage";
import { useAPI } from "../../../../hooks/useApi";
import PageHeader from "../../../../component/card/PageHeader";
import Button from "../../../../component/buttons/ButtonStyleOne";
import InputField from "../../../../component/inputs/InputField";
import SelectInput from "../../../../component/inputs/SelectField";
import TextEditor from "../../../../component/editor/TextEditor";
import ImageUpload from "../../../../component/image/ImageUpload";
import FileUpload from "../../../../component/image/FileUpload";
import { DiscountTypeValue, validatePricing } from "../../../../utils/validateProduct";

type DiscountCode = "NONE" | "PERCENT" | "FLAT";

interface Option {
    label: string;
    value: DiscountCode;
}
// @ts-ignore
interface ProductCreationProps {
    editData?: any;
}

const initialFieldValues = {
    name: "",
    price: "",
    discountType: "" as string,
    discountAmount: "",
    sku: "",
    videoUrl: "",
    cost: "",
    summary: "",
    description: "",
    mainCategoryId: "",
    firstCategoryId: "",
    secondCategoryId: "",
    thirdCategoryId: "",
    mainCategoryName: "",
    firstCategoryName: "",
    secondCategoryName: "",
    thirdCategoryName: "",
    productImages: [],
    featuredImage: null as string | null,
    fileUrl: "",
}

const requiredFields = [
    { key: "name", value: "name", label: "name" },
    { key: "sku", value: "SKU", label: "text" },
    // { key: "videoUrl", value: "video url", label: "text" },
    { key: "price", value: "price", label: "number" },
    { key: "cost", value: "cost", label: "number" },
    { key: "mainCategoryId", value: "main category", label: "dropdown" },
    { key: "firstCategoryId", value: "first category", label: "dropdown" },
    { key: "summary", value: "summary", label: "text" },
    { key: "description", value: "description", label: "text" },
    { key: "featuredImage", value: "featured image", label: "image" },
    { key: "fileUrl", value: "pdf", label: "file" },
    { key: "productImages", value: "product images", label: "images" },
]

const discountTypeOptions: Option[] = [
    { label: "None", value: "NONE" },
    { label: "Percentage", value: "PERCENT" },
    { label: "Flat", value: "FLAT" },
];

const ProductCreation = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const editData = location.state?.editData;
    const [isLoading, setIsLoading] = useState(false);
    const [description, setDescription] = useState("");
    const [uniqueCode, setUniqueCode] = useState("");
    const [productImages, setProductImages] = useState<(File | string)[]>([]);
    const [selectedDiscountType, setSelectedDiscountType] = useState<Option | null>(discountTypeOptions[0]);
    const [selectedMainCategory, setSelectedMainCategory] = useState<Option | null>(null);
    const [selectedFirstCategory, setSelectedFirstCategory] = useState<Option | null>(null);
    const [selectedSecondCategory, setSelectedSecondCategory] = useState<Option | null>(null);
    const [selectedThirdCategory, setSelectedThirdCategory] = useState<Option | null>(null);

    const [isOpen, setIsOpen] = useState(true);

    const [fields, setFields] = useState<string[]>([""]);
    // @ts-ignore
    const [thirdCategoryList, setThirdCategoryList] = useState<Option[]>([]);
    const [isFirstCategoryDisabled, setIsFirstCategoryDisabled] = useState(true);
    const [isSecondCategoryDisabled, setIsSecondCategoryDisabled] = useState(true);
    const [isThirdCategoryDisabled, setIsThirdCategoryDisabled] = useState(true);

    const { postFormMutation, handleApiMutation, usePaginatedQuery, patchFormMutation, fetchData } = useAPI();
    const [fieldValues, setFieldValues] = useState(initialFieldValues);
    const mainCategoryUrl = apiConfig.vendor.mainCategoryUrl;
    const firstCategoryUrl = apiConfig.vendor.firstCategoryUrl;
    const secondCategoryUrl = apiConfig.vendor.secondCategoryUrl;
    const thirdCategoryUrl = apiConfig.vendor.thirdCategoryUrl;
    const productUniqueCodeUrl = apiConfig.vendor.productUniqueCodeUrl;
    const productUrl = apiConfig.vendor.productUrl;

    const [mainCategories, setMainCategories] = useState<any>([]);
    //@ts-ignore
    const [firstCategories, setFirstCategories] = useState<any[]>([]);
    const [secondCategories, setSecondCategories] = useState<any[]>([]);
    //@ts-ignore
    const [thirdCategories, setThirdCategories] = useState<any[]>([]);

    const getDiscountOption = (code?: string | null): Option => {
        // handle legacy numeric strings just in case
        const normalized: DiscountCode =
            code === "1" ? "PERCENT" :
                code === "2" ? "FLAT" :
                    code === "0" ? "NONE" :
                        (code as DiscountCode) ?? "NONE";

        return discountTypeOptions.find(o => o.value === normalized) ?? discountTypeOptions[0];
    };

    const fetchMainCategoryData = async () => {
        try {
            const mainCategories = await fetchData({ apiUrl: mainCategoryUrl });
            setMainCategories(mainCategories.mainCategory);
        } catch (err) {
            console.error("Fetch failed:", err);
        }
    };

    useEffect(() => {
        fetchMainCategoryData();
    }, []);

    // @ts-ignore
    const formattedMainCategories = (mainCategories || []).map((item: any) => ({
        label: item.name,
        value: item.id
    }));


    // const { data: firstCategories, refetch: fetchFirstCategories } = usePaginatedQuery({
    //     queryKey: [siteFirstCategoryQueryKey, selectedMainCategory?.value || ''],
    //     url: `${firstCategoryUrl}?mainCategoryId=${selectedMainCategory?.value || ''}`,
    //     enabled: false
    // });
    // // @ts-ignore
    // const formattedFirstCategories = (firstCategories || []).map((item: any) => ({
    //     label: item.name,
    //     value: item.id
    // }));

    // const { data: secondCategories, refetch: fetchSecondCategories } = usePaginatedQuery({
    //     queryKey: [siteSecondCategoryQueryKey, selectedFirstCategory?.value || ''],
    //     url: `${secondCategoryUrl}?firstCategoryId=${selectedFirstCategory?.value || ''}`,
    //     enabled: false
    // });
    // // @ts-ignore
    // const formattedSecondCategories = (secondCategories?.secondCategories || []).map((item: any) => ({
    //     label: item.name,
    //     value: item.id
    // }));

    // const { data: thirdCategories, refetch: fetchThirdCategories } = usePaginatedQuery({
    //     queryKey: [siteThirdCategoryQueryKey, selectedSecondCategory?.value || ''],
    //     url: `${thirdCategoryUrl}?secondCategoryId=${selectedSecondCategory?.value || ''}`,
    //     enabled: false
    // });
    // // @ts-ignore
    // const formattedThirdCategories = (thirdCategories?.thirdCategories || []).map((item: any) => ({
    //     label: item.name,
    //     value: item.id
    // }));

    const fetchFirstCategoryData = async (mainCategoryId: string) => {
        try {
            const response = await fetchData({
                apiUrl: `${firstCategoryUrl}?mainCategoryId=${mainCategoryId}`
            });
            setFirstCategories(response.firstCategories || []);
        } catch (err) {
            console.error("Failed to fetch first categories", err);
        }
    };

    const fetchSecondCategoryData = async (firstCategoryId: string) => {
        try {
            const response = await fetchData({
                apiUrl: `${secondCategoryUrl}?firstCategoryId=${firstCategoryId}`
            });
            setSecondCategories(response.secondCategories || []);
        } catch (err) {
            console.error("Failed to fetch second categories", err);
        }
    };

    const fetchThirdCategoryData = async (secondCategoryId: string) => {
        try {
            const response = await fetchData({
                apiUrl: `${thirdCategoryUrl}?secondCategoryId=${secondCategoryId}`
            });
            setThirdCategories(response.thirdCategories || []);
        } catch (err) {
            console.error("Failed to fetch third categories", err);
        }
    };

    useEffect(() => {
        if (editData) {
            setFieldValues({
                name: editData.name || "",
                price: editData.price || "",
                discountType: (editData.discountType as string) || "NONE",
                discountAmount: editData.discountAmount || "",
                sku: editData.sku || "",
                videoUrl: editData.videoUrl || "",
                cost: editData.cost || "",
                summary: editData.summary || "",
                description: editData.description || "",
                mainCategoryId: editData.mainCategoryId || "",
                firstCategoryId: editData.firstCategoryId || "",
                secondCategoryId: editData.secondCategoryId || "",
                thirdCategoryId: editData.thirdCategoryId || "",
                mainCategoryName: editData.mainCategoryName || "",
                firstCategoryName: editData.firstCategoryName || "",
                secondCategoryName: editData.secondCategoryName || "",
                thirdCategoryName: editData.thirdCategoryName || "",
                productImages: editData.productImages || [],
                featuredImage: editData.featuredImage || null,
                fileUrl: editData.fileUrl || null,
            });

            setDescription(editData.description || "");
            setUniqueCode(editData.sku || "");

            if (editData.productImages && editData.productImages.length > 0) {
                setProductImages(editData.productImages.map((img: any) => img.imageUrl));
            }

            const option = getDiscountOption(editData.discountType)
            setSelectedDiscountType(option)

            if (editData.mainCategoryName) {
                setSelectedMainCategory({
                    label: editData.mainCategoryName,
                    value: editData.mainCategoryId || editData.mainCategoryName
                });
                setIsFirstCategoryDisabled(false);

                setTimeout(() => {
                    //@ts-ignore
                    fetchFirstCategories();
                }, 0);
            }

            if (editData.firstCategoryName) {
                setSelectedFirstCategory({
                    label: editData.firstCategoryName,
                    value: editData.firstCategoryId || editData.firstCategoryName
                });
                setIsSecondCategoryDisabled(false);

                setTimeout(() => {
                    //@ts-ignore
                    fetchSecondCategories();
                }, 0);
            }

            if (editData.secondCategoryName) {
                setSelectedSecondCategory({
                    label: editData.secondCategoryName,
                    value: editData.secondCategoryId || editData.secondCategoryName
                });
                setIsThirdCategoryDisabled(false);

                setTimeout(() => {
                    //@ts-ignore
                    fetchThirdCategories();
                }, 0);
            }

            if (editData.thirdCategoryName) {
                setSelectedThirdCategory({
                    label: editData.thirdCategoryName,
                    value: editData.thirdCategoryId || editData.thirdCategoryName
                });
            }

            if (editData.summary) {
                if (Array.isArray(editData.summary)) {
                    setFields(editData.summary);
                } else if (typeof editData.summary === 'string') {
                    const summaryArray = editData.summary.split(/[\n~]/).map((item: string) => item.trim()).filter((item: string) => item);
                    setFields(summaryArray.length > 0 ? summaryArray : [""]);
                } else {
                    setFields([""]);
                }
            } else {
                setFields([""]);
            }

            if (editData.productImages?.length) {
                editData.productImages.map((img: any) => img.imageUrl);
            }

        }
    }, [editData]);

    // Discount helpers
    const isDiscountNone = !selectedDiscountType || selectedDiscountType.value === "NONE";
    const isDiscountPct = selectedDiscountType?.value === "PERCENT";
    const isDiscountFlat = selectedDiscountType?.value === "FLAT";

    // Clear amount when switching to "None"
    useEffect(() => {
        if (isDiscountNone && fieldValues.discountAmount) {
            setFieldValues((prev) => ({ ...prev, discountAmount: "" }));
        }
    }, [selectedDiscountType]);

    // const handleMainCategoryChange = (category: Option) => {
    //     setSelectedMainCategory(category);
    //     setIsFirstCategoryDisabled(false);
    //     setIsSecondCategoryDisabled(true);
    //     setIsThirdCategoryDisabled(true);
    //     setFieldValues((prevState) => ({
    //         ...prevState,
    //         mainCategoryId: category.label,
    //         mainCategoryName: category.value,
    //         firstCategoryId: "",
    //         firstCategoryName: "",
    //         secondCategoryId: "",
    //         secondCategoryName: "",
    //         thirdCategoryId: "",
    //         thirdCategoryName: ""
    //     }));

    //     setTimeout(() => {
    //         fetchFirstCategories();
    //     }, 0)
    // }
    const handleMainCategoryChange = (category: Option) => {
        setSelectedMainCategory(category);
        setIsFirstCategoryDisabled(false);
        setIsSecondCategoryDisabled(true);
        setIsThirdCategoryDisabled(true);
        setSelectedFirstCategory(null);
        setSelectedSecondCategory(null);
        setSelectedThirdCategory(null);
        setFirstCategories([]);
        setSecondCategories([]);
        setThirdCategories([]);

        setFieldValues((prevState) => ({
            ...prevState,
            mainCategoryId: category.value,
            mainCategoryName: category.label,
            firstCategoryId: "",
            firstCategoryName: "",
            secondCategoryId: "",
            secondCategoryName: "",
            thirdCategoryId: "",
            thirdCategoryName: ""
        }));

        fetchFirstCategoryData(category.value);
    };

    const handleFirstCategoryChange = (category: Option) => {
        setSelectedFirstCategory(category);
        setIsSecondCategoryDisabled(false);
        setIsThirdCategoryDisabled(true);
        setSelectedSecondCategory(null);
        setSelectedThirdCategory(null);
        setSecondCategories([]);
        setThirdCategories([]);

        setFieldValues((prevState) => ({
            ...prevState,
            firstCategoryId: category.value,
            firstCategoryName: category.label,
            secondCategoryId: "",
            secondCategoryName: "",
            thirdCategoryId: "",
            thirdCategoryName: ""
        }));

        fetchSecondCategoryData(category.value);
    };

    const handleSecondCategoryChange = (category: Option) => {
        setSelectedSecondCategory(category);
        setIsThirdCategoryDisabled(false);
        setSelectedThirdCategory(null);
        setThirdCategories([]);

        setFieldValues((prevState) => ({
            ...prevState,
            secondCategoryId: category.value,
            secondCategoryName: category.label,
            thirdCategoryId: "",
            thirdCategoryName: ""
        }));

        fetchThirdCategoryData(category.value);
    };

    const handleThirdCategoryChange = (category: Option) => {
        setSelectedThirdCategory(category);

        setFieldValues((prevState) => ({
            ...prevState,
            thirdCategoryId: category.value,
            thirdCategoryName: category.label
        }));
    };

    const formattedFirstCategories = firstCategories.map((item: any) => ({
        label: item.name,
        value: item.id
    }));

    const formattedSecondCategories = secondCategories.map((item: any) => ({
        label: item.name,
        value: item.id
    }));

    const formattedThirdCategories = thirdCategories.map((item: any) => ({
        label: item.name,
        value: item.id
    }));

    // const handleFirstCategoryChange = (category: Option) => {
    //     setSelectedFirstCategory(category);
    //     setIsSecondCategoryDisabled(false);
    //     setIsThirdCategoryDisabled(true);

    //     setFieldValues((prevState) => ({
    //         ...prevState,
    //         firstCategoryId: category.label,
    //         firstCategoryName: category.value,
    //         secondCategoryId: "",
    //         secondCategoryName: "",
    //         thirdCategoryId: "",
    //         thirdCategoryName: ""
    //     }));

    //     setTimeout(() => {
    //         fetchSecondCategories();
    //     }, 0);
    // }

    // const handleSecondCategoryChange = (category: Option) => {
    //     setSelectedSecondCategory(category);
    //     setIsThirdCategoryDisabled(false);

    //     setFieldValues((prevState) => ({
    //         ...prevState,
    //         secondCategoryId: category.label,
    //         secondCategoryName: category.value
    //     }));

    //     setTimeout(() => {
    //         fetchThirdCategories();
    //     }, 0);
    // }

    // const handleThirdCategoryChange = (category: Option) => {
    //     setSelectedThirdCategory(category);
    //     if (category) {
    //         setIsThirdCategoryDisabled(false);
    //         fetchThirdCategories();
    //     } else {
    //         setIsThirdCategoryDisabled(true);
    //         setThirdCategoryList([]);
    //     }
    // }

    const handleAdd = () => {
        setFields([...fields, ""]);
    };

    const handleRemove = (index: number) => {
        const updated = fields.filter((_, i) => i !== index);
        setFields(updated);
    };

    const handleDiscountTypeOptionChange = (option: Option | null) => {
        const chosen = option ?? discountTypeOptions[0]; // NONE
        setSelectedDiscountType(chosen);
        setFieldValues(prev => ({ ...prev, discountType: chosen.value }));
        if (chosen.value === "NONE") {
            setFieldValues(prev => ({ ...prev, discountAmount: "" }));
        }
    };

    const handleSummaryChange = (index: number, value: string) => {
        const updated = [...fields];
        updated[index] = value;
        setFields(updated);
    };

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFieldValues((prevState) => ({
            ...prevState,
            [name]: value
        }));
    };

    const resetForm = () => {
        setFieldValues(initialFieldValues);
        setFields([""]);
        setSelectedDiscountType(discountTypeOptions[0]);
        setSelectedMainCategory(null);
        setSelectedFirstCategory(null);
        setSelectedSecondCategory(null);
    };

    const handleFeaturedImageUpload = (file: File | null) => {
        // @ts-ignore
        setFieldValues((prevState) => ({ ...prevState, featuredImage: file }));
    };

    const handleProductImagesUpload = (files: (File | string)[]) => {
        setProductImages(files);
    };

    const handleSubmitForm = async () => {
        setIsLoading(true);

        // Parse numbers once
        const priceNum = Number(fieldValues.price);
        const discountNum = Number(fieldValues.discountAmount || 0);
        const discountTypeValue: DiscountTypeValue =
            (selectedDiscountType?.value as DiscountTypeValue) ?? "NONE";

        const pricingErrors = validatePricing({
            price: priceNum,
            discountType: discountTypeValue === "NONE" ? "NONE" : discountTypeValue,
            discountAmount: discountNum,
        });

        if (pricingErrors.length) {
            setIsLoading(false);
            alert(pricingErrors.join("\n"));
            return;
        }
        const mutation = editData ? patchFormMutation : postFormMutation;
        const url = editData ? `${productUrl}/${editData.id}` : productUrl;

        const filteredFields = fields.filter(f => f.trim() !== "");
        const summaryString = filteredFields.join('~ ');

        const existingProductImages = productImages.filter((item) => typeof item === "string" && item.startsWith("http"));

        const payload = {
            ...fieldValues,
            price: priceNum,
            discountAmount: discountTypeValue === "NONE" ? 0 : discountNum,
            discountType: discountTypeValue,
            sku: uniqueCode,
            productImages: productImages,
            summary: summaryString,
            description: description.trim(),
            mainCategoryId: selectedMainCategory?.value || "",
            mainCategoryName: selectedMainCategory?.label || "",
            firstCategoryId: selectedFirstCategory?.value || "",
            firstCategoryName: selectedFirstCategory?.label || "",
            secondCategoryId: selectedSecondCategory?.value || "",
            secondCategoryName: selectedSecondCategory?.label || "",
            thirdCategoryId: selectedThirdCategory?.value || "",
            thirdCategoryName: selectedThirdCategory?.label || "",
            existingProductImages: existingProductImages || []
        };

        const result = await handleApiMutation({
            // @ts-ignore
            mutation,
            url,
            body: payload,
            invalidateQueryKey: [productQueryKey],
            showSuccessMessage: true,
            showErrorMessage: true,
            requiredFields
        });

        if (result?.success) {
            resetForm();
            navigate('/products');
        }
        setIsLoading(false);
    };

    const {
        // @ts-ignore
        data: productUniqueCode,
        refetch: fetchSku
    } = usePaginatedQuery({
        queryKey: [productUniqueCodeQueryKey],
        url: productUniqueCodeUrl,
        enabled: false
    });

    const handleGenerateSku = async () => {
        const result = await fetchSku();
        if (result.data) {
            setUniqueCode(result.data.toString());
        }
    };

    const handleFileUpload = (file: File | null) => {
        // @ts-ignore
        setFieldValues((prevState) => ({ ...prevState, fileUrl: file }));
    };

    return (
        <div>
            <div className="flex items-center justify-between flex-wrap mb-6">
                <PageHeader
                    headerTitle={editData ? "Edit Product" : "Create Product"}
                    headerDescription={editData ? "Edit an existing product" : "Create a new product"}
                />
                <Button label="Back to Product" onClick={() => navigate("/products")} color="var(--color-primary)" hoverColor="var(--color-primary-hover)" />
            </div>

            <div className="mx-auto bg-white shadow rounded-lg">
                <div className="flex justify-between items-center px-4 sm:px-6 py-2 md:py-3">
                    <div className="text-base font-bold text-[#212b36]">Product Information</div>
                    <RiArrowDropDownLine
                        className={`text-2xl sm:text-3xl cursor-pointer transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                        onClick={() => setIsOpen(!isOpen)}
                    />
                </div>
                <hr className="border-gray-200 mb-4" />

                {isOpen && (
                    <>
                        <div className="px-6 pb-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <InputField label="Product Name" type="text" name="name" required value={fieldValues.name} onChange={handleChange} />
                                </div>

                                <div className="relative">
                                    <InputField label="SKU" type="text" name="sku" required value={uniqueCode} readOnly={true} onChange={handleChange} />
                                    <button
                                        onClick={handleGenerateSku}
                                        className="absolute right-2 top-7 bg-[var(--color-primary)] text-white py-1 px-2 rounded-md text-[12px] cursor-pointer hover:bg-[var(--color-primary-hover)]"
                                    >
                                        Generate
                                    </button>
                                </div>

                                <div>
                                    <InputField label="Video URL" type="text" name="videoUrl" value={fieldValues.videoUrl} onChange={handleChange} />
                                </div>

                                <div>
                                    <InputField label="Price" type="number" name="price" required value={fieldValues.price} onChange={handleChange} />
                                </div>

                                <div>
                                    <InputField label="Cost" type="number" name="cost" required value={fieldValues.cost} onChange={handleChange} />
                                </div>

                                <SelectInput
                                    label="Discount Type"
                                    value={selectedDiscountType}
                                    options={discountTypeOptions}
                                    // @ts-ignore
                                    onChange={handleDiscountTypeOptionChange}
                                    placeholder="Select Discount Type"
                                />

                                <div>
                                    <InputField
                                        label={`Discount Amount${isDiscountPct ? " (%)" : isDiscountFlat ? " (amount)" : ""}`}
                                        type="number"
                                        name="discountAmount"
                                        value={fieldValues.discountAmount}
                                        onChange={handleChange}
                                        disabled={isDiscountNone}
                                        // @ts-ignore
                                        min={isDiscountPct ? 1 : 0}
                                        max={isDiscountPct ? 99 : undefined}
                                        placeholder={
                                            isDiscountNone
                                                ? "Select a discount type first"
                                                : isDiscountPct
                                                    ? "e.g., 10 for 10%"
                                                    : "e.g., 100 for flat"
                                        }
                                    />
                                    {isDiscountNone && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            Choose “Percentage” or “Flat” to enter an amount.
                                        </p>
                                    )}
                                </div>

                                <SelectInput
                                    label="Main Category"
                                    value={selectedMainCategory}
                                    options={formattedMainCategories}
                                    // @ts-ignore
                                    onChange={handleMainCategoryChange}
                                    placeholder="Select Main Category"
                                    required
                                />

                                <SelectInput
                                    label="First Category"
                                    value={selectedFirstCategory}
                                    options={formattedFirstCategories}
                                    // @ts-ignore
                                    onChange={handleFirstCategoryChange}
                                    placeholder="Select First Category"
                                    // @ts-ignore
                                    disabled={isFirstCategoryDisabled || !firstCategories.length}
                                    required
                                />

                                <SelectInput
                                    label="Second Category"
                                    value={selectedSecondCategory}
                                    options={formattedSecondCategories}
                                    // @ts-ignore
                                    onChange={handleSecondCategoryChange}
                                    placeholder="Select Second Category"
                                    // @ts-ignore
                                    disabled={isSecondCategoryDisabled || !secondCategories.length}
                                />

                                <SelectInput
                                    label="Third Category"
                                    value={selectedThirdCategory}
                                    options={formattedThirdCategories}
                                    // @ts-ignore
                                    onChange={handleThirdCategoryChange}
                                    placeholder="Select Third Category"
                                    // @ts-ignore
                                    disabled={isThirdCategoryDisabled || !thirdCategories.length}
                                />

                                <div>
                                    <p className="text-sm font-medium text-gray-700 w-full mb-1">Product Summary</p>
                                    <div className="space-y-2">
                                        {fields.map((field, index) => (
                                            <div key={index} className="flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    value={field}
                                                    onChange={(e) => handleSummaryChange(index, e.target.value)}
                                                    className="w-full h-10 focus:outline-none px-3 text-base border border-gray-200 rounded-lg focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
                                                    required
                                                />
                                                {index !== 0 && (
                                                    <button
                                                        onClick={() => handleRemove(index)}
                                                        className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-red-500 text-white rounded-lg hover:bg-red-600 cursor-pointer"
                                                    >
                                                        <IoMdRemoveCircleOutline className="text-xl" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}

                                        <div className="flex justify-start mt-2">
                                            <Button
                                                label="Add More"
                                                onClick={handleAdd}
                                                color="var(--color-primary)"
                                                hoverColor="var(--color-primary-hover)"
                                                icon={<IoMdAddCircleOutline size={18} />}
                                                disabled={fields.length >= 6}
                                            />
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>

                        <div className="px-6 pb-6">
                            <TextEditor value={description} onChange={setDescription} />
                        </div>
                    </>
                )}
            </div>

            <div className="mt-6 rounded-lg grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="col-span-1 lg:col-span-3 bg-white pb-4">
                    <div className="px-4 sm:px-4 py-3 border-b border-gray-200">
                        <p className="text-base font-bold text-[#212b36]">
                            Featured Image <span className="text-sm text-gray-600">(Recommended Size: 626*621 PX)</span>
                        </p>
                        <p className="">Add one featured image to show as the main thumbnail.</p>
                    </div>
                    <div className="px-8 py-2">
                        <ImageUpload value={fieldValues.featuredImage} onChange={handleFeaturedImageUpload} />
                    </div>
                </div>
                <div className="col-span-1 lg:col-span-3 bg-white pb-4">
                    <div className="px-4 sm:px-4 py-3 border-b border-gray-200">
                        <h3 className="text-base font-bold text-[#212b36]">
                            Product File
                        </h3>
                        <p className="">Upload a single PDF file that contains product details or specifications.</p>
                    </div>
                    <div className="px-8 py-2">
                        <FileUpload value={fieldValues.fileUrl} onChange={handleFileUpload} />
                    </div>
                </div>

                <div className="col-span-1 lg:col-span-6 bg-white">
                    <ProductImage value={productImages} onChange={handleProductImagesUpload} />
                </div>
            </div>

            <div className="flex items-center justify-end gap-4 pt-4">
                <Button label="Cancel" onClick={() => navigate("/products")} color="var(--color-black)" hoverColor="var(--color-black)" />
                <Button label="Save" onClick={handleSubmitForm} color="var(--color-primary)" hoverColor="var(--color-primary-hover)" isLoading={isLoading} disabled={isLoading} />
            </div>
        </div>
    );
};

export default ProductCreation;