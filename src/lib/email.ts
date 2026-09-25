// Sends transactional email via Resend when RESEND_API_KEY is set.
// Falls back to logging the email to the server console in dev/demo mode
// so password reset etc. still "work" without any email provider.

export async function sendEmail(to: string, subject: string, html: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.log(`\n[DEV EMAIL] To: ${to}\nSubject: ${subject}\n${html}\n`);
    return { ok: true, mode: "console" as const };
  }

  const { Resend } = await import("resend");
  const resend = new Resend(key);
  await resend.emails.send({
    from: process.env.EMAIL_FROM || "Waypoint <onboarding@resend.dev>",
    to, subject, html
  });
  return { ok: true, mode: "resend" as const };
}

export function passwordResetEmail(resetUrl: string) {
  return `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
      <h2 style="color:#10242A;">Reset your Waypoint password</h2>
      <p>Click the link below to choose a new password. This link expires in 1 hour.</p>
      <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#E8734A;color:#fff;border-radius:100px;text-decoration:none;font-weight:600;">Reset password</a>
      <p style="color:#888;font-size:13px;margin-top:20px;">If you didn't request this, you can ignore this email.</p>
    </div>`;
}
