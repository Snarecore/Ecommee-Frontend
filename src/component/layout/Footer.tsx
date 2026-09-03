'use client';

import Image from "next/image";
import Link from "next/link";
import { useAtom } from "jotai";
import { headerFooterAtom, socialLinksAtom, nestedCategoriesAtom } from "../../store/global-store";
import { MainCategory } from "../../interface/nested-category.interface";
import visaCard from "../../assets/visaCard.svg";
import mastardCard from "../../assets/masterCard.svg";
import americanCard from "../../assets/dls-logo-bluebox-solid.svg";
import discoveLog from "../../assets/discover-logo.png";
import paypal from "../../assets/paypal-svgrepo-com.svg";

import { 
    FaFacebookF, 
    FaTwitter, 
    FaInstagram, 
    FaLinkedinIn, 
    FaYoutube, 
    FaPhone, 
    FaEnvelope, 
    FaLocationDot, 
    FaGlobe,
    FaAngleRight,
    FaWhatsapp
} from "react-icons/fa6";

const defaultPolicyLinks = [
    { value: "Privacy Policy", link: "/privacy-policy" },
    { value: "Refund & Return Policy", link: "/refund-return-policy" },
    { value: "Shipping & Delivery Policy", link: "/shipping-delivery-policy" },
    { value: "Terms & Conditions", link: "/terms-conditions" },
    { value: "Vendor Agreement", link: "/vendor-agreement" },
    { value: "About Us", link: "/about-us" },
    { value: "FAQs", link: "/faqs" },
];

const defaultSocials = [
    { name: "Facebook", link: "https://facebook.com" },
    { name: "Instagram", link: "https://instagram.com" },
    { name: "Twitter", link: "https://twitter.com" },
    { name: "LinkedIn", link: "https://linkedin.com" },
    { name: "YouTube", link: "https://youtube.com" },
];

const getSocialIcon = (linkStr?: string) => {
    const l = (linkStr || "").toLowerCase();
    if (l.includes("facebook")) return <FaFacebookF className="w-4 h-4" />;
    if (l.includes("instagram")) return <FaInstagram className="w-4 h-4" />;
    if (l.includes("twitter") || l.includes("x.com")) return <FaTwitter className="w-4 h-4" />;
    if (l.includes("linkedin")) return <FaLinkedinIn className="w-4 h-4" />;
    if (l.includes("youtube")) return <FaYoutube className="w-4 h-4" />;
    if (l.includes("whatsapp")) return <FaWhatsapp className="w-4 h-4" />;
    return <FaGlobe className="w-4 h-4" />;
};

