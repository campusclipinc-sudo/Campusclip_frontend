import React, { useEffect, useState } from "react";
import { Modal, Button, Row, Col, Form } from "react-bootstrap";
import "../../../scss/gradeUpdateModal.scss";

const GradeUpdateModal = ({
  show,
  onHide,
  assignment,
  onSave,
  onMarkPending,
  onDrop,
  initialAdvancedMode = false,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(initialAdvancedMode);
  const [pointsEarned, setPointsEarned] = useState("");
  const [pointsPossible, setPointsPossible] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("exam");
  const [weight, setWeight] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (assignment && show) {
      // Clear previous errors when assignment changes
      setErrors({});
      
      // Use marks_obtained (from API) instead of points_earned
      setPointsEarned(
        assignment.marks_obtained || assignment.points_earned || "",
      );
      setPointsPossible(assignment.points_possible || "");
      setTitle(assignment.title || "");
      setDescription(assignment.description || "");
      setType(assignment.type || "exam");
      setWeight(assignment.weight || "");
      if (assignment.due_date) {
        const raw = assignment.due_date.replace("Z", "").replace(" ", "T");
        setDueDate(raw.slice(0, 10)); // "YYYY-MM-DD"
        const timeMatch = raw.match(/T(\d{2}:\d{2})/);
        // Only set time if it's not midnight (00:00 means date-only was stored)
        setDueTime(timeMatch && timeMatch[1] !== "00:00" ? timeMatch[1] : "");
      } else {
        setDueDate("");
        setDueTime("");
      }
      // Always start in simple grade view mode, regardless of due date
      setShowAdvanced(initialAdvancedMode);
    }
  }, [assignment, show, initialAdvancedMode]);

  const handleSave = () => {
    // Validate form
    const newErrors = {};
    
    if (showAdvanced) {
      // Due date is required in advanced mode
      if (!dueDate || dueDate.trim() === "") {
        newErrors.dueDate = "Due date is required";
      }

      
      // Title is required
      if (!title || title.trim() === "") {
        newErrors.title = "Assignment title is required";
      }
    }

    // If there are validation errors, show them and don't save
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Clear errors if validation passes
    setErrors({});

    const updates = {
      marks_obtained: pointsEarned ? Number(pointsEarned) : null,
      points_possible: pointsPossible ? Number(pointsPossible) : 100,
      status: pointsEarned ? "graded" : "pending",
    };

    if (showAdvanced) {
      updates.title = title;
      updates.description = description;
      updates.type = type;
      updates.weight = weight ? Number(weight) : null;
      // Combine date + time: "YYYY-MM-DD" + optional "THH:MM"
      updates.due_date = dueDate
        ? dueTime
          ? `${dueDate}T${dueTime}`
          : dueDate
        : null;
    }

    onSave?.(updates);
    handleClose();
  };

  const handleMarkPending = () => {
    onMarkPending?.();
    handleClose();
  };

  const handleDrop = () => {
    onDrop?.();
    handleClose();
  };

  const handleClose = () => {
    setShowAdvanced(false);
    setErrors({});
    onHide?.();
  };

  if (!assignment) return null;

  return (
    <Modal
      className="grade-update-modal"
      show={show}
      onHide={handleClose}
      centered
      backdrop
      keyboard
    >
      <Modal.Header closeButton></Modal.Header>
      <Modal.Body>
        <div className="d-flex flex-wrap align-items-center grade-update-head justify-content-between">
          <div className="grade-update-title">
            <Modal.Title>
              {showAdvanced
                ? "Edit Assignment Details"
                : `Update "${assignment.title}"`}
            </Modal.Title>
            <p className="modal-subtitle">
              {showAdvanced
                ? "Customize all assignment details including dates, weightings, and timing."
                : "Enter the score, drop the assignment, or reset its status to pending."}
            </p>
          </div>

          <div className="advanced-toggle">
            <button
              type="button"
              className="btn-advanced"
              onClick={() => {
                setShowAdvanced(!showAdvanced);
                setErrors({}); // Clear errors when switching modes
              }}
            >
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
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24" />
              </svg>
              Advanced
            </button>
          </div>
        </div>

        {!showAdvanced ? (
          <div className="grade-input-container mt-4">
            <div className="grade-inputs">
              <Form.Control
                type="number"
                className="points-input"
                value={pointsEarned}
                onChange={(e) => setPointsEarned(e.target.value)}
                placeholder="0"
                min="0"
              />
              <span className="divider-main">/</span>
              <Form.Control
                type="number"
                className="points-input"
                value={pointsPossible}
                onChange={(e) => setPointsPossible(e.target.value)}
                placeholder="100"
                min="0"
              />
            </div>
          </div>
        ) : (
          <div className="advanced-form mt-4">
            <Form.Group className="form-group mb-3">
              <Form.Label>Assignment Title</Form.Label>
              <Form.Control
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter assignment title"
              />
            </Form.Group>

            <Form.Group className="form-group mb-3">
              <Form.Label>Description (Optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Additional assignment details..."
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="form-group mb-3">
                  <Form.Label>Assignment Type</Form.Label>
                  <Form.Select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                  >
                    <option value="exam">Exam</option>
                    <option value="quiz">Quiz</option>
                    <option value="assignment">Assignment</option>
                    <option value="project">Project</option>
                    <option value="participation">Participation</option>
                    <option value="other">Other</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="form-group mb-3">
                  <Form.Label>Due Date <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="date"
                    value={dueDate}
                    onChange={(e) => {
                      setDueDate(e.target.value);
                      if (errors.dueDate) setErrors({ ...errors, dueDate: "" });
                    }}
                    isInvalid={!!errors.dueDate}
                    required
                  />
                  {errors.dueDate && (
                    <Form.Control.Feedback type="invalid">
                      {errors.dueDate}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>
                <Form.Group className="form-group mb-3">
                  <Form.Label>Due Time <span style={{ color: "#999", fontWeight: 400 }}>(optional)</span></Form.Label>
                  <Form.Control
                    type="time"
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                    placeholder="----"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="form-group mb-3">
                  <Form.Label>Weight (%)</Form.Label>
                  <Form.Control
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="50"
                    min="0"
                    max="100"
                    step="any"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="form-group mb-3">
                  <Form.Label>Points Possible</Form.Label>
                  <Form.Control
                    type="number"
                    value={pointsPossible}
                    onChange={(e) => setPointsPossible(e.target.value)}
                    placeholder="100"
                    min="0"
                  />
                </Form.Group>
              </Col>
            </Row>
          </div>
        )}

        <div className="d-flex justify-content-between align-items-center flex-wrap row-gap-3">
          <div className="action-buttons d-flex flex-md-column flex-row">
            <Button variant="outline-primary" onClick={handleMarkPending}>
              Mark as Pending
            </Button>
            <Button variant="outline-danger" onClick={handleDrop}>
              Drop Assignment
            </Button>
          </div>
          <div className="d-flex gap-3">
            <Button variant="light" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave}>
              {showAdvanced ? "Save Changes" : "Save Grade"}
            </Button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default GradeUpdateModal;
