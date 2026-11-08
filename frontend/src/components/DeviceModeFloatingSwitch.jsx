import React from 'react';
import { useDeviceMode } from '../context/DeviceModeContext';
import { Smartphone, Monitor, Sliders } from 'lucide-react';

export const DeviceModeFloatingSwitch = () => {
  const { deviceMode, toggleDeviceMode, openDeviceModal } = useDeviceMode();

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '24px',
        zIndex: 9000,
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 10px',
        backgroundColor: 'rgba(17, 19, 23, 0.92)',
        backdropFilter: 'blur(16px)',
        border: '1px solid var(--border-accent)',
        borderRadius: '999px',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.45)',
        transition: 'all 0.2s ease'
      }}
    >
      <button
        onClick={toggleDeviceMode}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'transparent',
          border: 'none',
          color: 'var(--text-primary)',
          cursor: 'pointer',
          padding: '6px 12px',
          borderRadius: '999px',
          fontSize: '13px',
          fontWeight: '600'
        }}
        title={`Текущий режим: ${deviceMode === 'mobile' ? 'Мобильный' : 'Десктоп'}. Нажмите для переключения`}
      >
        {deviceMode === 'mobile' ? (
          <>
            <Smartphone size={16} color="var(--wood-light)" />
            <span>Телефон</span>
          </>
        ) : (
          <>
            <Monitor size={16} color="var(--wood-light)" />
            <span>Ноутбук / ПК</span>
          </>
        )}
      </button>

      <span style={{ color: 'var(--border-subtle)', userSelect: 'none' }}>|</span>

      <button
        onClick={openDeviceModal}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          padding: '6px',
          borderRadius: '50%',
          transition: 'color 0.2s'
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
        title="Настройки выбора устройства"
      >
        <Sliders size={15} />
      </button>
    </div>
  );
};

