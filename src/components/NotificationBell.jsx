import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../components/notifications.css';
// src\components\notifications.css

export default function NotificationDashboard() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const BASE_URL = 'https://job-portal-backend-365l.onrender.com/job-portal';

    const getAuthHeaders = () => ({
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    });

    useEffect(() => {
        fetchNotifications();

        // Background polling loop updates context values seamlessly
        const interval = setInterval(() => {
            fetchNotifications();
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await axios.get(
                `${BASE_URL}/notifications`,
                getAuthHeaders()
            );
            setNotifications(res.data || []);
        } catch (err) {
            console.error(err);
            setError(
                err.response?.data?.message ||
                'Failed to load notifications.'
            );
        } finally {
            setLoading(false);
        }
    };

    // Maps clean CSS type indicators alongside semantic label mappings
    const getTypeAttributes = (type) => {
        switch (type) {
            case 'STATUS_UPDATED':
                return { label: 'Status Update', className: 'notif-tag-status' };
            case 'JOB_APPLIED':
                return { label: 'New Application', className: 'notif-tag-applied' };
            case 'INTERVIEW':
                return { label: 'Interview', className: 'notif-tag-interview' };
            default:
                return { label: 'System Update', className: 'notif-tag-default' };
        }
    };

    // Robust function to parse and format dates safely across all browsers
    const formatNotificationTime = (dateString) => {
        if (!dateString) return 'Just now';

        try {
            // Replace spaces with 'T' (handles formats like "YYYY-MM-DD HH:mm:ss")
            let normalized = dateString.replace(' ', 'T');

            // Ensure UTC indicator if timezone details are entirely missing
            if (!normalized.includes('Z') && !normalized.includes('+') && !normalized.includes('-')) {
                normalized += 'Z';
            }

            let dateObj = new Date(normalized);

            // Fallback: If parsing fails due to microsecond precision overflow
            if (isNaN(dateObj.getTime())) {
                // Strips microsecond decimals safely before appending Z
                const match = dateString.match(/^([^.]+)/);
                if (match) {
                    let cleaned = match[1].replace(' ', 'T');
                    normalized = cleaned.endsWith('Z') ? cleaned : cleaned + 'Z';
                    dateObj = new Date(normalized);
                }
            }

            // Final fallback check
            if (isNaN(dateObj.getTime())) {
                return 'Recent';
            }

            return dateObj.toLocaleString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        } catch (e) {
            console.error("Date parsing error: ", e);
            return 'Recent';
        }
    };

    if (loading) {
        return (
            <div className="notif-dropdown-container minimal-flex-center">
                <div className="notif-spinner-stack">
                    <div className="notif-spinner-ring"></div>
                    <p className="notif-loading-text">Syncing notification channels...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="notif-dropdown-container">
                <div className="notif-error-card-dropdown">
                    <div className="notif-error-header-row">
                        <span className="notif-error-icon-shield">🔒</span>
                        <h2 className="notif-error-title-dropdown">Connection Fault</h2>
                    </div>
                    <p className="notif-error-desc-dropdown">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="notif-dropdown-container">
            {/* Minimal Dropdown Header Row */}
            <div className="notif-dropdown-header">
                <div>
                    <h3 className="notif-tray-title">Notifications</h3>
                    <p className="notif-tray-subtitle">Real-time action alerts feed</p>
                </div>
                {notifications.length > 0 && (
                    <span className="notif-tray-badge">
                        {notifications.filter(n => !n.isRead).length} Unread
                    </span>
                )}
            </div>

            {/* Scrollable Document Feed Layer */}
            {notifications.length === 0 ? (
                <div className="notif-empty-dropdown">
                    <div className="notif-empty-icon-tray">
                        <span className="bell-svg-icon">🔔</span>
                    </div>
                    <h2 className="notif-empty-title-tray">All Quiet Here!</h2>
                    <p className="notif-empty-desc-tray">You're completely caught up with all current tracking streams.</p>
                </div>
            ) : (
                <div className="notif-dropdown-scroll-stack">
                    {notifications.map((notif, index) => {
                        const typeAttr = getTypeAttributes(notif.type);
                        // Fixed: Fallback to mapped list index prevents UI jitter over polling refreshes
                        const stableKey = notif.id ? String(notif.id) : `fallback-key-${index}`;
                        
                        return (
                            <div
                                key={stableKey}
                                className={`notif-tray-item-card ${
                                    !notif.isRead ? 'unread-tray-state' : 'read-tray-state'
                                }`}
                            >
                                <div className="notif-tray-card-top">
                                    <span className={`notif-tray-tag ${typeAttr.className}`}>
                                        {typeAttr.label}
                                    </span>
                                    <span className="notif-tray-time">
                                        {formatNotificationTime(notif.createdAt)}
                                    </span>
                                </div>

                                <div className="notif-tray-card-body-content">
                                    <h4 className="notif-tray-item-title">{notif.title || "Alert Update"}</h4>
                                    <p className="notif-tray-item-msg">{notif.message || "No message payload included."}</p>
                                </div>

                                <div className="notif-tray-card-footer">
                                    <span className="notif-log-ref">Ref: #{notif.id || 'N/A'}</span>
                                    {!notif.isRead && <span className="notif-pulse-dot"></span>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}