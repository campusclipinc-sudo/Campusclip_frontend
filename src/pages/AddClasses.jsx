import React, { useState, useRef, useCallback, useEffect } from "react";
import { Button, Spinner, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getAccessToken,
  getActiveUserDetails,
  loginSuccess,
} from "../store/userSlice";
import { useCompleteClassOnboarding } from "../hooks/index";
import { useUpdateTargetGrade, useDeleteClass } from "../hooks/useRQclass";
import ClassService from "../api/classService";
import { toast } from "react-toastify";
import logo from "../assets/EmailLogo.png";
import "../scss/AddClasses.scss";
import OnboardingScheduleModal from "./class/components/OnboardingScheduleModal";

const TabKeys = {
  Upload: "upload",
  Paste: "paste",
};

const ClassSlot = ({
  index,
  onFileSelect,
  onTextPaste,
  onTextChange,
  file,
  pastedText,
  activeTab,
  onTabChange,
  isUploading,
  uploadedClass,
  onRemove,
  targetGrade,
  onTargetGradeChange,
  onOpenScheduleModal,
}) => {
  const fileInputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [localTargetGrade, setLocalTargetGrade] = useState(targetGrade || "");
  const [localPastedText, setLocalPastedText] = useState(pastedText || "");

  // Sync local pasted text with prop when it changes
  useEffect(() => {
    if (pastedText !== undefined) {
      setLocalPastedText(pastedText || "");
    }
  }, [pastedText]);

  const handleDragOver = (e) => {
    if (activeTab !== TabKeys.Upload || uploadedClass || isUploading) return;
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (activeTab !== TabKeys.Upload) return;
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      onFileSelect(index, droppedFile);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      onFileSelect(index, selectedFile);
    }
  };

  const handleClick = () => {
    if (!uploadedClass && !isUploading && activeTab === TabKeys.Upload) {
      fileInputRef.current?.click();
    }
  };

  const handlePasteTextChange = (e) => {
    const value = e.target.value;
    setLocalPastedText(value);
    // Update parent state to preserve text when switching tabs
    if (onTextChange) {
      onTextChange(index, value);
    }
  };

  const handlePasteSubmit = () => {
    if (localPastedText.trim() && onTextPaste) {
      onTextPaste(index, localPastedText);
    }
  };

  const handleTargetGradeChange = (e) => {
    const value = e.target.value;
    setLocalTargetGrade(value);
    if (onTargetGradeChange && uploadedClass?.id) {
      const grade = value.trim() === "" ? null : (isNaN(Number(value)) ? null : Number(value));
      onTargetGradeChange(uploadedClass.id, grade);
    }
  };

  if (uploadedClass) {
    return (
      <div className="class-slot uploaded">
        <div className="slot-content">
          <div className="success-icon">
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
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <h5 className="class-name">
            {uploadedClass.class_name || `Class ${index + 1}`}
          </h5>
          <p className="class-code">{uploadedClass.class_code || ""}</p>
          
          {/* Target Grade Input */}
          <div className="target-grade-input mt-2">
            <label htmlFor={`target-grade-${index}`} className="target-grade-label">
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
                style={{ marginRight: "6px", verticalAlign: "middle" }}
              >
                <circle cx="12" cy="12" r="10"></circle>
                <circle cx="12" cy="12" r="6"></circle>
                <circle cx="12" cy="12" r="2"></circle>
              </svg>
              Target Grade (%)
            </label>
            <input
              type="number"
              id={`target-grade-${index}`}
              className="form-control form-control-sm target-grade-field"
              min="0"
              max="100"
              value={localTargetGrade}
              onChange={handleTargetGradeChange}
              placeholder="e.g., 95"
            />
            <small className="target-grade-hint">
              Optional: Set your target grade
            </small>
          </div>

          {/* Schedule Button */}
          <button
            type="button"
            className="schedule-btn w-100 mt-2"
            onClick={() => onOpenScheduleModal && onOpenScheduleModal(index, uploadedClass.id)}
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
              style={{ marginRight: "6px", verticalAlign: "middle" }}
            >
              <rect x="3" y="4" width="18" height="18" rx="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            View Schedule
          </button>

          <Button
            variant="link"
            className="remove-btn"
            onClick={() => onRemove(index)}
          >
            Remove
          </Button>
        </div>
      </div>
    );
  }

  if (isUploading) {
    return (
      <div className="class-slot uploading">
        <div className="slot-content">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Extracting class details...</p>
          <small className="text-muted">AI is analyzing your syllabus</small>
        </div>
      </div>
    );
  }

  // Tab buttons for Upload/Paste
  const renderTabs = () => (
    <div className="slot-tabs">
      <button
        type="button"
        className={`tab-btn ${activeTab === TabKeys.Upload ? "active" : ""}`}
        onClick={(e) => {
          e.stopPropagation();
          if (onTabChange) onTabChange(index, TabKeys.Upload);
        }}
        disabled={!!uploadedClass}
      >
        Upload
      </button>
      <button
        type="button"
        className={`tab-btn ${activeTab === TabKeys.Paste ? "active" : ""}`}
        onClick={(e) => {
          e.stopPropagation();
          if (onTabChange) onTabChange(index, TabKeys.Paste);
        }}
        disabled={!!uploadedClass}
      >
        Paste Text
      </button>
    </div>
  );

  if (activeTab === TabKeys.Paste) {
    return (
      <div className="class-slot paste-mode">
        <div className="slot-content">
          {renderTabs()}
          <div className="paste-content">
            <h5>Class {index + 1}</h5>
            <Form.Group className="mt-3">
              <Form.Control
                as="textarea"
                rows={6}
                placeholder="Copy and paste your syllabus text here. Include class name, instructor, schedule, assignments, and due dates for best results..."
                value={localPastedText}
                onChange={handlePasteTextChange}
                disabled={!!uploadedClass || isUploading}
                style={{
                  background: "#f8fbff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  resize: "vertical",
                }}
              />
            </Form.Group>
            <small className="text-muted d-block mt-2" style={{ fontSize: "0.75rem" }}>
              For best results, include class details, assignments, and grading information.
            </small>
            <Button
              variant="primary"
              size="sm"
              className="mt-3 w-100"
              onClick={handlePasteSubmit}
              disabled={!localPastedText.trim() || !!uploadedClass || isUploading}
            >
              Extract Class Details
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`class-slot empty ${isDragOver ? "drag-over" : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <div className="slot-content">
        {renderTabs()}
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
        <p className="hint">Drag & drop your syllabus here</p>
        <small className="text-muted">or click to browse</small>
        <small className="formats">PDF, PNG, JPEG, DOC</small>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
          style={{ display: "none" }}
        />
      </div>
    </div>
  );
};

const AddClasses = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userData = useSelector(getActiveUserDetails);
  const accessToken = useSelector(getAccessToken);
  const classCount = userData?.onboarding_class_count || 3;

  const [uploadingSlots, setUploadingSlots] = useState({});
  const [uploadedClasses, setUploadedClasses] = useState({});
  const [files, setFiles] = useState({});
  const [pastedTexts, setPastedTexts] = useState({}); // Map of index -> pasted text
  const [activeTabs, setActiveTabs] = useState({}); // Map of index -> active tab (Upload/Paste)
  const [targetGrades, setTargetGrades] = useState({}); // Map of class_id -> target_grade
  const [allUploadedClassIds, setAllUploadedClassIds] = useState(new Set()); // Track all classes that were ever uploaded
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedClassForSchedule, setSelectedClassForSchedule] = useState(null);

  const updateTargetGradeMutation = useUpdateTargetGrade();
  const deleteClassMutation = useDeleteClass();
  
  const { mutate: completeOnboarding, isLoading: isCompleting } =
    useCompleteClassOnboarding((res) => {
      const updatedUserData = {
        ...userData,
        classes_onboarding_completed: true,
      };

      dispatch(
        loginSuccess({
          userData: updatedUserData,
          isLogin: true,
          accessToken: accessToken,
        }),
      );

      navigate("/dashboard");
    });

  const handleFileSelect = useCallback(async (index, file) => {
    setFiles((prev) => ({ ...prev, [index]: file }));
    setUploadingSlots((prev) => ({ ...prev, [index]: true }));

    try {
      const res = await ClassService.uploadClass({
        file,
        extra: { uploadType: "Files" },
      });
      setUploadingSlots((prev) => ({ ...prev, [index]: false }));
      setUploadedClasses((prev) => ({
        ...prev,
        [index]: res.data,
      }));
      // Track this class ID as uploaded
      if (res.data?.id) {
        setAllUploadedClassIds((prev) => new Set([...prev, res.data.id]));
      }
    } catch (err) {
      setUploadingSlots((prev) => ({ ...prev, [index]: false }));
      setFiles((prev) => ({ ...prev, [index]: null }));
      toast.error(err?.response?.data?.message || "Failed to upload class");
    }
  }, []);

  const handleTextPaste = useCallback(async (index, text) => {
    if (!text || !text.trim()) {
      toast.warning("Please paste some syllabus text");
      return;
    }

    setPastedTexts((prev) => ({ ...prev, [index]: text }));
    setUploadingSlots((prev) => ({ ...prev, [index]: true }));

    try {
      const res = await ClassService.uploadClass({
        file: null,
        extra: { uploadType: "Text", classroomText: text },
      });
      setUploadingSlots((prev) => ({ ...prev, [index]: false }));
      setUploadedClasses((prev) => ({
        ...prev,
        [index]: res.data,
      }));
      // Track this class ID as uploaded
      if (res.data?.id) {
        setAllUploadedClassIds((prev) => new Set([...prev, res.data.id]));
      }
    } catch (err) {
      setUploadingSlots((prev) => ({ ...prev, [index]: false }));
      setPastedTexts((prev) => {
        const newTexts = { ...prev };
        delete newTexts[index];
        return newTexts;
      });
      toast.error(err?.response?.data?.message || "Failed to extract class from text");
    }
  }, []);

  const handleTabChange = (index, tab) => {
    setActiveTabs((prev) => ({ ...prev, [index]: tab }));
  };

  const handleTextChange = (index, text) => {
    setPastedTexts((prev) => ({ ...prev, [index]: text }));
  };

  const handleRemove = (index) => {
    const classToRemove = uploadedClasses[index];
    if (classToRemove?.id) {
      setTargetGrades((prev) => {
        const newGrades = { ...prev };
        delete newGrades[classToRemove.id];
        return newGrades;
      });
    }
    setUploadedClasses((prev) => {
      const newClasses = { ...prev };
      delete newClasses[index];
      return newClasses;
    });
    setFiles((prev) => {
      const newFiles = { ...prev };
      delete newFiles[index];
      return newFiles;
    });
    setPastedTexts((prev) => {
      const newTexts = { ...prev };
      delete newTexts[index];
      return newTexts;
    });
  };

  const handleTargetGradeChange = (classId, targetGrade) => {
    setTargetGrades((prev) => ({
      ...prev,
      [classId]: targetGrade,
    }));
  };

  const handleOpenScheduleModal = (index, classId) => {
    setSelectedClassForSchedule({ index, classId });
    setShowScheduleModal(true);
  };

  const handleCloseScheduleModal = () => {
    setShowScheduleModal(false);
    setSelectedClassForSchedule(null);
  };

  const handleComplete = async () => {
    // Get current class IDs that are still in the UI
    const currentClassIds = new Set(
      Object.values(uploadedClasses)
        .map((cls) => cls?.id)
        .filter(Boolean)
    );

    // Find classes that were uploaded but are no longer in the UI (removed)
    const classesToDelete = Array.from(allUploadedClassIds).filter(
      (classId) => !currentClassIds.has(classId)
    );

    // Delete removed classes from database
    if (classesToDelete.length > 0) {
      const deletePromises = classesToDelete.map((classId) =>
        deleteClassMutation.mutateAsync({ id: classId }).catch((err) => {
          console.error(`Failed to delete class ${classId}:`, err);
          // Don't block onboarding if deletion fails
        })
      );
      await Promise.allSettled(deletePromises);
    }

    // Update target grades for all classes that have them set
    const targetGradePromises = Object.entries(targetGrades)
      .filter(([classId, grade]) => grade != null && grade !== "" && !isNaN(Number(grade)) && Number(grade) >= 0 && Number(grade) <= 100)
      .map(([classId, grade]) =>
        updateTargetGradeMutation.mutateAsync({
          class_id: classId,
          target_grade: Number(grade),
        }).catch((err) => {
          console.error(`Failed to update target grade for class ${classId}:`, err);
          // Don't block onboarding if target grade update fails
        })
      );

    // Wait for all target grade updates to complete (or fail)
    if (targetGradePromises.length > 0) {
      await Promise.allSettled(targetGradePromises);
    }

    // Then complete onboarding
    completeOnboarding();
  };

  const handleSkip = () => {
    completeOnboarding({ skip: true });
  };

  const uploadedCount = Object.keys(uploadedClasses).length;
  const isAnyUploading = Object.values(uploadingSlots).some((v) => v);

  return (
    <div className="add-classes-page" role="main">
      <div className="add-classes-wrap">
        <div className="header-section">
          <img src={logo} alt="CampusClip" className="brand-logo" />
          <h2>Add Your Classes</h2>
          <p>
            Upload your syllabus for each class and we'll automatically extract
            all the details using AI.
          </p>
          <div className="progress-indicator">
            <span className="uploaded-count">{uploadedCount}</span> of{" "}
            <span className="total-count">{classCount}</span> classes added
          </div>
        </div>

        <div className="class-slots-grid">
          {Array.from({ length: classCount }).map((_, index) => {
            const uploadedClass = uploadedClasses[index];
            const classId = uploadedClass?.id;
            return (
              <ClassSlot
                key={index}
                index={index}
                file={files[index]}
                pastedText={pastedTexts[index]}
                activeTab={activeTabs[index] || TabKeys.Upload}
                onTabChange={handleTabChange}
                isUploading={uploadingSlots[index]}
                uploadedClass={uploadedClass}
                onFileSelect={handleFileSelect}
                onTextPaste={handleTextPaste}
                onTextChange={handleTextChange}
                onRemove={handleRemove}
                targetGrade={classId ? targetGrades[classId] : null}
                onTargetGradeChange={handleTargetGradeChange}
                onOpenScheduleModal={handleOpenScheduleModal}
              />
            );
          })}
        </div>

        <div className="actions-section">
          <Button
            variant="primary"
            className="complete-btn"
            onClick={handleComplete}
            disabled={isAnyUploading || isCompleting || updateTargetGradeMutation.isPending || deleteClassMutation.isPending}
          >
            {(isCompleting || updateTargetGradeMutation.isPending || deleteClassMutation.isPending) ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                {deleteClassMutation.isPending ? "Removing classes..." : updateTargetGradeMutation.isPending ? "Saving target grades..." : "Completing..."}
              </>
            ) : uploadedCount > 0 ? (
              `Continue with ${uploadedCount} class${uploadedCount > 1 ? "es" : ""}`
            ) : (
              "Continue to Dashboard"
            )}
          </Button>

          <Button
            variant="link"
            className="skip-btn"
            onClick={handleSkip}
            disabled={isAnyUploading || isCompleting}
          >
            Skip for now
          </Button>
        </div>

        <div className="help-text">
          <p>You can always add more classes later from your dashboard.</p>
        </div>
      </div>

      {selectedClassForSchedule && (
        <OnboardingScheduleModal
          show={showScheduleModal}
          onHide={handleCloseScheduleModal}
          classId={selectedClassForSchedule.classId}
          className={uploadedClasses[selectedClassForSchedule.index]?.class_name || "Class"}
        />
      )}
    </div>
  );
};

export default AddClasses;
