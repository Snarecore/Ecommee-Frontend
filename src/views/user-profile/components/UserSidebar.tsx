import Image from "next/image";
import { useSetAtom } from "jotai";
import { FaCalendarAlt, FaUser } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import { useNavigate } from "../../../routes-compat";
import { logoutUserAtom } from "../../../store/user-store";
import { FaKey } from "react-icons/fa6";

export type TabType = "order" | "profile" | "changePassword";

const icons: Record<TabType, React.ReactElement> = {
	"order": <FaCalendarAlt className="inline mr-2 text-[var(--primary-color)]" />,
	"profile": <FaUser className="inline mr-2 text-[var(--primary-color)]" />,
	"changePassword": <FaKey className="inline mr-2 text-[var(--primary-color)]" />,
};

interface Props {
	activeTab: TabType;
	setActiveTab: (tab: TabType) => void;
	userData: any;
}

const UserSidebar: React.FC<Props> = ({ activeTab, setActiveTab, userData }) => {
	const navigate = useNavigate();
	const setLogout = useSetAtom(logoutUserAtom);
	const handleLogout = () => {
		setLogout(() => navigate("/login"));
	};

	return (
		<>
			<div className="flex flex-col w-full lg:w-xs md:flex-row lg:max-w-screen-xl mx-auto">
				<div className={`w-full lg:w-xs bg-white p-6 rounded-md border border-gray-200 shadow-sm lg:h-fit`}>
					<div className="mb-6 flex gap-4 items-center">
						<div className="flex items-center gap-4">
							<div className="w-18 h-18">
								<Image src={userData?.profile?.profileImage || "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"} alt={userData?.name || "User Profile Picture"} className="rounded-full object-cover shadow-lg border-2 border-[var(--color-green-primary)]" width={500} height={500} />
							</div>
							<div className="flex flex-col items-center md:items-start text-center md:text-left">
								<p className="text-2xl font-bold text-[var(--color-green-primary)]">
									{userData?.name}
								</p>
							</div>
						</div>

						{/* <div className="lg:hidden flex items-center justify-center gap-10 ml-10 mt-4">
						<div className="text-center">
							<p className="text-gray-600">Email</p>
							<p className="font-semibold text-lg text-gray-700">john@example.com</p>
						</div>
						<div className="text-center">
							<p className="text-gray-600">Phone</p>
							<p className="font-semibold text-lg text-gray-700">01234567890</p>
						</div>
					</div> */}
					</div>


					<div className="lg:flex lg:flex-col flex-wrap inline-flex gap-2">
						<div>
							<p className="">Email</p>
							<p className="font-semibold text-[var(--color-green-primary)]">{userData?.email}</p>
						</div>
						<div>
							<p className="">Phone</p>
							<p className="font-semibold text-[var(--color-green-primary)]">{userData?.phone}</p>
						</div>
					</div>

					<div className="hidden lg:flex lg:flex-col gap-2 lg:space-y-3 rounded-md lg:rounded-none text-left lg:mt-12 bg-gray-100 lg:bg-transparent lg:p-0 p-2">
						{["order", "profile", "changePassword"].map((tab) => (
							<button
								key={tab}
								onClick={() => setActiveTab(tab as TabType)}
								className={`lg:w-full text-left px-4 py-2 rounded-md font-medium text-md cursor-pointer ${activeTab === tab ? "bg-[var(--color-green-secondary)]"
									: "hover:bg-gray-100 text-gray-700"}`}>
								<div className="hidden lg:inline-flex gap-2">
									{icons[tab as TabType]}
								</div>
								{tab.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
							</button>
						))}

						<button onClick={handleLogout} className="hidden lg:block w-full border rounded-xl cursor-pointer text-left px-4 py-2 text-[var(--color-green-primary)] mt-6">
							<FiLogOut className="inline mr-2" />
							Logout
						</button>
					</div>
				</div>
			</div>

			<div className="lg:hidden flex gap-8 flex-row lg:space-y-3 lg:rounded-none w-full overflow-x-auto items-center justify-start sm:justify-center mt-12 bg-gray-100 lg:bg-transparent lg:p-0 p-2">
				{["order", "profile", "changePassword"].map((tab) => (
					<button
						key={tab}
						onClick={() => setActiveTab(tab as TabType)}
						className={`text-left px-4 py-2 rounded-md font-medium text-md cursor-pointer ${activeTab === tab ? "bg-[var(--color-green-secondary)] font-bold"
							: "hover:bg-gray-100 text-gray-700"}`}
					>
						<div className="hidden lg:inline-flex gap-2">
							{icons[tab as TabType]}
						</div>
						{tab.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
					</button>
				))}
			</div>

		</>
	);
};

export default UserSidebar;
