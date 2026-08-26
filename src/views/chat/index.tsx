'use client';

import { useEffect, useState, useRef } from "react";
import { useAPI } from "@/hooks/useApi";
import apiConfig from "@/config/api.json";
import { userAtom } from "@/store/user-store";
import { useAtomValue } from "jotai";
import PageHeader from "@/component/card/PageHeader";
import { LuSend } from "react-icons/lu";
import { formatDate } from "@/utils/date-utils";

interface ChatMessage {
    id: string;
    senderId: string;
    senderRole: string;
    content: string;
    createdAt: string;
}

const Chat = () => {
    const { fetchData, postMutation } = useAPI();
    const userData = useAtomValue(userAtom);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputContent, setInputContent] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const loadConversation = async () => {
        try {
            const res = await fetchData({ apiUrl: apiConfig.messageLinks.myConversationUrl });
            if (res && res.messages) {
                setMessages(res.messages);
            }
        } catch (error) {
            console.error("Error fetching conversation:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadConversation();

        // Auto poll for new replies every 4 seconds
        const interval = setInterval(() => {
            loadConversation();
        }, 4000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!inputContent.trim() || isSending) return;

        const textToSend = inputContent.trim();
        setInputContent("");
        setIsSending(true);

        try {
            const res = await postMutation.mutateAsync({
                url: apiConfig.messageLinks.sendMessageUrl,
                body: { content: textToSend }
            });

            if (res) {
                await loadConversation();
            }
        } catch (error) {
            console.error("Error sending message:", error);
            setInputContent(textToSend);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="flex flex-col gap-6 max-w-5xl mx-auto py-6 px-4">
            <PageHeader
                headerTitle="Customer Support Chat"
                headerDescription="Have questions about products or your order? Chat directly with our Store Support Team."
            />

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[650px]">
                {/* Header */}
                <div className="px-6 py-4 bg-emerald-700 text-white flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg">
                            🎧
                        </div>
                        <div>
                            <p className="font-bold text-sm">Store Support Team</p>
                            <p className="text-xs text-emerald-100 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                                Online & Ready to Help
                            </p>
                        </div>
                    </div>
                </div>

                {/* Messages Box */}
                <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-gray-50/50">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                            Loading conversation...
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2 text-center p-6">
                            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl font-bold mb-2">
                                💬
                            </div>
                            <p className="font-bold text-gray-700">How can we help you today?</p>
                            <p className="text-xs text-gray-500 max-w-sm">
                                Send a message below to inquire about any product, order tracking, size advice, or store policy.
                            </p>
                        </div>
                    ) : (
                        messages.map((msg) => {
                            const isMe = msg.senderId === userData?.id || msg.senderRole === "customer";
                            return (
                                <div
                                    key={msg.id}
                                    className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                                >
                                    <div
                                        className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                                            isMe
                                                ? "bg-emerald-600 text-white rounded-br-none shadow-xs"
                                                : "bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-xs"
                                        }`}
                                    >
                                        {msg.content}
                                    </div>
                                    <span className="text-[10px] text-gray-400 mt-1 px-1">
                                        {formatDate(msg.createdAt)}
                                    </span>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Send Message Input */}
                <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-200 flex gap-3 items-center">
                    <input
                        type="text"
                        className="flex-1 bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-gray-800 placeholder-gray-400"
                        placeholder="Type your message here..."
                        value={inputContent}
                        onChange={(e) => setInputContent(e.target.value)}
                        disabled={isSending}
                    />
                    <button
                        type="submit"
                        disabled={!inputContent.trim() || isSending}
                        className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-5 py-3 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 shadow-xs cursor-pointer"
                    >
                        <span>Send</span>
                        <LuSend className="text-base" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Chat;
