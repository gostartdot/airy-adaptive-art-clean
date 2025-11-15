import nodemailer from "nodemailer";

// Create transporter with correct Gmail production settings
const createTransporter = () => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    console.warn("⚠️ Email credentials missing.");
    return null;
  }

  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,           // Must be 465
    secure: true,        // Must be true for port 465
    auth: {
      user: emailUser,
      pass: emailPass,   // Gmail APP PASSWORD (16 chars)
    },
    tls: {
      rejectUnauthorized: false,  // Prevent ECONNRESET on cloud hosts
    },
  });
};

const sendEmail = async (options: any) => {
  try {
    const transporter = createTransporter();
    if (!transporter) {
      console.log("📧 [MOCK EMAIL]", options);
      return true;
    }

    await transporter.sendMail(options);
    return true;
  } catch (error) {
    console.error("❌ Email error:", error);
    return false;
  }
};

// ------------------ OTP EMAIL ------------------

export const sendOTPEmail = async (email: string, otp: string) => {
  return sendEmail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP for Start Dating App",
    html: `
      <div style="font-family: Arial; max-width: 600px; margin: auto;">
        <h2>Verify Your Email</h2>
        <p>Your OTP is:</p>
        <div style="padding: 20px; background: #f3f3f3; text-align:center;">
          <h1 style="letter-spacing:4px;">${otp}</h1>
        </div>
        <p>This OTP expires in 5 minutes.</p>
      </div>
    `,
    text: `Your OTP is ${otp}`,
  });
};

// ------------------ WELCOME EMAIL ------------------

export const sendWelcomeEmail = async (email: string, firstName: string) => {
  return sendEmail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: email,
    subject: "Welcome to Start Dating App!",
    html: `
      <div style="font-family: Arial; max-width: 600px; margin: auto;">
        <h2>Welcome, ${firstName}!</h2>
        <p>Your account has been created.</p>
        <a href="${process.env.CLIENT_URL}/login"
          style="padding:10px 20px; background:#007bff; color:white; text-decoration:none;">
          Get Started
        </a>
      </div>
    `,
  });
};

// ------------------ VERIFICATION EMAIL ------------------

export const sendVerificationEmail = async (
  email: string,
  name: string,
  status: "approved" | "rejected",
  reason?: string
) => {
  const approvedTemplate = `
    <div style="font-family: Arial; max-width: 600px; margin: auto;">
      <h2 style="color:#10b981">Congratulations, ${name}!</h2>
      <p>Your account verification has been approved!</p>
      <a href="${process.env.CLIENT_URL}/"
         style="padding:12px 24px; background:#10b981; color:white; text-decoration:none;">
        Start Dating Now
      </a>
    </div>
  `;

  const rejectedTemplate = `
    <div style="font-family: Arial; max-width: 600px; margin: auto;">
      <h2 style="color:#ef4444">Verification Failed</h2>
      <p>Hello ${name}, your verification was rejected.</p>
      ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}
      <a href="${process.env.CLIENT_URL}/"
         style="padding:12px 24px; background:#ef4444; color:white; text-decoration:none;">
        Contact Support
      </a>
    </div>
  `;

  return sendEmail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: email,
    subject:
      status === "approved"
        ? "Your Account Has Been Verified! 🎉"
        : "Account Verification Update",
    html: status === "approved" ? approvedTemplate : rejectedTemplate,
  });
};
