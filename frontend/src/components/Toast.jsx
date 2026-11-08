import React from 'react';
import { useCart } from '../context/CartContext';
import { CheckCircle2, Info, X } from 'lucide-react';

export const Toast = () => {
  const { toastMessage, closeToast } = useCart();

  if (!toastMessage) return null;

  const isSuccess = toastMessage.type === 'success';

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        background: 'rgba(25, 28, 33, 0.95)',
        backdropFilter: 'blur(16px)',
        border: `1px solid ${isSuccess ? 'rgba(52, 211, 153, 0.4)' : 'rgba(200, 155, 109, 0.4)'}`,
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        padding: '14px 20px',
        borderRadius: '14px',
        color: '#F8F6F2',
        fontSize: '14px',
        fontWeight: '500',
        animation: 'fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
      }}
    >
      {isSuccess ? (
        <CheckCircle2 size={20} color="#34D399" />
      ) : (
        <Info size={20} color="#C89B6D" />
      )}
      <span>{toastMessage.message}</span>
      <button
        onClick={closeToast}
        style={{
          background: 'none',
          border: 'none',
          color: '#8E8982',
          cursor: 'pointer',
          padding: '2px',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
};
