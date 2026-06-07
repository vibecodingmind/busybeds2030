/**
 * Centralized Notification Service
 * 
 * Handles sending notifications across multiple channels (SMS, in-app).
 * Creates Notification records in the database and dispatches via the appropriate channel.
 */

import { db } from "@/lib/db";
import {
  sendBookingConfirmationSMS,
  sendPaymentConfirmationSMS,
} from "@/lib/sms";

/**
 * Send a notification to a user via the specified channel
 */
export async function notifyUser(
  userId: string,
  channel: "SMS" | "IN_APP" | "WHATSAPP",
  message: string,
  phone?: string
): Promise<void> {
  // Create in-app notification record
  const notification = await db.notification.create({
    data: {
      userId,
      channel: channel === "SMS" ? "SMS" : channel === "WHATSAPP" ? "WHATSAPP" : "IN_APP",
      message,
      status: "PENDING",
    },
  });

  try {
    if (channel === "SMS" && phone) {
      const { sendSMS } = await import("@/lib/sms");
      const result = await sendSMS(phone, message);

      await db.notification.update({
        where: { id: notification.id },
        data: {
          status: result.success ? "SENT" : "FAILED",
          sentAt: result.success ? new Date() : undefined,
        },
      });
    } else if (channel === "IN_APP") {
      // In-app notifications are "sent" as soon as they're created
      await db.notification.update({
        where: { id: notification.id },
        data: {
          status: "SENT",
          sentAt: new Date(),
        },
      });
    }
  } catch (error) {
    console.error(`Failed to send notification to user ${userId}:`, error);
    await db.notification.update({
      where: { id: notification.id },
      data: { status: "FAILED" },
    });
  }
}

/**
 * Send booking confirmation notification (SMS + in-app)
 */
export async function notifyBookingConfirmation(
  userId: string,
  couponCode: string,
  hotelName: string,
  checkInDate: string
): Promise<void> {
  // Get user's phone number
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { phone: true, email: true },
  });

  const message = `Your booking at ${hotelName} is confirmed! Coupon: ${couponCode}. Check-in: ${checkInDate}.`;

  // In-app notification
  await notifyUser(userId, "IN_APP", message);

  // SMS notification if phone is available
  if (user?.phone) {
    await sendBookingConfirmationSMS(
      user.phone,
      couponCode,
      hotelName,
      checkInDate
    );
  }
}

/**
 * Send payment confirmation notification (SMS + in-app)
 */
export async function notifyPaymentConfirmation(
  userId: string,
  packageName: string,
  amount: number
): Promise<void> {
  // Get user's phone number
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { phone: true, email: true },
  });

  const formattedAmount = amount.toLocaleString("en-TZ");
  const message = `Payment of TZS ${formattedAmount} received for ${packageName} subscription. Your coupons are now active!`;

  // In-app notification
  await notifyUser(userId, "IN_APP", message);

  // SMS notification if phone is available
  if (user?.phone) {
    await sendPaymentConfirmationSMS(user.phone, packageName, amount);
  }
}
