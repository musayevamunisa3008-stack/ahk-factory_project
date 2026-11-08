import React from 'react';
import { useDeviceMode } from '../context/DeviceModeContext';
import { Smartphone, Monitor, Sparkles, Check, X } from 'lucide-react';

export const DeviceSelectorModal = () => {
  const { isModalOpen, deviceMode, selectDeviceMode, closeDeviceModal } = useDeviceMode();

  if (!isModalOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99999,
        backgroundColor: 'rgba(6, 7, 9, 0.88)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      <div
        className="glass-card animate-scale-up"
        style={{
          width: '100%',
          maxWidth: '680px',
          padding: '40px 32px',
          borderRadius: '24px',
          border: '1px solid var(--border-accent)',
          backgroundColor: '#111317',
          boxShadow: '0 24px 70px rgba(0, 0, 0, 0.7), 0 0 40px rgba(200, 155, 109, 0.15)',
          position: 'relative'
        }}
      >
        {/* Optional close button if user has already made a selection previously */}
        <button
          onClick={closeDeviceModal}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
          title="Закрыть"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
              borderRadius: '999px',
              backgroundColor: 'rgba(200, 155, 109, 0.15)',
              border: '1px solid rgba(200, 155, 109, 0.3)',
              color: 'var(--wood-light)',
              fontSize: '13px',
              fontWeight: '600',
              marginBottom: '16px'
            }}
          >
            <Sparkles size={15} />
            <span>Добро пожаловать в AHK Factory</span>
          </div>

          <h2
            className="serif-title"
            style={{
              fontSize: 'clamp(24px, 4vw, 32px)',
              color: '#F8F6F2',
              marginBottom: '10px'
            }}
          >
            Выберите режим просмотра
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', maxWidth: '500px', margin: '0 auto', lineHeight: '1.5' }}>
            Адаптируйте интерфейс мебельной мануфактуры под ваше устройство для комфортного изучения каталога и оформления заказов.
          </p>
        </div>

        {/* Two Device Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '20px',
            marginBottom: '28px'
          }}
        >
          {/* 1. Mobile Option */}
          <div
            onClick={() => selectDeviceMode('mobile')}
            style={{
              cursor: 'pointer',
              padding: '28px 24px',
              borderRadius: '20px',
              border: deviceMode === 'mobile'
                ? '2px solid var(--wood-warm)'
                : '1px solid var(--border-subtle)',
              backgroundColor: deviceMode === 'mobile'
                ? 'rgba(200, 155, 109, 0.12)'
                : 'rgba(255, 255, 255, 0.02)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              transition: 'all 0.25s ease',
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.borderColor = 'var(--wood-light)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = deviceMode === 'mobile'
                ? 'var(--wood-warm)'
                : 'var(--border-subtle)';
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                backgroundColor: 'rgba(200, 155, 109, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--wood-light)',
                marginBottom: '18px'
              }}
            >
              <Smartphone size={32} />
            </div>

            <h3 style={{ fontSize: '19px', fontWeight: '700', color: '#F8F6F2', marginBottom: '8px' }}>
              Телефон (Mobile)
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '20px', flex: 1 }}>
              Компактный мобильный интерфейс, эргономичная навигация и мобильная верстка.
            </p>

            <button
              className={deviceMode === 'mobile' ? 'btn-primary' : 'btn-secondary'}
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {deviceMode === 'mobile' && <Check size={16} />}
              <span>{deviceMode === 'mobile' ? 'Выбран' : 'Выбрать Mobile'}</span>
            </button>
          </div>

          {/* 2. Desktop Option */}
          <div
            onClick={() => selectDeviceMode('desktop')}
            style={{
              cursor: 'pointer',
              padding: '28px 24px',
              borderRadius: '20px',
              border: deviceMode === 'desktop'
                ? '2px solid var(--wood-warm)'
                : '1px solid var(--border-subtle)',
              backgroundColor: deviceMode === 'desktop'
                ? 'rgba(200, 155, 109, 0.12)'
                : 'rgba(255, 255, 255, 0.02)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              transition: 'all 0.25s ease',
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.borderColor = 'var(--wood-light)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = deviceMode === 'desktop'
                ? 'var(--wood-warm)'
                : 'var(--border-subtle)';
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                backgroundColor: 'rgba(200, 155, 109, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--wood-light)',
                marginBottom: '18px'
              }}
            >
              <Monitor size={32} />
            </div>

            <h3 style={{ fontSize: '19px', fontWeight: '700', color: '#F8F6F2', marginBottom: '8px' }}>
              Ноутбук / ПК (Desktop)
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '20px', flex: 1 }}>
              Полноразмерный широкоформатный интерфейс для экранов компьютеров и ноутбуков.
            </p>

            <button
              className={deviceMode === 'desktop' ? 'btn-primary' : 'btn-secondary'}
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {deviceMode === 'desktop' && <Check size={16} />}
              <span>{deviceMode === 'desktop' ? 'Выбран' : 'Выбрать Desktop'}</span>
            </button>
          </div>
        </div>

        {/* Footer tip */}
        <div style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
          Вы в любой момент сможете переключить режим кнопкой в навигационной панели или плавающей кнопкой внизу экрана.
        </div>
      </div>
    </div>
  );
};

