"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import { TbTablePlus, TbLayoutGrid, TbMessageFilled } from "react-icons/tb";
import { BiBarChart, BiCube } from "react-icons/bi";
import { RiArrowDropRightLine, RiArrowDropDownLine } from "react-icons/ri";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { GoDotFill } from "react-icons/go";
import logo from "../../assets/logo.svg";
import { FiShoppingCart } from "react-icons/fi";
import { FaFacebookMessenger } from "react-icons/fa6";
import { FaHandHoldingUsd } from "react-icons/fa";

interface SubItem {
	id: number;
	name: string;
	path: string;
}

interface MenuItem {
	id: number;
	name: string;
	icon: React.ReactElement;
	path: string;
	subItems: SubItem[];
}

interface MenuSection {
	sectionName: string;
	items: MenuItem[];
}

const menu: MenuSection[] = [
	{
		sectionName: "Main",
		items: [
			{
				id: 1,
				name: "Dashboard",
				icon: <TbLayoutGrid />,
				path: "/vendor-dashboard",
				subItems: [],
			},
			{
				id: 2,
				name: "Sales Dashboard",
				icon: <BiBarChart />,
				path: "/sales-dashboard",
				subItems: [],
			},
			{
				id: 3,
				name: "Wallet",
				icon: <FaHandHoldingUsd />,
				path: "/wallet",
				subItems: [],
			},
		],
	},
	{
		sectionName: "Inventory",
		items: [
			{
				id: 4,
				name: "Product",
				icon: <BiCube />,
				path: "/products",
				subItems: [],
			},
			{
				id: 5,
				name: "Create Product",
				icon: <TbTablePlus />,
				path: "/create-product",
				subItems: [],
			},
		],
	},
	{
		sectionName: "Orders",
		items: [
			{
				id: 6,
				name: "Orders",
				icon: <FiShoppingCart />,
				path: "/orders",
				subItems: [],
			},
		],
	},
	{
		sectionName: "Content (CMS)",
		items: [
			{
				id: 8,
				name: "Messages",
				icon: <TbMessageFilled />,
				path: "/messages",
				subItems: [],
			},
		],
	},
	{
		sectionName: "Chat",
		items: [
			{
				id: 9,
				name: "Chat",
				icon: <FaFacebookMessenger />,
				path: "/chat",
				subItems: [],
			},
		],
	},
];

const VendorSidebar = () => {
	const [openSubMenu, setOpenSubMenu] = useState<number | null>(null);
	const pathname = usePathname() || "/";

	useEffect(() => {
		menu.forEach((section) => {
			section.items.forEach((item) => {
				if (
					item.subItems.some((sub) => sub.path === pathname) ||
					item.path === pathname
				) {
					setOpenSubMenu(item.id);
				}
			});
		});
	}, [pathname]);

	const toggleSubMenu = (id: number) => {
		setOpenSubMenu(openSubMenu === id ? null : id);
	};

	const isAnySubmenuActive = menu.some(section =>
		section.items.some(menuItem =>
			menuItem.subItems.some(subItem => subItem.path === pathname)
		)
	);

	return (
		<div className="hidden lg:block w-63 min-h-screen bg-white shadow-md p-2 transition-all ease-in duration-300 border-r border-gray-200">
			<Link href={"/"}>
				<Image src={logo} alt="company logo" className="w-58 fixed" />
			</Link>

			<div className="p-2 mt-14 max-h-[90vh] fixed w-61 overflow-hidden border-t border-gray-200 hover:overflow-y-auto custom-scrollbar">
				{menu.map((section) => (
					<div key={section.sectionName} className="p-2 mb-2">
						<p className="text-[12px] text-[#092c4c] font-bold mb-2">
							{section.sectionName}
						</p>

						{section.items.map((item) => {
							const isParentActive = item.subItems.some(
								(subItem) => subItem.path === pathname
							);
							const isItemActive = item.path === pathname;
							const isOpen = openSubMenu === item.id;

							const shouldShowActive = item.subItems.length > 0
								? (isOpen || isParentActive)
								: (isItemActive && !isAnySubmenuActive);

							return (
								<div key={item.id}>
									<Link
										href={item.subItems.length > 0 ? "#" : item.path}
										className={`w-[200px] group px-[12px] py-[8px] flex items-center justify-between cursor-pointer rounded-md transition-all mb-[2px] 
											${shouldShowActive
												? "bg-[var(--color-active)] text-[var(--color-primary)]"
												: "hover:bg-gray-100"
											}`}
										onClick={() => toggleSubMenu(item.id)}
									>
										<div className="flex items-center gap-2">
											<span
												className={`text-[18px] transition-all ${shouldShowActive
													? "text-[var(--color-primary)]"
													: "text-[#5b6670] group-hover:text-[var(--color-primary)]"
													}`}
											>
												{item.icon}
											</span>
											<span
												className={`text-[14px] font-medium transition-all ${shouldShowActive
													? "text-[var(--color-primary)]"
													: "text-[#5b6670] group-hover:text-[var(--color-primary)]"
													}`}
											>
												{item.name}
											</span>
										</div>

										{item.subItems.length > 0 && (
											<span className="text-xl bg-gray-100 rounded-full">
												{isOpen ? (
													<RiArrowDropDownLine className="text-[var(--color-primary)]" />
												) : (
													<RiArrowDropRightLine className="text-gray-600" />
												)}
											</span>
										)}
									</Link>

									{item.subItems.length > 0 && isOpen && (
										<ul>
											{item.subItems.map((subItem) => {
												const isActive = subItem.path === pathname;
												return (
													<Link
														key={subItem.id}
														href={subItem.path}
														className={`block w-[200px] rounded-md group pl-4 py-2.5 p-2 cursor-pointer text-[13px] transition-all 
															hover:bg-gray-100 hover:text-[var(--color-primary)] 
															${isActive ? "text-[var(--color-primary)] font-medium" : "text-[#646b72]"}`}
													>
														<span className="flex justify-start items-center gap-2">
															<GoDotFill className="text-[10px]" />
															{subItem.name}
														</span>
													</Link>
												);
											})}
										</ul>
									)}
								</div>
							);
						})}
					</div>
				))}
			</div>
		</div>
	);
};

export default VendorSidebar;
