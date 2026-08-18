import { RiArrowDropDownLine } from "react-icons/ri";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { nestedCategoriesAtom } from "../../../../store/global-store";
import { MainCategory } from "../../../../interface/nested-category.interface";

const NavBar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [nestedCategories] = useAtom(nestedCategoriesAtom);
    const mainCategories = (nestedCategories ?? []) as unknown as MainCategory[];

    const handleScroll = () => {
        setIsScrolled(window.scrollY > 100);
    };

    useEffect(() => {
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="relative">
            <div
                className={`w-full z-50 bg-[#509855] border-t border-white/10 transition-all duration-300 ${isScrolled ? "fixed top-0 left-0 right-0 shadow-md" : "relative"
                    }`}
            >
                <div className="max-w-screen-2xl mx-auto px-4">
                    <div className="flex overflow-x-auto sm:overflow-x-visible justify-start sm:justify-center items-center gap-x-5 md:gap-x-8 py-1.5 whitespace-nowrap scrollbar-none w-full">
                        {/* Static Home Link */}
                        <div className="relative">
                            <Link 
                                href="/" 
                                className="block py-1.5 text-white hover:text-white/80 text-[13px] font-semibold uppercase tracking-wider transition-colors duration-200"
                            >
                                Home
                            </Link>
                        </div>

                        {/* Dynamic Categories */}
                        {mainCategories.map((main, idx) => {
                            const hasDropdown = main.firstCategories && main.firstCategories.length > 0;
                            
                            return (
                                <div key={main.id || idx} className="relative group">
                                    {hasDropdown ? (
                                        <div className="flex items-center gap-1 py-1.5 text-white hover:text-white/80 text-[13px] font-semibold uppercase tracking-wider cursor-pointer transition-colors duration-200">
                                            <span>{main.name}</span>
                                            <RiArrowDropDownLine size={18} className="transition-transform duration-200 group-hover:rotate-180" />
                                        </div>
                                    ) : (
                                        <Link 
                                            href={`/shop?mainCategoryId=${main.id}&pageNumber=1`} 
                                            className="block py-1.5 text-white hover:text-white/80 text-[13px] font-semibold uppercase tracking-wider transition-colors duration-200"
                                        >
                                            {main.name}
                                        </Link>
                                    )}

                                    {hasDropdown && (
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-48 bg-[#509855] shadow-xl rounded-lg border border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                            <div className="py-1.5">
                                                {main.firstCategories.map((first, fIdx) => (
                                                    <Link
                                                        key={first.id || fIdx}
                                                        href={`/shop?firstCategoryId=${first.id}&pageNumber=1`}
                                                        className="block px-4 py-2 text-[12px] font-medium text-white hover:bg-white/10 transition-colors duration-150"
                                                    >
                                                        {first.name}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {/* Static Contact Us Link */}
                        <div className="relative">
                            <Link 
                                href="/contact-us" 
                                className="block py-1.5 text-white hover:text-white/80 text-[13px] font-semibold uppercase tracking-wider transition-colors duration-200"
                            >
                                Contact
                            </Link>
                        </div>

                        {/* Static Blog Link */}
                        <div className="relative">
                            <Link 
                                href="/blog" 
                                className="block py-1.5 text-white hover:text-white/80 text-[13px] font-semibold uppercase tracking-wider transition-colors duration-200"
                            >
                                Blog
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NavBar;
