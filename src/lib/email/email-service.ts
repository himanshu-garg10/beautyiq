import { Resend } from "resend";

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    return null;
  }
  return new Resend(apiKey.trim());
}

const DEFAULT_FROM = process.env.EMAIL_FROM || "BeautyIQ <onboarding@resend.dev>";

export async function sendOtpEmail(toEmail: string, otpCode: string): Promise<{ success: boolean; id?: string; error?: string }> {
  const resend = getResendClient();

  if (!resend) {
    console.log(`[EMAIL NOTICE - RESEND_API_KEY missing] Simulated sending OTP ${otpCode} to ${toEmail}`);
    return {
      success: true,
      error: "RESEND_API_KEY not configured. OTP logged to server console for testing.",
    };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: DEFAULT_FROM,
      to: [toEmail],
      subject: `${otpCode} is your BeautyIQ Verification Code`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>BeautyIQ Verification Code</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #FAF7F2; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #2C2A29;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FAF7F2; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="100%" max-width="480px" cellpadding="0" cellspacing="0" style="max-width: 480px; background-color: #FFFFFF; border-radius: 24px; border: 1px solid #E6DEC9; padding: 40px 32px; box-shadow: 0 8px 30px rgba(0,0,0,0.04);">
                  <!-- Logo -->
                  <tr>
                    <td align="center" style="padding-bottom: 24px;">
                      <div style="font-size: 26px; font-weight: 700; color: #2C2A29; letter-spacing: -0.5px;">
                        Beauty<span style="font-style: italic; color: #435340;">IQ</span>
                      </div>
                      <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #7F7A74; font-weight: 600; margin-top: 4px;">
                        Skincare Intelligence
                      </div>
                    </td>
                  </tr>

                  <!-- Main Heading -->
                  <tr>
                    <td align="center" style="padding-bottom: 16px;">
                      <h1 style="font-size: 20px; font-weight: 600; color: #2C2A29; margin: 0;">Verification Code</h1>
                      <p style="font-size: 14px; color: #7F7A74; margin: 8px 0 0 0; line-height: 1.5;">
                        Use the 6-digit verification code below to complete your sign in or verification.
                      </p>
                    </td>
                  </tr>

                  <!-- OTP Box -->
                  <tr>
                    <td align="center" style="padding: 24px 0;">
                      <div style="background-color: #F5EFE6; border: 1.5px dashed #435340; border-radius: 16px; padding: 18px 24px; display: inline-block;">
                        <span style="font-family: monospace, Courier; font-size: 34px; font-weight: 700; letter-spacing: 10px; color: #2A3628; display: block; padding-left: 10px;">
                          ${otpCode}
                        </span>
                      </div>
                    </td>
                  </tr>

                  <!-- Expiry notice -->
                  <tr>
                    <td align="center" style="padding-bottom: 24px;">
                      <p style="font-size: 12px; color: #A29E99; margin: 0; line-height: 1.4;">
                        ⏱️ This verification code is valid for <strong>10 minutes</strong>.<br>
                        Never share this code with anyone.
                      </p>
                    </td>
                  </tr>

                  <!-- Security Divider -->
                  <tr>
                    <td style="border-top: 1px solid #ECE4D0; padding-top: 20px;" align="center">
                      <p style="font-size: 11px; color: #A29E99; margin: 0; line-height: 1.5;">
                        If you did not request this email, please ignore it or contact our support team if you have questions.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error("[Resend Error]:", error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err: any) {
    console.error("[Resend Exception]:", err);
    return { success: false, error: err.message || "Failed to send email" };
  }
}
