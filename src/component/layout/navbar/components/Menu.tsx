import Image from "next/image";
import { BiSearch } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import Link from "next/link";;
import { IoPersonCircleSharp } from "react-icons/io5";
import { HiOutlineShoppingBag } from "react-icons/hi";
import { useEffect, useState, useRef } from "react";
import { useAtom, useSetAtom } from "jotai";
import { wishlistCounterAtom } from "../../../../store/wishlist-store";
import { cartCounterAtom } from "../../../../store/cart-store";
import { FaRegHeart, FaRegUser, FaUser } from "react-icons/fa6";
import { FiSearch, FiSun, FiMoon } from "react-icons/fi";
import { useAPI } from "../../../../hooks/useApi";
import { productListQueryKey } from "../../../../config/query-key";
import apiConfig from "../../../../config/api.json";
import { useDebounce } from "../../../../hooks/useDebounce";
import { headerFooterAtom } from "../../../../store/global-store";
import { useAtomValue } from "jotai";
import { userAtom, logoutUserAtom } from "../../../../store/user-store";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import { RiLogoutCircleLine } from "react-icons/ri";

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
  const handleLogout = () => {
    setLogout(() => navigate("/login"));
  };

  return (
    <nav className="py-4 max-w-screen-2xl mx-auto px-4 flex justify-between items-center gap-3 sm:gap-6">
      <Link href={"/"} className="flex justify-center sm:justify-start">
        <Image src={headerFooterData?.headerLogo || "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"} alt="Bazaarbound Logo" className="w-28 sm:w-36 h-8 sm:h-10 object-contain" width={240} height={60} />
      </Link>

      <div className="relative flex-1">
        <input
          type="text"
          placeholder="Search products..."
          className="w-full px-4 py-2.5 rounded-full pl-12 pr-4 focus:outline-none focus:ring-1 border border-[var(--color-green-primary)] text-[var(--color-green-primary)] placeholder:text-[var(--color-green-primary)] text-sm font-semibold transition-colors duration-300 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <BiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-green-primary)] text-xl cursor-pointer" />

        {searchText && (
          <div
            className={`absolute top-full mt-2 w-full bg-white dark:bg-gray-800 border border-[var(--color-green-secondary)] dark:border-gray-700 shadow-md rounded-md z-[99999999] overflow-y-auto ${filteredSuggestions.length >= 4 ? "max-h-60" : "h-fit"
              }`}
          >
            {isFetching ? (
              <div className="px-4 py-6 text-sm text-gray-500 text-center flex flex-col items-center justify-center gap-2">
                <FiSearch className="text-2xl bg-gray-100 w-10 h-10 rounded-full p-2 animate-spin" />
                <span>Searching...</span>
              </div>
            ) : (
              filteredSuggestions.map((item, index) =>
                item.name === "No product found" ? (
                  <div
                    key={index}
                    className="px-4 py-6 text-sm text-gray-500 text-center flex flex-col items-center justify-center gap-2"
                  >
                    <FiSearch className="text-2xl bg-gray-100 w-10 h-10 rounded-full p-2" />
                    <span>No product found</span>
                  </div>
                ) : (
                  <Link
                    href={`/product/${item.slug}`}
                    onClick={() => {
                      setSearchText("");
                      setFilteredSuggestions([]);
                    }}
                    key={index}
                  >
                    <div className="flex items-center gap-4 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                      <Image src={item.featuredImage || "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"} alt={item.name} className="w-[15%] md:w-[70px] h-[50px] md:h-[70px] object-cover" width={500} height={500} />
                      <div className="flex flex-col gap-2">
                        <p className="font-semibold text-[var(--color-green-primary)] text-xs md:text-[15px]">
                          {item.name}
                        </p>
                        <p className="font-bold text-[var(--color-green-primary)] text-[10px] md:text-[12px] mt-[-2px]">
                          {`$${item.price}`}
                        </p>
                      </div>
                    </div>
                  </Link>
                )
              )
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-6 sm:gap-6 text-sm">
        <Link href="/wishlist" className="group relative">
          <div className="flex flex-col items-center gap-1 md:ml-16">
            <FaRegHeart className="text-xl text-[var(--color-icon)]" />
            {wishlistCount > 0 && (
              <span className="absolute -top-2.5 -right-2.5 bg-[var(--color-green-primary)] text-white text-[10px] font-medium flex items-center justify-center h-4.5 w-4.5 rounded-full shadow-md">
                {wishlistCount}
              </span>
            )}
          </div>
        </Link>

        <Link href="/cart" className="group relative">
          <div className="flex flex-col items-center gap-1">
            <HiOutlineShoppingBag className="text-2xl text-[var(--color-icon)]" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-[var(--color-green-primary)] text-white text-[10px] font-medium flex items-center justify-center h-4.5 w-4.5 rounded-full shadow-md">
                {cartItemCount}
              </span>
            )}
          </div>
        </Link>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-[var(--color-icon)] dark:text-gray-300 transition-colors duration-200 focus:outline-none"
          title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
        >
          {theme === "light" ? (
            <FiMoon className="text-xl" />
          ) : (
            <FiSun className="text-xl" />
          )}
        </button>
        {/* 
				<div className="hidden sm:block">
					<div className="flex items-center gap-2 text-[var(--color-icon)]">
						<FaRegUser className="text-xl cursor-pointer" />
						<div className="flex gap-1">
							<Link href="/login">Login</Link>
							<span>|</span>
							<Link href="/signup">Register</Link>
						</div>
					</div>
				</div> */}

      </div>
    </nav>
  );
};

export default Menu;
