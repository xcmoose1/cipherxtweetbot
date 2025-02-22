import React from 'react';

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface NotificationsProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
}

export default function Notifications({ notifications, onDismiss }: NotificationsProps) {
  return (
    <div className="notifications">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`
            notification animate-slide-up bg-base-200/95 backdrop-blur-sm border
            ${notification.type === 'success' ? 'border-success text-success' : ''}
            ${notification.type === 'error' ? 'border-error text-error' : ''}
            ${notification.type === 'info' ? 'border-info text-info' : ''}
            rounded-lg shadow-lg p-4
          `}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              {notification.type === 'success' && (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {notification.type === 'error' && (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {notification.type === 'info' && (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{notification.message}</p>
              <p className="text-xs opacity-70 mt-1">
                {/* Removed timestamp */}
              </p>
            </div>
            <button
              onClick={() => onDismiss(notification.id)}
              className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
