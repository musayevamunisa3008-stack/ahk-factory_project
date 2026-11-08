import React, { createContext, useContext, useState, useEffect } from 'react';

const DeviceModeContext = createContext();

export const DeviceModeProvider = ({ children }) => {
  const [deviceMode, setDeviceModeState] = useState(() => {
    try {
      return localStorage.getItem('ahk_device_mode') || 'desktop';
    } catch {
      return 'desktop';
    }
  });

  const [isModalOpen, setIsModalOpen] = useState(() => {
    try {
      return !localStorage.getItem('ahk_device_mode_selected');
    } catch {
      return true;
    }
  });

  const selectDeviceMode = (mode) => {
    setDeviceModeState(mode);
    try {
      localStorage.setItem('ahk_device_mode', mode);
      localStorage.setItem('ahk_device_mode_selected', 'true');
    } catch (e) {
      console.warn('Storage error:', e);
    }
    setIsModalOpen(false);
  };

  const toggleDeviceMode = () => {
    const nextMode = deviceMode === 'mobile' ? 'desktop' : 'mobile';
    selectDeviceMode(nextMode);
  };

  const openDeviceModal = () => {
    setIsModalOpen(true);
  };

  const closeDeviceModal = () => {
    setIsModalOpen(false);
  };

  return (
    <DeviceModeContext.Provider
      value={{
        deviceMode,
        isMobile: deviceMode === 'mobile',
        selectDeviceMode,
        toggleDeviceMode,
        isModalOpen,
        openDeviceModal,
        closeDeviceModal
      }}
    >
      {children}
    </DeviceModeContext.Provider>
  );
};

export const useDeviceMode = () => {
  const context = useContext(DeviceModeContext);
  if (!context) {
    throw new Error('useDeviceMode must be used within a DeviceModeProvider');
  }
  return context;
};

