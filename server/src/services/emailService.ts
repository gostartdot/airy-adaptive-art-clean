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
    auth: {
      user: emailUser,
      pass: emailPass, // Gmail APP PASSWORD (16 chars)
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
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #fef2f2;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef2f2; padding: 40px 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <!-- Header with gradient -->
                <tr>
                  <td style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-family: 'Arial', sans-serif; font-weight: 700;">
                      Start Dating App
                    </h1>
                    <p style="color: #fee2e2; margin: 10px 0 0 0; font-size: 16px; font-family: 'Arial', sans-serif;">
                      Where Hearts Connect
                    </p>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 50px 40px;">
                    <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 28px; font-family: 'Arial', sans-serif; font-weight: 600; text-align: center;">
                      Verify Your Email Address
                    </h2>
                    
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; font-family: 'Arial', sans-serif; margin: 0 0 30px 0; text-align: center;">
                      Thank you for choosing Start Dating App. To complete your registration and start your journey to find meaningful connections, please use the verification code below.
                    </p>
                    
                    <!-- OTP Box -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                      <tr>
                        <td align="center">
                          <div style="background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border: 3px solid #dc2626; border-radius: 12px; padding: 30px; display: inline-block;">
                            <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0; font-family: 'Arial', sans-serif; text-transform: uppercase; letter-spacing: 1px;">
                              Your Verification Code
                            </p>
                            <h1 style="color: #dc2626; margin: 0; font-size: 48px; font-family: 'Courier New', monospace; letter-spacing: 8px; font-weight: 700;">
                              ${otp}
                            </h1>
                          </div>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="color: #6b7280; font-size: 15px; line-height: 1.6; font-family: 'Arial', sans-serif; margin: 30px 0 0 0; text-align: center;">
                      This verification code will expire in <strong style="color: #dc2626;">5 minutes</strong>. Please enter it promptly to verify your account.
                    </p>
                    
                    <p style="color: #9ca3af; font-size: 14px; line-height: 1.6; font-family: 'Arial', sans-serif; margin: 25px 0 0 0; text-align: center;">
                      If you didn't request this verification code, please ignore this email or contact our support team if you have concerns.
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #fef2f2; padding: 30px 40px; text-align: center; border-top: 1px solid #fee2e2;">
                    <p style="color: #6b7280; font-size: 13px; line-height: 1.6; font-family: 'Arial', sans-serif; margin: 0;">
                      This email was sent from Start Dating App<br>
                      Need help? Contact us at support@startdating.com
                    </p>
                    <p style="color: #9ca3af; font-size: 12px; font-family: 'Arial', sans-serif; margin: 15px 0 0 0;">
                      &copy; 2025 Start Dating App. All rights reserved.
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
    text: `Your verification code for Start Dating App is ${otp}. This code expires in 5 minutes.`,
  });
};

// ------------------ UNDER VERIFICATION EMAIL ------------------

