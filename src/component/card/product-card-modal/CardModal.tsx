import { useState, useEffect, useRef } from "react";
import { MdKeyboardArrowDown, MdKeyboardArrowRight } from "react-icons/md";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

interface MenuItem {
    id: string;
    title: string;
    path?: string;
    children?: MenuItem[];
}

const menuItems: MenuItem[] = [
    {
        id: "1",
        title: "Artwork",
        children: [
            {
                id: "1-1",
                title: "Painting",
                children: [
                    {
                        id: "1-1-1",
                        title: "Oil Painting",
                        path: "/artwork/painting/oil-painting",
                    },
                    {
                        id: "1-1-2",
                        title: "Digital Painting",
                        path: "/artwork/painting/digital-painting",
                    },
                ],
            },
            {
                id: "1-2",
                title: "Watercolor Painting",
                children: [
                    { id: "1-2-1", title: "Abstract Watercolor" },
                    { id: "1-2-2", title: "Realistic Watercolor" },
                ],
            },
        ],
    },
    {
        id: "2",
        title: "Developers",
        children: [
            {
                id: "2-1",
                title: "Script & Code",
                children: [
                    { id: "2-1-1", title: "PHP Script" },
                    { id: "2-1-2", title: "Python Script" },
                ],
            },
            {
                id: "2-2",
                title: "Mobile Application",
                children: [
                    { id: "2-2-1", title: "IOS Development" },
                    { id: "2-2-2", title: "Cross-platform Development" },
                ],
            },
        ],
    },
];

const PriceFilter = () => {
    const minLimit = 100;
    const maxLimit = 1000;
    const [minPrice, setMinPrice] = useState(200);
    const [maxPrice, setMaxPrice] = useState(800);
    const sliderRef = useRef<HTMLDivElement>(null);

    const handleDrag = (event: MouseEvent, type: "min" | "max") => {
        if (!sliderRef.current) return;

        const sliderRect = sliderRef.current.getBoundingClientRect();
        const offsetX = event.clientX - sliderRect.left;
        const percentage =
            (offsetX / sliderRect.width) * (maxLimit - minLimit) + minLimit;

        if (type === "min" && percentage < maxPrice - 20) {
            setMinPrice(Math.max(minLimit, Math.min(percentage, maxPrice - 20)));
        } else if (type === "max" && percentage > minPrice + 20) {
            setMaxPrice(Math.min(maxLimit, Math.max(percentage, minPrice + 20)));
        }
    };

    return (
        <div className="p-4 border-t border-gray-300 mt-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Filter by Price
            </h3>
            <div
                ref={sliderRef}
                className="relative w-full h-1 bg-gray-300 rounded-md"
            >
                <div
                    className="absolute h-1 bg-blue-600 rounded-md"
                    style={{
                        left: `${((minPrice - minLimit) / (maxLimit - minLimit)) * 100}%`,
                        right: `${100 - ((maxPrice - minLimit) / (maxLimit - minLimit)) * 100
                            }%`,
                    }}
                ></div>

                <div
                    className="absolute w-3 h-3 bg-blue-600 rounded-full cursor-pointer -top-1"
                    style={{
                        left: `${((minPrice - minLimit) / (maxLimit - minLimit)) * 100}%`,
                    }}
                    onMouseDown={(event) => {
                        event.preventDefault();
                        const handleMouseMove = (e: MouseEvent) => handleDrag(e, "min");
                        document.addEventListener('mousemove', handleMouseMove);
                        document.addEventListener('mouseup', () => {
                            document.removeEventListener('mousemove', handleMouseMove);
                        }, { once: true });
                    }}
                ></div>

                <div
                    className="absolute w-3 h-3 bg-blue-600 rounded-full cursor-pointer -top-1"
                    style={{
                        left: `${((maxPrice - minLimit) / (maxLimit - minLimit)) * 100}%`,
                    }}
                    onMouseDown={(event) => {
                        event.preventDefault();
                        const handleMouseMove = (e: MouseEvent) => handleDrag(e, "max");
                        document.addEventListener('mousemove', handleMouseMove);
                        document.addEventListener('mouseup', () => {
                            document.removeEventListener('mousemove', handleMouseMove);
                        }, { once: true });
                    }}
                ></div>
            </div>

            <div className="mt-4 flex items-center text-gray-700 text-sm">
                <span>Price: </span>
                <span className="ml-1 font-semibold">${Math.round(minPrice)}</span>
                <span className="mx-1">-</span>
                <span className="font-semibold">${Math.round(maxPrice)}</span>
            </div>
        </div>
    );
};

