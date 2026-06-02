const nodemailer = require('nodemailer');

// Creates real transporter or Ethereal test transporter as fallback
const createTransporter = async () => {
  // If real credentials are set, use them
  if (process.env.EMAIL_USER && process.env.EMAIL_USER !== 'your_gmail_here@gmail.com') {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp-mail.outlook.com',
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      },
      tls: { rejectUnauthorized: false, ciphers: 'SSLv3' }
    });
  }

  // Fallback: Ethereal fake SMTP (auto-creates test account)
  const testAccount = await nodemailer.createTestAccount();
  console.log('\n📧 ETHEREAL TEST EMAIL ACCOUNT CREATED:');
  console.log('   User:', testAccount.user);
  console.log('   Pass:', testAccount.pass);
  console.log('   Preview URL will appear after sending\n');

  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  });
};

const sendEmail = async (options) => {
  const transporter = await createTransporter();

  const info = await transporter.sendMail({
    from: `"TaskFlow" <${process.env.EMAIL_USER || 'noreply@taskflow.com'}>`,
    to: options.email,
    subject: options.subject,
    html: options.html
  });

  // For Ethereal: log the URL where you can view the email
  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log('\n✅ OTP EMAIL SENT!');
    console.log('👉 View it here:', previewUrl);
    console.log('   (Open this URL in your browser to see the OTP)\n');
  }
};

const sendVerificationEmail = async (email, name) => {
  await sendEmail({
    email,
    subject: 'Welcome to TaskFlow!',
    html: `<h1>Welcome ${name}!</h1><p>Your account has been created successfully.</p>`
  });
};

const sendTaskReminder = async (email, task) => {
  await sendEmail({
    email,
    subject: `Reminder: ${task.title}`,
    html: `<h2>Task Reminder</h2><h3>${task.title}</h3><p>Deadline: ${new Date(task.deadline).toLocaleString()}</p>`
  });
};

const sendOtpEmail = async (email, name, otp) => {
  await sendEmail({
    email,
    subject: '🔐 TaskFlow — Your Password Reset OTP',
    html: `
      <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:480px;margin:0 auto;background:#f8fafc;border-radius:16px;overflow:hidden">
        <div style="background:linear-gradient(135deg,#2563eb,#7c3aed);padding:32px;text-align:center">
          <h1 style="color:#fff;margin:0;font-size:24px;letter-spacing:-0.5px">TaskFlow</h1>
          <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px">Password Reset Request</p>
        </div>
        <div style="padding:32px">
          <p style="color:#374151;font-size:16px;margin:0 0 8px">Hi <strong>${name}</strong>,</p>
          <p style="color:#6b7280;font-size:14px;margin:0 0 24px">Use the OTP below to reset your password. It expires in <strong>10 minutes</strong>.</p>
          <div style="background:#fff;border:2px dashed #2563eb;border-radius:12px;padding:24px;text-align:center;margin:0 0 24px">
            <p style="color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:2px;margin:0 0 8px">Your OTP</p>
            <p style="font-size:48px;font-weight:800;letter-spacing:14px;color:#111827;margin:0;font-family:monospace">${otp}</p>
          </div>
          <p style="color:#9ca3af;font-size:12px;margin:0">If you didn't request this, ignore this email. Your password won't change.</p>
        </div>
        <div style="background:#f1f5f9;padding:16px;text-align:center">
          <p style="color:#9ca3af;font-size:12px;margin:0">© 2024 TaskFlow. All rights reserved.</p>
        </div>
      </div>
    `
  });
};

module.exports = { sendEmail, sendVerificationEmail, sendTaskReminder, sendOtpEmail };
