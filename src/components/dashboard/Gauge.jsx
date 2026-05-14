import React from "react";

const Gauge = ({
  value,
  value2,
  label,
  displayValue,
  colorStart = "#10b981",
  colorEnd = "#06b6d4",
  colorStart2 = "#10b981",
  colorEnd2 = "#06b6d4",
}) => {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const safeValue = Math.min(Math.max(value || 0, 0), 100);
  const offset = circumference - (safeValue / 100) * circumference;

  const safeValue2 =
    value2 !== undefined ? Math.min(Math.max(value2 || 0, 0), 100) : 0;
  const offset2 = circumference - (safeValue2 / 100) * circumference;

  return (
    <div className="badge-ring">
      <svg viewBox="0 0 160 160">
        <defs>
          <linearGradient
            id={`gaugeGradient-${label.replace(/\s+/g, "")}`}
            x1="0%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            <stop offset="0%" stopColor={colorStart} />
            <stop offset="100%" stopColor={colorEnd} />
          </linearGradient>
          {value2 !== undefined && (
            <linearGradient
              id={`gaugeGradient2-${label.replace(/\s+/g, "")}`}
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop offset="0%" stopColor={colorStart2} />
              <stop offset="100%" stopColor={colorEnd2} />
            </linearGradient>
          )}
        </defs>
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.15)"
          strokeWidth="16"
        />
        {/* First Circle (Background/Total) */}
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke={`url(#gaugeGradient-${label.replace(/\s+/g, "")})`}
          strokeWidth="16"
          strokeLinecap="round"
          transform="rotate(-90 80 80)"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s ease-out" }}
        />
        {/* Second Circle (Foreground/Current) */}
        {value2 !== undefined && (
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke={`url(#gaugeGradient2-${label.replace(/\s+/g, "")})`}
            strokeWidth="16"
            strokeLinecap="round"
            transform="rotate(-90 80 80)"
            strokeDasharray={circumference}
            strokeDashoffset={offset2}
            style={{ transition: "stroke-dashoffset 1s ease-out" }}
          />
        )}
      </svg>
      <div className="badge-ring-text">
        <h6>{displayValue !== undefined ? displayValue : safeValue}%</h6>
        <p>{label}</p>
      </div>
    </div>
  );
};

export default Gauge;