const NestedMenuItem = ({
    item,
    level = 0,
    activePath,
    setOpenItems,
    openItems,
}: {
    item: MenuItem;
    level?: number;
    activePath: string;
    setOpenItems: React.Dispatch<React.SetStateAction<string[]>>;
    openItems: string[];
}) => {
    const hasChildren = item.children && item.children.length > 0;
    const router = useRouter();
    const isOpen = openItems.includes(item.id);
    const isActive = item.path === activePath;

    const handleClick = () => {
        if (hasChildren) {
            setOpenItems((prev) =>
                prev.includes(item.id)
                    ? prev.filter((id) => id !== item.id)
                    : [...prev, item.id]
            );
        } else if (item.path) {
            router.push(item.path);
        }
    };

    return (
        <>
            <div
                className={`flex items-center justify-between w-full px-4 py-2 cursor-pointer group transition-all duration-300 ease-in-out rounded-md 
                    ${isActive
                        ? "bg-blue-700 text-white shadow-md"
                        : "text-gray-700 hover:bg-blue-500 hover:text-white"
                    }`}
                style={{ paddingLeft: `${level * 16 + 16}px` }}
                onClick={handleClick}
            >
                <span className="font-medium flex items-center">{item.title}</span>
                {hasChildren && (
                    <span>
                        {isOpen ? (
                            <MdKeyboardArrowDown className="w-5 h-5 transition-transform transform rotate-180" />
                        ) : (
                            <MdKeyboardArrowRight className="w-5 h-5 text-gray-500 group-hover:text-white transition-transform transform rotate-0" />
                        )}
                    </span>
                )}
            </div>

            {hasChildren && (
                <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-96" : "max-h-0"
                        }`}
                >
                    {item.children?.map((child) => (
                        <NestedMenuItem
                            key={child.id}
                            item={child}
                            level={level + 1}
                            activePath={activePath}
                            setOpenItems={setOpenItems}
                            openItems={openItems}
                        />
                    ))}

                </div>
            )}
        </>
    );
};

const CardModal = () => {
    const pathname = usePathname();
    const [openItems, setOpenItems] = useState<string[]>([]);
    const [activePath, setActivePath] = useState(pathname || "/");

    useEffect(() => {
        setActivePath(pathname || "/");
    }, [pathname]);

    useEffect(() => {
        const findParentIds = (items: MenuItem[], targetPath: string): string[] => {
            for (const item of items) {
                if (item.path === targetPath) return [item.id];
                if (item.children) {
                    const childResult = findParentIds(item.children, targetPath);
                    if (childResult.length > 0) return [item.id, ...childResult];
                }
            }
            return [];
        };

        setOpenItems(findParentIds(menuItems, activePath));
    }, [activePath]);

    return (
        <div className="w-68 bg-gradient-to-b from-gray-100 to-gray-300 border-l border-gray-300 shadow-lg h-screen overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-300">
                <h2 className="text-lg font-semibold text-blue-800">
                    Product Category
                </h2>
            </div>
            <nav className="mt-2">
                <div className="pb-8">
                    <Link href={"/all-categories"} className="p-2">
                        All Categories
                    </Link>
                </div>
                {menuItems.map((item) => (
                    <NestedMenuItem
                        key={item.id}
                        item={item}
                        activePath={activePath}
                        setOpenItems={setOpenItems}
                        openItems={openItems}
                    />
                ))}
            </nav>

            <PriceFilter />
        </div>
    );
};

export default CardModal;
