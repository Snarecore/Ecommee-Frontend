import { RiArrowDropDownLine } from "react-icons/ri";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useNavigate } from "react-router-dom";
import { nestedCategoriesAtom } from "../../../../store/global-store";
import { MainCategory } from "../../../../interface/nested-category.interface";
import { userAtom, logoutUserAtom, getUserDisplayName } from "../../../../store/user-store";
import { FaRegUser, FaUser } from "react-icons/fa6";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import { RiLogoutCircleLine } from "react-icons/ri";
import { FiMenu, FiX, FiHome, FiMail, FiBookOpen, FiPackage } from "react-icons/fi";
import NotificationDropdown from "./NotificationDropdown";

const NavBar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [nestedCategories] = useAtom(nestedCategoriesAtom);
    const mainCategories = (nestedCategories ?? []) as unknown as MainCategory[];

    const user = useAtomValue(userAtom);
    const setLogout = useSetAtom(logoutUserAtom);
    const navigate = useNavigate();

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
        setLogout(() => navigate("/login"));
    };

    const displayName = getUserDisplayName(user);

    const getUserInitial = () => {
        if (!displayName) return "U";
        return displayName.charAt(0).toUpperCase();
    };

    return (
        <div className="relative">
            <div
                className={`w-full z-50 bg-gradient-to-r from-[#3e7842] via-[#519755] to-[#3a753e] border-t border-white/15 shadow-md transition-all duration-300 ${
                    isScrolled ? "fixed top-0 left-0 right-0 shadow-xl backdrop-blur-md bg-[#519755]/95" : "relative"
                }`}
            >
                <div className="max-w-screen-2xl mx-auto px-4 sm:px-6">
                    <div className="flex items-center justify-between py-2 w-full">
                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="lg:hidden p-2 text-white hover:bg-white/15 rounded-lg transition-colors focus:outline-none flex items-center gap-2 cursor-pointer"
                            aria-label="Toggle navigation menu"
                        >
                            {isMobileMenuOpen ? <FiX className="text-2xl" /> : <FiMenu className="text-2xl" />}
                            <span className="text-xs font-semibold uppercase tracking-wider">Menu</span>
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
                                            <div className="flex items-center gap-1 px-3.5 py-1.5 rounded-lg text-white/90 hover:text-white hover:bg-white/15 text-[13px] font-bold uppercase tracking-wider cursor-pointer transition-all duration-200">
                                                <span>{main.name}</span>
                                                <RiArrowDropDownLine size={20} className="transition-transform duration-300 group-hover:rotate-180 opacity-80" />
                                            </div>
                                        ) : (
                                            <Link 
                                                href={`/shop?mainCategoryId=${main.id}&pageNumber=1`} 
                                                className="block px-3.5 py-1.5 rounded-lg text-white/90 hover:text-white hover:bg-white/15 text-[13px] font-bold uppercase tracking-wider transition-all duration-200"
                                            >
                                                {main.name}
                                            </Link>
                                        )}

                                        {hasDropdown && (
                                            <div className="absolute top-full left-0 mt-1.5 w-52 bg-[#396c3c]/95 backdrop-blur-md shadow-2xl rounded-2xl border border-white/20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden p-1.5">
                                                <div className="py-1">
                                                    {main.firstCategories.map((first, fIdx) => (
                                                        <Link
                                                            key={first.id || fIdx}
                                                            href={`/shop?firstCategoryId=${first.id}&pageNumber=1`}
                                                            className="block px-3.5 py-2 text-[12px] font-semibold text-white/90 hover:text-white hover:bg-white/20 rounded-xl transition-all duration-150 hover:translate-x-1"
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
                            <Link 
                                href="/contact-us" 
                                className="px-3.5 py-1.5 rounded-lg text-white/90 hover:text-white hover:bg-white/15 transition-all duration-200 text-[13px] font-bold uppercase tracking-wider flex items-center gap-1.5"
                            >
                                <FiMail className="text-sm opacity-80" />
                                <span>Contact</span>
                            </Link>
                        </div>

                        {/* Right Section: Notifications + User Profile */}
                        <div className="flex items-center gap-2 sm:gap-3 pl-4 flex-shrink-0">
                            {/* Notification Bell */}
                            <NotificationDropdown variant="green" />

                            {/* User Profile Pill / Dropdown */}
                            <div className="relative" ref={dropdownRef}>
                                <div
                                    className="flex items-center gap-2.5 text-white cursor-pointer py-1.5 px-3 rounded-full hover:bg-white/20 transition-all duration-200 border border-white/20 shadow-xs"
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
                                                    href="/customer-dashboard"
                                                    onClick={() => setIsDropdownOpen(false)}
                                                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors text-gray-700 dark:text-gray-200"
                                                >
                                                    <FaUser className="text-[var(--color-green-primary)]" />
                                                    User Profile
                                                </Link>

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

                    {/* Mobile Navigation Drawer Overlay */}
                    {isMobileMenuOpen && (
                        <div className="lg:hidden py-3 border-t border-white/20 animate-in slide-in-from-top-2 duration-200">
                            <div className="flex flex-col gap-1">
                                <Link
                                    href="/"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="px-4 py-2 text-xs font-bold text-white uppercase hover:bg-white/15 rounded-lg flex items-center gap-2"
                                >
                                    <FiHome /> Home
                                </Link>

                                {mainCategories.map((main, idx) => (
                                    <div key={main.id || idx} className="flex flex-col">
                                        <Link
                                            href={`/shop?mainCategoryId=${main.id}&pageNumber=1`}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="px-4 py-2 text-xs font-bold text-white uppercase hover:bg-white/15 rounded-lg"
                                        >
                                            {main.name}
                                        </Link>
                                        {main.firstCategories && main.firstCategories.length > 0 && (
                                            <div className="pl-6 flex flex-col gap-1 py-1">
                                                {main.firstCategories.map((first, fIdx) => (
                                                    <Link
                                                        key={first.id || fIdx}
                                                        href={`/shop?firstCategoryId=${first.id}&pageNumber=1`}
                                                        onClick={() => setIsMobileMenuOpen(false)}
                                                        className="px-3 py-1.5 text-[11px] font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-md"
                                                    >
                                                        • {first.name}
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}

                                <Link
                                    href="/contact-us"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="px-4 py-2 text-xs font-bold text-white uppercase hover:bg-white/15 rounded-lg flex items-center gap-2"
                                >
                                    <FiMail /> Contact
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NavBar;
