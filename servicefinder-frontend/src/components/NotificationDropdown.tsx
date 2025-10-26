import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Star, 
  MessageSquare,
  ClipboardCheck,
  X,
  Check,
  Trash2
} from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';
import { Notification, NotificationType } from '../types/notifications';
import { formatDistanceToNow } from 'date-fns';

interface NotificationDropdownProps {
  onClose: () => void;
}

// Icon mapping for notification types
const getNotificationIcon = (type: NotificationType) => {
  const iconProps = { className: "w-5 h-5" };
  
  switch (type) {
    case 'NEW_BOOKING_REQUEST':
      return <Calendar {...iconProps} className="w-5 h-5 text-blue-600" />;
    case 'BOOKING_CONFIRMED':
    case 'BOOKING_CONFIRMATION':
      return <CheckCircle {...iconProps} className="w-5 h-5 text-green-600" />;
    case 'BOOKING_STARTED':
      return <CheckCircle {...iconProps} className="w-5 h-5 text-blue-600" />;
    case 'BOOKING_COMPLETED':
      return <ClipboardCheck {...iconProps} className="w-5 h-5 text-emerald-600" />;
    case 'BOOKING_CANCELLED':
      return <XCircle {...iconProps} className="w-5 h-5 text-red-600" />;
    case 'NEW_CUSTOMER_REVIEW':
      return <Star {...iconProps} className="w-5 h-5 text-yellow-600" />;
    case 'PROVIDER_RESPONSE':
      return <MessageSquare {...iconProps} className="w-5 h-5 text-blue-600" />;
    case 'SERVICE_COMPLETION_REQUEST':
      return <ClipboardCheck {...iconProps} className="w-5 h-5 text-purple-600" />;
    case 'SERVICE_CREATED':
      return <ClipboardCheck {...iconProps} className="w-5 h-5 text-blue-600" />;
    case 'SERVICE_UPDATED':
      return <ClipboardCheck {...iconProps} className="w-5 h-5 text-indigo-600" />;
    case 'PROFILE_UPDATED':
      return <CheckCircle {...iconProps} className="w-5 h-5 text-green-600" />;
    default:
      return <Calendar {...iconProps} className="w-5 h-5 text-gray-600" />;
  }
};

export function NotificationDropdown({ onClose }: NotificationDropdownProps) {
  const navigate = useNavigate();
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    removeNotification,
    clearAll 
  } = useNotifications();

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read when clicked
    if (!notification.isRead) {
      markAsRead(notification.id);
    }

    // Navigate to related page if actionUrl is provided
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
      onClose();
    }
  };

  const handleMarkAllRead = () => {
    markAllAsRead();
  };

  const handleClearAll = () => {
    clearAll();
  };

  const handleRemoveNotification = (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    removeNotification(notificationId);
  };

  return (
    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Notifications
          {unreadCount > 0 && (
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              {unreadCount} new
            </span>
          )}
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Actions */}
      {notifications.length > 0 && (
        <div className="px-4 py-2 border-b border-gray-200 flex justify-between">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              <Check className="w-4 h-4 inline mr-1" />
              Mark all read
            </button>
          )}
          <button
            onClick={handleClearAll}
            className="text-sm text-gray-500 hover:text-gray-700 font-medium ml-auto"
          >
            <Trash2 className="w-4 h-4 inline mr-1" />
            Clear all
          </button>
        </div>
      )}

      {/* Notifications List */}
      <div className="max-h-64 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500">
            <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors relative ${
                  !notification.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${
                          !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {notification.title}
                        </p>
                        <p className={`text-sm mt-1 ${
                          !notification.isRead ? 'text-gray-700' : 'text-gray-500'
                        }`}>
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      <button
                        onClick={(e) => handleRemoveNotification(e, notification.id)}
                        className="ml-2 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {/* Unread indicator */}
                    {!notification.isRead && (
                      <div className="absolute right-3 top-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-200 text-center">
          <button
            onClick={() => {
              navigate('/notifications');
              onClose();
            }}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            View all notifications
          </button>
        </div>
      )}
    </div>
  );
} 