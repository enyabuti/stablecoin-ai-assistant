import { Resend } from 'resend';

export async function sendVerificationRequest({
  identifier: email,
  url,
  provider,
}: {
  identifier: string;
  url: string;
  provider: any;
}) {
  const { host } = new URL(url);
  
  // For development, log to console
  if (process.env.NODE_ENV === "development") {
    console.log("\n🔗 MAGIC LINK (Development Mode):");
    console.log(`📧 To: ${email}`);
    console.log(`🔗 Link: ${url}`);
    console.log("\nCopy this link to your browser to sign in\n");
    return;
  }

  // Only initialize Resend when actually sending emails
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is required for production email sending");
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || "noreply@ferrow.app",
      to: email,
      subject: `Sign in to Ferrow`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 0; text-align: center;">
            <div style="background: white; width: 64px; height: 64px; border-radius: 16px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
              <div style="color: #667eea; font-size: 32px;">⚡</div>
            </div>
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Welcome to Ferrow</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">Ferry funds across chains, automatically.</p>
          </div>
          
          <div style="background: white; padding: 40px;">
            <h2 style="margin: 0 0 20px; color: #1a1a1a; font-size: 24px; font-weight: 600;">Sign in to your account</h2>
            <p style="margin: 0 0 30px; color: #666; font-size: 16px; line-height: 1.5;">
              Click the button below to securely sign in to Ferrow. If this is your first time, we'll automatically create your account.
            </p>
            
            <div style="text-align: center; margin: 40px 0;">
              <a href="${url}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; display: inline-block; font-weight: 600; font-size: 16px;">
                Continue to Ferrow
              </a>
            </div>
            
            <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; margin: 30px 0;">
              <p style="margin: 0; color: #666; font-size: 14px;">
                <strong>Security tip:</strong> This link will expire in 24 hours and can only be used once. If you didn't request this email, you can safely ignore it.
              </p>
            </div>
            
            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
              <p style="margin: 0; color: #999; font-size: 12px;">
                You're receiving this because you requested a sign-in link for Ferrow.
                <br>If you have any questions, reply to this email.
              </p>
            </div>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send verification email:", error);
    throw new Error("Failed to send verification email");
  }
}