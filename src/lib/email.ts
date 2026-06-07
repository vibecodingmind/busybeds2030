/**
 * Email Sending Utility
 * 
 * Uses nodemailer with SMTP for sending emails.
 * If SMTP is not configured (SMTP_HOST not set), emails are logged to console
 * so the flow still works in development.
 * 
 * Required env vars for production:
 * - SMTP_HOST
 * - SMTP_PORT (default: 587)
 * - SMTP_USER
 * - SMTP_PASS
 * - EMAIL_FROM
 * - NEXTAUTH_URL (for generating verification/reset URLs)
 */

import nodemailer from "nodemailer";

function isSmtpConfigured(): boolean {
  return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function getTransporter() {
  if (!isSmtpConfigured()) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

function getEmailFrom(): string {
  return process.env.EMAIL_FROM || "BusyBeds <noreply@busybeds.com>";
}

function getBaseUrl(): string {
  return process.env.NEXTAUTH_URL || "http://localhost:3008";
}

/**
 * Send a verification email to a newly registered user
 */
export async function sendVerificationEmail(
  to: string,
  token: string
): Promise<void> {
  const verificationUrl = `${getBaseUrl()}/api/auth/verify?token=${token}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #0A1628; margin: 0;">BusyBeds</h1>
        <p style="color: #C9A84C; margin: 5px 0 0 0;">Luxury Hotels at Members-Only Prices</p>
      </div>
      <div style="background: #f8f9fa; border-radius: 12px; padding: 30px; text-align: center;">
        <h2 style="color: #0A1628; margin-top: 0;">Verify Your Email</h2>
        <p style="color: #666; line-height: 1.6;">
          Thank you for registering with BusyBeds! Please click the button below to verify your email address.
        </p>
        <a href="${verificationUrl}" 
           style="display: inline-block; background: #C9A84C; color: #0A1628; padding: 12px 32px; 
                  border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0;">
          Verify Email Address
        </a>
        <p style="color: #999; font-size: 12px; margin-top: 20px;">
          This link expires in 24 hours. If you didn't create an account, you can ignore this email.
        </p>
      </div>
      <p style="text-align: center; color: #999; font-size: 12px; margin-top: 20px;">
        If the button doesn't work, copy this link: ${verificationUrl}
      </p>
    </div>
  `;

  const text = `Verify your BusyBeds email address by visiting: ${verificationUrl}`;

  await sendEmail(to, "Verify Your Email - BusyBeds", html, text);
}

/**
 * Send a password reset email
 */
export async function sendPasswordResetEmail(
  to: string,
  token: string
): Promise<void> {
  const resetUrl = `${getBaseUrl()}/reset-password?token=${token}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #0A1628; margin: 0;">BusyBeds</h1>
        <p style="color: #C9A84C; margin: 5px 0 0 0;">Luxury Hotels at Members-Only Prices</p>
      </div>
      <div style="background: #f8f9fa; border-radius: 12px; padding: 30px; text-align: center;">
        <h2 style="color: #0A1628; margin-top: 0;">Reset Your Password</h2>
        <p style="color: #666; line-height: 1.6;">
          We received a request to reset your password. Click the button below to set a new password.
        </p>
        <a href="${resetUrl}" 
           style="display: inline-block; background: #C9A84C; color: #0A1628; padding: 12px 32px; 
                  border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0;">
          Reset Password
        </a>
        <p style="color: #999; font-size: 12px; margin-top: 20px;">
          This link expires in 1 hour. If you didn't request a password reset, you can ignore this email.
        </p>
      </div>
      <p style="text-align: center; color: #999; font-size: 12px; margin-top: 20px;">
        If the button doesn't work, copy this link: ${resetUrl}
      </p>
    </div>
  `;

  const text = `Reset your BusyBeds password by visiting: ${resetUrl}`;

  await sendEmail(to, "Reset Your Password - BusyBeds", html, text);
}

/**
 * Send a booking confirmation email
 */
export async function sendBookingConfirmationEmail(
  to: string,
  bookingDetails: {
    couponCode: string;
    hotelName: string;
    checkInDate: string;
    checkOutDate: string;
    guestName?: string;
  }
): Promise<void> {
  const { couponCode, hotelName, checkInDate, checkOutDate, guestName } = bookingDetails;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #0A1628; margin: 0;">BusyBeds</h1>
        <p style="color: #C9A84C; margin: 5px 0 0 0;">Booking Confirmation</p>
      </div>
      <div style="background: #f8f9fa; border-radius: 12px; padding: 30px;">
        <h2 style="color: #0A1628; margin-top: 0;">Your Booking is Confirmed!</h2>
        ${guestName ? `<p>Hello ${guestName},</p>` : ""}
        <p style="color: #666; line-height: 1.6;">
          Your booking at <strong>${hotelName}</strong> has been confirmed.
        </p>
        <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Coupon Code:</strong> ${couponCode}</p>
          <p style="margin: 5px 0;"><strong>Hotel:</strong> ${hotelName}</p>
          <p style="margin: 5px 0;"><strong>Check-in:</strong> ${checkInDate}</p>
          <p style="margin: 5px 0;"><strong>Check-out:</strong> ${checkOutDate}</p>
        </div>
        <p style="color: #666; font-size: 14px;">
          Please present your coupon code at the hotel reception during check-in.
        </p>
      </div>
    </div>
  `;

  const text = `Booking confirmed! Hotel: ${hotelName}, Coupon: ${couponCode}, Check-in: ${checkInDate}, Check-out: ${checkOutDate}`;

  await sendEmail(to, "Booking Confirmed - BusyBeds", html, text);
}

/**
 * Core email sending function
 */
async function sendEmail(
  to: string,
  subject: string,
  html: string,
  text: string
): Promise<void> {
  if (!isSmtpConfigured()) {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📧 EMAIL (SMTP not configured - logging to console)");
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Text: ${text}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    return;
  }

  try {
    const transporter = getTransporter();
    if (!transporter) {
      console.log(`📧 Email would be sent to ${to}: ${subject}`);
      return;
    }

    const result = await transporter.sendMail({
      from: getEmailFrom(),
      to,
      subject,
      html,
      text,
    });

    console.log(`📧 Email sent to ${to}: ${subject} (ID: ${result.messageId})`);
  } catch (error) {
    console.error("Failed to send email:", error);
    // Don't throw - email failure shouldn't break the flow
  }
}
