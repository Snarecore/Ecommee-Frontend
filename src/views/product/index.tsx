"use client";
import Image from "next/image";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Link from "next/link";;
import { useAPI } from "../../hooks/useApi";
import { MdOutlineNavigateNext, MdOutlineNavigateBefore } from "react-icons/md";
import ProductImageZoom from "../../component/product-image-zoom";
import { Product as ProductInterface } from "../../interface/product.interface";
import apiConfig from "../../config/api.json";
import { IoIosArrowDown, IoMdStar } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";
import { FaHeart, FaRegHeart, FaRegMessage, FaStar, FaRegStar } from "react-icons/fa6";
import { FaPencilAlt, FaStarHalfAlt } from "react-icons/fa";
//@ts-ignore
import 'swiper/css';
import useWishlist from "../../hooks/useWishlist";
import useCart from "../../hooks/useCart";
import { useNavigate } from 'react-router-dom';
import { vendorMessageQueryKey } from "../../config/query-key";
import { productRatingQueryKey } from "../../config/query-key";
import { userAtom } from "../../store/user-store";
import { useAtomValue } from "jotai";
import Modal from "../../component/modals/Modal";
import { Helmet } from "react-helmet-async";
import userImage from "../../assets/user.png"
import { formatPrettyDateWithTime } from "../../utils/date-utils";
import { buildOrganizationJsonLd, buildProductJsonLd, stripHtml } from "../../utils/jsonld-utils";
import CommentsSection from "./component/CommentsSection";
import SimilarProducts from "./component/SimilarProducts";
import { finalPrice } from "../../utils/product-utils";

const initialFieldValues = {
    name: "",
    email: "",
    message: "",
    vendorId: "",
};

const ratingInitialFieldValues = {
    rating: "",
    comment: ""
};

const ratingRequiredFields: any = [
    { key: "rating", value: "rating", label: "text" }
];

const requiredFields: any = [
    { key: "name", value: "name", label: "text" },
    { key: "email", value: "email", label: "text" },
    { key: "message", value: "message", label: "text" }
];

interface ProductImage {
    imageUrl: string;
}

export interface ProductItem extends ProductInterface {
    productImages: ProductImage[];
    seoData: {
        metaTitle: string;
        metaDescription: string;
        metaKeywords: string;
    };
}

