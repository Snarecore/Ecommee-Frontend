// import { useAtom } from "jotai";
// import { useState, useEffect } from "react";
// import { Link, useLocation } from "react-router-dom";
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
// 								to={"/all-categories"}
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
// import { Link, useLocation } from "react-router-dom";
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
//               <Link to={"/all-categories"} className="text-sm font-semibold">
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
// import { Link, useLocation } from "react-router-dom";
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
//               <Link to={"/all-categories"} className="text-sm font-semibold">
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
import { Link, useLocation } from "react-router-dom";
import { isLoadingAtom, nestedCategoriesAtom } from "../../store/global-store";
import ProductCategorySkeleton from "../skeleton/ProductCategorySkeleton";
import {
  MainCategory,
  FirstCategory,
  SecondCategory,
  ThirdCategory,
} from "../../interface/nested-category.interface";
import useShop from "../../hooks/useShop";

type CategoryLevel = MainCategory | FirstCategory | SecondCategory | ThirdCategory;

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
    className={`w-4 h-4 transition-transform duration-200 ${className}`}
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
  if (Array.isArray(category?.thirdCategories)) return category.thirdCategories;
  if (Array.isArray(category?.first_categories)) return category.first_categories;
  if (Array.isArray(category?.second_categories)) return category.second_categories;
  if (Array.isArray(category?.third_categories)) return category.third_categories;
  if (Array.isArray(category?.children)) return category.children;
  return undefined;
};

/** Which children key a node uses (for writing back reordered arrays). */
const getChildrenKey = (category: any): string | null => {
  const keys = [
    "firstCategories",
    "secondCategories",
    "thirdCategories",
    "first_categories",
    "second_categories",
    "third_categories",
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
        className="flex items-center justify-between w-full px-2 py-1 cursor-pointer group rounded-md hover:bg-gray-100 transition-colors"
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
                ? "border-[var(--color-green-primary)] bg-[var(--color-green-primary)]"
                : "bg-[#EAEAEB] border-transparent"
            }`}
          />
          <p
            className={`text-[12px]  transition-colors duration-200 ${
              isSelected
                ? "text-[var(--color-green-primary)] font-semibold"
                : level === 0
                ? "text-black font-semibold"
                : ""
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
            className="p-1 rounded hover:bg-gray-200 focus:outline-none shrink-0"
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
  const location = useLocation();
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
        // bubble each ancestor (and the target) to the front of its level
        // BUT: if the selected is a 3rd-level item (path length >= 4),
        // skip bubbling the last (leaf) to keep 3rd level order intact.
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
      setOpenPath(path); // [mainId, firstId, secondId, ...]
    }
  }, [selectedCategoryId, tree]);

  // Reorder callback passed to items (for clicks on this page)
  const handleReorder = (id: string, level: number) => {
    // Do NOT reorder when clicking Third level (level === 3)
    if (level === 3) return;

    setOrderedCategories((prev) => {
      if (!prev) return prev;
      let next = moveNodeToFront(prev, id);

      // Also bubble ancestors for non-third-level clicks
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
    <div className="w-82 bg-[#F8F8F8] border-l border-gray-300 shadow-lg h-full overflow-y-auto sticky top-0">
      <div className="px-6 py-4 border-b border-gray-300">
        <p className="text-lg text-center font-semibold">Product Category</p>
      </div>

      {isLoading ? (
        <ProductCategorySkeleton />
      ) : (
        <nav className="mt-2">
          {/* All Categories row — same alignment and selected text turns green */}
          <div
            className="flex items-center justify-between w-full px-2 py-1 cursor-pointer rounded-md hover:bg-gray-100 transition-colors"
            style={{ paddingLeft: `${0 * 16 + 8}px` }}
            onClick={resetAll}
          >
            <div className="flex items-center gap-2 min-w-0">
              <input
                type="radio"
                checked={selectedCategoryId === null}
                onChange={resetAll}
                onClick={(e) => e.stopPropagation()}
                className={`w-4 h-4 cursor-pointer appearance-none ${
                  selectedCategoryId === null
                    ? "border-[var(--color-green-primary)] bg-[var(--color-green-primary)] rounded-full"
                    : "bg-[#EAEAEB] border-transparent rounded-full"
                }`}
              />
              <Link
                to={"/all-categories"}
                className={`text-sm transition-colors duration-200 ${
                  selectedCategoryId === null
                    ? "text-[var(--color-green-primary)] font-semibold"
                    : "text-black font-semibold"
                }`}
                title="All Categories"
              >
                All Categories
              </Link>
            </div>
            {/* No arrow for All Categories */}
          </div>

          {/* Tree */}
          {tree.map((category) => (
            <NestedMenuItem
              key={String((category as any).id)}
              item={category}
              activePath={location.pathname}
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
  );
};

export default Sidebar;
