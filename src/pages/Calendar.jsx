import React, { useMemo, useState, useEffect } from "react";
import DashboardLayout from "../component/DashboardLayout";
import SEOHead from "../components/SEOHead";
import { getMetadata } from "../utils/seoConfig";
import {
  Container,
  Row,
  Col,
  Button,
  Card,
  Spinner,
  Badge,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
  faClock,
  faCircle,
} from "@fortawesome/free-solid-svg-icons";
// import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import "../scss/calendar.scss";
import AOS from "aos";
import "aos/dist/aos.css";
import {
  useGetCalendarItems,
  useGetGoogleSyncStatus,
  useInitiateGoogleAuth,
  useSyncAllToGoogle,
  useDisconnectGoogleCalendar,
} from "../hooks/useRQCalendar";
import { toast } from "react-toastify";


const pad = (n) => (n < 10 ? `0${n}` : `${n}`);

function buildMonth(year, month) {
  // month is 0-indexed
  const first = new Date(year, month, 1);
  // const last = new Date(year, month + 1, 0);
  const weeks = [];
  let current = new Date(first);
  // start from Sunday of the first week
  current.setDate(current.getDate() - current.getDay());
  // iterate 6 weeks to cover all possibilities
  for (let w = 0; w < 6; w++) {
    const days = [];
    for (let d = 0; d < 7; d++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    weeks.push(days);
  }
  return { weeks };
}

const monthLabel = (y, m) =>
  new Date(y, m, 1).toLocaleString(undefined, {
    month: "long",
    year: "numeric",
  });

const dayLabel = (d) =>
  d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const Calendar = () => {
  const metadata = getMetadata("calendar");
  const today = new Date();
  const [cursor, setCursor] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [selected, setSelected] = useState(today);
  const [showModal, setShowModal] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 767);

  // Fetch calendar items using custom hook
  const {
    data: calendarData,
    isLoading: loading,
  } = useGetCalendarItems(cursor);

  const calendarItems = calendarData?.data?.items || [];

  // Fetch Google Calendar sync status using custom hook
  const { data: syncStatusData, refetch: refetchSyncStatus } =
    useGetGoogleSyncStatus();

  const syncStatus = syncStatusData?.data;

  // Google Calendar mutations
  const { mutate: initiateAuth } = useInitiateGoogleAuth();
  const { mutate: syncAll, isLoading: syncing } = useSyncAllToGoogle(() =>
    refetchSyncStatus(),
  );
  const { mutate: disconnectGoogle } = useDisconnectGoogleCalendar(() =>
    refetchSyncStatus(),
  );

  const { weeks } = useMemo(
    () => buildMonth(cursor.getFullYear(), cursor.getMonth()),
    [cursor],
  );

  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: "ease-out-quart",
      once: true,
      offset: 40,
    });
  }, []);

  // Handle OAuth callback status
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const googleAuth = params.get("google_auth");
    if (googleAuth === "success") {
      refetchSyncStatus();
      window.history.replaceState({}, "", "/calendar");
    } else if (googleAuth === "cancelled") {
      toast.info("Google Calendar connection was cancelled");
      window.history.replaceState({}, "", "/calendar");
    } else if (googleAuth === "error") {
      const reason = params.get("reason");
      const errorMsg = reason
        ? `Failed to connect Google Calendar: ${reason}`
        : "Failed to connect Google Calendar";
      toast.error(errorMsg);
      window.history.replaceState({}, "", "/calendar");
    }
  }, [refetchSyncStatus]);

  // Handle mobile resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 767);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Filter events for the selected date
  const events = useMemo(() => {
    const selectedDateStr = `${selected.getFullYear()}-${pad(
      selected.getMonth() + 1,
    )}-${pad(selected.getDate())}`;

    const eventsForDate = calendarItems.filter((item) => {
      const itemDate = new Date(item.startAt);
      const itemDateStr = `${itemDate.getFullYear()}-${pad(
        itemDate.getMonth() + 1,
      )}-${pad(itemDate.getDate())}`;
      return itemDateStr === selectedDateStr;
    });

    return {
      key: selectedDateStr,
      list: eventsForDate.map((item) => ({
        id: item.id,
        title: item.title,
        subtitle:
          item.description ||
          (item.type === "class" ? item.class?.code : item.club?.name) ||
          "",
        time: new Date(item.startAt).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        }),
        color: item.color,
        type: item.type,
      })),
    };
  }, [selected, calendarItems]);

  const isSameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  const isCurrentMonth = (d) => d.getMonth() === cursor.getMonth();

  // Get item types for a specific date (for colored indicators)
  const getItemTypesForDate = (date) => {
    const dateStr = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate(),
    )}`;

    const types = { hasClass: false, hasEvent: false, hasAssignment: false };

    calendarItems.forEach((item) => {
      const itemDate = new Date(item.startAt);
      const itemDateStr = `${itemDate.getFullYear()}-${pad(
        itemDate.getMonth() + 1,
      )}-${pad(itemDate.getDate())}`;
      if (itemDateStr === dateStr) {
        if (item.type === "class") types.hasClass = true;
        else if (item.type === "event") types.hasEvent = true;
        else if (item.type === "assignment") types.hasAssignment = true;
      }
    });

    return types;
  };

  // Check if a day has any events
  const hasEvents = (date) => {
    const types = getItemTypesForDate(date);
    return types.hasClass || types.hasEvent || types.hasAssignment;
  };

  // Get upcoming items for next 2 weeks (starting from next week)
  const upcomingItems = useMemo(() => {
    const now = new Date();
    // Calculate start of next week (next Sunday or Monday based on preference)
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const daysUntilNextWeek = 7 - dayOfWeek; // Days until next Sunday
    const nextWeekStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + daysUntilNextWeek,
      0,
      0,
      0,
      0,
    );

    const twoWeeksLater = new Date(nextWeekStart);
    twoWeeksLater.setDate(twoWeeksLater.getDate() + 14);

    return calendarItems
      .filter((item) => {
        const itemDate = new Date(item.startAt);
        return itemDate >= nextWeekStart && itemDate <= twoWeeksLater;
      })
      .sort((a, b) => new Date(a.startAt) - new Date(b.startAt))
      .slice(0, 10); // Limit to 10 items
  }, [calendarItems]);

  // Calculate calendar statistics for the current month
  const monthStats = useMemo(() => {
    const currentMonth = cursor.getMonth();
    const currentYear = cursor.getFullYear();

    let totalEvents = 0;
    let totalClasses = 0;
    let pendingAssignments = 0;
    let clubEvents = 0;

    calendarItems.forEach((item) => {
      const itemDate = new Date(item.startAt);
      if (
        itemDate.getMonth() === currentMonth &&
        itemDate.getFullYear() === currentYear
      ) {
        totalEvents++;
        if (item.type === "class") {
          totalClasses++;
        } else if (item.type === "assignment") {
          pendingAssignments++;
        } else if (item.type === "event") {
          clubEvents++;
        }
      }
    });

    return {
      totalEvents,
      totalClasses,
      pendingAssignments,
      clubEvents,
    };
  }, [calendarItems, cursor]);

  const goPrev = () => {
    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1));
  };

  const goNext = () => {
    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1));
  };

  // Google Calendar functions
  const handleConnectGoogle = () => {
    initiateAuth();
  };

  const handleSyncGoogle = () => {
    syncAll();
  };

  const handleDisconnectGoogle = () => {
    if (
      !window.confirm("Are you sure you want to disconnect Google Calendar?")
    ) {
      return;
    }
    disconnectGoogle();
  };

  return (
    <>
      <SEOHead {...metadata} />

    <DashboardLayout headerTitle="" headerSubtitle="" showActions={false}>
      <div className="calendar-main d-flex flex-wrap">
        <div className="calendar-pane" data-aos="zoom-in">
          <div className="cal-header d-flex flex-wrap align-items-center justify-content-between">
            <div className="cal-title">
              <h3>{monthLabel(cursor.getFullYear(), cursor.getMonth())}</h3>
              <p>Track your academic journey</p>
            </div>
            <div className="d-flex justify-content-between cal-btn gap-2 flex-wrap align-items-center">
              {/* {syncStatus?.connected ? (
                <>
                  <Badge
                    bg="success"
                    className="d-flex align-items-center gap-1"
                  >
                    <FontAwesomeIcon icon={faCheckCircle} />
                    Google Calendar Connected
                  </Badge>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSyncGoogle}
                    disabled={syncing}
                  >
                    <FontAwesomeIcon
                      icon={faSync}
                      spin={syncing}
                      className="me-1"
                    />
                    {syncing ? "Syncing..." : "Sync Now"}
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={handleDisconnectGoogle}
                  >
                    Disconnect
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline-primary"
                  className="text-white p-0"
                  size="sm"
                  onClick={handleConnectGoogle}
                >
                  <FontAwesomeIcon icon={faGoogle} className="me-2" />
                  Connect Google Calendar
                </Button>
              )} */}
              <div className="nav gap-2">
                <Button
                  variant="outline-secondary"
                  className="btn-ghost"
                  onClick={goPrev}
                  aria-label="Previous month"
                >
                  <FontAwesomeIcon icon={faChevronLeft} />
                </Button>
                <Button
                  variant="outline-primary"
                  className="today-btn"
                  onClick={() => {
                    setCursor(
                      new Date(today.getFullYear(), today.getMonth(), 1),
                    );
                    setSelected(today);
                  }}
                >
                  Today
                </Button>
                <Button
                  variant="outline-secondary"
                  className="btn-ghost"
                  onClick={goNext}
                  aria-label="Next month"
                >
                  <FontAwesomeIcon icon={faChevronRight} />
                </Button>
              </div>
            </div>
          </div>

          {loading ? (
            <div
              className="d-flex justify-content-center align-items-center"
              style={{ minHeight: "400px" }}
            >
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : (
            <>
            <div className="cal-grid">
              <div className="cal-row cal-head">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (d) => (
                    <div key={d} className="cal-cell head">
                      {d}
                    </div>
                  ),
                )}
              </div>
              {weeks.map((week, wi) => (
                <div className="cal-row" key={wi}>
                  {week.map((d, di) => {
                    const inMonth = isCurrentMonth(d);
                    const isToday = isSameDay(d, today);
                    const isSelected = isSameDay(d, selected);
                    const prev = new Date(selected);
                    prev.setDate(selected.getDate() - 1);
                    const isAdjacent = isSameDay(d, prev) && inMonth;
                    const itemTypes = getItemTypesForDate(d);
                    const dayHasEvents =
                      itemTypes.hasClass ||
                      itemTypes.hasEvent ||
                      itemTypes.hasAssignment;
                    return (
                      <button
                        key={`${wi}-${di}`}
                        className={`cal-cell day ${inMonth ? "" : "muted"} ${
                          isToday ? "today" : ""
                        } ${isSelected ? "selected" : ""} ${
                          isAdjacent ? "adjacent" : ""
                        }`}
                        onClick={() => {
                          setSelected(d);
                          if (isMobile) {
                            setShowModal(true);
                          }
                        }}
                        aria-label={`Select ${dayLabel(d)}`}
                      >
                        <span className="date-num">{d.getDate()}</span>
                        {dayHasEvents && inMonth && (
                          <div className="event-indicators">
                            {itemTypes.hasClass && (
                              <span
                                className="indicator"
                                style={{ backgroundColor: "#3b82f6" }}
                              ></span>
                            )}
                            {itemTypes.hasEvent && (
                              <span
                                className="indicator"
                                style={{ backgroundColor: "#22c55e" }}
                              ></span>
                            )}
                            {itemTypes.hasAssignment && (
                              <span
                                className="indicator"
                                style={{ backgroundColor: "#f97316" }}
                              ></span>
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="calendar-stats-card">
                <div className="stats-grid">
                  {/* Total Events */}
                  <div className="stat-item">
                    <div className="stat-icon" style={{ backgroundColor: "rgba(59, 130, 246, 0.2)" }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                    </div>
                    <div className="stat-content">
                      <div className="stat-number">{monthStats.totalEvents}</div>
                      <div className="stat-label">Total Events</div>
                    </div>
                  </div>

                  {/* Total Classes */}
                  <div className="stat-item">
                    <div className="stat-icon" style={{ backgroundColor: "rgba(59, 130, 246, 0.2)" }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                        <path d="M22 10v6m0 0a8 8 0 0 1-15.997.004M22 16a8 8 0 0 1-15.997.004M9.005 9c1.668-1.092 3.845-1.713 6.131-1.713 2.268 0 4.429.606 6.069 1.669"></path>
                        <path d="M2 13v6m0 0a8 8 0 0 0 15.997.004M2 19a8 8 0 0 0 15.997.004M15 12c-1.668-1.092-3.845-1.713-6.131-1.713-2.268 0-4.429.606-6.069 1.669"></path>
                      </svg>
                    </div>
                    <div className="stat-content">
                      <div className="stat-number">{monthStats.totalClasses}</div>
                      <div className="stat-label">Classes</div>
                    </div>
                  </div>

                  {/* Pending Assignments */}
                  <div className="stat-item">
                    <div className="stat-icon" style={{ backgroundColor: "rgba(249, 115, 22, 0.2)" }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2">
                        <path d="M9 11l3 3L22 4"></path>
                        <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"></path>
                      </svg>
                    </div>
                    <div className="stat-content">
                      <div className="stat-number">{monthStats.pendingAssignments}</div>
                      <div className="stat-label">Assignments</div>
                    </div>
                  </div>

                  {/* Club Events */}
                  <div className="stat-item">
                    <div className="stat-icon" style={{ backgroundColor: "rgba(34, 197, 94, 0.2)" }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                      </svg>
                    </div>
                    <div className="stat-content">
                      <div className="stat-number">{monthStats.clubEvents}</div>
                      <div className="stat-label">Club Events</div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="events-pane" data-aos="fade-left" data-aos-delay="200">
          <div className="events-card">
            <div className="">
              <div className="events-title">{dayLabel(selected)}</div>
            </div>
            <div className="events-list-scroll">
              {events.list.length === 0 ? (
                <div className="empty text-white">No events</div>
              ) : (
                events.list.map((e) => (
                  <Card key={e.id} className="event-item">
                    <Card.Body className="d-flex align-items-start gap-2 p-0">
                      <FontAwesomeIcon
                        icon={faCircle}
                        style={{
                          marginTop: 6,
                          color:
                            e.color ||
                            (e.type === "event"
                              ? "#22c55e"
                              : e.type === "class"
                                ? "#3b82f6"
                                : "#f97316"),
                        }}
                      />
                      <div>
                        <div className="fw-semibold">{e.title}</div>
                        {e.type !== "event" && (
                          <div className="text-muted small">{e.subtitle}</div>
                        )}
                        <div className="text-muted small d-flex align-items-center gap-1">
                          <FontAwesomeIcon icon={faClock} /> {e.time}
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Coming Up Section */}
          <div
            className="events-card coming-up-card mt-1 d-none d-md-flex"
            style={{
              backgroundColor: "rgba(249, 115, 22, 0.15)",
              borderColor: "rgba(249, 115, 22, 0.3)",
            }}
          >
            <div className="d-flex align-items-center gap-2 mb-3">
              <div
                style={{
                  backgroundColor: "#f97316",
                  borderRadius: "8px",
                  padding: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m22 8-6 4 6 4V8Z" />
                  <rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
                </svg>
              </div>
              <div>
                <div className="events-title" style={{ marginBottom: 0 }}>
                  Coming Up
                </div>
                <div className="text-muted small">Next 2 weeks</div>
              </div>
            </div>

            {upcomingItems.length === 0 ? (
              <div
                className="text-center py-3"
                style={{ color: "rgba(255,255,255,0.7)" }}
              >
                All clear ahead!
              </div>
            ) : (
              <div className="coming-up-items-scroll">
                {upcomingItems.map((item) => {
                  // Determine background color based on type
                  let backgroundColor, borderColor;
                  if (item.type === "class") {
                    backgroundColor = "rgba(59, 130, 246, 0.2)";
                    borderColor = "rgba(59, 130, 246, 0.3)";
                  } else if (item.type === "event") {
                    backgroundColor = "rgba(34, 197, 94, 0.2)";
                    borderColor = "rgba(34, 197, 94, 0.3)";
                  } else if (item.type === "assignment") {
                    backgroundColor = "rgba(249, 115, 22, 0.2)";
                    borderColor = "rgba(249, 115, 22, 0.3)";
                  } else {
                    backgroundColor = "rgba(255, 255, 255, 0.1)";
                    borderColor = "rgba(255, 255, 255, 0.2)";
                  }

                  return (
                    <Card
                      key={item.id}
                      className="event-item mb-2"
                      style={{
                        backgroundColor,
                        borderColor,
                      }}
                    >
                      <Card.Body className="d-flex align-items-start gap-2 py-2">
                        <FontAwesomeIcon
                          icon={faCircle}
                          style={{
                            marginTop: 6,
                            fontSize: "0.5rem",
                            color:
                              item.color ||
                              (item.type === "event"
                                ? "#22c55e"
                                : item.type === "class"
                                  ? "#3b82f6"
                                  : "#f97316"),
                          }}
                        />
                        <div className="flex-grow-1">
                          <div className="fw-semibold text-white small">
                            {item.title}
                          </div>
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="text-muted small">
                              {item.class?.code || item.club?.name || ""}
                            </span>
                            <span className="text-muted small">
                              {new Date(item.startAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                },
                              )}
                            </span>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  );
                })}
              </div>
            )}
            <div
              className="d-flex gap-3 mt-3 pt-2"
              style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}
            >
              <div className="d-flex align-items-center gap-1">
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor: "#3b82f6",
                  }}
                ></span>
                <span className="small text-muted">Class</span>
              </div>
              <div className="d-flex align-items-center gap-1">
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor: "#22c55e",
                  }}
                ></span>
                <span className="small text-muted">Event</span>
              </div>
              <div className="d-flex align-items-center gap-1">
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor: "#f97316",
                  }}
                ></span>
                <span className="small text-muted">Assignment</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Modal - Only show on mobile */}
      {showModal && isMobile && selected && (
        <div className="calendar-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="calendar-modal" onClick={(e) => e.stopPropagation()}>
            {/* Date Display Section */}
            <div className="selected-date-display">
              <p className="month-year">{monthLabel(cursor.getFullYear(), cursor.getMonth())}</p>
              <h2>
                {selected.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </h2>
            </div>

            {/* Modal Content */}
            <div className="calendar-modal-content">
              {/* Events List Wrapper */}
              <div className="modal-events-wrapper">
                {/* Events List */}
                {events.list.length > 0 ? (
                  <div className="modal-events-list">
                  {events.list.map((item) => {
                    let dotColor = "#ffffff";
                    if (item.type === "class") dotColor = "#22c55e";
                    else if (item.type === "event") dotColor = "#3b82f6";
                    else if (item.type === "assignment") dotColor = "#f97316";

                    return (
                      <div key={item.id} className="modal-event-item">
                        <span
                          className="event-dot"
                          style={{
                            width: 12,
                            height: 12,
                            borderRadius: "50%",
                            backgroundColor: dotColor,
                          }}
                        ></span>
                        <div className="event-details">
                          <h4>{item.title}</h4>
                          <p className="event-code">{item.subtitle}</p>
                        </div>
                        <span className="event-time">{item.time}</span>
                      </div>
                    );
                  })}
                  </div>
                ) : (
                  <div className="modal-empty">
                    <p className="text-muted">No events scheduled for this date</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
    </>
  );
};

export default Calendar;