export const sendUnderVerificationEmail = async (
  email: string,
  firstName: string
) => {
  return sendEmail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: email,
    subject: "Account Under Review - Start Dating App",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #fef2f2;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef2f2; padding: 40px 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <!-- Header with gradient -->
                <tr>
                  <td style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-family: 'Arial', sans-serif; font-weight: 700;">
                      Start Dating App
                    </h1>
                    <p style="color: #fee2e2; margin: 10px 0 0 0; font-size: 16px; font-family: 'Arial', sans-serif;">
                      Where Hearts Connect
                    </p>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 50px 40px;">
                    <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 28px; font-family: 'Arial', sans-serif; font-weight: 600; text-align: center;">
                      Welcome, ${firstName}
                    </h2>
                    
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.8; font-family: 'Arial', sans-serif; margin: 0 0 25px 0;">
                      Thank you for registering with Start Dating App. We're excited to have you join our community of people seeking meaningful connections and genuine relationships.
                    </p>
                    
                    <!-- Status Box -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                      <tr>
                        <td align="center">
                          <div style="background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border-left: 4px solid #dc2626; border-radius: 8px; padding: 25px; text-align: left;">
                            <p style="color: #dc2626; font-size: 16px; margin: 0 0 10px 0; font-family: 'Arial', sans-serif; font-weight: 600;">
                              Account Status: Under Review
                            </p>
                            <p style="color: #4b5563; font-size: 15px; line-height: 1.6; font-family: 'Arial', sans-serif; margin: 0;">
                              Your account is currently being reviewed by our verification team. This process helps us maintain a safe and authentic community for all members.
                            </p>
                          </div>
                        </td>
                      </tr>
                    </table>
                    
                    <h3 style="color: #1f2937; margin: 35px 0 15px 0; font-size: 20px; font-family: 'Arial', sans-serif; font-weight: 600;">
                      What Happens Next?
                    </h3>
                    
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 15px 0;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td width="40" valign="top">
                                <div style="width: 30px; height: 30px; background-color: #dc2626; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                                  <span style="color: #ffffff; font-size: 16px; font-weight: 700; font-family: 'Arial', sans-serif;">1</span>
                                </div>
                              </td>
                              <td style="padding-left: 15px;">
                                <p style="color: #1f2937; font-size: 15px; margin: 0 0 5px 0; font-family: 'Arial', sans-serif; font-weight: 600;">
                                  Review Process
                                </p>
                                <p style="color: #6b7280; font-size: 14px; line-height: 1.5; font-family: 'Arial', sans-serif; margin: 0;">
                                  Our team will carefully review your profile and submitted information to ensure it meets our community guidelines.
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      
                      <tr>
                        <td style="padding: 15px 0;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td width="40" valign="top">
                                <div style="width: 30px; height: 30px; background-color: #dc2626; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                                  <span style="color: #ffffff; font-size: 16px; font-weight: 700; font-family: 'Arial', sans-serif;">2</span>
                                </div>
                              </td>
                              <td style="padding-left: 15px;">
                                <p style="color: #1f2937; font-size: 15px; margin: 0 0 5px 0; font-family: 'Arial', sans-serif; font-weight: 600;">
                                  Verification Timeline
                                </p>
                                <p style="color: #6b7280; font-size: 14px; line-height: 1.5; font-family: 'Arial', sans-serif; margin: 0;">
                                  The verification process typically takes 24-48 hours. We appreciate your patience during this time.
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      
                      <tr>
                        <td style="padding: 15px 0;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td width="40" valign="top">
                                <div style="width: 30px; height: 30px; background-color: #dc2626; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                                  <span style="color: #ffffff; font-size: 16px; font-weight: 700; font-family: 'Arial', sans-serif;">3</span>
                                </div>
                              </td>
                              <td style="padding-left: 15px;">
                                <p style="color: #1f2937; font-size: 15px; margin: 0 0 5px 0; font-family: 'Arial', sans-serif; font-weight: 600;">
                                  Notification
                                </p>
                                <p style="color: #6b7280; font-size: 14px; line-height: 1.5; font-family: 'Arial', sans-serif; margin: 0;">
                                  Once your account is approved, you'll receive an email notification and can immediately start exploring connections.
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="color: #4b5563; font-size: 15px; line-height: 1.8; font-family: 'Arial', sans-serif; margin: 30px 0 0 0;">
                      We're committed to creating a safe and genuine environment where real connections can flourish. Thank you for being part of our community.
                    </p>
                    
                    <p style="color: #9ca3af; font-size: 14px; line-height: 1.6; font-family: 'Arial', sans-serif; margin: 25px 0 0 0;">
                      If you have any questions or concerns during the verification process, please don't hesitate to reach out to our support team.
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #fef2f2; padding: 30px 40px; text-align: center; border-top: 1px solid #fee2e2;">
                    <p style="color: #6b7280; font-size: 13px; line-height: 1.6; font-family: 'Arial', sans-serif; margin: 0;">
                      This email was sent from Start Dating App<br>
                      Need help? Contact us at support@startdating.com
                    </p>
                    <p style="color: #9ca3af; font-size: 12px; font-family: 'Arial', sans-serif; margin: 15px 0 0 0;">
                      &copy; 2025 Start Dating App. All rights reserved.
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
};

// ------------------ VERIFICATION EMAIL ------------------

