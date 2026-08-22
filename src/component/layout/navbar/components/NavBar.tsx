import { RiArrowDropDownLine } from "react-icons/ri";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useNavigate } from "react-router-dom";
import { nestedCategoriesAtom } from "../../../../store/global-store";
import { MainCategory } from "../../../../interface/nested-category.interface";
import { userAtom, logoutUserAtom } from "../../../../store/user-store";
import { FaRegUser, FaUser } from "react-icons/fa6";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import { RiLogoutCircleLine } from "react-icons/ri";
import NotificationDropdown from "./NotificationDropdown";

const NavBar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [nestedCategories] = useAtom(nestedCategoriesAtom);
    const mainCategories = (nestedCategories ?? []) as unknown as MainCategory[];

    const user = useAtomValue(userAtom);
    const setLogout = useSetAtom(logoutUserAtom);
    const navigate = useNavigate();

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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

    return (
        <div className="relative">
            <div
                className={`w-full z-50 bg-[#509855] border-t border-white/10 transition-all duration-300 ${
                    isScrolled ? "fixed top-0 left-0 right-0 shadow-md" : "relative"
                }`}
            >
                <div className="max-w-screen-2xl mx-auto px-4">
                    <div className="flex items-center justify-between py-1.5 w-full">
                        {/* Categories Menu Links */}
                        <div className="flex overflow-x-auto sm:overflow-x-visible justify-start sm:justify-center items-center gap-x-5 md:gap-x-8 whitespace-nowrap scrollbar-none flex-1">
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

                        {/* Right Portion: Notification Icon (Left) + User Profile Portion (Right) */}
                        <div className="flex items-center gap-3 sm:gap-4 pl-4 flex-shrink-0">
                            {/* Notification Bell with Tailwind Badge */}
                            <NotificationDropdown />

                            {/* User Profile Dropdown */}
                            <div className="relative" ref={dropdownRef}>
                                <div
                                    className="flex items-center gap-2 text-white cursor-pointer hover:opacity-90 transition-opacity py-1 px-2 rounded-lg hover:bg-white/10"
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                >
                                    <FaRegUser className="text-lg sm:text-xl text-white" />
                                    {isMounted && user ? (
                                        <div className="flex items-center gap-1">
                                            {/* Name on Desktop, Avatar/Compact on Mobile */}
                                            <span className="font-semibold text-xs sm:text-sm text-white hidden sm:inline-block truncate max-w-[120px]">
                                                {user.name}
                                            </span>
                                            <MdOutlineKeyboardArrowDown
                                                className={`text-white transition-transform duration-200 ${
                                                    isDropdownOpen ? "rotate-180" : ""
                                                }`}
                                            />
                                        </div>
                                    ) : (
                                        <div className="hidden sm:flex gap-1 text-xs sm:text-sm font-semibold text-white">
                                            <Link href="/login" className="hover:underline">Login</Link>
                                            <span>|</span>
                                            <Link href="/signup" className="hover:underline">Register</Link>
                                        </div>
                                    )}
                                </div>

                                {isDropdownOpen && (
                                    <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 shadow-xl rounded-xl p-2 z-50 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 animate-in fade-in duration-150">
                                        {isMounted && user ? (
                                            <>
                                                <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700 mb-1">
                                                    <p className="text-xs font-bold truncate text-[var(--color-green-primary)] dark:text-green-400">{user.name}</p>
                                                    <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{user.email || user.role}</p>
                                                </div>
                                                <Link
                                                    href="/customer-dashboard"
                                                    onClick={() => setIsDropdownOpen(false)}
                                                    className="flex items-center gap-2 px-3 py-2 text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                                                >
                                                    <FaUser className="text-[var(--color-green-primary)]" />
                                                    User Profile
                                                </Link>
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full text-left px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-md mt-1 cursor-pointer flex items-center gap-2 transition-colors"
                                                >
                                                    <RiLogoutCircleLine />
                                                    Logout
                                                </button>
                                            </>
                                        ) : (
                                            <div className="p-2 space-y-1">
                                                <Link
                                                    href="/login"
                                                    onClick={() => setIsDropdownOpen(false)}
                                                    className="block px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                                                >
                                                    Login
                                                </Link>
                                                <Link
                                                    href="/signup"
                                                    onClick={() => setIsDropdownOpen(false)}
                                                    className="block px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                                                >
                                                    Register
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
        </div>
    );
};

export default NavBar;
