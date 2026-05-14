import React from "react";
import { Form } from "react-bootstrap";

const MultiClassPasteSlot = ({ index, classData, onUpdate, disabled = false }) => {
  const value = classData?.pastedText || "";

  return (
    <div className={`cc-paste-slot ${disabled ? "disabled" : ""}`}>
      <div className="paste-head">
        <h5>Class {index + 1}</h5>
      </div>

      <Form.Group className="mb-0">
        <Form.Label className="sr-only">Paste your syllabus content</Form.Label>
        <Form.Control
          as="textarea"
          rows={6}
          placeholder="Copy and paste your syllabus text here..."
          value={value}
          onChange={(e) =>
            onUpdate({
              pastedText: e.target.value,
              file: null,
              error: null,
            })
          }
          disabled={disabled}
        />
      </Form.Group>

      <div className="paste-hint">
        For best results, include class details, assignments, and grading info.
      </div>
    </div>
  );
};

export default MultiClassPasteSlot;

