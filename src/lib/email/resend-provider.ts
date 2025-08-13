import { Resend } from "resend";

// Only initialize Resend if API key is available and not during build
const resend = process.env.RESEND_API_KEY && process.env.NEXT_PHASE !== 'phase-production-build' 
  ? new Resend(process.env.RESEND_API_KEY) 
  : null;

export async function sendVerificationRequest({
  identifier: email,
  url,
  provider,
}: {
  identifier: string;
  url: string;
  provider: { from: string };
}) {
  if (!resend) {
    throw new Error("Resend not configured - missing RESEND_API_KEY or running during build");
  }
  
  try {
    const { data, error } = await resend.emails.send({
      from: provider.from,
      to: email,
      subject: "Sign in to Ferrow",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>Sign in to Ferrow</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { text-align: center; padding: 20px 0; border-bottom: 1px solid #eee; }
              .logo { color: #2B6FF9; font-size: 24px; font-weight: bold; }
              .content { padding: 40px 0; text-align: center; }
              .button { display: inline-block; background: #2B6FF9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 500; margin: 20px 0; }
              .footer { text-align: center; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px; }
              .security-note { background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 16px; margin: 20px 0; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo">Ferrow</div>
                <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">Ferry funds across chains, automatically</p>
              </div>
              
              <div class="content">
                <h2>Sign in to your account</h2>
                <p>Click the button below to securely sign in to Ferrow. This link will expire in 24 hours for your security.</p>
                
                <a href="${url}" class="button">Sign in to Ferrow</a>
                
                <div class="security-note">
                  <strong>Security Notice:</strong> This email was sent to ${email}. If you didn't request this sign-in link, please ignore this email.
                </div>
                
                <p style="color: #666; font-size: 14px; margin-top: 30px;">
                  If the button doesn't work, copy and paste this link into your browser:<br>
                  <a href="${url}" style="color: #2B6FF9; word-break: break-all;">${url}</a>
                </p>
              </div>
              
              <div class="footer">
                <p>This email was sent by Ferrow. If you have any questions, please contact our support team.</p>
                <p style="margin-top: 10px;">© ${new Date().getFullYear()} Ferrow. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error("Failed to send verification email:", error);
      throw new Error("Failed to send verification email");
    }

    console.log("Verification email sent successfully:", data?.id);
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw error;
  }
}