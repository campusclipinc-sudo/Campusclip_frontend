import { useMemo, useRef, useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button, Form, Modal, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Tabs from "../../component/Tabs";
import TNInput from "../../component/TNInput";
import { useListClasses, useUploadClass } from "../../hooks/index";
import JoinClassSuccessModal from "../../components/JoinClassSuccessModal";
import MultiClassSlot from "./components/MultiClassSlot";
import ClassService from "../../api/classService";
import "../../scss/class.scss";

const TabKeys = {
  Upload: "upload",
  Paste: "paste",
};

const AddClassModal = ({ show, onHide }) => {
  const [classCount, setClassCount] = useState(1);
  const [classes, setClasses] = useState([]);
  const [isSubmittingAll, setIsSubmittingAll] = useState(false);
  const [submissionProgress, setSubmissionProgress] = useState({
    current: 0,
    total: 0,
  });

  // Legacy single-class state (for backward compatibility)
  const [active, setActive] = useState(TabKeys.Upload);
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);
  const [pastedText, setPastedText] = useState("");
  const [manualTouched, setManualTouched] = useState(false);
  const [manualForm, setManualForm] = useState({
    class_name: "",
    class_code: "",
    semester: "",
    instructor_name: "",
    schedule: "",
    target_grade: "",
  });
  const [showEnrollmentSuccess, setShowEnrollmentSuccess] = useState(false);
  const [enrolledClassData, setEnrolledClassData] = useState(null);
  const navigate = useNavigate();
  const { refetch } = useListClasses();

  // Initialize classes array when classCount changes
  useEffect(() => {
    if (classCount > 0) {
      const initialClasses = Array.from({ length: classCount }, (_, index) => ({
        index,
        file: null,
        pastedText: "",
        manualForm: {
          class_name: "",
          class_code: "",
          semester: "",
          instructor_name: "",
          schedule: "",
          target_grade: "",
        },
        manualTouched: false,
        activeMethod: null,
        isValid: false,
        isSubmitting: false,
        submitted: false,
        error: null,
      }));
      setClasses(initialClasses);
    }
  }, [classCount]);

  // Reset state when modal closes
  useEffect(() => {
    if (!show) {
      setClassCount(1);
      setClasses([]);
      setIsSubmittingAll(false);
      setSubmissionProgress({ current: 0, total: 0 });
      // Reset legacy state
      setFile(null);
      setPastedText("");
      setManualTouched(false);
      setManualForm({
        class_name: "",
        class_code: "",
        semester: "",
        instructor_name: "",
        schedule: "",
        target_grade: "",
      });
    }
  }, [show]);

  // Validation function for a single class
  const validateClass = useCallback((classData) => {
    if (classData.file) {
      return true; // Upload method - file is selected
    }
    if (classData.pastedText?.trim().length > 0) {
      return true; // Paste method - text is entered
    }
    // if (classData.manualTouched) {
    //   // Manual method - check required fields
    //   const { class_name, class_code, semester, instructor_name } =
    //     classData.manualForm || {};
    //   return (
    //     class_name?.trim() &&
    //     class_code?.trim() &&
    //     semester?.trim() &&
    //     instructor_name?.trim()
    //   );
    // }
    return false;
  }, []);

  // Update validation status for all classes when class data changes
  useEffect(() => {
    if (classes.length > 0) {
      setClasses((prev) =>
        prev.map((cls) => ({
          ...cls,
          isValid: validateClass(cls),
        }))
      );
    }
  }, []); // Validation happens in updateClass function

  // Check if all classes are valid (each class must have either file or pasted text)
  const allMultiClassesValid = useMemo(() => {
    if (classes.length === 0) return false;
    return classes.every((cls) => validateClass(cls));
  }, [classes, validateClass]);

  // Auto-submit single class when file or text is added
  useEffect(() => {
    if (classCount === 1 && (file || pastedText.trim())) {
      const submitSingleClass = async () => {
        try {
          let payload = { file: null, extra: {} };
          if (file) {
            payload = { file, extra: { uploadType: "Files" } };
          } else if (pastedText.trim()) {
            payload = {
              file: null,
              extra: { uploadType: "Text", classroomText: pastedText },
            };
          }

          const res = await ClassService.uploadClass(payload);
          const classData = res.data;

          if (classData?._enrolled) {
            setEnrolledClassData({
              class_name: classData.class_name,
              students_count: 0,
              assignments_count: classData.assignments?.length || 0,
            });
            setShowEnrollmentSuccess(true);
          } else {
            toast.success(
              `Successfully added ${classData?.class_name || "class"}!`
            );
            setTimeout(() => {
              onHide && onHide();
              navigate("/dashboard");
            }, 1200);
          }

          refetch();
          setFile(null);
          setPastedText("");
        } catch (error) {
          const errorMessage =
            error?.response?.data?.message || "Failed to add class";
          toast.error(errorMessage);
          setFile(null);
          setPastedText("");
        }
      };

      const timer = setTimeout(submitSingleClass, 500);
      return () => clearTimeout(timer);
    }
  }, [file, pastedText, classCount, onHide, navigate, refetch]);

  // Single class upload mutation (kept for backward compatibility)
  const { mutate: uploadClass, isPending } = useUploadClass((res) => {
    const classData = res.data;

    if (classData?._enrolled) {
      setEnrolledClassData({
        class_name: classData.class_name,
        students_count: 0,
        assignments_count: classData.assignments?.length || 0,
      });
      setShowEnrollmentSuccess(true);
      onHide && onHide();
    } else {
      navigate("/dashboard");
      onHide && onHide();
    }

    refetch();
    setFile(null);
    setPastedText("");
    setManualTouched(false);
  });

  // Handle class count change
  const handleClassCountChange = (e) => {
    const value = parseInt(e.target.value) || 1;
    const newCount = Math.min(Math.max(value, 1), 5);
    setClassCount(newCount);
  };

  // Update a specific class in the classes array
  const updateClass = useCallback((index, updates) => {
    setClasses((prev) => {
      const updated = prev.map((cls, i) => {
        if (i === index) {
          const newClass = { ...cls, ...updates };
          // Re-validate after update
          newClass.isValid = validateClass(newClass);
          return newClass;
        }
        return cls;
      });
      return updated;
    });
  }, [validateClass]);

  // Submit a single class
  const submitSingleClass = useCallback(
    async (classIndex) => {
      if (classIndex < 0 || classIndex >= classes.length) return;

      const classData = classes[classIndex];
      if (classData?.isSubmitting || classData?.submitted) return;

      updateClass(classIndex, { isSubmitting: true, error: null });

      try {
        let payload = { file: null, extra: {} };

        if (classData.file) {
          payload = { file: classData.file, extra: { uploadType: "Files" } };
        } else if (classData.pastedText?.trim()) {
          payload = {
            file: null,
            extra: { uploadType: "Text", classroomText: classData.pastedText },
          };
        } else {
          return;
        }

        const res = await ClassService.uploadClass(payload);

        if (res.data?._enrolled) {
          setEnrolledClassData({
            class_name: res.data.class_name,
            students_count: 0,
            assignments_count: res.data.assignments?.length || 0,
          });
          setShowEnrollmentSuccess(true);
        }

        updateClass(classIndex, {
          isSubmitting: false,
          submitted: true,
          error: null,
        });

        refetch();
        toast.success(`Successfully added ${res.data?.class_name || "class"}!`);
      } catch (error) {
        const errorMessage =
          error?.response?.data?.message || "Failed to add class";
        updateClass(classIndex, {
          isSubmitting: false,
          submitted: false,
          error: errorMessage,
        });
        toast.error(errorMessage);
      }
    },
    [classes, updateClass, refetch]
  );

  // Sequential submission of all classes
  const submitAllClasses = useCallback(async () => {
    if (!allMultiClassesValid || isSubmittingAll) return;

    setIsSubmittingAll(true);
    setSubmissionProgress({ current: 0, total: classes.length });

    let successCount = 0;
    let failureCount = 0;
    const enrollmentClasses = [];

    for (let i = 0; i < classes.length; i++) {
      const classData = classes[i];
      if (classData?.submitted) {
        successCount++;
        continue;
      }

      setSubmissionProgress({ current: i + 1, total: classes.length });
      updateClass(i, { isSubmitting: true, error: null });

      try {
        let payload = { file: null, extra: {} };

        if (classData.file) {
          payload = { file: classData.file, extra: { uploadType: "Files" } };
        } else if (classData.pastedText?.trim()) {
          payload = {
            file: null,
            extra: { uploadType: "Text", classroomText: classData.pastedText },
          };
        } else {
          continue;
        }

        const res = await ClassService.uploadClass(payload);

        if (res.data?._enrolled) {
          enrollmentClasses.push({
            class_name: res.data.class_name,
            students_count: 0,
            assignments_count: res.data.assignments?.length || 0,
          });
        }

        updateClass(i, {
          isSubmitting: false,
          submitted: true,
          error: null,
        });
        successCount++;
      } catch (error) {
        const errorMessage =
          error?.response?.data?.message || "Failed to add class";
        updateClass(i, {
          isSubmitting: false,
          submitted: false,
          error: errorMessage,
        });
        failureCount++;
      }
    }

    setIsSubmittingAll(false);
    refetch();

    if (enrollmentClasses.length > 0) {
      setEnrolledClassData(enrollmentClasses[0]);
      setShowEnrollmentSuccess(true);
    }

    if (successCount > 0 && failureCount === 0) {
      toast.success(
        `Successfully added ${successCount} class${successCount > 1 ? "es" : ""}!`
      );
      setTimeout(() => {
        onHide && onHide();
        navigate("/dashboard");
      }, 1500);
    } else if (successCount > 0 && failureCount > 0) {
      toast.warning(
        `Added ${successCount} class${successCount > 1 ? "es" : ""}, but ${failureCount} failed.`
      );
    } else if (failureCount > 0) {
      toast.error("Failed to add classes. Please try again.");
    }
  }, [allMultiClassesValid, isSubmittingAll, classes, updateClass, refetch, onHide, navigate]);


  // Distribute multiple dropped files across slots starting at startIndex
  const handleMultiUploadDropFiles = useCallback(
    (acceptedFiles = [], startIndex = 0) => {
      if (!Array.isArray(acceptedFiles) || acceptedFiles.length === 0) return;

      const remainingSlots = Math.max(classes.length - startIndex, 0);
      if (remainingSlots <= 0) return;

      if (acceptedFiles.length > remainingSlots) {
        toast.error(
          `You selected ${classes.length} class${
            classes.length > 1 ? "es" : ""
          }. You can only add ${remainingSlots} file${
            remainingSlots > 1 ? "s" : ""
          } from this box.`
        );
      }

      const filesToUse = acceptedFiles.slice(0, remainingSlots);

      // First file always goes to the drop target slot (replace)
      updateClass(startIndex, {
        file: filesToUse[0],
        pastedText: "",
        error: null,
      });

      const rest = filesToUse.slice(1);
      if (rest.length === 0) return;

      // Fill next slots: prefer empty slots first, then overwrite if needed
      const total = classes.length;
      let remaining = [...rest];

      // pass 1: fill empty slots after startIndex
      for (let i = startIndex + 1; i < total && remaining.length > 0; i++) {
        const slot = classes[i];
        if (!slot?.file) {
          const f = remaining.shift();
          updateClass(i, { file: f, pastedText: "", error: null });
        }
      }

      // pass 2: overwrite subsequent slots if still remaining
      for (let i = startIndex + 1; i < total && remaining.length > 0; i++) {
        const f = remaining.shift();
        updateClass(i, { file: f, pastedText: "", error: null });
      }
    },
    [classes, updateClass]
  );

  // Legacy single-class handlers (for backward compatibility when classCount === 1)
  const uploadFile = () => {
    if (!file) return;
    uploadClass({ file, extra: { uploadType: "Files" } });
  };

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles?.length > 0) {
      setFile(acceptedFiles[0]);
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
    disabled: isPending,
  });

  const lockMethod = useMemo(() => {
    if (file) return TabKeys.Upload;
    if (pastedText.trim().length > 0) return TabKeys.Paste;
    // if (manualTouched) return TabKeys.Manual;
    return null;
  }, [file, pastedText, manualTouched]);

  const clearSelection = () => {
    setFile(null);
    setPastedText("");
    setManualTouched(false);
    setManualForm({
      class_name: "",
      class_code: "",
      semester: "",
      instructor_name: "",
      schedule: "",
      target_grade: "",
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleManualChange = (e) => {
    const { name, value } = e.target;
    setManualTouched(true);
    setManualForm((p) => ({ ...p, [name]: value }));
  };

  const submitManual = () => {
    const payload = { ...manualForm };
    if (
      !payload.class_name ||
      !payload.class_code ||
      !payload.semester ||
      !payload.instructor_name
    ) {
      toast.error("Please fill all required fields");
      return;
    }
    uploadClass({
      file: null,
      extra: { uploadType: "Manual", userData: JSON.stringify(payload) },
    });
  };

  const tabItems = [
    {
      key: TabKeys.Upload,
      label: (
        <div className="d-flex align-items-center gap-2">
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
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" x2="12" y1="3" y2="15"></line>
          </svg>
          <span>Upload File</span>
        </div>
      ),
      disabled: lockMethod && lockMethod !== TabKeys.Upload,
    },
    {
      key: TabKeys.Paste,
      label: (
        <div className="d-flex align-items-center gap-2">
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
            <path d="M10 9H8"></path>
            <path d="M16 13H8"></path>
            <path d="M16 17H8"></path>
          </svg>
          <span>Paste Text</span>
        </div>
      ),
      disabled: lockMethod && lockMethod !== TabKeys.Paste,
    },
    // {
    //   key: TabKeys.Manual,
    //   label: (
    //     <div className="d-flex align-items-center gap-2">
    //       <svg
    //         xmlns="http://www.w3.org/2000/svg"
    //         width="24"
    //         height="24"
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
    //   disabled: lockMethod && lockMethod !== TabKeys.Manual,
    // },
  ];

  // Prevent closing during submission
  const handleModalClose = () => {
    if (isSubmittingAll) {
      const confirmed = window.confirm(
        "Classes are being added. Are you sure you want to close? Completed classes will be saved."
      );
      if (!confirmed) return;
    }
    onHide && onHide();
  };

  return (
    <>
      <Modal
        show={show}
        onHide={handleModalClose}
        centered
        className="classAddPopup"
        backdrop
      >
        <Modal.Header
          closeButton
          className="border-0 p-0 justify-content-center position-relative"
        ></Modal.Header>
        <Modal.Body>
          {/* Header with class count selector */}
          <div className="cc-modal-head-with-selector">
            <div className="cc-modal-head">
            <div className="cc-modal-icon">
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
                    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"></path>
                    <path d="M20 3v4"></path>
                    <path d="M22 5h-4"></path>
                    <path d="M4 17v2"></path>
                    <path d="M5 18H3"></path>
                  </svg>
                </div>
              <h5>Add Class{classCount > 1 ? "es" : ""}</h5>
              <p>
                {classCount > 1
                  ? `Fill in the details for ${classCount} classes below.`
                  : "Add a class with AI or enter details manually."}
              </p>
            </div>
            <div className="class-count-selector-wrapper">
              <TNInput
                type="select"
                label="Number of Classes"
                name="class_count"
                options={[
                  { value: "1", label: "1 Class" },
                  { value: "2", label: "2 Classes" },
                  { value: "3", label: "3 Classes" },
                  { value: "4", label: "4 Classes" },
                  { value: "5", label: "5 Classes" },
                ]}
                value={classCount.toString()}
                onChange={handleClassCountChange}
                error={{}}
                touched={{}}
              />
            </div>
          </div>

          {/* Multi-Class Forms */}
          {classCount > 1 && (
            <div className="multi-class-forms">
              {isSubmittingAll && (
                <div className="alert alert-info mb-3">
                  <Spinner animation="border" size="sm" className="me-2" />
                  Adding class {submissionProgress.current} of{" "}
                  {submissionProgress.total}...
                </div>
              )}

              <div className="classes-list cc-class-slots-grid">
                {classes.map((classData, index) => (
                  <MultiClassSlot
                    key={index}
                    index={index}
                    classData={classData}
                    onUpdate={(updates) => updateClass(index, updates)}
                    onDropFiles={handleMultiUploadDropFiles}
                    onAutoSubmit={submitSingleClass}
                    disabled={isSubmittingAll}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Single-Class UI (when classCount === 1) */}
          {classCount === 1 && (
            <div className="single-class-form">

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
                <div className="alert alert-info py-2" role="status">
                  You have selected the{" "}
                  {lockMethod === TabKeys.Upload
                    ? "Upload"
                    : lockMethod === TabKeys.Paste
                      ? "Paste Text"
                      : null
                      }{" "}
                  method. Other methods are disabled.
                  <button
                    className="btn btn-link ms-2 p-0 align-baseline"
                    onClick={clearSelection}
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
                    file ? "has-file" : ""
                  }`}
                  style={{ borderColor: isDragActive ? "#2e70ff" : undefined }}
                >
                  <input {...getInputProps()} />
                  {file ? (
                    <div className="upload-success">
                      <div className="success-icon">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="32"
                          height="32"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <circle cx="12" cy="12" r="10"></circle>
                          <path d="M8 12l2 2 4-4"></path>
                        </svg>
                      </div>
                      <h4>Uploading class details...</h4>
                      <p className="subtitle">{file.name}</p>
                      <small className="hint">AI is analyzing your syllabus</small>
                    </div>
                  ) : (
                    <div className="upload-prompt">
                      <div className="icon">
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
                      <h4>
                        {isDragActive
                          ? "Drop the file here"
                          : "Drag and drop your syllabus"}
                      </h4>
                      <div className="subtitle">Or click to browse files</div>
                      <div className="hint">Supports PDF, PNG, JPEG, DOC, DOCX</div>
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
                      rows={6}
                      placeholder="Copy and paste your syllabus text here. Include class name, instructor, schedule, assignments, and due dates for best results..."
                      value={pastedText}
                      onChange={(e) => setPastedText(e.target.value)}
                      disabled={lockMethod && lockMethod !== TabKeys.Paste}
                    />
                  </Form.Group>
                  <div className="small mb-3">
                    For best results, include class details, assignments, and
                    grading information.
                  </div>
                  {pastedText.trim() && (
                    <div className="upload-status">
                      <div className="status-spinner">
                        <div className="spinner-mini"></div>
                      </div>
                      <div className="status-text">
                        <p>Extracting class details...</p>
                        <small>AI is analyzing your content</small>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* {active === TabKeys.Manual && (
                <>
                  <Form className="manual-form">
                    <div className="row g-3">
                      <div className="col-md-12">
                        <div className="form-group">
                          <Form.Group>
                            <Form.Label>Class Name *</Form.Label>
                            <Form.Control
                              name="class_name"
                              placeholder="e.g., Introduction to Business"
                              value={manualForm.class_name}
                              onChange={handleManualChange}
                              disabled={lockMethod && lockMethod !== TabKeys.Manual}
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
                              value={manualForm.class_code}
                              onChange={handleManualChange}
                              disabled={lockMethod && lockMethod !== TabKeys.Manual}
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
                              value={manualForm.semester}
                              onChange={handleManualChange}
                              disabled={lockMethod && lockMethod !== TabKeys.Manual}
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
                              value={manualForm.instructor_name}
                              onChange={handleManualChange}
                              disabled={lockMethod && lockMethod !== TabKeys.Manual}
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
                              value={manualForm.schedule}
                              onChange={handleManualChange}
                              disabled={lockMethod && lockMethod !== TabKeys.Manual}
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
                              value={manualForm.target_grade}
                              onChange={handleManualChange}
                              disabled={lockMethod && lockMethod !== TabKeys.Manual}
                            />
                          </Form.Group>
                        </div>
                      </div>
                    </div>
                  </Form>
                  <div className="d-flex justify-content-end cancel-add-btn">
                    <Button variant="light" onClick={onHide}>
                      Cancel
                    </Button>
                    <Button
                      variant="btns"
                      onClick={submitManual}
                      disabled={isPending}
                    >
                      {isPending ? "Adding..." : "Add Class"}
                    </Button>
                  </div>
                </>
              )} */}
            </div>
          )}
        </Modal.Body>

        {/* Modal Footer with Action Buttons */}
        {classCount > 1 && (
          <Modal.Footer className="border-top">
            <Button
              variant="light"
              onClick={handleModalClose}
              disabled={isSubmittingAll}
            >
              Cancel
            </Button>
            <Button
              variant="btns"
              onClick={submitAllClasses}
              disabled={!allMultiClassesValid || isSubmittingAll}
            >
              {isSubmittingAll ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Adding Classes...
                </>
              ) : (
                `Add All ${classCount} Classes`
              )}
            </Button>
          </Modal.Footer>
        )}
      </Modal>

      {/* Enrollment Success Modal */}
      <JoinClassSuccessModal
        show={showEnrollmentSuccess}
        onHide={() => {
          setShowEnrollmentSuccess(false);
          navigate("/dashboard");
        }}
        classData={enrolledClassData}
      />
    </>
  );
};

export default AddClassModal;
