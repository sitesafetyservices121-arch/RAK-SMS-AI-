"use server";

import { db, Timestamp } from "@/lib/firebase-admin";
import { getEmployeesWithTraining } from "@/lib/training-service";
import type { TrainingNotification } from "@/types/training";

/**
 * Check for expiring courses and create notifications
 */
export async function checkAndCreateNotifications(companyId: string) {
  try {
    const employees = await getEmployeesWithTraining(companyId);
    const now = new Date();
    const notifications: any[] = [];

    for (const employee of employees) {
      for (const training of employee.trainings) {
        const expiryDate = training.expiryDate instanceof Date
          ? training.expiryDate
          : training.expiryDate.toDate();

        const daysUntilExpiry = Math.floor(
          (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Determine notification type based on days until expiry
        let notificationType: "expiring-30" | "expiring-14" | "expiring-7" | "expired" | null = null;

        if (daysUntilExpiry < 0) {
          notificationType = "expired";
        } else if (daysUntilExpiry <= 7) {
          notificationType = "expiring-7";
        } else if (daysUntilExpiry <= 14) {
          notificationType = "expiring-14";
        } else if (daysUntilExpiry <= 30) {
          notificationType = "expiring-30";
        }

        if (notificationType) {
          // Check if notification already exists
          const existingNotification = await db
            .collection("training_notifications")
            .where("companyId", "==", companyId)
            .where("employeeId", "==", employee.id)
            .where("courseId", "==", training.id)
            .where("type", "==", notificationType)
            .limit(1)
            .get();

          if (existingNotification.empty) {
            // Create new notification
            notifications.push({
              companyId,
              employeeId: employee.id,
              courseId: training.id,
              employeeName: `${employee.firstName} ${employee.lastName}`,
              courseName: training.courseName,
              expiryDate: training.expiryDate,
              type: notificationType,
              read: false,
              createdAt: Timestamp.now(),
            });
          }
        }
      }
    }

    // Batch create notifications
    if (notifications.length > 0) {
      const batch = db.batch();
      notifications.forEach((notification) => {
        const ref = db.collection("training_notifications").doc();
        batch.set(ref, notification);
      });
      await batch.commit();
    }

    return {
      success: true,
      notificationsCreated: notifications.length,
    };
  } catch (error: any) {
    console.error("Error checking notifications:", error);
    throw new Error(error.message || "Failed to check notifications");
  }
}

/**
 * Get all notifications for a company
 */
export async function getNotifications(companyId: string, unreadOnly: boolean = false) {
  let query = db
    .collection("training_notifications")
    .where("companyId", "==", companyId);

  if (unreadOnly) {
    query = query.where("read", "==", false);
  }

  const snapshot = await query.orderBy("createdAt", "desc").limit(100).get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

/**
 * Mark a notification as read
 */
export async function markNotificationRead(notificationId: string) {
  await db.collection("training_notifications").doc(notificationId).update({
    read: true,
  });

  return { success: true };
}

/**
 * Mark all notifications as read for a company
 */
export async function markAllNotificationsRead(companyId: string) {
  const snapshot = await db
    .collection("training_notifications")
    .where("companyId", "==", companyId)
    .where("read", "==", false)
    .get();

  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.update(doc.ref, { read: true });
  });

  await batch.commit();

  return {
    success: true,
    count: snapshot.docs.length,
  };
}

/**
 * Delete old notifications (older than 90 days)
 */
export async function cleanupOldNotifications(companyId: string) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 90);

  const snapshot = await db
    .collection("training_notifications")
    .where("companyId", "==", companyId)
    .where("createdAt", "<", Timestamp.fromDate(cutoffDate))
    .get();

  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  await batch.commit();

  return {
    success: true,
    deletedCount: snapshot.docs.length,
  };
}

/**
 * Get notification summary for a company
 */
export async function getNotificationSummary(companyId: string) {
  const [allNotifications, unreadNotifications] = await Promise.all([
    getNotifications(companyId, false),
    getNotifications(companyId, true),
  ]);

  const summary = {
    total: allNotifications.length,
    unread: unreadNotifications.length,
    byType: {
      expired: unreadNotifications.filter((n: any) => n.type === "expired").length,
      expiring7: unreadNotifications.filter((n: any) => n.type === "expiring-7").length,
      expiring14: unreadNotifications.filter((n: any) => n.type === "expiring-14").length,
      expiring30: unreadNotifications.filter((n: any) => n.type === "expiring-30").length,
    },
  };

  return summary;
}