const Product = () => {
    const [fieldValues, setFieldValues] = useState(initialFieldValues);
    const [fieldValuesRating, setFieldValuesRating] = useState(ratingInitialFieldValues);
    const { slug } = useParams();
    const { fetchData, postMutation, handleApiMutation, usePaginatedQuery } = useAPI();
    const apiUrl = apiConfig.vendor.vendorMessageUrl;
    const ratingApiUrl = apiConfig.site.productRatingUrl;
    const { addToCart } = useCart();
    const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
    const navigate = useNavigate();
    const [product, setProduct] = useState<ProductItem | null>(null);
    const [relatedProducts, setRelatedProducts] = useState<ProductInterface[]>([]);
    //@ts-ignore
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [selectedImage, setSelectedImage] = useState<string>("");
    //@ts-ignore
    const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
    //@ts-ignore
    const [isBeginning, setIsBeginning] = useState(true);
    //@ts-ignore
    const [isEnd, setIsEnd] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showMessageForm, setShowMessageForm] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [activeTab, setActiveTab] = useState<"description" | "ratings" | "reviews">("description");
    const [rating, setRating] = useState(0);
    const user = useAtomValue(userAtom);
    const [showLoginRequiredModal, setShowLoginRequiredModal] = useState(false);

    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        const fetchProductData = async () => {
            setIsLoading(true);
            try {
                const response = await fetchData({ apiUrl: `${apiConfig.site.productUrl}${slug}` });
                if (response) {
                    setProduct(response);
                    setSelectedImage(response.featuredImage);
                    setRelatedProducts(response.relatedProducts);
                    setFieldValues(prev => ({
                        ...prev,
                        vendorId: response.vendorId,
                    }));
                    setFieldValuesRating(prev => ({
                        ...prev,
                        productId: response.id,
                        vendorId: response.vendorId
                    }));
                } else {
                    setProduct(null);
                }
            } catch (error) {
                console.error("Failed to fetch product data:", error);
                setProduct(null);
            } finally {
                setIsLoading(false);
            }
        };

        if (slug) fetchProductData();
    }, [slug]);

    const handleImageClick = (imageUrl: string) => {
        setSelectedImage(imageUrl);
    };

    const handlePrevImage = () => {
        if (!product) return;

        const images = [product.featuredImage, ...product.productImages.map(img => img.imageUrl)];
        const currentIndex = images.indexOf(selectedImage);
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;

        setSelectedImage(images[prevIndex]);
        setCurrentImageIndex(prevIndex);
    };

    const handleNextImage = () => {
        if (!product) return;

        const images = [product.featuredImage, ...product.productImages.map(img => img.imageUrl)];
        const currentIndex = images.indexOf(selectedImage);
        const nextIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;

        setSelectedImage(images[nextIndex]);
        setCurrentImageIndex(nextIndex);
    };

    const handleWishlistToggle = () => {
        if (product) {
            if (isInWishlist(product)) {
                removeFromWishlist(product);
            } else {
                addToWishlist(product);
            }
        }
    };

    const handleAddToCart = () => {
        if (product) {
            addToCart(product, quantity);
        }
    };

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
            invalidateQueryKey: [vendorMessageQueryKey],
            showSuccessMessage: true,
            showErrorMessage: true,
            requiredFields
        });

        if (result?.success) {
            resetForm();
            setShowMessageForm(false);
            setIsModalOpen(false);
        }
    };

    const handleSubmitRating = async () => {
        const mutation = postMutation;
        const url = ratingApiUrl;

        const payload = {
            ...fieldValuesRating,
            rating: rating
        };

        const result = await handleApiMutation({
            mutation,
            url,
            body: payload,
            invalidateQueryKey: [productRatingQueryKey],
            showSuccessMessage: true,
            showErrorMessage: true,
            requiredFields: ratingRequiredFields
        });

        if (result?.success) {
            resetForm();
            setShowReviewModal(false);
        }
    };

    // @ts-ignore
    const vendorId = product?.vendor?.id

    const dataLimit = 4;
    // @ts-ignore
    const [currentPageNumber, setCurrentPageNumber] = useState(1);

    const commnetApiUrl = useMemo(
        () =>
            `${apiConfig.site.getProductCommentsUrl}/${product?.id}?page=${currentPageNumber}&limit=${dataLimit}`,
        [apiConfig.site.productCommnetUrl, product?.id, currentPageNumber]
    );

    const {
        // @ts-ignore
        data: dataList,
        refetch: fetchCommnetData,
        // @ts-ignore
        pageCount,
        // @ts-ignore
        isFetching,
    } = usePaginatedQuery({
        // @ts-ignore
        queryKey: [productRatingQueryKey, product?.id, currentPageNumber, dataLimit],
        url: commnetApiUrl,
        enabled: false,
    });

    useEffect(() => {
        if (activeTab === "reviews" && !!product?.id) {
            fetchCommnetData();
        }
    }, [activeTab, product?.id, currentPageNumber, fetchCommnetData]);


    const calculatedPrice = finalPrice({
        price: Number(product?.price) || 0,
        discountType: product?.discountType,
        discountAmount: product?.discountAmount ?? 0
    });

    const original = Number(product?.price) || 0;
    const hasDiscount = calculatedPrice < original;
    return (
        <>
            <Helmet>
                <title>{product?.seoData?.metaTitle || product?.name}</title>
                <meta
                    name="description"
                    content={
                        product?.seoData?.metaDescription ||
                        stripHtml(product?.summary || product?.description)
                    }
                />
                <meta name="keywords" content={product?.seoData?.metaKeywords} />

                {product && (
                    <script type="application/ld+json">
                        {JSON.stringify(buildProductJsonLd(product))}
                    </script>
                )}

                <script type="application/ld+json">
                    {JSON.stringify(buildOrganizationJsonLd())}
                </script>
            </Helmet>

            <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                <style>
                    {`
                    .custom-scrollbar::-webkit-scrollbar {
                        width: 6px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                        background: #f1f1f1;
                        border-radius: 10px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                        background: #064490;
                        border-radius: 10px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                        background: #053979;
                    }
                `}
                </style>

                <div className="flex flex-col space-y-8">
                    <div className="flex flex-col lg:flex-row justify-between items-start gap-6 lg:gap-12">
                        <div className="w-full lg:w-1/2">
                            <div className="mb-4 relative">
                                <ProductImageZoom
                                    imageSrc={(selectedImage || product?.featuredImage) ?? ''}
                                    imageAlt={product?.name}
                                    containerClassName="rounded-lg shadow-md w-full"
                                    zoomScale={0}
                                />
                                <button
                                    onClick={handlePrevImage}
                                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-md cursor-pointer"
                                    aria-label="Previous image"
                                >
                                    <MdOutlineNavigateBefore />
                                </button>
                                <button
                                    onClick={handleNextImage}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-md cursor-pointer"
                                    aria-label="Next image"
                                >
                                    <MdOutlineNavigateNext />
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-4">
                                <button
                                    onClick={() => handleImageClick(product?.featuredImage ?? '')}
                                    className={`w-16 h-16 sm:w-20 sm:h-20 overflow-hidden border-2 transition ${selectedImage === product?.featuredImage ? "border-[var(--color-green-primary)]" : "border-gray-300"}`}
                                >
                                    <Image src={product?.featuredImage} alt={product?.name} className="w-full h-full object-cover" width={500} height={500} />
                                </button>
                                {product?.productImages.map((image, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleImageClick(image.imageUrl)}
                                        className={`w-16 h-16 sm:w-20 sm:h-20 overflow-hidden border-2 transition cursor-pointer ${selectedImage === image.imageUrl ? "border-[var(--color-green-primary)]" : "border-gray-300"}`}
                                    >
                                        <Image src={image.imageUrl || null} alt={`${product.name} className="w-full h-full object-cover" width={500} height={500} - ${index + 1}`} />
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="w-full lg:w-1/2 text-left sm:text-left">
                            <p className="text-[var(--color-black-primary)]">{product?.mainCategoryName}</p>
                            <p className="text-2xl sm:text-3xl font-bold text-[var(--color-black-primary)] mb-4">{product?.name}</p>
                            <div className="flex items-center gap-8 mb-4">
                                <p className="flex items-center gap-2">
                                    <div className="flex justify-center text-yellow-500">
                                        {[...Array(5)].map((_, idx) => {
                                            const starValue = idx + 1;
                                            const rating = product?.productReview?.ratingAverage || 0;

                                            return (
                                                <span key={idx}>
                                                    {rating >= starValue ? (
                                                        <FaStar size={18} />
                                                    ) : rating >= starValue - 0.5 ? (
                                                        <FaStarHalfAlt size={18} />
                                                    ) : (
                                                        <FaRegStar size={18} className="text-gray-300" />
                                                    )}
                                                </span>
                                            );
                                        })}
                                    </div>

                                    <span className="text-[var(--color-black-primary)]">({product?.productReview?.reviewCount})</span>
                                </p>
                                <button onClick={() => {
                                    if (!user) {
                                        setShowLoginRequiredModal(true);
                                    } else {
                                        setShowReviewModal(true);
                                    }
                                }} className="flex items-center gap-2 text-[var(--color-black-primary)] cursor-pointer"><span><FaPencilAlt size={14} /></span> Add your ratings</button>
                            </div>
                            <p className="text-2xl sm:text-3xl font-bold text-[var(--color-black-primary)] mb-4">
                                {hasDiscount ? (
                                    <>
                                        <span className="mr-2 line-through text-gray-400">
                                            ${original.toFixed(2)}
                                        </span>
                                        <span className="text-[var(--color-green-primary)] text-lg font-bold">
                                            ${calculatedPrice.toFixed(2)}
                                        </span>
                                    </>
                                ) : (
                                    <span className="text-[var(--color-green-primary)] text-lg font-bold">
                                        ${original.toFixed(2)}
                                    </span>
                                )}
                            </p>
                            <div className="mb-4">
                                <p className="font-bold mb-2 text-[var(--color-black-primary)]">Quantity:</p>
                                <div className="flex items-center border border-[var(--color-black-secondary)] w-max overflow-hidden">
                                    <button
                                        onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                                        className="px-3 py-1 text-lg text-[var(--color-black-primary)] border-r border-[var(--color-black-primary)] font-bold cursor-pointer"
                                    >
                                        -
                                    </button>
                                    <div className="px-5 py-1 text-lg text-[var(--color-black-primary)]">{quantity}</div>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="px-3 py-1 text-lg text-[var(--color-black-primary)] font-bold border-l border-[var(--color-black-primary)] cursor-pointer"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                            <div className="flex justify-start space-x-4 mb-4">
                                <button className="border border-[var(--color-green-primary)] text-[var(--color-black-primary)] px-4 sm:px-6 py-2 font-semibold cursor-pointer transition"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleAddToCart();
                                    }}
                                >
                                    Add to Cart
                                </button>
                                <button className="bg-[var(--color-green-primary)] text-white px-4 sm:px-6 py-2 font-semibold cursor-pointer transition"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleAddToCart();
                                        navigate('/cart');
                                    }}
                                >
                                    Buy Now
                                </button>
                                <button className="border border-[var(--color-green-secondary)] text-[var(--color-green-primary)] p-2 cursor-pointer"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleWishlistToggle();
                                    }}
                                >
                                    {product && (isInWishlist(product) ? <FaHeart size={22} /> : <FaRegHeart size={22} />)}
                                </button>
                            </div>
                            <div className="mb-4">
                                <p className="text-lg sm:text-xl font-semibold mb-4 text-[var(--color-black-primary)]">Specification:</p>
                                <ul className="list-decimal list-inside space-y-1 text-[var(--color-black-primary)]">
                                    {product?.summary
                                        ?.split('~')
                                        .map((item, index) => (
                                            <li key={index}>
                                                {item.trim()}
                                            </li>
                                        ))}
                                </ul>

                            </div>

                            <div>
                                <div
                                    onClick={() => setIsModalOpen(true)}
                                    className="flex items-center gap-2 cursor-pointer">
                                    <FaRegMessage className="text-[var(--color-black-primary)]" />
                                    <p className="text-xl font-bold flex items-center gap-2 text-[var(--color-black-primary)] hover:border-b transition-all ease-in-out duration-300">
                                        Meet your Seller
                                    </p>
                                    <IoIosArrowDown className="text-[var(--color-black-primary)]" />
                                </div>

                                {isModalOpen && (
                                    <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 bg-[#000000b6] z-50 p-2">
                                        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full relative">
                                            <button
                                                onClick={() => {
                                                    setIsModalOpen(false);
                                                    setShowMessageForm(false);
                                                }}
                                                className="absolute top-2 right-2 text-2xl text-[var(--color-black-primary)] cursor-pointer">
                                                <RxCross2 />
                                            </button>

                                            <p className="text-xl font-bold mb-4 text-[var(--color-black-primary)] border-b">
                                                Seller Information
                                            </p>

                                            <div className="flex flex-col items-center gap-2">

                                                <Image src={product?.vendor?.profile?.shopImage || null} alt="Seller" className="w-24 h-24 rounded-full object-cover" width={96} height={96} />

                                                <p className="text-lg font-semibold text-[var(--color-black-primary)]">
                                                    {product?.vendor?.profile?.shopName || 'Shop Name Not Available'}
                                                </p>

                                                <button
                                                    onClick={() => setShowMessageForm(true)}
                                                    className="bg-[var(--color-green-primary)] mt-2 text-white px-4 py-2 rounded-full cursor-pointer">
                                                    Send a Message
                                                </button>

                                                {showMessageForm && (
                                                    <form className="w-full mt-4 flex flex-col gap-3" onSubmit={(e) => {
                                                        e.preventDefault();
                                                        handleSubmitForm();
                                                    }}>
                                                        <input
                                                            type="text"
                                                            name="name"
                                                            value={fieldValues.name}
                                                            onChange={handleChange}
                                                            placeholder="Your Name"
                                                            className="border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-green-primary)]"

                                                        />
                                                        <input
                                                            type="email"
                                                            name="email"
                                                            value={fieldValues.email}
                                                            onChange={handleChange}
                                                            placeholder="Your Email"
                                                            className="border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-green-primary)]"

                                                        />
                                                        <textarea
                                                            rows={4}
                                                            name="message"
                                                            value={fieldValues.message}
                                                            onChange={handleChange}
                                                            placeholder="Your Message"
                                                            className="border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-green-primary)] resize-none"

                                                        />
                                                        <button
                                                            type="submit"
                                                            className="text-[var(--color-green-primary)] font-semibold border border-[var(--color-green-primary)] py-2 rounded-full mt-1 transition cursor-pointer">
                                                            Send
                                                        </button>
                                                    </form>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {showReviewModal && user && (
                            <div className="fixed inset-0 flex items-center justify-center max-w-full bg-opacity-50 bg-[#000000b6] z-50">
                                <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-sm relative animate-fadeIn">
                                    <button
                                        onClick={() => setShowReviewModal(false)}
                                        className="absolute top-3 right-4 text-2xl cursor-pointer"
                                    >
                                        <RxCross2 />
                                    </button>

                                    <p className="text-xl sm:text-2xl font-bold text-center text-[var(--color-black-primary)]">
                                        Rate This Product
                                    </p>
                                    <p className="text-center text-sm text-gray-500 mb-4">
                                        Tap a star to submit your review.
                                    </p>

                                    <div className="flex justify-center gap-2">
                                        {[...Array(5)].map((_, idx) => {
                                            const starValue = idx + 1;
                                            return (
                                                <span
                                                    key={idx}
                                                    onClick={() => setRating(starValue)}
                                                    className={`text-3xl cursor-pointer transition ${starValue <= rating ? "text-yellow-500" : "text-gray-300"}`}
                                                >
                                                    <IoMdStar />
                                                </span>
                                            );
                                        })}
                                    </div>

                                    {/* <div>
                                        <p className="text-sm font-medium mb-1 mt-4">Add a comment</p>
                                        <textarea name="comment" value={fieldValuesRating.comment} onChange={(e) =>
                                            setFieldValuesRating(prev => ({ ...prev, comment: e.target.value }))} placeholder="please add your valuable words..." rows={3} className="border border-gray-300 w-full rounded-md px-2 py-2 focus:outline-1 focus:outline-gray-500" />
                                    </div> */}

                                    <button
                                        type="button"
                                        onClick={handleSubmitRating}
                                        disabled={rating === 0}
                                        className={`w-full font-semibold py-2 rounded-md transition cursor-pointer mt-4 ${rating === 0
                                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                            : "bg-[var(--color-green-primary)] text-white"
                                            }`}
                                    >
                                        Submit Review
                                    </button>
                                </div>
                            </div>
                        )}

                        <Modal
                            isOpen={showLoginRequiredModal}
                            onClose={() => setShowLoginRequiredModal(false)}
                            title=""
                        >
                            <div className="text-center space-y-6">
                                <p className="text-[var(--color-green-primary)] font-medium">
                                    You must be logged in to add your review.
                                </p>
                                <Link
                                    href="/login"
                                    className="inline-block bg-[var(--color-green-primary)] text-white px-6 py-2 rounded-full font-semibold"
                                >
                                    Go to Login
                                </Link>
                            </div>
                        </Modal>
                    </div>

                    <div className="flex items-center justify-center border-b border-gray-300 mt-12 mb-6 gap-12">
                        {["description", "ratings", "reviews"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as "description" | "ratings" | "reviews")}
                                className={`pb-2 text-sm sm:text-xl font-bold capitalize cursor-pointer transition-all duration-300 ${activeTab === tab
                                    ? "border-b-2 border-[var(--color-black-primary)] text-[var(--color-black-primary)]"
                                    : "border-b-2 border-transparent text-gray-500 "
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {activeTab === "description" && (
                        <div className="w-full text-justify font-medium text-[var(--color-black-primary)]">
                            <div dangerouslySetInnerHTML={{ __html: product?.description || '' }} />
                        </div>
                    )}

                    {activeTab === "ratings" && (
                        <div className="flex flex-col gap-8 p-6">
                            <div className="flex flex-col lg:flex-row gap-10">
                                <div className="flex flex-col items-center justify-center w-full lg:w-1/3 text-center lg:border-r border-gray-300">
                                    <p className="text-5xl font-bold text-[var(--color-black-primary)]">
                                        {product?.productReview?.ratingAverage} <span className="text-gray-600 text-sm font-normal">out of 5</span>
                                    </p>
                                    <div className="flex justify-center text-yellow-500 my-2">
                                        {[...Array(5)].map((_, idx) => {
                                            const starValue = idx + 1;
                                            const rating = product?.productReview?.ratingAverage || 0;
                                            return (
                                                <span key={idx}>
                                                    {rating >= starValue ? (
                                                        <FaStar size={18} />
                                                    ) : rating >= starValue - 0.5 ? (
                                                        <FaStarHalfAlt size={18} />
                                                    ) : (
                                                        <FaRegStar size={18} className="text-gray-300" />
                                                    )}
                                                </span>
                                            );
                                        })}
                                    </div>
                                    <p className="text-xs font-semibold text-gray-500">({product?.productReview?.reviewCount} Reviews)</p>
                                </div>

                                <div className="w-full lg:w-2/3 space-y-3">
                                    {[5, 4, 3, 2, 1].map((star) => {
                                        const count = (star === 5 ? product?.productReview?.countFiveStartRating :
                                            star === 4 ? product?.productReview?.countFourStartRating :
                                                star === 3 ? product?.productReview?.countThreeStartRating :
                                                    star === 2 ? product?.productReview?.countTwoStartRating :
                                                        product?.productReview?.countOneStartRating) ?? 0;

                                        const totalReviews = product?.productReview?.reviewCount || 1;
                                        const percentage = (count / totalReviews) * 100;

                                        return (
                                            <div key={star} className="flex items-center gap-3">
                                                <div className="w-12 text-sm text-gray-600">{star} Star</div>
                                                <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                                                    <div
                                                        className="bg-yellow-400 h-full rounded-full"
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                                <div className="w-8 text-sm text-gray-600 text-right">{count}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "reviews" && (
                        <CommentsSection
                            productId={product?.id}
                            getCommentsBaseUrl={apiConfig.site.getProductCommentsUrl}
                            createCommentUrl={apiConfig.site.commentCreateApiUrl}
                            queryKey={productRatingQueryKey}
                            usePaginatedQuery={usePaginatedQuery}
                            handleApiMutation={handleApiMutation}
                            postMutation={postMutation}
                            user={user}
                            userPlaceholderImg={userImage}
                            formatDate={formatPrettyDateWithTime}
                            initialLimit={3}
                            vendorId={vendorId}
                        />
                    )}

                    <div className="border border-gray-300 mt-8"></div>

                    {relatedProducts.length > 0 && (
                        <SimilarProducts relatedProducts={relatedProducts} />
                    )}
                </div>
            </div>
        </>
    );
};

export default Product;
