import React, { useEffect, useRef, useState } from "react";
import { Modal, Button, Row, Col } from "react-bootstrap";
import TNInput from "../../../component/TNInput";

const defaultForm = {
  title: "",
  type: "assignment",
  dueDate: null,
  weight: "",
  points: "",
  description: "",
};

const TaskModal = ({ show, onHide, onSave }) => {
  const [form, setForm] = useState(defaultForm);
  const firstInputRef = useRef(null);

  useEffect(() => {
    if (show) setTimeout(() => firstInputRef.current?.focus(), 100);
  }, [show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const save = () => {
    onSave?.(form);
    setForm(defaultForm);
  };

  const close = () => {
    setForm(defaultForm);
    onHide?.();
  };

  return (
    <Modal
      className="assignment-popup"
      show={show}
      onHide={close}
      centered
      backdrop
      keyboard
    >
      <Modal.Header closeButton></Modal.Header>
      <Modal.Body>
        <h4>Add New Assignment</h4>
        <p>Create a new assignment to track your progress.</p>
        <TNInput
          label="Title"
          name="title"
          placeholder="Enter title"
          value={form.title}
          onChange={handleChange}
          ref={firstInputRef}
        />
        <TNInput
          label="Description (Optional)"
          name="description"
          type="textarea"
          placeholder="Additional assignment details..."
          value={form.description}
          onChange={handleChange}
          rows={3}
        />
        <Row>
          <Col md={6}>
            <TNInput
              label="Type"
              name="type"
              type="select"
              value={form.type}
              onChange={handleChange}
              options={[
                { value: "assignment", label: "Assignment" },
                { value: "exam", label: "Exam" },
                { value: "quiz", label: "Quiz" },
                { value: "project", label: "Project" },
                { value: "participation", label: "Participation" },
              ]}
            />
          </Col>
          <Col md={6}>
            <TNInput
              label="Due Date"
              name="dueDate"
              type="date"
              value={form.dueDate}
              onChange={handleChange}
              placeholder="mm/dd/yyyy, --:--"
            />
          </Col>
          <Col md={6} className="mb-0">
            <TNInput
              label="Weight (%)"
              name="weight"
              type="number"
              step="any"
              placeholder="e.g., 15"
              value={form.weight}
              onChange={handleChange}
            />
          </Col>
          <Col md={6} className="mb-0">
            <TNInput
              label="Points Possible"
              name="points"
              placeholder="e.g., 100"
              value={form.points}
              onChange={handleChange}
            />
          </Col>
        </Row>

        <div className="cancel-add-btn d-flex justify-content-end">
          <Button
            variant="light"
            onClick={close}
            aria-label="Cancel adding assignment"
          >
            Cancel
          </Button>
          <Button variant="btns" onClick={save} aria-label="Add assignment">
            Add Assignment
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default TaskModal;