export const sendVerificationEmail = async (
  email: string,
  name: string,
  status: "approved" | "rejected",
  reason?: string
) => {
  const approvedTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #fef2f2;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef2f2; padding: 40px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <!-- Header with gradient -->
              <tr>
                <td style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); padding: 40px 30px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-family: 'Arial', sans-serif; font-weight: 700;">
                    Start Dating App
                  </h1>
                  <p style="color: #fee2e2; margin: 10px 0 0 0; font-size: 16px; font-family: 'Arial', sans-serif;">
                    Where Hearts Connect
                  </p>
                </td>
              </tr>
              
              
              <!-- Content -->
              <tr>
                <td style="padding: 30px 40px 50px 40px;">
                  <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 28px; font-family: 'Arial', sans-serif; font-weight: 600; text-align: center;">
                    Congratulations, ${name}
                  </h2>
                  
                  <p style="color: #10b981; font-size: 18px; font-weight: 600; font-family: 'Arial', sans-serif; margin: 0 0 25px 0; text-align: center;">
                    Your Account Has Been Verified
                  </p>
                  
                  <p style="color: #4b5563; font-size: 16px; line-height: 1.8; font-family: 'Arial', sans-serif; margin: 0 0 25px 0;">
                    We're thrilled to welcome you to the Start Dating App community. Your profile has been reviewed and approved, and you're now ready to start your journey toward finding meaningful connections.
                  </p>
                  
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                    <tr>
                      <td align="center">
                        <div style="background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border-radius: 12px; padding: 30px; text-align: left;">
                          <h3 style="color: #1f2937; margin: 0 0 20px 0; font-size: 20px; font-family: 'Arial', sans-serif; font-weight: 600;">
                            What You Can Do Now
                          </h3>
                          
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="padding: 8px 0;">
                                <p style="color: #4b5563; font-size: 15px; margin: 0; font-family: 'Arial', sans-serif;">
                                  <span style="color: #dc2626; font-weight: 600;">♥</span> Complete your profile with photos and interests
                                </p>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0;">
                                <p style="color: #4b5563; font-size: 15px; margin: 0; font-family: 'Arial', sans-serif;">
                                  <span style="color: #dc2626; font-weight: 600;">♥</span> Browse and connect with compatible matches
                                </p>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0;">
                                <p style="color: #4b5563; font-size: 15px; margin: 0; font-family: 'Arial', sans-serif;">
                                  <span style="color: #dc2626; font-weight: 600;">♥</span> Start meaningful conversations
                                </p>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0;">
                                <p style="color: #4b5563; font-size: 15px; margin: 0; font-family: 'Arial', sans-serif;">
                                  <span style="color: #dc2626; font-weight: 600;">♥</span> Explore events and activities in your area
                                </p>
                              </td>
                            </tr>
                          </table>
                        </div>
                      </td>
                    </tr>
                  </table>
                  
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin: 35px 0 25px 0;">
                    <tr>
                      <td align="center">
                        <a href="${process.env.CLIENT_URL}/" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; font-family: 'Arial', sans-serif; box-shadow: 0 4px 6px rgba(220, 38, 38, 0.3);">
                          Start Your Journey
                        </a>
                      </td>
                    </tr>
                  </table>
                  
                  <p style="color: #4b5563; font-size: 15px; line-height: 1.8; font-family: 'Arial', sans-serif; margin: 30px 0 0 0;">
                    Remember, genuine connections are built on authenticity and respect. We encourage you to be yourself, engage thoughtfully, and enjoy the experience of meeting new people.
                  </p>
                  
                  <p style="color: #6b7280; font-size: 14px; line-height: 1.6; font-family: 'Arial', sans-serif; margin: 20px 0 0 0;">
                    Our support team is always here to help you make the most of your experience. If you have any questions or need assistance, don't hesitate to reach out.
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #fef2f2; padding: 30px 40px; text-align: center; border-top: 1px solid #fee2e2;">
                  <p style="color: #6b7280; font-size: 13px; line-height: 1.6; font-family: 'Arial', sans-serif; margin: 0;">
                    This email was sent from Start Dating App<br>
                    Need help? Contact us at support@startdating.com
                  </p>
                  <p style="color: #9ca3af; font-size: 12px; font-family: 'Arial', sans-serif; margin: 15px 0 0 0;">
                    &copy; 2025 Start Dating App. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const rejectedTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #fef2f2;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef2f2; padding: 40px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <!-- Header with gradient -->
              <tr>
                <td style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); padding: 40px 30px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-family: 'Arial', sans-serif; font-weight: 700;">
                    Start Dating App
                  </h1>
                  <p style="color: #fee2e2; margin: 10px 0 0 0; font-size: 16px; font-family: 'Arial', sans-serif;">
                    Where Hearts Connect
                  </p>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 50px 40px;">
                  <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 28px; font-family: 'Arial', sans-serif; font-weight: 600; text-align: center;">
                    Account Verification Update
                  </h2>
                  
                  <p style="color: #4b5563; font-size: 16px; line-height: 1.8; font-family: 'Arial', sans-serif; margin: 0 0 25px 0;">
                    Hello ${name},
                  </p>
                  
                  <p style="color: #4b5563; font-size: 16px; line-height: 1.8; font-family: 'Arial', sans-serif; margin: 0 0 25px 0;">
                    Thank you for your interest in joining Start Dating App. After careful review of your submitted information, we regret to inform you that we are unable to approve your account verification at this time.
                  </p>
                  
                  ${
                    reason
                      ? `
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                    <tr>
                      <td align="center">
                        <div style="background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border-left: 4px solid #dc2626; border-radius: 8px; padding: 25px; text-align: left;">
                          <p style="color: #dc2626; font-size: 16px; margin: 0 0 10px 0; font-family: 'Arial', sans-serif; font-weight: 600;">
                            Reason for Rejection
                          </p>
                          <p style="color: #4b5563; font-size: 15px; line-height: 1.6; font-family: 'Arial', sans-serif; margin: 0;">
                            ${reason}
                          </p>
                        </div>
                      </td>
                    </tr>
                  </table>
                  `
                      : ""
                  }
                  
                  <h3 style="color: #1f2937; margin: 35px 0 15px 0; font-size: 20px; font-family: 'Arial', sans-serif; font-weight: 600;">
                    What You Can Do
                  </h3>
                  
                  <p style="color: #4b5563; font-size: 15px; line-height: 1.8; font-family: 'Arial', sans-serif; margin: 0 0 20px 0;">
                    We understand this may be disappointing. Here are your options moving forward:
                  </p>
                  
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding: 12px 0;">
                        <p style="color: #4b5563; font-size: 15px; margin: 0; font-family: 'Arial', sans-serif;">
                          <span style="color: #dc2626; font-weight: 600;">•</span> Review our community guidelines and terms of service
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 12px 0;">
                        <p style="color: #4b5563; font-size: 15px; margin: 0; font-family: 'Arial', sans-serif;">
                          <span style="color: #dc2626; font-weight: 600;">•</span> Update your profile information and resubmit for verification
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 12px 0;">
                        <p style="color: #4b5563; font-size: 15px; margin: 0; font-family: 'Arial', sans-serif;">
                          <span style="color: #dc2626; font-weight: 600;">•</span> Contact our support team for clarification and assistance
                        </p>
                      </td>
                    </tr>
                  </table>
                  
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin: 35px 0 25px 0;">
                    <tr>
                      <td align="center">
                        <a href="${
                          process.env.CLIENT_URL
                        }/" style="display: inline-block; padding: 16px
                        40px; background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; font-family: 'Arial', sans-serif; box-shadow: 0 4px 6px rgba(220, 38, 38, 0.3);">
Contact Support
</a>
</td>
</tr>
</table>
              <p style="color: #4b5563; font-size: 15px; line-height: 1.8; font-family: 'Arial', sans-serif; margin: 30px 0 0 0;">
                We maintain high standards to ensure a safe and authentic community for all members. Our support team is happy to provide additional guidance and answer any questions you may have about the verification process.
              </p>
              
              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; font-family: 'Arial', sans-serif; margin: 20px 0 0 0;">
                Thank you for your understanding and cooperation.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #fef2f2; padding: 30px 40px; text-align: center; border-top: 1px solid #fee2e2;">
              <p style="color: #6b7280; font-size: 13px; line-height: 1.6; font-family: 'Arial', sans-serif; margin: 0;">
                This email was sent from Start Dating App<br>
                Need help? Contact us at support@startdating.com
              </p>
              <p style="color: #9ca3af; font-size: 12px; font-family: 'Arial', sans-serif; margin: 15px 0 0 0;">
                &copy; 2025 Start Dating App. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  return sendEmail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: email,
    subject:
      status === "approved"
        ? "Your Account Has Been Verified"
        : "Account Verification Update",
    html: status === "approved" ? approvedTemplate : rejectedTemplate,
  });
};
