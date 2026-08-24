import Image from "next/image";
import { BiSearch } from "react-icons/bi";
import { useNavigate } from "../../../../routes-compat";
import Link from "next/link";
import { HiOutlineShoppingBag } from "react-icons/hi2";
import { useEffect, useState, useRef } from "react";
import { useAtom, useSetAtom } from "jotai";
import { wishlistCounterAtom } from "../../../../store/wishlist-store";
import { cartCounterAtom } from "../../../../store/cart-store";
import { FaRegHeart } from "react-icons/fa6";
import { FiSearch, FiSun, FiMoon, FiX, FiLoader } from "react-icons/fi";
import { useAPI } from "../../../../hooks/useApi";
import { productListQueryKey } from "../../../../config/query-key";
import apiConfig from "../../../../config/api.json";
import { useDebounce } from "../../../../hooks/useDebounce";
import { headerFooterAtom } from "../../../../store/global-store";
import { useAtomValue } from "jotai";
import { userAtom, logoutUserAtom } from "../../../../store/user-store";

interface SearchSuggestion {
  name: string;
  slug?: string;
  featuredImage?: string;
  price?: number;
}

const Menu = () => {
  const user = useAtomValue(userAtom);
  const [wishlistCount] = useAtom(wishlistCounterAtom);
  const [cartItemCount] = useAtom(cartCounterAtom);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [searchText, setSearchText] = useState("");
  const debouncedSearchText = useDebounce(searchText, 600);
  const [filteredSuggestions, setFilteredSuggestions] = useState<
    SearchSuggestion[]
  >([]);
  const [headerFooterData] = useAtom(headerFooterAtom);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const dataLimit = 20;
  const pageNumber = 1;
  const { usePaginatedQuery } = useAPI();

  const getProductListApiUrl = () => {
    let url = `${apiConfig.site.productListUrl}?page=${pageNumber}&limit=${dataLimit}`;
    if (debouncedSearchText.trim()) {
      url += `&searchKeyword=${encodeURIComponent(debouncedSearchText.trim())}`;
    }
    return url;
  };

  const {
    data: dataList,
    refetch: fetchData,
    isFetching,
  } = usePaginatedQuery({
    queryKey: [productListQueryKey, debouncedSearchText],
    url: getProductListApiUrl(),
    enabled: Boolean(debouncedSearchText.trim()),
  });

  useEffect(() => {
    if (debouncedSearchText.trim()) {
      fetchData();
    } else {
      setFilteredSuggestions([]);
    }
  }, [debouncedSearchText]);

  useEffect(() => {
    if (dataList?.length > 0) {
      setFilteredSuggestions(dataList as SearchSuggestion[]);
    } else if (debouncedSearchText.trim()) {
      setFilteredSuggestions([{ name: "No product found" }]);
    }
  }, [dataList]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const navigate = useNavigate();
  const setLogout = useSetAtom(logoutUserAtom);

  return (
    <nav className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 transition-colors duration-300 py-3 sm:py-4">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-3 sm:gap-6">
        {/* Brand Logo */}
        <Link href={"/"} className="flex items-center flex-shrink-0 group">
          <Image
            src={headerFooterData?.headerLogo || "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"}
            alt="Bazaarbound Logo"
            className="w-28 sm:w-36 h-8 sm:h-10 object-contain group-hover:scale-[1.02] transition-transform duration-200"
            width={240}
            height={60}
            priority
          />
        </Link>

        {/* Live Search Bar */}
        <div className="relative flex-1 max-w-2xl mx-auto" ref={dropdownRef}>
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Search products, categories..."
              className="w-full pl-11 pr-10 py-2.5 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/80 text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 text-xs sm:text-sm font-medium focus:outline-none focus:ring-4 focus:ring-emerald-500/15 focus:border-[var(--color-green-primary)] transition-all duration-300 shadow-xs"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none text-emerald-600 dark:text-emerald-400">
              <FiSearch className="text-lg" />
            </div>

            {searchText && (
              <button
                onClick={() => {
                  setSearchText("");
                  setFilteredSuggestions([]);
                }}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full transition-colors"
                title="Clear search"
              >
                <FiX className="text-base" />
              </button>
            )}
          </div>

          {/* Search Suggestions Dropdown */}
          {searchText && (
            <div
              className={`absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-2xl rounded-2xl z-[9999] overflow-hidden backdrop-blur-md transition-all duration-200 ${
                filteredSuggestions.length >= 4 ? "max-h-80" : "h-auto"
              }`}
            >
              {isFetching ? (
                <div className="px-4 py-8 text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-center flex flex-col items-center justify-center gap-2">
                  <FiLoader className="text-2xl text-[var(--color-green-primary)] animate-spin" />
                  <span>Searching catalog...</span>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-700/60 overflow-y-auto max-h-80">
                  {filteredSuggestions.map((item, index) =>
                    item.name === "No product found" ? (
                      <div
                        key={index}
                        className="px-4 py-8 text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-center flex flex-col items-center justify-center gap-2"
                      >
                        <FiSearch className="text-3xl text-gray-300 dark:text-gray-600 bg-gray-100 dark:bg-gray-700 w-12 h-12 rounded-full p-2.5" />
                        <span>No products matching &ldquo;{searchText}&rdquo;</span>
                      </div>
                    ) : (
                      <Link
                        href={`/product/${item.slug}`}
                        onClick={() => {
                          setSearchText("");
                          setFilteredSuggestions([]);
                        }}
                        key={index}
                        className="flex items-center gap-3.5 px-4 py-3 hover:bg-emerald-50/60 dark:hover:bg-gray-700/60 transition-colors cursor-pointer group"
                      >
                        <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden flex-shrink-0 border border-gray-200/60 dark:border-gray-600/60">
                          <Image
                            src={item.featuredImage || "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            width={100}
                            height={100}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 dark:text-gray-100 text-xs sm:text-sm truncate group-hover:text-[var(--color-green-primary)] transition-colors">
                            {item.name}
                          </p>
                          {item.price !== undefined && (
                            <span className="inline-block mt-0.5 font-bold text-xs text-[var(--color-green-primary)] dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-500/20">
                              ${item.price}
                            </span>
                          )}
                        </div>
                      </Link>
                    )
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Icon Buttons: Wishlist, Cart, Theme Toggle */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Wishlist Button */}
          <Link
            href="/wishlist"
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gray-50 dark:bg-gray-800/80 border border-gray-200/80 dark:border-gray-700/80 hover:border-emerald-500/50 flex items-center justify-center text-gray-700 dark:text-gray-200 hover:text-[var(--color-green-primary)] dark:hover:text-emerald-400 transition-all duration-200 shadow-xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 relative group"
            title="Wishlist"
            aria-label="Wishlist"
          >
            <FaRegHeart className="text-lg sm:text-xl group-hover:scale-110 transition-transform duration-200" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-gradient-to-r from-emerald-600 to-green-500 text-white font-bold text-[10px] min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center shadow-md border-2 border-white dark:border-gray-900 animate-in zoom-in duration-200">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart Button */}
          <Link
            href="/cart"
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gray-50 dark:bg-gray-800/80 border border-gray-200/80 dark:border-gray-700/80 hover:border-emerald-500/50 flex items-center justify-center text-gray-700 dark:text-gray-200 hover:text-[var(--color-green-primary)] dark:hover:text-emerald-400 transition-all duration-200 shadow-xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 relative group"
            title="Shopping Cart"
            aria-label="Shopping Cart"
          >
            <HiOutlineShoppingBag className="text-xl sm:text-2xl group-hover:scale-110 transition-transform duration-200" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-gradient-to-r from-emerald-600 to-green-500 text-white font-bold text-[10px] min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center shadow-md border-2 border-white dark:border-gray-900 animate-in zoom-in duration-200">
                {cartItemCount}
              </span>
            )}
          </Link>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gray-50 dark:bg-gray-800/80 border border-gray-200/80 dark:border-gray-700/80 hover:border-emerald-500/50 flex items-center justify-center text-gray-700 dark:text-gray-200 hover:text-[var(--color-green-primary)] dark:hover:text-emerald-400 transition-all duration-200 shadow-xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 cursor-pointer group"
            title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
            aria-label="Toggle Theme"
          >
            {theme === "light" ? (
              <FiMoon className="text-lg sm:text-xl group-hover:rotate-12 transition-transform duration-200" />
            ) : (
              <FiSun className="text-lg sm:text-xl text-amber-400 group-hover:rotate-45 transition-transform duration-200" />
            )}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Menu;
