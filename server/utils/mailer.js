const https = require("https");

// Sends transactional email via Brevo's HTTPS API (https://api.brevo.com).
// Why: raw SMTP (e.g. Gmail via nodemailer) is frequently slow or throttled
// when called from cloud-hosting IPs (Render, Railway, etc.), causing OTP
// emails to take many minutes or fail outright. Brevo's HTTP API avoids SMTP
// entirely and responds in normal request time.
//
// Required environment variables (set these in Render's dashboard, NOT in code):
//   BREVO_API_KEY  - your Brevo transactional API key (from brevo.com -> SMTP & API -> API Keys)
//   EMAIL_FROM     - the verified sender email address (e.g. smartstudent761@gmail.com)
//   EMAIL_FROM_NAME (optional) - display name for the sender, defaults to "SmartStudent"

function sendTransactionalEmail({ to, subject, html }) {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.BREVO_API_KEY;
    const fromEmail = process.env.EMAIL_FROM;
    const fromName = process.env.EMAIL_FROM_NAME || "SmartStudent";

    if (!apiKey || !fromEmail) {
      return reject(
        new Error(
          "Missing BREVO_API_KEY or EMAIL_FROM environment variable. Set them in Render's Environment settings."
        )
      );
    }

    const payload = JSON.stringify({
      sender: { name: fromName, email: fromEmail },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    });

    const req = https.request(
      {
        hostname: "api.brevo.com",
        path: "/v3/smtp/email",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "api-key": apiKey,
          "Content-Length": Buffer.byteLength(payload),
        },
        timeout: 15000, // fail fast instead of hanging for minutes
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(body);
          } else {
            reject(new Error(`Brevo API error (${res.statusCode}): ${body}`));
          }
        });
      }
    );

    req.on("timeout", () => {
      req.destroy(new Error("Brevo API request timed out"));
    });
    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

exports.sendOTP = async (email, otp) => {
  await sendTransactionalEmail({
    to: email,
    subject: "Your OTP for Password Reset",
    html: `<p>Your OTP is: <strong>${otp}</strong>. It is valid for 10 minutes.</p>`,
  });
};

// Generic helper so other controllers (e.g. authController) can send custom
// subject/body emails (registration OTPs, notifications, etc.) through the
// same reliable Brevo API instead of keeping their own SMTP transporters.
exports.sendMail = async ({ to, subject, html }) => {
  await sendTransactionalEmail({ to, subject, html });
};
