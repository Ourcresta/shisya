import { Router, Response } from 'express';
import { db } from './db';
import { notifications } from '@shared/schema';
import { eq, and, or, desc, isNull, sql } from 'drizzle-orm';
import { requireAuth, type AuthenticatedRequest } from './auth';
import type { InsertNotification, NotificationType, NotificationRole } from '@shared/schema';

export const notificationsRouter = Router();

// GET /api/notifications - Get notifications for current user
notificationsRouter.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userId = req.user.id;
    const limit = parseInt(req.query.limit as string) || 10;

    // Get notifications for this user OR global notifications for 'shishya' or 'all' role
    const userNotifications = await db
      .select()
      .from(notifications)
      .where(
        or(
          eq(notifications.userId, userId),
          and(
            isNull(notifications.userId),
            or(
              eq(notifications.role, 'shishya'),
              eq(notifications.role, 'all')
            )
          )
        )
      )
      .orderBy(desc(notifications.createdAt))
      .limit(limit);

    // Get unread count
    const unreadResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(notifications)
      .where(
        and(
          or(
            eq(notifications.userId, userId),
            and(
              isNull(notifications.userId),
              or(
                eq(notifications.role, 'shishya'),
                eq(notifications.role, 'all')
              )
            )
          ),
          eq(notifications.isRead, false)
        )
      );

    res.json({
      notifications: userNotifications,
      unreadCount: unreadResult[0]?.count || 0,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// PATCH /api/notifications/:id/read - Mark single notification as read
notificationsRouter.patch('/:id/read', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const notificationId = parseInt(req.params.id);
    const userId = req.user.id;

    if (isNaN(notificationId)) {
      return res.status(400).json({ error: 'Invalid notification ID' });
    }

    // Get the notification to verify access
    const notification = await db
      .select()
      .from(notifications)
      .where(eq(notifications.id, notificationId))
      .limit(1);

    if (notification.length === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    // Check if user has access (either personal notification or global)
    const notif = notification[0];
    const hasAccess = 
      notif.userId === userId || 
      (notif.userId === null && (notif.role === 'shishya' || notif.role === 'all'));

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Mark as read
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, notificationId));

    res.json({ success: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// PATCH /api/notifications/read-all - Mark all notifications as read
notificationsRouter.patch('/read-all', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userId = req.user.id;

    // Mark all user's notifications as read
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(
        and(
          or(
            eq(notifications.userId, userId),
            and(
              isNull(notifications.userId),
              or(
                eq(notifications.role, 'shishya'),
                eq(notifications.role, 'all')
              )
            )
          ),
          eq(notifications.isRead, false)
        )
      );

    res.json({ success: true });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark notifications as read' });
  }
});

// Helper function to create notifications (for internal use)
export async function createNotification(data: {
  userId?: string | null;
  role?: NotificationRole;
  title: string;
  message: string;
  type: NotificationType;
  link?: string | null;
}) {
  try {
    const result = await db.insert(notifications).values({
      userId: data.userId || null,
      role: data.role || 'all',
      title: data.title,
      message: data.message,
      type: data.type,
      link: data.link || null,
      isRead: false,
    }).returning();

    console.log(`[Notification] Created: ${data.type} - ${data.title}`);
    return result[0];
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

// Common notification triggers
export const NotificationTriggers = {
  // Payment success notification
  async paymentSuccess(userId: string, credits: number, packName: string) {
    return createNotification({
      userId,
      role: 'shishya',
      title: 'Payment Successful',
      message: `You've successfully purchased ${credits} learning points (${packName}).`,
      type: 'payment',
      link: '/shishya/wallet',
    });
  },

  // Payment failed notification
  async paymentFailed(userId: string, reason?: string) {
    return createNotification({
      userId,
      role: 'shishya',
      title: 'Payment Failed',
      message: reason || 'Your payment could not be processed. Please try again.',
      type: 'payment_failed',
      link: '/shishya/wallet',
    });
  },

  // Certificate issued notification
  async certificateIssued(userId: string, courseTitle: string, certificateId: string) {
    return createNotification({
      userId,
      role: 'shishya',
      title: 'Certificate Issued',
      message: `Congratulations! Your certificate for "${courseTitle}" is ready.`,
      type: 'certificate',
      link: `/shishya/certificates/${certificateId}`,
    });
  },

  // Course enrollment notification
  async courseEnrolled(userId: string, courseTitle: string, courseId: number) {
    return createNotification({
      userId,
      role: 'shishya',
      title: 'Course Enrollment Successful',
      message: `You've enrolled in "${courseTitle}". Start learning now!`,
      type: 'course',
      link: `/courses/${courseId}`,
    });
  },

  // New course launched (global notification)
  async newCourseLaunched(courseTitle: string, courseId: number) {
    return createNotification({
      userId: null,
      role: 'shishya',
      title: 'New Course Available',
      message: `Check out our new course: "${courseTitle}"`,
      type: 'product',
      link: `/courses/${courseId}`,
    });
  },

  // New offer/announcement (global notification)
  async newOffer(title: string, message: string, link?: string) {
    return createNotification({
      userId: null,
      role: 'all',
      title,
      message,
      type: 'offer',
      link,
    });
  },

  // System announcement
  async systemAnnouncement(title: string, message: string, targetRole: NotificationRole = 'all') {
    return createNotification({
      userId: null,
      role: targetRole,
      title,
      message,
      type: 'system',
    });
  },

  // Welcome notification for new users
  async welcomeUser(userId: string, userName?: string) {
    return createNotification({
      userId,
      role: 'shishya',
      title: 'Welcome to OurShiksha!',
      message: `${userName ? `Hi ${userName}! ` : ''}You've received 500 welcome bonus points. Start your learning journey today!`,
      type: 'system',
      link: '/shishya/dashboard',
    });
  },
};
