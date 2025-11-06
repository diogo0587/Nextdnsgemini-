import React, { useEffect, useState } from 'react';
import { NotificationItem } from '../types';

interface NotificationToastProps {
  notification: NotificationItem;
  onClose: (id: string) => void;
  timeout?: number; // milliseconds
}

const NotificationToast: React.FC<NotificationToastProps> = ({ notification, onClose, timeout = 5000 }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      // Give a short delay for exit animation before removing from DOM
      setTimeout(() => onClose(notification.id), 300);
    }, timeout);

    return () => clearTimeout(timer);
  }, [notification.id, onClose, timeout]);

  const getBackgroundColor = (type: NotificationItem['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-500';
      case 'warning':
        return 'bg-orange-500';
      case 'error':
        return 'bg-red-500';
      case 'info':
      default:
        return 'bg-blue-500';
    }
  };

  if (!isVisible) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`relative flex items-center justify-between p-4 text-white rounded-lg shadow-lg mb-3
        ${getBackgroundColor(notification.type)} transition-all duration-300 transform
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
      style={{ minWidth: '250px', maxWidth: '350px' }}
    >
      <p className="mr-4 text-sm font-medium flex-1 break-words">{notification.message}</p>
      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(() => onClose(notification.id), 300);
        }}
        className="ml-2 p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
        aria-label="Close notification"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export default NotificationToast;