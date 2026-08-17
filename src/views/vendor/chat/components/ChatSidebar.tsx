import Image from "next/image";
import { useEffect, useState } from "react";
import { useAPI } from "../../../../hooks/useApi";
import apiConfig from "../../../../config/api.json";
import avatar from "../../../../assets/avatar.png"
import { userAtom } from "../../../../store/user-store";
import { useAtomValue } from "jotai";

interface ConversationUser {
    id: string;
    participantOne: {
        id: string;
        name: string;
        phone: string;
    };
    participantTwo: {
        id: string;
        name: string;
        phone: string;
    };
    bgColor?: string;
}

const ChatSidebar = ({ setSelectedUser, selectedUser }: any) => {
    const { fetchData } = useAPI();
    const [participant, setPerticipant] = useState<ConversationUser[]>([]);
    const userData = useAtomValue(userAtom);

    useEffect(() => {
        const getConversationUsers = async () => {
            const response = await fetchData({ apiUrl: `${apiConfig.messageLinks.conversationUrl}` });
            setPerticipant(response);
        }
        getConversationUsers();
    }, [])

    return (
        <div className="h-full flex flex-col bg-white">
            <div className="px-4 py-3.5 border-b border-gray-200">
                <p className="text-xl font-bold text-gray-900">Chats</p>
            </div>

            <div className="flex-1 p-2">
                <div className="space-y-2">
                    {participant.map((user: ConversationUser) => (
                        <div
                            key={user.id}
                            onClick={() => setSelectedUser(user)}
                            className={`flex items-center px-4 py-3 max-h-[610px] overflow-auto hover:bg-gray-50 cursor-pointer transition-all duration-200 rounded-lg ${selectedUser?.id === user.id
                                ? "bg-orange-50 border-r-2 border-orange-500"
                                : ""
                                }`}
                        >
                            <div className="w-12 h-12 rounded-full mr-3 overflow-hidden relative">
                                <Image src={avatar} alt={user.participantOne?.name || user.participantTwo?.name || 'User'} className="w-full h-full object-cover" onError={(e) => { const target = e.target as HTMLImageElement; target.style.display = "none"; const parent = target.parentElement; if (parent) { parent.className = `w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3 ${user.bgColor}`; const displayName = user.participantOne?.name || user.participantTwo?.name || 'User'; parent.textContent = displayName .split(" ") .map((n: string) => n[0]) .join(""); } }} />
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="font-semibold">
                                    {
                                        user.participantOne?.id === userData?.id ? user.participantTwo?.name : user.participantOne?.name
                                    }
                                </p>

                                <p className="text-sm text-gray-700">
                                    {user.participantOne?.id === userData?.id ? user.participantTwo?.phone : user.participantOne?.phone}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ChatSidebar;
