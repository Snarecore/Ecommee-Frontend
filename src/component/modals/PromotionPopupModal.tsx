"use client";

import React, { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import Link from "next/link";
import apiConfig from "../../config/api.json";

interface PopupData {
    id: string;
    title?: string;
    description?: string;
    image: string;
    link?: string;
    priority?: number;
    startDate?: string;
    endDate?: string;
    isActive?: boolean;
}

const getApiBaseUrl = (): string => {
    const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (envUrl && envUrl !== "undefined") return envUrl;
    if ((apiConfig as any)?.baseUrl) return (apiConfig as any).baseUrl;
    return "http://localhost:5000/api/v1/";
};

const PromotionPopupModal: React.FC = () => {
    const [popup, setPopup] = useState<PopupData | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const fetchActivePopup = async () => {
            try {
                const baseUrl = getApiBaseUrl().replace(/\/$/, "");
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 2000);

                const res = await fetch(`${baseUrl}/popups/active`, {
                    method: "GET",
                    cache: "no-store",
                    signal: controller.signal,
                    headers: {
                        "Pragma": "no-cache",
                        "Cache-Control": "no-cache, no-store"
                    }
                });
                clearTimeout(timeoutId);

                if (!res.ok) return;

                const json = await res.json();
                const activePopup: PopupData | null = json?.data || null;

                if (!activePopup || !activePopup.id || !activePopup.image) {
                    return;
                }

                // Check sessionStorage for this specific popup ID
                const dismissed = sessionStorage.getItem(`dismissed_popup_${activePopup.id}`);
                if (dismissed === "true") {
                    return;
                }

                if (isMounted) {
                    setPopup(activePopup);
                    // Small delay to ensure smooth entry animation
                    setTimeout(() => {
                        if (isMounted) setIsOpen(true);
                    }, 400);
                }
            } catch (err) {
                console.error("Failed to load active popup banner:", err);
            }
        };

        fetchActivePopup();

        return () => {
            isMounted = false;
        };
    }, []);

    const handleClose = () => {
        if (popup?.id) {
            sessionStorage.setItem(`dismissed_popup_${popup.id}`, "true");
        }
        setIsOpen(false);
    };

    if (!isOpen || !popup) {
        return null;
    }

    const hasValidLink = popup.link && popup.link !== "undefined" && popup.link !== "null" && popup.link.trim() !== "";

    return (
        <div 
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-fadeIn"
            onClick={handleClose}
        >
            <div 
                className="relative bg-transparent rounded-2xl shadow-2xl overflow-hidden max-w-[440px] w-full animate-scaleUp"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Cross Button */}
                <button
                    onClick={handleClose}
                    aria-label="Close Popup"
                    className="absolute top-2.5 right-2.5 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all duration-200 cursor-pointer shadow-lg hover:scale-105 focus:outline-none"
                >
                    <IoClose className="w-5 h-5" />
                </button>

                {/* Banner Image (Clean Image Modal) */}
                <div className="relative w-full overflow-hidden rounded-2xl bg-transparent">
                    {hasValidLink ? (
                        <Link 
                            href={popup.link!}
                            onClick={handleClose}
                            className="block group"
                        >
                            <img
                                src={popup.image}
                                alt={popup.title || "Special Announcement"}
                                className="w-full h-auto max-h-[80vh] object-contain rounded-2xl shadow-2xl transition-transform duration-300 group-hover:scale-[1.01]"
                            />
                        </Link>
                    ) : (
                        <img
                            src={popup.image}
                            alt={popup.title || "Special Announcement"}
                            className="w-full h-auto max-h-[80vh] object-contain rounded-2xl shadow-2xl"
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default PromotionPopupModal;
