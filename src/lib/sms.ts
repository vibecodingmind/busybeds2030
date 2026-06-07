/**
 * SMS Utility using Africa's Talking SDK
 * 
 * Sends SMS messages via Africa's Talking API.
 * If AFRICAS_TALKING_API_KEY is not set, SMS messages are logged to console
 * so the flow still works in development.
 * 
 * Required env vars for production:
 * - AFRICAS_TALKING_API_KEY
 * - AFRICAS_TALKING_USERNAME (default: "sandbox" for test mode)
 */

interface SMSResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

function isSmsConfigured(): boolean {
  return !!(process.env.AFRICAS_TALKING_API_KEY);
}

function isSandboxMode(): boolean {
  const username = process.env.AFRICAS_TALKING_USERNAME || "sandbox";
  return username === "sandbox";
}

/**
 * Format a phone number for Africa's Talking
 * Expects format like +255XXXXXXXXX or 255XXXXXXXXX
 */
function formatPhoneNumber(phone: string): string {
  if (!phone) return "";

  // Remove spaces and dashes
  let cleaned = phone.replace(/[\s-]/g, "");

  // If starts with 0, replace with +255 (Tanzania)
  if (cleaned.startsWith("0")) {
    cleaned = "+255" + cleaned.substring(1);
  }

  // If starts with 255 without +, add +
  if (cleaned.startsWith("255") && !cleaned.startsWith("+")) {
    cleaned = "+" + cleaned;
  }

  // If no prefix, assume Tanzania
  if (!cleaned.startsWith("+")) {
    cleaned = "+" + cleaned;
  }

  return cleaned;
}

/**
 * Send an SMS message via Africa's Talking
 */
export async function sendSMS(to: string, message: string): Promise<SMSResult> {
  if (!isSmsConfigured()) {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📱 SMS (Africa's Talking not configured - logging to console)");
    console.log(`To: ${to}`);
    console.log(`Message: ${message}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    return { success: true, messageId: "console-log" };
  }

  try {
    const africastalking = require("africastalking")({
      apiKey: process.env.AFRICAS_TALKING_API_KEY,
      username: process.env.AFRICAS_TALKING_USERNAME || "sandbox",
    });

    const sms = africastalking.SMS;
    const formattedPhone = formatPhoneNumber(to);

    const result = await sms.send({
      to: [formattedPhone],
      message,
      from: "BusyBeds", // Sender ID (needs registration with AT)
    });

    const recipients = result.SMSMessageData?.Recipients || [];
    if (recipients.length > 0 && recipients[0].statusCode === 101) {
      console.log(`📱 SMS sent to ${to}: ${message.substring(0, 50)}...`);
      return {
        success: true,
        messageId: recipients[0].messageId,
      };
    } else {
      const errorMsg = recipients[0]?.status || "Unknown error";
      console.error(`📱 SMS failed for ${to}: ${errorMsg}`);
      return {
        success: false,
        error: errorMsg,
      };
    }
  } catch (error) {
    console.error("SMS send error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send booking confirmation SMS
 */
export async function sendBookingConfirmationSMS(
  phone: string,
  couponCode: string,
  hotelName: string,
  checkInDate: string
): Promise<SMSResult> {
  const message = `BusyBeds: Your booking at ${hotelName} is confirmed! Coupon: ${couponCode}. Check-in: ${checkInDate}. Present your coupon at reception. Enjoy your stay!`;

  return sendSMS(phone, message);
}

/**
 * Send payment confirmation SMS
 */
export async function sendPaymentConfirmationSMS(
  phone: string,
  packageName: string,
  amount: number
): Promise<SMSResult> {
  const formattedAmount = amount.toLocaleString("en-TZ");
  const message = `BusyBeds: Payment of TZS ${formattedAmount} received for ${packageName} subscription. Your coupons are now active. Thank you for choosing BusyBeds!`;

  return sendSMS(phone, message);
}
