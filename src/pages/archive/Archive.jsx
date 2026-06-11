import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../component/DashboardLayout";
import { Button, Spinner } from "react-bootstrap";
import {
  useListClasses,
  useGetUserArchives,
  useRemoveClassesFromArchive,
  useDeleteArchive,
  useUpdateArchive,
} from "../../hooks/index";
import ArchiveModal from "./ArchiveModal";
import { toast } from "react-toastify";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import "../../scss/Archive.scss";

const Archive = () => {
  const navigate = useNavigate();
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [expandedArchives, setExpandedArchives] = useState(new Set());
  const [editingArchive, setEditingArchive] = useState(null);

  // Initialize AOS animations
  React.useEffect(() => {
    import("aos").then((AOS) => {
      AOS.init({
        duration: 800,
        easing: "ease-out-cubic",
        once: true,
      });
      AOS.refresh();
    });
    import("aos/dist/aos.css");
  }, []);

  const { data: classesData, isLoading: isLoadingClasses } = useListClasses();
  const { data: archivesData, isLoading: isLoadingArchives } =
    useGetUserArchives();

  // Mutation for removing classes from archive (Restore functionality)
  const { mutate: removeClasses, isLoading: isRemoving } =
    useRemoveClassesFromArchive((res) => {
    });

  // Mutation for deleting an archive
  const { mutate: deleteArchive, isLoading: isDeleting } = useDeleteArchive(
    (res) => {
    },
  );

  // Mutation for updating an archive
  const { mutate: updateArchive, isLoading: isUpdating } = useUpdateArchive(
    (res) => {
      setEditingArchive(null);
    },
  );

  // Safely extract classes array from API response
  const extractClasses = (data) => {
    if (!data) return [];
    if (Array.isArray(data.data?.classes)) return data.data.classes;
    if (Array.isArray(data.classes)) return data.classes;
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data)) return data;
    return [];
  };

  // Safely extract archives array from API response
  const extractArchives = (data) => {
    if (!data) return [];
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data)) return data;
    return [];
  };

  const classes = extractClasses(classesData);
  const archives = extractArchives(archivesData);

  const hasArchivedClasses = archives.length > 0;
  const isLoading = isLoadingClasses || isLoadingArchives;

  // Helper function to safely get class property with fallback
  const safeGetProperty = (obj, property, fallback = "N/A") => {
    if (!obj) return fallback;
    const value = obj[property];
    if (value === null || value === undefined || value === "") return fallback;
    return value;
  };

  // Calculate average grade for an archive
  const calculateAverageGrade = (archiveClasses) => {
    if (!Array.isArray(archiveClasses) || archiveClasses.length === 0)
      return null;

    const gradesWithValues = archiveClasses
      .map((cls) => {
        // Use current grade instead of target grade
        const grade = safeGetProperty(cls, "current_grade", null) || safeGetProperty(cls, "grade", null);
        if (grade === null || grade === "N/A") return null;
        const numericGrade = parseFloat(grade);
        return isNaN(numericGrade) ? null : numericGrade;
      })
      .filter((grade) => grade !== null);

    if (gradesWithValues.length === 0) return null;

    const sum = gradesWithValues.reduce((acc, grade) => acc + grade, 0);
    const average = sum / gradesWithValues.length;
    return average.toFixed(1);
  };

  // Toggle archive expansion
  const toggleArchive = (archiveId) => {
    setExpandedArchives((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(archiveId)) {
        newSet.delete(archiveId);
      } else {
        newSet.add(archiveId);
      }
      return newSet;
    });
  };

  // Handler to restore a class from archive
  const handleRestoreClass = (archiveId, classId, className) => {
    confirmAlert({
      closeOnClickOutside: false,
      overlayClassName: "react-confirm-alert-overlay",
      customUI: ({ onClose }) => (
        <div className="cc-confirm card shadow-sm">
          <div className="card-body">
            <h5 className="card-title mb-2">Restore Class</h5>
            <p className="mb-4">
              Are you sure you want to restore "{className || "this class"}"
              from the archive? It will be moved back to your active classes.
            </p>
            <div className="d-flex justify-content-end gap-2">
              <button type="button" className="btn btn-light" onClick={onClose}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  removeClasses({
                    archiveId,
                    classIds: [classId],
                  });
                  onClose();
                }}
              >
                Restore
              </button>
            </div>
          </div>
        </div>
      ),
    });
  };

  // Handler to delete an archive
  const handleDeleteArchive = (archiveId, archiveName) => {
    confirmAlert({
      closeOnClickOutside: false,
      overlayClassName: "react-confirm-alert-overlay",
      customUI: ({ onClose }) => (
        <div className="cc-confirm card shadow-sm">
          <div className="card-body">
            <h5 className="card-title mb-2">Delete Archive</h5>
            <p className="mb-4">
              Are you sure you want to delete the archive "
              {archiveName || "this archive"}"? This will restore all classes in
              it back to your active classes.
            </p>
            <div className="d-flex justify-content-end gap-2">
              <button type="button" className="btn btn-light" onClick={onClose}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => {
                  deleteArchive(archiveId);
                  onClose();
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ),
    });
  };

  // Handler to edit an archive
  const handleEditArchive = (archive) => {
    let inputValue = archive.name;

    confirmAlert({
      closeOnClickOutside: false,
      overlayClassName: "react-confirm-alert-overlay",
      customUI: ({ onClose }) => (
        <div className="cc-confirm card shadow-sm">
          <div className="card-body">
            <h5 className="card-title mb-2">Edit Archive Name</h5>
            <p className="text-muted mb-3">Enter a new name for this archive</p>
            <input
              type="text"
              className="form-control mb-4"
              defaultValue={archive.name}
              onChange={(e) => (inputValue = e.target.value)}
              placeholder="Archive name"
              autoFocus
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  inputValue.trim() &&
                  inputValue !== archive.name
                ) {
                  updateArchive({
                    archiveId: archive.id,
                    updates: { name: inputValue.trim() },
                  });
                  onClose();
                }
              }}
            />
            <div className="d-flex justify-content-end gap-2">
              <button type="button" className="btn btn-light" onClick={onClose}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  if (inputValue.trim() && inputValue !== archive.name) {
                    updateArchive({
                      archiveId: archive.id,
                      updates: { name: inputValue.trim() },
                    });
                    onClose();
                  } else if (!inputValue.trim()) {
                    toast.error("Archive name cannot be empty");
                  } else {
                    onClose();
                  }
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      ),
    });
  };

  return (
    <DashboardLayout>
      <div className="archive-page">
        <div className="archive-container">
          <div className="archive-header" data-aos="fade-down">
            <Button
              variant="link"
              className="back-link"
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
                data-filename="pages/Archives"
                data-linenumber="294"
                data-visual-selector-id="pages/Archives294"
                data-source-location="pages/Archives:294:16"
                data-dynamic-content="false"
              >
                <path d="m12 19-7-7 7-7"></path>
                <path d="M19 12H5"></path>
              </svg>{" "}
              Back to Dashboard
            </Button>

            <div className="archive-title-section">
              <div className="title-wrapper">
                <h1 className=" d-flex align-items-center">
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
                    data-filename="pages/Archives"
                    data-linenumber="298"
                    data-visual-selector-id="pages/Archives298"
                    data-source-location="pages/Archives:298:16"
                    data-dynamic-content="false"
                  >
                    <rect width="20" height="5" x="2" y="3" rx="1"></rect>
                    <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"></path>
                    <path d="M10 12h4"></path>
                  </svg>{" "}
                  Class Archives
                </h1>
              </div>
              <p className="archive-subtitle d-none d-md-block">
                Your completed academic history, organized by you
              </p>
            </div>

            <div className="archive-actions d-flex justify-content-end">
              <Button
                variant="primary"
                className="archive-btn"
                onClick={() => setShowArchiveModal(true)}
              >
                Archive Current Classes
              </Button>
            </div>
          </div>

          <div className="archive-content" data-aos="fade-up">
            {isLoading ? (
              <div className="archive-loading">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">Loading archives...</p>
              </div>
            ) : !hasArchivedClasses ? (
              <div className="archive-empty-state">
                <div className="empty-icon">
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
                    data-filename="pages/Archives"
                    data-linenumber="317"
                    data-visual-selector-id="pages/Archives317"
                    data-source-location="pages/Archives:317:12"
                    data-dynamic-content="false"
                  >
                    <path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </div>
                <h2>No Archives Yet</h2>
                <p className="empty-description d-none d-md-block">
                  Archive your completed classes to keep your dashboard
                  organized while preserving your academic history.
                </p>
                <p className="empty-description d-md-none">
                  Archive completed classes to organize your dashboard.
                </p>
                <Button
                  variant="dark"
                  className="go-to-dashboard-btn"
                  onClick={() => navigate("/dashboard")}
                >
                  Go to Dashboard
                </Button>
              </div>
            ) : (
              <div className="archive-list-new">
                {archives.map((archive) => {
                  const isExpanded = expandedArchives.has(archive.id);
                  const archiveClasses = archive.classes || [];
                  const classCount = archiveClasses.length;
                  const averageGrade = calculateAverageGrade(archiveClasses);

                  return (
                    <div key={archive.id} className="archive-group">
                      <div className="archive-group-header">
                        <div className="archive-group-info">
                          <div className="archive-icon">
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
                              <rect
                                width="20"
                                height="5"
                                x="2"
                                y="3"
                                rx="1"
                              ></rect>
                              <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"></path>
                              <path d="M10 12h4"></path>
                            </svg>
                          </div>
                          <div className="archive-details">
                            <h3 className="archive-name">
                              {safeGetProperty(
                                archive,
                                "name",
                                "Untitled Archive",
                              )}
                            </h3>
                            {archive.description && (
                              <p className="archive-desc">
                                {archive.description}
                              </p>
                            )}
                            <div className="archive-meta">
                              <span className="meta-item">
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
                                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                                </svg>
                                {classCount}{" "}
                                {classCount === 1 ? "class" : "classes"}
                              </span>
                              {averageGrade && (
                                <span className="meta-item">
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
                                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                                  </svg>
                                  {averageGrade}% avg
                                </span>
                              )}
                              <span className="meta-item">
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
                                  <rect
                                    width="18"
                                    height="18"
                                    x="3"
                                    y="4"
                                    rx="2"
                                    ry="2"
                                  ></rect>
                                  <line x1="16" y1="2" x2="16" y2="6"></line>
                                  <line x1="8" y1="2" x2="8" y2="6"></line>
                                  <line x1="3" y1="10" x2="21" y2="10"></line>
                                </svg>
                                Created{" "}
                                {new Date(
                                  archive.created_at,
                                ).toLocaleDateString("en-US", {
                                  month: "short",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="archive-actions">
                          <button
                            className="action-btn edit-btn"
                            onClick={() => handleEditArchive(archive)}
                            title="Edit archive"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                            </svg>
                          </button>
                          <button
                            className="action-btn delete-btn"
                            onClick={() =>
                              handleDeleteArchive(archive.id, archive.name)
                            }
                            title="Delete archive"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                          </button>
                          <button
                            className={`action-btn expand-btn ${
                              isExpanded ? "expanded" : ""
                            }`}
                            onClick={() => toggleArchive(archive.id)}
                            title={isExpanded ? "Collapse" : "Expand"}
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
                              <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                          </button>
                        </div>
                      </div>

                      {isExpanded && archiveClasses.length > 0 && (
                        <div className="archive-group-content">
                          <div className="archived-classes-grid">
                            {archiveClasses.map((cls) => {
                              const className = safeGetProperty(
                                cls,
                                "class_name",
                                "Untitled Class",
                              );
                              const classCode = safeGetProperty(
                                cls,
                                "class_code",
                              );
                              const instructor = safeGetProperty(
                                cls,
                                "instructor_name",
                              );
                              const grade = safeGetProperty(
                                cls,
                                "target_grade",
                              );
                              const archivedDate =
                                cls.ArchiveClass?.created_at ||
                                archive.created_at;

                              return (
                                <div
                                  key={cls.id}
                                  className="archived-class-card"
                                >
                                  <div className="class-card-header">
                                    <div className="class-title-section">
                                      <h4 className="class-title">
                                        {className}
                                      </h4>
                                      {grade !== "N/A" && (
                                        <span className="class-grade-badge">
                                          {grade}%
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="class-card-body">
                                    <p className="class-code">{classCode}</p>
                                    <p className="class-instructor">
                                      {instructor}
                                    </p>
                                  </div>
                                  <div className="class-card-footer">
                                    <span className="archived-date">
                                      Archived{" "}
                                      {new Date(
                                        archivedDate,
                                      ).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                      })}
                                    </span>
                                    <button
                                      className="restore-btn"
                                      onClick={() =>
                                        handleRestoreClass(
                                          archive.id,
                                          cls.id,
                                          className,
                                        )
                                      }
                                      disabled={isRemoving}
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
                                        <polyline points="23 4 23 10 17 10"></polyline>
                                        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                                      </svg>
                                      Restore
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <ArchiveModal
          show={showArchiveModal}
          onHide={() => setShowArchiveModal(false)}
          classes={Array.isArray(classes) ? classes : []}
        />
      </div>
    </DashboardLayout>
  );
};

export default Archive;
