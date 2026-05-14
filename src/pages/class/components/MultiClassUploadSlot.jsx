import React from "react";
import { useDropzone } from "react-dropzone";

const MultiClassUploadSlot = ({
  index,
  classData,
  onUpdate,
  onDropFiles,
  disabled = false,
}) => {
  const onDrop = (acceptedFiles) => {
    if (disabled) return;
    if (acceptedFiles?.length > 0) onDropFiles?.(acceptedFiles, index);
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
    maxFiles: 5,
    disabled,
  });

  const file = classData?.file || null;

  return (
    <div
      {...getRootProps()}
      className={`cc-class-slot ${isDragActive ? "drag-over" : ""} ${
        disabled ? "disabled" : ""
      } ${file ? "has-file" : "empty"}`}
      aria-disabled={disabled}
    >
      {/* IMPORTANT: don't override the input ref from react-dropzone; it breaks click-to-open */}
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
          {isDragActive ? "Drop the file here" : "Drag & drop your syllabus here"}
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
  );
};

export default MultiClassUploadSlot;

