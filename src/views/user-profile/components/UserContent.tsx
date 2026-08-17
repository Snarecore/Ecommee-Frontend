import ChangePassword from "./tabs/ChangePassword";
import Order from "./tabs/Order";
import Profile from "./tabs/Profile";

interface Props {
  activeTab: string;
  userData: {
    email: string;
    name: string;
    phone: string;
    profile: any;
  }
  fetchUserData: () => void;
}


const UserContent: React.FC<Props> = ({ activeTab, userData, fetchUserData }) => {
  return (
    <div className="flex-1 lg:px-6 max-w-screen-xl">
      <div className="bg-white rounded-xl shadow p-6">
        {activeTab === "order" && <Order />}
        {activeTab === "profile" && <Profile userData={userData} fetchUserData={fetchUserData} />}
        {activeTab === "changePassword" && <ChangePassword />}
      </div>
    </div>
  );
};

export default UserContent;
