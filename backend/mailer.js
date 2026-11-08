const nodemailer = require('nodemailer');

// Initialize Transporter using environment variables
let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  const emailUser = process.env.SMTP_USER || '';
  const emailPass = (process.env.SMTP_PASS || '').replace(/\s+/g, '');

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.example.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: emailUser,
      pass: emailPass
    }
  });

  return transporter;
};

/**
 * Generate branded HTML email for AHK Factory OTP
 */
const generateOtpHtml = (code, expiresInMinutes = 5) => {
  return `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Код авторизации AHK Factory</title>
</head>
<body style="margin: 0; padding: 0; background-color: #08090A; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #EDEDED;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #08090A; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="540" style="max-width: 540px; background-color: #121418; border: 1px solid #2A241E; border-radius: 16px; overflow: hidden; box-shadow: 0 12px 40px rgba(0,0,0,0.6);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #1C1713 0%, #121418 100%); padding: 36px 32px 24px 32px; text-align: center; border-bottom: 1px solid rgba(200, 155, 109, 0.2);">
              <div style="display: inline-block; width: 44px; height: 44px; border-radius: 12px; background: linear-gradient(135deg, #E0B68A 0%, #C89B6D 100%); line-height: 44px; text-align: center; color: #0C0D0F; font-size: 22px; font-weight: bold; margin-bottom: 12px;">
                ✦
              </div>
              <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 0.12em; color: #F8F6F2; text-transform: uppercase;">AHK FACTORY</h1>
              <p style="margin: 6px 0 0 0; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #C89B6D;">Мебельная мануфактура авторского массива</p>
            </td>
          </tr>

          <!-- Main Body -->
          <tr>
            <td style="padding: 36px 32px;">
              <h2 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 700; color: #FFFFFF; text-align: center;">Одноразовый код для входа</h2>
              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #A3A3A3; text-align: center;">
                Используйте этот проверочный код для безопасного входа в личный кабинет покупателя интернет-магазина <strong>AHK Factory</strong>.
              </p>

              <!-- OTP Code Block -->
              <div style="background-color: #1A1714; border: 2px dashed #C89B6D; border-radius: 12px; padding: 24px; text-align: center; margin: 0 0 24px 0;">
                <span style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.15em; color: #C89B6D; font-weight: 600; display: block; margin-bottom: 8px;">Ваш проверочный код:</span>
                <div style="font-family: 'Courier New', Courier, monospace, sans-serif; font-size: 38px; font-weight: 800; letter-spacing: 12px; color: #F5DEC2; text-shadow: 0 0 15px rgba(224, 182, 138, 0.4);">
                  ${code}
                </div>
              </div>

              <!-- Notice -->
              <div style="background-color: rgba(200, 155, 109, 0.08); border-left: 3px solid #C89B6D; padding: 12px 16px; border-radius: 6px; margin-bottom: 24px;">
                <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #D1C5B8;">
                  ⏱ Код действителен в течение <strong>${expiresInMinutes} минут</strong>. Никому не сообщайте этот код.
                </p>
              </div>

              <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #737373; text-align: center;">
                Если вы не запрашивали вход в личный кабинет, проигнорируйте это письмо. Ваш аккаунт в полной безопасности.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0C0D0F; padding: 24px 32px; text-align: center; border-top: 1px solid #1C1E22;">
              <p style="margin: 0 0 6px 0; font-size: 11px; color: #8F8F8F;">
                AHK Factory • г. Ташкент, ул. Нукус • Тел: +998 (90) 123-45-67
              </p>
              <p style="margin: 0; font-size: 10px; color: #525252;">
                © 2026 AHK Factory Solid Wood Furniture. Все права защищены.
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
};

/**
 * Send OTP Code via email
 * @param {Object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.code - 6-digit OTP code
 * @param {number} options.expiresInMinutes - Expiry time in minutes
 */
const sendOtpEmail = async ({ to, code, expiresInMinutes = 5 }) => {
  const mailTransporter = getTransporter();
  const fromAddress = process.env.SMTP_FROM || '"AHK Factory" <no-reply@ahkfactory.uz>';

  const subject = `Код авторизации в AHK Factory: ${code}`;
  const html = generateOtpHtml(code, expiresInMinutes);
  const text = `Ваш проверочный код для входа в AHK Factory: ${code}. Код действителен в течение ${expiresInMinutes} минут.`;

  try {
    const info = await mailTransporter.sendMail({
      from: fromAddress,
      to,
      subject,
      text,
      html
    });
    console.log(`✉️ [Nodemailer Gmail] OTP sent to ${to} (MessageID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`❌ [Nodemailer Error] Failed to send email to ${to}:`, err.message);
    throw new Error(`Не удалось отправить письмо на ${to}: ${err.message}`);
  }
};

module.exports = {
  sendOtpEmail,
  generateOtpHtml
};
