import { useEffect, useState } from "react";
import UserSidebar from "./components/UserSidebar";
import UserContent from "./components/UserContent";
import { TabType } from "./components/UserSidebar";
import { useAPI } from "../../hooks/useApi";
import apiConfig from "../../config/api.json";

const UserProfile = () => {
	const [activeTab, setActiveTab] = useState<TabType>("order");
	const { fetchData } = useAPI();
	const [userData, setUserData] = useState<{
		email: string;
		name: string;
		phone: string;
		profile: any;
	} | null>(null);

	const fetchUserData = async () => {
		const result = await fetchData({ apiUrl: `${apiConfig.people.user}` });
		setUserData(result);
	};

	useEffect(() => {
		fetchUserData();
	}, []);

	return (
		<div className="py-12 px-4 max-w-screen-sm md:max-w-screen-md lg:max-w-screen-lg xl:max-w-screen-xl 2xl:max-w-screen-2xl mx-auto flex flex-wrap">
			<UserSidebar
				activeTab={activeTab}
				setActiveTab={setActiveTab}
				userData={userData}
			/>

			{userData && (
				<UserContent activeTab={activeTab} userData={userData} fetchUserData={fetchUserData}/>
			)}
		</div>
	);
};

export default UserProfile;
