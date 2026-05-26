import React, { useMemo, useState, useEffect } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { confirmAlert } from "react-confirm-alert";
import ClassHeader from "./components/ClassHeader";
import ClassTabs from "./components/ClassTabs";
import TaskModal from "./components/TaskModal";
import GradeUpdateModal from "./components/GradeUpdateModal";
import TargetGradeModal from "./components/TargetGradeModal";
import ClassChat from "../../components/ClassChat";
import "../../scss/classDetails.scss";
import AOS from "aos";
import "aos/dist/aos.css";
import {
  useListAssignments,
  useCreateAssignment,
  useUpdateAssignment,
  useDeleteAssignment,
  useRestoreAssignment,
  useDeleteClass,
  useUpdateTargetGrade,
  useGetClassMembers,
} from "../../hooks/index";
import {
  useGetClassSchedules,
  useUpdateSchedulesShowInCalendar,
} from "../../hooks/useRQclass";
import ScheduleCalendarModal from "./components/ScheduleCalendarModal";
import { useGetProfile } from "../../hooks/useRQauth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import DashboardLayout from "../../component/DashboardLayout";
import ChannelNotificationService from "../../api/channelNotificationService";
import { selectClassNotifications } from "../../store/notificationSlice";
import { NotificationDot } from "../../components/NotificationIndicators";

// assignments are fetched from API

