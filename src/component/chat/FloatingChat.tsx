'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useAtomValue } from 'jotai';
import { userAtom } from '@/store/user-store';
import { useAPI, getUserToken } from '@/hooks/useApi';
import apiConfig from '@/config/api.json';
import Link from 'next/link';
import moment from 'moment';
import { 
    IoChatbubbleEllipsesSharp, 
    IoClose, 
    IoSend, 
    IoSparklesSharp,
    IoCheckmarkDoneSharp,
    IoPersonCircleOutline,
    IoRefreshOutline
} from 'react-icons/io5';
import { RiCustomerService2Fill } from 'react-icons/ri';

interface Message {
    id: string;
    conversationId: string;
    senderId: string;
    senderRole: 'customer' | 'admin';
    content: string;
    isRead: boolean;
    createdAt: string;
}

const FloatingChat = () => {
    const userData = useAtomValue(userAtom);
    const { fetchData, postMutation, handleApiMutation } = useAPI();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    const token = userData?.token || getUserToken();
    const isLoggedIn = !!token;

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchMyConversation = async (showLoading = true) => {
        const currentToken = userData?.token || getUserToken();
        if (!currentToken) return;
        if (showLoading) setIsLoading(true);

        try {
            const response = await fetchData({
                apiUrl: apiConfig.messageLinks.myConversationUrl
            });

            const fetchedMessages = response?.messages || response?.data?.messages || [];
            if (Array.isArray(fetchedMessages)) {
                setMessages(fetchedMessages);
                if (showLoading) {
                    setTimeout(scrollToBottom, 100);
                }
            }
        } catch (error) {
            console.error('Error fetching customer conversation:', error);
        } finally {
            if (showLoading) setIsLoading(false);
        }
    };

    // Live silent polling while chat window is open
    useEffect(() => {
        if (!isOpen || !isLoggedIn) return;

        // Fetch on open
        fetchMyConversation(true);

        // Silent live poll every 3 seconds for real-time admin replies
        const interval = setInterval(() => {
            fetchMyConversation(false);
        }, 3000);

        return () => clearInterval(interval);
    }, [isOpen, isLoggedIn]);

    const handleSendMessage = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const currentToken = userData?.token || getUserToken();
        if (!content.trim() || isSending || !currentToken) return;

        const messageText = content.trim();
        setContent('');
        setIsSending(true);

        // Optimistic UI update
        const optimisticMsg: Message = {
            id: `temp-${Date.now()}`,
            conversationId: '',
            senderId: userData?.id || 'me',
            senderRole: 'customer',
            content: messageText,
            isRead: false,
            createdAt: new Date().toISOString()
        };
        setMessages((prev) => [...prev, optimisticMsg]);
        setTimeout(scrollToBottom, 50);

        try {
            const result = await handleApiMutation({
                mutation: postMutation,
                url: apiConfig.messageLinks.sendMessageUrl,
                body: { content: messageText },
                showSuccessMessage: false,
                showErrorMessage: true,
                requiredFields: [{ key: 'content', value: 'Message', label: 'text' }]
            });

            if (result?.success || result?.data) {
                await fetchMyConversation(false);
                setTimeout(scrollToBottom, 100);
            } else {
                setContent(messageText);
            }
        } catch (error) {
            console.error('Error sending message:', error);
            setContent(messageText);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <>
            {/* Floating Action Button */}
            <div className="fixed bottom-6 right-6 z-50">
                {!isOpen && (
                    <button
                        onClick={() => setIsOpen(true)}
                        aria-label="Open Chat with Support"
                        className="group relative flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-primary to-orange-500 hover:from-orange-600 hover:to-orange-500 text-white rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer focus:outline-none focus:ring-4 focus:ring-orange-200"
                    >
                        <IoChatbubbleEllipsesSharp className="w-7 h-7 transition-transform group-hover:rotate-6" />
                        
                        {/* Live Ping Indicator */}
                        <span className="absolute -top-1 -right-1 flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span>
                        </span>

                        {/* Tooltip on hover */}
                        <span className="absolute right-16 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 shadow-lg">
                            Need help? Chat with us!
                        </span>
                    </button>
                )}
            </div>

            {/* Floating Chat Modal Box */}
            {isOpen && (
                <div className="fixed bottom-6 right-4 sm:right-6 z-50 w-[92vw] sm:w-[380px] h-[540px] max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    
                    {/* Header */}
                    <div className="bg-gradient-to-r from-primary to-orange-600 px-4 py-3.5 text-white flex items-center justify-between shadow-md">
                        <div className="flex items-center space-x-3">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center text-white text-xl border border-white/30">
                                    <RiCustomerService2Fill />
                                </div>
                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full"></span>
                            </div>
                            <div>
                                <h3 className="font-bold text-sm tracking-wide flex items-center gap-1.5">
                                    Store Support
                                    <IoSparklesSharp className="text-yellow-300 w-3.5 h-3.5" />
                                </h3>
                                <p className="text-[11px] text-white/80 font-medium">
                                    Ask anything about clothing & orders
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-1">
                            {isLoggedIn && (
                                <button
                                    onClick={() => fetchMyConversation(true)}
                                    disabled={isLoading}
                                    title="Refresh chat"
                                    className={`text-white/80 hover:text-white p-1.5 hover:bg-white/10 rounded-full transition-colors cursor-pointer ${isLoading ? 'animate-spin' : ''}`}
                                >
                                    <IoRefreshOutline className="w-4 h-4" />
                                </button>
                            )}
                            <button
                                onClick={() => setIsOpen(false)}
                                aria-label="Close Chat"
                                className="text-white/80 hover:text-white p-1.5 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                            >
                                <IoClose className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Chat Content Body */}
                    {!isLoggedIn ? (
                        /* Guest State — Prompt to Login */
                        <div className="flex-1 p-6 flex flex-col items-center justify-center text-center bg-gray-50/50">
                            <div className="w-16 h-16 rounded-full bg-orange-100 text-primary flex items-center justify-center text-3xl mb-4 shadow-xs">
                                <IoPersonCircleOutline />
                            </div>
                            <h4 className="font-bold text-gray-800 text-base mb-1">
                                Welcome to Customer Support
                            </h4>
                            <p className="text-xs text-gray-500 mb-6 leading-relaxed max-w-[260px]">
                                Please log in to your customer account to send messages, ask questions about products, and receive direct replies from our admin team.
                            </p>
                            <Link
                                href="/login"
                                onClick={() => setIsOpen(false)}
                                className="w-full max-w-[220px] py-2.5 bg-primary hover:bg-orange-600 text-white text-xs font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 text-center"
                            >
                                Login to Chat
                            </Link>
                        </div>
                    ) : (
                        /* Authenticated Customer Chat Thread */
                        <div className="flex-1 p-4 overflow-y-auto bg-gray-50/70 space-y-3">
                            {isLoading && messages.length === 0 ? (
                                <div className="flex items-center justify-center h-full text-xs text-gray-400">
                                    Loading your chat history...
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center p-6 text-gray-400">
                                    <div className="w-12 h-12 rounded-full bg-orange-100 text-primary flex items-center justify-center text-xl mb-2">
                                        💬
                                    </div>
                                    <p className="text-xs font-medium text-gray-600">No messages yet</p>
                                    <p className="text-[11px] text-gray-400 mt-1">
                                        Type a question below (e.g. size, fabric, delivery) and our team will get back to you!
                                    </p>
                                </div>
                            ) : (
                                messages.map((msg) => {
                                    const isMe = msg.senderRole === 'customer';

                                    return (
                                        <div
                                            key={msg.id}
                                            className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div className={`flex flex-col max-w-[80%] ${isMe ? 'items-end' : 'items-start'}`}>
                                                {!isMe && (
                                                    <span className="text-[10px] font-semibold text-orange-600 ml-1 mb-0.5 flex items-center gap-1">
                                                        Admin Support
                                                    </span>
                                                )}
                                                
                                                <div
                                                    className={`px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                                                        isMe
                                                            ? 'bg-primary text-white rounded-br-xs'
                                                            : 'bg-white text-gray-800 rounded-bl-xs border border-gray-200'
                                                    }`}
                                                >
                                                    <p className="whitespace-pre-line">{msg.content}</p>
                                                </div>

                                                <div className="flex items-center gap-1 mt-0.5 px-1">
                                                    <span className="text-[9px] text-gray-400">
                                                        {moment(msg.createdAt).isValid()
                                                            ? moment(msg.createdAt).format('h:mm A')
                                                            : moment().format('h:mm A')}
                                                    </span>
                                                    {isMe && (
                                                        <IoCheckmarkDoneSharp className="w-3 h-3 text-orange-400" />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    )}

                    {/* Input Bar (Only for logged in users) */}
                    {isLoggedIn && (
                        <form
                            onSubmit={handleSendMessage}
                            className="bg-white p-3 border-t border-gray-100 flex items-center space-x-2"
                        >
                            <input
                                type="text"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Type your question..."
                                disabled={isSending}
                                maxLength={2000}
                                className="flex-1 px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all disabled:opacity-60"
                            />
                            <button
                                type="submit"
                                disabled={isSending || !content.trim()}
                                aria-label="Send Message"
                                className="w-9 h-9 bg-primary hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-colors cursor-pointer shadow-sm shrink-0"
                            >
                                <IoSend className="w-3.5 h-3.5" />
                            </button>
                        </form>
                    )}
                </div>
            )}
        </>
    );
};

export default FloatingChat;
