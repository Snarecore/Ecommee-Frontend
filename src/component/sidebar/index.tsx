// import { useAtom } from "jotai";
// import { useState, useEffect } from "react";
// import { useLocation } from "react-router-dom";
import Link from "next/link";;
// import { isLoadingAtom, nestedCategoriesAtom } from "../../store/global-store";
// import ProductCategorySkeleton from "../skeleton/ProductCategorySkeleton";
// import { MainCategory, FirstCategory, SecondCategory, ThirdCategory } from "../../interface/nested-category.interface";
// import useShop from "../../hooks/useShop";

// type CategoryLevel = MainCategory | FirstCategory | SecondCategory | ThirdCategory;

// interface NestedMenuItemProps {
// 	item: CategoryLevel;
// 	level?: number;
// 	activePath: string;
// 	openItems: string[];
// 	setOpenItems: React.Dispatch<React.SetStateAction<string[]>>;
// 	selectedCategoryId: string | null;
// 	setSelectedCategoryId: React.Dispatch<React.SetStateAction<string | null>>;
// }

// const getChildren = (category: CategoryLevel): CategoryLevel[] | undefined => {
// 	if ("firstCategories" in category) return category.firstCategories;
// 	if ("secondCategories" in category) return category.secondCategories;
// 	if ("thirdCategories" in category) return category.thirdCategories;
// 	return undefined;
// };

// const NestedMenuItem = ({
// 	item,
// 	level = 0,
// 	activePath,
// 	openItems,
// 	setOpenItems,
// 	selectedCategoryId,
// 	setSelectedCategoryId
// }: NestedMenuItemProps) => {
// 	const { handleCategoryFilter } = useShop();
// 	const children = getChildren(item);
// 	const hasChildren = !!children?.length;
// 	const isSelected = selectedCategoryId === item.id;

// 	const handleSelection = () => {
// 		handleCategoryFilter(item);
// 		setSelectedCategoryId(prev => (prev === item.id ? null : item.id));
// 		if (hasChildren) {
// 			setOpenItems(prev =>
// 				prev.includes(item.id) ? prev.filter(id => id !== item.id) : [...prev, item.id]
// 			);
// 		}
// 	};

// 	return (
// 		<>
// 			<div
// 				className={`flex items-center justify-between w-full px-4 py-2 cursor-pointer group transition-all duration-300 ease-in-out rounded-md`}
// 				style={{ paddingLeft: `${level * 16 + 16}px` }}
// 				onClick={handleSelection}
// 			>
// 				<div className="flex items-center justify-between w-full">
// 					<div className="flex items-center gap-2">
// 						<input
// 							type="radio"
// 							checked={isSelected}
// 							onChange={handleSelection}
// 							onClick={(e) => e.stopPropagation()}
// 							className={`w-4 h-4 cursor-pointer appearance-none ${isSelected ? "checked:border-[var(--color-green-primary)] checked:bg-[var(--color-green-primary)] checked:after:block after:hidden after:content-[''] after:w-2 after:h-2 after:rounded-full after:bg-white after:mx-auto after:my-auto after:mt-1 after:transition-all" : "bg-[#EAEAEB]"}`}
// 						/>
// 						<p className={`text-sm transition-colors duration-200 ${level === 0
// 							? "text-black font-semibold"
// 							: isSelected
// 								? ""
// 								: ""
// 							}`}>
// 							{item.name}
// 						</p>
// 					</div>
// 				</div>
// 			</div>

// 			{hasChildren && (
// 				<div className={`transition-all duration-300 ease-in-out max-h-full`}>
// 					{children.map((child) => (
// 						<NestedMenuItem
// 							// key={child.id}
// 							item={child}
// 							level={level + 1}
// 							activePath={activePath}
// 							openItems={openItems}
// 							setOpenItems={setOpenItems}
// 							selectedCategoryId={selectedCategoryId}
// 							setSelectedCategoryId={setSelectedCategoryId}
// 						/>
// 					))}
// 				</div>
// 			)}
// 		</>
// 	);
// };

// interface SidebarProps {
// 	selectedCategoryId: string | null;
// 	setSelectedCategoryId?: React.Dispatch<React.SetStateAction<string | null>>;
// }

// const Sidebar = ({ selectedCategoryId, setSelectedCategoryId }: SidebarProps) => {
// 	const location = useLocation();
// 	const [openItems, setOpenItems] = useState<string[]>([]);
// 	const [nestedCategories] = useAtom(nestedCategoriesAtom);
// 	const [isLoading] = useAtom(isLoadingAtom);

// 	useEffect(() => {
// 		const extractAllCategoryIds = (categories: any[]): string[] => {
// 			let allIds: string[] = [];
// 			for (const category of categories) {
// 				allIds.push(category.id);
// 				const subCategories = getChildren(category);
// 				if (subCategories) {
// 					allIds = [...allIds, ...extractAllCategoryIds(subCategories)];
// 				}
// 			}
// 			return allIds;
// 		};

