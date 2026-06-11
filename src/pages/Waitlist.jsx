import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/waitlist.scss';
import logo from '../assets/logo.png';

const Waitlist = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    mins: 0,
    secs: 0,
  });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [cursorSize, setCursorSize] = useState('small');
  const [isLaunched, setIsLaunched] = useState(false);

  // Check if launch date has been reached
  useEffect(() => {
    const launch = new Date('2026-08-15T00:00:00');
    const today = new Date();

    if (today >= launch) {
      // Launch date reached, redirect to login
      setIsLaunched(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      return;
    }
  }, [navigate]);

  // Countdown timer
  useEffect(() => {
    const launch = new Date('2026-08-15T00:00:00').getTime();

    const updateCountdown = () => {
      const diff = launch - Date.now();
      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, mins: 0, secs: 0 });
        return;
      }
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setCountdown({ days, hours, mins, secs });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Custom cursor
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleCursorEnter = () => setCursorSize('large');
  const handleCursorLeave = () => setCursorSize('small');

  const handleJoin = async () => {
    if (!email || !email.includes('@') || !email.includes('.')) {
      const inp = document.getElementById('email');
      inp.style.borderColor = '#f87171';
      inp.style.boxShadow = '0 0 0 3px rgba(248,113,113,0.18), 0 0 16px rgba(248,113,113,0.12)';
      inp.focus();
      setTimeout(() => {
        inp.style.borderColor = '';
        inp.style.boxShadow = '';
      }, 2000);
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/waitlist/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSubmitted(true);
        console.log('✅ Added to waitlist:', data);
      } else {
        console.error('❌ Error:', data.message);
        const inp = document.getElementById('email');
        inp.style.borderColor = '#f87171';
        setTimeout(() => {
          inp.style.borderColor = '';
        }, 2000);
      }
    } catch (error) {
      console.error('❌ Network error:', error);
      const inp = document.getElementById('email');
      inp.style.borderColor = '#f87171';
      setTimeout(() => {
        inp.style.borderColor = '';
      }, 2000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleJoin();
  };

  const pad = (n) => String(n).padStart(2, '0');

  // If platform is launched, show launch message
  if (isLaunched) {
    return (
      <div className="waitlist-page launch-live-page">
        {/* Custom Cursor */}
        <div
          id="cursor"
          className={`cursor ${cursorSize}`}
          style={{
            left: `${mousePos.x}px`,
            top: `${mousePos.y}px`,
          }}
        />
        <div
          id="cursor-ring"
          className={`cursor-ring ${cursorSize}`}
          style={{
            left: `${mousePos.x}px`,
            top: `${mousePos.y}px`,
          }}
        />

        {/* Background Effects */}
        <div className="grid-overlay" />
        <div className="glow-orb orb1" />
        <div className="glow-orb orb2" />
        <div className="glow-orb orb3" />

        {/* Live Message */}
        <div className="launch-live-container">
          <div className="launch-live-content">
            <div className="launch-badge">🎉 LIVE NOW</div>
            <h1 className="launch-title">Campus is Live!</h1>
            <p className="launch-desc">
              The platform is now open. Join us and connect with your campus community.
            </p>
            <button
              className="launch-btn"
              onClick={() => navigate('/login')}
              onMouseEnter={handleCursorEnter}
              onMouseLeave={handleCursorLeave}
            >
              Go to Login
            </button>
            <p className="launch-redirect">Redirecting to login in 2 seconds...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="waitlist-page">
      {/* Custom Cursor */}
      <div
        id="cursor"
        className={`cursor ${cursorSize}`}
        style={{
          left: `${mousePos.x}px`,
          top: `${mousePos.y}px`,
        }}
      />
      <div
        id="cursor-ring"
        className={`cursor-ring ${cursorSize}`}
        style={{
          left: `${mousePos.x}px`,
          top: `${mousePos.y}px`,
        }}
      />

      {/* Scan Line */}
      <div className="scan-line" />

      {/* Background Effects */}
      <div className="grid-overlay" />
      <div className="glow-orb orb1" />
      <div className="glow-orb orb2" />
      <div className="glow-orb orb3" />

      {/* Navigation */}
      <nav className="waitlist-nav">
        <a href="/" className="logo">
          <div className="logo-hex">
            <img src={logo} alt="CampusClip" className="logo-img" />
          </div>
        </a>
        <div className="nav-right">
          <div className="nav-dot" />
        </div>
      </nav>

      {/* Hero Section */}
      <main className="waitlist-hero">
        {/* Left Column */}
        <div className="hero-left">
          <div className="eyebrow">Campus Social Platform</div>

          <h1>
            Your campus.<br />
            <span className="line-accent">Reimagined.</span>
          </h1>

          <p className="hero-desc">
            One platform for clubs, classes, events, and every student connection that matters.
            Built for the way you actually live on campus.
          </p>

          {/* Countdown */}
          <div className="countdown-wrap">
            <div className="countdown-label">Launching August 15, 2026</div>
            <div className="countdown-tiles">
              <div className="tile">
                <div className="tile-val">{pad(countdown.days)}</div>
                <div className="tile-unit">Days</div>
              </div>
              <div className="tile-sep">:</div>
              <div className="tile">
                <div className="tile-val">{pad(countdown.hours)}</div>
                <div className="tile-unit">Hours</div>
              </div>
              <div className="tile-sep">:</div>
              <div className="tile">
                <div className="tile-val">{pad(countdown.mins)}</div>
                <div className="tile-unit">Mins</div>
              </div>
              <div className="tile-sep">:</div>
              <div className="tile">
                <div className="tile-val">{pad(countdown.secs)}</div>
                <div className="tile-unit">Secs</div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="form-section">
            {!isSubmitted ? (
              <div id="form-inner">
                <label className="form-label" htmlFor="email">
                  Reserve your spot
                </label>
                <div className="input-wrap">
                  <input
                    type="email"
                    id="email"
                    placeholder="your@college.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyPress={handleKeyPress}
                    onMouseEnter={handleCursorEnter}
                    onMouseLeave={handleCursorLeave}
                    autoComplete="email"
                  />
                  <span className="input-icon">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    >
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="m2 7 10 7 10-7" />
                    </svg>
                  </span>
                </div>
                <button
                  className="btn-primary"
                  onClick={handleJoin}
                  onMouseEnter={handleCursorEnter}
                  onMouseLeave={handleCursorLeave}
                >
                  <span className="btn-shimmer" />
                  Join the Waitlist →
                </button>
                <div className="form-meta">
                  <div className="form-meta-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    No spam
                  </div>
                  <div className="form-meta-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 8v4l3 3" />
                    </svg>
                    Early access priority
                  </div>
                </div>
              </div>
            ) : (
              <div className="success-state show">
                <div className="success-icon">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#4ade80"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
                <h3>You're In!</h3>
                <p>Check your inbox — we'll send early access as soon as we launch.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Feature Cards */}
        <div className="hero-right">
          <FeatureCard
            number="01"
            icon="👥"
            title="Discover Student Clubs"
            desc="Browse, join, and manage memberships across every club on your campus — all in one place."
            color="rgba(99,102,241,0.12)"
            glow="rgba(99,102,241,0.4)"
          />
          <FeatureCard
            number="02"
            icon="📅"
            title="Live Campus Events Feed"
            desc="Never miss a fest, workshop, or social again. A smart calendar that syncs with your schedule."
            color="rgba(167,139,250,0.1)"
            glow="rgba(167,139,250,0.4)"
          />
          <FeatureCard
            number="03"
            icon="📚"
            title="Class & Credit Tracker"
            desc="Stay on top of coursework, deadlines, and credits with a dashboard built around your semester."
            color="rgba(244,114,182,0.08)"
            glow="rgba(244,114,182,0.3)"
          />
          <FeatureCard
            number="04"
            icon="💬"
            title="Student Connections"
            desc="Find peers with shared majors, clubs, or interests. Build your network from day one."
            color="rgba(34,211,238,0.08)"
            glow="rgba(34,211,238,0.3)"
          />
        </div>
      </main>
    </div>
  );
};

const FeatureCard = ({ number, icon, title, desc, color, glow }) => {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div
      className="feat-card"
      onMouseEnter={setIsHovered.bind(null, true)}
      onMouseLeave={setIsHovered.bind(null, false)}
    >
      <div className="feat-card-glow" style={{ background: glow }} />
      <span className="feat-num">{number}</span>
      <div className="feat-icon-wrap" style={{ background: color }}>
        <span style={{ fontSize: '20px' }}>{icon}</span>
      </div>
      <div className="feat-body">
        <h3>{title}</h3>
        <p>{desc}</p>
      </div>
      <svg className="feat-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M5 12h14M12 5l7 7-7 7" />
      </svg>
    </div>
  );
};

export default Waitlist;
