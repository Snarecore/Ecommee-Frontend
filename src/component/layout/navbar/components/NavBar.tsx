import { RiArrowDropDownLine, RiArrowRightSLine } from "react-icons/ri";
import { Link, NavLink } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { useAtom } from "jotai";
import { nestedCategoriesAtom } from "../../../../store/global-store";

interface NestedCategory {
    id: string;
    name: string;
}

interface Category {
    name: string;
    link?: string;
}

const NAV_LINKS = [
    { path: "/", label: "Home" },
    { path: "/contact-us", label: "Contact" },
    { path: "/blog", label: "Blog" },
];

const NavBar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [menuCategories, setMenuCategories] = useState<Category[]>([]);
    const [isScrolled, setIsScrolled] = useState(false);
    const [nestedCategories] = useAtom(nestedCategoriesAtom);

    const dropdownRef = useRef<HTMLDivElement>(null);

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
                setIsMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (nestedCategories?.length > 0) {
            const transformed = (nestedCategories as unknown as NestedCategory[]).map((main) => ({
                name: main.name,
                link: `/shop?mainCategoryId=${main.id}&pageNumber=1`,
            }));
            setMenuCategories(transformed);
        }
    }, [nestedCategories]);

    return (
        <div className="relative">
            <div
                className={`w-full z-50 bg-[var(--color-green-secondary)] transition-all duration-300 ${isScrolled ? "fixed top-0 left-0 right-0 shadow-md" : "relative"
                    }`}
            >
                <div className="flex flex-col sm:flex-row max-w-screen-sm md:max-w-screen-md lg:max-w-screen-lg xl:max-w-screen-xl 2xl:max-w-screen-2xl mx-auto items-center px-6 sm:px-3 py-1.5 rounded-lg gap-4">
                    {/* Categories Dropdown */}
                    <div
                        className="relative group w-full sm:w-auto ml-2.5 mr-5"
                        onMouseEnter={() => setIsMenuOpen(true)}
                        onMouseLeave={() => setIsMenuOpen(false)}
                    >
                        <div className="flex items-center gap-2 py-2 hover:text-black rounded-md cursor-pointer transition-colors duration-200">
                            <span className="text-xl font-semibold">Categories</span>
                            <RiArrowDropDownLine className="text-3xl" />
                        </div>

                        {isMenuOpen && (
                            <div
                                ref={dropdownRef}
                                className="absolute top-full left-0 w-full sm:w-68 bg-[var(--color-green-secondary)] shadow-lg z-50 border border-[var(--color-green-primary)]"
                            >
                                <div className="py-2 max-h-xl overflow-y-auto">
                                    {menuCategories.map((category, idx) => (
                                        <Link
                                            key={`category-${idx}`}
                                            to={category.link || "#"}
                                            className="flex justify-between items-center px-5 py-3 text-[12px] hover:bg-[var(--color-green-primary)] hover:text-white transition-all duration-200"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            <span>{category.name}</span>
                                            <RiArrowRightSLine className="text-lg" />
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Nav Links */}
                    <ul className="hidden sm:flex gap-6 text-md font-semibold">
                        {NAV_LINKS.map(({ path, label }) => (
                            <NavLink
                                key={path}
                                to={path}
                                className={({ isActive }) =>
                                    `relative px-2 transition-all duration-300 font-semibold hover:underline hover:underline-offset-[6px] hover:decoration-2 ${isActive ? "underline underline-offset-[6px] decoration-2" : ""
                                    }`
                                }
                            >
                                {label}
                            </NavLink>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default NavBar;