// 		if (nestedCategories) {
// 			const expandedCategoryIds = extractAllCategoryIds(nestedCategories);
// 			setOpenItems(expandedCategoryIds);
// 		}
// 	}, [nestedCategories]);

// 	return (
// 		<div className="w-68 bg-[#F8F8F8] border-l border-gray-300 shadow-lg h-full overflow-y-auto sticky top-0">
// 			<div className="px-6 py-4 border-b border-gray-300">
// 				<p className="text-lg text-center font-semibold">
// 					Product Category
// 				</p>
// 			</div>

// 			{isLoading ? (
// 				<ProductCategorySkeleton />
// 			) : (
// 				<nav className="mt-2">
// 					<div className="pb-2 flex items-center justify-between px-4 py-2">
// 						<div className="flex items-center gap-2 cursor-pointer">
// 							<input
// 								type="radio"
// 								checked={selectedCategoryId === null}
// 								onChange={() => setSelectedCategoryId?.(null)}
// 								onClick={(e) => e.stopPropagation()}
// 								className={`w-4 h-4 cursor-pointer appearance-none ${selectedCategoryId === null
// 										? "checked:border-[var(--color-green-primary)] checked:bg-[var(--color-green-primary)] checked:after:block after:hidden after:content-[''] after:w-2 after:h-2 after:rounded-full after:bg-white after:mx-auto after:my-auto after:mt-1 after:transition-all"
// 										: "bg-[#EAEAEB]"
// 									}`}
// 							/>
// 							<Link
// 								href={"/all-categories"}
// 								className={`text-sm font-semibold`}
// 							>
// 								All Categories
// 							</Link>
// 						</div>
// 					</div>

// 					{nestedCategories.map((category) => (
// 						<NestedMenuItem
// 							// @ts-ignore
// 							key={category.id}
// 							// @ts-ignore
// 							item={category}
// 							activePath={location.pathname}
// 							openItems={openItems}
// 							setOpenItems={setOpenItems}
// 							selectedCategoryId={selectedCategoryId}
// 							setSelectedCategoryId={setSelectedCategoryId!}
// 						/>
// 					))}

// 				</nav>
// 			)}
// 		</div>
// 	);
// };

// export default Sidebar;

// import { useAtom } from "jotai";
// import { useMemo, useState } from "react";
// import { useLocation } from "react-router-dom";
// import Link from "next/link";
// import { isLoadingAtom, nestedCategoriesAtom } from "../../store/global-store";
// import ProductCategorySkeleton from "../skeleton/ProductCategorySkeleton";
// import {
//   MainCategory,
//   FirstCategory,
//   SecondCategory,
//   ThirdCategory,
// } from "../../interface/nested-category.interface";
// import useShop from "../../hooks/useShop";

// type CategoryLevel = MainCategory | FirstCategory | SecondCategory | ThirdCategory;

// interface NestedMenuItemProps {
//   item: CategoryLevel;
//   level?: number; // 0=Main, 1=First, 2=Second, 3=Third
//   activePath: string;
//   openPath: string[]; // one id per level (strings)
//   setOpenPath: React.Dispatch<React.SetStateAction<string[]>>;
//   selectedCategoryId: string | null;
//   setSelectedCategoryId?: React.Dispatch<React.SetStateAction<string | null>>; // <-- optional
// }

// /** Robust children getter: supports camelCase, snake_case, and generic 'children'. */
// const getChildren = (category: any): CategoryLevel[] | undefined => {
//   // Exact interface keys
//   if (Array.isArray(category?.firstCategories)) return category.firstCategories;
//   if (Array.isArray(category?.secondCategories)) return category.secondCategories;
//   if (Array.isArray(category?.thirdCategories)) return category.thirdCategories;

//   // snake_case fallbacks
//   if (Array.isArray(category?.first_categories)) return category.first_categories;
//   if (Array.isArray(category?.second_categories)) return category.second_categories;
//   if (Array.isArray(category?.third_categories)) return category.third_categories;

//   // generic children fallback
//   if (Array.isArray(category?.children)) return category.children;

//   return undefined;
// };

// const NestedMenuItem = ({
//   item,
//   level = 0,
//   activePath,
//   openPath,
//   setOpenPath,
//   selectedCategoryId,
//   setSelectedCategoryId,
// }: NestedMenuItemProps) => {
//   const { handleCategoryFilter } = useShop();
//   const nodeId = String((item as any).id);

//   const children = getChildren(item);
//   const hasChildren = !!children?.length;
//   const isSelected = selectedCategoryId === nodeId;

//   // only the node whose id matches openPath[level] is "open"
//   const isOpenAtThisLevel = openPath[level] === nodeId;

//   const expandBranch = () => {
//     setOpenPath((prev) => {
//       const next = prev.slice(0, level);
//       next[level] = nodeId;
//       return next; // deeper levels collapse
//     });
//   };

//   const handleSelection = () => {
//     // Guard optional setter (prevents crash if not provided)
//     setSelectedCategoryId?.(nodeId);

