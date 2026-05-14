import { useMemo, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button, Form } from "react-bootstrap";
import Tabs from "../../../component/Tabs";

const TabKeys = {
  Upload: "upload",
  Paste: "paste",
  // Manual: "manual",
};

const MultiClassForm = ({
  index,
  classData,
  onUpdate,
  disabled = false,
}) => {
  const [active, setActive] = useState(TabKeys.Upload);
  const fileInputRef = useRef(null);

  const { file, pastedText, manualForm, manualTouched } = classData;

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles?.length > 0 && !disabled) {
      onUpdate({
        ...classData,
        file: acceptedFiles[0],
      });
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [],
      "image/png": [],
      "image/jpeg": [],
      "application/msword": [],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [],
    },
    maxFiles: 1,
    disabled: disabled,
  });

  const lockMethod = useMemo(() => {
    if (file) return TabKeys.Upload;
    if (pastedText?.trim().length > 0) return TabKeys.Paste;
    // if (manualTouched) return TabKeys.Manual;
    return null;
  }, [file, pastedText, manualTouched]);

  const clearSelection = () => {
    onUpdate({
      ...classData,
      file: null,
      pastedText: "",
      manualTouched: false,
      manualForm: {
        class_name: "",
        class_code: "",
        semester: "",
        instructor_name: "",
        schedule: "",
        target_grade: "",
      },
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleManualChange = (e) => {
    const { name, value } = e.target;
    onUpdate({
      ...classData,
      manualTouched: true,
      manualForm: {
        ...manualForm,
        [name]: value,
      },
    });
  };

  const handlePasteChange = (e) => {
    onUpdate({
      ...classData,
      pastedText: e.target.value,
    });
  };

  const tabItems = [
    {
      key: TabKeys.Upload,
      label: (
        <div className="d-flex align-items-center gap-2">
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
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" x2="12" y1="3" y2="15"></line>
          </svg>
          <span>Upload</span>
        </div>
      ),
      disabled: (lockMethod && lockMethod !== TabKeys.Upload) || disabled,
    },
    {
      key: TabKeys.Paste,
      label: (
        <div className="d-flex align-items-center gap-2">
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
            <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path>
            <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
            <path d="M10 9H8"></path>
            <path d="M16 13H8"></path>
            <path d="M16 17H8"></path>
          </svg>
          <span>Paste</span>
        </div>
      ),
      disabled: (lockMethod && lockMethod !== TabKeys.Paste) || disabled,
    },
    // {
    //   key: TabKeys.Manual,
    //   label: (
    //     <div className="d-flex align-items-center gap-2">
    //       <svg
    //         xmlns="http://www.w3.org/2000/svg"
    //         width="20"
    //         height="20"
    //         viewBox="0 0 24 24"
    //         fill="none"
    //         stroke="currentColor"
    //         strokeWidth="2"
    //         strokeLinecap="round"
    //         strokeLinejoin="round"
    //       >
    //         <circle cx="12" cy="12" r="10"></circle>
    //         <path d="M8 12h8"></path>
    //         <path d="M12 8v8"></path>
    //       </svg>
    //       <span>Manual</span>
    //     </div>
    //   ),
    //   disabled: (lockMethod && lockMethod !== TabKeys.Manual) || disabled,
    // },
  ];

  return (
    <div className="multi-class-form">
      <div className="class-form-header">
        <h6 className="class-number">Class {index + 1}</h6>
        {classData.isValid && !classData.isSubmitting && !classData.submitted && (
          <span className="validation-status valid">
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
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            Ready
          </span>
        )}
        {classData.isSubmitting && (
          <span className="validation-status submitting">
            <span className="spinner-border spinner-border-sm me-1" role="status">
              <span className="visually-hidden">Loading...</span>
            </span>
            Uploading...
          </span>
        )}
        {classData.submitted && (
          <span className="validation-status success">
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
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            Added
          </span>
        )}
        {classData.error && (
          <span className="validation-status error">
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
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            Error
          </span>
        )}
      </div>

      {classData.error && (
        <div className="alert alert-danger py-2 mb-3" role="alert">
          {classData.error}
        </div>
      )}

      <Tabs
        items={tabItems}
        activeKey={active}
        onSelect={(key) => {
          if (!lockMethod || key === lockMethod) {
            if (key !== active) clearSelection();
            setActive(key);
          }
        }}
      />

      {lockMethod && (
        <div className="alert alert-info py-2 mb-3" role="status">
          You have selected the{" "}
          {lockMethod === TabKeys.Upload
            ? "Upload"
            : lockMethod === TabKeys.Paste
              ? "Paste Text"
              : null}{" "}
          method.
          <button
            className="btn btn-link ms-2 p-0 align-baseline"
            onClick={clearSelection}
            disabled={disabled}
            aria-label="Clear selection and change method"
          >
            Change method
          </button>
        </div>
      )}

      {active === TabKeys.Upload && (
        <div
          {...getRootProps()}
          className={`cc-dropzone ${isDragActive ? "active" : ""} ${
            disabled ? "disabled" : ""
          }`}
          style={{ borderColor: isDragActive ? "#4f46e5" : undefined }}
        >
          <input {...getInputProps()} ref={fileInputRef} />
          <div className="icon">
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
              <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path>
              <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
              <path d="M12 12v6"></path>
              <path d="m15 15-3-3-3 3"></path>
            </svg>
          </div>
          <h4>
            {isDragActive
              ? "Drop the file here"
              : "Drag and drop your syllabus here"}
          </h4>
          <div className="subtitle">Or click to browse files</div>
          <div className="hint">Supports PDF, PNG, JPEG, DOC, DOCX</div>

          {file && (
            <div className="mt-2 text-center">
              <span className="badge bg-secondary">{file.name}</span>
              <button
                className="btn btn-link btn-sm text-danger ms-2 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdate({
                    ...classData,
                    file: null,
                  });
                }}
                disabled={disabled}
              >
                Remove
              </button>
            </div>
          )}
        </div>
      )}

      {active === TabKeys.Paste && (
        <div>
          <Form.Group className="past-content">
            <Form.Label>Paste your syllabus content</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              placeholder="Copy and paste your syllabus text here..."
              value={pastedText || ""}
              onChange={handlePasteChange}
              disabled={disabled || (lockMethod && lockMethod !== TabKeys.Paste)}
            />
          </Form.Group>
          <div className="small mb-3">
            For best results, include class details, assignments, and grading
            information.
          </div>
        </div>
      )}

      {/* {active === TabKeys.Manual && (
        <Form className="manual-form">
          <div className="row g-3">
            <div className="col-md-12">
              <div className="form-group">
                <Form.Group>
                  <Form.Label>Class Name *</Form.Label>
                  <Form.Control
                    name="class_name"
                    placeholder="e.g., Introduction to Business"
                    value={manualForm?.class_name || ""}
                    onChange={handleManualChange}
                    disabled={disabled || (lockMethod && lockMethod !== TabKeys.Manual)}
                  />
                </Form.Group>
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-group">
                <Form.Group>
                  <Form.Label>Class Code *</Form.Label>
                  <Form.Control
                    name="class_code"
                    placeholder="e.g., Business 1220E"
                    value={manualForm?.class_code || ""}
                    onChange={handleManualChange}
                    disabled={disabled || (lockMethod && lockMethod !== TabKeys.Manual)}
                  />
                </Form.Group>
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-group">
                <Form.Group>
                  <Form.Label>Semester *</Form.Label>
                  <Form.Control
                    name="semester"
                    placeholder="e.g., Fall/Winter 2024/25"
                    value={manualForm?.semester || ""}
                    onChange={handleManualChange}
                    disabled={disabled || (lockMethod && lockMethod !== TabKeys.Manual)}
                  />
                </Form.Group>
              </div>
            </div>
            <div className="col-12">
              <div className="form-group">
                <Form.Group>
                  <Form.Label>Instructor *</Form.Label>
                  <Form.Control
                    name="instructor_name"
                    placeholder="e.g., Joe Gilvesy"
                    value={manualForm?.instructor_name || ""}
                    onChange={handleManualChange}
                    disabled={disabled || (lockMethod && lockMethod !== TabKeys.Manual)}
                  />
                </Form.Group>
              </div>
            </div>
            <div className="col-12">
              <div className="form-group">
                <Form.Group>
                  <Form.Label>Schedule</Form.Label>
                  <Form.Control
                    name="schedule"
                    placeholder="e.g., 3:30pm – 5:00pm, Mon, Wed"
                    value={manualForm?.schedule || ""}
                    onChange={handleManualChange}
                    disabled={disabled || (lockMethod && lockMethod !== TabKeys.Manual)}
                  />
                </Form.Group>
              </div>
            </div>
            <div className="col-12">
              <div className="form-group">
                <Form.Group>
                  <Form.Label>Target Grade (Optional)</Form.Label>
                  <Form.Control
                    name="target_grade"
                    placeholder="e.g., 85"
                    value={manualForm?.target_grade || ""}
                    onChange={handleManualChange}
                    disabled={disabled || (lockMethod && lockMethod !== TabKeys.Manual)}
                  />
                </Form.Group>
              </div>
            </div>
          </div>
        </Form>
      )} */}
    </div>
  );
};

export default MultiClassForm;
