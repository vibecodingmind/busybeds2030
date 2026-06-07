import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/email";

// Simple in-memory rate limiting for resend verification
const resendAttempts = new Map<string, { count: number; lastAttempt: number }>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of resendAttempts.entries()) {
    if (now - value.lastAttempt > 60 * 1000) {
      resendAttempts.delete(key);
    }
  }
}, 5 * 60 * 1000);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Rate limit: 1 resend per minute per email
    const rateLimitKey = email.toLowerCase();
    const attempt = resendAttempts.get(rateLimitKey);
    if (attempt && Date.now() - attempt.lastAttempt < 60 * 1000) {
      return NextResponse.json(
        { error: "Please wait at least 1 minute before requesting another verification email" },
        { status: 429 }
      );
    }

    const user = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    // Always return success to avoid revealing if email exists
    if (!user || user.emailVerified) {
      return NextResponse.json({
        message:
          "If an account with that email exists and is not yet verified, a new verification email has been sent.",
      });
    }

    // Generate new verification token
    const verifyToken = crypto.randomBytes(32).toString("hex");
    const verifyTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await db.user.update({
      where: { id: user.id },
      data: {
        verifyToken,
        verifyTokenExpiry,
      },
    });

    // Send verification email
    try {
      await sendVerificationEmail(user.email, verifyToken);
    } catch (emailError) {
      console.error("Failed to resend verification email:", emailError);
    }

    // Update rate limit tracker
    resendAttempts.set(rateLimitKey, {
      count: (attempt?.count || 0) + 1,
      lastAttempt: Date.now(),
    });

    return NextResponse.json({
      message:
        "If an account with that email exists and is not yet verified, a new verification email has been sent.",
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