// Formats a due_date string (YYYY-MM-DD, "YYYY-MM-DD HH:MM:SS", or ISO 8601)
// Extracts time directly from the string — no timezone conversion
function formatDueDate(dueDate) {
  if (!dueDate) return null;
  const dateStr = dueDate.substring(0, 10);
  const datePart = new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  // Match time from both "T17:00" (ISO) and " 17:00" (MySQL DATETIME) formats
  const timeMatch = dueDate.match(/[T ](\d{2}):(\d{2})/);
  if (!timeMatch) return datePart;
  const h = parseInt(timeMatch[1], 10);
  const m = timeMatch[2];
  // Treat midnight (00:00) as date-only (no explicit time was provided)
  if (h === 0 && m === "00") return datePart;
  const ampm = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${datePart} at ${hour12}:${m} ${ampm}`;
}


const ClassDetails = () => {
  const { id: classId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const classNotifications = useSelector(selectClassNotifications);
  const [active, setActive] = useState(searchParams.get('tab') || "assignments");
  const [showTask, setShowTask] = useState(false);
  const [showGradeUpdate, setShowGradeUpdate] = useState(false);
  const [showTargetGrade, setShowTargetGrade] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showDeleted, setShowDeleted] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [expandedDescriptions, setExpandedDescriptions] = useState(new Set());
  const chatSectionRef = React.useRef(null);

  // Persist active tab in URL params
  useEffect(() => {
    setSearchParams({ tab: active });
  }, [active, setSearchParams]);

  // Scroll to chat section on mobile when chat tab is clicked
  useEffect(() => {
    if (active === "chat" && chatSectionRef.current) {
      // Only scroll on mobile devices (viewport width < 768px)
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        setTimeout(() => {
          chatSectionRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }, 100);
      }
    }
  }, [active]);

  // React.useEffect(() => {
  //   AOS.init({
  //     duration: 800,
  //     easing: "ease-out-quart",
  //     once: true,
  //     offset: 40,
  //   });
  // }, []);

  // Queries & Mutations
  const { data, isLoading, refetch } = useListAssignments(
    { class_id: classId },
    undefined,
    (err) => {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load assignments";
      toast.error(message);
    },
  );

  // Fetch deleted assignments separately (only when needed)
  const { data: deletedData, refetch: refetchDeleted } = useListAssignments(
    { class_id: classId, include_deleted: true },
    undefined,
  );

  const allItems = deletedData?.data?.items || deletedData?.items || [];
  const activeItems = data?.data?.items || data?.items || [];
  // Filter deleted items - check for deleted_at field
  const deletedItems = allItems.filter(item => item.deleted_at != null);
  const items = activeItems;

  // Extract grade values from API response
  const currentGrade = data?.data?.current_grade ?? 0;
  const targetGrade = data?.data?.target_grade ?? null;
  const requiredGrade = data?.data?.required_grade ?? 0;

  // Check if target grade is set (not null, undefined, or 0)
  const hasTargetGrade =
    targetGrade !== null && targetGrade !== undefined && targetGrade > 0;

  // Extract class details from API response
  const className = data?.data?.class_name || "Class";
  const classCode = data?.data?.class_code || "";
  const instructorName = data?.data?.instructor_name || "";
  const instructorEmail = data?.data?.instructor_email || "";

  // Group assignments by type for type-wise display
  const grouped = useMemo(() => {
    const map = {
      assignment: [],
      exam: [],
      quiz: [],
      project: [],
      participation: [],
      other: [],
    };

    for (const a of items) {
      const t = (a?.type || "assignment").toString().toLowerCase();
      if (map[t]) map[t].push(a);
      else map.other.push(a);
    }
    return map;
  }, [items]);

  const sectionOrder = [
    { key: "exam", title: "Exams" },
    { key: "quiz", title: "Quiz" },
    { key: "project", title: "Projects" },
    { key: "assignment", title: "Assignments" },
    { key: "participation", title: "Participation" },
    { key: "other", title: "Other" },
  ];

  const createMutation = useCreateAssignment(() => {
    setShowTask(false);
  });
  const updateMutation = useUpdateAssignment(() => {
    setShowGradeUpdate(false);
    setSelectedAssignment(null);
  });
  const deleteMutation = useDeleteAssignment(() => {
    refetch();
    refetchDeleted();
  });
  const restoreMutation = useRestoreAssignment(() => {
    refetch();
    refetchDeleted();
  });
  const { mutate: deleteClass } = useDeleteClass(() => {
    navigate("/");
  });
  const updateTargetGradeMutation = useUpdateTargetGrade(() => {
    refetch();
    setShowTargetGrade(false);
  });
  // Fetch class schedules
  const { data: schedulesData, refetch: refetchSchedules } = useGetClassSchedules(
    classId,
    undefined,
  );

  const schedules = schedulesData?.data?.schedules || [];

  const updateSchedulesMutation = useUpdateSchedulesShowInCalendar(() => {
    refetchSchedules();
  });

  // Fetch class members
  const { data: classMembersData, isLoading: membersLoading } =
    useGetClassMembers(classId, undefined, (err) => {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load class members";
      toast.error(message);
    });

  // Handle different possible data structures
  const classMembers = classMembersData?.data?.members || [];

  // Get current user ID for profile navigation
  const { data: profileData } = useGetProfile();
  const currentUserId = profileData?.id;

  const handleRemoveClass = async () => {
    confirmAlert({
      closeOnClickOutside: false,
      overlayClassName: "react-confirm-alert-overlay",
      customUI: ({ onClose }) => (
        <div className="cc-confirm card shadow-sm">
          <div className="card-body">
            <h5 className="card-title mb-2">Remove Class</h5>
            <p className="mb-4">
              Are you sure you want to remove this class? This action cannot be
              undone.
            </p>
            <div className="d-flex justify-content-end gap-2">
              <button type="button" className="btn btn-light" onClick={onClose}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => {
                  try {
                    deleteClass({ id: classId });
                    onClose();
                  } catch {
                    // handled in onError
                  }
                }}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      ),
    });
  };

  const handleAddTask = async (form) => {
    try {
      const payload = {
        title: form.title,
        type: (form.type || "assignment").toString().toLowerCase(),
        due_date: form.dueDate
          ? new Date(
            new Date(form.dueDate).getTime() -
            new Date(form.dueDate).getTimezoneOffset() * 60000,
          ).toISOString()
          : null,
        weight: form.weight ? Number(form.weight) : null,
        points_possible: form.points ? Number(form.points) : null,
        description: form.description || null,
        class_id: classId,
      };
      await createMutation.mutateAsync(payload);
      // list invalidation is handled in the hook; keep a manual refetch safeguard
      refetch();
    } catch {
      // errors handled by interceptor/toast
    }
  };

  const handleDelete = async (assignmentId) => {
    try {
      await deleteMutation.mutateAsync(assignmentId);
      refetch();
      refetchDeleted();
    } catch {
      // handled globally
    }
  };

  const handleRestore = async (assignmentId) => {
    try {
      await restoreMutation.mutateAsync(assignmentId);
      refetch();
      refetchDeleted();
    } catch {
      // handled globally
    }
  };

  const handleAssignmentClick = (assignment) => {
    setSelectedAssignment(assignment);
    setShowGradeUpdate(true);
  };

  const handleSaveGrade = async (updates) => {
    try {
      await updateMutation.mutateAsync({
        id: selectedAssignment.id,
        ...updates,
      });
      refetch();
    } catch {
      // handled globally
    }
  };

  const handleMarkPending = async () => {
    try {
      await updateMutation.mutateAsync({
        id: selectedAssignment.id,
        graded: false,
        points_earned: null,
        status: "pending",
      });
      refetch();
    } catch {
      // handled globally
    }
  };

  const handleDropAssignment = async () => {
    confirmAlert({
      closeOnClickOutside: false,
      overlayClassName: "react-confirm-alert-overlay",
      customUI: ({ onClose }) => (
        <div className="cc-confirm card shadow-sm">
          <div className="card-body">
            <h5 className="card-title mb-2">Drop Assignment</h5>
            <p className="mb-4">
              Are you sure you want to drop this assignment? This action cannot
              be undone.
            </p>
            <div className="d-flex justify-content-end gap-2">
              <button type="button" className="btn btn-light" onClick={onClose}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={async () => {
                  try {
                    await handleDelete(selectedAssignment.id);
                    setShowGradeUpdate(false);
                    setSelectedAssignment(null);
                    onClose();
                  } catch {
                    // handled
                  }
                }}
              >
                Drop
              </button>
            </div>
          </div>
        </div>
      ),
    });
  };

  const handleSaveTargetGrade = async (targetGrade) => {
    try {
      await updateTargetGradeMutation.mutateAsync({
        class_id: classId,
        target_grade: targetGrade,
      });
    } catch {
      // handled globally
    }
  };

  const handleSaveSchedulePreferences = async (scheduleUpdates) => {
    try {
      await updateSchedulesMutation.mutateAsync({
        schedule_updates: scheduleUpdates,
      });
      setShowScheduleModal(false);
    } catch {
      // handled globally
    }
  };

  const handleProfileImageClick = (e, userId) => {
    e.stopPropagation();
    if (userId) {
      // If it's the current user's own profile, go to /profile
      if (userId === currentUserId) {
        navigate("/profile");
      } else {
        navigate(`/students/${userId}`);
      }
    }
  };

  const classChannelNotifications = classNotifications.byClass?.[classId] || {};

  React.useEffect(() => {
    const moduleMap = {
      assignments: "assignments",
      chat: "chat",
      classmates: "classmates",
    };

    const moduleKey = moduleMap[active];
    if (!moduleKey || !classId) {
      return;
    }

    ChannelNotificationService.clear({
      channel_type: "class",
      channel_id: classId,
      module_key: moduleKey,
    }).catch((error) => {
      console.error("Failed to clear class channel notification:", error);
    });
  }, [active, classId]);

  return (
    <DashboardLayout>
      <div className="class-details-main">
        <div className="class-detail">
          <div data-aos="fade-down">
            <ClassHeader
              title={className}
              subtitle={`${classCode}${instructorName ? ` • ${instructorName}` : ""
                }${instructorEmail ? ` • ${instructorEmail}` : ""
                }`}
              onAddTask={() => setShowTask(true)}
              onRemove={handleRemoveClass}
              onOpenScheduleModal={() => setShowScheduleModal(true)}
            />
          </div>

          {/* <Col lg={5} xl={4} className="d-none d-lg-block"> */}
            {/* On small screens keep cards next to header */}
            {/* <Row className="g-3">
              {hasTargetGrade && (
                <Col md={6}>
                  <Card className="cc-stat">
                    <Card.Body>
                      <div className="label">Current Grade</div>
                      <div className="value">{currentGrade}%</div>
                      <div className="muted">Overall Percentage</div>
                    </Card.Body>
                  </Card>
                </Col>
              )}
            </Row> */}
          {/* </Col> */}

          <div className="class-detail-main">
            <div className="class-sidebar" data-aos="fade-left">
              {hasTargetGrade && (
                <>
                  <div className="class-sidebar-box">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h4>Current Grade</h4>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="trend-icon"
                      >
                        <path d="m5 12 7-7 7 7" />
                        <path d="M12 19V5" />
                      </svg>
                    </div>
                    <div className="value">{currentGrade}%</div>
                    <p>Overall Percentage</p>
                  </div>
                  <div className="class-sidebar-box target-box">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h4>Target Grade</h4>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="trend-icon target-icon"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <circle cx="12" cy="12" r="6" />
                        <circle cx="12" cy="12" r="2" />
                      </svg>
                    </div>
                    <div className="value">{targetGrade}%</div>
                    <p>Your goal for this class</p>
                  </div>
                  <div className="class-sidebar-box required-box">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h4>Required Grade</h4>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="trend-icon warning-icon"
                      >
                        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
                        <path d="M12 9v4" />
                        <path d="M12 17h.01" />
                      </svg>
                    </div>
                    <div className="value">
                      {requiredGrade > 0 ? `${requiredGrade}%` : "0%"}
                    </div>
                    <p>Needed to reach target</p>
                  </div>
                </>
              )}
              {/* Desktop: Show on all tabs */}
              <button
                className="target-btn d-none d-lg-flex"
                onClick={() => setShowTargetGrade(true)}
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
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <circle cx="12" cy="12" r="6"></circle>
                  <circle cx="12" cy="12" r="2"></circle>
                </svg>
                <span>{hasTargetGrade ? "Edit target grade" : "Add target grade"}</span>
              </button>
            </div>
            <div className="class-content">
              {/* Mobile-only compact grade summary row */}
              {hasTargetGrade && (
                <div className="mobile-grade-summary d-lg-none">
                  <div className="mobile-grade-box">
                    <div className="mobile-grade-label">Current</div>
                    <div className="mobile-grade-value">{currentGrade}%</div>
                    <div className="mobile-grade-sub">Overall</div>
                  </div>
                  <div className="mobile-grade-box target-box">
                    <div className="mobile-grade-label">Target</div>
                    <div className="mobile-grade-value">{targetGrade}%</div>
                    <div className="mobile-grade-sub">Goal</div>
                  </div>
                  <div
                    className="mobile-grade-box required-box"
                    onClick={() => setShowTargetGrade(true)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="mobile-grade-label">Required</div>
                    <div className="mobile-grade-value">
                      {requiredGrade > 0 ? `${requiredGrade}%` : "0%"}
                    </div>
                    <div className="mobile-grade-sub">Edit</div>
                  </div>
                </div>
              )}
              {/* Mobile: Show button after grade summary */}
              {active === "assignments" && (
                <button
                  className="target-btn d-lg-none"
                  onClick={() => setShowTargetGrade(true)}
                  style={{ marginBottom: "1rem" }}
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
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <circle cx="12" cy="12" r="6"></circle>
                    <circle cx="12" cy="12" r="2"></circle>
                  </svg>
                  <span>{hasTargetGrade ? "Edit target grade" : "Add target grade"}</span>
                </button>
              )}
              <ClassTabs
                activeKey={active}
                onSelect={setActive}
                notifications={classChannelNotifications}
              />

              {active === "assignments" && (
                <div className="cc-assignment-list mt-3" data-aos="fade-up">
                  {isLoading ? (
                    <div className="text-muted">Loading assignments…</div>
                  ) : items.length === 0 ? (
                    <div className="no-assignments">
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
                        data-filename="components/classes/AssignmentList"
                        data-linenumber="122"
                        data-visual-selector-id="components/classes/AssignmentList122"
                        data-source-location="components/classes/AssignmentList:122:10"
                        data-dynamic-content="false"
                      >
                        <path d="M12 7v14"></path>
                        <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"></path>
                      </svg>
                      <h3>No Assignments Yet</h3>
                      <p>Add an assignment to start tracking your progress.</p>
                    </div>
                  ) : (
                    sectionOrder
                      .filter(
                        ({ key }) => grouped[key] && grouped[key].length > 0,
                      )
                      .map(({ key, title }) => (
                        <div key={key} className="mb-2">
                          <div className="section-title">{title}</div>
                          {grouped[key].map((a, index) => {
                            const percentage = a.status === "graded" && a.points_possible != null && a.marks_obtained != null
                              ? ((Number(a.marks_obtained) / a.points_possible) * 100)
                              : 0;

                            return (
                              <Card
                                key={a.id}
                                className="cc-assignment-item"
                                style={{ animationDelay: `${index * 0.05}s` }}
                              >
                                <Card.Body onClick={() => handleAssignmentClick(a)} style={{ cursor: "pointer" }}>
                                  <div className="assignment-content">
                                    <div className="icon" aria-hidden>
                                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>
                                      </svg>
                                    </div>
                                  </div>

                                  <div className="content">
                                    <div className="title-badge-wrapper">
                                      <div className="title">{a.title}</div>
                                      {a.status === "graded" && <span className="status-badge status-badge-graded">Graded</span>}
                                      {a.status === "pending" && <span className="status-badge status-pending">Pending</span>}
                                    </div>

                                    <div className="meta">
                                      {a.due_date ? (
                                        <>
                                          {`Due ${formatDueDate(a.due_date)}`}
                                          {a.weight != null && <span>• Weight {Number(a.weight).toFixed(1)}%</span>}
                                          {new Date(a.due_date) < new Date() && (
                                            <span style={{ fontSize: "0.7rem", fontWeight: "600", padding: "0.3em 0.7em", borderRadius: "8px", display: "inline-flex", alignItems: "center", gap: "3px", backgroundColor: "#a855f7", color: "#fff" }}>
                                              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                                              Overdue
                                            </span>
                                          )}
                                        </>
                                      ) : (
                                        <>
                                          Due: N/A
                                          {a.weight != null && <span>• Weight {Number(a.weight).toFixed(1)}%</span>}
                                        </>
                                      )}
                                    </div>

                                    {a.description && (
                                      <div className="assignment-description">
                                        {expandedDescriptions.has(a.id) ? (
                                          <>
                                            <span>{a.description} </span>
                                            <button className="btn-read-more" onClick={e => { e.stopPropagation(); setExpandedDescriptions(prev => { const s = new Set(prev); s.delete(a.id); return s; }); }} style={{ background: "transparent", border: "none", color: "#fff", fontSize: "0.8125rem", fontWeight: "600", cursor: "pointer", padding: 0 }}>Read less</button>
                                          </>
                                        ) : (
                                          <>
                                            <span>{a.description.length > 60 ? `${a.description.substring(0, 60)}...` : a.description}</span>
                                            {a.description.length > 60 && (
                                              <button className="btn-read-more" onClick={e => { e.stopPropagation(); setExpandedDescriptions(prev => { const s = new Set(prev); s.add(a.id); return s; }); }} style={{ background: "transparent", border: "none", color: "#fff", fontSize: "0.8125rem", cursor: "pointer", fontWeight: "600", padding: 0, marginLeft: "4px" }}>Read more</button>
                                            )}
                                          </>
                                        )}
                                      </div>
                                    )}

                                    {a.status === "graded" && a.points_possible != null && a.marks_obtained != null && (
                                      <div className="progress-section">
                                        <div className="progress-bar-wrapper">
                                          <div className="progress">
                                            <div className="progress-bar" style={{ width: `${Math.min(percentage, 100)}%` }}></div>
                                          </div>
                                        </div>
                                        <div className="score-display">{percentage.toFixed(0)}%</div>
                                      </div>
                                    )}
                                  </div>

                                  <div className="score-section">
                                    {a.status === "graded" && a.points_possible != null && a.marks_obtained != null && (
                                      <div style={{ fontWeight: "700", fontSize: "1rem", color: "#fff" }}>
                                        {Number(a.marks_obtained).toFixed(0)}/{a.points_possible}
                                      </div>
                                    )}
                                    {a.status === "graded" && a.points_possible != null && a.marks_obtained != null && (
                                      <div style={{ fontSize: "0.875rem", color: "rgba(255, 255, 255, 0.7)" }}>
                                        ({percentage.toFixed(0)}%)
                                      </div>
                                    )}
                                  </div>

                                  <button className="trash" aria-label="Delete assignment" onClick={e => { e.stopPropagation(); handleDelete(a.id); }} disabled={deleteMutation.isPending} title="Delete">
                                    <FontAwesomeIcon icon={faTrash} />
                                  </button>
                                </Card.Body>
                              </Card>
                            );
                          })}
                        </div>
                      ))
                  )}

                  {/* Deleted Assignments Section */}
                  {deletedItems.length > 0 && (
                    <div className="mt-3">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <div className="section-title text-muted">
                          Deleted Assignments ({deletedItems.length})
                        </div>
                        <button
                          className="btn btn-sm btn-link text-muted p-0"
                          onClick={() => setShowDeleted(!showDeleted)}
                          style={{ textDecoration: 'none' }}
                        >
                          {showDeleted ? 'Hide' : 'Show'}
                        </button>
                      </div>
                      {showDeleted && (
                        <div className="deleted-assignments">
                          {deletedItems.map((a) => (
                            <Card key={a.id} className="cc-assignment-item deleted">
                              <Card.Body>
                                <div className="assignment-content">
                                  <div className="icon" aria-hidden>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>
                                    </svg>
                                  </div>
                                </div>

                                <div className="content">
                                  <div className="title-badge-wrapper">
                                    <div className="title">{a.title}</div>
                                    <span className="status-badge" style={{ background: "#ef4444", color: "#fff" }}>Deleted</span>
                                  </div>

                                  <div className="meta">
                                    {a.due_date ? (
                                      <>
                                        {`Due ${formatDueDate(a.due_date)}`}
                                        {a.weight != null && <span>• Weight {Number(a.weight).toFixed(1)}%</span>}
                                      </>
                                    ) : (
                                      <>
                                        Due: N/A
                                        {a.weight != null && <span>• Weight {Number(a.weight).toFixed(1)}%</span>}
                                      </>
                                    )}
                                  </div>
                                </div>

                                <button
                                  className="trash"
                                  aria-label="Restore assignment"
                                  onClick={e => { e.stopPropagation(); handleRestore(a.id); }}
                                  disabled={restoreMutation.isPending}
                                  title="Restore"
                                  style={{ background: "rgba(16, 185, 129, 0.2)", border: "1px solid rgba(16, 185, 129, 0.3)", color: "#10b981" }}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                                  </svg>
                                </button>
                              </Card.Body>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {active === "overview" && (
                <div className="text-muted mt-3" data-aos="fade-up">
                  Overview content (placeholder)
                </div>
              )}
              {active === "chat" && (
                <div ref={chatSectionRef} className="mt-3" data-aos="fade-up">
                  <ClassChat
                    classId={classId}
                    className={
                      className ? `${className} Discussion` : "Class Discussion"
                    }
                  />
                </div>
              )}
              {active === "classmates" && (
                <div className="cc-classmates-list mt-3">
                  {membersLoading ? (
                    <div className="text-muted">Loading classmates…</div>
                  ) : classMembers.length === 0 ? (
                    <div className="no-members">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="48"
                        height="48"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                      </svg>
                      <h3>No Classmates Yet</h3>
                      <p>No one has joined this class yet.</p>
                    </div>
                  ) : (
                    <div className="d-flex flex-column gap-2">
                      {Array.isArray(classMembers) &&
                        classMembers.map((member, index) => (
                          <Card
                            key={member.id}
                            className="member-card"
                            data-aos="zoom-in"
                            data-aos-delay={index * 50}
                          >
                            <Card.Body className="d-flex align-items-center gap-3 p-0">
                              <div
                                className="member-avatar"
                                onClick={(e) => handleProfileImageClick(e, member.user?.id)}
                                style={{ cursor: "pointer" }}
                              >
                                {member.user?.profile_image ? (
                                  <img
                                    src={member.user.profile_image}
                                    alt={
                                      member.user.full_name ||
                                      member.user.username
                                    }
                                    className="rounded-circle"
                                    style={{
                                      width: 50,
                                      height: 50,
                                      objectFit: "cover",
                                    }}
                                  />
                                ) : (
                                  <div
                                    className="rounded-circle d-flex align-items-center justify-content-center bg-primary text-white"
                                    style={{
                                      width: 50,
                                      height: 50,
                                      fontSize: "1.25rem",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    {(
                                      member.user?.full_name?.[0] ||
                                      member.user?.username?.[0] ||
                                      "U"
                                    ).toUpperCase()}
                                  </div>
                                )}
                              </div>
                              <div className="member-info flex-grow-1">
                                <h5 className="mb-0">
                                  {member.user?.full_name ||
                                    member.user?.username ||
                                    "Unknown User"}
                                </h5>
                                <p className="mb-0 small">
                                  {member.user?.email || ""}
                                </p>
                                {/* {member.role && (
                                  <span
                                    className={`badge ${
                                      member.role === "instructor"
                                        ? "bg-success"
                                        : member.role === "ta"
                                        ? "bg-info"
                                        : "bg-secondary"
                                    } mt-1`}
                                  >
                                    {member.role.charAt(0).toUpperCase() +
                                      member.role.slice(1)}
                                  </span>
                                )} */}
                              </div>
                            </Card.Body>
                          </Card>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <TaskModal
        show={showTask}
        onHide={() => setShowTask(false)}
        onSave={handleAddTask}
      />

      <GradeUpdateModal
        show={showGradeUpdate}
        onHide={() => {
          setShowGradeUpdate(false);
          setSelectedAssignment(null);
        }}
        assignment={selectedAssignment}
        onSave={handleSaveGrade}
        onMarkPending={handleMarkPending}
        onDrop={handleDropAssignment}
      />

      <TargetGradeModal
        show={showTargetGrade}
        onHide={() => setShowTargetGrade(false)}
        currentTargetGrade={data?.data?.target_grade || null}
        onSave={handleSaveTargetGrade}
      />

      <ScheduleCalendarModal
        show={showScheduleModal}
        onHide={() => setShowScheduleModal(false)}
        schedules={schedules}
        onSave={handleSaveSchedulePreferences}
        isLoading={updateSchedulesMutation.isPending}
      />
    </DashboardLayout>
  );
};

export default ClassDetails;
