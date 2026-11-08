const crypto = require('crypto');
const mailer = require('./mailer');

// In-memory OTP storage: email -> { code, expiresAt, lastSentAt, attempts }
const otpStore = new Map();

const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds
const MAX_ATTEMPTS = 5;

/**
 * Generate a secure 6-digit numeric OTP code
 */
const generateCode = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

/**
 * Request an OTP code for an email address
 * @param {string} rawEmail
 */
const requestOtp = async (rawEmail) => {
  if (!rawEmail || typeof rawEmail !== 'string') {
    throw new Error('Укажите корректный email адрес');
  }

  const email = rawEmail.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Некорректный формат адреса электронной почты');
  }

  const now = Date.now();
  const existing = otpStore.get(email);

  // Check resend cooldown
  if (existing && now - existing.lastSentAt < RESEND_COOLDOWN_MS) {
    const secondsLeft = Math.ceil((RESEND_COOLDOWN_MS - (now - existing.lastSentAt)) / 1000);
    const err = new Error(`Пожалуйста, подождите ${secondsLeft} сек. перед повторным запросом кода`);
    err.cooldownRemaining = secondsLeft;
    err.status = 429;
    throw err;
  }

  const code = generateCode();
  const expiresAt = now + OTP_EXPIRY_MS;

  otpStore.set(email, {
    code,
    expiresAt,
    lastSentAt: now,
    attempts: 0
  });

  // Send real email via Nodemailer
  await mailer.sendOtpEmail({
    to: email,
    code,
    expiresInMinutes: 5
  });

  return {
    success: true,
    message: `Код подтверждения отправлен на ${email}`,
    expiresIn: Math.floor(OTP_EXPIRY_MS / 1000),
    resendCooldown: Math.floor(RESEND_COOLDOWN_MS / 1000)
  };
};

/**
 * Verify an OTP code
 * @param {string} rawEmail
 * @param {string} rawCode
 */
const verifyOtp = (rawEmail, rawCode) => {
  if (!rawEmail || !rawCode) {
    throw new Error('Введите email и проверочный код');
  }

  const email = rawEmail.trim().toLowerCase();
  const code = String(rawCode).trim();

  const record = otpStore.get(email);
  if (!record) {
    throw new Error('Код подтверждения не найден или истек. Запросите новый код');
  }

  const now = Date.now();
  if (now > record.expiresAt) {
    otpStore.delete(email);
    throw new Error('Срок действия кода истек (5 минут). Пожалуйста, запросите новый код');
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    otpStore.delete(email);
    throw new Error('Превышено максимальное количество попыток ввода. Запросите новый код');
  }

  if (record.code !== code) {
    record.attempts += 1;
    const remaining = MAX_ATTEMPTS - record.attempts;
    if (remaining <= 0) {
      otpStore.delete(email);
      throw new Error('Неверный код. Лимит попыток исчерпан. Запросите новый код');
    }
    throw new Error(`Неверный проверочный код. Осталось попыток: ${remaining}`);
  }

  // Code verified successfully! Invalidate to prevent replay attacks
  otpStore.delete(email);
  return { success: true, email };
};

module.exports = {
  requestOtp,
  verifyOtp
};
