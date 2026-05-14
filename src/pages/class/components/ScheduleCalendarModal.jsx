import React, { useState, useEffect } from "react";
import { Modal, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import "../../../scss/scheduleCalendarModal.scss";

const ScheduleCalendarModal = ({ show, onHide, schedules, onSave, isLoading }) => {
  const [selectedSchedules, setSelectedSchedules] = useState(new Set());

  useEffect(() => {
    if (show && schedules) {
      // Initialize with schedules that have show_in_calendar = true
      const initialSelected = new Set(
        schedules
          .filter((s) => s.show_in_calendar)
          .map((s) => s.id)
      );
      setSelectedSchedules(initialSelected);
    }
  }, [show, schedules]);

  const handleToggleSchedule = (scheduleId) => {
    setSelectedSchedules((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(scheduleId)) {
        newSet.delete(scheduleId);
      } else {
        newSet.add(scheduleId);
      }
      return newSet;
    });
  };

  const handleSave = () => {
    if (!schedules || schedules.length === 0) {
      toast.warning("No schedules available");
      return;
    }

    // Create update array
    const scheduleUpdates = schedules.map((schedule) => ({
      schedule_id: schedule.id,
      show_in_calendar: selectedSchedules.has(schedule.id),
    }));

    onSave(scheduleUpdates);
  };

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    try {
      const [hours, minutes] = timeString.split(":");
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? "PM" : "AM";
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch {
      return timeString;
    }
  };

  const getDayAbbreviation = (day) => {
    const abbreviations = {
      Monday: "Mon",
      Tuesday: "Tue",
      Wednesday: "Wed",
      Thursday: "Thu",
      Friday: "Fri",
      Saturday: "Sat",
      Sunday: "Sun",
    };
    return abbreviations[day] || day;
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      size="lg"
      className="schedule-calendar-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ marginRight: "8px", verticalAlign: "middle" }}
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          Select Schedules for Calendar
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {!schedules || schedules.length === 0 ? (
          <div className="text-center text-muted py-4">
            <p>No schedules available for this class.</p>
          </div>
        ) : (
          <div className="schedule-list">
            <p className="small">
              Select which schedules you want to display in your calendar:
            </p>
            {schedules.map((schedule) => (
              <div
                key={schedule.id}
                className={`schedule-item ${
                  selectedSchedules.has(schedule.id) ? "selected" : ""
                }`}
                onClick={() => handleToggleSchedule(schedule.id)}
              >
                <div className="schedule-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedSchedules.has(schedule.id)}
                    onChange={() => handleToggleSchedule(schedule.id)}
                    id={`schedule-${schedule.id}`}
                  />
                  <label htmlFor={`schedule-${schedule.id}`}></label>
                </div>
                <div className="schedule-details">
                  <div className="schedule-day-time">
                    <span className="day-badge">{getDayAbbreviation(schedule.day_of_week)}</span>
                    <span className="time-range">
                      {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                    </span>
                  </div>
                  {(schedule.start_date || schedule.end_date) && (
                    <div className="schedule-dates">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ marginRight: "4px", verticalAlign: "middle" }}
                      >
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                      {schedule.start_date && schedule.end_date
                        ? `${formatDate(schedule.start_date)} - ${formatDate(schedule.end_date)}`
                        : schedule.start_date
                        ? `From ${formatDate(schedule.start_date)}`
                        : schedule.end_date
                        ? `Until ${formatDate(schedule.end_date)}`
                        : ""}
                    </div>
                  )}
                  {schedule.location && (
                    <div className="schedule-location">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ marginRight: "4px", verticalAlign: "middle" }}
                      >
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                      {schedule.location}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <button
          type="button"
          className="btn btn-light"
          onClick={onHide}
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleSave}
          disabled={isLoading || !schedules || schedules.length === 0}
        >
          {isLoading ? "Saving..." : "Save Preferences"}
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default ScheduleCalendarModal;