//     // If it has children, expand branch only (don't filter yet)
//     if (hasChildren) {
//       expandBranch();
//       return;
//     }

//     // Leaf: expand to here and run filter
//     expandBranch();
//     handleCategoryFilter(item);
//   };

//   return (
//     <>
//       <div
//         className="flex items-center justify-between w-full px-4 py-2 cursor-pointer group transition-all duration-300 ease-in-out rounded-md"
//         style={{ paddingLeft: `${level * 16 + 16}px` }}
//         onClick={handleSelection}
//       >
//         <div className="flex items-center justify-between w-full">
//           <div className="flex items-center gap-2">
//             <input
//               type="radio"
//               checked={isSelected}
//               onChange={handleSelection}
//               onClick={(e) => e.stopPropagation()}
//               className={`w-4 h-4 cursor-pointer appearance-none ${
//                 isSelected
//                   ? "checked:border-[var(--color-green-primary)] checked:bg-[var(--color-green-primary)] checked:after:block after:hidden after:content-[''] after:w-2 after:h-2 after:rounded-full after:bg-white after:mx-auto after:my-auto after:mt-1 after:transition-all"
//                   : "bg-[#EAEAEB]"
//               }`}
//             />
//             <p
//               className={`text-sm transition-colors duration-200 ${
//                 level === 0 ? "text-black font-semibold" : ""
//               }`}
//             >
//               {item.name}
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Render children ONLY for the node that is open at this level */}
//       {hasChildren && isOpenAtThisLevel && (
//         <div className="transition-all duration-300 ease-in-out max-h-full">
//           {children!.map((child: any) => (
//             <NestedMenuItem
//               key={String(child.id)}
//               item={child}
//               level={level + 1}
//               activePath={activePath}
//               openPath={openPath}
//               setOpenPath={setOpenPath}
//               selectedCategoryId={selectedCategoryId}
//               setSelectedCategoryId={setSelectedCategoryId} // still optional
//             />
//           ))}
//         </div>
//       )}
//     </>
//   );
// };

// interface SidebarProps {
//   selectedCategoryId: string | null;
//   setSelectedCategoryId?: React.Dispatch<React.SetStateAction<string | null>>; // optional
// }

// const Sidebar = ({ selectedCategoryId, setSelectedCategoryId }: SidebarProps) => {
//   const location = useLocation();
//   const [openPath, setOpenPath] = useState<string[]>([]); // replaces openItems
//   const [nestedCategories] = useAtom(nestedCategoriesAtom);
//   const [isLoading] = useAtom(isLoadingAtom);

//   const topCategories = useMemo<MainCategory[]>(
//     () => ((nestedCategories ?? []) as unknown as MainCategory[]),
//     [nestedCategories]
//   );

//   const resetAll = () => {
//     setSelectedCategoryId?.(null);
//     setOpenPath([]); // collapse everything
//   };

//   return (
//     <div className="w-68 bg-[#F8F8F8] border-l border-gray-300 shadow-lg h-full overflow-y-auto sticky top-0">
//       <div className="px-6 py-4 border-b border-gray-300">
//         <p className="text-lg text-center font-semibold">Product Category</p>
//       </div>

//       {isLoading ? (
//         <ProductCategorySkeleton />
//       ) : (
//         <nav className="mt-2">
//           <div className="pb-2 flex items-center justify-between px-4 py-2">
//             <div className="flex items-center gap-2 cursor-pointer">
//               <input
//                 type="radio"
//                 checked={selectedCategoryId === null}
//                 onChange={resetAll}
//                 onClick={(e) => e.stopPropagation()}
//                 className={`w-4 h-4 cursor-pointer appearance-none ${
//                   selectedCategoryId === null
//                     ? "checked:border-[var(--color-green-primary)] checked:bg-[var(--color-green-primary)] checked:after:block after:hidden after:content-[''] after:w-2 after:h-2 after:rounded-full after:bg-white after:mx-auto after:my-auto after:mt-1 after:transition-all"
//                     : "bg-[#EAEAEB]"
//                 }`}
//               />
//               <Link href={"/all-categories"} className="text-sm font-semibold">
//                 All Categories
//               </Link>
//             </div>
//           </div>

//           {topCategories.map((category) => (
//             <NestedMenuItem
//               key={String((category as any).id)}
//               item={category}
//               activePath={location.pathname}
//               openPath={openPath}
//               setOpenPath={setOpenPath}
//               selectedCategoryId={selectedCategoryId}
//               setSelectedCategoryId={setSelectedCategoryId} // pass through (may be undefined)
//             />
//           ))}
//         </nav>
//       )}
//     </div>
//   );
// };

// export default Sidebar;



// sidebar with collapsable

// import { useAtom } from "jotai";
// import { useEffect, useMemo, useState } from "react";
// import { useLocation } from "react-router-dom";
// import Link from "next/link";
// import { isLoadingAtom, nestedCategoriesAtom } from "../../store/global-store";
// import ProductCategorySkeleton from "../skeleton/ProductCategorySkeleton";
// import {
//   MainCategory,
//   FirstCategory,
//   SecondCategory,
//   ThirdCategory,
// } from "../../interface/nested-category.interface";
// import useShop from "../../hooks/useShop";

