'use client';
import { useEffect, useState } from "react";
import UserSidebar from "./components/UserSidebar";
import UserContent from "./components/UserContent";
import { TabType } from "./components/UserSidebar";
import { useAPI } from "../../hooks/useApi";
import apiConfig from "../../config/api.json";

import { useAtomValue } from "jotai";
import { userAtom } from "../../store/user-store";

const UserProfile = () => {
	const [activeTab, setActiveTab] = useState<TabType>("order");
	const { fetchData } = useAPI();
	const initialUser = useAtomValue(userAtom);
	const [userData, setUserData] = useState<{
		email: string;
		name: string;
		phone: string;
		profile: any;
	} | null>(initialUser ? {
		email: initialUser.email || "",
		name: initialUser.name || "",
		phone: initialUser.phone || "",
		profile: initialUser.profile || null,
	} : null);

	const fetchUserData = async () => {
		const result = await fetchData({ apiUrl: `${apiConfig.people.user}`, noCache: true });
		if (result) {
			setUserData(result);
		}
	};

	useEffect(() => {
		fetchUserData();
	}, []);

	useEffect(() => {
		if (typeof window !== "undefined") {
			const params = new URLSearchParams(window.location.search);
			const tabParam = params.get("tab");
			if (tabParam && ["order", "profile", "changePassword"].includes(tabParam)) {
				setActiveTab(tabParam as TabType);
			}
		}
	}, []);

	return (
		<div className="py-12 px-4 max-w-screen-sm md:max-w-screen-md lg:max-w-screen-lg xl:max-w-screen-xl 2xl:max-w-screen-2xl mx-auto flex flex-wrap">
			<UserSidebar
				activeTab={activeTab}
				setActiveTab={setActiveTab}
				userData={userData}
			/>

			<UserContent activeTab={activeTab} userData={userData || { email: "", name: "", phone: "", profile: null }} fetchUserData={fetchUserData}/>
		</div>
	);
};

export default UserProfile;
