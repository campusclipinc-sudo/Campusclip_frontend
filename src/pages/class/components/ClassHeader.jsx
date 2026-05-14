import React from "react";
import { Button, Dropdown } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const ClassHeader = ({
  title,
  subtitle,
  onAddTask,
  onRemove,
  onOpenScheduleModal,
}) => {
  const navigate = useNavigate();

  return (
    <div className="cc-class-header">
      <button
        className="btn-link back"
        aria-label="Back to Dashboard"
        onClick={() => navigate("/dashboard")}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          data-filename="pages/ClassDetails"
          data-linenumber="270"
          data-visual-selector-id="pages/ClassDetails270"
          data-source-location="pages/ClassDetails:270:16"
          data-dynamic-content="false"
        >
          <path d="m12 19-7-7 7-7"></path>
          <path d="M19 12H5"></path>
        </svg>{" "}
        Back to Dashboard
      </button>
      <div className="cc-class-header-bg">
        <h3>{title}</h3>
        {subtitle && <p className="subtitle">{subtitle}</p>}
        <div className="d-flex gap-2">
          <button
            className="btn btn-second"
            onClick={onAddTask}
            aria-label="Add New Task"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              data-filename="pages/ClassDetails"
              data-linenumber="291"
              data-visual-selector-id="pages/ClassDetails291"
              data-source-location="pages/ClassDetails:291:18"
              data-dynamic-content="false"
            >
              <path d="M5 12h14"></path>
              <path d="M12 5v14"></path>
            </svg>{" "}
            <span className="d-none d-sm-inline">Add New Task</span>
            <span className="d-inline d-sm-none">Task</span>
          </button>
          <button
            className="btn btn-second"
            onClick={onOpenScheduleModal}
            aria-label="Manage Calendar Schedules"
          >
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
            >
              <path d="M8 2v4"></path>
              <path d="M16 2v4"></path>
              <rect width="18" height="18" x="3" y="4" rx="2"></rect>
              <path d="M3 10h18"></path>
            </svg>{" "}
            <span className="d-none d-sm-inline">Calendar Schedules</span>
            <span className="d-inline d-sm-none">Schedule</span>
          </button>
          <button
            className="btn btn-second"
            onClick={onRemove}
            aria-label="Remove Class"
          >
            <span className="d-none d-sm-inline">Remove Class</span>
            <span className="d-inline d-sm-none">Remove</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClassHeader;