// type CategoryLevel = MainCategory | FirstCategory | SecondCategory | ThirdCategory;

// interface NestedMenuItemProps {
//   item: CategoryLevel;
//   level?: number; // 0=Main, 1=First, 2=Second, 3=Third
//   activePath: string;
//   openPath: string[]; // one id per level (strings)
//   setOpenPath: React.Dispatch<React.SetStateAction<string[]>>;
//   selectedCategoryId: string | null;
//   setSelectedCategoryId?: React.Dispatch<React.SetStateAction<string | null>>; // optional
// }

// /** Robust children getter: supports camelCase, snake_case, and generic 'children'. */
// const getChildren = (category: any): CategoryLevel[] | undefined => {
//   // camelCase (your interfaces)
//   if (Array.isArray(category?.firstCategories)) return category.firstCategories;
//   if (Array.isArray(category?.secondCategories)) return category.secondCategories;
//   if (Array.isArray(category?.thirdCategories)) return category.thirdCategories;

//   // snake_case fallbacks
//   if (Array.isArray(category?.first_categories)) return category.first_categories;
//   if (Array.isArray(category?.second_categories)) return category.second_categories;
//   if (Array.isArray(category?.third_categories)) return category.third_categories;

//   // generic fallback
//   if (Array.isArray(category?.children)) return category.children;

//   return undefined;
// };

// /** Find the full ancestor path to a target id (as strings). */
// const findPathToId = (nodes: any[], targetId: string): string[] | null => {
//   const t = String(targetId);
//   for (const node of nodes ?? []) {
//     const id = String(node?.id);
//     if (id === t) return [id];

//     const children = getChildren(node);
//     if (Array.isArray(children) && children.length) {
//       const childPath = findPathToId(children as any[], t);
//       if (childPath) return [id, ...childPath];
//     }
//   }
//   return null;
// };

// const NestedMenuItem = ({
//   item,
//   level = 0,
//   activePath,
//   openPath,
//   setOpenPath,
//   selectedCategoryId,
//   setSelectedCategoryId,
// }: NestedMenuItemProps) => {
//   const { handleCategoryFilter } = useShop();
//   const nodeId = String((item as any).id);

//   const children = getChildren(item);
//   const hasChildren = !!children?.length;
//   const isSelected = selectedCategoryId === nodeId;

//   // only the node whose id matches openPath[level] is "open"
//   const isOpenAtThisLevel = openPath[level] === nodeId;

//   const expandBranch = () => {
//     setOpenPath((prev) => {
//       const next = prev.slice(0, level);
//       next[level] = nodeId;
//       return next; // deeper levels collapse
//     });
//   };

//   const handleSelection = () => {
//     // 1) select current node
//     setSelectedCategoryId?.(nodeId);

//     // 2) expand this branch (even if leaf, to show its position)
//     expandBranch();

//     // 3) run your filter for every level (as requested)
//     handleCategoryFilter(item);
//   };

//   return (
//     <>
//       <div
//         className="flex items-center justify-between w-full px-4 py-2 cursor-pointer group transition-all duration-300 ease-in-out rounded-md"
//         style={{ paddingLeft: `${level * 16 + 16}px` }}
//         onClick={handleSelection}
//       >
//         <div className="flex items-center justify-between w-full">
//           <div className="flex items-center gap-2">
//             <input
//               type="radio"
//               checked={isSelected}
//               onChange={handleSelection}
//               onClick={(e) => e.stopPropagation()}
//               className={`w-4 h-4 cursor-pointer appearance-none ${
//                 isSelected
//                   ? "checked:border-[var(--color-green-primary)] checked:bg-[var(--color-green-primary)] checked:after:block after:hidden after:content-[''] after:w-2 after:h-2 after:rounded-full after:bg-white after:mx-auto after:my-auto after:mt-1 after:transition-all"
//                   : "bg-[#EAEAEB]"
//               }`}
//             />
//             <p
//               className={`text-sm transition-colors duration-200 ${
//                 level === 0 ? "text-black font-semibold" : ""
//               }`}
//             >
//               {item.name}
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Render children ONLY for the node that is open at this level */}
//       {hasChildren && isOpenAtThisLevel && (
//         <div className="transition-all duration-300 ease-in-out max-h-full">
//           {children!.map((child: any) => (
//             <NestedMenuItem
//               key={String(child.id)}
//               item={child}
//               level={level + 1}
//               activePath={activePath}
//               openPath={openPath}
//               setOpenPath={setOpenPath}
//               selectedCategoryId={selectedCategoryId}
//               setSelectedCategoryId={setSelectedCategoryId}
//             />
//           ))}
//         </div>
//       )}
//     </>
//   );
// };

// interface SidebarProps {
//   selectedCategoryId: string | null;
//   setSelectedCategoryId?: React.Dispatch<React.SetStateAction<string | null>>;
// }

