import { useEffect, useState, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { FiBell, FiCheck, FiTruck, FiPackage, FiCheckCircle, FiXCircle } from "react-icons/fi";

// Native replacement for moment().fromNow()
const timeAgo = (dateStr: string): string => {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "just now";
  const diffMs = Date.now() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return "just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 30) return `${diffDay}d ago`;
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date);
};
import {
  fetchNotificationsApi,
  markNotificationReadApi,
  markAllNotificationsReadApi
} from "../../../../services/notification-service";
import { NotificationItem, NotificationType } from "../../../../interface/notification.interface";
import { useAtomValue } from "jotai";
import { userAtom } from "../../../../store/user-store";

interface Props {
  variant?: "light" | "green";
}

const NotificationDropdown: React.FC<Props> = ({ variant = "light" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAtomValue(userAtom);

  const { data, refetch } = useQuery({
    queryKey: ["notifications", user?.id || user?._id],
    queryFn: fetchNotificationsApi,
    enabled: Boolean(user),
    refetchInterval: user ? 15000 : false,
    staleTime: 5000
  });

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  useEffect(() => {
    const handleUpdate = () => {
      refetch();
    };

    window.addEventListener("notifications_updated", handleUpdate);
    window.addEventListener("orders_updated", handleUpdate);

    return () => {
      window.removeEventListener("notifications_updated", handleUpdate);
      window.removeEventListener("orders_updated", handleUpdate);
    };
  }, [refetch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = async (notif: NotificationItem) => {
    if (!notif.isRead) {
      await markNotificationReadApi(notif._id);
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    }
    setIsOpen(false);

    if (notif.orderId) {
      const cleanOrderId = notif.orderId.replace(/^#/, "");
      router.push(`/customer-dashboard?tab=order&orderId=${cleanOrderId}`);
    } else {
      router.push("/customer-dashboard?tab=order");
    }
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsReadApi();
    refetch();
  };

  const getTypeIcon = (type: NotificationType) => {
    switch (type) {
      case "ORDER_PROCESSING":
        return <FiPackage className="text-amber-500 text-lg flex-shrink-0" />;
      case "ORDER_SHIPPED":
        return <FiTruck className="text-blue-500 text-lg flex-shrink-0" />;
      case "ORDER_DELIVERED":
        return <FiCheckCircle className="text-green-500 text-lg flex-shrink-0" />;
      case "ORDER_CANCELLED":
        return <FiXCircle className="text-red-500 text-lg flex-shrink-0" />;
      default:
        return <FiBell className="text-[var(--color-green-primary)] text-lg flex-shrink-0" />;
    }
  };

  const iconClass =
    variant === "green"
      ? "text-white hover:bg-white/10 rounded-md sm:rounded-lg"
      : "text-[var(--color-icon)] dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 transition-colors focus:outline-none flex items-center justify-center cursor-pointer ${iconClass}`}
        title="Notifications"
        aria-label="Notifications"
      >
        <FiBell className="text-xl sm:text-2xl" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 min-w-4 px-1.5 flex items-center justify-center shadow-md">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 shadow-2xl rounded-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden text-gray-800 dark:text-gray-100 animate-in fade-in duration-200">
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-[var(--color-green-primary)] dark:text-green-400">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="bg-green-100 dark:bg-green-900/40 text-[var(--color-green-primary)] dark:text-green-300 text-xs font-semibold px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-[var(--color-green-primary)] dark:text-green-400 hover:underline flex items-center gap-1 font-medium cursor-pointer"
              >
                <FiCheck /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700/50">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
                <FiBell className="mx-auto text-3xl mb-2 text-gray-300 dark:text-gray-600" />
                No notifications yet
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3.5 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/60 cursor-pointer transition-colors ${
                    !notif.isRead ? "bg-green-50/40 dark:bg-gray-700/30" : ""
                  }`}
                >
                  <div className="mt-0.5">{getTypeIcon(notif.type)}</div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className={`text-xs font-semibold truncate ${!notif.isRead ? "text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"}`}>
                        {notif.title}
                      </p>
                      <span className="text-[10px] text-gray-400 whitespace-nowrap">
                        {timeAgo(notif.createdAt)}
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5 line-clamp-2">
                      {notif.message}
                    </p>
                  </div>

                  {!notif.isRead && (
                    <span className="w-2 h-2 rounded-full bg-[var(--color-green-primary)] flex-shrink-0 mt-1" />
                  )}
                </div>
              ))
            )}
          </div>

          <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700 text-center">
            <button
              onClick={() => {
                setIsOpen(false);
                router.push("/customer-dashboard?tab=order");
              }}
              className="text-xs font-medium text-[var(--color-green-primary)] dark:text-green-400 hover:underline cursor-pointer"
            >
              View Order Dashboard →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
