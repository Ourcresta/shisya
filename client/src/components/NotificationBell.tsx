import { useState, useEffect, useCallback, useMemo } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Bell, Package, Tag, CreditCard, Award, BookOpen, AlertCircle, Info, Check, X, ClipboardCheck, FileText, Code2, ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { getCourseProgress } from "@/lib/progress";
import { getTestAttempts } from "@/lib/testAttempts";
import { getAllSubmissions } from "@/lib/submissions";
import { getLabProgressStore } from "@/lib/labProgress";
import type { Notification, Course } from "@shared/schema";

const POLL_INTERVAL = 30000;

function getNotificationIcon(type: string) {
  switch (type) {
    case "product":
      return <Package className="w-4 h-4 text-blue-500" />;
    case "offer":
      return <Tag className="w-4 h-4 text-purple-500" />;
    case "payment":
      return <CreditCard className="w-4 h-4 text-green-500" />;
    case "payment_failed":
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    case "course":
      return <BookOpen className="w-4 h-4 text-amber-500" />;
    case "certificate":
      return <Award className="w-4 h-4 text-yellow-500" />;
    case "system":
    default:
      return <Info className="w-4 h-4 text-muted-foreground" />;
  }
}

function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
}

interface PendingActionItem {
  courseId: number;
  title: string;
  type: "test" | "project" | "lab";
  labCount?: number;
  totalLabs?: number;
}

export function NotificationBell() {
  const [, setLocation] = useLocation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { data: courses = [] } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  const pendingActions = useMemo(() => {
    const allTestAttempts = getTestAttempts() as Record<string, any>;
    const allSubmissions = getAllSubmissions() as Record<string, any>;
    const labStore = getLabProgressStore();
    const items: PendingActionItem[] = [];

    courses.forEach((course) => {
      const progress = getCourseProgress(course.id);
      const completedLessons = progress.completedLessons.length;
      const progressPercent = completedLessons > 0 ? Math.min(Math.round((completedLessons / 10) * 100), 100) : 0;

      if (progressPercent === 100) {
        const attempt = allTestAttempts[course.id.toString()];
        if (!attempt || !attempt.passed) {
          items.push({ courseId: course.id, title: course.title, type: "test" });
        }

        if (course.projectRequired) {
          const submission = allSubmissions[course.id.toString()];
          if (!submission) {
            items.push({ courseId: course.id, title: course.title, type: "project" });
          }
        }
      }

      if (progressPercent > 0) {
        const courseLabs = labStore[course.id];
        if (courseLabs) {
          const completedCount = Object.values(courseLabs).filter((p: any) => p.completed).length;
          const totalLabs = Object.keys(courseLabs).length;
          if (totalLabs > 0 && completedCount < totalLabs) {
            items.push({ 
              courseId: course.id, 
              title: course.title, 
              type: "lab",
              labCount: totalLabs - completedCount,
              totalLabs
            });
          }
        }
      }
    });

    return { 
      items, 
      tests: items.filter(i => i.type === "test"),
      projects: items.filter(i => i.type === "project"),
      labs: items.filter(i => i.type === "lab"),
      total: items.length 
    };
  }, [courses]);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications", {
        credentials: "include",
      });
      
      if (response.ok) {
        const data: NotificationsResponse = await response.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  const markAsRead = async (notificationId: number) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: "PATCH",
        credentials: "include",
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(n =>
            n.id === notificationId ? { ...n, isRead: true } : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/notifications/read-all", {
        method: "PATCH",
        credentials: "include",
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(n => ({ ...n, isRead: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    
    if (notification.link) {
      setIsOpen(false);
      setLocation(notification.link);
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case "test": return <ClipboardCheck className="w-3.5 h-3.5 text-purple-500 shrink-0" />;
      case "project": return <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0" />;
      case "lab": return <Code2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />;
      default: return <Info className="w-3.5 h-3.5 text-muted-foreground shrink-0" />;
    }
  };

  const getActionLabel = (item: PendingActionItem) => {
    switch (item.type) {
      case "test": return "Take Assessment";
      case "project": return "Submit Project";
      case "lab": return `${item.labCount} Lab${(item.labCount || 0) > 1 ? "s" : ""} Remaining`;
      default: return "Action Required";
    }
  };

  const getActionRoute = (item: PendingActionItem) => {
    switch (item.type) {
      case "test": return `/shishya/tests/${item.courseId}`;
      case "project": return `/shishya/projects/${item.courseId}`;
      case "lab": return `/shishya/labs/${item.courseId}`;
      default: return `/shishya/learn/${item.courseId}`;
    }
  };

  const getActionColor = (type: string) => {
    switch (type) {
      case "test": return "text-purple-600 dark:text-purple-400";
      case "project": return "text-blue-600 dark:text-blue-400";
      case "lab": return "text-emerald-600 dark:text-emerald-400";
      default: return "text-muted-foreground";
    }
  };

  const totalBadgeCount = unreadCount + pendingActions.total;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          data-testid="button-notifications"
        >
          <Bell className="w-5 h-5" />
          {totalBadgeCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 min-w-5 px-1 flex items-center justify-center text-xs"
            >
              {totalBadgeCount > 99 ? "99+" : totalBadgeCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[340px] p-0"
        align="end"
        data-testid="popup-notifications"
      >
        <div className="flex items-center justify-between gap-2 p-3 border-b">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold">Notifications</h4>
            {totalBadgeCount > 0 && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                {totalBadgeCount}
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              disabled={isLoading}
              className="text-xs h-7"
              data-testid="button-mark-all-read"
            >
              <Check className="w-3 h-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        {pendingActions.total > 0 && (
          <div className="border-b bg-amber-50/50 dark:bg-amber-950/20">
            <div className="flex items-center justify-between gap-2 px-3 pt-2.5 pb-1">
              <div className="flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-amber-500" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  Action Required
                </span>
              </div>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400">
                {pendingActions.total}
              </Badge>
            </div>
            <div className="px-2 pb-2 space-y-0.5">
              {pendingActions.items.map((item, idx) => (
                <div
                  key={`${item.type}-${item.courseId}-${idx}`}
                  className="flex items-center gap-2.5 p-2 rounded-md cursor-pointer hover-elevate group"
                  onClick={() => { setIsOpen(false); setLocation(getActionRoute(item)); }}
                  data-testid={`pending-action-${item.type}-${item.courseId}`}
                >
                  <div className="shrink-0">
                    {getActionIcon(item.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-medium truncate ${getActionColor(item.type)}`}>
                      {getActionLabel(item)}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">{item.title}</p>
                  </div>
                  <ArrowRight className="w-3 h-3 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </div>
        )}

        <ScrollArea className={pendingActions.total > 0 ? "h-[200px]" : "h-[300px]"}>
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bell className="w-10 h-10 text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                We'll notify you about important updates
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`
                    flex gap-3 p-3 cursor-pointer hover-elevate transition-colors
                    ${!notification.isRead ? "bg-accent/30" : ""}
                  `}
                  onClick={() => handleNotificationClick(notification)}
                  data-testid={`notification-${notification.id}`}
                >
                  <div className="shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm leading-tight ${!notification.isRead ? "font-medium" : ""}`}>
                        {notification.title}
                      </p>
                      {!notification.isRead && (
                        <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      {getRelativeTime(notification.createdAt.toString())}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