// const Sidebar = ({ selectedCategoryId, setSelectedCategoryId }: SidebarProps) => {
//   const location = useLocation();
//   const [openPath, setOpenPath] = useState<string[]>([]); // single expanded chain
//   const [nestedCategories] = useAtom(nestedCategoriesAtom);
//   const [isLoading] = useAtom(isLoadingAtom);

//   const topCategories = useMemo<MainCategory[]>(
//     () => ((nestedCategories ?? []) as unknown as MainCategory[]),
//     [nestedCategories]
//   );

//   // Auto-expand when a category is preselected (e.g., navigated from Home)
//   useEffect(() => {
//     if (!selectedCategoryId || !topCategories?.length) return;
//     const path = findPathToId(topCategories as any[], String(selectedCategoryId));
//     if (path && path.length) {
//       setOpenPath(path);
//     }
//   }, [selectedCategoryId, topCategories]);

//   const resetAll = () => {
//     setSelectedCategoryId?.(null);
//     setOpenPath([]);
//   };

//   return (
//     <div className="w-68 bg-[#F8F8F8] border-l border-gray-300 shadow-lg h-full overflow-y-auto sticky top-0">
//       <div className="px-6 py-4 border-b border-gray-300">
//         <p className="text-lg text-center font-semibold">Product Category</p>
//       </div>

//       {isLoading ? (
//         <ProductCategorySkeleton />
//       ) : (
//         <nav className="mt-2">
//           <div className="pb-2 flex items-center justify-between px-4 py-2">
//             <div className="flex items-center gap-2 cursor-pointer">
//               <input
//                 type="radio"
//                 checked={selectedCategoryId === null}
//                 onChange={resetAll}
//                 onClick={(e) => e.stopPropagation()}
//                 className={`w-4 h-4 cursor-pointer appearance-none ${
//                   selectedCategoryId === null
//                     ? "checked:border-[var(--color-green-primary)] checked:bg-[var(--color-green-primary)] checked:after:block after:hidden after:content-[''] after:w-2 after:h-2 after:rounded-full after:bg-white after:mx-auto after:my-auto after:mt-1 after:transition-all"
//                     : "bg-[#EAEAEB]"
//                 }`}
//               />
//               <Link href={"/all-categories"} className="text-sm font-semibold">
//                 All Categories
//               </Link>
//             </div>
//           </div>

//           {topCategories.map((category) => (
//             <NestedMenuItem
//               key={String((category as any).id)}
//               item={category}
//               activePath={location.pathname}
//               openPath={openPath}
//               setOpenPath={setOpenPath}
//               selectedCategoryId={selectedCategoryId}
//               setSelectedCategoryId={setSelectedCategoryId}
//             />
//           ))}
//         </nav>
//       )}
//     </div>
//   );
// };

// export default Sidebar;


// sidebar with sorting

import { useAtom } from "jotai";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
// import Link from "next/link";
import { isLoadingAtom, nestedCategoriesAtom } from "../../store/global-store";
import ProductCategorySkeleton from "../skeleton/ProductCategorySkeleton";
import {
  MainCategory,
  FirstCategory,
  SecondCategory,
} from "../../interface/nested-category.interface";
import useShop from "../../hooks/useShop";

type CategoryLevel = MainCategory | FirstCategory | SecondCategory;

interface NestedMenuItemProps {
  item: CategoryLevel;
  level?: number; // 0=Main, 1=First, 2=Second, 3=Third
  activePath: string;
  openPath: string[]; // one id per level (strings)
  setOpenPath: React.Dispatch<React.SetStateAction<string[]>>;
  selectedCategoryId: string | null;
  setSelectedCategoryId?: React.Dispatch<React.SetStateAction<string | null>>; // optional
  onReorder: (id: string, level: number) => void; // move clicked node to top (skips level 3)
}

/** Small inline chevron icon (right-pointing). */
const Chevron = ({ className = "" }: { className?: string }) => (
  <svg
    viewBox="0 0 20 20"
    fill="currentColor"
    className={`w-4 h-4 transition-transform duration-200 text-gray-500 dark:text-gray-400 ${className}`}
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
      clipRule="evenodd"
    />
  </svg>
);

/** Robust children getter: supports camelCase, snake_case, and generic 'children'. */
const getChildren = (category: any): CategoryLevel[] | undefined => {
  if (Array.isArray(category?.firstCategories)) return category.firstCategories;
  if (Array.isArray(category?.secondCategories)) return category.secondCategories;
  if (Array.isArray(category?.first_categories)) return category.first_categories;
  if (Array.isArray(category?.second_categories)) return category.second_categories;
  if (Array.isArray(category?.children)) return category.children;
  return undefined;
};

/** Which children key a node uses (for writing back reordered arrays). */
const getChildrenKey = (category: any): string | null => {
  const keys = [
    "firstCategories",
    "secondCategories",
    "first_categories",
    "second_categories",
    "children",
  ];
  return keys.find((k) => Array.isArray(category?.[k])) ?? null;
};

