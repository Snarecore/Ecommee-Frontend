'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAtomValue } from 'jotai';
import { userAtom } from '../store/user-store';
import { useQueryClient } from '@tanstack/react-query';
import { SocketCommand, SocketEvent } from '../types/socket.types';

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
    activeConversationId: string | null;
    setActiveConversationId: (id: string | null) => void;
    joinConversation: (conversationId: string) => void;
    leaveConversation: (conversationId: string) => void;
    joinProduct: (productId: string) => void;
    leaveProduct: (productId: string) => void;
    sendTypingStart: (conversationId: string) => void;
    sendTypingStop: (conversationId: string) => void;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
    activeConversationId: null,
    setActiveConversationId: () => {},
    joinConversation: () => {},
    leaveConversation: () => {},
    joinProduct: () => {},
    leaveProduct: () => {},
    sendTypingStart: () => {},
    sendTypingStop: () => {},
});

export const useSocket = () => useContext(SocketContext);

const getSocketUrl = (): string => {
    const raw = process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
    try {
        const url = new URL(raw);
        return `${url.protocol}//${url.host}`;
    } catch {
        return 'http://localhost:5000';
    }
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const user = useAtomValue(userAtom);
    const queryClient = useQueryClient();
    const [isConnected, setIsConnected] = useState(false);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const socketRef = useRef<Socket | null>(null);
    const activeConvoRef = useRef<string | null>(null);
    activeConvoRef.current = activeConversationId;

    useEffect(() => {
        const socketUrl = getSocketUrl();
        const socket = io(socketUrl, {
            withCredentials: true,
            transports: ['websocket', 'polling'],
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            auth: {
                token: (user as any)?.token || (user as any)?.accessToken || undefined
            }
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            setIsConnected(true);
            // Re-join active conversation room on initial connect or reconnect
            if (activeConvoRef.current) {
                socket.emit(SocketCommand.JOIN_CONVERSATION, { conversationId: activeConvoRef.current });
            }
        });

        socket.on('disconnect', () => {
            setIsConnected(false);
        });

        // Reconnect Handler: Re-join active conversation & targeted React Query resync
        socket.on('reconnect', () => {
            setIsConnected(true);
            if (activeConvoRef.current) {
                socket.emit(SocketCommand.JOIN_CONVERSATION, { conversationId: activeConvoRef.current });
            }
            // Targeted resync on active views only
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['customer-conversation'] });
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
            setIsConnected(false);
        };
    }, [user?.id, (user as any)?.token, queryClient]);

    const joinConversation = (conversationId: string) => {
        if (!conversationId) return;
        setActiveConversationId(conversationId);
        if (socketRef.current?.connected) {
            socketRef.current.emit(SocketCommand.JOIN_CONVERSATION, { conversationId });
        }
    };

    const leaveConversation = (conversationId: string) => {
        if (!conversationId) return;
        if (activeConversationId === conversationId) {
            setActiveConversationId(null);
        }
        if (socketRef.current?.connected) {
            socketRef.current.emit(SocketCommand.LEAVE_CONVERSATION, { conversationId });
        }
    };

    const joinProduct = (productId: string) => {
        if (!productId || !socketRef.current?.connected) return;
        socketRef.current.emit(SocketCommand.JOIN_PRODUCT, { productId });
    };

    const leaveProduct = (productId: string) => {
        if (!productId || !socketRef.current?.connected) return;
        socketRef.current.emit(SocketCommand.LEAVE_PRODUCT, { productId });
    };

    const sendTypingStart = (conversationId: string) => {
        if (!conversationId || !socketRef.current?.connected) return;
        socketRef.current.emit(SocketCommand.TYPING_START, { conversationId });
    };

    const sendTypingStop = (conversationId: string) => {
        if (!conversationId || !socketRef.current?.connected) return;
        socketRef.current.emit(SocketCommand.TYPING_STOP, { conversationId });
    };

    return (
        <SocketContext.Provider
            value={{
                socket: socketRef.current,
                isConnected,
                activeConversationId,
                setActiveConversationId,
                joinConversation,
                leaveConversation,
                joinProduct,
                leaveProduct,
                sendTypingStart,
                sendTypingStop
            }}
        >
            {children}
        </SocketContext.Provider>
    );
};
