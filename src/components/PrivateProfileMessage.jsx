import React from 'react';
import { Lock } from 'react-bootstrap-icons';

const PrivateProfileMessage = ({ followStatus, username }) => {
  return (
    <div className="private-profile-message text-center py-5">
      <div className="mb-3">
        <Lock size={64} className="text-muted" />
      </div>
      <h3 className="mb-2 text-white">This Account is Private</h3>
      <p className="text-muted mb-3">
        Follow {username || 'this user'} to see their posts
      </p>

      {followStatus === 'pending' && (
        <p className="text-warning fw-semibold">
          <i className="bi bi-clock-history me-2"></i>
          Request Pending
        </p>
      )}
      {followStatus === 'rejected' && (
        <p className="text-danger fw-semibold">
          <i className="bi bi-x-circle me-2"></i>
          Request Declined
        </p>
      )}
    </div>
  );
};

export default PrivateProfileMessage;
