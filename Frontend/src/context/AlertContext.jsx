import { createContext, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';

const AlertContext = createContext();

export function useAlert() {
  return useContext(AlertContext);
}

export function AlertProvider({ children }) {
  const [alertConfig, setAlertConfig] = useState({
    isOpen: false,
    message: '',
    type: 'alert', // 'alert' | 'confirm'
    onConfirm: null,
    onCancel: null
  });

  const showAlert = useCallback((message) => {
    setAlertConfig({
      isOpen: true,
      message,
      type: 'alert',
      onConfirm: () => setAlertConfig(prev => ({ ...prev, isOpen: false })),
      onCancel: null
    });
  }, []);

  const showConfirm = useCallback((message) => {
    return new Promise((resolve) => {
      setAlertConfig({
        isOpen: true,
        message,
        type: 'confirm',
        onConfirm: () => {
          setAlertConfig(prev => ({ ...prev, isOpen: false }));
          resolve(true);
        },
        onCancel: () => {
          setAlertConfig(prev => ({ ...prev, isOpen: false }));
          resolve(false);
        }
      });
    });
  }, []);

  // Override global window.alert just in case
  if (typeof window !== 'undefined') {
    window.alert = showAlert;
  }

  return (
    <AlertContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      {alertConfig.isOpen && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999 }}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '420px', backgroundColor: 'var(--card-bg)', padding: '2.5rem', borderRadius: '12px', boxShadow: '0 20px 50px rgba(0,0,0,0.3)', border: '1px solid var(--primary)', position: 'relative', textAlign: 'center' }}>
            <h3 style={{ color: 'var(--primary)', marginBottom: '1.2rem', fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              {alertConfig.type === 'confirm' ? '❓ Xác Nhận' : '🔔 Thông Báo'}
            </h3>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-color)', marginBottom: '2rem', lineHeight: '1.5' }}>
              {alertConfig.message}
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              {alertConfig.type === 'confirm' && (
                <button className="btn btn-outline" style={{ flex: 1, padding: '0.8rem' }} onClick={alertConfig.onCancel}>
                  Hủy
                </button>
              )}
              <button className="btn btn-primary" style={{ flex: 1, padding: '0.8rem' }} onClick={alertConfig.onConfirm}>
                OK
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </AlertContext.Provider>
  );
}
