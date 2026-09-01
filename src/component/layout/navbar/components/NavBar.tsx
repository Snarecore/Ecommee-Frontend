import { RiArrowDropDownLine } from "react-icons/ri";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useRouter } from "next/navigation";
import { nestedCategoriesAtom, megaDiscountAtom } from "../../../../store/global-store";
import { MainCategory } from "../../../../interface/nested-category.interface";
import { userAtom, logoutUserAtom, getUserDisplayName } from "../../../../store/user-store";
import { FaRegUser } from "react-icons/fa6";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import { RiLogoutCircleLine } from "react-icons/ri";
import { FiMenu, FiHome, FiPackage, FiZap, FiShoppingBag, FiChevronRight } from "react-icons/fi";
import NotificationDropdown from "./NotificationDropdown";
import MobileNavDrawer from "./MobileNavDrawer";

const NavBar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [nestedCategories] = useAtom(nestedCategoriesAtom);
    const [megaDiscount] = useAtom(megaDiscountAtom);
    const mainCategories = (nestedCategories ?? []) as unknown as MainCategory[];

    const user = useAtomValue(userAtom);
    const setLogout = useSetAtom(logoutUserAtom);
    const router = useRouter();

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleScroll = () => {
        setIsScrolled(window.scrollY > 100);
    };

    useEffect(() => {
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        setIsDropdownOpen(false);
        setLogout({ navigate: () => router.push("/login") });
    };

    const displayName = getUserDisplayName(user);

    const getUserInitial = () => {
        if (!displayName) return "U";
        return displayName.charAt(0).toUpperCase();
    };

    return (
        <div className="relative">
            <div
                className={`w-full z-30 bg-gradient-to-r from-[#3e7842] via-[#519755] to-[#3a753e] border-t border-white/15 shadow-md transition-all duration-300 ${
                    isScrolled ? "fixed top-0 left-0 right-0 z-50 shadow-xl backdrop-blur-md bg-[#519755]/95" : "relative"
                }`}
            >
                <div className="max-w-screen-2xl mx-auto px-4 sm:px-6">
                    <div className="flex items-center justify-between py-2 w-full">
                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="lg:hidden px-3 py-1.5 bg-white/10 hover:bg-white/20 active:scale-95 border border-white/20 text-white rounded-full transition-all focus:outline-none flex items-center gap-2 cursor-pointer shadow-xs"
                            aria-label="Open navigation menu"
                        >
                            <FiMenu className="text-xl" />
                            <span className="text-xs font-bold uppercase tracking-wider">Menu</span>
                        </button>

                        {/* Categories & Main Menu Links (Desktop) */}
                        <div className="hidden lg:flex items-center justify-start gap-x-2 md:gap-x-3 flex-1">
                            {/* Static Home Link */}
                            <Link 
                                href="/" 
                                className="px-3.5 py-1.5 rounded-lg text-white/90 hover:text-white hover:bg-white/15 transition-all duration-200 text-[13px] font-bold uppercase tracking-wider flex items-center gap-1.5"
                            >
                                <FiHome className="text-sm opacity-80" />
                                <span>Home</span>
                            </Link>

                            {/* Dynamic Categories */}
                            {mainCategories.map((main, idx) => {
                                const hasDropdown = main.firstCategories && main.firstCategories.length > 0;
                                
                                return (
                                    <div key={main.id || idx} className="relative group">
                                        {hasDropdown ? (
                                            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-white/90 group-hover:text-white group-hover:bg-white/20 text-[13px] font-bold uppercase tracking-wider cursor-pointer transition-all duration-200">
                                                <span>{main.name}</span>
                                                <RiArrowDropDownLine size={20} className="transition-transform duration-300 group-hover:rotate-180 opacity-80 group-hover:opacity-100" />
                                            </div>
                                        ) : (
                                            <Link 
                                                href={`/shop?mainCategoryId=${main.id}&pageNumber=1`} 
                                                className="block px-3.5 py-1.5 rounded-lg text-white/90 hover:text-white hover:bg-white/20 text-[13px] font-bold uppercase tracking-wider transition-all duration-200"
                                            >
                                                {main.name}
                                            </Link>
                                        )}

                                        {hasDropdown && (
                                            <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-1 group-hover:translate-y-0 transition-all duration-200 ease-out z-50">
                                                <div className="w-64 bg-white dark:bg-slate-900 shadow-2xl rounded-2xl border border-gray-100 dark:border-slate-800 p-2 text-slate-800 dark:text-slate-100 overflow-hidden ring-1 ring-black/5">
                                                    {/* Header: Explore All in this Category */}
                                                    <Link
                                                        href={`/shop?mainCategoryId=${main.id}&pageNumber=1`}
                                                        className="flex items-center justify-between px-3.5 py-2.5 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100/80 dark:hover:bg-emerald-900/60 rounded-xl text-xs font-bold text-emerald-800 dark:text-emerald-300 transition-colors mb-1.5 group/header"
                                                    >
                                                        <span className="flex items-center gap-2">
                                                            <FiShoppingBag className="text-emerald-600 dark:text-emerald-400 text-sm" />
                                                            <span>Explore All {main.name}</span>
                                                        </span>
                                                        <FiChevronRight className="text-xs group-hover/header:translate-x-1 transition-transform" />
                                                    </Link>

                                                    {/* Subcategories list */}
                                                    <div className="space-y-0.5 max-h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
                                                        {main.firstCategories.map((first, fIdx) => (
                                                            <Link
                                                                key={first.id || fIdx}
                                                                href={`/shop?firstCategoryId=${first.id}&pageNumber=1`}
                                                                className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-500/10 dark:hover:bg-emerald-950/30 rounded-xl transition-all group/item"
                                                            >
                                                                <span className="truncate">{first.name}</span>
                                                                <FiChevronRight className="text-xs text-slate-300 dark:text-slate-600 group-hover/item:text-emerald-600 dark:group-hover/item:text-emerald-400 group-hover/item:translate-x-0.5 transition-all flex-shrink-0" />
                                                            </Link>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            {/* Dynamic Mega Discount Promotional Link */}
                            {megaDiscount?.isActive && (
                                <Link 
                                    href="/shop?discountOnly=true&pageNumber=1" 
                                    className="px-3.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-gray-900 font-extrabold text-[13px] uppercase tracking-wider flex items-center gap-1.5 shadow-md transition-all duration-200"
                                >
                                    <FiZap className="text-sm text-gray-900" />
                                    <span>{megaDiscount.menuText || "Mega Sale"}</span>
                                </Link>
                            )}
                        </div>

                        {/* Right Section: Notifications + User Profile */}
                        <div className="flex items-center gap-2 sm:gap-3 pl-4 flex-shrink-0">
                            {/* Notification Bell */}
                            <NotificationDropdown variant="green" />

                            {/* User Profile Pill / Dropdown */}
                            <div className="relative" ref={dropdownRef}>
                                <div
                                    className="flex items-center gap-2 text-white cursor-pointer py-1.5 px-3 rounded-full hover:bg-white/20 bg-white/10 border border-white/20 transition-all duration-200 shadow-xs active:scale-95"
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                >
                                    {isMounted && user ? (
                                        <>
                                            <div className="w-7 h-7 rounded-full bg-white/25 border border-white/50 text-white font-bold flex items-center justify-center text-xs flex-shrink-0">
                                                {getUserInitial()}
                                            </div>
                                            <span className="font-semibold text-xs sm:text-sm text-white hidden sm:inline-block truncate max-w-[110px]">
                                                {displayName}
                                            </span>
                                            <MdOutlineKeyboardArrowDown
                                                className={`text-white text-lg transition-transform duration-200 ${
                                                    isDropdownOpen ? "rotate-180" : ""
                                                }`}
                                            />
                                        </>
                                    ) : (
                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                                            <FaRegUser className="text-sm" />
                                            <div className="hidden sm:flex items-center gap-1">
                                                <Link href="/login" className="hover:underline">Login</Link>
                                                <span>/</span>
                                                <Link href="/signup" className="hover:underline">Register</Link>
                                            </div>
                                            <span className="sm:hidden">Account</span>
                                        </div>
                                    )}
                                </div>

                                {/* User Dropdown Card */}
                                {isDropdownOpen && (
                                    <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 shadow-2xl rounded-2xl p-2 z-50 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-200 animate-in fade-in zoom-in-95 duration-150">
                                        {isMounted && user ? (
                                            <>
                                                <div className="px-3 py-2.5 bg-emerald-50 dark:bg-gray-700/50 rounded-xl mb-1.5 border border-emerald-100 dark:border-gray-700">
                                                    <p className="text-xs font-bold truncate text-[var(--color-green-primary)] dark:text-emerald-400">{displayName}</p>
                                                    <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{user.email || user.role}</p>
                                                </div>

                                                <Link
                                                    href="/customer-dashboard?tab=order"
                                                    onClick={() => setIsDropdownOpen(false)}
                                                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors text-gray-700 dark:text-gray-200"
                                                >
                                                    <FiPackage className="text-[var(--color-green-primary)] text-sm" />
                                                    My Orders
                                                </Link>

                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full text-left px-3 py-2 text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl mt-1 cursor-pointer flex items-center gap-2.5 transition-colors"
                                                >
                                                    <RiLogoutCircleLine className="text-base" />
                                                    Logout
                                                </button>
                                            </>
                                        ) : (
                                            <div className="p-1 space-y-1">
                                                <Link
                                                    href="/login"
                                                    onClick={() => setIsDropdownOpen(false)}
                                                    className="block px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                                                >
                                                    Sign In
                                                </Link>
                                                <Link
                                                    href="/signup"
                                                    onClick={() => setIsDropdownOpen(false)}
                                                    className="block px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                                                >
                                                    Create Account
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modern Off-Canvas Mobile Navigation Drawer */}
            <MobileNavDrawer
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
                mainCategories={mainCategories}
            />
        </div>
    );
};

export default NavBar;

