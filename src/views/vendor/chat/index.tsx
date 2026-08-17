import { useEffect, useState } from "react";
import { useAPI } from "../../../hooks/useApi";
import apiConfig from "../../../config/api.json";
import { vendorMessageQueryKey } from "../../../config/query-key";
import PageHeader from "../../../component/card/PageHeader";
import Button from "../../../component/buttons/ButtonStyleOne";
import Modal from "../../../component/modals/Modal";
import { userAtom } from "../../../store/user-store";
import { useAtomValue } from "jotai";
import SelectInput from "../../../component/inputs/SelectField";
import ChatSidebar from "./components/ChatSidebar";
import ChatWindow from "./components/ChatWindow";

const initialFieldValues = {
    content: "",
};

const requiredFields: any = [
    { key: "receiverId", value: "admin", label: "dropdown" },
    { key: "content", value: "message", label: "text" },
    { key: "senderId", value: "senderId" },
    { key: "senderRole", value: "senderRole" },
    { key: "receiverRole", value: "receiverRole" },
];

const Chat = () => {
    const { postMutation, handleApiMutation, fetchData } = useAPI();
    const [sendMessageModal, isSendMessageModal] = useState(false);
    const [fieldValues, setFieldValues] = useState(initialFieldValues);
    const adminMessageApiUrl = apiConfig.people.adminMessageUrl;
    const userData = useAtomValue(userAtom);
    const [adminList, setAdminList] = useState([]);
    const [selectedAdmin, setSelectedAdmin] = useState<{ label: string; value: string } | null>(null);
    const [isMessageLoading, setIsMessageLoading] = useState(false);
    const closeMessageModal = () => isSendMessageModal(false);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        const getInboxListApiUrl = () => {
            const apiUrl = `${apiConfig.vendor.vendorMessageUrl}`;
            return apiUrl;
        }
        getInboxListApiUrl()
    }, []);

    useEffect(() => {
        const getAdminList = async () => {
            const adminData = await fetchData({ apiUrl: `${apiConfig.people.adminListUrl}?role=admin` });
            setAdminList(adminData.adminList)
        }
        getAdminList();
    }, [])

    const formattedAdminList = Array.isArray(adminList) ? adminList.map((admin: any) => ({
        label: admin.name || admin.email || `Admin ${admin.id}`,
        value: admin.id
    })) : [];

    const handleAdminChange = (selected: { label: string; value: string }) => {
        setSelectedAdmin(selected);
    };
    
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

            const payload = {
                ...fieldValues,
                senderId: userData?.id,
                senderRole: userData?.role,
                receiverId: selectedAdmin?.value,
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
                setSelectedAdmin(null);
                closeMessageModal();
            }
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setIsMessageLoading(false);
        }
    };

    return (
        <>
            <div className="flex flex-col gap-8">
                <div className="flex items-center justify-between flex-wrap">
                    <PageHeader
                        headerTitle="Chat"
                        headerDescription="Manage your chats"
                    />
                    <Button label="Start New Conversation" onClick={() => isSendMessageModal(!sendMessageModal)} color="var(--color-primary)" hoverColor="var(--color-primary-hover)" />
                </div>

                <div className="flex gap-5">
                    <div className="w-[320px] bg-white h-[750px] overflow-hidden overflow-y-auto">
                        <ChatSidebar setSelectedUser={setSelectedUser} selectedUser={selectedUser} />
                    </div>

                    <div className="flex-1 bg-gray-50">
                        {selectedUser ? (
                            <ChatWindow selectedUser={selectedUser} />
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500">
                                Select a user to start chatting
                            </div>
                        )}
                    </div>
                </div>

                {
                    sendMessageModal && (
                        <Modal
                            isOpen={sendMessageModal}
                            onClose={closeMessageModal}
                            title={"Message to the Admin"}
                        >
                            <div className="space-y-4">
                                <div>
                                    <SelectInput
                                        label="Select Admin"
                                        value={selectedAdmin}
                                        options={formattedAdminList}
                                        onChange={handleAdminChange}
                                        placeholder="Select admin"
                                        required
                                    />
                                </div>

                                <div>
                                    <p>Message <span className="text-red-500 font-bold">*</span></p>
                                    <textarea
                                        className="w-full border border-gray-300 rounded-md p-2 mt-1"
                                        name="content"
                                        value={fieldValues.content}
                                        required
                                        rows={4}
                                        placeholder="Type your message..."
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="flex justify-end gap-3 mt-6">
                                    <Button
                                        label="Cancel"
                                        onClick={closeMessageModal}
                                        color="var(--color-secondary)"
                                        hoverColor="var(--color-secondary-hover)"
                                    />
                                    <Button
                                        label="Send"
                                        onClick={handleSubmitMessage}
                                        color="var(--color-primary)"
                                        hoverColor="var(--color-primary-hover)"
                                        isLoading={isMessageLoading}
                                        disabled={isMessageLoading}
                                    />
                                </div>
                            </div>
                        </Modal>
                    )
                }

            </div>
        </>
    );
};

export default Chat;
