import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  X,
  Lock,
  Mail,
  User,
  Phone,
  AlertCircle,
  ArrowRight,
  RotateCw,
  KeyRound,
  Eye,
  EyeOff,
  Clock,
  ShieldAlert
} from 'lucide-react';

export const AuthModal = () => {
  const { authModalOpen, authModalInitialTab, closeAuthModal, login, register } = useAuth();
  const { t } = useLanguage();

  // Active tab: 'login' | 'register'
  const [tab, setTab] = useState('login');

  // Form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Brute-force progressive lockout state
  const [isLocked, setIsLocked] = useState(false);
  const [lockUntil, setLockUntil] = useState(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [blockStage, setBlockStage] = useState(0);
  const [attemptsLeft, setAttemptsLeft] = useState(3);

  // Debounce ref for security check
  const checkSecurityTimeoutRef = useRef(null);

  // Check email security status
  const checkEmailSecurity = async (targetEmail) => {
    if (!targetEmail || !targetEmail.includes('@')) return;
    try {
      const res = await fetch(`/api/auth/security-status?email=${encodeURIComponent(targetEmail.trim().toLowerCase())}`);
      if (res.ok) {
        const text = await res.text();
        if (text && text.trim()) {
          const data = JSON.parse(text);
          if (data.locked && data.lock_until) {
            setIsLocked(true);
            setLockUntil(data.lock_until);
            setRemainingSeconds(data.remaining_seconds || 0);
            setBlockStage(data.block_stage || 1);
            setAttemptsLeft(0);
          } else {
            setIsLocked(false);
            setLockUntil(null);
            setRemainingSeconds(0);
            setBlockStage(data.block_stage || 0);
            if (data.attempts_left !== undefined) {
              setAttemptsLeft(data.attempts_left);
            }
          }
        }
      }
    } catch (err) {
      console.warn('Failed to query user security status:', err);
    }
  };

  // Real-time Countdown Timer (updates every second, auto-unlocks when expires)
  useEffect(() => {
    if (!isLocked || !lockUntil) return;

    const updateCountdown = () => {
      const now = Date.now();
      const target = new Date(lockUntil).getTime();
      const diff = Math.max(0, Math.ceil((target - now) / 1000));
      setRemainingSeconds(diff);

      if (diff <= 0) {
        // Automatically unlock the form when time runs out!
        setIsLocked(false);
        setLockUntil(null);
        setError('');
        setAttemptsLeft(3);
        if (email) {
          checkEmailSecurity(email);
        }
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [isLocked, lockUntil, email]);

  // Reset or initialize when modal opens
  useEffect(() => {
    if (authModalOpen) {
      setError('');
      setShowPassword(false);
      if (authModalInitialTab === 'register') {
        setTab('register');
      } else {
        setTab('login');
      }
      if (email && email.includes('@')) {
        checkEmailSecurity(email);
      }
    }
  }, [authModalOpen, authModalInitialTab]);

  // Format seconds into MM:SS
  const formatCountdown = (totalSecs) => {
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(m)}:${pad(s)}`;
  };

  // Handle email change with debounced security check
  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);
    setError('');

    if (checkSecurityTimeoutRef.current) {
      clearTimeout(checkSecurityTimeoutRef.current);
    }

    if (val && val.includes('@') && tab === 'login') {
      checkSecurityTimeoutRef.current = setTimeout(() => {
        checkEmailSecurity(val);
      }, 500);
    }
  };

  if (!authModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLocked) return;
    setError('');
    setLoading(true);

    try {
      if (tab === 'login') {
        await login(email, password);
        setIsLocked(false);
        setLockUntil(null);
        setRemainingSeconds(0);
        setBlockStage(0);
        setAttemptsLeft(3);
      } else {
        await register({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim(),
          password,
          phone: phone.trim()
        });
      }
    } catch (err) {
      if (err.status === 423 || err.data?.locked) {
        setIsLocked(true);
        const lockUntilDate = err.data?.lock_until || new Date(Date.now() + 5 * 60 * 1000).toISOString();
        const remSec = err.data?.remaining_seconds || 300;
        setLockUntil(lockUntilDate);
        setRemainingSeconds(remSec);
        setBlockStage(err.data?.block_stage || 1);
        setAttemptsLeft(0);
        setError(err.message || `Вход заблокирован на ${Math.ceil(remSec / 60)} мин.`);
      } else {
        if (err.data?.attempts_left !== undefined) {
          setAttemptsLeft(err.data.attempts_left);
        }
        setError(err.message || t('auth_error_fallback') || 'Произошла ошибка при авторизации');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={closeAuthModal}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          padding: '36px 32px',
          maxWidth: '460px',
          width: '100%',
          position: 'relative'
        }}
      >
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          <X size={20} />
        </button>

        {/* Brand Accent Icon */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: isLocked
                ? 'rgba(239, 68, 68, 0.15)'
                : 'linear-gradient(135deg, rgba(224, 182, 138, 0.2) 0%, rgba(200, 155, 109, 0.08) 100%)',
              border: isLocked
                ? '1px solid rgba(239, 68, 68, 0.4)'
                : '1px solid rgba(200, 155, 109, 0.3)',
              boxShadow: isLocked
                ? '0 4px 20px rgba(239, 68, 68, 0.25)'
                : '0 4px 20px rgba(200, 155, 109, 0.15)',
              marginBottom: '10px'
            }}
          >
            {isLocked ? (
              <ShieldAlert size={26} color="#F87171" />
            ) : (
              <KeyRound size={24} color="var(--wood-light)" />
            )}
          </div>

          <h3
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '24px',
              fontWeight: '700',
              color: '#F8F6F2',
              marginBottom: '6px'
            }}
          >
            {isLocked
              ? 'Вход заблокирован'
              : tab === 'login'
              ? t('auth_modal_login_title')
              : t('auth_modal_register_title')}
          </h3>

          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, maxWidth: '380px', margin: '0 auto' }}>
            {isLocked
              ? 'Превышено количество попыток ввода пароля'
              : tab === 'login'
              ? t('auth_modal_login_sub')
              : t('auth_modal_register_sub')}
          </p>
        </div>

        {/* Tab Switcher: Login vs Register (only when not locked) */}
        {!isLocked && (
          <div
            style={{
              display: 'flex',
              background: 'rgba(255, 255, 255, 0.04)',
              borderRadius: '10px',
              padding: '4px',
              marginBottom: '22px',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <button
              type="button"
              onClick={() => {
                setTab('login');
                setError('');
              }}
              style={{
                flex: 1,
                padding: '9px 0',
                background: tab === 'login' ? 'linear-gradient(135deg, var(--wood-light) 0%, var(--wood-warm) 100%)' : 'none',
                color: tab === 'login' ? '#0C0D0F' : 'var(--text-secondary)',
                fontWeight: '700',
                fontSize: '13px',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.2s',
                boxShadow: tab === 'login' ? '0 2px 10px rgba(200, 155, 109, 0.3)' : 'none'
              }}
            >
              <Lock size={14} />
              <span>{t('auth_tab_login')}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setTab('register');
                setError('');
              }}
              style={{
                flex: 1,
                padding: '9px 0',
                background: tab === 'register' ? 'linear-gradient(135deg, var(--wood-light) 0%, var(--wood-warm) 100%)' : 'none',
                color: tab === 'register' ? '#0C0D0F' : 'var(--text-secondary)',
                fontWeight: '700',
                fontSize: '13px',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.2s',
                boxShadow: tab === 'register' ? '0 2px 10px rgba(200, 155, 109, 0.3)' : 'none'
              }}
            >
              <User size={14} />
              <span>{t('auth_tab_register')}</span>
            </button>
          </div>
        )}

        {/* LOCKED COUNTDOWN TIMER BANNER */}
        {isLocked && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              borderRadius: '16px',
              padding: '20px 16px',
              marginBottom: '22px',
              textAlign: 'center',
              boxShadow: '0 8px 30px rgba(239, 68, 68, 0.15)',
              animation: 'fadeIn 0.3s ease forwards'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#FCA5A5', marginBottom: '6px' }}>
              <ShieldAlert size={18} />
              <span style={{ fontSize: '14px', fontWeight: '700' }}>
                Вход временно заблокирован
              </span>
            </div>

            <div style={{ fontSize: '12px', color: 'rgba(248, 246, 242, 0.7)', marginBottom: '14px' }}>
              {blockStage <= 1 && '1-я блокировка — 5 минут'}
              {blockStage === 2 && '2-я блокировка — 15 минут'}
              {blockStage === 3 && '3-я блокировка — 30 минут'}
              {blockStage >= 4 && '4-я блокировка — 60 минут (максимум)'}
            </div>

            <div
              style={{
                fontSize: '40px',
                fontWeight: '800',
                fontFamily: 'monospace',
                color: '#F87171',
                letterSpacing: '0.08em',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                background: 'rgba(0, 0, 0, 0.35)',
                padding: '10px 16px',
                borderRadius: '10px',
                border: '1px solid rgba(239, 68, 68, 0.25)'
              }}
            >
              <Clock size={26} />
              <span>{formatCountdown(remainingSeconds)}</span>
            </div>

            <div style={{ fontSize: '11px', color: 'rgba(248, 246, 242, 0.6)', marginTop: '12px' }}>
              По истечении времени форма разблокируется автоматически
            </div>
          </div>
        )}

        {/* Warning if attempts remaining < 3 and not locked */}
        {!isLocked && tab === 'login' && attemptsLeft < 3 && attemptsLeft > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '12px',
              color: '#F59E0B',
              background: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '8px',
              padding: '10px 14px',
              marginBottom: '16px',
              animation: 'fadeIn 0.2s ease forwards'
            }}
          >
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            <span>
              Осталось попыток ввода пароля: <strong style={{ color: '#FBBF24', fontSize: '13px' }}>{attemptsLeft}</strong> из 3
            </span>
          </div>
        )}

        {/* Error Alert */}
        {error && !isLocked && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 16px',
              backgroundColor: 'rgba(248, 113, 113, 0.12)',
              border: '1px solid rgba(248, 113, 113, 0.3)',
              borderRadius: 'var(--radius-sm)',
              color: '#F87171',
              fontSize: '13px',
              marginBottom: '18px',
              animation: 'fadeIn 0.2s ease forwards'
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Main Password Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {tab === 'register' && (
            <>
              {/* First Name & Last Name */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    {t('auth_first_name')}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      required
                      placeholder={t('auth_first_name_placeholder')}
                      className="input-field"
                      style={{ paddingLeft: '38px' }}
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                    <User
                      size={16}
                      color="var(--text-muted)"
                      style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    {t('auth_last_name')}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      required
                      placeholder={t('auth_last_name_placeholder')}
                      className="input-field"
                      style={{ paddingLeft: '38px' }}
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                    <User
                      size={16}
                      color="var(--text-muted)"
                      style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                    />
                  </div>
                </div>
              </div>

              {/* Phone */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  {t('auth_phone')}
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="tel"
                    placeholder="+998 (90) 000-00-00"
                    className="input-field"
                    style={{ paddingLeft: '38px' }}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <Phone
                    size={16}
                    color="var(--text-muted)"
                    style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                  />
                </div>
              </div>
            </>
          )}

          {/* Email */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              {t('auth_email')}
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                required
                disabled={isLocked}
                placeholder="name@example.com"
                className="input-field"
                style={{
                  paddingLeft: '38px',
                  opacity: isLocked ? 0.6 : 1,
                  cursor: isLocked ? 'not-allowed' : 'text'
                }}
                value={email}
                onChange={handleEmailChange}
                onBlur={() => {
                  if (email && email.includes('@') && tab === 'login') {
                    checkEmailSecurity(email);
                  }
                }}
                autoFocus={tab === 'login' && !isLocked}
              />
              <Mail
                size={16}
                color="var(--text-muted)"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>
                {t('auth_password')}
              </label>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                disabled={isLocked}
                minLength={6}
                placeholder={isLocked ? `Заблокировано (${formatCountdown(remainingSeconds)})` : '••••••••'}
                className="input-field"
                style={{
                  paddingLeft: '38px',
                  paddingRight: '40px',
                  opacity: isLocked ? 0.6 : 1,
                  cursor: isLocked ? 'not-allowed' : 'text'
                }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Lock
                size={16}
                color="var(--text-muted)"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
              />
              {!isLocked && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || isLocked}
            className="btn-primary"
            style={{
              width: '100%',
              marginTop: '6px',
              opacity: isLocked ? 0.5 : 1,
              cursor: isLocked ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <RotateCw size={18} className="animate-spin" />
                {t('auth_loading')}
              </span>
            ) : isLocked ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} />
                Заблокировано ({formatCountdown(remainingSeconds)})
              </span>
            ) : (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                {tab === 'login' ? t('auth_submit_login') : t('auth_submit_register')}
                <ArrowRight size={18} />
              </span>
            )}
          </button>
        </form>

        {/* Footer switch prompt */}
        {!isLocked && (
          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            {tab === 'login' ? (
              <span>
                Еще нет аккаунта?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setTab('register');
                    setError('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--wood-light)',
                    fontWeight: '600',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  {t('auth_tab_register')}
                </button>
              </span>
            ) : (
              <span>
                Уже зарегистрированы?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setTab('login');
                    setError('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--wood-light)',
                    fontWeight: '600',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  {t('auth_tab_login')}
                </button>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
