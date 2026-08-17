import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { RiArrowDropDownLine, RiArrowDropRightLine, RiLogoutCircleLine } from "react-icons/ri";
//@ts-ignore
import { CiSettings } from "react-icons/ci";
//@ts-ignore
import { FiUser } from "react-icons/fi";
import userAvatar from "../../assets/avatar.png";
import { TbLayoutGrid, TbListDetails, TbTablePlus } from "react-icons/tb";
import { BsThreeDotsVertical } from "react-icons/bs";
import { GiHamburgerMenu } from "react-icons/gi";
import { FaTags, FaUniversity } from "react-icons/fa";
//@ts-ignore
import user from "../../assets/avatar.png";
import companyLogo from "../../assets/BazaarBound_Landscap_Logo.svg";
import { NavLink, useNavigate } from "react-router-dom";
import Link from "next/link";;
import { BiCube } from "react-icons/bi";
import { TfiLayoutSlider } from "react-icons/tfi";
import { GoDotFill } from "react-icons/go";
import { SiPayloadcms } from "react-icons/si";
import { MdRateReview } from "react-icons/md";
import { useAtomValue, useSetAtom } from "jotai";
import { logoutUserAtom, userAtom } from "../../store/user-store";
import { FaKey } from "react-icons/fa6";

// const IconButton = ({ icon }: { icon: React.ReactNode }) => (
// 	<button className="p-2 hover:bg-gray-50 rounded-lg transition-colors relative">
// 		{icon}
// 	</button>
// );

const MenuItem = ({
	icon,
	text,
	className = "",
}: {
	icon: React.ReactNode;
	text: string;
	className?: string;
}) => (
	<div
		className={`flex items-center gap-3 p-2 hover:bg-gray-50 cursor-pointer ${className}`}
	>
		{icon}
		<span>{text}</span>
	</div>
);

const menu = [
	{
		sectionName: "Main",
		items: [
			{
				id: 1,
				name: "Dashboard",
				icon: <TbLayoutGrid />,
				path: "/",
				subItems: [
					{ id: 1, name: "Vendor Dashboard", path: "/vendor-dashboard" },
				],
			},
		],
	},
	{
		sectionName: "Inventory",
		items: [
			{
				id: 2,
				name: "Category",
				icon: <TbListDetails />,
				path: "/main-category",
				subItems: [
					{ id: 1, name: "Main Category", path: "/main-category" },
					{ id: 2, name: "First Category", path: "/first-category" },
					{ id: 3, name: "Second Category", path: "/second-category" },
					{ id: 4, name: "Third Category", path: "/third-category" },
				],
			},
			{
				id: 3,
				name: "Product",
				icon: <BiCube />,
				path: "/products",
				subItems: [],
			},
			{
				id: 4,
				name: "Create Product",
				icon: <TbTablePlus />,
				path: "/create-product",
				subItems: [],
			},
		],
	},
	{
		sectionName: "Settings",
		items: [
			{
				id: 6,
				name: "Hero Slider",
				icon: <TfiLayoutSlider />,
				path: "/hero-slider",
				subItems: [],
			},
			{
				id: 7,
				name: "Promotions",
				icon: <FaTags />,
				path: "/promotion",
				subItems: [],
			},
			{
				id: 8,
				name: "Header Footer CMS",
				icon: <SiPayloadcms />,
				path: "/header-footer-cms",
				subItems: [],
			},
			{
				id: 9,
				name: "Reviews",
				icon: <MdRateReview />,
				path: "/review",
				subItems: [],
			},
		],
	},

];

