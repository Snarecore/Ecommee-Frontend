'use client';

import React from 'react';
import Image from "next/image";
import { useSetAtom } from "jotai";
import { FaCalendarAlt, FaUser } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { logoutUserAtom } from "../../../store/user-store";
import { FaKey } from "react-icons/fa6";

export type TabType = "order" | "profile" | "changePassword";

const tabList: TabType[] = ["order", "profile", "changePassword"];

const tabLabels: Record<TabType, string> = {
	order: "Order",
	profile: "Profile",
	changePassword: "Change Password",
};

interface Props {
	activeTab: TabType;
	setActiveTab: (tab: TabType) => void;
	userData: any;
}

const UserSidebar: React.FC<Props> = ({ activeTab, setActiveTab, userData }) => {
	const router = useRouter();
	const setLogout = useSetAtom(logoutUserAtom);

	const handleLogout = () => {
		setLogout({ navigate: () => router.push("/login") });
	};

	const renderIcon = (tab: TabType, isActive: boolean) => {
		const iconClass = `inline text-base transition-colors duration-150 ${
			isActive ? "text-white" : "text-[var(--color-green-primary)]"
		}`;
		switch (tab) {
			case "order":
				return <FaCalendarAlt className={iconClass} />;
			case "profile":
				return <FaUser className={iconClass} />;
			case "changePassword":
				return <FaKey className={iconClass} />;
		}
	};

	return (
		<>
			<div className="flex flex-col w-full lg:w-xs md:flex-row lg:max-w-screen-xl mx-auto">
				<div className="w-full lg:w-xs bg-white p-4 sm:p-5 rounded-xl border border-gray-200 shadow-sm lg:h-fit">
					{/* User Profile Header */}
					<div className="mb-3.5 flex items-center gap-3.5">
						<div className="w-14 h-14 shrink-0">
							<Image 
								src={userData?.profile?.profileImage || "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"} 
								alt={userData?.name || "User Profile Picture"} 
								className="w-full h-full rounded-full object-cover shadow-sm border-2 border-[var(--color-green-primary)]" 
								width={120} 
								height={120} 
							/>
						</div>
						<div className="flex flex-col min-w-0">
							<p className="text-xl font-bold text-[var(--color-green-primary)] truncate">
								{userData?.name || "User"}
							</p>
						</div>
					</div>

					{/* Contact Details */}
					<div className="flex flex-col space-y-2 py-2.5 border-t border-b border-gray-100">
						<div className="min-w-0">
							<p className="text-xs text-gray-500 font-medium leading-none mb-1">Email</p>
							<p className="text-sm font-semibold text-[var(--color-green-primary)] truncate">{userData?.email}</p>
						</div>
						<div className="min-w-0">
							<p className="text-xs text-gray-500 font-medium leading-none mb-1">Phone</p>
							<p className="text-sm font-semibold text-[var(--color-green-primary)] truncate">{userData?.phone}</p>
						</div>
					</div>

					{/* Desktop Navigation Tabs */}
					<div className="hidden lg:flex lg:flex-col gap-1.5 text-left mt-3.5">
						{tabList.map((tab) => {
							const isActive = activeTab === tab;
							return (
								<button
									key={tab}
									onClick={() => setActiveTab(tab)}
									className={`w-full flex items-center gap-2.5 text-left px-3.5 py-2 rounded-lg font-medium text-sm transition-colors duration-150 cursor-pointer ${
										isActive
											? "bg-[var(--color-green-secondary)] text-white shadow-xs font-semibold"
											: "hover:bg-gray-100 text-gray-700"
									}`}
								>
									<span className="flex items-center justify-center w-5">
										{renderIcon(tab, isActive)}
									</span>
									<span className={isActive ? "text-white" : ""}>
										{tabLabels[tab]}
									</span>
								</button>
							);
						})}

						{/* Logout Button */}
						<button 
							onClick={handleLogout} 
							className="hidden lg:flex items-center gap-2.5 w-full border border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-lg cursor-pointer text-left px-3.5 py-2 text-sm font-medium text-[var(--color-green-primary)] transition-colors duration-150 mt-2"
						>
							<span className="flex items-center justify-center w-5">
								<FiLogOut className="inline text-base" />
							</span>
							Logout
						</button>
					</div>
				</div>
			</div>

			{/* Mobile Navigation Tabs */}
			<div className="lg:hidden flex gap-2 w-full overflow-x-auto items-center justify-start sm:justify-center mt-4 bg-gray-50 p-1.5 rounded-lg border border-gray-200">
				{tabList.map((tab) => {
					const isActive = activeTab === tab;
					return (
						<button
							key={tab}
							onClick={() => setActiveTab(tab)}
							className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-medium text-sm whitespace-nowrap transition-colors duration-150 cursor-pointer ${
								isActive 
									? "bg-[var(--color-green-secondary)] text-white font-semibold shadow-xs"
									: "hover:bg-gray-200/60 text-gray-700"
							}`}
						>
							<span className="inline-flex items-center">
								{renderIcon(tab, isActive)}
							</span>
							<span className={isActive ? "text-white" : ""}>
								{tabLabels[tab]}
							</span>
						</button>
					);
				})}
			</div>
		</>
	);
};

export default UserSidebar;
