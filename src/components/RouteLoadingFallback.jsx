import React from "react";
import { Spinner } from "react-bootstrap";
import "../scss/components/routeLoadingFallback.scss";

const RouteLoadingFallback = () => {
  return (
    <div className="route-loading-fallback">
      <div className="route-loading-content">
        <div className="route-loading-spinner-wrapper">
          <div className="route-loading-spinner-ring"></div>
          <div className="route-loading-spinner-ring"></div>
          <div className="route-loading-spinner-ring"></div>
          <Spinner
            animation="border"
            variant="light"
            className="route-loading-spinner-inner"
            role="status"
            aria-hidden="true"
          />
        </div>
        <h3 className="route-loading-text">Loading Page</h3>
        <p className="route-loading-subtext">Just a moment...</p>

        <div className="route-loading-progress">
          <div className="route-loading-progress-bar"></div>
        </div>
      </div>

      {/* Animated background elements */}
      <div className="route-loading-bg-element route-loading-bg-1"></div>
      <div className="route-loading-bg-element route-loading-bg-2"></div>
      <div className="route-loading-bg-element route-loading-bg-3"></div>
    </div>
  );
};

export default RouteLoadingFallback;