const VendorHeader = () => {
	const [showSidebar, setShowSidebar] = useState(false);
	const [showSidebarMenu, setShowSidebarMenu] = useState(false);
	const [showUserDropdown, setShowUserDropdown] = useState(false);
	const [showMenuDropdown, setShowMenuDropdown] = useState(false);
	const [openSubMenu, setOpenSubMenu] = useState<number | null>(null);
	const dropdownRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setShowUserDropdown(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	const toggleSubMenu = (id: number) => {
		setOpenSubMenu(openSubMenu === id ? null : id);
	};

	const navigate = useNavigate();
	const setLogout = useSetAtom(logoutUserAtom);
	const userData = useAtomValue(userAtom);

	const handleLogout = () => {
		setLogout(() => navigate("/login"));
	};

	return (
		<div className="lg:w-[calc(100%-252px)] w-full fixed z-50">
			<div className="flex lg:hidden items-center justify-between px-4 py-1 bg-white transition-all ease-in-out duration-300 mt-2">
				<GiHamburgerMenu
					size={22}
					className="text-[var(--color-green-secondary)] cursor-pointer"
					onClick={() => setShowSidebarMenu(!showSidebarMenu)}
				/>

				<Image src={companyLogo || null} alt="company logo" className="mx-auto" />

				<BsThreeDotsVertical
					size={20}
					className="text-[var(--color-green-secondary)]"
					onClick={() => setShowMenuDropdown(!showMenuDropdown)}
				/>

				{showMenuDropdown && (
					<div className="absolute top-12 right-0 bg-white shadow-xl rounded-lg border border-gray-100 z-50 dropdown-menu p-2">
						<div className="flex items-center gap-1 bg-gray-100 border-b border-gray-100 p-2 rounded-md mb-2">
							<Image src={userAvatar} alt="user" className="w-[45px] h-[45px] rounded-full border border-gray-200" />
							<div>
								<p className="text-[15px] font-semibold text-gray-800">
									{/* {userData?.name} */}
								</p>
								{/* <p className="text-[12px] text-gray-500 capitalize">{userData?.role}</p> */}
							</div>
						</div>
						<MenuItem icon={<FiUser />} text="My Profile" />
						{/* <MenuItem icon={<CiSettings />} text="Settings" /> */}
						<MenuItem
							icon={<RiLogoutCircleLine />}
							text="Logout"
							className="text-red-500 font-medium hover:bg-[var(--color-primary)]"
							//@ts-ignore
							onClick={handleLogout}
						/>
					</div>
				)}

				{showSidebarMenu && (
					<div
						className={`fixed top-17 left-0 w-64 h-full overflow-auto bg-white shadow-lg overflow-y-auto transform transition-transform duration-300 ease-in-out ${showSidebarMenu ? "translate-x-0" : "-translate-x-full"}`}
					>
						<div className="p-4">
							{menu.map((section) => (
								<div key={section.sectionName} className="p-2 mb-2">
									<p className="text-[12px] text-[#092c4c] font-bold mb-2">
										{section.sectionName}
									</p>

									{section.items.map((item) => {
										const isParentActive = item.subItems.some(
											(subItem) => subItem.path === location.pathname
										);
										const isOpen = openSubMenu === item.id;

										return (
											<div key={item.id}>
												<NavLink
													to={item.subItems.length > 0 ? "#" : item.path}
													className={`w-[200px] group px-[12px] py-[8px] flex items-center justify-between cursor-pointer rounded-md transition-all mb-[2px] ${isOpen || isParentActive
														? "bg-[#FFF7F0] text-[var(--color-primary)]"
														: "hover:bg-gray-100"
														}`}
													onClick={() => toggleSubMenu(item.id)}
												>
													<div className="flex items-center gap-2">
														<span
															className={`text-[18px] transition-all ${isOpen || isParentActive
																? "text-[var(--color-primary)]"
																: "text-[#5b6670] group-hover:text-[var(--color-primary)]"
																}`}
														>
															{item.icon}
														</span>
														<span
															className={`text-[14px] font-medium transition-all ${isOpen || isParentActive
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
												</NavLink>

												{/* Submenu */}
												{item.subItems.length > 0 && isOpen && (
													<ul>
														{item.subItems.map((subItem) => (
															<NavLink
																key={subItem.id}
																to={subItem.path}
																className={({ isActive }) =>
																	`block w-[200px] rounded-md group pl-4 py-2.5 p-2 cursor-pointer text-[13px] transition-all hover:bg-gray-100 hover:text-[var(--color-primary)] ${isActive ? "text-[var(--color-primary)] font-medium" : "text-[#646b72]"}`
																}>
																<span className="flex justify-start items-center gap-2">
																	<GoDotFill className="text-[10px]" />
																	{subItem.name}
																</span>
															</NavLink>
														))}
													</ul>
												)}
											</div>
										);
									})}
								</div>
							))}
						</div>
					</div>
				)}
			</div>

			{showSidebar && (
				<div className="" onClick={() => setShowSidebar(true)}></div>
			)}

			<div className="flex justify-end items-center px-4 lg:py-1 bg-white border-b border-gray-200">

				<div className="flex gap-4 items-center">
					<div
						className="hidden lg:flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors relative"
						onClick={() => setShowUserDropdown(!showUserDropdown)}>
						<Image src={userAvatar} alt="vendor" className="w-[40px] h-[40px] rounded-lg object-cover" />
					</div>

					{showUserDropdown && (
						<div ref={dropdownRef} className="absolute top-16.5 right-0 bg-white shadow-xl rounded-xl border border-gray-100 p-2">
							<div className="flex items-center gap-1 bg-gray-100 border-b border-gray-100 p-2 rounded-md mb-2">
								<Image src={userAvatar} alt="vendor" className="w-[45px] h-[45px] rounded-full border border-gray-200" />
								<div>
									<p className="text-[15px] font-semibold text-gray-800">
										{userData?.name}
									</p>
									<p className="text-[12px] text-gray-500 capitalize">{userData?.role}</p>
								</div>
							</div>
							<Link href={'/vendor-profile'}>
								<MenuItem icon={<FiUser />} text="My Profile" />
							</Link>
							<Link href={'/vendor-bank-information'}>
								<MenuItem icon={<FaUniversity />} text="Bank Information" />
							</Link>
							<Link href={'/change-vendor-password'}>
								<MenuItem icon={<FaKey />} text="Change Password" />
							</Link>
							<button onClick={handleLogout} className="flex items-center gap-2 px-2 py-2 hover:bg-gray-100 w-full cursor-pointer rounded-md">
								<RiLogoutCircleLine className="text-red-500" />
								<p className="text-red-500 font-medium">LogOut</p>
							</button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default VendorHeader;
