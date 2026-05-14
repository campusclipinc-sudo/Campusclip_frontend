import React, { useState, useMemo } from "react";
import { useDropzone } from "react-dropzone";
import { Form } from "react-bootstrap";

const TabKeys = {
  Upload: "upload",
  Paste: "paste",
};

const MultiClassSlot = ({
  index,
  classData,
  onUpdate,
  onDropFiles,
  onAutoSubmit,
  disabled = false,
}) => {
  const [activeTab, setActiveTab] = useState(TabKeys.Upload);
  const file = classData?.file || null;
  const pastedText = classData?.pastedText || "";

  // Auto-submit when file or text is added
  React.useEffect(() => {
    if (!disabled && !classData?.isSubmitting && !classData?.submitted) {
      if (file) {
        setTimeout(() => onAutoSubmit?.(index), 300);
      } else if (pastedText?.trim().length > 0) {
        setTimeout(() => onAutoSubmit?.(index), 300);
      }
    }
  }, [file, pastedText, index, disabled, classData?.isSubmitting, classData?.submitted, onAutoSubmit]);

  const onDrop = (acceptedFiles) => {
    if (disabled) return;
    if (acceptedFiles?.length > 0) {
      onDropFiles?.(acceptedFiles, index);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [],
      "image/png": [],
      "image/jpeg": [],
      "application/msword": [],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [],
    },
    multiple: true,
    maxFiles: 1,
    disabled: disabled || activeTab !== TabKeys.Upload,
  });

  const lockedMethod = useMemo(() => {
    if (file) return TabKeys.Upload;
    if (pastedText.trim().length > 0) return TabKeys.Paste;
    return null;
  }, [file, pastedText]);

  const handleTabChange = (tab) => {
    if (lockedMethod && tab !== lockedMethod) return;
    if (tab === activeTab) return;
    setActiveTab(tab);
  };

  const clearSelection = () => {
    onUpdate({ file: null, pastedText: "", error: null });
    setActiveTab(TabKeys.Upload);
  };

  return (
    <div
      className={`cc-class-slot-container ${disabled ? "disabled" : ""} ${
        lockedMethod ? "method-locked" : ""
      }`}
    >
      {/* Tabs */}
      <div className="slot-tabs">
        <button
          type="button"
          className={`tab-btn ${activeTab === TabKeys.Upload ? "active" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            handleTabChange(TabKeys.Upload);
          }}
          disabled={disabled || (lockedMethod && lockedMethod !== TabKeys.Upload)}
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
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" x2="12" y1="3" y2="15"></line>
          </svg>
          Upload
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === TabKeys.Paste ? "active" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            handleTabChange(TabKeys.Paste);
          }}
          disabled={disabled || (lockedMethod && lockedMethod !== TabKeys.Paste)}
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
            <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path>
            <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
            <path d="M10 9H8"></path>
            <path d="M16 13H8"></path>
            <path d="M16 17H8"></path>
          </svg>
          Paste Text
        </button>
      </div>

      {/* Lock method indicator */}
      {lockedMethod && (
        <div className="method-lock-info">
          <small>
            {lockedMethod === TabKeys.Upload ? "Upload mode" : "Paste mode"} selected
          </small>
          <button
            type="button"
            className="btn-change-method"
            onClick={clearSelection}
            disabled={disabled}
          >
            Change
          </button>
        </div>
      )}

      {/* Upload Tab Content */}
      {activeTab === TabKeys.Upload && (
        <div
          {...getRootProps()}
          className={`cc-class-slot ${isDragActive ? "drag-over" : ""} ${
            disabled ? "disabled" : ""
          } ${file ? "has-file" : "empty"}`}
          aria-disabled={disabled}
        >
          <input {...getInputProps({ multiple: true })} />
          <div className="slot-content">
            <div className="upload-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" x2="12" y1="3" y2="15"></line>
              </svg>
            </div>

            <h5>Class {index + 1}</h5>
            <p className="hint">
              {isDragActive ? "Drop the file here" : "Drag & drop your syllabus"}
            </p>
            <small className="text-muted">or click to browse</small>
            <small className="formats">PDF, PNG, JPEG, DOC</small>

            {file && (
              <div className="selected-file">
                <span className="file-name" title={file.name}>
                  {file.name}
                </span>
                <button
                  type="button"
                  className="remove-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdate({ file: null, error: null });
                  }}
                  disabled={disabled}
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Paste Tab Content */}
      {activeTab === TabKeys.Paste && (
        <div className="cc-class-slot paste-mode">
          <div className="slot-content">
            <h5>Class {index + 1}</h5>
            <Form.Group className="mt-3">
              <Form.Control
                as="textarea"
                rows={5}
                placeholder="Copy and paste your syllabus text here. Include class name, instructor, schedule, assignments, and due dates for best results..."
                value={pastedText}
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
            <small className="text-muted d-block mt-2">
              For best results, include class details, assignments, and grading info.
            </small>
          </div>
        </div>
      )}

      {/* Error Display */}
      {classData?.error && (
        <div className="slot-error">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>{classData.error}</span>
        </div>
      )}

      {/* Submission Status */}
      {classData?.isSubmitting && (
        <div className="slot-submitting">
          <div className="spinner-mini"></div>
          <span>Adding...</span>
        </div>
      )}

      {classData?.submitted && (
        <div className="slot-success">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          <span>Added successfully</span>
        </div>
      )}
    </div>
  );
};

export default MultiClassSlot;
