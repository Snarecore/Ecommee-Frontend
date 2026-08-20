'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useAtomValue } from 'jotai';
import { userAtom } from '@/store/user-store';
import { getUserToken } from '@/hooks/useApi';
import apiConfig from '@/config/api.json';
import Image from 'next/image';
import moment from 'moment';
import {
    IoChatbubbleEllipsesSharp,
    IoClose,
    IoSend,
    IoSparklesSharp,
    IoCheckmarkDoneSharp,
    IoRefreshOutline,
    IoImageOutline
} from 'react-icons/io5';
import { RiCustomerService2Fill } from 'react-icons/ri';
import { IoMdClose } from 'react-icons/io';

interface Message {
    id: string;
    conversationId: string;
    senderId: string;
    senderRole: 'customer' | 'admin';
    content: string;
    isRead: boolean;
    createdAt: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1/';

// Detect if content is an image URL
const isImageUrl = (text: string) => {
    return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg|bmp)(\?.*)?$/i.test(text.trim());
};

const getOrCreateGuestUser = async () => {
    if (typeof window === 'undefined') return null;
    try {
        const savedGuest = localStorage.getItem('guest_user_data');
        if (savedGuest) {
            const guest = JSON.parse(savedGuest);
            if (guest?.token && guest?.id) return guest;
        }

        const randomId = Math.random().toString(36).substring(2, 11);
        const email = `guest_${randomId}@bazaarbound-visitor.com`;
        const phone = `017${Math.floor(10000000 + Math.random() * 90000000)}`;
        const password = `guestPassword_${randomId}`;

        const regResponse = await fetch(`${BASE_URL}auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Guest Visitor', email, phone, password, confirmPassword: password, role: 'customer' })
        });

        if (!regResponse.ok) {
            const errBody = await regResponse.json().catch(() => ({}));
            console.error('Silent guest registration failed:', regResponse.status, errBody);
            return null;
        }

        const loginResponse = await fetch(`${BASE_URL}auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (!loginResponse.ok) {
            const errBody = await loginResponse.json().catch(() => ({}));
            console.error('Silent guest login failed:', loginResponse.status, errBody);
            return null;
        }

        const loginData = await loginResponse.json();
        const guestToken = loginData?.data?.accessToken || loginData?.accessToken;
        const guestId = loginData?.data?.user?.id || loginData?.user?.id;

        if (guestToken) {
            const guestInfo = { id: guestId, token: guestToken, name: 'Guest Visitor' };
            localStorage.setItem('guest_user_data', JSON.stringify(guestInfo));
            return guestInfo;
        }
    } catch (error) {
        console.error('Error in getOrCreateGuestUser:', error);
    }
    return null;
};

const FloatingChat = () => {
    const userData = useAtomValue(userAtom);
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [guestUser, setGuestUser] = useState<{ id: string; token: string; name: string } | null>(null);
    const [isGuestLoading, setIsGuestLoading] = useState(false);

    // Image preview state
    const [pendingImage, setPendingImage] = useState<File | null>(null);
    const [pendingImagePreview, setPendingImagePreview] = useState<string | null>(null);

    const token = userData?.token || getUserToken() || guestUser?.token;
    const isLoggedIn = !!token;

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        const checkAndCreateGuest = async () => {
            const hasToken = userData?.token || getUserToken();
            if (!hasToken && !guestUser && !isGuestLoading) {
                setIsGuestLoading(true);
                const guest = await getOrCreateGuestUser();
                if (guest) setGuestUser(guest);
                setIsGuestLoading(false);
            }
        };
        checkAndCreateGuest();
    }, [userData, guestUser, isGuestLoading]);

    const fetchMyConversation = async (showLoading = true) => {
        const currentToken = userData?.token || getUserToken() || guestUser?.token;
        if (!currentToken) return;
        if (showLoading) setIsLoading(true);

        try {
            const response = await fetch(`${BASE_URL}${apiConfig.messageLinks.myConversationUrl}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentToken}` }
            });
            if (!response.ok) return;
            const data = await response.json();
            const fetchedMessages = data?.data?.messages || data?.messages || [];
            if (Array.isArray(fetchedMessages)) {
                setMessages(fetchedMessages);
                if (showLoading) setTimeout(scrollToBottom, 100);
            }
        } catch (error) {
            console.error('Error fetching conversation:', error);
        } finally {
            if (showLoading) setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!isOpen || !isLoggedIn) return;
        fetchMyConversation(true);
        const interval = setInterval(() => fetchMyConversation(false), 3000);
        return () => clearInterval(interval);
    }, [isOpen, isLoggedIn]);

    // Upload image to backend, returns CDN URL
    const uploadImage = async (file: File, currentToken: string): Promise<string | null> => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(`${BASE_URL}message/upload`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${currentToken}` },
                body: formData
            });
            if (!response.ok) return null;
            const data = await response.json();
            return data?.data?.url || null;
        } catch (error) {
            console.error('Error uploading image:', error);
            return null;
        }
    };

    const sendMessage = async (messageText: string) => {
        const currentToken = userData?.token || getUserToken() || guestUser?.token;
        if (!messageText.trim() || isSending || !currentToken) return;

        const optimisticMsg: Message = {
            id: `temp-${Date.now()}`,
            conversationId: '',
            senderId: userData?.id || guestUser?.id || 'me',
            senderRole: 'customer',
            content: messageText,
            isRead: false,
            createdAt: new Date().toISOString()
        };
        setMessages(prev => [...prev, optimisticMsg]);
        setTimeout(scrollToBottom, 50);

        try {
            const response = await fetch(`${BASE_URL}${apiConfig.messageLinks.sendMessageUrl}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentToken}` },
                body: JSON.stringify({ content: messageText })
            });
            const result = await response.json();
            if (response.ok && (result?.success || result?.data)) {
                await fetchMyConversation(false);
                setTimeout(scrollToBottom, 100);
            } else {
                setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
            }
        } catch (error) {
            console.error('Error sending message:', error);
            setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
        }
    };

    const handleSendMessage = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const currentToken = userData?.token || getUserToken() || guestUser?.token;
        if (isSending || !currentToken) return;

        setIsSending(true);

        // If there's a pending image, upload first then send its URL
        if (pendingImage) {
            const uploadedUrl = await uploadImage(pendingImage, currentToken);
            setPendingImage(null);
            setPendingImagePreview(null);
            if (uploadedUrl) {
                await sendMessage(uploadedUrl);
            }
            // If there's also text, send separately
            if (content.trim()) {
                setContent('');
                await sendMessage(content.trim());
            }
        } else if (content.trim()) {
            const messageText = content.trim();
            setContent('');
            await sendMessage(messageText);
        }

        setIsSending(false);
    };

    // Handle file input selection
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            alert('Only image files are supported.');
            return;
        }
        setPendingImage(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setPendingImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // Handle clipboard paste (Ctrl+V image)
    const handlePaste = useCallback((e: React.ClipboardEvent<HTMLInputElement>) => {
        const items = e.clipboardData?.items;
        if (!items) return;
        for (const item of Array.from(items)) {
            if (item.type.startsWith('image/')) {
                const file = item.getAsFile();
                if (!file) continue;
                setPendingImage(file);
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPendingImagePreview(reader.result as string);
                };
                reader.readAsDataURL(file);
                e.preventDefault();
                return;
            }
        }
    }, []);

    const clearPendingImage = () => {
        setPendingImage(null);
        setPendingImagePreview(null);
    };

    return (
        <>
            {/* Floating Action Button */}
            <div className="fixed bottom-6 right-6 z-50">
                {!isOpen && (
                    <button
                        onClick={() => setIsOpen(true)}
                        aria-label="Open Chat with Support"
                        className="group relative flex items-center justify-center w-14 h-14 bg-[var(--color-green-primary)] hover:bg-[#428146] text-white rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer focus:outline-none focus:ring-4 focus:ring-green-100"
                    >
                        <IoChatbubbleEllipsesSharp className="w-7 h-7 transition-transform group-hover:rotate-6" />
                        <span className="absolute -top-1 -right-1 flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span>
                        </span>
                        <span className="absolute right-16 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 shadow-lg">
                            Need help? Chat with us!
                        </span>
                    </button>
                )}
            </div>

            {/* Floating Chat Modal */}
            {isOpen && (
                <div className="fixed bottom-6 right-4 sm:right-6 z-50 w-[92vw] sm:w-[380px] h-[560px] max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                    {/* Header */}
                    <div className="bg-gradient-to-r from-[var(--color-green-primary)] to-[#428146] px-4 py-3.5 text-white flex items-center justify-between shadow-md flex-shrink-0">
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
                                <p className="text-[11px] text-white/80 font-medium">Ask anything about clothing & orders</p>
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

                    {/* Chat Body */}
                    {!isLoggedIn ? (
                        <div className="flex-1 p-6 flex flex-col items-center justify-center text-center bg-gray-50/50">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-green-primary)] mb-4"></div>
                            <p className="text-xs text-gray-500">Connecting to secure chat...</p>
                        </div>
                    ) : (
                        <div className="flex-1 p-4 overflow-y-auto bg-gray-50/70 space-y-3">
                            {isLoading && messages.length === 0 ? (
                                <div className="flex items-center justify-center h-full text-xs text-gray-400">Loading chat history...</div>
                            ) : messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center p-6 text-gray-400">
                                    <div className="w-12 h-12 rounded-full bg-green-50 text-[var(--color-green-primary)] flex items-center justify-center text-xl mb-2">💬</div>
                                    <p className="text-xs font-medium text-gray-600">No messages yet</p>
                                    <p className="text-[11px] text-gray-400 mt-1">Type a question or share an image — our team will get back to you!</p>
                                </div>
                            ) : (
                                messages.map((msg) => {
                                    const isMe = msg.senderRole === 'customer';
                                    const isImg = isImageUrl(msg.content);

                                    return (
                                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`flex flex-col max-w-[80%] ${isMe ? 'items-end' : 'items-start'}`}>
                                                {!isMe && (
                                                    <span className="text-[10px] font-semibold text-[var(--color-green-primary)] ml-1 mb-0.5">Admin Support</span>
                                                )}
                                                <div
                                                    className={`rounded-2xl overflow-hidden shadow-xs ${
                                                        isImg
                                                            ? 'bg-transparent p-0'
                                                            : isMe
                                                                ? 'bg-[var(--color-green-primary)] text-white rounded-br-xs px-3.5 py-2.5 text-xs leading-relaxed'
                                                                : 'bg-white text-gray-800 rounded-bl-xs border border-gray-200 px-3.5 py-2.5 text-xs leading-relaxed'
                                                    }`}
                                                >
                                                    {isImg ? (
                                                        <a href={msg.content} target="_blank" rel="noopener noreferrer">
                                                            <img
                                                                src={msg.content}
                                                                alt="Shared image"
                                                                className="max-w-[220px] max-h-[200px] rounded-2xl object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                                            />
                                                        </a>
                                                    ) : (
                                                        <p className="whitespace-pre-line">{msg.content}</p>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1 mt-0.5 px-1">
                                                    <span className="text-[9px] text-gray-400">
                                                        {moment(msg.createdAt).isValid() ? moment(msg.createdAt).format('h:mm A') : moment().format('h:mm A')}
                                                    </span>
                                                    {isMe && <IoCheckmarkDoneSharp className="w-3 h-3 text-green-500" />}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    )}

                    {/* Input Bar */}
                    {isLoggedIn && (
                        <div className="bg-white border-t border-gray-100 flex-shrink-0">
                            {/* Image preview area */}
                            {pendingImagePreview && (
                                <div className="px-3 pt-2 flex items-start gap-2">
                                    <div className="relative inline-block">
                                        <img
                                            src={pendingImagePreview}
                                            alt="Image to send"
                                            className="h-16 w-16 rounded-lg object-cover border border-gray-200"
                                        />
                                        <button
                                            onClick={clearPendingImage}
                                            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-700 text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-red-500 transition-colors"
                                        >
                                            <IoMdClose className="w-3 h-3" />
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-1">Image ready to send</p>
                                </div>
                            )}

                            <form onSubmit={handleSendMessage} className="p-3 flex items-center space-x-2">
                                {/* Hidden file input */}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />

                                {/* Image attachment button */}
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    title="Attach an image"
                                    className="w-9 h-9 text-gray-400 hover:text-[var(--color-green-primary)] rounded-xl flex items-center justify-center transition-colors cursor-pointer shrink-0"
                                >
                                    <IoImageOutline className="w-5 h-5" />
                                </button>

                                <input
                                    type="text"
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    onPaste={handlePaste}
                                    placeholder={pendingImage ? 'Add a caption...' : 'Type or paste an image...'}
                                    disabled={isSending}
                                    maxLength={2000}
                                    className="flex-1 px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-green-primary)] focus:bg-white transition-all disabled:opacity-60"
                                />
                                <button
                                    type="submit"
                                    disabled={isSending || (!content.trim() && !pendingImage)}
                                    aria-label="Send Message"
                                    className="w-9 h-9 bg-[var(--color-green-primary)] hover:bg-[#428146] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-colors cursor-pointer shadow-sm shrink-0"
                                >
                                    {isSending ? (
                                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <IoSend className="w-3.5 h-3.5" />
                                    )}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            )}
        </>
    );
};

export default FloatingChat;