/** Move a node (by id) to front of its siblings at whichever level it lives in. */
const moveNodeToFront = (nodes: any[], targetId: string): any[] => {
  const idStr = String(targetId);

  // 1) Top-level hit
  const topIdx = nodes.findIndex((n) => String(n?.id) === idStr);
  if (topIdx >= 0) {
    if (topIdx === 0) return nodes;
    const copy = nodes.slice();
    const [hit] = copy.splice(topIdx, 1);
    copy.unshift(hit);
    return copy;
  }

  // 2) Otherwise recurse through each node's children
  let changed = false;
  const out = nodes.map((node) => {
    const key = getChildrenKey(node);
    if (!key) return node;

    const arr = node[key] as any[];
    if (!Array.isArray(arr) || arr.length === 0) return node;

    const idx = arr.findIndex((n) => String(n?.id) === idStr);
    let newChildren: any[] = arr;

    if (idx >= 0) {
      if (idx !== 0) {
        newChildren = arr.slice();
        const [hit] = newChildren.splice(idx, 1);
        newChildren.unshift(hit);
        changed = true;
      }
    } else {
      const recursed = moveNodeToFront(arr, idStr);
      if (recursed !== arr) {
        newChildren = recursed;
        changed = true;
      }
    }

    if (newChildren !== arr) {
      return { ...node, [key]: newChildren };
    }
    return node;
  });

  return changed ? out : nodes;
};

/** Find the full ancestor path to a target id (as strings). */
const findPathToId = (nodes: any[], targetId: string): string[] | null => {
  const t = String(targetId);
  for (const node of nodes ?? []) {
    const id = String(node?.id);
    if (id === t) return [id];

    const children = getChildren(node);
    if (Array.isArray(children) && children.length) {
      const childPath = findPathToId(children as any[], t);
      if (childPath) return [id, ...childPath];
    }
  }
  return null;
};

const NestedMenuItem = ({
  item,
  level = 0,
  activePath,
  openPath,
  setOpenPath,
  selectedCategoryId,
  setSelectedCategoryId,
  onReorder,
}: NestedMenuItemProps) => {
  const { handleCategoryFilter } = useShop();
  const nodeId = String((item as any).id);

  const children = getChildren(item);
  const hasChildren = !!children?.length;

  const isSelected = selectedCategoryId === nodeId;
  const isOpenAtThisLevel = openPath[level] === nodeId;

  const expandBranch = () => {
    setOpenPath((prev) => {
      const next = prev.slice(0, level);
      next[level] = nodeId;
      return next;
    });
  };

  const toggleExpand = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setOpenPath((prev) => {
      const isOpen = prev[level] === nodeId;
      if (isOpen) {
        // collapse this branch by trimming at current level
        return prev.slice(0, level);
      }
      const next = prev.slice(0, level);
      next[level] = nodeId;
      return next;
    });
  };

  const handleSelection = () => {
    setSelectedCategoryId?.(nodeId);
    expandBranch();
    onReorder(nodeId, level);   // <-- pass level (skip sort when level === 3)
    handleCategoryFilter(item); // run your filter
  };

  return (
    <>
      <div
        className="flex items-center justify-between w-full px-2 py-1.5 cursor-pointer group rounded-md hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-colors"
        style={{ paddingLeft: `${level * 16 + 8}px` }} // indent per level
        onClick={handleSelection}
      >
        {/* Left side: Radio + Label */}
        <div className="flex items-center gap-2 min-w-0">
          <input
            type="radio"
            checked={isSelected}
            onChange={handleSelection}
            onClick={(e) => e.stopPropagation()}
            className={`w-4 h-4 cursor-pointer appearance-none rounded-full border ${
              isSelected
                ? "border-emerald-500 bg-emerald-500 dark:border-emerald-400 dark:bg-emerald-400"
                : "bg-gray-200 dark:bg-gray-700 border-transparent"
            }`}
          />
          <p
            className={`text-[12px] transition-colors duration-200 ${
              isSelected
                ? "text-emerald-700 dark:text-emerald-400 font-bold"
                : level === 0
                ? "text-gray-900 dark:text-gray-100 font-semibold"
                : "text-gray-700 dark:text-gray-300 font-medium"
            }`}
            title={item.name}
          >
            {item.name}
          </p>
        </div>

        {/* Right side: Arrow only if has children */}
        {hasChildren && (
          <button
            type="button"
            onClick={toggleExpand}
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-300 focus:outline-none shrink-0"
            aria-label={isOpenAtThisLevel ? "Collapse" : "Expand"}
          >
            <Chevron className={isOpenAtThisLevel ? "rotate-90" : ""} />
          </button>
        )}
      </div>

      {/* Children (render only when open) */}
      {hasChildren && isOpenAtThisLevel && (
        <div className="transition-all duration-200 ease-in-out">
          {children!.map((child: any) => (
            <NestedMenuItem
              key={String(child.id)}
              item={child}
              level={level + 1}
              activePath={activePath}
              openPath={openPath}
              setOpenPath={setOpenPath}
              selectedCategoryId={selectedCategoryId}
              setSelectedCategoryId={setSelectedCategoryId}
              onReorder={onReorder}
            />
          ))}
        </div>
      )}
    </>
  );
};

