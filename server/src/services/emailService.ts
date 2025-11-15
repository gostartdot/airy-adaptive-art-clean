import nodemailer from 'nodemailer';

// Email configuration
const createTransporter = () => {
  const emailService = process.env.EMAIL_SERVICE || 'gmail';
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  const emailHost = process.env.EMAIL_HOST || 'smtp.gmail.com';
  const emailPort = parseInt(process.env.EMAIL_PORT || '587', 10);
  const emailSecure = process.env.EMAIL_SECURE === 'true';

  if (!emailUser || !emailPass) {
    console.warn('⚠️ Email credentials not configured. OTP emails will not be sent.');
    return null;
  }

  return nodemailer.createTransport({
    service: emailService,
    host: emailHost,
    port: emailPort,
    secure: emailSecure,
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });
};

export const sendOTPEmail = async (email: string, otp: string): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      console.log(`📧 [MOCK] OTP for ${email}: ${otp}`);
      return true; // Return true for development
    }

    const emailFrom = process.env.EMAIL_FROM || 'noreply@startdating.com';
    
    const mailOptions = {
      from: emailFrom,
      to: email,
      subject: 'Your OTP for Start Dating App',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Verify Your Email</h2>
          <p>Hello!</p>
          <p>Your OTP (One-Time Password) for Start Dating App is:</p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 5px;">${otp}</h1>
          </div>
          <p>This OTP will expire in 5 minutes.</p>
          <p>If you didn't request this OTP, please ignore this email.</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            This is an automated message from Start Dating App. Please do not reply to this email.
          </p>
        </div>
      `,
      text: `Your OTP for Start Dating App is: ${otp}. This OTP will expire in 5 minutes.`
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send OTP email:', error);
    return false;
  }
};

export const sendWelcomeEmail = async (email: string, firstName: string): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      console.log(`📧 [MOCK] Welcome email for ${email}`);
      return true;
    }

    const emailFrom = process.env.EMAIL_FROM || 'noreply@startdating.com';
    
    const mailOptions = {
      from: emailFrom,
      to: email,
      subject: 'Welcome to Start Dating App!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to Start Dating App, ${firstName}!</h2>
          <p>Your account has been successfully created.</p>
          <p>You can now start finding your perfect match!</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL || 'http://localhost:5174'}/login" 
               style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
              Get Started
            </a>
          </div>
          <p>Happy dating!</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            This is an automated message from Start Dating App.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send welcome email:', error);
    return false;
  }
};

export const sendVerificationEmail = async (
  email: string,
  name: string,
  status: 'approved' | 'rejected',
  reason?: string
): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      console.log(`📧 [MOCK] Verification ${status} email for ${email}`);
      return true;
    }

    const emailFrom = process.env.EMAIL_FROM || 'noreply@startdating.com';
    
    const subject = status === 'approved' 
      ? 'Your Account Has Been Verified! 🎉'
      : 'Account Verification Update';
    
    const html = status === 'approved'
      ? `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">Congratulations, ${name}!</h2>
          <p>Great news! Your account verification has been approved.</p>
          <p>You can now access all features of the Start Dating App and start finding your perfect match!</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL || 'http://localhost:5174'}/" 
               style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Start Dating Now
            </a>
          </div>
          <p>Welcome to the community!</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            This is an automated message from Start Dating App.
          </p>
        </div>
      `
      : `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ef4444;">Account Verification Update</h2>
          <p>Hello ${name},</p>
          <p>We regret to inform you that your account verification has been rejected.</p>
          ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
          <p>If you believe this is an error or would like to resubmit your verification documents, please contact our support team.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL || 'http://localhost:5174'}/" 
               style="background-color: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Contact Support
            </a>
          </div>
          <p>Thank you for your interest in Start Dating App.</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            This is an automated message from Start Dating App.
          </p>
        </div>
      `;
    
    const mailOptions = {
      from: emailFrom,
      to: email,
      subject,
      html,
      text: status === 'approved'
        ? `Congratulations ${name}! Your account verification has been approved. You can now access all features of the Start Dating App.`
        : `Hello ${name}, your account verification has been rejected.${reason ? ` Reason: ${reason}` : ''} Please contact support if you have questions.`
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Verification ${status} email sent to ${email}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send verification ${status} email:`, error);
    return false;
  }
};
