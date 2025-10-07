"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/lib/training-notifications";

interface Notification {
  id: string;
  employeeName: string;
  courseName: string;
  type: "expiring-30" | "expiring-14" | "expiring-7" | "expired";
  read: boolean;
  createdAt: any;
  expiryDate: any;
}

interface NotificationBellProps {
  companyId: string;
}

export default function NotificationBell({ companyId }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadNotifications = async () => {
    try {
      const data = await getNotifications(companyId, false);
      setNotifications(data as Notification[]);
      setUnreadCount(data.filter((n: any) => !n.read).length);
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
  };

  useEffect(() => {
    if (companyId) {
      loadNotifications();
      // Refresh notifications every 5 minutes
      const interval = setInterval(loadNotifications, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationRead(notificationId);
      await loadNotifications();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    setLoading(true);
    try {
      await markAllNotificationsRead(companyId);
      await loadNotifications();
    } catch (error) {
      console.error("Error marking all as read:", error);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationMessage = (notification: Notification) => {
    const expiryDate = notification.expiryDate?.toDate
      ? notification.expiryDate.toDate()
      : new Date(notification.expiryDate);
    const dateStr = expiryDate.toLocaleDateString();

    switch (notification.type) {
      case "expired":
        return `${notification.employeeName}'s ${notification.courseName} has expired`;
      case "expiring-7":
        return `${notification.employeeName}'s ${notification.courseName} expires in 7 days (${dateStr})`;
      case "expiring-14":
        return `${notification.employeeName}'s ${notification.courseName} expires in 14 days (${dateStr})`;
      case "expiring-30":
        return `${notification.employeeName}'s ${notification.courseName} expires in 30 days (${dateStr})`;
      default:
        return `${notification.employeeName}'s ${notification.courseName} needs attention`;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "expired":
        return "text-red-600";
      case "expiring-7":
        return "text-orange-600";
      case "expiring-14":
      case "expiring-30":
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                disabled={loading}
              >
                Mark all as read
              </Button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No notifications
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted ${
                      !notification.read ? "bg-blue-50 border-blue-200" : "bg-background"
                    }`}
                    onClick={() => handleMarkAsRead(notification.id)}
                  >
                    <p
                      className={`text-sm ${getNotificationColor(notification.type)} ${
                        !notification.read ? "font-medium" : ""
                      }`}
                    >
                      {getNotificationMessage(notification)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {notification.createdAt?.toDate
                        ? notification.createdAt.toDate().toLocaleString()
                        : new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