interface SidebarProps {
  selectedCategoryId: string | null;
  setSelectedCategoryId?: React.Dispatch<React.SetStateAction<string | null>>; // optional
}

const Sidebar = ({ selectedCategoryId, setSelectedCategoryId }: SidebarProps) => {
  const router = useRouter();
  const pathname = usePathname() || "/";
  const searchParams = useSearchParams();

  // Read URL filter state
  const currentMinPrice = searchParams?.get("minPrice") || "";
  const currentMaxPrice = searchParams?.get("maxPrice") || "";
  const currentInStock = searchParams?.get("inStockOnly") === "true";
  const currentDiscount = searchParams?.get("discountOnly") === "true";
  const currentSortBy = searchParams?.get("sortBy") || "newest";

  // Local state for Min/Max inputs (prevent API spamming per keystroke)
  const [minPriceInput, setMinPriceInput] = useState(currentMinPrice);
  const [maxPriceInput, setMaxPriceInput] = useState(currentMaxPrice);

  useEffect(() => {
    setMinPriceInput(currentMinPrice);
    setMaxPriceInput(currentMaxPrice);
  }, [currentMinPrice, currentMaxPrice]);

  const updateParam = (paramsToUpdate: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams ? searchParams.toString() : "");
    newParams.set("pageNumber", "1"); // Always reset page to 1 on filter change

    Object.entries(paramsToUpdate).forEach(([key, val]) => {
      if (val === null || val === "" || val === "false") {
        newParams.delete(key);
      } else {
        newParams.set(key, val);
      }
    });
    router.push(`${pathname}?${newParams.toString()}`);
  };

  const handleApplyPrice = () => {
    updateParam({ minPrice: minPriceInput, maxPrice: maxPriceInput });
  };

  const handlePresetPrice = (min: string, max: string) => {
    setMinPriceInput(min);
    setMaxPriceInput(max);
    updateParam({ minPrice: min, maxPrice: max });
  };

  const handleClearAll = () => {
    setMinPriceInput("");
    setMaxPriceInput("");
    setSelectedCategoryId?.(null);
    setOpenPath([]);
    router.push(`${pathname}?pageNumber=1`);
  };

  const [openPath, setOpenPath] = useState<string[]>([]);
  const [nestedCategories] = useAtom(nestedCategoriesAtom);
  const [isLoading] = useAtom(isLoadingAtom);

  // Locally ordered copy for UI
  const [orderedCategories, setOrderedCategories] = useState<any[] | null>(null);

  // Initialize/refresh ordered tree; also reorder for a preselected id from Home
  useEffect(() => {
    if (!nestedCategories) {
      setOrderedCategories([]);
      return;
    }
    let clone = JSON.parse(JSON.stringify(nestedCategories));
    if (selectedCategoryId) {
      const path = findPathToId(clone as any[], String(selectedCategoryId));
      if (path && path.length) {
        const limit = path.length >= 4 ? path.length - 1 : path.length;
        for (let i = 0; i < limit; i++) {
          clone = moveNodeToFront(clone, path[i]);
        }
      }
    }
    setOrderedCategories(clone);
  }, [nestedCategories, selectedCategoryId]);

  const tree: MainCategory[] = useMemo(
    () => ((orderedCategories ?? []) as unknown as MainCategory[]),
    [orderedCategories]
  );

  // Auto-expand the chain when a category is pre-selected (e.g., from Home)
  useEffect(() => {
    if (!selectedCategoryId || !tree?.length) return;
    const path = findPathToId(tree as any[], String(selectedCategoryId));
    if (path && path.length) {
      setOpenPath(path);
    }
  }, [selectedCategoryId, tree]);

  // Reorder callback passed to items (for clicks on this page)
  const handleReorder = (id: string, level: number) => {
    if (level === 3) return;

    setOrderedCategories((prev) => {
      if (!prev) return prev;
      let next = moveNodeToFront(prev, id);

      const path = findPathToId(next as any[], id);
      if (path && path.length) {
        for (const ancestorId of path) {
          next = moveNodeToFront(next, ancestorId);
        }
      }

      return next === prev ? [...next] : next;
    });
  };

  const resetAll = () => {
    setSelectedCategoryId?.(null);
    setOpenPath([]);
  };

  return (
    <div className="w-82 bg-[#F8F8F8] dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700/80 rounded-2xl shadow-sm h-fit overflow-hidden sticky top-24 divide-y divide-gray-200 dark:divide-gray-700">
      
      {/* 1. Category Section */}
      <div className="p-4">
        <p className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-2 uppercase tracking-wider">
          Categories
        </p>

        {isLoading ? (
          <ProductCategorySkeleton />
        ) : (
          <nav className="mt-1 max-h-64 overflow-y-auto pr-1">
            {/* All Categories row */}
            <div
              className="flex items-center justify-between w-full px-2 py-1.5 cursor-pointer rounded-md hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-colors"
              onClick={resetAll}
            >
              <div className="flex items-center gap-2 min-w-0">
                <input
                  type="radio"
                  checked={selectedCategoryId === null}
                  onChange={resetAll}
                  onClick={(e) => e.stopPropagation()}
                  className={`w-4 h-4 cursor-pointer appearance-none rounded-full border ${
                    selectedCategoryId === null
                      ? "border-emerald-500 bg-emerald-500 dark:border-emerald-400 dark:bg-emerald-400"
                      : "bg-gray-200 dark:bg-gray-700 border-transparent"
                  }`}
                />
                <Link
                  href={"/all-categories"}
                  className={`text-xs sm:text-sm transition-colors duration-200 ${
                    selectedCategoryId === null
                      ? "text-emerald-700 dark:text-emerald-400 font-bold"
                      : "text-gray-900 dark:text-gray-100 font-semibold"
                  }`}
                  title="All Categories"
                >
                  All Categories
                </Link>
              </div>
            </div>

            {/* Tree */}
            {tree.map((category) => (
              <NestedMenuItem
                key={String((category as any).id)}
                item={category}
                activePath={pathname}
                openPath={openPath}
                setOpenPath={setOpenPath}
                selectedCategoryId={selectedCategoryId}
                setSelectedCategoryId={setSelectedCategoryId}
                onReorder={handleReorder}
              />
            ))}
          </nav>
        )}
      </div>

      {/* 2. Sort By Section */}
      <div className="p-4">
        <label className="text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider block mb-2">
          Sort By
        </label>
        <select
          value={currentSortBy}
          onChange={(e) => updateParam({ sortBy: e.target.value })}
          className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
        >
          <option value="newest">Newest Arrivals</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="name_asc">Name: A - Z</option>
          <option value="name_desc">Name: Z - A</option>
        </select>
      </div>

      {/* 3. Price Filter Section (in ৳ Taka) */}
      <div className="p-4">
        <label className="text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider block mb-2">
          Price Range (৳)
        </label>
        
        {/* Min & Max Inputs */}
        <div className="flex items-center gap-2 mb-3">
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-semibold">৳</span>
            <input
              type="number"
              placeholder="Min"
              value={minPriceInput}
              onChange={(e) => setMinPriceInput(e.target.value)}
              className="w-full pl-6 pr-2 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <span className="text-xs text-gray-400 font-bold">-</span>
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-semibold">৳</span>
            <input
              type="number"
              placeholder="Max"
              value={maxPriceInput}
              onChange={(e) => setMaxPriceInput(e.target.value)}
              className="w-full pl-6 pr-2 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <button
            onClick={handleApplyPrice}
            className="px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors cursor-pointer"
          >
            Apply
          </button>
        </div>

        {/* Presets */}
        <div className="flex flex-wrap gap-1.5">
          {[
            { label: "Under ৳500", min: "", max: "500" },
            { label: "৳500 - ৳1000", min: "500", max: "1000" },
            { label: "৳1000 - ৳2000", min: "1000", max: "2000" },
            { label: "৳2000+", min: "2000", max: "" },
          ].map((preset, idx) => {
            const isActive = currentMinPrice === preset.min && currentMaxPrice === preset.max;
            return (
              <button
                key={idx}
                onClick={() => handlePresetPrice(preset.min, preset.max)}
                className={`text-[11px] font-medium px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                  isActive
                    ? "bg-emerald-500 text-white border-emerald-500 font-bold"
                    : "bg-white dark:bg-gray-700/50 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600 hover:border-emerald-400"
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Availability & Special Deals */}
      <div className="p-4 space-y-3">
        <label className="text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider block">
          Filters
        </label>
        
        {/* Availability: In Stock Only */}
        <label className="flex items-center justify-between cursor-pointer group">
          <span className="text-xs font-medium text-gray-800 dark:text-gray-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
            In Stock Only
          </span>
          <input
            type="checkbox"
            checked={currentInStock}
            onChange={(e) => updateParam({ inStockOnly: e.target.checked ? "true" : null })}
            className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
          />
        </label>

        {/* Special Deals: On Sale */}
        <label className="flex items-center justify-between cursor-pointer group">
          <span className="text-xs font-medium text-gray-800 dark:text-gray-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
            On Sale (Discounted)
          </span>
          <input
            type="checkbox"
            checked={currentDiscount}
            onChange={(e) => updateParam({ discountOnly: e.target.checked ? "true" : null })}
            className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
          />
        </label>
      </div>

      {/* 5. Clear All Filters */}
      <div className="p-3 bg-gray-50 dark:bg-gray-900/60">
        <button
          onClick={handleClearAll}
          className="w-full text-xs font-semibold py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-lg transition-colors cursor-pointer"
        >
          Clear All Filters
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
