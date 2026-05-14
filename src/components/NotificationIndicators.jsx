import React from 'react';

export const NotificationDot = ({ className = '', style = {} }) => (
  <span
    className={className}
    style={{
      position: 'absolute',                                                                                                                                                                                          
      top: '5px',                                                                                                                                                                                                           
      right: '4px',       
      width: 8,
      height: 8,
      borderRadius: '50%',
      backgroundColor: '#ff4757',
      marginLeft: 8,
      flexShrink: 0,
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15)',
      ...style,
    }}
  />
);

export const NotificationCountBadge = ({ count, className = '', style = {} }) => {
  if (!count || Number(count) <= 0) {
    return null;
  }

  return (
    <span
      className={className}
      style={{
        position: 'absolute',
        top: "5px",
        right: "2px",
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 20,
        height: 20,
        padding: '0 6px',
        borderRadius: 999,
        backgroundColor: '#dc3545',
        color: '#fff',
        fontSize: 12,
        fontWeight: 700,
        lineHeight: 1,
        ...style,
      }}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
};