const Footer = () => {
    const [headerFooterData] = useAtom(headerFooterAtom);
    const [socialLinksData] = useAtom(socialLinksAtom);
    const [nestedCategories] = useAtom(nestedCategoriesAtom);
    const mainCategories = (nestedCategories ?? []) as unknown as MainCategory[];

    const contactEmail = "majba.web@gmail.com";
    const contactPhone = "01317020309";
    const contactAddress = headerFooterData?.contactAddress || "30 N Gould St Ste R, Sheridan, WY 82801, USA";

    const socialsList = Array.isArray(socialLinksData) && socialLinksData.length > 0 
        ? socialLinksData 
        : defaultSocials;

    // Build main category menu list (only main categories)
    const getCategoryMenuList = () => {
        if (Array.isArray(mainCategories) && mainCategories.length > 0) {
            const list = mainCategories.map((main) => ({
                value: main.name,
                link: `/shop?mainCategoryId=${main.id}&pageNumber=1`,
            }));
            list.push({ value: "All Categories", link: "/all-categories" });
            return list;
        }
        return [
            { value: "Women's Collection", link: "/shop?category=women" },
            { value: "Men's Clothing", link: "/shop?category=men" },
            { value: "Kids & Baby", link: "/shop?category=kids" },
            { value: "Accessories", link: "/shop?category=accessories" },
            { value: "All Categories", link: "/all-categories" },
        ];
    };

    const categoryMenuList = getCategoryMenuList();

    return (
        <div className="bg-slate-950 text-slate-300 pt-16 pb-8 border-t border-slate-800 relative overflow-hidden transition-colors duration-300">
            {/* Ambient Background Gradient Accent */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#218DAE]/5 rounded-full blur-3xl pointer-events-none" />

            <footer className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Main Grid Layout */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-12 gap-8 lg:gap-10 pb-12">
                    
                    {/* Brand & Description Column */}
                    <div className="sm:col-span-2 md:col-span-2 lg:col-span-4 flex flex-col justify-between">
                        <div>
                            <Link href="/" className="inline-block mb-4">
                                {headerFooterData?.footerLogo ? (
                                    <Image 
                                        src={headerFooterData.footerLogo} 
                                        alt="Fashion Time" 
                                        className="h-14 w-auto object-contain brightness-110" 
                                        width={240} 
                                        height={60} 
                                    />
                                ) : (
                                    <span className="text-2xl font-black text-white tracking-wider uppercase flex items-center gap-2">
                                        <span className="bg-[#218DAE] text-white px-2 py-0.5 rounded-md">Fashion</span> Time
                                    </span>
                                )}
                            </Link>

                            <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-md">
                                {headerFooterData?.footerDescription || "A digital product marketplace covering all your needs. Quality products, seamless shopping experience, and dedicated customer support."}
                            </p>

                            {/* Social Media Channels */}
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Follow Us</p>
                                <div className="flex flex-wrap gap-2.5">
                                    {socialsList.map((social: any, idx: number) => {
                                        const link = social.link || "#";
                                        return (
                                            <Link
                                                key={link || idx}
                                                href={link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-9 h-9 rounded-full bg-slate-900 hover:bg-[#218DAE] border border-slate-800 hover:border-[#218DAE] text-slate-300 hover:text-white flex items-center justify-center transition-all duration-200 shadow-xs hover:-translate-y-1"
                                                aria-label={social.name || social.link || "Social link"}
                                            >
                                                {getSocialIcon(link)}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Categories Column */}
                    <div className="sm:col-span-1 md:col-span-1 lg:col-span-3">
                        <h3 className="text-white font-bold text-base mb-4 relative inline-block pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-8 after:h-0.5 after:bg-[#218DAE]">
                            Categories
                        </h3>
                        <ul className="space-y-2.5">
                            {categoryMenuList.map((item, idx) => (
                                <li key={item.link || idx}>
                                    <Link 
                                        href={item.link} 
                                        className="text-slate-400 hover:text-white hover:translate-x-1.5 transition-all duration-200 inline-flex items-center gap-1.5 group text-sm"
                                    >
                                        <FaAngleRight className="text-xs text-[#218DAE] opacity-0 -ml-3 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                                        <span>{item.value}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Policies Column */}
                    <div className="sm:col-span-1 md:col-span-1 lg:col-span-2">
                        <h3 className="text-white font-bold text-base mb-4 relative inline-block pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-8 after:h-0.5 after:bg-[#218DAE]">
                            Policy & Info
                        </h3>
                        <ul className="space-y-2.5">
                            {defaultPolicyLinks.map((sec, idx) => (
                                <li key={sec.link || idx}>
                                    <Link 
                                        href={sec.link} 
                                        className="text-slate-400 hover:text-white hover:translate-x-1.5 transition-all duration-200 inline-flex items-center gap-1.5 group text-sm"
                                    >
                                        <FaAngleRight className="text-xs text-[#218DAE] opacity-0 -ml-3 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                                        <span>{sec.value}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Us Column */}
                    <div className="sm:col-span-2 md:col-span-2 lg:col-span-3">
                        <h3 className="text-white font-bold text-base mb-4 relative inline-block pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-8 after:h-0.5 after:bg-[#218DAE]">
                            Contact Us
                        </h3>
                        <div className="space-y-3 text-sm text-slate-300">
                            <a 
                                href={`mailto:${contactEmail}`} 
                                className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-[#218DAE]/50 text-slate-300 hover:text-white transition-all group shadow-xs"
                            >
                                <span className="p-2.5 rounded-lg bg-[#218DAE]/15 text-[#218DAE] group-hover:bg-[#218DAE] group-hover:text-white transition-colors flex-shrink-0">
                                    <FaEnvelope className="w-4 h-4" />
                                </span>
                                <div className="overflow-hidden">
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Email Us</p>
                                    <p className="font-semibold text-xs sm:text-sm text-white truncate">{contactEmail}</p>
                                </div>
                            </a>

                            <a 
                                href={`tel:${contactPhone}`} 
                                className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-[#218DAE]/50 text-slate-300 hover:text-white transition-all group shadow-xs"
                            >
                                <span className="p-2.5 rounded-lg bg-[#218DAE]/15 text-[#218DAE] group-hover:bg-[#218DAE] group-hover:text-white transition-colors flex-shrink-0">
                                    <FaPhone className="w-4 h-4" />
                                </span>
                                <div>
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Phone</p>
                                    <p className="font-semibold text-xs sm:text-sm text-white">{contactPhone}</p>
                                </div>
                            </a>

                            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 shadow-xs">
                                <span className="p-2.5 rounded-lg bg-[#218DAE]/15 text-[#218DAE] flex-shrink-0">
                                    <FaLocationDot className="w-4 h-4" />
                                </span>
                                <div>
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Address</p>
                                    <p className="text-xs font-medium text-slate-300 leading-snug">{contactAddress}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Bottom Bar: Copyright & Payment Icons */}
                <div className="border-t border-slate-800/80 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-slate-400 text-center md:text-left">
                        {headerFooterData?.copyrightText || "© 2025 Bazaar Bound / Fashion Time. All rights reserved."}
                    </p>

                    <div className="flex items-center gap-3 bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-800/80 flex-wrap justify-center">
                        <span className="text-[11px] font-medium text-slate-400 mr-1 hidden sm:inline">We Accept:</span>
                        <Image src={visaCard} alt="Visa" className="h-6 w-auto object-contain opacity-90 hover:opacity-100 transition-opacity" width={40} height={24} />
                        <Image src={mastardCard} alt="Mastercard" className="h-6 w-auto object-contain opacity-90 hover:opacity-100 transition-opacity" width={40} height={24} />
                        <Image src={americanCard} alt="American Express" className="h-6 w-auto object-contain opacity-90 hover:opacity-100 transition-opacity" width={40} height={24} />
                        <Image src={discoveLog} alt="Discover" className="h-6 w-auto object-contain opacity-90 hover:opacity-100 transition-opacity" width={45} height={24} />
                        <Image src={paypal} alt="Paypal" className="h-6 w-auto object-contain opacity-90 hover:opacity-100 transition-opacity" width={40} height={24} />
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Footer;


