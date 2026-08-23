import Image from "next/image";
import { useEffect, useState } from "react";
import { LuSend } from "react-icons/lu";
import { useAPI } from "@/hooks/useApi";
import apiConfig from "@/config/api.json";
import { useAtomValue } from "jotai";
import { userAtom } from "@/store/user-store";
import avatar from "@/assets/avatar.png";
import { formatDate } from "@/utils/date-utils";
import { vendorMessageQueryKey } from "@/config/query-key";

const initialFieldValues = {
    content: "",
};

const requiredFields: any = [
    { key: "receiverId", value: "admin" },
    { key: "content", value: "message", label: "text" },
    { key: "senderId", value: "senderId" },
    { key: "senderRole", value: "senderRole" },
    { key: "receiverRole", value: "receiverRole" },
];

interface Message {
    id: number;
    content: string;
    time: string;
    isMe: boolean;
    avatar?: string;
    bgColor?: string;
    senderId: string;
    createdAt: string;
    participantOne: any;
}

interface SelectedUser {
    id: string;
    name?: string;
    avatar?: string;
    participantOneId: string;
    participantTwoId: string;
    participantOne?: {
        name: string;
        email: string;
        image?: string;
    };
    participantTwo?: {
        name: string;
        email: string;
        image?: string;
    };
}

const ChatWindow = ({ selectedUser }: { selectedUser: SelectedUser }) => {
    const { fetchData, postMutation, handleApiMutation } = useAPI();
    const [participantConversations, setPerticipantConversations] = useState<Message[]>([]);
    const userData = useAtomValue(userAtom);
    // @ts-ignore
    const [isMessageLoading, setIsMessageLoading] = useState(false);
    const adminMessageApiUrl = apiConfig.people.adminMessageUrl;
    const [fieldValues, setFieldValues] = useState(initialFieldValues);

    useEffect(() => {
        const getConversationUsers = async () => {
            if (!selectedUser?.id) return;

            const response = await fetchData({ apiUrl: `${apiConfig.messageLinks.converstionThreadUrl}?conversationId=${selectedUser.id}` });
            if (response) {
                const processedMessages = response.map((msg: Message) => ({
                    ...msg,
                    isMe: msg.senderId === userData?.id
                }));
                setPerticipantConversations(processedMessages);
            }
        }
        getConversationUsers();
    }, [selectedUser])


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFieldValues(prev => ({
            ...prev,
            [name]: value
        }));
    };


    const handleSubmitMessage = async () => {
        setIsMessageLoading(true);
        try {
            const mutation = postMutation;
            const url = adminMessageApiUrl;
            const receiverId = (selectedUser.participantOneId === userData?.id ? selectedUser.participantTwoId : selectedUser.participantOneId)

            const payload = {
                ...fieldValues,
                senderId: userData?.id,
                senderRole: userData?.role,
                receiverId: receiverId,
                receiverRole: "admin",
            };

            const result = await handleApiMutation({
                mutation,
                url,
                body: payload,
                invalidateQueryKey: [vendorMessageQueryKey],
                showSuccessMessage: true,
                showErrorMessage: true,
                requiredFields
            });

            if (result?.success) {
                setFieldValues(initialFieldValues);
            }
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setIsMessageLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmitMessage();
        }
    };

    return (
        <div className="h-full flex flex-col bg-gray-50">

            <div className="bg-white px-6 py-2 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden">
                        <Image src={selectedUser?.participantTwo?.image || avatar} alt="Anthony Lewis" className="w-full h-full object-cover" width={500} height={500} onError={(e) => { const target = e.target as HTMLImageElement; target.style.display = 'none'; const parent = target.parentElement; if (parent) { parent.className = 'w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold'; parent.textContent = 'AL'; } }} />
                    </div>
                    <div>
                        <p className="font-semibold">
                            {selectedUser?.participantTwoId === userData?.id ? selectedUser?.participantOne?.name : selectedUser?.participantTwo?.name}
                        </p>
                        <p className="text-sm text-gray-500">
                            {selectedUser?.participantTwoId === userData?.id ? selectedUser?.participantOne?.email : selectedUser?.participantTwo?.email}
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex-1 px-6 py-4 max-h-[610px] overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-orange-500 scrollbar-track-transparent">
                {participantConversations?.map((msg) => (
                    <div key={msg.id}>
                        <div className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${msg.isMe ? 'flex-row-reverse space-x-reverse' : ''}`}>
                                {!msg.isMe && (
                                    <div className="w-8 h-8 rounded-full overflow-hidden">
                                        <Image src={msg.participantOne?.image || avatar} alt="User Avatar" className="w-full h-full object-cover" width={500} height={500} onError={(e) => { const target = e.target as HTMLImageElement; target.style.display = 'none'; const parent = target.parentElement; if (parent) { parent.className = `w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-xs ${msg.bgColor}`; parent.textContent = 'AL'; } }} />
                                    </div>
                                )}

                                <div className="flex flex-col">
                                    {/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg|bmp)(\?.*)?$/i.test(msg.content?.trim()) ? (
                                        <a href={msg.content} target="_blank" rel="noopener noreferrer">
                                            <img
                                                src={msg.content}
                                                alt="Shared image"
                                                className="max-w-[220px] max-h-[200px] rounded-2xl object-cover cursor-pointer hover:opacity-90 transition-opacity border border-gray-200"
                                            />
                                        </a>
                                    ) : (
                                        <div className={`px-4 py-2 rounded-2xl ${msg.isMe
                                            ? 'bg-blue-500 text-white rounded-br-md'
                                            : 'bg-white text-gray-900 rounded-bl-md border border-gray-200'
                                            }`}>
                                            <p className="text-sm whitespace-pre-line">{msg.content}</p>
                                        </div>
                                    )}
                                    <div className={`flex items-center mt-1 space-x-1 ${msg.isMe ? 'justify-end' : 'justify-start ml-1'}`}>
                                        <span className="text-xs text-gray-500">{formatDate(msg.createdAt)}</span>
                                        {msg.isMe && <span className="text-xs text-gray-500">You</span>}
                                        {msg.isMe && (
                                            <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                                <div className="w-2 h-2 bg-white rounded-full"></div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white px-6 py-4 border-t border-gray-200">
                <div className="flex items-center space-x-3">
                    <div className="flex-1 relative">
                        <input
                            name="content"
                            type="text"
                            value={fieldValues.content}
                            onChange={handleChange}
                            onKeyPress={handleKeyPress}
                            placeholder="Type Your Message"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <button
                        onClick={handleSubmitMessage}
                        className="bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-lg transition-colors cursor-pointer"
                    >
                        <LuSend className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatWindow;
